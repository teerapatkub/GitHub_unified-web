const { test } = require('node:test');
const assert = require('node:assert/strict');
const { arcadeFixture } = require('./helpers/arcade-fixture');
const { createArcadePhaseFinalizer } = require('../arcade/phase-finalizer');

async function finishableMatch(db, call, roomId = 1) {
  const start = await call(`/api/arcade/rooms/${roomId}/start`, { body: {} });
  assert.equal(start.status, 200);
  await db.query("UPDATE arcade_participants SET score = CASE WHEN user_name = 'alice' THEN 500 ELSE 100 END WHERE room_id = ?", [roomId]);
  await db.query("UPDATE arcade_rooms SET phase = 'ROUND_2', phase_deadline = CURRENT_TIMESTAMP - INTERVAL '1 second' WHERE room_id = ?", [roomId]);
  return (await call(`/api/arcade/rooms/${roomId}`)).body.room;
}

test('finishing a match pays each account once despite concurrent and repeated workers', async t => {
  const { db, call } = await arcadeFixture(t);
  const room = await finishableMatch(db, call);
  const first = createArcadePhaseFinalizer({ db });
  const restarted = createArcadePhaseFinalizer({ db });
  await Promise.all([first(room), restarted(room)]);
  await restarted(room);
  assert.equal((await call('/api/auth/me')).body.virtual_currency, 50);
  assert.equal((await call('/api/auth/me', { user: 'bob' })).body.virtual_currency, 35);
  const state = (await call('/api/arcade/rooms/1')).body;
  assert.equal(state.room.phase, 'RESULT');
  assert.deepEqual(state.participants.map(p => p.coins_awarded), [50, 35]);
});

test('wallet, career statistics and match completion roll back together before a retry', async t => {
  const { db, call } = await arcadeFixture(t);
  const room = await finishableMatch(db, call);
  await db.query(`CREATE FUNCTION reject_stats() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'stats unavailable'; END $$`);
  await db.query('CREATE TRIGGER fail_stats BEFORE INSERT ON arcade_player_stats FOR EACH ROW EXECUTE FUNCTION reject_stats()');
  const finalize = createArcadePhaseFinalizer({ db });
  await assert.rejects(finalize(room), /stats unavailable/);
  assert.equal((await call('/api/auth/me')).body.virtual_currency, 0);
  assert.equal((await call('/api/arcade/rooms/1')).body.room.phase, 'ROUND_2');
  assert.equal((await call('/api/arcade/players/alice/stats')).body.stats.matches_played, 0);
  await db.query('DROP TRIGGER fail_stats ON arcade_player_stats');
  await createArcadePhaseFinalizer({ db })(room);
  await finalize(room);
  assert.equal((await call('/api/auth/me')).body.virtual_currency, 50);
  assert.deepEqual((await call('/api/arcade/players/alice/stats')).body.stats,
    { user_name: 'alice', matches_played: 1, wins: 1, best_rank: 1, total_score: 500, total_cash_earned: 500 });
  assert.deepEqual((await call('/api/arcade/players/bob/stats')).body.stats,
    { user_name: 'bob', matches_played: 1, wins: 0, best_rank: 2, total_score: 100, total_cash_earned: 400 });
});

test('final standings include bots and break tied scores consistently without paying bots', async t => {
  const { db, call } = await arcadeFixture(t);
  await db.query("INSERT INTO users (username) VALUES ('Bot_Test')");
  await db.query("INSERT INTO arcade_participants (room_id, user_name, participant_kind, bot_profile) VALUES (1, 'Bot_Test', 'bot', 'bot_pyninja')");
  const room = await finishableMatch(db, call);
  // An already-eliminated bot has a fixed score, so no synthetic random score is involved.
  await db.query("UPDATE arcade_participants SET score = CASE WHEN user_name = 'Bot_Test' THEN 1000 ELSE 500 END, is_eliminated = CASE WHEN user_name = 'Bot_Test' THEN 1 ELSE 0 END");
  await createArcadePhaseFinalizer({ db })(room);
  const state = (await call('/api/arcade/rooms/1')).body;
  assert.deepEqual(state.room.final_standings.map(p => [p.name, p.rank, p.coins]),
    [['Bot_Test', 1, 0], ['alice', 2, 35], ['bob', 3, 25]]);
  assert.equal((await call('/api/arcade/players/Bot_Test/stats')).body.stats.matches_played, 0);
  assert.equal((await call('/api/arcade/players/alice/stats')).body.stats.wins, 0);
  assert.equal((await call('/api/auth/me')).body.virtual_currency, 35);
  assert.equal((await call('/api/auth/me', { user: 'bob' })).body.virtual_currency, 25);
});

