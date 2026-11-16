# server/bug-mutator.py
#
# Writes buggy copies of a reference solution for Debug Lab (fix list item 3).
#
# Debug Lab used to hand out an ordinary lesson problem with an empty starter,
# so there was nothing to debug. Asking the model to plant a bug did not work:
# in the 2026-10-27 benchmark 14 of 15 "bugs" changed nothing. Bugs made here
# are the classic beginner slips, applied to a solution that is known to be
# correct - a comparison one step off, a loop bound off by one, the wrong
# operator. debugLab.js keeps only the copies that run cleanly and print a wrong
# answer, so every bug handed out is real and visible.
#
# Only parses and rewrites; runs nothing. Reads __PAYLOAD (base64 JSON:
# solution, marker) defined above this file, prints one marker line of JSON:
# {"ok": true, "mutants": [{"code": ..., "kind": ...}, ...]}
import ast
import base64
import copy
import json

payload = json.loads(base64.b64decode(__PAYLOAD).decode("utf-8"))  # noqa: F821

COMPARE_SWAPS = {
    ast.Lt: ast.LtE, ast.LtE: ast.Lt,
    ast.Gt: ast.GtE, ast.GtE: ast.Gt,
    ast.Eq: ast.NotEq, ast.NotEq: ast.Eq,
}
BINOP_SWAPS = {
    ast.Add: ast.Sub, ast.Sub: ast.Add,
    ast.Mult: ast.Add, ast.FloorDiv: ast.Div,
    ast.Div: ast.FloorDiv, ast.Mod: ast.FloorDiv,
}
BOOL_SWAPS = {ast.And: ast.Or, ast.Or: ast.And}
METHOD_SWAPS = {"upper": "lower", "lower": "upper", "max": "min", "min": "max", "startswith": "endswith", "endswith": "startswith"}


def sites(tree):
    """Every place one bug can go, as (kind, path to the node, change)."""
    found = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Compare):
            for i, op in enumerate(node.ops):
                if type(op) in COMPARE_SWAPS:
                    found.append(("comparison", node, ("ops", i)))
        elif isinstance(node, ast.BinOp) and type(node.op) in BINOP_SWAPS:
            # "a" + "b" becomes a crash, not a bug a beginner can read.
            if not any(isinstance(side, ast.Constant) and isinstance(side.value, str)
                       for side in (node.left, node.right)):
                found.append(("operator", node, ("op",)))
                if isinstance(node.op, (ast.Sub, ast.Div, ast.FloorDiv, ast.Mod)):
                    found.append(("operand order", node, ("swap",)))
        elif isinstance(node, ast.BoolOp) and type(node.op) in BOOL_SWAPS:
            found.append(("logic", node, ("op",)))
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "range":
            for i, arg in enumerate(node.args[:2]):
                found.append(("loop bound", node, ("range", i)))
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in ("max", "min"):
            found.append(("function", node, ("name",)))
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) \
                and node.func.attr in ("upper", "lower", "startswith", "endswith"):
            found.append(("method", node, ("attr",)))
        elif isinstance(node, ast.Subscript) and isinstance(node.slice, ast.Constant) \
                and isinstance(node.slice.value, int) and not isinstance(node.slice.value, bool):
            found.append(("index", node, ("index",)))
    return found


def apply(node, change):
    what = change[0]
    if what == "ops":
        node.ops[change[1]] = COMPARE_SWAPS[type(node.ops[change[1]])]()
    elif what == "op":
        swaps = BINOP_SWAPS if isinstance(node, ast.BinOp) else BOOL_SWAPS
        node.op = swaps[type(node.op)]()
    elif what == "range":
        arg = node.args[change[1]]
        # range(n) -> range(n - 1) style: the classic off-by-one.
        delta = 1 if change[1] == 0 and len(node.args) > 1 else -1
        node.args[change[1]] = ast.BinOp(left=arg, op=ast.Add() if delta > 0 else ast.Sub(),
                                         right=ast.Constant(1))
        if isinstance(arg, ast.Constant) and isinstance(arg.value, int):
            node.args[change[1]] = ast.Constant(arg.value + delta)
    elif what == "swap":
        node.left, node.right = node.right, node.left
    elif what == "unwrap":
        inner = node.args[0]
        node.func = inner.func
        node.args = inner.args
        node.keywords = inner.keywords
    elif what == "name":
        node.func.id = METHOD_SWAPS[node.func.id]
    elif what == "attr":
        node.func.attr = METHOD_SWAPS[node.func.attr]
    elif what == "index":
        value = node.slice.value
        node.slice = ast.Constant(value + 1 if value >= 0 else value - 1)


try:
    tree = ast.parse(payload["solution"])
except SyntaxError:
    result = {"ok": False, "error": "solution does not parse"}
else:
    original = ast.unparse(tree)
    mutants = []
    seen = {original}
    for index, (kind, _node, change) in enumerate(sites(tree)):
        copy_tree = copy.deepcopy(tree)
        # The same node in the copy: ast.walk visits both trees in one order.
        site = sites(copy_tree)[index][1]
        apply(site, change)
        ast.fix_missing_locations(copy_tree)
        code = ast.unparse(copy_tree)
        if code not in seen:
            seen.add(code)
            mutants.append({"code": code, "kind": kind})
    # Forgetting int() around input() - on every input at once, as a beginner
    # does: "3" + "4" is "34". Removing just one would only crash ("3" + 4).
    unwrapped = copy.deepcopy(tree)
    count = 0
    for node in ast.walk(unwrapped):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in ("int", "float")                 and len(node.args) == 1 and isinstance(node.args[0], ast.Call)                 and isinstance(node.args[0].func, ast.Name) and node.args[0].func.id == "input":
            apply(node, ("unwrap",))
            count += 1
    if count:
        code = ast.unparse(unwrapped)
        if code not in seen:
            mutants.append({"code": code, "kind": "conversion"})
    result = {"ok": True, "original": original, "mutants": mutants}

print(payload["marker"] + json.dumps(result, ensure_ascii=False))
