const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { arcadeFixture } = require('./helpers/arcade-fixture');

async function shopFixture(t) {
  const fixture = await arcadeFixture(t);
  const { db, call } = fixture;
  const matchId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  await db.query("UPDATE arcade_rooms SET phase = 'SHOP_1', phase_deadline = CURRENT_TIMESTAMP + INTERVAL '5 minutes'");
  await db.query('UPDATE arcade_participants SET cash = 5000');
  const read = async (user = 'alice') => call(`/api/arcade/rooms/1/shop?match_id=${matchId}`, { user });
  const command = (action, args = {}, user = 'alice') => call('/api/arcade/rooms/1/shop', {
    user, body: { match_id: matchId, phase: 'SHOP_1', request_id: randomUUID(), action, ...args }
  });
  return { ...fixture, matchId, read, command };
}

test('shop offers persist and buying uses the server price and a unique owned instance', async t => {
  const { read, command } = await shopFixture(t);
  const first = await read();
  assert.equal(first.status, 200);
  const state = first.body;
  assert.equal(state.offers.length, 4);
  assert.deepEqual((await read()).body.offers, state.offers);
  const offer = state.offers[0];
  const prices = { inkFog: 400, backspaceLock: 500, keyScrambler: 450, aiHelper: 600, screenShake: 300, typoGenerator: 550, timeFreeze: 1200, blackout: 900, shield: 700, cashSteal: 600, capsLockLock: 350, mirrorMode: 500, taxCollection: 800, scoreMultiplier: 650, screenDimmer: 400 };
  assert.equal(offer.price, prices[offer.id]);
  const bought = await command('buy', { offer_id: offer.offer_id, price: 1, delta: 999999 });
  assert.equal(bought.status, 200);
  assert.equal(bought.body.cash, 5000 - prices[offer.id]);
  assert.equal(bought.body.inventory.length, 1);
  assert.equal(bought.body.inventory[0].id, offer.id);
  assert.ok(bought.body.inventory[0].instance_id);
  assert.equal(bought.body.offers[0].purchased, true);
  assert.deepEqual((await read()).body.inventory, bought.body.inventory);
});

test('shop snapshots do not wait behind the bot ticker room lock', async t => {
  const { read, pool } = await shopFixture(t);
  const lock = await pool.connect();
  try {
    await lock.query('BEGIN');
    await lock.query('SELECT * FROM arcade_rooms WHERE room_id = 1 FOR UPDATE');
    const result = await Promise.race([
      read(),
      new Promise(resolve => setTimeout(() => resolve({ status: 'timeout' }), 3000)),
    ]);
    assert.equal(result.status, 200);
    assert.equal(result.body.offers.length, 4);
  } finally {
    await lock.query('ROLLBACK');
    lock.release();
  }
});

test('concurrent duplicate purchases and a lost-response retry charge once', async t => {
  const { read, command } = await shopFixture(t);
  const offer = (await read()).body.offers[0];
  const args = { offer_id: offer.offer_id, request_id: randomUUID() };
  const results = await Promise.all([command('buy', args), command('buy', args)]);
  assert.deepEqual(results.map(r => r.status), [200, 200]);
  assert.equal((await command('buy', args)).status, 200);
  assert.equal((await command('buy', { offer_id: offer.offer_id })).status, 409);
  const state = (await read()).body;
  assert.equal(state.inventory.length, 1);
  assert.equal(state.cash, 5000 - offer.price);
  assert.equal((await command('buy', { ...args, offer_id: randomUUID() })).status, 409);
});