test('a fault paying the second account leaves no partial payout or completed history', async t => {
  const { db, call } = await arcadeFixture(t);
  const room = await finishableMatch(db, call);
  await db.query("INSERT INTO arcade_round_history (room_id,match_id,user_name,round_num,code) VALUES (1,?,'alice',1,'saved answer')", [room.current_match_id]);
  await db.query(`CREATE FUNCTION reject_bob_wallet() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.username = 'bob' THEN RAISE EXCEPTION 'wallet unavailable'; END IF; RETURN NEW; END $$`);
  await db.query('CREATE TRIGGER fail_wallet BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION reject_bob_wallet()');
  await assert.rejects(createArcadePhaseFinalizer({ db })(room), /wallet unavailable/);
  assert.equal((await call('/api/auth/me')).body.virtual_currency, 0);
  assert.equal((await call('/api/arcade/players/alice/stats')).body.stats.matches_played, 0);
  assert.deepEqual((await call('/api/arcade/players/alice/history')).body.matches, []);
  const failed = (await call('/api/arcade/rooms/1')).body;
  assert.equal(failed.room.phase, 'ROUND_2');
  assert.equal(failed.room.final_standings, null);
  assert.ok(failed.participants.every(p => p.coins_awarded === 0));
  await db.query('DROP TRIGGER fail_wallet ON users');
  await createArcadePhaseFinalizer({ db })(room);
  assert.equal((await call('/api/auth/me')).body.virtual_currency, 50);
  assert.equal((await call('/api/arcade/players/alice/history')).body.matches.length, 1);
});

test('rematches pay separately and retain rewards after players leave and the room is deleted', async t => {
  const { db, call } = await arcadeFixture(t);
  const first = await finishableMatch(db, call);
  await createArcadePhaseFinalizer({ db })(first);
  assert.equal((await call('/api/arcade/rooms/1/finish-choice', { body: { choice: 'REMAIN' } })).status, 200);
  const second = await finishableMatch(db, call);
  await createArcadePhaseFinalizer({ db })(first);
  assert.equal((await call('/api/auth/me')).body.virtual_currency, 50);
  await createArcadePhaseFinalizer({ db })(second);
  assert.equal((await call('/api/auth/me')).body.virtual_currency, 100);
  assert.equal((await call('/api/arcade/players/alice/stats')).body.stats.matches_played, 2);
  await db.query('DELETE FROM arcade_rooms WHERE room_id = 1');
  await require('../arcade/migrate-rewards').migrateArcadeRewards(db);
  await createArcadePhaseFinalizer({ db })(second);
  assert.equal((await call('/api/auth/me')).body.virtual_currency, 100);
  assert.equal((await call('/api/auth/me', { user: 'bob' })).body.virtual_currency, 70);
  assert.equal((await call('/api/arcade/players/alice/stats')).body.stats.wins, 2);
});

test('separate matches for the same accounts settle concurrently without lost credits', async t => {
  const { db, call } = await arcadeFixture(t);
  const first = await finishableMatch(db, call);
  await db.query("INSERT INTO arcade_rooms (room_code,host_name) VALUES ('SECOND','alice')");
  await db.query("INSERT INTO arcade_participants (room_id,user_name,is_host) VALUES (2,'bob',0),(2,'alice',1)");
  const second = await finishableMatch(db, call, 2);
  await Promise.all([first, second].map(room => createArcadePhaseFinalizer({ db })(room)));
  assert.equal((await call('/api/auth/me')).body.virtual_currency, 100);
  assert.equal((await call('/api/auth/me', { user: 'bob' })).body.virtual_currency, 70);
  assert.equal((await call('/api/arcade/players/alice/stats')).body.stats.matches_played, 2);
});

test('a post-commit hook failure and a restarted ticker cannot repay a completed match', async t => {
  const { settleDueArcadeRooms } = require('../arcade/match-ticker');
  const { db, call } = await arcadeFixture(t);
  await finishableMatch(db, call);
  const failures = await settleDueArcadeRooms({ db, afterMatchSettled: async () => { throw new Error('post-commit interruption'); } });
  assert.equal(failures.length, 1);
  assert.equal((await call('/api/arcade/rooms/1')).body.room.phase, 'RESULT');
  await settleDueArcadeRooms({ db });
  assert.equal((await call('/api/auth/me')).body.virtual_currency, 50);
  assert.equal((await call('/api/arcade/players/alice/stats')).body.stats.matches_played, 1);
});
