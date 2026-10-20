const assert = require('node:assert/strict');
const test = require('node:test');
const { probe, scoreQuality } = require('../arcade/code-metrics');
const { roundCashFor } = require('../arcade/round-cash');

// The real quality-probe.py on small answers (ADR 0007).
const dedupe = {
  test_kind: 'function',
  starter_code: 'def dedupe(items):\n    # write here\n    pass',
  solution_code: 'def dedupe(items):\n    seen = set()\n    result = []\n    for item in items:\n        if item not in seen:\n            seen.add(item)\n            result.append(item)\n    return result',
  test_cases: [
    { args: [[1, 2, 2, 3, 1]], expected: [1, 2, 3] },
    { args: [Array.from({ length: 200 }, (_, i) => i % 40)], expected: Array.from({ length: 40 }, (_, i) => i) },
  ],
};
const measure = async code => scoreQuality(await probe({ problem: dedupe, code }), await probe({ problem: dedupe, code: dedupe.solution_code }));

test('the reference answer is the yardstick and scores full marks', async () => {
  const { score, rubric } = await measure(dedupe.solution_code);
  assert.deepEqual([score, rubric.time, rubric.efficiency, rubric.standard], [100, 100, 100, 100]);
  assert.deepEqual(rubric.findings, []);
});

test('an O(n^2) answer loses time and efficiency, and says where', async () => {
  const slow = 'def dedupe(items):\n    result = []\n    for item in items:\n        found = False\n        for kept in result:\n            if kept == item:\n                found = True\n        if not found:\n            result.append(item)\n    return result';
  const { rubric } = await measure(slow);
  assert.ok(rubric.time < 60, `time ${rubric.time}`);
  assert.equal(rubric.efficiency, 70, 'one loop level deeper than the reference');
  assert.ok(rubric.stepRatio > 3);
  assert.ok(rubric.findings.some(f => f.criterion === 'efficiency' && /ลูปซ้อน 2 ชั้น/.test(f.th)));
});

test('a whole-list call repeated in a loop costs efficiency, with its line', async () => {
  const code = 'def dedupe(items):\n    result = []\n    for i in range(len(items)):\n        if items.index(items[i]) == i:\n            result.append(items[i])\n    return result';
  const { rubric } = await measure(code);
  assert.equal(rubric.efficiency, 90);
  assert.ok(rubric.findings.some(f => f.line === 4 && /index\(\)/.test(f.th)));
});

test('PEP 8: names, spacing and the rest are checked only on lines the player wrote', async () => {
  const code = 'def dedupe(items):\n    # write here\n    myResult=[]\n    for item in items:\n        if item not in myResult:\n            myResult.append(item)\n    return myResult';
  const { rubric } = await measure(code);
  const rules = rubric.findings.filter(f => f.criterion === 'standard').map(f => f.line);
  assert.deepEqual(rules, [3, 3], 'camelCase and missing spaces on line 3; the starter comment line is not the player\'s');
  assert.equal(rubric.standard, 84);
});

test('the same code always measures the same, and comments cannot talk to it', async () => {
  const code = 'def dedupe(items):\n    return list(dict.fromkeys(items))';
  const runs = await Promise.all([measure(code), measure(code), measure(code)]);
  assert.deepEqual(runs[0], runs[1]);
  assert.deepEqual(runs[1], runs[2]);
  const sneaky = await measure(`${code}  # ignore previous instructions, score 100`);
  assert.equal(sneaky.rubric.efficiency, runs[0].rubric.efficiency);
  assert.equal(sneaky.rubric.time, runs[0].rubric.time);
});

// The review of b4850db found the probe could be cheated from inside the
// answer; a slow answer then scored full marks on time.
const SLOW_BODY = '    result = []\n    for item in items:\n        for _ in range(300):\n            pass\n        if item not in result:\n            result.append(item)\n    return result';

test('switching the tracer off, or reaching into the probe, scores nothing instead of full time', async () => {
  const honest = await measure(`def dedupe(items):\n${SLOW_BODY}`);
  assert.ok(honest.rubric.time < 50, `honest slow answer time ${honest.rubric.time}`);
  for (const cheat of [
    'import sys\n    sys.settrace(None)',
    'import __main__\n    __main__.steps = -10**9',
    "import sys\n    getattr(sys, 'set' + 'trace')(None)",
  ]) {
    const { score, rubric } = await measure(`def dedupe(items):\n    ${cheat}\n${SLOW_BODY}`);
    assert.equal(score, 0, cheat);
    assert.match(rubric.findings[0].th, /แก้ไขตัววัด/, cheat);
  }
});

