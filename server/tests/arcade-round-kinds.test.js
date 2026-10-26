// Round kinds (Spec 0005 Track G, ADR 0010): classic and mixed rooms, the fix
// round, and matches recorded before round kinds existed.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { arcadeFixture } = require('./helpers/arcade-fixture');
const { createArcadePhaseFinalizer } = require('../arcade/phase-finalizer');
const { computeRoundData, planRoundKinds } = require('../arcade/round-kinds');

const SUM_TO_N = {
  test_kind: 'function',
  test_cases: [{ args: [3], expected: 6 }, { args: [1], expected: 1 }, { args: [0], expected: 0 }, { args: [4], expected: 10 }],
  starter_code: 'def sum_to_n(n):\n    total = 0\n    for i in range(1, n + 1):\n        # TODO: add i\n        pass\n    return total',
  solution_code: 'def sum_to_n(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total',
};
// "total = i": passes n = 0 and n = 1, fails 3 and 4.
const AI_ANSWER = 'def sum_to_n(n):\n    total = 0\n    for i in range(1, n + 1):\n        total = i\n    return total';

// Four Arcade tasks, each registered with a fix round. The room is set to
// 'easy' so rounds 1-3 draw the three easy ones and the finale the medium one
// (arcadeConfig.finalePoolByDifficulty); a 'default' room would draw rounds 1-3
// from easy and medium and could leave no finale.
async function seedProblems(db, { kinds = ['write', 'fix'] } = {}) {
  await db.query("UPDATE arcade_rooms SET difficulty = 'easy'");
  for (const id of [1, 2, 3, 4]) {
    const difficulty = id === 4 ? 'medium' : 'easy';
    await db.query('INSERT INTO arcade_tasks (task_id, work_chars, difficulty, test_cases) VALUES (?, 10, ?, ?)',
      [id, difficulty, JSON.stringify(SUM_TO_N.test_cases)]);
    await db.query('INSERT INTO problems (problem_id, title_th, test_kind, test_cases, solution_code, starter_code) VALUES (?, ?, ?, ?, ?, ?)',
      [id, `ข้อ ${id}`, SUM_TO_N.test_kind, JSON.stringify(SUM_TO_N.test_cases), SUM_TO_N.solution_code, SUM_TO_N.starter_code]);
    await db.query(`INSERT INTO problem_modes (mode, entry_id, problem_id, difficulty, round_kinds, round_data)
      VALUES ('arcade', ?, ?, ?, ?, ?)`, [id, id, difficulty, JSON.stringify(kinds),
      JSON.stringify(kinds.includes('fix') ? { fix: { code: AI_ANSWER, passed: 2, total: 4 } } : {})]);
  }
}

test('a classic room writes code every round', async t => {
  const { db, call } = await arcadeFixture(t);
  await seedProblems(db);
  const settings = await call('/api/arcade/rooms/1/settings', { body: { host_name: 'alice', round_format: 'classic' } });
  assert.equal(settings.status, 200);
  assert.equal(settings.body.round_format, 'classic');
  await call('/api/arcade/rooms/1/start', { body: {} });
  const { room } = (await call('/api/arcade/rooms/1')).body;
  assert.equal(room.round_format, 'classic');
  assert.deepEqual(room.round_kinds, ['write', 'write', 'write', 'write']);
  const [[match]] = await db.query('SELECT round_format, round_kinds FROM arcade_matches WHERE match_id = ?', [room.current_match_id]);
  assert.deepEqual([match.round_format, match.round_kinds], ['classic', ['write', 'write', 'write', 'write']]);
});

test('a new room is mixed, and its third round is a fix round', async t => {
  const { db, call } = await arcadeFixture(t);
  await seedProblems(db);
  const created = await call('/api/arcade/rooms/create', { body: { room_name: 'Mixed', host_name: 'alice' } });
  assert.equal(created.body.room.round_format, 'mixed');
  // The fixture's room predates the column default being chosen, so check it too.
  assert.equal((await call('/api/arcade/rooms/1')).body.room.round_format, 'mixed');
  await call('/api/arcade/rooms/1/start', { body: {} });
  const { room } = (await call('/api/arcade/rooms/1')).body;
  // Round 1 becomes "predict" once that kind exists (ticket 22); until then it
  // is a write round. Round 4 is drawn from the kinds a mixed room plays.
  assert.deepEqual(room.round_kinds.slice(0, 3), ['write', 'write', 'fix']);
  assert.ok(['write', 'fix'].includes(room.round_kinds[3]));
  assert.ok(room.round_task_ids.every(id => [1, 2, 3, 4].includes(id)));
});

test('a mixed room plays write when no problem in the pool can be a fix round', async t => {
  const { db, call } = await arcadeFixture(t);
  await seedProblems(db, { kinds: ['write'] });
  await call('/api/arcade/rooms/1/start', { body: {} });
  assert.deepEqual((await call('/api/arcade/rooms/1')).body.room.round_kinds, ['write', 'write', 'write', 'write']);
});

test('room settings refuse an unknown round format and keep the format when it is omitted', async t => {
  const { call } = await arcadeFixture(t);
  const bad = await call('/api/arcade/rooms/1/settings', { body: { host_name: 'alice', round_format: 'chaos' } });
  assert.equal(bad.status, 400);
  const renamed = await call('/api/arcade/rooms/1/settings', { body: { host_name: 'alice', room_name: 'Renamed' } });
  assert.equal(renamed.body.round_format, 'mixed');
});

