const { test } = require('node:test');
const assert = require('node:assert/strict');
const { arcadeFixture } = require('./helpers/arcade-fixture');

test('submission requires the current match and round and rejects expired rounds before the ticker advances', async t => {
  const { call, db } = await arcadeFixture(t);
  const matchId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  const body = { user_name: 'alice', match_id: matchId, round_num: 1, code: 'first answer' };
  assert.equal((await call('/api/arcade/rooms/1/submit-round', { body: { ...body, match_id: matchId + 1 } })).status, 409);
  assert.equal((await call('/api/arcade/rooms/1/submit-round', { body: { ...body, round_num: 2 } })).status, 409);
  await db.query("UPDATE arcade_rooms SET phase_deadline = CURRENT_TIMESTAMP - INTERVAL '1 second'");
  assert.equal((await call('/api/arcade/rooms/1/submit-round', { body })).status, 409);
  const self = (await call('/api/arcade/rooms/1/code/alice')).body;
  assert.equal(self.has_submitted, false);
  assert.equal(self.code, '');
});

test('concurrent different answers preserve the first accepted code and identical retries are idempotent', async t => {
  const { call, db } = await arcadeFixture(t);
  const matchId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  const bodies = ['answer one', 'answer two'].map(code => ({ match_id: matchId, round_num: 1, code }));
  const results = await Promise.all(bodies.map(body => call('/api/arcade/rooms/1/submit-round', { body })));
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  const winner = results.findIndex(r => r.status === 200);
  assert.equal((await call('/api/arcade/rooms/1/code/alice')).body.code, bodies[winner].code);
  await db.query("UPDATE arcade_rooms SET phase_deadline = CURRENT_TIMESTAMP - INTERVAL '1 second'");
  assert.deepEqual(await call('/api/arcade/rooms/1/submit-round', { body: bodies[winner] }), results[winner]);
  assert.equal((await call('/api/arcade/rooms/1/code-draft', { body: { ...bodies[winner], code: 'overwrite' } })).status, 409);
  assert.equal((await call('/api/arcade/rooms/1/code/alice')).body.code, bodies[winner].code);
});

test('drafts and submissions reject old rounds, rematches, outsiders, missing identity and eliminated players', async t => {
  const { call, db } = await arcadeFixture(t);
  const matchId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  const body = { match_id: matchId, round_num: 1, code: 'draft one' };
  assert.equal((await call('/api/arcade/rooms/1/code-draft', { body })).status, 200);
  assert.equal((await call('/api/arcade/rooms/1/code/alice')).body.code, 'draft one');
  for (const action of ['submit-round', 'code-draft']) {
    const path = `/api/arcade/rooms/1/${action}`;
    assert.equal((await call(path, { user: null, body })).status, 401);
    assert.equal((await call(path, { user: 'outsider', body })).status, 403);
    assert.equal((await call(path, { body: { ...body, user_name: 'bob' } })).status, 403);
    assert.equal((await call(path, { body: { code: 'missing identity' } })).status, 400);
    assert.equal((await call(path, { body: { ...body, code: 'x'.repeat(20001) } })).status, 400);
  }
  await db.query("UPDATE arcade_rooms SET phase = 'ROUND_2'");
  for (const action of ['submit-round', 'code-draft']) {
    assert.equal((await call(`/api/arcade/rooms/1/${action}`, { body })).status, 409);
  }
  assert.equal((await call('/api/arcade/rooms/1/submit-round', { body: { ...body, round_num: 2 } })).status, 200);
  await db.query("UPDATE arcade_rooms SET phase = 'LOBBY', status = 'WAITING'");
  const second = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  for (const action of ['submit-round', 'code-draft']) {
    assert.equal((await call(`/api/arcade/rooms/1/${action}`, { body })).status, 409);
  }
  await db.query("UPDATE arcade_participants SET is_eliminated = 1 WHERE user_name = 'alice'");
  for (const action of ['submit-round', 'code-draft']) {
    assert.equal((await call(`/api/arcade/rooms/1/${action}`, { body: { ...body, match_id: second } })).status, 403);
  }
});

test('a request waiting on a lock past the deadline cannot use the transaction start time', async t => {
  const { call, pool } = await arcadeFixture(t);
  const matchId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  const lock = await pool.connect();
  try {
    await lock.query('BEGIN');
    await lock.query('SELECT * FROM arcade_rooms WHERE room_id = 1 FOR UPDATE');
    await lock.query("UPDATE arcade_rooms SET phase_deadline = clock_timestamp() + INTERVAL '200 milliseconds'");
    const request = call('/api/arcade/rooms/1/submit-round', { body: { match_id: matchId, round_num: 1, code: 'too late' } });
    // Wait at the database boundary while the HTTP transaction is blocked.
    await lock.query('SELECT pg_sleep(0.4)');
    await lock.query('COMMIT');
    assert.equal((await request).status, 409);
    assert.equal((await call('/api/arcade/rooms/1/code/alice')).body.has_submitted, false);
    assert.equal((await call('/api/arcade/rooms/1/code-draft', { body: { match_id: matchId, round_num: 1, code: 'late draft' } })).status, 409);
  } finally {
    await lock.query('ROLLBACK');
    lock.release();
  }
});
