import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSpectating } from './spectatorView.js';
// constants.js imports arcadeConfig.json, which plain node cannot load without
// an import attribute, so the phase names are spelled out here.
const PHASES = { LOBBY: 'LOBBY', ROUND_2: 'ROUND_2', SUMMARY_2: 'SUMMARY_2', SHOP_2: 'SHOP_2', ROUND_3: 'ROUND_3', ROUND_4: 'ROUND_4', RESULT: 'RESULT' };

test('an eliminated player spectates through rounds, summaries and the shop', () => {
  for (const phase of [PHASES.ROUND_2, PHASES.SUMMARY_2, PHASES.SHOP_2, PHASES.ROUND_4]) {
    assert.equal(isSpectating({ phase, eliminated: true }), true, phase);
  }
});

// Bug A3: the badge stayed on the result screen and in the lobby.
test('nobody is a spectator once the match is over or back in the lobby', () => {
  assert.equal(isSpectating({ phase: PHASES.RESULT, eliminated: true }), false);
  assert.equal(isSpectating({ phase: PHASES.LOBBY, eliminated: true }), false);
});

test('a player still in the match is never a spectator', () => {
  assert.equal(isSpectating({ phase: PHASES.ROUND_3, eliminated: false }), false);
});
