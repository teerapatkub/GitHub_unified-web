// Stored levels that fell behind their XP are brought up to it once
// (migrate-level-sync.js, UI review 2026-11-18). Nobody goes down, level 0
// (placement not done) is left alone. Run on a bare users table in a
// disposable database.
const assert = require('node:assert/strict');
const test = require('node:test');
const { Pool } = require('pg');
const { createTestDatabase } = require('./helpers/start-server');
const { migrateLevelSync } = require('../migrate-level-sync');
const levels = require('../levels');

test('stored levels catch up with XP, never go down', { timeout: 120_000 }, async (t) => {
  const url = await createTestDatabase(t, 'pyarena_levelsync');
  const db = new Pool({ connectionString: url, ssl: false });
  db.on('error', () => {});
  t.after(() => db.end());
  await db.query('CREATE TABLE users (user_id serial PRIMARY KEY, level integer, xp integer)');
  const rows = [
    [12, levels.xpForLevel(52) + 15], // behind its XP
    [30, 0], // level from an exam, little XP: kept
    [0, 9000], // placement not done: untouched
    [7, levels.xpForLevel(7) + 3], // already in step
    [40, levels.xpForLevel(100) + 999], // past the top
  ];
  for (const [level, xp] of rows) await db.query('INSERT INTO users (level, xp) VALUES ($1, $2)', [level, xp]);
  const wrapper = {
    query: async (sql, params = []) => {
      let n = 0;
      const result = await db.query(sql.replace(/\?/g, () => `$${++n}`), params);
      return [result.rows];
    },
  };
  await migrateLevelSync(wrapper);
  const { rows: after } = await db.query('SELECT level FROM users ORDER BY user_id');
  assert.deepEqual(after.map((r) => r.level), [52, 30, 0, 7, 100]);
});
