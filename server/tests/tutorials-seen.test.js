const assert = require('node:assert/strict');
const test = require('node:test');
const { arcadeFixture } = require('./helpers/arcade-fixture');
const { migrateTutorialsSeen, installTutorials } = require('../tutorials');

async function tourFixture(t) {
  const f = await arcadeFixture(t);
  await migrateTutorialsSeen(f.db);
  installTutorials(f.app, f.db);
  return f;
}

const seen = async (db, name) => (await db.query('SELECT tutorials_seen FROM users WHERE username = ?', [name]))[0][0].tutorials_seen;

test('a new account has seen no tours, and the column survives a second boot', async t => {
  const f = await tourFixture(t);
  await migrateTutorialsSeen(f.db);
  assert.deepEqual(await seen(f.db, 'alice'), []);
});

test('marking a tour seen records it once, however often it is sent', async t => {
  const f = await tourFixture(t);
  const first = await f.call('/api/user/tutorials/app-overview/seen', { body: {} });
  assert.equal(first.status, 200);
  assert.deepEqual(first.body.tutorials_seen, ['app-overview']);
  await f.call('/api/user/tutorials/app-overview/seen', { body: {} });
  await f.call('/api/user/tutorials/arcade-lobby/seen', { body: {} });
  assert.deepEqual(await seen(f.db, 'alice'), ['app-overview', 'arcade-lobby']);
  assert.deepEqual(await seen(f.db, 'bob'), []);
});

test('only a signed-in player can mark a tour, and only with a valid id', async t => {
  const f = await tourFixture(t);
  assert.equal((await f.call('/api/user/tutorials/app-overview/seen', { user: null, body: {} })).status, 401);
  assert.equal((await f.call('/api/user/tutorials/Bad_ID!/seen', { body: {} })).status, 400);
  assert.equal((await f.call(`/api/user/tutorials/${'a'.repeat(41)}/seen`, { body: {} })).status, 400);
  assert.deepEqual(await seen(f.db, 'alice'), []);
});
