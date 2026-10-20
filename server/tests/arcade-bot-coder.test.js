const { test } = require('node:test');
const assert = require('node:assert/strict');
const coder = require('../arcade/bot-coder');

const problem = {
  test_kind: 'function',
  test_cases: [{ args: [3], expected: 6 }, { args: [1], expected: 1 }, { args: [0], expected: 0 }, { args: [4], expected: 10 }],
  starter_code: 'def sum_to_n(n):\n    total = 0\n    for i in range(1, n + 1):\n        # TODO: add i\n        pass\n    return total',
  solution_code: 'def sum_to_n(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total',
};

const seq = values => { let i = 0; return () => values[i++ % values.length]; };

test('mistakes are made only in the lines a player writes, never in the given scaffold', () => {
  for (const code of coder.candidateAnswers(problem)) {
    assert.match(code, /for i in range\(1, n \+ 1\):/);
    assert.notEqual(code, problem.solution_code);
  }
  assert.ok(coder.candidateAnswers(problem).some(code => code.includes('total = i')));
});

test('the bank grades the answer, the scaffold and each mistake with the real grader', async () => {
  const bank = await coder.buildBank(problem);
  const { verdict, ...solution } = bank[0];
  assert.deepEqual(solution, { id: 'solution', code: problem.solution_code, passed: 4, total: 4 });
  assert.ok(Number.isFinite(verdict.runtimeMs), 'kept for the code judge');
  assert.ok(bank.length >= 2);
  for (const answer of bank.slice(1)) assert.ok(answer.passed < answer.total, answer.code);
  assert.ok(bank.some(answer => answer.id === 'starter'));
});

test('a bot picks the banked answer whose real pass ratio is nearest its skill roll', () => {
  const bank = [{ id: 'a', passed: 4, total: 4 }, { id: 'b', passed: 2, total: 4 }, { id: 'c', passed: 0, total: 4 }];
  assert.equal(coder.chooseAnswer(bank, 0.95, () => 0).id, 'a');
  assert.equal(coder.chooseAnswer(bank, 0.4, () => 0).id, 'b');
  assert.equal(coder.chooseAnswer(bank, 0.1, () => 0).id, 'c');
});

test('typing the plan with no typos and no debuffs produces exactly the chosen answer', () => {
  const plan = coder.typingPlan(problem.starter_code, problem.solution_code);
  assert.equal(coder.draftOf(plan), plan.prefix + plan.suffix);
  let state;
  do state = coder.typingStep(plan, { accuracy: 1, effects: new Set(), random: () => 0.5 });
  while (state !== 'done');
  assert.equal(coder.draftOf(plan), problem.solution_code);
  assert.equal(coder.progressOf(plan), 100);
});

test('a careful bot deletes the character Caps Lock Trap forced and types it again', () => {
  const plan = coder.typingPlan(problem.starter_code, problem.solution_code);
  coder.typingStep(plan, { accuracy: 1, effects: new Set(['capsLockLock']), random: () => 0.5 });
  assert.notEqual(plan.text, plan.insert.slice(0, plan.text.length));
  assert.equal(coder.typingStep(plan, { accuracy: 1, effects: new Set(), random: () => 0 }), 'fixing');
  assert.equal(plan.text, '');
});

test('under Backspace Lock a bot cannot fix a glitch and its draft stays wrong', () => {
  const plan = coder.typingPlan(problem.starter_code, problem.solution_code);
  coder.typingStep(plan, { accuracy: 1, effects: new Set(['typoGenerator']), random: () => 0 });
  const before = plan.text;
  assert.ok(before.length === 2 && before[1] === 'x');
  coder.typingStep(plan, { accuracy: 1, effects: new Set(['backspaceLock']), random: () => 0 });
  assert.ok(plan.text.startsWith(before));
});

test('a careless bot can send an answer with a typo still in it', () => {
  const plan = coder.typingPlan(problem.starter_code, problem.solution_code);
  // Every letter mistyped, never noticed.
  const random = seq([0.99, 0.2]);
  let state;
  do state = coder.typingStep(plan, { accuracy: 0, effects: new Set(), random });
  while (state !== 'done');
  assert.notEqual(coder.draftOf(plan), problem.solution_code);
  assert.ok(coder.progressOf(plan) < 100);
});
