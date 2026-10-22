// Does choosing an easier room actually give you easier OPPONENTS?
//
// Bot round scores used to come from one fixed band no matter what the room was
// set to, so picking `easy` got you easier problems against exactly the same
// opposition - the room setting did not make the match more survivable, which
// is the only reason a beginner would pick it.
//
// Method: run Round 1 of several quick-mode matches per difficulty and compare
// the scores the SERVER wrote for the bots. Round 1 eliminates nobody, so every
// bot's first-round score survives to be read back.
//
// Replaces scripts/arcade-tests/bot-skill-test.js, which sent no auth token and
// so, after the move to Supabase Auth, got a 401 on every request. The real
// server is booted against a disposable database with its match tick running,
// so the rounds close and the bots play exactly as they do in production. Takes
// about a minute: it waits for real 30-second rounds to finish.
const assert = require('node:assert/strict');
const test = require('node:test');
const { Pool } = require('pg');
const { createTestDatabase, startServer } = require('./helpers/start-server');

const ROOMS_PER_DIFFICULTY = 6;
const BOTS_PER_ROOM = 3;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const stats = xs => ({
  n: xs.length,
  mean: xs.reduce((a, b) => a + b, 0) / xs.length,
  min: Math.min(...xs),
  max: Math.max(...xs),
});

test('bots score lower in an easy room than in a hard one', { timeout: 600_000 }, async t => {
  const url = await createTestDatabase(t, 'pyarena_botskill');
  const server = await startServer(t, {
    url, backgroundJobs: true,
    env: { LLM_BASE_URL: '', LLM_CHAT_MODEL: '', LLM_ADVICE_MODEL: '', LLM_JUDGE_MODEL: '' },
  });
  const db = new Pool({ connectionString: url, ssl: false });
  // The database is dropped WITH (FORCE) at teardown, which ends idle clients.
  db.on('error', () => {});
  t.after(() => db.end());
  // Arcade unlocks at level 10; the seeded players start below it.
  await db.query('UPDATE users SET level = 10');

  const openRoom = async difficulty => {
    const created = await server.call('/api/arcade/rooms/create', {
      body: { room_name: 'Bot Skill', host_name: server.username, max_players: 5, password: '', round_duration_mode: 'quick', difficulty },
    });
    assert.equal(created.status, 200, JSON.stringify(created.body));
    const id = created.body.room.room_id;
    for (let i = 0; i < BOTS_PER_ROOM; i++) {
      assert.equal((await server.call(`/api/arcade/rooms/${id}/add-bot`, { body: {} })).status, 200);
    }
    const started = await server.call(`/api/arcade/rooms/${id}/start`, { body: {} });
    assert.equal(started.status, 200, JSON.stringify(started.body));
    return id;
  };
  const roomState = async id => (await server.call(`/api/arcade/rooms/${id}`, { method: 'GET' })).body;

  const rooms = { easy: [], hard: [] };
  for (const d of Object.keys(rooms)) {
    for (let i = 0; i < ROOMS_PER_DIFFICULTY; i++) rooms[d].push(await openRoom(d));
  }

  // Poll until every room has left ROUND_1. Polling also acts as the host's
  // heartbeat, which is what stops the stale sweep from removing these rooms
  // out from under the test.
  const all = [...rooms.easy, ...rooms.hard];
  for (let waited = 0; waited < 90; waited += 3) {
    await sleep(3000);
    const phases = [];
    for (const id of all) phases.push((await roomState(id))?.room?.phase);
    if (phases.every(p => p && p !== 'ROUND_1')) break;
  }

  const scores = { easy: [], hard: [] };
  for (const d of Object.keys(rooms)) {
    for (const id of rooms[d]) {
      for (const p of (await roomState(id))?.participants || []) {
        if (p.participant_kind === 'bot' && Number(p.score) > 0) scores[d].push(Number(p.score));
      }
    }
  }
  assert.ok(scores.easy.length && scores.hard.length,
    `no bot scores were recorded - the rounds may not have finalized\n${server.logs().slice(-2000)}`);

  const e = stats(scores.easy);
  const h = stats(scores.hard);
  t.diagnostic(`easy room bots: n=${e.n} mean=${e.mean.toFixed(1)} range ${e.min}-${e.max}`);
  t.diagnostic(`hard room bots: n=${h.n} mean=${h.mean.toFixed(1)} range ${h.min}-${h.max}`);
  assert.ok(e.mean < h.mean, `easy mean ${e.mean.toFixed(1)} is not below hard mean ${h.mean.toFixed(1)}`);
});
