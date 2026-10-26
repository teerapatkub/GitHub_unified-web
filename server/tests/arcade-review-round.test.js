// The review round (Spec 0005 #23, ADR 0010): several answers "from the AI",
// pick the one that passes every test.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { arcadeFixture } = require('./helpers/arcade-fixture');
const { createArcadePhaseFinalizer } = require('../arcade/phase-finalizer');
const { computeRoundData } = require('../arcade/round-kinds');
const { gradeSubmission } = require('../problemGrader');

const SUM_TO_N = {
  test_kind: 'function',
  test_cases: [{ args: [3], expected: 6 }, { args: [1], expected: 1 }, { args: [0], expected: 0 }, { args: [4], expected: 10 }],
  starter_code: 'def sum_to_n(n):\n    total = 0\n    for i in range(1, n + 1):\n        # TODO: add i\n        pass\n    return total',
  solution_code: 'def sum_to_n(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total',
};
const REVIEW = { options: [
  { id: 'a', code: SUM_TO_N.solution_code },
  { id: 'b', code: SUM_TO_N.solution_code.replace('total += i', 'total = i') },
  { id: 'c', code: SUM_TO_N.solution_code.replace('range(1, n + 1)', 'range(1, n)') },
  { id: 'd', code: SUM_TO_N.solution_code.replace('total += i', 'total += 1') },
] };

async function reviewMatch(t) {
  const f = await arcadeFixture(t);
  const { db, call } = f;
  for (const id of [1, 2, 3, 4]) {
    await db.query('INSERT INTO arcade_tasks (task_id, work_chars, difficulty, test_cases) VALUES (?, 10, ?, ?)',
      [id, id === 4 ? 'medium' : 'easy', JSON.stringify(SUM_TO_N.test_cases)]);
    await db.query('INSERT INTO problems (problem_id, test_kind, test_cases, solution_code, starter_code) VALUES (?, ?, ?, ?, ?)',
      [id, SUM_TO_N.test_kind, JSON.stringify(SUM_TO_N.test_cases), SUM_TO_N.solution_code, SUM_TO_N.starter_code]);
    await db.query(`INSERT INTO problem_modes (mode, entry_id, problem_id, difficulty, round_kinds, round_data)
      VALUES ('arcade', ?, ?, ?, '["write","review"]', ?)`, [id, id, id === 4 ? 'medium' : 'easy', JSON.stringify({ review: REVIEW })]);
  }
  await db.query("UPDATE arcade_rooms SET difficulty = 'easy'");
  const matchId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  await db.query(`UPDATE arcade_rooms SET phase = 'ROUND_2', round_task_ids = '[1,2,3,4]', round_kinds = '["write","review","write","write"]'`);
  await db.query(`UPDATE arcade_matches SET round_task_ids = '[1,2,3,4]', round_kinds = '["write","review","write","write"]'`);
  const send = (choice, user = 'alice') => call('/api/arcade/rooms/1/submit-round', { user, body: { match_id: matchId, round_num: 2, choice } });
  const settle = async () => {
    await db.query("UPDATE arcade_rooms SET phase_deadline = CURRENT_TIMESTAMP - INTERVAL '1 second'");
    await createArcadePhaseFinalizer({ db, judgeArcadeCode: async () => { throw new Error('a choice round never asks the judge'); } })(
      (await call('/api/arcade/rooms/1')).body.room);
  };
  return { ...f, matchId, send, settle };
}

test('two players see the answers in different orders, and the server judges both by what each picked', async t => {
  const { call, send, settle } = await reviewMatch(t);
  const alice = (await call('/api/arcade/rooms/1/round')).body.review.options;
  const bob = (await call('/api/arcade/rooms/1/round', { user: 'bob' })).body.review.options;
  assert.notDeepEqual(alice.map(o => o.id), bob.map(o => o.id));
  assert.deepEqual(alice.map(o => o.id).sort(), ['a', 'b', 'c', 'd']);
  // Same answer, different place on screen: both pick the one that works.
  await send('a');
  await send('a', 'bob');
  await settle();
  for (const user of ['alice', 'bob']) {
    const [round] = (await call('/api/arcade/rooms/1/round-history', { user })).body.history;
    assert.deepEqual([round.round_kind, round.pass_count, round.total_count, round.quality_score], ['review', 4, 4, 100]);
    assert.equal(round.round_score, 200);
  }
});

test('a wrong pick scores nothing, and afterwards says which tests that answer fails', async t => {
  const { call, send, settle } = await reviewMatch(t);
  await send('b');
  await settle();
  const [round] = (await call('/api/arcade/rooms/1/round-history')).body.history;
  assert.deepEqual([round.pass_count, round.total_count, round.round_score], [2, 4, 0]);
  assert.equal(round.code, REVIEW.options[1].code);
  assert.match(round.quality_feedback, /ไม่ผ่านเทส/);
  assert.match(round.quality_feedback, /\[3\] → 6/);
});

test('the round view never says which answer is right', async t => {
  const { call } = await reviewMatch(t);
  const view = (await call('/api/arcade/rooms/1/round')).body;
  assert.equal(view.kind, 'review');
  for (const option of view.review.options) assert.deepEqual(Object.keys(option).sort(), ['code', 'id']);
});

// Enough lines for the bot coder to make several different mistakes.
const COUNT_POSITIVE = {
  test_kind: 'function',
  test_cases: [{ args: [[1, -2, 3]], expected: 2 }, { args: [[]], expected: 0 }, { args: [[0, 5]], expected: 1 }, { args: [[-1, -1]], expected: 0 }],
  starter_code: 'def count_positive(nums):\n    count = 0\n    for n in nums:\n        # TODO\n        pass\n    return count',
  solution_code: 'def count_positive(nums):\n    count = 0\n    for n in nums:\n        if n > 0:\n            count += 1\n    return count',
};

test('review data has exactly one answer that passes every test, checked by the real grader', async () => {
  const { kinds, data } = await computeRoundData(COUNT_POSITIVE);
  assert.ok(kinds.includes('review'), `kinds: ${kinds}`);
  assert.ok(data.review.options.length >= 3);
  let right = 0;
  for (const option of data.review.options) {
    const verdict = await gradeSubmission({ problem: COUNT_POSITIVE, code: option.code });
    if (verdict.passed === verdict.total) right++;
  }
  assert.equal(right, 1);
});