test('sales refund an owned instance once and rerolls charge a persisted increasing price', async t => {
  const { read, command, db } = await shopFixture(t);
  const first = (await read()).body;
  const bought = (await command('buy', { offer_id: first.offers[0].offer_id })).body;
  const args = { instance_id: bought.inventory[0].instance_id, request_id: randomUUID(), price: 999999 };
  const sold = await command('sell', args);
  assert.equal(sold.status, 200);
  assert.equal(sold.body.cash, 5000 - first.offers[0].price + Math.floor(first.offers[0].price / 2));
  assert.equal(sold.body.inventory.length, 0);
  assert.equal((await command('sell', args)).body.cash, sold.body.cash);
  assert.equal((await command('sell', { instance_id: args.instance_id })).status, 409);
  const rerollId = randomUUID();
  const rolled = await command('reroll', { request_id: rerollId, cost: 0 });
  assert.equal(rolled.status, 200);
  assert.equal(rolled.body.cash, sold.body.cash - 200);
  assert.equal(rolled.body.rerollCost, 400);
  assert.deepEqual((await command('reroll', { request_id: rerollId })).body.offers, rolled.body.offers);
  assert.equal((await command('buy', { offer_id: first.offers[1].offer_id })).status, 409);
  assert.equal((await command('reroll')).body.cash, sold.body.cash - 600);
  assert.equal((await read()).body.rerollCost, 800);
  await db.query("UPDATE arcade_rooms SET phase = 'SHOP_2'");
  const nextShop = (await read()).body;
  assert.equal(nextShop.rerollCost, 200);
  assert.equal(nextShop.cash, sold.body.cash - 600);
});

test('using an owned instance removes it persistently and it cannot be sold in the next shop', async t => {
  const { read, command, db } = await shopFixture(t);
  const offer = (await read()).body.offers[0];
  const instance = (await command('buy', { offer_id: offer.offer_id })).body.inventory[0];
  await db.query("UPDATE arcade_rooms SET phase = 'ROUND_2'");
  const args = { phase: 'ROUND_2', instance_id: instance.instance_id, request_id: randomUUID(),
    ...(instance.type === 'attack' ? { target_name: 'bob' } : {}) };
  const consumed = await command('consume', args);
  assert.equal(consumed.status, 200);
  assert.equal(consumed.body.inventory.length, 0);
  assert.equal((await command('consume', args)).status, 200);
  assert.equal((await read()).body.inventory.length, 0);
  assert.equal((await command('consume', { ...args, request_id: randomUUID() })).status, 409);
  await db.query("UPDATE arcade_rooms SET phase = 'SHOP_2'");
  assert.equal((await command('sell', { phase: 'SHOP_2', instance_id: instance.instance_id })).status, 409);
});

test('shop rejects outsiders, spoofed actors, eliminated players, stale phases and arbitrary cash deltas', async t => {
  const { read, command, call, db, matchId } = await shopFixture(t);
  const offer = (await read()).body.offers[0];
  assert.equal((await read('outsider')).status, 403);
  assert.equal((await read(null)).status, 401);
  assert.equal((await command('buy', { offer_id: offer.offer_id }, 'outsider')).status, 403);
  assert.equal((await command('buy', { offer_id: offer.offer_id, user_name: 'bob' })).status, 403);
  assert.equal((await command('buy', { offer_id: offer.offer_id, match_id: matchId + 99 })).status, 409);
  assert.equal((await command('buy', { offer_id: offer.offer_id, phase: 'SHOP_2' })).status, 409);
  assert.equal((await command('buy', { offer_id: offer.offer_id, request_id: 'invalid' })).status, 400);
  assert.equal((await call('/api/arcade/rooms/1/shop-cash-delta', { body: { delta: 999999 } })).status, 410);
  await db.query("UPDATE arcade_participants SET is_eliminated = 1 WHERE user_name = 'alice'");
  assert.equal((await command('reroll')).status, 403);
  assert.equal((await read()).body.cash, 5000);
});

