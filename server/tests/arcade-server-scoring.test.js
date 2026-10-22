// Does the server score an Arcade round from the code, ignoring anything the
// client claims?
//
// The browser sends code; finalizeArcadePhase() runs it, measures its quality
// and takes the time from the server's own clock when the round closes (see
// docs/adr/0001-server-owns-the-verdict.md). The checks below are the ones that
// would have caught the old behaviour, when the client's round_score was taken
// at its word: the same inflated request that used to win a match now scores
// whatever the code deserves.
//
// Replaces scripts/arcade-tests/server-scoring-test.js, which sent no auth
// token and so, after the move to Supabase Auth, got a 401 on every request.
// The real server is booted against a disposable database with its match tick
// running, and driven over HTTP as signed-in players.
const assert = require('node:assert/strict');
const test = require('node:test');
const { Pool } = require('pg');
const cfg = require('../../shared/arcadeConfig.json');
const { createTestDatabase, startServer } = require('./helpers/start-server');

const OUTSIDER = 'scoring_outsider';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

test('an Arcade round is scored from the code, not from what the client claims', { timeout: 600_000 }, async t => {
  const url = await createTestDatabase(t, 'pyarena_score');
  // No model: post-match advice must not reach outside the machine.
  const server = await startServer(t, {
    url, players: [OUTSIDER], backgroundJobs: true,
    env: { LLM_BASE_URL: '', LLM_CHAT_MODEL: '', LLM_ADVICE_MODEL: '', LLM_JUDGE_MODEL: '' },
  });
  const db = new Pool({ connectionString: url, ssl: false });
  // The database is dropped WITH (FORCE) at teardown, which ends idle clients.
  db.on('error', () => {});
  t.after(() => db.end());
  // Arcade unlocks at level 10; the seeded players start below it.
  await db.query('UPDATE users SET level = 10');

  const created = await server.call('/api/arcade/rooms/create',
    { body: { room_name: 'Server Scoring', host_name: server.username, max_players: 2, password: '' } });
  assert.equal(created.status, 200, JSON.stringify(created.body));
  const id = created.body.room.room_id;
  assert.equal((await server.call(`/api/arcade/rooms/${id}/add-bot`, { body: {} })).status, 200);
  const started = await server.call(`/api/arcade/rooms/${id}/start`, { body: {} });
  assert.equal(started.status, 200, JSON.stringify(started.body));
  const matchId = started.body.match_id;
  const submit = (call, body) => call(`/api/arcade/rooms/${id}/submit-round`, { body: { match_id: matchId, round_num: 1, ...body } });
  const myRow = async () => (await db.query(
    'SELECT pending_round_score, submitted_code FROM arcade_participants WHERE room_id = $1 AND user_name = $2',
    [id, server.username])).rows[0];

  // The reference solution for the problem this room actually drew, so
  // "correct code" means correct for the task the player was given.
  const { rows: [room] } = await db.query('SELECT round_task_ids FROM arcade_rooms WHERE room_id = $1', [id]);
  const taskId = Array.isArray(room.round_task_ids) ? room.round_task_ids[0] : null;
  const { rows: [problem] } = await db.query(
    `SELECT p.solution_code, jsonb_array_length(p.test_cases) AS cases
       FROM problem_modes m JOIN problems p ON p.problem_id = m.problem_id
      WHERE m.mode = 'arcade' AND m.entry_id = $1`, [taskId]);

  await t.test('the room drew a real problem for round 1', () => {
    assert.ok(problem?.solution_code, `task ${taskId}`);
  });

  await t.test('a submission without code is refused', async () => {
    const noCode = await submit(server.call, { round_score: 999999999 });
    assert.equal(noCode.status, 400, JSON.stringify(noCode.body));
  });

  // The exact request that used to win every match: a huge score, correct
  // code, impossible counts. It is accepted - and every number in it is ignored.
  await t.test('an inflated submission is accepted and no score is recorded on arrival', async () => {
    const attack = await submit(server.call, {
      round_score: 999999999, code: problem.solution_code,
      pass_count: 7, total_count: 5, quality_score: 5000, time_used_seconds: 99999,
    });
    assert.equal(attack.status, 200, JSON.stringify(attack.body));
    assert.equal((await myRow()).pending_round_score, null);
  });

  await t.test('a second, different submission in the same round does not replace the first', async () => {
    const dup = await submit(server.call, { code: 'print("junk")' });
    assert.equal(dup.status, 409, JSON.stringify(dup.body));
    assert.equal((await myRow()).submitted_code, problem.solution_code);
  });

  await t.test('a signed-in player who is not in the room is refused', async () => {
    const stranger = await submit(server.players[OUTSIDER].call, { code: 'print(1)' });
    assert.equal(stranger.status, 403, JSON.stringify(stranger.body));
    const { rows } = await db.query('SELECT 1 FROM arcade_participants WHERE room_id = $1 AND user_name = $2', [id, OUTSIDER]);
    assert.equal(rows.length, 0);
  });

  // Close the round early and let the server's own tick grade it.
  await db.query('UPDATE arcade_rooms SET phase_deadline = CURRENT_TIMESTAMP WHERE room_id = $1', [id]);
  let history = [];
  for (let i = 0; i < 60 && history.length === 0; i++) {
    await sleep(1000);
    history = (await server.call(`/api/arcade/rooms/${id}/round-history`, { method: 'GET' })).body?.history || [];
  }
  const row = history[0];

  await t.test('the round was graded after it closed', () => {
    assert.ok(row, `no history row\n${server.logs().slice(-2000)}`);
  });
  if (!row) return;

  await t.test('the correct solution passed every test case the server ran', () => {
    assert.ok(row.total_count > 0 && row.pass_count === row.total_count,
      `${row.pass_count}/${row.total_count} (problem has ${problem.cases})`);
  });
  await t.test("the score is the server's, not the 999,999,999 that was sent", () => {
    assert.ok(row.round_score > 0 && row.round_score < 999999999, `round_score ${row.round_score}`);
  });
  await t.test('quality is a real 0-100 score', () => {
    assert.ok(row.quality_score >= 0 && row.quality_score <= 100, `quality ${row.quality_score}`);
  });
  await t.test('time used came from the server clock and fits the round', () => {
    assert.ok(row.time_used_seconds >= 0 && row.time_used_seconds <= cfg.phaseDurations.ROUND_1,
      `${row.time_used_seconds}s of ${cfg.phaseDurations.ROUND_1}s`);
  });
  await t.test('the impossible pass_count that was sent did not survive', () => {
    assert.ok(!(row.pass_count === 7 && row.total_count === 5), `${row.pass_count}/${row.total_count}`);
  });
});
