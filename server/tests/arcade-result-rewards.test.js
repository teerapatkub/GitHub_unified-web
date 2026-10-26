const { test } = require('node:test');
const assert = require('node:assert/strict');
const { arcadeFixture } = require('./helpers/arcade-fixture');
const { recordArcadeAchievementRewards } = require('../arcade/match-rewards');

// Spec 0005 ticket 08 (A10): the result screen said "+35 coins" while the
// account gained 385, because two achievements unlocked by the match paid
// +50 and +300 and nothing told the player.

async function endedMatch(t) {
  const fixture = await arcadeFixture(t);
  const { call, db } = fixture;
  const matchId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  const [[alice]] = await db.query("SELECT user_id FROM users WHERE username = 'alice'");
  await db.query("UPDATE arcade_rooms SET status = 'FINISHED', phase = 'RESULT' WHERE room_id = 1");
  await db.query(
    "INSERT INTO arcade_reward_receipts (match_id,user_id,user_name,final_rank,score,cash,coins) VALUES (?,?,'alice',2,900,300,35)",
    [matchId, alice.user_id]
  );
  return { ...fixture, matchId, aliceId: alice.user_id };
}

test('the result poll reports match coins and the achievements the match unlocked', async t => {
  const { call, db, matchId, aliceId } = await endedMatch(t);
  const before = await call('/api/arcade/rooms/1');
  assert.deepEqual(before.body.viewer_reward, { coins: 35, guess_coins: 0, achievements: null });

  await recordArcadeAchievementRewards(db, matchId, aliceId, [
    { code: 'first_arcade', name: 'Arcade ครั้งแรก', reward: 50 },
    { code: 'arcade_top2', name: 'ติดสองอันดับแรก', reward: 300 },
  ]);
  const after = await call('/api/arcade/rooms/1');
  assert.equal(after.body.viewer_reward.coins, 35);
  assert.deepEqual(after.body.viewer_reward.achievements.map(a => [a.name, a.reward]), [
    ['Arcade ครั้งแรก', 50], ['ติดสองอันดับแรก', 300],
  ]);
});

test('a second achievement check for the same match does not overwrite or duplicate the first', async t => {
  const { call, db, matchId, aliceId } = await endedMatch(t);
  await recordArcadeAchievementRewards(db, matchId, aliceId, [{ code: 'first_arcade', name: 'Arcade ครั้งแรก', reward: 50 }]);
  // A retried tick re-evaluates; nothing new unlocks, so it reports [].
  await recordArcadeAchievementRewards(db, matchId, aliceId, []);
  const room = await call('/api/arcade/rooms/1');
  assert.deepEqual(room.body.viewer_reward.achievements.map(a => a.reward), [50]);
});

test('a player only ever sees their own reward', async t => {
  const { call } = await endedMatch(t);
  const bob = await call('/api/arcade/rooms/1', { user: 'bob' });
  assert.equal(bob.body.viewer_reward, null);
});
