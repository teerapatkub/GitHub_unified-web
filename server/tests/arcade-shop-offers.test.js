const { test } = require('node:test');
const assert = require('node:assert/strict');
const { drawOffers } = require('../arcade/shop-api');

// Spec 0005 ticket 09: a paid reroll could hand back the very same four items
// (1 in 1,365 with the real 15-item catalogue, far more often in a small pool),
// so the player paid 200+ coins for nothing visible.
const pool = ['a', 'b', 'c', 'd', 'e'].map(id => ({ id, type: 'attack', price: 100 }));
const ids = offers => offers.map(o => o.id).sort().join(',');

test('a reroll never returns the same set of items it replaced', () => {
  let previous = drawOffers(null, pool);
  for (let i = 0; i < 500; i += 1) {
    const next = drawOffers(previous, pool);
    assert.notEqual(ids(next), ids(previous), `run ${i} repeated ${ids(previous)}`);
    previous = next;
  }
});

test('offers are four distinct items with fresh offer ids', () => {
  const offers = drawOffers(null, pool);
  assert.equal(offers.length, 4);
  assert.equal(new Set(offers.map(o => o.id)).size, 4);
  assert.ok(offers.every(o => o.purchased === false && /^[0-9a-f-]{36}$/.test(o.offer_id)));
});

test('a pool too small to change still returns offers instead of looping', () => {
  const tiny = pool.slice(0, 4);
  assert.equal(ids(drawOffers(drawOffers(null, tiny), tiny)), 'a,b,c,d');
});
