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
import re
import sys
import tokenize

DATA = json.loads(base64.b64decode(__PAYLOAD).decode("utf-8"))  # noqa: F821
CODE = DATA["code"]
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


steps = 0


def tracer(frame, event, arg):
    if frame.f_code.co_filename != FILENAME:
        return None

    def local(frame, event, arg):
        global steps
        if event == "line":
            steps += 1
            if steps > STEP_CAP:
                raise StepCap()
        return local

    return local


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
            finally:
                sys.settrace(None)
            target = namespace.get(DATA.get("function") or "")
            for case in DATA["cases"]:
                sys.settrace(tracer)
                try:
                    target(*case.get("args", []))
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
LOOPS = (ast.For, ast.While, ast.AsyncFor, ast.comprehension)


def loop_depth(node, depth=0):
    deepest = depth
    for child in ast.iter_child_nodes(node):
        inner = depth + 1 if isinstance(child, LOOPS) else depth
        deepest = max(deepest, loop_depth(child, inner))
    return deepest


def repeated_work(tree):
    """Calls that redo a whole pass over the data, made inside a loop."""
    found = []

    def visit(node, in_loop):
        if isinstance(node, ast.Call) and in_loop:
            func = node.func
            name = func.attr if isinstance(func, ast.Attribute) else func.id if isinstance(func, ast.Name) else None
            if name in REPEATED_CALLS:
                found.append({"name": name, "line": node.lineno})
        for child in ast.iter_child_nodes(node):
            loop_body = in_loop or isinstance(node, LOOPS) or isinstance(node, (ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp))
            visit(child, loop_body)

    visit(tree, False)
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
    result = {"ok": False, "error": "", "steps": 0, "capped": False, "raised": 0,
              "loop_depth": 0, "repeated": [], "answer_lines": 0, "style": []}
    try:
        tree = ast.parse(CODE)
        compiled = compile(CODE, FILENAME, "exec")
    except SyntaxError as error:
        result["error"] = f"SyntaxError: line {error.lineno}"
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
    result["steps"] = steps
    result["ok"] = True
    return result


print(DATA["marker"] + json.dumps(main()))
