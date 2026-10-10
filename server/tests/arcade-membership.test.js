const { test } = require('node:test');
const assert = require('node:assert/strict');
const { arcadeFixture } = require('./helpers/arcade-fixture');

test('leaving uses the authenticated member and transfers host to the oldest remaining human', async t => {
  const { call, db } = await arcadeFixture(t);
  await db.query(
    `INSERT INTO arcade_participants (room_id, user_name, participant_kind, bot_profile, joined_at)
     VALUES (1, 'Bot_first', 'bot', 'balanced', CURRENT_TIMESTAMP - INTERVAL '1 hour')`
  );

  const forged = await call('/api/arcade/rooms/1/leave', {
    user: 'alice',
    body: { user_name: 'bob' }
  });
  assert.equal(forged.status, 403);
  const beforeLeave = (await call('/api/arcade/rooms/1', { user: 'alice' })).body;
  assert.deepEqual(beforeLeave.participants.map(p => p.user_name).sort(), ['Bot_first', 'alice', 'bob']);

  const left = await call('/api/arcade/rooms/1/leave', { user: 'alice', body: {} });
  assert.equal(left.status, 200);
  const state = (await call('/api/arcade/rooms/1', { user: 'bob' })).body;
  assert.deepEqual(state.participants.map(p => p.user_name).sort(), ['Bot_first', 'bob']);
  assert.equal(state.room.host_name, 'bob');
  assert.equal(state.participants.find(p => p.user_name === 'bob').is_host, 1);
  assert.equal(state.participants.find(p => p.user_name === 'Bot_first').is_host, 0);
});

test('the room closes when its final human leaves even if bots remain', async t => {
  const { call, db } = await arcadeFixture(t);
  await db.query("INSERT INTO arcade_participants (room_id,user_name,participant_kind,bot_profile) VALUES (1,'Bot_only','bot','balanced')");
  assert.equal((await call('/api/arcade/rooms/1/leave', { user: 'alice', body: {} })).status, 200);
  assert.equal((await call('/api/arcade/rooms/1/leave', { user: 'bob', body: {} })).status, 200);
  assert.equal((await call('/api/arcade/rooms/1', { user: 'outsider' })).status, 404);
});

test('only the authenticated human host can transfer the room to another human', async t => {
  const { call, db } = await arcadeFixture(t);
  await db.query("INSERT INTO arcade_participants (room_id,user_name,participant_kind,bot_profile) VALUES (1,'Bot_target','bot','balanced')");

  assert.equal((await call('/api/arcade/rooms/1/transfer-host', {
    user: 'bob', body: { current_host: 'alice', target_user_name: 'bob' }
  })).status, 403);
  assert.equal((await call('/api/arcade/rooms/1/transfer-host', {
    user: 'alice', body: { current_host: 'alice', target_user_name: 'Bot_target' }
  })).status, 400);
  assert.equal((await call('/api/arcade/rooms/1/transfer-host', {
    user: 'alice', body: { target_user_name: 'bob' }
  })).status, 200);

  const state = (await call('/api/arcade/rooms/1', { user: 'bob' })).body;
  assert.equal(state.room.host_name, 'bob');
  assert.deepEqual(
    state.participants.filter(p => Number(p.is_host) === 1).map(p => p.user_name),
    ['bob']
  );
});

test('a failed leave rolls back membership and host ownership together', async t => {
  const { call, db } = await arcadeFixture(t);
  await db.query(`CREATE FUNCTION reject_host_change() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN RAISE EXCEPTION 'test fault'; END $$`);
  await db.query('CREATE TRIGGER fail_host_change BEFORE UPDATE ON arcade_rooms FOR EACH ROW EXECUTE FUNCTION reject_host_change()');

  assert.equal((await call('/api/arcade/rooms/1/leave', { user: 'alice', body: {} })).status, 500);
  await db.query('DROP TRIGGER fail_host_change ON arcade_rooms');
  const state = (await call('/api/arcade/rooms/1', { user: 'alice' })).body;
  assert.equal(state.room.host_name, 'alice');
  assert.deepEqual(state.participants.map(p => p.user_name).sort(), ['alice', 'bob']);
  assert.equal(state.participants.find(p => p.user_name === 'alice').is_host, 1);
});

test('rematch keeps the settled result and cannot be reset after the next match starts', async t => {
  const { call, db } = await arcadeFixture(t);
  const firstMatch = (await call('/api/arcade/rooms/1/start', { user: 'alice', body: {} })).body.match_id;
  await db.query(
    `INSERT INTO arcade_round_history
      (room_id,match_id,user_name,round_num,code,round_score,match_ended_at)
     VALUES (1,?,'alice',1,'first result',123,CURRENT_TIMESTAMP)`,
    [firstMatch]
  );
  await db.query("UPDATE arcade_matches SET ended_at = CURRENT_TIMESTAMP, final_standings = '[]' WHERE match_id = ?", [firstMatch]);
  await db.query("UPDATE arcade_rooms SET phase = 'RESULT'");
  await db.query("UPDATE arcade_participants SET score = 55, cash = 44, is_eliminated = 1 WHERE user_name = 'bob'");

  assert.equal((await call('/api/arcade/rooms/1/finish-choice', { user: 'alice', body: { choice: 'REMAIN' } })).status, 200);
  assert.equal((await call('/api/arcade/rooms/1/finish-choice', { user: 'bob', body: { choice: 'REMAIN' } })).status, 200);
  const waiting = (await call('/api/arcade/rooms/1', { user: 'bob' })).body;
  const bob = waiting.participants.find(participant => participant.user_name === 'bob');
  assert.deepEqual([bob.score, bob.cash, bob.is_eliminated], [0, 0, 0]);
  const secondMatch = (await call('/api/arcade/rooms/1/start', { user: 'alice', body: {} })).body.match_id;
  assert.notEqual(secondMatch, firstMatch);
  assert.equal((await call('/api/arcade/rooms/1/finish-choice', { user: 'alice', body: { choice: 'REMAIN' } })).status, 409);

  const matches = (await call('/api/arcade/players/alice/history', { user: 'alice' })).body.matches;
  assert.equal(matches.find(match => match.match_id === firstMatch).rounds[0].code, 'first result');
});
