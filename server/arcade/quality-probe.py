# Measures one Arcade answer for code-metrics.js (ADR 0007). The same code
# always gives the same numbers: nothing here depends on how fast or busy the
# machine is.
#
# Input: __PAYLOAD (prepended by code-metrics.js), base64 JSON with
#   code, starter, kind ("function"|"stdio"), function, cases, marker
# Output: one line, marker + JSON:
#   ok, error, steps, capped, raised, loop_depth, repeated, answer_lines, style
#
# steps counts the lines of the player's code that actually ran across all of
# the round's test cases (sys.settrace). It stands in for "how long it took"
# without the noise of wall-clock time.
import ast
import base64
import io
import json
import os
import re
import sys
import tokenize

DATA = json.loads(base64.b64decode(__PAYLOAD).decode("utf-8"))  # noqa: F821
del __PAYLOAD  # noqa: F821
CODE = DATA["code"]
# The player's code runs in this process, so nothing it could reach may decide
# its score. The result marker and the step count live only in closures, the
# result goes straight to file descriptor 1, and code that reaches for the
# probe's machinery is refused before it runs (see tampering()).
_write_result = (lambda marker, write: (lambda text: write(1, (marker + text + "\n").encode("utf-8"))))(DATA.pop("marker"), os.write)
FILENAME = "<player>"
STEP_CAP = 2_000_000
REPEATED_CALLS = {"sorted", "sort", "count", "index", "remove", "insert"}
STYLE_LIMIT_PER_RULE = 3

starter_lines = {line.strip() for line in DATA.get("starter", "").splitlines() if line.strip()}
code_lines = CODE.splitlines()


def written_by_player(lineno):
    text = code_lines[lineno - 1].strip() if 0 < lineno <= len(code_lines) else ""
    return bool(text) and text not in starter_lines


# ---------------------------------------------------------------- running ---
class StepCap(Exception):
    pass


def make_tracer():
    count = [0]

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != FILENAME:
            return None

        def local(frame, event, arg):
            if event == "line":
                count[0] += 1
                if count[0] > STEP_CAP:
                    raise StepCap()
            return local

        return local

    return tracer, (lambda: count[0])


tracer, steps_taken = make_tracer()
tracer_switched_off = [False]


def still_traced():
    # A run that turned the tracer off would look almost free.
    if sys.gettrace() is not tracer:
        tracer_switched_off[0] = True


def run_cases(compiled):
    raised = 0
    real_stdin, real_stdout = sys.stdin, sys.stdout
    try:
        if DATA["kind"] == "function":
            namespace = {"__name__": "__main__"}
            sys.stdout = io.StringIO()
            sys.settrace(tracer)
            try:
                exec(compiled, namespace)
                still_traced()
            finally:
                sys.settrace(None)
            target = namespace.get(DATA.get("function") or "")
            for case in DATA["cases"]:
                sys.settrace(tracer)
                try:
                    target(*case.get("args", []))
                    still_traced()
                except StepCap:
                    raise
                except BaseException:
                    raised += 1
                finally:
                    sys.settrace(None)
        else:
            for case in DATA["cases"]:
                sys.stdin = io.StringIO(str(case.get("input", "")))
                sys.stdout = io.StringIO()
                sys.settrace(tracer)
                try:
                    exec(compiled, {"__name__": "__main__"})
                    still_traced()
                except StepCap:
                    raise
                except SystemExit:
                    pass
                except BaseException:
                    raised += 1
                finally:
                    sys.settrace(None)
    finally:
        sys.stdin, sys.stdout = real_stdin, real_stdout
    return raised


# ---------------------------------------------------------------- reading ---
COMPREHENSIONS = (ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)
STATEMENT_LOOPS = (ast.For, ast.AsyncFor, ast.While)