test('a fix round opens on the AI answer, scores nothing for sending it back, and full marks for fixing it', async t => {
  const { db, call } = await arcadeFixture(t);
  await seedProblems(db);
  const matchId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  await db.query(`UPDATE arcade_rooms SET phase = 'ROUND_3', round_task_ids = '[1,2,3,4]', round_kinds = '["write","write","fix","write"]'`);

  const view = await call('/api/arcade/rooms/1/round');
  assert.equal(view.status, 200);
  assert.equal(view.body.kind, 'fix');
  assert.equal(view.body.round_num, 3);
  assert.deepEqual(view.body.fix, { starter_code: AI_ANSWER, passed: 2, total: 4 });
  assert.equal((await call('/api/arcade/rooms/1/round', { user: 'outsider' })).status, 403);

  // alice sends the AI's answer back untouched (trailing whitespace aside); bob fixes it.
  await call('/api/arcade/rooms/1/submit-round', { body: { match_id: matchId, round_num: 3, code: `${AI_ANSWER}\n\n` } });
  await call('/api/arcade/rooms/1/submit-round', { user: 'bob', body: { match_id: matchId, round_num: 3, code: SUM_TO_N.solution_code } });
  await db.query("UPDATE arcade_rooms SET phase_deadline = CURRENT_TIMESTAMP - INTERVAL '1 second'");
  const room = (await call('/api/arcade/rooms/1')).body.room;
  await createArcadePhaseFinalizer({ db, judgeArcadeCode: async () => ({ score: 80, source: 'metrics' }) })(room);

  const scores = Object.fromEntries((await call('/api/arcade/rooms/1')).body.participants.map(p => [p.user_name, p.score]));
  assert.equal(scores.alice, 0);
  assert.ok(scores.bob >= 180, `bob fixed every test and should score tests + quality, got ${scores.bob}`);
  const alice = (await call('/api/arcade/rooms/1/round-history')).body.history[0];
  assert.deepEqual([alice.round_kind, alice.pass_count, alice.total_count, alice.round_score], ['fix', 2, 4, 0]);
  const bob = (await call('/api/arcade/rooms/1/round-history', { user: 'bob' })).body.history[0];
  assert.deepEqual([bob.round_kind, bob.pass_count, bob.total_count], ['fix', 4, 4]);
});

test('a fix round pays only for the tests the player fixed, not for the AI answer they kept', async t => {
  const { db, call } = await arcadeFixture(t);
  await seedProblems(db);
  const matchId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  await db.query(`UPDATE arcade_rooms SET phase = 'ROUND_3', round_task_ids = '[1,2,3,4]', round_kinds = '["write","write","fix","write"]'`);
  // A comment added to the AI's answer: different text, the same 2 of 4 tests.
  await call('/api/arcade/rooms/1/submit-round', { body: { match_id: matchId, round_num: 3, code: `# checked\n${AI_ANSWER}` } });
  await db.query("UPDATE arcade_rooms SET phase_deadline = CURRENT_TIMESTAMP - INTERVAL '1 second'");
  await createArcadePhaseFinalizer({ db, judgeArcadeCode: async () => ({ score: 80, source: 'metrics' }) })((await call('/api/arcade/rooms/1')).body.room);
  const [round] = (await call('/api/arcade/rooms/1/round-history')).body.history;
  assert.deepEqual([round.pass_count, round.total_count], [2, 4]);
  // No test points and no time points; quality counts at half, as for any
  // answer that fixes nothing (phase-finalizer.js qualityFor).
  assert.equal(round.round_score, 40);
});

test('a match recorded before round kinds existed reads as all write rounds', async t => {
  const { db, call } = await arcadeFixture(t);
  await seedProblems(db);
  const matchId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  await db.query('UPDATE arcade_rooms SET round_kinds = NULL');
  await db.query('UPDATE arcade_matches SET round_kinds = NULL, round_format = NULL');
  const view = await call('/api/arcade/rooms/1/round');
  assert.equal(view.status, 200);
  assert.equal(view.body.kind, 'write');
  await call('/api/arcade/rooms/1/submit-round', { body: { match_id: matchId, round_num: 1, code: SUM_TO_N.solution_code } });
  await db.query("UPDATE arcade_rooms SET phase_deadline = CURRENT_TIMESTAMP - INTERVAL '1 second'");
  await createArcadePhaseFinalizer({ db, judgeArcadeCode: async () => ({ score: 50 }) })((await call('/api/arcade/rooms/1')).body.room);
  const [round] = (await call('/api/arcade/rooms/1/round-history')).body.history;
  assert.equal(round.round_kind, 'write');
  await db.query('UPDATE arcade_round_history SET match_ended_at = CURRENT_TIMESTAMP');
  const history = (await call('/api/arcade/players/alice/history')).body;
  assert.equal(history.matches[0].round_format, 'classic');
  assert.equal(history.matches[0].rounds[0].round_kind, 'write');
});

test('the fix answer chosen for a problem passes at least one test but not all, judged by the real grader', async () => {
  const { kinds, data } = await computeRoundData(SUM_TO_N);
  assert.ok(kinds.includes('fix'));
  assert.ok(data.fix.passed >= 1 && data.fix.passed < data.fix.total);
  assert.notEqual(data.fix.code, SUM_TO_N.starter_code);
});

test('classic rooms never plan anything but write', () => {
  assert.deepEqual(planRoundKinds('classic'), ['write', 'write', 'write', 'write']);
  assert.deepEqual(planRoundKinds(undefined), ['write', 'write', 'write', 'write']);
});
