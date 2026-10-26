import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newRoomForm, hasSavedActiveRoom } from './roomForms.js';

// Bug A9: the reset after creating a room dropped two of the five fields.
test('every create-room form starts with all six fields, including pacing, difficulty and round format', () => {
  const form = newRoomForm();
  assert.deepEqual(Object.keys(form).sort(), ['difficulty', 'max_players', 'password', 'room_name', 'round_duration_mode', 'round_format']);
  assert.equal(form.round_duration_mode, 'standard');
  assert.equal(form.difficulty, 'default');
  assert.equal(form.round_format, 'mixed');
});

test('each call is a fresh object, so a reset never shares state with the last room', () => {
  const first = newRoomForm();
  first.room_name = 'typed';
  assert.equal(newRoomForm().room_name, '');
});

test('a saved active room is detected, and junk in storage is not', () => {
  const storage = (value) => ({ getItem: () => value });
  assert.equal(hasSavedActiveRoom(storage('{"room_id":12,"room_code":"ARC-AAAA"}'), 'k'), true);
  assert.equal(hasSavedActiveRoom(storage(null), 'k'), false);
  assert.equal(hasSavedActiveRoom(storage('{not json'), 'k'), false);
});
