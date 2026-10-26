import test from 'node:test';
import assert from 'node:assert/strict';
import { nextRoundKind, playingRound, roundKindLabelKey, roundKindOf } from './roundKinds.js';

const room = phase => ({ phase, round_kinds: ['write', 'write', 'fix', 'write'] });

test('a room without round kinds, or with an unknown one, plays write', () => {
  assert.equal(roundKindOf({}, 3), 'write');
  assert.equal(roundKindOf({ round_kinds: null }, 1), 'write');
  assert.equal(roundKindOf({ round_kinds: ['dance'] }, 1), 'write');
  assert.equal(roundKindOf(room('ROUND_3'), 3), 'fix');
});

test('between rounds the next round kind is known; during a round it is not', () => {
  assert.equal(nextRoundKind(room('SUMMARY_2')), 'fix');
  assert.equal(nextRoundKind(room('SHOP_2')), 'fix');
  assert.equal(nextRoundKind(room('SHOP_3')), 'write');
  assert.equal(nextRoundKind(room('ROUND_2')), null);
  assert.equal(nextRoundKind(room('LOBBY')), null);
});

test('the round being played comes from the phase', () => {
  assert.equal(playingRound('ROUND_3'), 3);
  assert.equal(playingRound('SHOP_3'), 0);
  assert.equal(playingRound(undefined), 0);
});

test('every kind has a label key', () => {
  assert.equal(roundKindLabelKey('fix'), 'roundKindFix');
  assert.equal(roundKindLabelKey('unknown'), 'roundKindWrite');
});
