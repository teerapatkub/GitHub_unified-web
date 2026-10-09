const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { arcadeFixture } = require('./helpers/arcade-fixture');

async function attackFixture(t, itemId = 'cashSteal') {
  const fixture = await arcadeFixture(t);
  const { db, call } = fixture;
  const matchId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  await db.query("UPDATE arcade_rooms SET phase = 'SHOP_1', phase_deadline = clock_timestamp() + INTERVAL '5 minutes'");
  await db.query('UPDATE arcade_participants SET cash = 5000');
  const read = (user = 'alice') => call(`/api/arcade/rooms/1/shop?match_id=${matchId}`, { user });
  const command = (body, user = 'alice') => call('/api/arcade/rooms/1/shop', { user, body: { match_id: matchId, phase: 'ROUND_2', request_id: randomUUID(), ...body } });
  const buy = async (id, user = 'alice') => {
    await read(user);
    const meta = require('../../shared/arcadeConfig.json').shopItems.find(item => item.id === id);
    const offer = { ...meta, offer_id: randomUUID(), purchased: false };
    await db.query('UPDATE arcade_shop_states SET offers = ? WHERE match_id = ? AND user_name = ?', [JSON.stringify([offer]), matchId, user]);
    const result = await command({ phase: 'SHOP_1', action: 'buy', offer_id: offer.offer_id }, user);
    assert.equal(result.status, 200);
    return result.body.inventory.findLast(item => item.id === id);
  };
  const item = await buy(itemId);
  await db.query("UPDATE arcade_rooms SET phase = 'ROUND_2'");
  const request = { action: 'consume', instance_id: item.instance_id, target_name: 'bob', request_id: randomUUID() };
  const attack = (extra = {}, user = 'alice') => command({ ...request, ...extra }, user);
  return { ...fixture, matchId, item, buy, read, command, attack };
}

test('cash theft consumes the owned item and transfers money once under concurrent retries', async t => {
  const { attack, read } = await attackFixture(t);
  const results = await Promise.all([attack(), attack()]);
  assert.deepEqual(results.map(result => result.status), [200, 200]);
  assert.equal((await read()).body.cash, 4700);
  assert.equal((await read('bob')).body.cash, 4700);
  assert.deepEqual((await read()).body.inventory, []);
  assert.deepEqual(results[0].body.attackResult, results[1].body.attackResult);
  assert.equal((await attack({ request_id: randomUUID() })).status, 409);
});

test('one shield blocks an economic attack, retries cannot use it twice, and the next attack can land', async t => {
  const { db, buy, command, attack, read } = await attackFixture(t);
  await db.query("UPDATE arcade_rooms SET phase = 'SHOP_1'");
  const shield = await buy('shield', 'bob');
  const second = await buy('cashSteal');
  await db.query("UPDATE arcade_rooms SET phase = 'ROUND_2'");
  await command({ action: 'consume', instance_id: shield.instance_id }, 'bob');
  const result = await attack();
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.attackResult.targets, [{ name: 'bob', blocked: true, stolen: 0 }]);
  assert.equal((await read('bob')).body.cash, 4300);
  assert.deepEqual((await read('bob')).body.selfEffects, []);
  assert.equal((await attack()).status, 200);
  const hit = await attack({ instance_id: second.instance_id, request_id: randomUUID() });
  assert.equal(hit.status, 200);
  assert.equal((await read('bob')).body.cash, 4000);
});

