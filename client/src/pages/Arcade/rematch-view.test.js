import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roomViewForPlayer } from './rematch-view.js';

test('a pending rematch player keeps their result and reward after the lobby reopens', () => {
  const view = roomViewForPlayer({
    room: { phase: 'LOBBY' },
    participants: [{ user_name: 'alice' }],
    viewer_pending_choice: true,
    viewer_participant: { user_name: 'bob', coins_awarded: 12 }
  }, 'bob');
  assert.equal(view.phase, 'RESULT');
  assert.equal(view.isMember, true);
  assert.equal(view.participants.find(player => player.user_name === 'bob').coins_awarded, 12);
});

test('a player removed when the rematch starts is no longer treated as a room member', () => {
  const view = roomViewForPlayer({
    room: { phase: 'ROUND_1' }, participants: [{ user_name: 'alice' }],
    viewer_pending_choice: false, viewer_participant: null
  }, 'bob');
  assert.equal(view.isMember, false);
});
