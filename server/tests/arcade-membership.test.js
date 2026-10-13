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

test('rematch excludes a human who did not choose to remain', async t => {
  const { call, db } = await arcadeFixture(t);
  await db.query(
    "INSERT INTO arcade_participants (room_id,user_name,participant_kind,bot_profile) VALUES (1,'Bot_ready','bot','balanced')"
  );
  const firstMatch = (await call('/api/arcade/rooms/1/start', { user: 'alice', body: {} })).body.match_id;
  await db.query("UPDATE arcade_matches SET ended_at = CURRENT_TIMESTAMP, final_standings = '[]' WHERE match_id = ?", [firstMatch]);
  await db.query("UPDATE arcade_rooms SET phase = 'RESULT'");

  assert.equal((await call('/api/arcade/rooms/1/finish-choice', {
    user: 'alice', body: { choice: 'REMAIN' }
  })).status, 200);
  assert.equal((await call('/api/arcade/rooms/1/start', { user: 'alice', body: {} })).status, 200);

  const room = (await call('/api/arcade/rooms/1', { user: 'alice' })).body;
  assert.deepEqual(room.participants.map(participant => participant.user_name).sort(), ['Bot_ready', 'alice']);
  const publicRoom = await call('/api/arcade/rooms/1', { user: 'bob' });
  assert.equal(publicRoom.status, 200);
  assert.equal(publicRoom.body.participants.some(participant => participant.user_name === 'bob'), false);
});

test('rematch lobby admits a replacement while an old player has not chosen', async t => {
  const { call, db, addUsers } = await arcadeFixture(t);
  await addUsers(['charlie']);
  await db.query('UPDATE arcade_rooms SET max_players = 2 WHERE room_id = 1');
  const firstMatch = (await call('/api/arcade/rooms/1/start', { user: 'alice', body: {} })).body.match_id;
  await db.query("UPDATE arcade_matches SET ended_at = CURRENT_TIMESTAMP, final_standings = '[]' WHERE match_id = ?", [firstMatch]);
  await db.query("UPDATE arcade_rooms SET phase = 'RESULT' WHERE room_id = 1");

  assert.equal((await call('/api/arcade/rooms/1/finish-choice', {
    user: 'alice', body: { choice: 'REMAIN' }
  })).status, 200);
  const list = await call('/api/arcade/rooms');
  assert.equal(Number(list.body.rooms[0].current_players), 1);
  const waiting = await call('/api/arcade/rooms/1');
  assert.deepEqual(waiting.body.participants.map(player => player.user_name), ['alice']);
  const undecided = await call('/api/arcade/rooms/1', { user: 'bob' });
  assert.equal(undecided.body.viewer_pending_choice, true);
  assert.equal(undecided.body.viewer_participant.user_name, 'bob');
  assert.equal(undecided.body.viewer_participant.match_id, firstMatch);
  assert.equal(undecided.body.participants.some(player => player.user_name === 'bob'), false);

  const joined = await call('/api/arcade/rooms/join', {
    user: 'charlie', body: { room_code_or_id: 'ARC-TEST', user_name: 'charlie' }
  });
  assert.equal(joined.status, 200);
  assert.deepEqual(joined.body.participants.map(player => player.user_name).sort(), ['alice', 'charlie']);
  assert.equal((await call('/api/arcade/rooms/1/finish-choice', {
    user: 'bob', body: { choice: 'REMAIN' }
  })).status, 409);
  assert.equal((await call('/api/arcade/rooms/1/start', { user: 'alice', body: {} })).status, 200);
  const room = (await call('/api/arcade/rooms/1')).body;
  assert.deepEqual(room.participants.map(player => player.user_name).sort(), ['alice', 'charlie']);
  const formerPlayer = await call('/api/arcade/rooms/1', { user: 'bob' });
  assert.equal(formerPlayer.body.viewer_pending_choice, false);
  assert.equal(formerPlayer.body.viewer_participant, null);
});

test('first rematch volunteer becomes host when former host has not stayed', async t => {
  const { call, db } = await arcadeFixture(t);
  const matchId = (await call('/api/arcade/rooms/1/start', { user: 'alice', body: {} })).body.match_id;
  await db.query("UPDATE arcade_matches SET ended_at = CURRENT_TIMESTAMP, final_standings = '[]' WHERE match_id = ?", [matchId]);
  await db.query("UPDATE arcade_rooms SET phase = 'RESULT' WHERE room_id = 1");
  assert.equal((await call('/api/arcade/rooms/1/finish-choice', {
    user: 'bob', body: { choice: 'REMAIN' }
  })).status, 200);
  const room = (await call('/api/arcade/rooms/1', { user: 'bob' })).body;
  assert.equal(room.room.host_name, 'bob');
  assert.deepEqual(room.participants.map(player => player.user_name), ['bob']);
});

test('rematch host cannot hand the lobby to a player who has not chosen to stay', async t => {
  const { call, db } = await arcadeFixture(t);
  const matchId = (await call('/api/arcade/rooms/1/start', { user: 'alice', body: {} })).body.match_id;
  await db.query('UPDATE arcade_matches SET ended_at = CURRENT_TIMESTAMP WHERE match_id = ?', [matchId]);
  await db.query("UPDATE arcade_rooms SET phase = 'RESULT' WHERE room_id = 1");
  assert.equal((await call('/api/arcade/rooms/1/finish-choice', { user: 'alice', body: { choice: 'REMAIN' } })).status, 200);
  assert.equal((await call('/api/arcade/rooms/1/transfer-host', {
    user: 'alice', body: { target_user_name: 'bob' }
  })).status, 400);
  const room = (await call('/api/arcade/rooms/1', { user: 'alice' })).body;
  assert.equal(room.room.host_name, 'alice');
});