test('AOE selects all live opponents once and stores fixed effect expiry for refresh', async t => {
  const { db, attack, read, matchId } = await attackFixture(t, 'timeFreeze');
  await db.query("INSERT INTO arcade_participants (room_id, match_id, user_name, cash) VALUES (1, ?, 'outsider', 1200), (1, ?, 'out', 1200)", [matchId, matchId]);
  await db.query("UPDATE arcade_participants SET is_eliminated = 1 WHERE user_name = 'out'");
  const used = await attack({ target_name: undefined });
  assert.equal(used.status, 200);
  assert.deepEqual(used.body.attackResult.targets.map(target => target.name), ['bob', 'outsider']);
  const bob = (await read('bob')).body.attackEffects;
  assert.equal(bob.length, 1);
  assert.equal(bob[0].type, 'timeFreeze');
  assert.ok(bob[0].expiresAt <= used.body.serverNow + 5000);
  await attack({ target_name: undefined });
  // Hosted-database reads can outlast this deliberately short five-second
  // visual effect. Inspect the persisted rows after the retry so the test
  // verifies idempotency without assuming two API round-trips finish before
  // the gameplay timer expires.
  const [saved] = await db.query(`SELECT user_name, attack_effects FROM arcade_shop_states
    WHERE match_id = ? AND user_name IN ('bob', 'outsider') ORDER BY user_name`, [matchId]);
  assert.deepEqual(saved[0].attack_effects, bob);
  assert.equal(saved[1].attack_effects.length, 1);
});

test('tax chooses the richest live opponent on the server and rounds down twenty percent once', async t => {
  const { db, attack, read, matchId } = await attackFixture(t, 'taxCollection');
  await db.query("INSERT INTO arcade_participants (room_id, match_id, user_name, cash) VALUES (1, ?, 'outsider', 9004)", [matchId]);
  assert.equal((await attack({ target_name: 'bob' })).status, 409);
  const result = await attack({ target_name: undefined });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.attackResult.targets, [{ name: 'outsider', blocked: false, stolen: 1800 }]);
  assert.equal((await read()).body.cash, 6000);
  assert.equal((await read('outsider')).body.cash, 7204);
  await attack({ target_name: undefined });
  assert.equal((await read('outsider')).body.cash, 7204);
});

test('invalid targets, phases, identities and unowned instances do not consume an item', async t => {
  const { attack, read, db, call, matchId } = await attackFixture(t, 'inkFog');
  for (const target_name of ['alice', 'missing', 'outsider', ['bob']]) assert.equal((await attack({ target_name })).status, 409);
  assert.equal((await attack({ instance_id: randomUUID() })).status, 409);
  assert.equal((await attack({}, 'outsider')).status, 403);
  assert.equal((await attack({}, null)).status, 401);
  assert.equal((await attack({ user_name: 'bob' })).status, 403);
  assert.equal((await attack({ phase: 'SHOP_1' })).status, 409);
  assert.equal((await attack({ match_id: matchId + 1 })).status, 409);
  assert.equal((await attack({ request_id: 'bad' })).status, 400);
  await db.query("UPDATE arcade_participants SET is_eliminated = 1 WHERE user_name = 'bob'");
  assert.equal((await attack()).status, 409);
  await db.query("UPDATE arcade_participants SET is_eliminated = 1 WHERE user_name = 'alice'");
  assert.equal((await attack()).status, 403);
  await db.query('UPDATE arcade_participants SET is_eliminated = 0');
  await call('/api/arcade/rooms/1/submit-round', { body: { match_id: matchId, round_num: 2, code: 'print(7)' } });
  assert.equal((await attack()).status, 409);
  assert.equal((await read()).body.inventory.length, 1);
  assert.deepEqual((await read('bob')).body.attackEffects, []);
  assert.equal((await call('/api/arcade/rooms/1/attack', { body: { attacker_name: 'alice', target_name: 'bob', effect_type: 'cashSteal' } })).status, 410);
  assert.equal((await call('/api/arcade/rooms/1/effects?user_name=alice')).status, 410);
});

