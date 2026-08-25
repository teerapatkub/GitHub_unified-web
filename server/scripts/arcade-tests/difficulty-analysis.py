"""Reports how much of the problem bank a beginner can physically TYPE in time.

This measures typing burden, not conceptual difficulty. Whether the IDEA is
reachable in the seconds left over needs a real person; this only answers "could
they have entered the answer at all", which is the part a script can settle.

Why it exists: on 2026-08-19 the bank and the round timers were measured against
each other for the first time and 70% of the tasks turned out to be untypeable
inside Quick Mode's usable seconds. The fix was starter_code scaffolds plus a
draw that filters on work_chars. Re-run this after changing any scaffold, any
solution, or any round duration - those are exactly the edits that can quietly
put the bank out of reach again.

Reads work_chars straight from the seed (computed there, not re-derived here, so
this agrees with what drawArcadeRoundTasks actually filters on).

Usage: python difficulty-analysis.py [tasks.json]
Requires Python and Node. Does NOT require the server or the database.
"""
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SEED = os.path.normpath(os.path.join(HERE, '..', '..', 'arcadeTaskSeed.js'))
CONFIG = os.path.normpath(os.path.join(HERE, '..', '..', '..', 'shared', 'arcadeConfig.json'))

# Typing speeds for CODE, which is far slower than prose because of symbols,
# indentation and editor navigation.
BEGINNER_CPM = 90
INTERMEDIATE_CPM = 180


def node_json(expr):
    out = subprocess.run(['node', '-e', f'process.stdout.write(JSON.stringify({expr}))'],
                         capture_output=True, text=True, encoding='utf-8')
    if out.returncode != 0:
        print(out.stderr, file=sys.stderr)
        sys.exit(2)
    return json.loads(out.stdout)


if len(sys.argv) > 1:
    with open(sys.argv[1], encoding='utf-8') as f:
        tasks = json.load(f)
else:
    tasks = node_json(f'require({json.dumps(SEED)}).ARCADE_TASKS')

with open(CONFIG, encoding='utf-8') as f:
    cfg = json.load(f)

lead = cfg['autoSubmitLeadSeconds']
modes = {
    'Quick Mode': cfg['quickModePhaseDurations']['ROUND_1'],
    'Standard': cfg['phaseDurations']['ROUND_1'],
}

rows = [{
    'difficulty': t['difficulty'],
    'title': t['title_en'],
    # what the player must still type once starter_code is on screen
    'work': t.get('work_chars', 0),
} for t in tasks]

order = {'easy': 0, 'medium': 1, 'hard': 2}
rows.sort(key=lambda r: (order[r['difficulty']], -r['work']))

print(f"{'diff':7} {'task':46} {'work':>5}  {'beginner':>9}")
print('-' * 72)
for r in rows:
    print(f"{r['difficulty']:7} {r['title'][:46]:46} {r['work']:5}  {round(r['work'] / BEGINNER_CPM * 60):8}s")

print()
for label, total in modes.items():
    usable = total - lead
    print(f'=== {label} ({total}s round, {usable}s of usable typing after the {lead}s auto-submit lead) ===')
    for who, cpm in (('beginner', BEGINNER_CPM), ('intermediate', INTERMEDIATE_CPM)):
        budget = usable * cpm / 60
        over = [r for r in rows if r['work'] > budget]
        print(f'  {who:13}: {len(over):2}/{len(rows)} cannot be typed in time   (budget {budget:.0f} chars)')
        for w in over[:5]:
            print(f'      [{w["difficulty"]}] {w["title"][:42]}  {w["work"]} chars')
        if len(over) > 5:
            print(f'      ... and {len(over) - 5} more')
    budget = usable * BEGINNER_CPM / 60
    for d in ('easy', 'medium', 'hard'):
        pool = [r for r in rows if r['difficulty'] == d]
        fits = [r for r in pool if r['work'] <= budget]
        print(f'    {d:7}: {len(fits)}/{len(pool)} a beginner can type in time')
    print()
