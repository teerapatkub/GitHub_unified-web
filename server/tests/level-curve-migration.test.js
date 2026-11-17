// Converting existing players to total XP (migrate-level-curve.js): everyone
// keeps their level, a level over 100 comes down to 100, and the conversion
// itself never levels anyone up. Run on a bare users table in a disposable
// database, so the rows can be set up before the migration sees them.
const assert = require('node:assert/strict');
const test = require('node:test');
const { Pool } = require('pg');
const { createTestDatabase } = require('./helpers/start-server');
const { migrateLevelCurve } = require('../migrate-level-curve');
const levels = require('../levels');

test('existing players keep their level on the new curve', { timeout: 120_000 }, async (t) => {
  const url = await createTestDatabase(t, 'pyarena_levelcurve');
  const db = new Pool({ connectionString: url, ssl: false });
  db.on('error', () => {});
  t.after(() => db.end());
  await db.query('CREATE TABLE users (user_id serial PRIMARY KEY, level integer, xp integer)');
  const rows = [
    [0, 50],      // placement not done yet: untouched
    [1, 40],      // 40 XP into level 1
    [12, 90],     // 90 XP into level 12
    [12, 99999],  // more than level 12 needs: capped one short of 13
    [99, 500],
    [150, 7],     // above the top
    [100, 2500],  // at the top: the extra is kept
  ];
  for (const [level, xp] of rows) await db.query('INSERT INTO users (level, xp) VALUES ($1, $2)', [level, xp]);

  const wrapper = {
    query: async (sql, params = []) => {
      let n = 0;
      const result = await db.query(sql.replace(/\?/g, () => `$${++n}`), params);
      return [result.rows];
    },
  };
  await migrateLevelCurve(wrapper);
  const { rows: after } = await db.query('SELECT level, xp FROM users ORDER BY user_id');

  assert.deepEqual(after[0], { level: 0, xp: 50 });
  assert.deepEqual(after[1], { level: 1, xp: 40 });
  assert.deepEqual(after[2], { level: 12, xp: levels.xpForLevel(12) + 90 });
  assert.deepEqual(after[3], { level: 12, xp: levels.xpForLevel(13) - 1 });
  assert.deepEqual(after[4], { level: 99, xp: levels.xpForLevel(99) + 500 });
  assert.deepEqual(after[5], { level: 100, xp: levels.xpForLevel(100) + 7 });
  assert.deepEqual(after[6], { level: 100, xp: levels.xpForLevel(100) + 2500 });
  // Nobody's level, read back through the curve, differs from the one stored.
  for (const r of after.filter((x) => x.level >= 1)) assert.equal(levels.levelForXp(r.xp), r.level);
});