test('single-target attacks reject already debuffed targets while AOE may still affect them', async t => {
  const { db, attack, buy, command, read } = await attackFixture(t, 'inkFog');
  await db.query("UPDATE arcade_rooms SET phase = 'SHOP_1'");
  const targeted = await buy('screenShake');
  const aoe = await buy('blackout');
  await db.query("UPDATE arcade_rooms SET phase = 'ROUND_2'");
  assert.equal((await attack()).status, 200);
  assert.equal((await command({ action: 'consume', instance_id: targeted.instance_id, target_name: 'bob' })).status, 409);
  assert.equal((await read()).body.inventory.length, 2);
  assert.equal((await command({ action: 'consume', instance_id: aoe.instance_id, target_name: 'bob' })).status, 409);
  assert.equal((await command({ action: 'consume', instance_id: aoe.instance_id })).status, 200);
  const effects = (await read('bob')).body.attackEffects;
  assert.deepEqual(effects.map(effect => effect.type), ['inkFog', 'blackout']);
  assert.equal((await read()).body.opponents.find(p => p.name === 'bob').isDebuffed, true);
  await db.query("UPDATE arcade_rooms SET phase = 'ROUND_3'");
  assert.deepEqual((await read('bob')).body.attackEffects, []);
  assert.equal((await read()).body.opponents.find(p => p.name === 'bob').isDebuffed, false);
});

test('AOE rollback restores every shield, target effect, inventory and command receipt', async t => {
  const { db, attack, buy, command, read, matchId } = await attackFixture(t, 'timeFreeze');
  await db.query("INSERT INTO arcade_participants (room_id,match_id,user_name,cash) VALUES (1,?,'outsider',5000)", [matchId]);
  await db.query("UPDATE arcade_rooms SET phase = 'SHOP_1'");
  const shield = await buy('shield', 'bob');
  await db.query("UPDATE arcade_rooms SET phase = 'ROUND_2'");
  await command({ action: 'consume', instance_id: shield.instance_id }, 'bob');
  await db.query(`CREATE FUNCTION reject_attack() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    IF NEW.user_name = 'outsider' AND jsonb_array_length(NEW.attack_effects) > 0 THEN RAISE EXCEPTION 'target unavailable'; END IF;
    RETURN NEW; END $$`);
  await db.query('CREATE TRIGGER fail_attack BEFORE UPDATE ON arcade_shop_states FOR EACH ROW EXECUTE FUNCTION reject_attack()');
  assert.equal((await attack({ target_name: undefined })).status, 500);
  assert.equal((await read('bob')).body.selfEffects.length, 1);
  assert.deepEqual((await read('outsider')).body.attackEffects, []);
  assert.equal((await read()).body.inventory.length, 1);
  await db.query('DROP TRIGGER fail_attack ON arcade_shop_states');
  assert.equal((await attack({ target_name: undefined })).status, 200);
  assert.deepEqual((await read('bob')).body.selfEffects, []);
  assert.equal((await read('outsider')).body.attackEffects.length, 1);
});

test('cash transfer rollback preserves both wallets and duplicate attacks cannot overdraw a target', async t => {
  const { db, attack, read, buy } = await attackFixture(t);
  await db.query("UPDATE arcade_rooms SET phase = 'SHOP_1'");
  const next = await buy('cashSteal');
  await db.query("UPDATE arcade_rooms SET phase = 'ROUND_2'");
  await db.query("UPDATE arcade_participants SET cash = 101 WHERE user_name = 'bob'");
  await db.query(`CREATE FUNCTION fail_attacker() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    IF NEW.user_name = 'alice' THEN RAISE EXCEPTION 'attacker wallet unavailable'; END IF; RETURN NEW; END $$`);
  await db.query('CREATE TRIGGER reject_wallet BEFORE UPDATE ON arcade_participants FOR EACH ROW EXECUTE FUNCTION fail_attacker()');
  assert.equal((await attack()).status, 500);
  assert.equal((await read('bob')).body.cash, 101);
  assert.equal((await read()).body.cash, 3800);
  assert.equal((await read()).body.inventory.length, 2);
  await db.query('DROP TRIGGER reject_wallet ON arcade_participants');
  const results = await Promise.all([attack(), attack({ instance_id: next.instance_id, request_id: randomUUID() })]);
  assert.deepEqual(results.map(r => r.status), [200, 200]);
  assert.equal((await read('bob')).body.cash, 0);
  assert.equal((await read()).body.cash, 3901);
});

