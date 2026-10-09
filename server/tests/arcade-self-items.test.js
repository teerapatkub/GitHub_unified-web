const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { arcadeFixture } = require('./helpers/arcade-fixture');
const { createArcadePhaseFinalizer } = require('../arcade/phase-finalizer');

async function selfItemFixture(t, itemId = 'shield') {
  const fixture = await arcadeFixture(t);
  const { db, call } = fixture;
  const matchId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  await db.query("UPDATE arcade_rooms SET phase = 'SHOP_1', phase_deadline = clock_timestamp() + INTERVAL '5 minutes'");
  await db.query('UPDATE arcade_participants SET cash = 5000');
  const read = () => call(`/api/arcade/rooms/1/shop?match_id=${matchId}`);
  await read();
  const offer = { id: itemId, type: 'buff', price: 700, offer_id: randomUUID(), purchased: false };
  await db.query('UPDATE arcade_shop_states SET offers = ? WHERE match_id = ?', [JSON.stringify([offer]), matchId]);
  const bought = await call('/api/arcade/rooms/1/shop', { body: { match_id: matchId, phase: 'SHOP_1', action: 'buy', offer_id: offer.offer_id, request_id: randomUUID() } });
  const instanceId = bought.body.inventory[0].instance_id;
  await db.query("UPDATE arcade_rooms SET phase = 'ROUND_2'");
  const body = { match_id: matchId, phase: 'ROUND_2', action: 'consume', instance_id: instanceId, request_id: randomUUID() };
  const use = (extra = {}, user = 'alice') => call('/api/arcade/rooms/1/shop', { user, body: { ...body, ...extra } });
  return { ...fixture, matchId, read, use, body };
}

test('shield activation and inventory removal commit once and refresh preserves its expiry', async t => {
  const { read, use } = await selfItemFixture(t);
  const responses = await Promise.all([use(), use()]);
  assert.deepEqual(responses.map(r => r.status), [200, 200]);
  const saved = responses[0].body;
  assert.equal(saved.inventory.length, 0);
  assert.equal(saved.selfEffects.length, 1);
  assert.equal(saved.selfEffects[0].type, 'shield');
  assert.ok(saved.selfEffects[0].expiresAt > Date.now());
  assert.deepEqual((await read()).body.selfEffects, saved.selfEffects);
  assert.deepEqual((await use()).body.selfEffects, saved.selfEffects);
  assert.equal((await use({ request_id: randomUUID() })).status, 409);
});

test('only an owned activated multiplier doubles the settled score, regardless of client flags', async t => {
  const { call, db, matchId, use } = await selfItemFixture(t, 'scoreMultiplier');
  assert.equal((await use()).status, 200);
  const answer = { match_id: matchId, round_num: 2, code: 'print(7)' };
  assert.equal((await call('/api/arcade/rooms/1/submit-round', { body: { ...answer, score_multiplier_active: false } })).status, 200);
  assert.equal((await call('/api/arcade/rooms/1/submit-round', { user: 'bob', body: { ...answer, score_multiplier_active: true } })).status, 200);
  assert.equal((await call('/api/arcade/rooms/1/submit-round', { body: { ...answer, score_multiplier_active: true } })).status, 200);
  await db.query("UPDATE arcade_rooms SET phase_deadline = clock_timestamp() - INTERVAL '1 second'");
  const room = (await call('/api/arcade/rooms/1')).body.room;
  // Only the optional external quality judge is substituted; settlement and history are real.
  await createArcadePhaseFinalizer({ db, judgeCodeQuality: async () => ({ score: 40 }) })(room);
  const alice = (await call('/api/arcade/rooms/1/round-history')).body.history[0];
  const bob = (await call('/api/arcade/rooms/1/round-history', { user: 'bob' })).body.history[0];
  assert.equal(alice.round_score, 80);
  assert.equal(bob.round_score, 40);
});