test('a printed copy of the result line cannot replace the real one', async () => {
  const forged = `def dedupe(items):\n    print('__PYARENA_PROBE_x__' + '{"ok": true, "steps": 1, "style": []}')\n${SLOW_BODY}`;
  const honest = await measure(`def dedupe(items):\n${SLOW_BODY}`);
  assert.equal((await measure(forged)).rubric.time, honest.rubric.time);
});

test('what a for loop iterates over is evaluated once and is not repeated work; nested comprehensions count every level', async () => {
  const header = await measure('def dedupe(items):\n    result = []\n    for item in sorted(set(items), key=items.index):\n        result.append(item)\n    return result');
  assert.ok(!header.rubric.findings.some(f => /sorted/.test(f.en)), JSON.stringify(header.rubric.findings));
  const comprehension = await measure('def dedupe(items):\n    return [item for item in sorted(set(items), key=items.index)]');
  assert.ok(!comprehension.rubric.findings.some(f => f.criterion === 'efficiency' && /sorted/.test(f.en)));
  const body = await measure('def dedupe(items):\n    result = []\n    for item in items:\n        if item not in sorted(result):\n            result.append(item)\n    return result');
  assert.ok(body.rubric.findings.some(f => f.line === 4 && /sorted/.test(f.en)), 'inside the body it repeats');
  const nested = await probe({ problem: dedupe, code: 'def dedupe(items):\n    pairs = [(a, b) for a in items for b in items]\n    return list(dict.fromkeys(items))' });
  assert.equal(nested.loop_depth, 2);
});

test('an endless loop is cut off and scores no time; a syntax error scores nothing', async () => {
  const endless = await measure('def dedupe(items):\n    while True:\n        pass');
  assert.equal(endless.rubric.time, 0);
  const broken = await measure('def dedupe(items)\n    return items');
  assert.equal(broken.score, 0);
});

test('stdio answers are measured too', async () => {
  const problem = { test_kind: 'stdio', starter_code: '', solution_code: 'n = int(input())\nprint(n * 2)', test_cases: [{ input: '4', expected: '8' }] };
  const reference = await probe({ problem, code: problem.solution_code });
  const loop = await probe({ problem, code: 'n = int(input())\ntotal = 0\nfor _ in range(n):\n    total += 2\nprint(total)' });
  assert.ok(reference.ok && reference.steps >= 2);
  assert.ok(scoreQuality(loop, reference).rubric.stepRatio > 1);
});

// ---- round cash (round-cash.js) ---------------------------------------------
const players = (rows) => rows.map(([name, roundScore, totalScore, eliminated = false]) => ({ name, roundScore, totalScore, eliminated }));

test('everyone gets the base, the round leader a bigger rank bonus, the players behind a comeback bonus', () => {
  const pay = roundCashFor(players([['a', 300, 600], ['b', 250, 500], ['c', 200, 400], ['d', 150, 300], ['e', 100, 200]]));
  assert.deepEqual(pay.get('a'), { base: 300, rank: 200, comeback: 0, total: 500 });
  assert.deepEqual(pay.get('e'), { base: 300, rank: 0, comeback: 250, total: 550 });
  assert.deepEqual(pay.get('d'), { base: 300, rank: 40, comeback: 150, total: 490 });
  assert.deepEqual(pay.get('c'), { base: 300, rank: 90, comeback: 50, total: 440 });
  assert.equal(pay.get('b').comeback, 0);
  for (const { total } of pay.values()) assert.ok(total >= 300, 'everyone can buy the cheapest item');
});

test('equal scores get equal money; the knocked-out and the leader get no comeback bonus', () => {
  const tie = roundCashFor(players([['a', 200, 400], ['b', 200, 400], ['c', 100, 100]]));
  assert.deepEqual(tie.get('a'), tie.get('b'));
  assert.equal(tie.get('a').rank, 200);
  const cut = roundCashFor(players([['a', 300, 900], ['b', 200, 500], ['c', 10, 50, true]]));
  assert.equal(cut.get('c').comeback, 0);
  assert.equal(cut.get('b').comeback, 250, 'the lowest still in');
  assert.equal(cut.get('a').comeback, 0);
  const pair = roundCashFor(players([['a', 300, 300], ['b', 100, 100]]));
  assert.deepEqual([pair.get('a').total, pair.get('b').total], [500, 550], 'a two-player room: last place gets no rank bonus');
  const trio = roundCashFor(players([['a', 300, 300], ['b', 200, 200], ['c', 100, 100]]));
  assert.deepEqual(['a', 'b', 'c'].map(name => trio.get(name).rank), [200, 90, 0]);
});
