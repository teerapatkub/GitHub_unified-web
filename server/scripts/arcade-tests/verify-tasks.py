"""Checks the Arcade problem bank by running it in real Python.

Run this after ANY edit to server/arcadeTaskSeed.js. It has already caught two
bugs that reached players:

  * "Longest Word" stored the expected answer "jumps" while its own reference
    solution max(words, key=len) returns "quick" - so every correct player was
    marked wrong.
  * Six hints quoted the answer line verbatim, which turned a 600-cash hint into
    a free solution.

What it verifies, per task:

  1. initial_code (the finished answer) satisfies every one of its test cases.
     A task whose own answer fails its own tests marks a CORRECT player wrong.

  2. starter_code (what the player actually sees in the editor):
       a. is valid Python, so submitting it untouched scores 0 rather than
          breaking the grading harness,
       b. declares the same `def name(args):` signature as the solution, or the
          harness cannot find the function to call,
       c. does NOT pass all of its own tests - a scaffold containing the answer
          would let everyone win by pressing submit.

  3. hint_th / hint_en exist and do not contain an answer line verbatim.

Usage:
    python verify-tasks.py            # reads ../../arcadeTaskSeed.js
    python verify-tasks.py tasks.json # or an explicit JSON dump

Requires Python and Node on PATH. Does NOT require the server or the database.
"""
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SEED = os.path.normpath(os.path.join(HERE, '..', '..', 'arcadeTaskSeed.js'))


def load_tasks():
    """Reads the seed through Node so this file is never a second copy of the
    bank - the seed stays the single source of truth."""
    if len(sys.argv) > 1:
        with open(sys.argv[1], encoding='utf-8') as f:
            return json.load(f)
    out = subprocess.run(
        ['node', '-e',
         f'process.stdout.write(JSON.stringify(require({json.dumps(SEED)}).ARCADE_TASKS))'],
        capture_output=True, text=True, encoding='utf-8',
    )
    if out.returncode != 0:
        print('could not read the seed through node:\n' + out.stderr, file=sys.stderr)
        sys.exit(2)
    return json.loads(out.stdout)


tasks = load_tasks()
SIG = re.compile(r'^def\s+(\w+)\s*\(([^)]*)\)\s*:', re.M)

failures = []
checked = 0


def code_lines(src):
    return {
        line.strip() for line in src.splitlines()
        if line.strip() and not line.strip().startswith('#')
    }


def run_cases(code, fn_name, cases, label, title):
    """Returns (passed, total), or None if the code could not even run."""
    global checked
    namespace = {}
    try:
        exec(code, namespace)
    except Exception as e:
        failures.append((title, f'{label} failed to execute: {type(e).__name__}: {e}', None, None))
        return None
    fn = namespace.get(fn_name)
    if fn is None:
        failures.append((title, f'{label} defines no function named {fn_name}', None, None))
        return None
    passed = 0
    for case in cases:
        checked += 1
        try:
            actual = fn(*case['input'])
        except Exception as e:
            if label == 'reference solution':
                failures.append((title, f'raised {type(e).__name__}: {e}', case['input'], case['output']))
            continue
        if actual == case['output']:
            passed += 1
        elif label == 'reference solution':
            failures.append((title, 'wrong output', case['input'],
                             f"expected {case['output']!r}, got {actual!r}"))
    return passed, len(cases)


for t in tasks:
    title = t['title_en']
    solution = t['initial_code']
    m = SIG.search(solution)
    if not m:
        failures.append((title, 'no function definition found in initial_code', None, None))
        continue
    fn_name, fn_args = m.group(1), m.group(2)

    run_cases(solution, fn_name, t['test_cases'], 'reference solution', title)

    starter = t.get('starter_code')
    if not starter:
        failures.append((title, 'no starter_code - the player would get a bare `pass` body', None, None))
        continue

    try:
        compile(starter, f'<starter:{title}>', 'exec')
    except SyntaxError as e:
        failures.append((title, f'starter_code is not valid Python: {e}', None, None))
        continue

    sm = SIG.search(starter)
    if not sm or sm.group(1) != fn_name or sm.group(2).strip() != fn_args.strip():
        got = f'{sm.group(1)}({sm.group(2)})' if sm else 'none'
        failures.append((title, f'starter_code signature {got} does not match solution {fn_name}({fn_args})',
                         None, None))
        continue

    result = run_cases(starter, fn_name, t['test_cases'], 'starter_code', title)
    if result and result[0] == result[1] and result[1] > 0:
        failures.append((title, 'starter_code PASSES ALL ITS OWN TESTS - it gives the answer away',
                         None, f'{result[0]}/{result[1]}'))

    answer_lines = code_lines(solution) - code_lines(starter)
    for lang in ('hint_th', 'hint_en'):
        checked += 1
        hint = (t.get(lang) or '').strip()
        if not hint:
            failures.append((title, f'{lang} is missing - the hint item would fall back to one generic sentence',
                             None, None))
            continue
        leaked = [a for a in answer_lines if len(a) > 8 and a in hint]
        if leaked:
            failures.append((title, f'{lang} contains an answer line verbatim', None, repr(leaked[0])))

print(f'tasks: {len(tasks)}   assertions run: {checked}')
if failures:
    print(f'\nFAILURES ({len(failures)}):')
    for title, why, inp, extra in failures:
        print(f'  [{title}] {why}')
        if inp is not None:
            print(f'      input={inp!r}  {extra}')
        elif extra:
            print(f'      {extra}')
    sys.exit(1)
print('\nALL PASS - solutions satisfy their tests, no starter_code leaks the answer, '
      'every task has hints in both languages, and no hint hands over an answer line')
