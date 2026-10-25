const { test } = require('node:test');
const assert = require('node:assert/strict');
const { arcadeFixture } = require('./helpers/arcade-fixture');

// Spec 0005 tickets 01–02: the host's settings form must never silently turn a
// private room public, and max_players can never drop below who is already in.

async function privateRoom(t) {
  const fixture = await arcadeFixture(t);
  const set = await fixture.call('/api/arcade/rooms/1/settings', { body: { host_name: 'alice', password: 'secret1' } });
  assert.equal(set.status, 200);
  return fixture;
}

async function bobCanJoinWith(call, password) {
  await call('/api/arcade/rooms/1/leave', { user: 'bob', body: { user_name: 'bob' } });
  return call('/api/arcade/rooms/join', { user: 'bob', body: { room_code_or_id: 'ARC-TEST', user_name: 'bob', password } });
}

test('saving settings without touching the password keeps the room private', async t => {
  const { call } = await privateRoom(t);
  const saved = await call('/api/arcade/rooms/1/settings', { body: { host_name: 'alice', room_name: 'Renamed', max_players: 4 } });
  assert.equal(saved.status, 200);
  const room = (await call('/api/arcade/rooms/1')).body.room;
  assert.equal(room.room_name, 'Renamed');
  assert.equal(room.is_password_protected, true);
  assert.equal((await bobCanJoinWith(call, 'secret1')).status, 200);
});

test('an empty password string is not a request to remove it', async t => {
  const { call } = await privateRoom(t);
  await call('/api/arcade/rooms/1/settings', { body: { host_name: 'alice', room_name: 'Test room', password: '' } });
  assert.equal((await call('/api/arcade/rooms/1')).body.room.is_password_protected, true);
  assert.equal((await bobCanJoinWith(call, '')).status, 401);
});

test('clear_password is the only way to make the room public', async t => {
  const { call } = await privateRoom(t);
  await call('/api/arcade/rooms/1/settings', { body: { host_name: 'alice', clear_password: true } });
  assert.equal((await call('/api/arcade/rooms/1')).body.room.is_password_protected, false);
  assert.equal((await bobCanJoinWith(call, undefined)).status, 200);
});

test('a new password is stored as bcrypt and never sent to clients', async t => {
  const { call, db } = await privateRoom(t);
  const [[row]] = await db.query('SELECT password FROM arcade_rooms WHERE room_id = 1');
  assert.match(row.password, /^\$2[aby]\$10\$/);
  const state = await call('/api/arcade/rooms/1');
  assert.equal(Object.hasOwn(state.body.room, 'password'), false);
  const list = await call('/api/arcade/rooms');
  assert.equal(JSON.stringify(list.body).includes(row.password), false);
});

test('max_players cannot drop below the people already in the room', async t => {
  const { call, db } = await arcadeFixture(t);
  await call('/api/arcade/rooms/1/add-bot', { body: { host_name: 'alice' } });
  const refused = await call('/api/arcade/rooms/1/settings', { body: { host_name: 'alice', max_players: 2 } });
  assert.equal(refused.status, 409);
  assert.match(refused.body.error, /[฀-๿]/);
  const [[room]] = await db.query('SELECT max_players FROM arcade_rooms WHERE room_id = 1');
  assert.equal(room.max_players, 5);

  const allowed = await call('/api/arcade/rooms/1/settings', { body: { host_name: 'alice', max_players: 3 } });
  assert.equal(allowed.status, 200);
  const [[after]] = await db.query('SELECT max_players FROM arcade_rooms WHERE room_id = 1');
  assert.equal(after.max_players, 3);
});

test('only the host can change settings', async t => {
  const { call } = await arcadeFixture(t);
  const res = await call('/api/arcade/rooms/1/settings', { user: 'bob', body: { host_name: 'bob', clear_password: true } });
  assert.equal(res.status, 403);
});