def loop_depth(node, depth=0):
    """How deeply loops nest. A comprehension with two `for` clauses is two
    levels, like the two nested for statements it stands for."""
    deepest = depth
    for child in ast.iter_child_nodes(node):
        if isinstance(child, STATEMENT_LOOPS):
            inner = depth + 1
        elif isinstance(child, COMPREHENSIONS):
            inner = depth + len(child.generators)
        else:
            inner = depth
        deepest = max(deepest, loop_depth(child, inner))
    return deepest


def repeated_work(tree):
    """Calls that redo a whole pass over the data, made inside a loop.

    What a for statement iterates over is evaluated once, before the loop, so
    `for x in sorted(items):` sorts once and is not repeated work; the same
    holds for a comprehension's first `in`. A while loop's condition, the
    body, and later comprehension clauses run on every pass."""
    found = []

    def call_name(node):
        func = node.func
        return func.attr if isinstance(func, ast.Attribute) else func.id if isinstance(func, ast.Name) else None

    def visit(node, in_loop):
        if isinstance(node, ast.Call) and in_loop and call_name(node) in REPEATED_CALLS:
            found.append({"name": call_name(node), "line": node.lineno})
        if isinstance(node, (ast.For, ast.AsyncFor)):
            visit(node.iter, in_loop)
            for child in [node.target, *node.body, *node.orelse]:
                visit(child, True)
            return
        if isinstance(node, ast.While):
            for child in [node.test, *node.body, *node.orelse]:
                visit(child, True)
            return
        if isinstance(node, COMPREHENSIONS):
            first, *rest = node.generators
            visit(first.iter, in_loop)
            for child in [first.target, *first.ifs, *rest]:
                visit(child, True)
            for child in ([node.key, node.value] if isinstance(node, ast.DictComp) else [node.elt]):
                visit(child, True)
            return
        for child in ast.iter_child_nodes(node):
            visit(child, in_loop)

    visit(tree, False)
    return found


# Names that only matter to code reaching into the probe that measures it:
# switching the tracer off, walking frames or closures to the counter, or
# replacing what the probe itself uses. A beginner's answer never needs them.
TAMPER_NAMES = {
    "settrace", "setprofile", "gettrace", "_getframe", "__main__", "__builtins__", "builtins",
    "gc", "inspect", "ctypes", "_exit", "f_globals", "f_locals", "f_back", "f_trace", "tb_frame",
    "__globals__", "__closure__", "cell_contents", "__code__", "modules",
}


def tampering(tree):
    found = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Name):
            names = [node.id]
        elif isinstance(node, ast.Attribute):
            names = [node.attr]
        elif isinstance(node, (ast.Import, ast.ImportFrom)):
            names = [alias.name.split(".")[0] for alias in node.names]
            if getattr(node, "module", None):
                names.append(node.module.split(".")[0])
        elif isinstance(node, ast.Constant) and isinstance(node.value, str):
            names = [node.value]
        else:
            names = []
        for name in names:
            if name in TAMPER_NAMES:
                found.append({"name": name, "line": getattr(node, "lineno", 0)})
    return found


SNAKE = re.compile(r"^_{0,2}[a-z][a-z0-9_]*$|^_$")
CONSTANT = re.compile(r"^[A-Z][A-Z0-9_]*$")


