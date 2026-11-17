// English names for lessons, chapters, cosmetics and achievements (fix list
// item 16.10, migrate-english-names.js). The real server is booted on a
// disposable database, so every row the seeds and migrations write is checked,
// and so is what the API hands the client.
const assert = require('node:assert/strict');
const test = require('node:test');
const { Pool } = require('pg');
const { createTestDatabase, startServer } = require('./helpers/start-server');
const { migrateEnglishNames } = require('../migrate-english-names');

const missing = (rows, ...columns) => rows.filter((row) => columns.some((c) => !String(row[c] ?? '').trim()));

test('every seeded row has English and the API serves it', { timeout: 600_000 }, async (t) => {
  const url = await createTestDatabase(t, 'pyarena_englishnames');
  const server = await startServer(t, { url, env: { LLM_BASE_URL: '', LLM_CHAT_MODEL: '' } });
  const db = new Pool({ connectionString: url, ssl: false });
  db.on('error', () => {});
  t.after(() => db.end());

  await t.test('9 chapters and 24 lessons, Thai left as it was', async () => {
    const { rows: modules } = await db.query('SELECT title, title_en FROM modules');
    const { rows: lessons } = await db.query('SELECT title, title_en FROM lessons');
    assert.equal(modules.length, 9);
    assert.equal(lessons.length, 24);
    assert.deepEqual(missing(modules, 'title_en'), []);
    assert.deepEqual(missing(lessons, 'title_en'), []);
    for (const row of [...modules, ...lessons]) {
      assert.match(row.title, /[฀-๿]/, `Thai title replaced: ${row.title}`);
      assert.doesNotMatch(row.title_en, /[฀-๿]/, `Thai left in English: ${row.title_en}`);
    }
  });

  await t.test('every cosmetic, set and achievement', async () => {
    const { rows: items } = await db.query(
      'SELECT name, description, name_en, description_en FROM shop_items WHERE is_active = 1');
    assert.ok(items.length >= 39, `only ${items.length} active cosmetics`);
    assert.deepEqual(missing(items, 'name_en').map((r) => r.name), []);
    // A Thai description gets an English one; an empty one stays empty.
    assert.deepEqual(missing(items.filter((r) => String(r.description || '').trim()), 'description_en')
      .map((r) => r.name), []);
    const { rows: sets } = await db.query('SELECT set_key, description_en FROM shop_sets');
    assert.deepEqual(missing(sets, 'description_en').map((r) => r.set_key), []);
    const { rows: achievements } = await db.query('SELECT code, name_en, description_en FROM achievements');
    assert.equal(achievements.length, 31);
    assert.deepEqual(missing(achievements, 'name_en', 'description_en').map((r) => r.code), []);
  });

  await t.test('the pages read English from the API', async () => {
    const course = await server.call(`/api/course-content?user_id=${server.userId}`, { method: 'GET' });
    assert.equal(course.status, 200);
    assert.equal(course.body[0].title_en, 'Getting Started with Python');
    assert.ok(course.body[0].lessons[0].title_en);

    const lesson = await server.call('/api/lessons/1', { method: 'GET' });
    assert.equal(lesson.status, 200);
    assert.ok(lesson.body.title_en);

    const shop = await server.call('/api/shop/items', { method: 'GET' });
    assert.ok(shop.body.length > 0 && shop.body.every((i) => i.name_en && (i.description_en || !i.description)));
    const sets = await server.call('/api/shop/sets', { method: 'GET' });
    assert.ok(sets.body.every((s) => s.description_en && s.items.every((i) => i.name_en)));

    const achievements = await server.call(`/api/achievements/${server.userId}`, { method: 'GET' });
    assert.ok(achievements.body.every((a) => a.name_en && a.description_en));
    const withItems = achievements.body.find((a) => a.code === 'level_fifty');
    assert.ok(withItems.reward_items.length > 0 && withItems.reward_items.every((i) => i.name_en));

    const profile = await server.call(`/api/profile/${server.userId}`, { method: 'GET' });
    assert.equal(profile.status, 200);
    assert.ok(profile.body.learning.modules.every((m) => m.title_en));
    assert.ok(profile.body.learning.lessons.every((l) => l.title_en));
    assert.ok(profile.body.achievements.items.every((a) => a.name_en && a.description_en));
  });

  await t.test('English an administrator wrote is never overwritten', async () => {
    await db.query("UPDATE modules SET title_en = 'Python 101' WHERE title = 'เริ่มต้นรู้จักกับภาษาไพธอน'");
    const wrapper = {
      query: async (sql, params = []) => {
        let n = 0;
        const result = await db.query(sql.replace(/\?/g, () => `$${++n}`), params);
        return [result.rows];
      },
    };
    await migrateEnglishNames(wrapper);
    const { rows: [row] } = await db.query("SELECT title_en FROM modules WHERE title = 'เริ่มต้นรู้จักกับภาษาไพธอน'");
    assert.equal(row.title_en, 'Python 101');
  });
});
