import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resultCoinBreakdown } from './resultReward.js';

// The user-test case: +35 from the match, +50 and +300 from achievements.
test('the total is match coins plus every achievement the match unlocked', () => {
  const breakdown = resultCoinBreakdown(
    { coins: 35, achievements: [{ name: 'A', reward: 50 }, { name: 'B', reward: 300 }] },
    { coins_awarded: 35 }
  );
  assert.equal(breakdown.matchCoins, 35);
  assert.deepEqual(breakdown.achievements, [{ name: 'A', reward: 50 }, { name: 'B', reward: 300 }]);
  assert.equal(breakdown.total, 385);
  assert.equal(breakdown.achievementsPending, false);
});

test('before the receipt arrives the participant row is used and nothing is pending', () => {
  assert.deepEqual(resultCoinBreakdown(null, { coins_awarded: 40 }), { matchCoins: 40, guessCoins: 0, achievements: [], total: 40, achievementsPending: false });
});

test('a receipt whose achievement check has not run yet is marked pending', () => {
  assert.equal(resultCoinBreakdown({ coins: 35, achievements: null }, null).achievementsPending, true);
});

test('achievements that pay no coins (picture rewards) are not listed as gold', () => {
  assert.deepEqual(resultCoinBreakdown({ coins: 0, achievements: [{ name: 'Pic', reward: 0 }] }, null).achievements, []);
});

test('a right guess of the last survivor is added to the total', () => {
  const breakdown = resultCoinBreakdown({ coins: 10, guess_coins: 30, achievements: [] }, null);
  assert.equal(breakdown.guessCoins, 30);
  assert.equal(breakdown.total, 40);
});