test('pending rematch member can still choose after the former host leaves', async t => {
  const { call, db } = await arcadeFixture(t);
  const matchId = (await call('/api/arcade/rooms/1/start', { user: 'alice', body: {} })).body.match_id;
  await db.query("UPDATE arcade_matches SET ended_at = CURRENT_TIMESTAMP WHERE match_id = ?", [matchId]);
  await db.query("UPDATE arcade_rooms SET phase = 'RESULT' WHERE room_id = 1");
  assert.equal((await call('/api/arcade/rooms/1/finish-choice', { user: 'alice', body: { choice: 'REMAIN' } })).status, 200);
  assert.equal((await call('/api/arcade/rooms/1/leave', { user: 'alice', body: {} })).status, 200);
  assert.equal((await call('/api/arcade/rooms/1/finish-choice', { user: 'bob', body: { choice: 'REMAIN' } })).status, 200);
  const room = (await call('/api/arcade/rooms/1', { user: 'bob' })).body;
  assert.equal(room.room.host_name, 'bob');
  assert.deepEqual(room.participants.map(player => player.user_name), ['bob']);
});

test('new entrant becomes lobby host while former players are still deciding', async t => {
  const { call, db, addUsers } = await arcadeFixture(t);
  await addUsers(['charlie']);
  const matchId = (await call('/api/arcade/rooms/1/start', { user: 'alice', body: {} })).body.match_id;
  await db.query("UPDATE arcade_matches SET ended_at = CURRENT_TIMESTAMP WHERE match_id = ?", [matchId]);
  await db.query("UPDATE arcade_rooms SET phase = 'RESULT' WHERE room_id = 1");
  assert.equal((await call('/api/arcade/rooms/1/finish-choice', { user: 'alice', body: { choice: 'REMAIN' } })).status, 200);
  assert.equal((await call('/api/arcade/rooms/1/leave', { user: 'alice', body: {} })).status, 200);
  const joined = await call('/api/arcade/rooms/join', {
    user: 'charlie', body: { room_code_or_id: 'ARC-TEST', user_name: 'charlie' }
  });
  assert.equal(joined.status, 200);
  assert.equal(joined.body.room.host_name, 'charlie');
  assert.deepEqual(joined.body.participants.map(player => player.user_name), ['charlie']);
  assert.equal((await call('/api/arcade/rooms/1/finish-choice', { user: 'bob', body: { choice: 'REMAIN' } })).status, 200);
  const room = (await call('/api/arcade/rooms/1', { user: 'charlie' })).body;
  assert.equal(room.room.host_name, 'charlie');
});

test('remain, leave and start retries keep one two-seat rematch and its old result', async t => {
  const { call, db, addUsers } = await arcadeFixture(t);
  await addUsers(['charlie']);
  await db.query('UPDATE arcade_rooms SET max_players = 2 WHERE room_id = 1');
  const firstMatch = (await call('/api/arcade/rooms/1/start', { user: 'alice', body: {} })).body.match_id;
  await db.query(
    `INSERT INTO arcade_round_history (room_id,match_id,user_name,round_num,code,round_score,match_ended_at)
     VALUES (1,?,'alice',1,'old answer',42,CURRENT_TIMESTAMP)`, [firstMatch]
  );
  await db.query("UPDATE arcade_matches SET ended_at = CURRENT_TIMESTAMP, final_standings = '[]' WHERE match_id = ?", [firstMatch]);
  await db.query("UPDATE arcade_rooms SET phase = 'RESULT' WHERE room_id = 1");

  for (let attempt = 0; attempt < 2; attempt++) {
    assert.equal((await call('/api/arcade/rooms/1/finish-choice', {
      user: 'alice', body: { choice: 'REMAIN' }
    })).status, 200);
  }
  assert.equal((await call('/api/arcade/rooms/1/finish-choice', {
    user: 'bob', body: { choice: 'LEAVE' }
  })).status, 200);
  assert.equal((await call('/api/arcade/rooms/1/leave', { user: 'bob', body: {} })).status, 200);
  assert.equal((await call('/api/arcade/rooms/join', {
    user: 'charlie', body: { room_code_or_id: 'ARC-TEST', user_name: 'charlie' }
  })).status, 200);
  const started = await call('/api/arcade/rooms/1/start', { user: 'alice', body: {} });
  assert.equal(started.status, 200);
  assert.equal((await call('/api/arcade/rooms/1/start', { user: 'alice', body: {} })).status, 409);
  const state = (await call('/api/arcade/rooms/1', { user: 'charlie' })).body;
  assert.notEqual(state.room.current_match_id, firstMatch);
  assert.equal(state.room.current_match_id, started.body.match_id);
  assert.deepEqual(state.participants.map(player => player.user_name).sort(), ['alice', 'charlie']);
  const history = (await call('/api/arcade/players/alice/history', { user: 'alice' })).body.matches;
  assert.equal(history.find(match => match.match_id === firstMatch).rounds[0].code, 'old answer');
  const [[oldMatch]] = await db.query('SELECT ended_at FROM arcade_matches WHERE match_id = ?', [firstMatch]);
  assert.ok(oldMatch.ended_at);
});
