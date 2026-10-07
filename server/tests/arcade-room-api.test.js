const { test } = require('node:test');
const assert = require('node:assert/strict');
const { arcadeFixture } = require('./helpers/arcade-fixture');

test('room state never exposes drafts or submitted answers, even to a submitted viewer', async t => {
  const { call, db } = await arcadeFixture(t);
  await db.query("UPDATE arcade_participants SET has_submitted = 1, submitted_code = 'locked secret' WHERE user_name = 'bob'");
  const state = await call('/api/arcade/rooms/1');
  assert.equal(state.status, 200);
  for (const player of state.body.participants) {
    assert.equal(Object.hasOwn(player, 'draft_code'), false);
    assert.equal(Object.hasOwn(player, 'submitted_code'), false);
  }
  assert.equal((await call('/api/arcade/rooms/1', { user: null })).status, 401);
});

test('code access uses the signed-in member and preserves self, submitted and eliminated spectator rights', async t => {
  const { call, db } = await arcadeFixture(t);
  assert.equal((await call('/api/arcade/rooms/1/code/alice')).body.code, 'alice draft');
  assert.equal((await call('/api/arcade/rooms/1/code/bob')).status, 403);
  assert.equal((await call('/api/arcade/rooms/1/code/bob?viewer=bob')).status, 403);
  assert.equal((await call('/api/arcade/rooms/1/code/bob', { user: 'outsider' })).status, 404);
  await db.query("UPDATE arcade_participants SET has_submitted = 1, submitted_code = 'alice locked' WHERE user_name = 'alice'");
  assert.equal((await call('/api/arcade/rooms/1/code/alice')).body.code, 'alice locked');
  assert.equal((await call('/api/arcade/rooms/1/code/bob')).body.code, 'bob secret');
  await db.query("UPDATE arcade_participants SET has_submitted = 0, is_eliminated = 1 WHERE user_name = 'alice'");
  assert.equal((await call('/api/arcade/rooms/1/code/bob')).body.code, 'bob secret');
});

test('personal history cannot be used as an opponent answer key', async t => {
  const { call, db } = await arcadeFixture(t);
  const matchId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  await db.query("INSERT INTO arcade_round_history (room_id,match_id,user_name,round_num,code,match_ended_at) VALUES (1,?,'bob',1,'historic secret',CURRENT_TIMESTAMP)", [matchId]);
  assert.equal((await call('/api/arcade/players/bob/history')).status, 403);
  assert.equal((await call('/api/arcade/rooms/1/round-history?user_name=bob')).status, 403);
  const own = await call('/api/arcade/players/bob/history', { user: 'bob' });
  assert.equal(own.body.matches[0].rounds[0].code, 'historic secret');
});