test('concurrent purchases respect bag capacity and the one-AOE limit', async t => {
  const { read, command, db, matchId } = await shopFixture(t);
  await read();
  const offers = [
    { id: 'screenShake', type: 'attack', price: 300 },
    { id: 'inkFog', type: 'attack', price: 400 },
    { id: 'timeFreeze', type: 'aoe', price: 1200 },
    { id: 'blackout', type: 'aoe', price: 900 }
  ].map(item => ({ ...item, offer_id: randomUUID(), purchased: false }));
  await db.query('UPDATE arcade_shop_states SET offers = ? WHERE match_id = ?', [JSON.stringify(offers), matchId]);
  const bought = await command('buy', { offer_id: offers[2].offer_id });
  assert.equal(bought.status, 200);
  assert.equal((await command('buy', { offer_id: offers[3].offer_id })).status, 409);
  await command('sell', { instance_id: bought.body.inventory[0].instance_id });
  await command('buy', { offer_id: offers[0].offer_id });
  await command('buy', { offer_id: offers[1].offer_id });
  // Two different commands race for the last inventory slot using the same offer.
  const results = await Promise.all([command('buy', { offer_id: offers[3].offer_id }), command('buy', { offer_id: offers[3].offer_id })]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  assert.equal((await read()).body.inventory.length, 3);
  assert.equal((await read()).body.cash, 2800);
});

test('a database failure rolls back cash, stock and receipt before retry', async t => {
  const { read, command, db } = await shopFixture(t);
  const offer = (await read()).body.offers[0];
  await db.query(`CREATE FUNCTION reject_shop() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'shop unavailable'; END $$`);
  await db.query('CREATE TRIGGER fail_shop BEFORE UPDATE ON arcade_shop_states FOR EACH ROW EXECUTE FUNCTION reject_shop()');
  const args = { request_id: randomUUID(), offer_id: offer.offer_id };
  assert.equal((await command('buy', args)).status, 500);
  await db.query('DROP TRIGGER fail_shop ON arcade_shop_states');
  const after = (await read()).body;
  assert.equal(after.cash, 5000);
  assert.deepEqual(after.inventory, []);
  assert.equal(after.offers[0].purchased, false);
  assert.equal((await command('buy', args)).status, 200);
  assert.equal((await read()).body.cash, 5000 - offer.price);
});

test('locked requests use the actual deadline and previous-match inventory is not reused', async t => {
  const { read, command, db, pool, call, matchId } = await shopFixture(t);
  const offer = (await read()).body.offers[0];
  const lock = await pool.connect();
  try {
    await lock.query('BEGIN');
    await lock.query('SELECT * FROM arcade_rooms WHERE room_id = 1 FOR UPDATE');
    await lock.query("UPDATE arcade_rooms SET phase_deadline = clock_timestamp() + INTERVAL '150 milliseconds'");
    const request = command('buy', { offer_id: offer.offer_id });
    await lock.query('SELECT pg_sleep(0.3)');
    await lock.query('COMMIT');
    assert.equal((await request).status, 409);
  } finally { await lock.query('ROLLBACK'); lock.release(); }
  assert.equal((await read()).body.cash, 5000);
  await db.query("UPDATE arcade_rooms SET phase_deadline = CURRENT_TIMESTAMP + INTERVAL '5 minutes'");
  await command('buy', { offer_id: offer.offer_id });
  await db.query("UPDATE arcade_rooms SET phase = 'RESULT'");
  await db.query('UPDATE arcade_matches SET ended_at = CURRENT_TIMESTAMP WHERE match_id = (SELECT current_match_id FROM arcade_rooms WHERE room_id = 1)');
  await call('/api/arcade/rooms/1/finish-choice', { body: { choice: 'REMAIN' } });
  const next = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  assert.notEqual(next, matchId);
  assert.equal((await read()).status, 409);
  assert.equal((await command('reroll')).status, 409);
  const current = await call(`/api/arcade/rooms/1/shop?match_id=${next}`);
  assert.deepEqual(current.body.inventory, []);
  assert.deepEqual(current.body.offers, []);
});

test('first shop migration refuses active legacy matches whose inventories exist only in browsers', async t => {
  await assert.rejects(arcadeFixture(t, {
    beforeShopMigration: db => db.query("UPDATE arcade_rooms SET status = 'PLAYING', phase = 'SHOP_1'")
  }), /Finish active Arcade matches/);
});

test('insufficient cash and foreign instances never change the saved bag or wallet', async t => {
  const { db, read, command, matchId } = await shopFixture(t);
  const bobOffer = (await read('bob')).body.offers[0];
  const bobItem = (await command('buy', { offer_id: bobOffer.offer_id }, 'bob')).body.inventory[0];
  const offer = (await read()).body.offers[0];
  assert.equal((await command('buy', { offer_id: bobOffer.offer_id })).status, 409);
  assert.equal((await command('sell', { instance_id: bobItem.instance_id })).status, 409);
  await db.query("UPDATE arcade_participants SET cash = 0 WHERE user_name = 'alice'");
  assert.equal((await command('buy', { offer_id: offer.offer_id })).status, 409);
  assert.equal((await command('reroll')).status, 409);
  assert.equal((await read()).body.cash, 0);
  assert.deepEqual((await read()).body.inventory, []);
  await require('../arcade/migrate-shop').migrateArcadeShop(db);
  assert.equal((await read('bob')).body.inventory[0].instance_id, bobItem.instance_id);
  assert.equal((await read()).body.match_id, matchId);
});
