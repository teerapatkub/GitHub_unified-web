// Spectators who are out of a match (Spec 0005 #24): live status of the
// survivors, one guess of the last survivor, cheers.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { arcadeFixture } = require('./helpers/arcade-fixture');
const { settleArcadeRewards } = require('../arcade/match-rewards');
const config = require('../../shared/arcadeConfig.json');

const SOLUTION = 'def sum_to_n(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total';
const CASES = [{ args: [3], expected: 6 }, { args: [1], expected: 1 }, { args: [0], expected: 0 }, { args: [4], expected: 10 }];

// alice and dave still in, bob and carol out, round 3 under way.
async function spectatedMatch(t) {
  const f = await arcadeFixture(t);
  const { db, call, addUsers } = f;
  await addUsers(['carol', 'dave']);
  for (const user of ['carol', 'dave']) {
    assert.equal((await call('/api/arcade/rooms/join', { user, body: { room_code_or_id: 'ARC-TEST', user_name: user } })).status, 200);
  }
  await db.query('INSERT INTO problems (problem_id, test_kind, test_cases, solution_code, starter_code) VALUES (1, ?, ?, ?, ?)',
    ['function', JSON.stringify(CASES), SOLUTION, SOLUTION.replace('total += i', 'pass')]);
  await db.query("INSERT INTO problem_modes (mode, entry_id, problem_id, difficulty) VALUES ('arcade', 1, 1, 'easy')");
  const matchId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  await db.query(`UPDATE arcade_rooms SET phase = 'ROUND_3', round_task_ids = '[1,1,1,1]', round_kinds = '["write","write","write","write"]',
    phase_deadline = clock_timestamp() + INTERVAL '50 seconds'`);
  await db.query("UPDATE arcade_participants SET is_eliminated = 1 WHERE user_name IN ('bob', 'carol')");
  await db.query("UPDATE arcade_participants SET score = CASE user_name WHEN 'alice' THEN 900 WHEN 'dave' THEN 400 ELSE 100 END");
  return { ...f, matchId };
}

test('only a player who is out can watch the survivors, and never sees their code', async t => {
  const { call, matchId } = await spectatedMatch(t);
  await call('/api/arcade/rooms/1/submit-round', { body: { match_id: matchId, round_num: 3, code: SOLUTION } });
  assert.equal((await call('/api/arcade/rooms/1/spectate')).status, 403);
  assert.equal((await call('/api/arcade/rooms/1/spectate', { user: 'dave' })).status, 403);
  const watched = await call('/api/arcade/rooms/1/spectate', { user: 'bob' });
  assert.equal(watched.status, 200);
  assert.deepEqual(watched.body.survivors.map(s => s.name), ['alice', 'dave']);
  const alice = watched.body.survivors[0];
  assert.equal(alice.submitted, true);
  assert.deepEqual(alice.tests, { passed: 4, total: 4 });
  assert.equal(watched.body.survivors[1].tests, null);
  const text = JSON.stringify(watched.body);
  assert.ok(!text.includes('total += i') && !text.includes('submitted_code') && !text.includes('"code"'));
});

test('a spectator guesses once, only someone still in, and only before the final', async t => {
  const { db, call, matchId } = await spectatedMatch(t);
  const guess = (guessed_name, user = 'bob') => call('/api/arcade/rooms/1/guess', { user, body: { match_id: matchId, guessed_name } });
  assert.equal((await guess('carol')).status, 400);
  assert.equal((await guess('nobody')).status, 400);
  assert.equal((await guess('alice', 'dave')).status, 403);
  assert.equal((await guess('alice')).status, 200);
  assert.equal((await guess('dave')).status, 409);
  assert.equal((await call('/api/arcade/rooms/1/spectate', { user: 'bob' })).body.guess, 'alice');
  await db.query("UPDATE arcade_rooms SET phase = 'ROUND_4'");
  assert.equal((await guess('dave', 'carol')).status, 409);
});

test('a right guess pays once at settlement, a wrong one pays nothing, and no player is touched', async t => {
  const { db, call, matchId } = await spectatedMatch(t);
  await call('/api/arcade/rooms/1/guess', { user: 'bob', body: { match_id: matchId, guessed_name: 'alice' } });
  await call('/api/arcade/rooms/1/guess', { user: 'carol', body: { match_id: matchId, guessed_name: 'dave' } });
  const wallet = async name => (await db.query('SELECT virtual_currency FROM users WHERE username = ?', [name]))[0][0].virtual_currency;
  const before = Object.fromEntries(await Promise.all(['alice', 'bob', 'carol', 'dave'].map(async n => [n, await wallet(n)])));
  const [[room]] = await db.query('SELECT * FROM arcade_rooms WHERE room_id = 1');
  for (let i = 0; i < 2; i++) {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    await settleArcadeRewards(connection, room);
    await connection.commit();
    connection.release();
  }
  const [receipts] = await db.query('SELECT user_name, coins, guess_coins FROM arcade_reward_receipts WHERE match_id = ? ORDER BY user_name', [matchId]);
  const byName = Object.fromEntries(receipts.map(r => [r.user_name, r]));
  assert.equal(byName.bob.guess_coins, config.spectatorGuessReward);
  assert.equal(byName.carol.guess_coins, 0);
  assert.equal(await wallet('bob') - before.bob, byName.bob.coins + config.spectatorGuessReward);
  assert.equal(await wallet('carol') - before.carol, byName.carol.coins);
  // The guess changes nobody's match: alice and dave get exactly their rank's coins.
  assert.equal(byName.alice.guess_coins, 0);
  assert.equal(await wallet('alice') - before.alice, byName.alice.coins);
  const reward = (await call('/api/arcade/rooms/1', { user: 'bob' })).body.viewer_reward;
  assert.equal(reward.guess_coins, config.spectatorGuessReward);
});

test('a spectator can cheer during a round, but not faster than the limit, and a survivor cannot', async t => {
  const { call } = await spectatedMatch(t);
  assert.equal((await call('/api/arcade/rooms/1/cheer', { user: 'bob', body: { emoji: '🔥' } })).status, 200);
  assert.equal((await call('/api/arcade/rooms/1/cheer', { user: 'bob', body: { emoji: '👏' } })).status, 429);
  assert.equal((await call('/api/arcade/rooms/1/cheer', { user: 'carol', body: { emoji: '💩' } })).status, 400);
  assert.equal((await call('/api/arcade/rooms/1/cheer', { body: { emoji: '🔥' } })).status, 403);
});