test('round buffs expire without refresh extending them and cannot multiply a later round', async t => {
  const { read, use, call, db, matchId } = await selfItemFixture(t, 'scoreMultiplier');
  const used = await use();
  assert.equal(used.body.selfEffects[0].type, 'scoreMultiplier');
  const expiry = used.body.selfEffects[0].expiresAt;
  assert.equal((await read()).body.selfEffects[0].expiresAt, expiry);
  await db.query("UPDATE arcade_rooms SET phase = 'ROUND_3'");
  assert.deepEqual((await read()).body.selfEffects, []);
  await call('/api/arcade/rooms/1/submit-round', { body: { match_id: matchId, round_num: 3, code: 'print(7)', score_multiplier_active: true } });
  await db.query("UPDATE arcade_rooms SET phase_deadline = clock_timestamp() - INTERVAL '1 second'");
  await createArcadePhaseFinalizer({ db, judgeCodeQuality: async () => ({ score: 40 }) })((await call('/api/arcade/rooms/1')).body.room);
  assert.equal((await call('/api/arcade/rooms/1/round-history')).body.history[0].round_score, 40);
});

test('hint entitlement persists but expires at the original round deadline', async t => {
  const { read, use, db } = await selfItemFixture(t, 'aiHelper');
  await db.query("UPDATE arcade_rooms SET phase_deadline = clock_timestamp() + INTERVAL '1 second'");
  const used = await use();
  assert.equal(used.body.selfEffects[0].type, 'aiHelper');
  assert.deepEqual((await read()).body.selfEffects, used.body.selfEffects);
  await db.query('SELECT pg_sleep(1.1)');
  assert.deepEqual((await read()).body.selfEffects, []);
  assert.deepEqual((await use()).body.selfEffects, []);
});

test('self items reject unowned instances, outsiders, expired rounds and use after submission', async t => {
  const { use, read, call, db, matchId } = await selfItemFixture(t);
  assert.equal((await use({ instance_id: randomUUID() })).status, 409);
  assert.equal((await use({}, 'bob')).status, 409);
  assert.equal((await use({}, 'outsider')).status, 403);
  assert.equal((await use({}, null)).status, 401);
  assert.equal((await use({ match_id: matchId + 1 })).status, 409);
  assert.equal((await use({ phase: 'SHOP_1' })).status, 409);
  await call('/api/arcade/rooms/1/submit-round', { body: { match_id: matchId, round_num: 2, code: 'print(7)' } });
  assert.equal((await use()).status, 409);
  assert.equal((await read()).body.inventory.length, 1);
  assert.deepEqual((await read()).body.selfEffects, []);
  await db.query('UPDATE arcade_participants SET has_submitted = 0');
  await db.query("UPDATE arcade_rooms SET phase_deadline = clock_timestamp() - INTERVAL '1 second'");
  assert.equal((await use()).status, 409);
});

test('failed effect persistence rolls back consumption and a retry activates exactly once', async t => {
  const { use, read, db } = await selfItemFixture(t);
  await db.query(`CREATE FUNCTION reject_self_effect() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    IF jsonb_array_length(NEW.self_effects) > 0 THEN RAISE EXCEPTION 'effect write unavailable'; END IF;
    RETURN NEW; END $$`);
  await db.query('CREATE TRIGGER fail_self_effect BEFORE UPDATE ON arcade_shop_states FOR EACH ROW EXECUTE FUNCTION reject_self_effect()');
  assert.equal((await use()).status, 500);
  assert.equal((await read()).body.inventory.length, 1);
  assert.deepEqual((await read()).body.selfEffects, []);
  await db.query('DROP TRIGGER fail_self_effect ON arcade_shop_states');
  assert.equal((await use()).body.selfEffects.length, 1);
  assert.equal((await read()).body.inventory.length, 0);
});

