// Debug Lab hands out a solution with one real bug in it (fix list item 3,
// 2026-11-12). A bug is only real if the code still runs to the end and prints
// a wrong answer on the problem's own tests.
const assert = require('node:assert/strict');
const test = require('node:test');
const { plantBug } = require('../debugLab');
const { gradeSubmission } = require('../problemGrader');

const LOOP = {
  solution: 'n = int(input())\ntotal = 0\nfor i in range(1, n + 1):\n    total += i\nprint(total)',
  testCases: [{ input: '4', expected: '10' }, { input: '6', expected: '21' }],
};

test('a planted bug runs cleanly and fails the problem\'s tests', { timeout: 60_000 }, async () => {
  for (let seed = 0; seed < 4; seed += 1) {
    let n = seed;
    const bug = await plantBug({ ...LOOP, random: () => ((n = (n * 9301 + 49297) % 233280) / 233280) });
    assert.ok(bug, 'this loop has plenty of places for a bug');
    assert.notEqual(bug.code.trim(), LOOP.solution.trim());
    const verdict = await gradeSubmission({ problem: { test_kind: 'stdio', test_cases: LOOP.testCases }, code: bug.code });
    assert.equal(verdict.allPassed, false, bug.code);
    assert.ok(verdict.results.every((r) => !r.error), `the bug must not crash:\n${bug.code}`);
  }
});

test('a problem with nothing to break gets no bug', { timeout: 30_000 }, async () => {
  const bug = await plantBug({ solution: 'print("Hello, Python!")', testCases: [{ input: '', expected: 'Hello, Python!' }] });
  assert.equal(bug, null);
});

test('forgetting int() around input() is one of the bugs it can plant', { timeout: 60_000 }, async () => {
  const kinds = new Set();
  for (let i = 0; i < 12; i += 1) {
    const bug = await plantBug({
      solution: 'a = int(input())\nb = int(input())\nprint(a + b)',
      testCases: [{ input: '3\n4', expected: '7' }],
    });
    if (bug) kinds.add(bug.kind);
  }
  assert.ok(kinds.has('conversion'), [...kinds].join(', '));
});
