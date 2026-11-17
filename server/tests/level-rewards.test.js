// Level rewards (fix list item 12): coins every 10 levels, exclusive cosmetics
// at 25/50/75/100, granted retroactively, and announced once through the
// unseen-unlocks endpoint. The real server is booted on a disposable database.
const assert = require('node:assert/strict');
const test = require('node:test');
const { Pool } = require('pg');
const { createTestDatabase, startServer } = require('./helpers/start-server');
const levels = require('../levels');

test('reaching a level pays its rewards once and the popup hears about it', { timeout: 600_000 }, async (t) => {
  const url = await createTestDatabase(t, 'pyarena_levelrewards');
  const server = await startServer(t, { url, env: { LLM_BASE_URL: '', LLM_CHAT_MODEL: '' } });
  const db = new Pool({ connectionString: url, ssl: false });
  db.on('error', () => {});
  t.after(() => db.end());
  const userId = server.userId;

  await t.test('the reward ladder is in place and the cosmetics cannot be bought', async () => {
    const { rows } = await db.query(
      "SELECT threshold, reward_money FROM achievements WHERE metric = 'level' AND is_active = 1 ORDER BY threshold");
    assert.deepEqual(rows.map((r) => r.threshold), [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100]);
    // The nice levels pay a cosmetic instead of coins.
    for (const r of rows.filter((x) => [25, 50, 75, 100].includes(x.threshold))) assert.equal(Number(r.reward_money), 0);
    const { rows: items } = await db.query(
      "SELECT is_available, price FROM shop_items WHERE asset_url LIKE '/uploads/%level-%'");
    assert.equal(items.length, 6);
    assert.ok(items.every((i) => Number(i.is_available) === 0 && Number(i.price) === 0));
  });

  // A player already past level 50 (as after the level-curve migration).
  await db.query('UPDATE users SET level = 52, xp = $2, virtual_currency = 10000 WHERE user_id = $1',
    [userId, levels.xpForLevel(52)]);

  await t.test('the next achievement check pays every level reward up to 50', async () => {
    const { rows: [picture] } = await db.query(
      "SELECT item_id, price FROM shop_items WHERE item_type = 'PROFILE_PICTURE' AND is_available = 1 AND price > 0 ORDER BY item_id LIMIT 1");
    const res = await server.call('/api/shop/buy', { body: { userId, itemId: picture.item_id } });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const codes = (res.body.new_achievements || []).map((a) => a.code);
    for (const code of ['level_ten', 'level_twenty', 'level_twentyfive', 'level_thirty', 'level_forty', 'level_fifty']) {
      assert.ok(codes.includes(code), `${code} in ${codes}`);
    }
    assert.ok(!codes.includes('level_sixty'));

    const { rows: owned } = await db.query(
      `SELECT si.asset_url FROM user_inventory ui JOIN shop_items si ON si.item_id = ui.item_id
        WHERE ui.user_id = $1 AND si.asset_url LIKE '/uploads/%level-%' ORDER BY si.asset_url`, [userId]);
    assert.deepEqual(owned.map((r) => r.asset_url),
      ['/uploads/avatar-level-50.svg', '/uploads/frame-level-25.svg', '/uploads/frame-level-50.svg']);
  });

  await t.test('the popup gets each unlock once, with its rewards', async () => {
    const first = await server.call('/api/achievement-unlocks/unseen', { method: 'GET' });
    assert.equal(first.status, 200, JSON.stringify(first.body));
    const fifty = first.body.unlocks.find((u) => u.code === 'level_fifty');
    assert.ok(fifty, JSON.stringify(first.body));
    assert.deepEqual(fifty.reward_items.map((i) => i.type).sort(), ['PROFILE_FRAME', 'PROFILE_PICTURE']);
    assert.equal(first.body.unlocks.find((u) => u.code === 'level_forty').reward_money, 2000);

    const marked = await server.call('/api/achievement-unlocks/seen', {
      body: { achievement_ids: first.body.unlocks.map((u) => u.achievement_id) },
    });
    assert.equal(marked.status, 200);
    const after = await server.call('/api/achievement-unlocks/unseen', { method: 'GET' });
    assert.deepEqual(after.body.unlocks, []);
  });

  await t.test('a signed-out visitor gets nothing', async () => {
    const res = await server.anonymous('/api/achievement-unlocks/unseen', { method: 'GET' });
    assert.equal(res.status, 401);
  });
});
