// How a match picks its four problems.
//
// The draw has to satisfy three rules at once and they pull against each other,
// which is why this drives real match starts instead of reading the code:
//   * every problem must fit the room's own clock (Quick Mode gets a smaller
//     pool than Standard - that is the intent, not a bug),
//   * Round 4 climbs with the room's difficulty instead of always being `hard`
//     (an easy room used to get a finale nobody in it could finish, so the
//     round scored everyone zero and decided nothing),
//   * and it must stay random - a filter tight enough to freeze the line-up
//     would pass the first two rules and ruin the mode.
//
// Replaces scripts/arcade-tests/draw-test.js, which sent no auth token and so,
// after the move to Supabase Auth, got a 401 on every request. The real server
// is booted against a disposable database and every room is opened and started
// over HTTP by a signed-in host.
const assert = require('node:assert/strict');
const test = require('node:test');
const { Pool } = require('pg');
const cfg = require('../../shared/arcadeConfig.json');
const { createTestDatabase, startServer } = require('./helpers/start-server');

const budgetFor = mode => {
  const seconds = mode === 'quick' ? cfg.quickModePhaseDurations.ROUND_1 : cfg.phaseDurations.ROUND_1;
  return (seconds - cfg.autoSubmitLeadSeconds) * cfg.beginnerCharsPerMinute / 60;
};

test('a match draws problems that fit the clock, climb with difficulty and stay random', { timeout: 600_000 }, async t => {
  const url = await createTestDatabase(t, 'pyarena_draw');
  const server = await startServer(t, { url, env: { LLM_BASE_URL: '', LLM_CHAT_MODEL: '' } });
  const db = new Pool({ connectionString: url, ssl: false });
  // The database is dropped WITH (FORCE) at teardown, which ends idle clients.
  db.on('error', () => {});
  t.after(() => db.end());
  // Arcade unlocks at level 10; the seeded players start below it.
  await db.query('UPDATE users SET level = 10');

  // The pool and typing size of every problem. work_chars stays on the server,
  // so it is read from the bank rather than from GET /api/arcade/tasks.
  const tasks = await server.call('/api/arcade/tasks', { method: 'GET' });
  assert.equal(tasks.status, 200, JSON.stringify(tasks.body));
  const { rows: bank } = await db.query('SELECT task_id, difficulty, title_en, work_chars FROM arcade_tasks');
  const byId = new Map(bank.map(row => [row.task_id, { ...row, pool: row.difficulty }]));
  for (const d of ['easy', 'medium', 'hard']) {
    assert.ok(tasks.body[d].length > 0, `the ${d} pool is served`);
    for (const task of tasks.body[d]) assert.equal(byId.get(task.task_id)?.pool, d);
  }

  // One room per draw. Leaving straight after keeps the host free for the next.
  const drawFor = async opts => {
    const created = await server.call('/api/arcade/rooms/create',
      { body: { room_name: 'Draw Test', host_name: server.username, max_players: 2, password: '', ...opts } });
    assert.equal(created.status, 200, JSON.stringify(created.body));
    const id = created.body.room.room_id;
    assert.equal((await server.call(`/api/arcade/rooms/${id}/add-bot`, { body: {} })).status, 200);
    const started = await server.call(`/api/arcade/rooms/${id}/start`, { body: {} });
    assert.equal(started.status, 200, JSON.stringify(started.body));
    const room = await server.call(`/api/arcade/rooms/${id}`, { method: 'GET' });
    await server.call(`/api/arcade/rooms/${id}/leave`, { body: {} });
    return room.body?.room?.round_task_ids || [];
  };

  for (const mode of ['quick', 'standard']) {
    const budget = budgetFor(mode);
    const overruns = [];
    const finalePools = new Set();
    for (let i = 0; i < 8; i++) {
      const ids = await drawFor({ round_duration_mode: mode, difficulty: 'easy' });
      for (const id of ids) {
        const task = byId.get(id);
        if (task && task.work_chars > budget) overruns.push(`${task.title_en}=${task.work_chars}`);
      }
      finalePools.add(byId.get(ids[3])?.pool);
    }
    await t.test(`${mode}: every drawn problem fits the ${budget.toFixed(0)}-char typing budget (8 matches)`, () => {
      assert.deepEqual(overruns, []);
    });
    await t.test(`${mode}: an easy room's Round 4 comes from the medium pool, not hard`, () => {
      assert.deepEqual([...finalePools], ['medium']);
    });
  }

  const hardIds = await drawFor({ round_duration_mode: 'standard', difficulty: 'hard' });
  await t.test('a hard room draws all four rounds from the hard pool', () => {
    assert.equal(hardIds.length, 4);
    assert.ok(hardIds.every(id => byId.get(id)?.pool === 'hard'), hardIds.map(id => byId.get(id)?.title_en).join(' | '));
  });
  await t.test('a hard room never repeats a problem across its four rounds', () => {
    assert.equal(new Set(hardIds).size, 4);
  });

  const lineups = new Set();
  for (let i = 0; i < 6; i++) lineups.add(JSON.stringify(await drawFor({ difficulty: 'default' })));
  await t.test('line-ups still differ between matches (the budget filter did not freeze the draw)', () => {
    assert.ok(lineups.size > 1, `${lineups.size} distinct line-ups in 6 matches`);
  });
});
