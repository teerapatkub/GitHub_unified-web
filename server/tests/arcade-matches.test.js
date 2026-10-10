const { test } = require('node:test');
const assert = require('node:assert/strict');
const { arcadeFixture } = require('./helpers/arcade-fixture');

test('only the member host can start a waiting room and concurrent starts create one match', async t => {
  const { call } = await arcadeFixture(t);
  assert.equal((await call('/api/arcade/rooms/1/start', { user: 'bob', body: { host_name: 'bob' } })).status, 403);
  const results = await Promise.all([1, 2].map(() => call('/api/arcade/rooms/1/start', { body: { host_name: 'alice' } })));
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  const matchId = results.find(r => r.status === 200).body.match_id;
  assert.ok(Number.isInteger(matchId));
  const state = (await call('/api/arcade/rooms/1')).body;
  assert.equal(state.room.current_match_id, matchId);
  assert.ok(state.participants.every(p => p.match_id === matchId));
  assert.equal((await call('/api/arcade/rooms/1/start', { body: { host_name: 'alice' } })).status, 409);
});

test('two matches in one room have separate history and keep it after the room is deleted', async t => {
  const { call, db } = await arcadeFixture(t);
  const first = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  await db.query("INSERT INTO arcade_round_history (room_id,match_id,user_name,round_num,code,round_score,match_ended_at) VALUES (1,?,'alice',1,'first answer',100,CURRENT_TIMESTAMP)", [first]);
  await db.query("UPDATE arcade_rooms SET status = 'WAITING', phase = 'LOBBY'");
  const second = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  assert.notEqual(first, second);
  await db.query("INSERT INTO arcade_round_history (room_id,match_id,user_name,round_num,code,round_score,match_ended_at) VALUES (1,?,'alice',1,'second answer',200,CURRENT_TIMESTAMP)", [second]);
  const history = (await call('/api/arcade/players/alice/history')).body.matches;
  assert.deepEqual(history.map(m => [m.match_id, m.total_score, m.rounds[0].code]), [[second,200,'second answer'],[first,100,'first answer']]);
  const current = (await call('/api/arcade/rooms/1/round-history')).body;
  assert.equal(current.history.length, 1);
  assert.equal(current.history[0].code, 'second answer');
  const old = (await call(`/api/arcade/rooms/1/round-history?match_id=${first}`)).body;
  assert.equal(old.history[0].code, 'first answer');
  await db.query('DELETE FROM arcade_rooms WHERE room_id = 1');
  assert.equal((await call('/api/arcade/players/alice/history')).body.matches.length, 2);
  assert.equal((await call(`/api/arcade/rooms/1/round-history?match_id=${first}`)).body.history[0].code, 'first answer');
});

test('legacy history is migrated once without losing answers or fabricating extra matches', async t => {
  const { migrateArcadeMatches } = require('../arcade/migrate-matches');
  const { call, db } = await arcadeFixture(t, { beforeMigration: async db => {
    await db.query("INSERT INTO arcade_round_history (room_id,user_name,round_num,code,round_score,match_ended_at) VALUES (99,'alice',1,'legacy one',40,'2026-01-01'),(99,'alice',2,'legacy two',50,'2026-01-01'),(100,'alice',1,'unfinished',0,NULL)");
  } });
  const before = (await call('/api/arcade/players/alice/history')).body.matches;
  assert.equal(before.length, 1);
  assert.ok(Number.isInteger(before[0].match_id));
  assert.equal(before[0].total_score, 90);
  assert.deepEqual(before[0].rounds.map(r => r.code), ['legacy one','legacy two']);
  await migrateArcadeMatches(db);
  assert.deepEqual((await call('/api/arcade/players/alice/history')).body.matches, before);
});

test('first migration refuses an active legacy match instead of changing its schema mid-game', async t => {
  await assert.rejects(arcadeFixture(t, { beforeMigration: db => db.query("UPDATE arcade_rooms SET status = 'PLAYING', phase = 'ROUND_1'") }), /active Arcade matches/);
});

test('remain only reopens a settled match for a human member', async t => {
  const { call, db } = await arcadeFixture(t);
  await call('/api/arcade/rooms/1/start', { body: {} });
  assert.equal((await call('/api/arcade/rooms/1/finish-choice', { body: { user_name: 'alice', choice: 'REMAIN' } })).status, 409);
  await db.query("UPDATE arcade_rooms SET phase = 'RESULT'");
  assert.equal((await call('/api/arcade/rooms/1/finish-choice', { body: { choice: 'REMAIN' } })).status, 409);
  await db.query('UPDATE arcade_matches SET ended_at = CURRENT_TIMESTAMP WHERE match_id = (SELECT current_match_id FROM arcade_rooms WHERE room_id = 1)');
  assert.equal((await call('/api/arcade/rooms/1/finish-choice', { user: 'outsider', body: { choice: 'REMAIN' } })).status, 403);
  assert.equal((await call('/api/arcade/rooms/1/finish-choice', { body: { choice: 'REMAIN' } })).status, 200);
  assert.equal((await call('/api/arcade/rooms/1/start', { body: {} })).status, 200);
});

test('failed start rolls back both room state and participant resets', async t => {
  const { call, db } = await arcadeFixture(t);
  await db.query("UPDATE arcade_participants SET score=77, cash=88 WHERE user_name='alice'");
  await db.query(`CREATE FUNCTION reject_reset() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test fault'; END $$`);
  await db.query('CREATE TRIGGER fail_reset BEFORE UPDATE ON arcade_participants FOR EACH ROW EXECUTE FUNCTION reject_reset()');
  // The fault is at the database boundary; assertions still read the public API.
  const failed = await call('/api/arcade/rooms/1/start', { body: {} });
  assert.equal(failed.status, 500);
  assert.equal(typeof failed.body.error, 'string');
  await db.query('DROP TRIGGER fail_reset ON arcade_participants');
  const state = (await call('/api/arcade/rooms/1')).body;
  assert.equal(state.room.status, 'WAITING');
  assert.equal(state.room.current_match_id, null);
  assert.equal(state.participants[0].score, 77);
  assert.equal(state.participants[0].cash, 88);
  assert.equal((await call('/api/arcade/rooms/1/start', { body: {} })).status, 200);
});

test('legacy matches keep their newest-first order after migration', async t => {
  const { call } = await arcadeFixture(t, { beforeMigration: async db => {
    // A hash aggregate is a valid PostgreSQL plan and does not preserve row order.
    await db.query('SET enable_indexscan = off');
    await db.query('SET enable_indexonlyscan = off');
    await db.query('SET enable_sort = off');
    await db.query(`
    INSERT INTO arcade_round_history (room_id,user_name,round_num,code,match_ended_at)
    SELECT n, 'alice', 1, 'legacy answer', '2026-01-01'::timestamp FROM generate_series(100,119) AS n
  `); } });
  const matches = (await call('/api/arcade/players/alice/history?limit=50')).body.matches;
  assert.deepEqual(matches.map(m => m.room_id), [119,118,117,116,115,114,113,112,111,110,109,108,107,106,105,104,103,102,101,100]);
});
