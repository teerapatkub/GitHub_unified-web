// Fix list item 8 (2026-11-17): shop prices by rarity, five new cosmetic sets,
// and lesson coins x3 - all in migrate-cosmetics-refresh.js. The real server
// is booted on a disposable database, so the migration runs after the core
// seed exactly as it does on a fresh deployment.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { Pool } = require('pg');
const { createTestDatabase, startServer } = require('./helpers/start-server');
const { PRICE_BY_RARITY, NEW_SETS, migrateCosmeticsRefresh } = require('../migrate-cosmetics-refresh');
const { CLASSIC_EFFECTS } = require('../migrate-classic-set-effects');

test('cosmetic prices, new sets and tripled lesson coins', { timeout: 600_000 }, async t => {
  const url = await createTestDatabase(t, 'pyarena_cosmetics');
  const server = await startServer(t, { url, env: { LLM_BASE_URL: '', LLM_CHAT_MODEL: '' } });
  const db = new Pool({ connectionString: url, ssl: false });
  db.on('error', () => {});
  t.after(() => db.end());

  await t.test('every set costs its pieces less 20%, and the shop lists all nine', async () => {
    const res = await server.call('/api/shop/sets', { method: 'GET' });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const keys = res.body.map(s => s.set_key).sort();
    assert.deepEqual(keys, ['cyber', 'forest', 'lantern', 'monster', 'ocean', 'pixel', 'sakura', 'space', 'winter']);
    for (const set of res.body) {
      assert.equal(set.items.length, 3, set.set_key);
      assert.equal(set.price, Math.round(set.individual_total * 0.8), set.set_key);
    }
  });

  await t.test('prices follow type and rarity, with the owner\'s ceilings at the top', async () => {
    const { rows } = await db.query(
      `SELECT item_type, upper(rarity) AS rarity, price FROM shop_items
        WHERE is_active = 1 AND is_available = 1 AND price > 0`);
    assert.ok(rows.length > 0);
    for (const r of rows) {
      assert.equal(r.price, PRICE_BY_RARITY[r.item_type][r.rarity], `${r.item_type} ${r.rarity}`);
    }
    const { rows: [lantern] } = await db.query("SELECT price FROM shop_sets WHERE set_key = 'lantern'");
    assert.equal(lantern.price, Math.round((10000 + 5000 + 4000) * 0.8));
    const { rows: [old] } = await db.query("SELECT price FROM shop_sets WHERE set_key = 'space'");
    assert.equal(old.price, Math.round((5000 + 2500 + 2000) * 0.8));
  });

  await t.test('free items and achievement-only pictures are untouched', async () => {
    const { rows } = await db.query(
      "SELECT name, price FROM shop_items WHERE item_type = 'PROFILE_PICTURE' AND is_available = 0");
    assert.ok(rows.length >= 2);
    assert.ok(rows.every(r => Number(r.price) === 0), JSON.stringify(rows));
  });

  await t.test('each new set has its art on disk and a click effect the client draws', async () => {
    for (const set of NEW_SETS) {
      const { rows } = await db.query('SELECT item_type, asset_url, effects FROM shop_items WHERE set_key = $1', [set.set_key]);
      assert.equal(rows.length, 3, set.set_key);
      for (const r of rows.filter(x => x.asset_url)) {
        const file = path.join(__dirname, '..', 'seed-assets', path.basename(r.asset_url));
        assert.ok(fs.existsSync(file), `${set.set_key}: ${r.asset_url} is not in seed-assets`);
      }
      const mouse = rows.find(r => r.item_type === 'MOUSE_EFFECT');
      const effects = typeof mouse.effects === 'string' ? JSON.parse(mouse.effects) : mouse.effects;
      assert.deepEqual(effects.map(e => e.trigger), ['click', 'dblclick'], set.set_key);
      assert.ok(effects.every(e => e.fx && e.visual), set.set_key);
    }
  });

  await t.test('five themes show the owner\'s artwork, served as webp', async () => {
    for (const key of ['forest', 'ocean', 'monster', 'winter', 'space', 'sakura', 'cyber', 'pixel', 'lantern']) {
      const { rows: [theme] } = await db.query("SELECT asset_url FROM shop_items WHERE set_key = $1 AND item_type = 'THEME'", [key]);
      assert.equal(theme.asset_url, `/uploads/${key}-theme.webp`, key);
      // Served from seed-assets, as a webp - an svg name on it would break it.
      const res = await fetch(`${server.baseURL}${theme.asset_url}`);
      assert.equal(res.status, 200, key);
      assert.match(res.headers.get('content-type') || '', /image\/webp/, key);
    }
  });

  await t.test('the four original sets got canvas click effects too, keeping their emoji', async () => {
    const { rows } = await db.query(
      `SELECT set_key, effects, description FROM shop_items
        WHERE item_type = 'MOUSE_EFFECT' AND set_key IN ('space', 'sakura', 'pixel', 'cyber') ORDER BY set_key`);
    assert.equal(rows.length, 4);
    for (const r of rows) {
      const effects = typeof r.effects === 'string' ? JSON.parse(r.effects) : r.effects;
      const byTrigger = Object.fromEntries(effects.map(e => [e.trigger, e]));
      assert.deepEqual([byTrigger.click.fx, byTrigger.dblclick.fx], [CLASSIC_EFFECTS[r.set_key].click.fx, CLASSIC_EFFECTS[r.set_key].dblclick.fx], r.set_key);
      assert.ok(byTrigger.click.visual, `${r.set_key} still has its emoji`);
      assert.equal(r.description, CLASSIC_EFFECTS[r.set_key].description, r.set_key);
    }
  });

  // A fresh database has no pre-merge copy to compare with, so the step is
  // checked by running the migration body once more: prices and sets are
  // already where it puts them and do not move, and coins go up x3 again.
  await t.test('running it again leaves prices alone and multiplies coins by exactly 3', async () => {
    const coins = async () => (await db.query(
      "SELECT problem_id, mode, coin_reward FROM problem_modes WHERE mode IN ('lesson', 'minigame') ORDER BY problem_id, mode")).rows;
    const prices = async () => (await db.query('SELECT item_id, price FROM shop_items ORDER BY item_id')).rows;
    const before = await coins();
    const pricesBefore = await prices();
    assert.ok(before.some(r => r.coin_reward > 0));
    const wrapper = {
      query: async (sql, params = []) => {
        let n = 0;
        const result = await db.query(sql.replace(/\?/g, () => `$${++n}`), params);
        return [result.rows];
      },
    };
    await migrateCosmeticsRefresh(wrapper);
    const after = await coins();
    assert.deepEqual(after.map(r => r.coin_reward), before.map(r => r.coin_reward * 3));
    assert.deepEqual(await prices(), pricesBefore);
  });
});