def style_findings(tree):
    findings = []

    def add(rule, line, detail=""):
        if written_by_player(line):
            findings.append({"rule": rule, "line": line, "detail": detail})

    for number, line in enumerate(code_lines, start=1):
        if len(line) > 79:
            add("line-too-long", number, str(len(line)))
        if line != line.rstrip():
            add("trailing-whitespace", number)

    depth = 0
    previous = None
    try:
        tokens = list(tokenize.generate_tokens(io.StringIO(CODE).readline))
    except (tokenize.TokenError, IndentationError, SyntaxError):
        tokens = []
    for i, token in enumerate(tokens):
        if token.type == tokenize.INDENT and ("\t" in token.string or len(token.string) % 4):
            add("indentation", token.start[0])
        if token.type == tokenize.OP:
            if token.string in "([{":
                depth += 1
            elif token.string in ")]}":
                depth = max(0, depth - 1)
            elif token.string == ";":
                add("semicolon", token.start[0])
            spaced = token.string in ("==", "!=", "<=", ">=", "+=", "-=", "*=", "/=", "//=", "%=") or (token.string == "=" and depth == 0)
            following = tokens[i + 1] if i + 1 < len(tokens) else None
            if spaced and previous is not None and following is not None:
                tight_before = previous.end == token.start
                tight_after = following.start == token.end and following.type not in (tokenize.NEWLINE, tokenize.NL)
                if tight_before or tight_after:
                    add("operator-spacing", token.start[0], token.string)
        if token.type not in (tokenize.NL, tokenize.COMMENT):
            previous = token

    loaded = {node.id for node in ast.walk(tree) if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load)}
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and not SNAKE.match(node.name):
            add("naming", node.lineno, node.name)
        if isinstance(node, ast.arg) and not SNAKE.match(node.arg):
            add("naming", node.lineno, node.arg)
        if isinstance(node, (ast.Assign, ast.AnnAssign, ast.AugAssign)):
            targets = node.targets if isinstance(node, ast.Assign) else [node.target]
            for target in targets:
                for name in ast.walk(target):
                    if isinstance(name, ast.Name) and isinstance(name.ctx, ast.Store):
                        if not SNAKE.match(name.id) and not CONSTANT.match(name.id):
                            add("naming", name.lineno, name.id)
                        elif name.id not in loaded and name.id != "_":
                            add("unused-variable", name.lineno, name.id)
        if isinstance(node, ast.Compare):
            for op, right in zip(node.ops, node.comparators):
                if isinstance(op, (ast.Eq, ast.NotEq)) and isinstance(right, ast.Constant) and right.value in (None, True, False) and type(right.value) is not int:
                    add("compare-singleton", node.lineno, repr(right.value))
        if isinstance(node, ast.ExceptHandler) and node.type is None:
            add("bare-except", node.lineno)

    # One habit repeated on every line should not wipe out the whole score.
    kept, per_rule = [], {}
    for finding in sorted(findings, key=lambda f: (f["line"], f["rule"])):
        key = (finding["rule"], finding["line"], finding["detail"])
        if key in {(k["rule"], k["line"], k["detail"]) for k in kept}:
            continue
        per_rule[finding["rule"]] = per_rule.get(finding["rule"], 0) + 1
        if per_rule[finding["rule"]] <= STYLE_LIMIT_PER_RULE:
            kept.append(finding)
    return kept


def main():
    result = {"ok": False, "error": "", "steps": 0, "capped": False, "raised": 0, "tampered": [],
              "loop_depth": 0, "repeated": [], "answer_lines": 0, "style": []}
    try:
        tree = ast.parse(CODE)
        compiled = compile(CODE, FILENAME, "exec")
    except SyntaxError as error:
        result["error"] = f"SyntaxError: line {error.lineno}"
        return result
    result["tampered"] = tampering(tree)
    if result["tampered"]:
        # Refused, not run: running it is how it would cheat.
        result["ok"] = True
        return result
    result["loop_depth"] = loop_depth(tree)
    result["repeated"] = repeated_work(tree)
    result["answer_lines"] = sum(1 for n in range(1, len(code_lines) + 1)
                                 if written_by_player(n) and not code_lines[n - 1].strip().startswith("#"))
    result["style"] = style_findings(tree)
    try:
        result["raised"] = run_cases(compiled)
    except StepCap:
        result["capped"] = True
    except BaseException as error:  # the module itself failed to run
        result["error"] = type(error).__name__
        result["raised"] = len(DATA["cases"])
    result["steps"] = steps_taken()
    if tracer_switched_off[0]:
        result["tampered"].append({"name": "settrace", "line": 0})
    result["ok"] = True
    return result


_write_result(json.dumps(main()))
