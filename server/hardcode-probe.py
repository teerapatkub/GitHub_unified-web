# server/hardcode-probe.py
#
# Plans the "did they just print the answer?" check in problemGrader.js.
#
# Most lesson problems take no input, so every test case expects the same
# output and `print("<the answer>")` used to pass them all. The check asks a
# different question: when the problem's data changes, does the answer change
# with it? The data is the literals in the reference solution (a string to split,
# the numbers to add). This script only PLANS: for each literal it writes a copy
# of the solution, and of the learner's code when it uses the same literal, with
# that literal changed. problemGrader.js runs the copies through the normal
# sandboxed runner and compares the outputs. Nothing the learner wrote runs here;
# it is only parsed.
#
# Reads __PAYLOAD (base64 JSON: solution, code, marker) defined above this file,
# prints one marker line of JSON.
import ast
import base64
import json

payload = json.loads(base64.b64decode(__PAYLOAD).decode("utf-8"))  # noqa: F821
MAX_LITERALS = 6


def literal_key(value):
    # 1, 1.0 and True compare equal in Python; they are different data here.
    return (type(value).__name__, value)


def is_data(node):
    value = node.value
    if isinstance(value, bool) or value is None:
        return False
    if isinstance(value, str):
        return value != ""
    return isinstance(value, (int, float))


def docstring_ids(tree):
    ids = set()
    for node in ast.walk(tree):
        if isinstance(node, (ast.Module, ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            body = getattr(node, "body", [])
            if body and isinstance(body[0], ast.Expr) and isinstance(body[0].value, ast.Constant) \
                    and isinstance(body[0].value.value, str):
                ids.add(id(body[0].value))
    return ids


def data_literals(tree):
    skip = docstring_ids(tree)
    found = []
    seen = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Constant) and id(node) not in skip and is_data(node):
            key = literal_key(node.value)
            if key not in seen:
                seen.add(key)
                found.append(node.value)
    return found


def mutate(value):
    if isinstance(value, str):
        return value + "Q"
    if isinstance(value, int):
        return value + 3
    return value + 1.5


class Replace(ast.NodeTransformer):
    def __init__(self, key, new_value, first_only=False):
        self.key = key
        self.new_value = new_value
        self.first_only = first_only
        self.hits = 0

    def visit_Constant(self, node):
        if is_data(node) and literal_key(node.value) == self.key and not (self.first_only and self.hits):
            self.hits += 1
            return ast.copy_location(ast.Constant(self.new_value), node)
        return node


def with_literal_changed(source_tree, value, new_value, first_only=False):
    tree = ast.parse(ast.unparse(source_tree))
    swap = Replace(literal_key(value), new_value, first_only)
    tree = swap.visit(tree)
    if not swap.hits:
        return None
    ast.fix_missing_locations(tree)
    return ast.unparse(tree)


def count_of(tree, value):
    key = literal_key(value)
    return sum(1 for node in ast.walk(tree) if isinstance(node, ast.Constant) and is_data(node)
               and literal_key(node.value) == key)


def changes_for(value, literals):
    # (new value, first occurrence only?) - three kinds, because one is often
    # not enough: "red" + "Q" everywhere leaves colors.count("red") at 3, but
    # changing only the first "red" makes it 2; "orange" + "Q" is still not in
    # the dict, but "orange" -> "apple" is.
    yield mutate(value), False
    yield mutate(value), True
    for other in literals:
        if other is not value and type(other) is type(value) and other != value:
            yield other, False
            break
    if isinstance(value, int):
        yield value * 2 + 10, False


def rendered_literals(tree):
    # What the learner's code could print without computing anything: every
    # string and number, and every container written out in full.
    out = set()
    for node in ast.walk(tree):
        try:
            value = ast.literal_eval(node)
        except Exception:
            continue
        if isinstance(value, bool) or value is None:
            continue
        if isinstance(value, (str, int, float, list, tuple, dict, set)):
            out.add(" ".join(str(value).split()))
    return sorted(out)


result = {"ok": True, "variants": [], "literals": []}
try:
    solution_tree = ast.parse(payload["solution"])
except SyntaxError:
    result = {"ok": False, "error": "solution does not parse"}
else:
    try:
        code_tree = ast.parse(payload["code"])
    except SyntaxError:
        code_tree = None
    if code_tree is not None:
        result["literals"] = rendered_literals(code_tree)
        code_keys = {literal_key(v) for v in data_literals(code_tree)}
        literals = data_literals(solution_tree)
        # Literals the learner also used go first: those are the ones that can
        # show the answer depends on the data.
        literals.sort(key=lambda v: literal_key(v) not in code_keys)
        for value in literals[:MAX_LITERALS]:
            shared = literal_key(value) in code_keys
            for new_value, first_only in changes_for(value, literals):
                if first_only and count_of(solution_tree, value) < 2:
                    continue
                solution_variant = with_literal_changed(solution_tree, value, new_value, first_only)
                if solution_variant is None:
                    continue
                code_variant = with_literal_changed(code_tree, value, new_value, first_only) if shared else None
                result["variants"].append({
                    "solution": solution_variant,
                    "code": code_variant,
                    # How the literal reads in printed output, before and after.
                    "from": str(value),
                    "to": str(new_value),
                })

print(payload["marker"] + json.dumps(result, ensure_ascii=False))