test('an attack waiting on a target lock cannot land after the deadline', async t => {
  const { pool, db, attack, read } = await attackFixture(t, 'inkFog');
  const lock = await pool.connect();
  try {
    await lock.query('BEGIN');
    await lock.query("SELECT * FROM arcade_participants WHERE user_name = 'bob' FOR UPDATE");
    await db.query("UPDATE arcade_rooms SET phase_deadline = clock_timestamp() + INTERVAL '200 milliseconds'");
    const pending = attack();
    await lock.query('SELECT pg_sleep(0.4)');
    await lock.query('COMMIT');
    assert.equal((await pending).status, 409);
    assert.equal((await read()).body.inventory.length, 1);
    assert.deepEqual((await read('bob')).body.attackEffects, []);
  } finally {
    await lock.query('ROLLBACK');
    lock.release();
  }
});

test('effects really expire and old commands cannot switch targets or enter a rematch', async t => {
  const { attack, read, db, call, matchId } = await attackFixture(t, 'timeFreeze');
  const used = await attack({ target_name: undefined });
  assert.equal(used.status, 200);
  assert.equal((await attack({ target_name: 'bob' })).status, 409);
  await db.query('SELECT pg_sleep(5.1)');
  assert.deepEqual((await read('bob')).body.attackEffects, []);
  assert.equal((await attack({ target_name: undefined })).status, 200);
  assert.deepEqual((await read('bob')).body.attackEffects, []);
  await db.query("UPDATE arcade_rooms SET phase = 'LOBBY', status = 'WAITING'");
  const nextMatch = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  assert.notEqual(nextMatch, matchId);
  assert.equal((await attack({ target_name: undefined })).status, 409);
  assert.deepEqual((await call(`/api/arcade/rooms/1/shop?match_id=${nextMatch}`, { user: 'bob' })).body.attackEffects, []);
});

test('all visual attack items use the established durations and server-chosen effect types', async t => {
  const durations = { inkFog: 15000, timeFreeze: 5000, blackout: 8000, screenShake: 8000,
    capsLockLock: 10000, mirrorMode: 12000, screenDimmer: 15000, backspaceLock: 10000,
    keyScrambler: 10000, typoGenerator: 10000 };
  for (const [id, duration] of Object.entries(durations)) {
    await t.test(id, async inner => {
      const { attack, read } = await attackFixture(inner, id);
      const result = await attack({ target_name: ['timeFreeze', 'blackout'].includes(id) ? undefined : 'bob',
        effect_type: 'cashSteal', duration: 9999999, amount: 9999999 });
      assert.equal(result.status, 200);
      const effect = (await read('bob')).body.attackEffects[0];
      assert.equal(effect.type, id);
      assert.equal(effect.expiresAt - result.body.serverNow, duration);
      assert.equal((await read('bob')).body.cash, 5000);
    });
  }
});

test('attack migration rejects legacy active matches and preserves current effects on repeat startup', async t => {
  const { db, attack, read } = await attackFixture(t, 'inkFog');
  await attack();
  const saved = (await read('bob')).body.attackEffects;
  const { migrateArcadeAttacks } = require('../arcade/migrate-attacks');
  await migrateArcadeAttacks(db);
  assert.deepEqual((await read('bob')).body.attackEffects, saved);
  await db.query('ALTER TABLE arcade_shop_states DROP COLUMN attack_effects');
  await assert.rejects(migrateArcadeAttacks(db), /Finish active Arcade matches/);
  await db.query("UPDATE arcade_rooms SET phase = 'RESULT'");
  await migrateArcadeAttacks(db);
});