test('an active shield cannot be stacked and belongs only to its original match', async t => {
  const { use, read, db, call, matchId } = await selfItemFixture(t);
  const saved = (await use()).body.selfEffects;
  await db.query("UPDATE arcade_rooms SET phase = 'SHOP_2'");
  const state = (await read()).body;
  assert.deepEqual(state.selfEffects, saved);
  const offer = { id: 'shield', type: 'buff', price: 700, offer_id: randomUUID(), purchased: false };
  await db.query('UPDATE arcade_shop_states SET offers = ? WHERE match_id = ?', [JSON.stringify([offer]), matchId]);
  const bought = await call('/api/arcade/rooms/1/shop', { body: { match_id: matchId, phase: 'SHOP_2', action: 'buy', offer_id: offer.offer_id, request_id: randomUUID() } });
  await db.query("UPDATE arcade_rooms SET phase = 'ROUND_3'");
  assert.equal((await use({ phase: 'ROUND_3', instance_id: bought.body.inventory[0].instance_id, request_id: randomUUID() })).status, 409);
  assert.equal((await read()).body.inventory.length, 1);
  await require('../arcade/migrate-self-effects').migrateArcadeSelfEffects(db);
  assert.deepEqual((await read()).body.selfEffects, saved);
  await db.query("UPDATE arcade_rooms SET phase = 'LOBBY', status = 'WAITING'");
  const nextId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  assert.deepEqual((await call(`/api/arcade/rooms/1/shop?match_id=${nextId}`)).body.selfEffects, []);
  assert.equal((await read()).status, 409);
});

test('the legacy receiver can relinquish only its own shield and retries never remove another activation', async t => {
  const { use, read, db, call, matchId } = await selfItemFixture(t);
  const shield = (await use()).body.selfEffects[0];
  const release = { action: 'release-shield', instance_id: shield.instance_id, request_id: randomUUID() };
  assert.equal((await use(release, 'bob')).status, 409);
  assert.equal((await use({ ...release, instance_id: randomUUID() })).status, 409);
  assert.equal((await use(release)).status, 200);
  assert.deepEqual((await read()).body.selfEffects, []);
  assert.equal((await use(release)).status, 200);
  assert.equal((await use({ ...release, request_id: randomUUID() })).status, 409);
  await db.query("UPDATE arcade_rooms SET phase = 'SHOP_2'");
  await read();
  const offer = { id: 'shield', type: 'buff', price: 700, offer_id: randomUUID(), purchased: false };
  await db.query('UPDATE arcade_shop_states SET offers = ? WHERE match_id = ?', [JSON.stringify([offer]), matchId]);
  const bought = await call('/api/arcade/rooms/1/shop', { body: { match_id: matchId, phase: 'SHOP_2', action: 'buy', offer_id: offer.offer_id, request_id: randomUUID() } });
  await db.query("UPDATE arcade_rooms SET phase = 'ROUND_3'");
  const next = await use({ phase: 'ROUND_3', instance_id: bought.body.inventory[0].instance_id, request_id: randomUUID() });
  assert.equal(next.status, 200);
  assert.equal((await use(release)).status, 200);
  assert.deepEqual((await read()).body.selfEffects, next.body.selfEffects);
});

test('concurrent activation and submission settle according to the first accepted operation', async t => {
  const { use, db, call, matchId } = await selfItemFixture(t, 'scoreMultiplier');
  const [used, submitted] = await Promise.all([
    use(), call('/api/arcade/rooms/1/submit-round', { body: { match_id: matchId, round_num: 2, code: 'print(7)' } })
  ]);
  assert.equal(submitted.status, 200);
  assert.ok([200, 409].includes(used.status));
  await db.query("UPDATE arcade_rooms SET phase_deadline = clock_timestamp() - INTERVAL '1 second'");
  await createArcadePhaseFinalizer({ db, judgeCodeQuality: async () => ({ score: 40 }) })((await call('/api/arcade/rooms/1')).body.room);
  const score = (await call('/api/arcade/rooms/1/round-history')).body.history[0].round_score;
  assert.equal(score, used.status === 200 ? 80 : 40);
});

test('first self-effect migration refuses browser-only active buffs instead of silently losing them', async t => {
  const { db } = await selfItemFixture(t);
  await db.query('ALTER TABLE arcade_shop_states DROP COLUMN self_effects');
  const { migrateArcadeSelfEffects } = require('../arcade/migrate-self-effects');
  await assert.rejects(migrateArcadeSelfEffects(db), /Finish active Arcade matches/);
  await db.query("UPDATE arcade_rooms SET phase = 'RESULT'");
  await migrateArcadeSelfEffects(db);
  await migrateArcadeSelfEffects(db);
});
