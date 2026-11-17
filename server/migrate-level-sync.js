// Brings every stored level up to the level its XP has reached (UI review
// 2026-11-18, P0). The header showed users.level while the lesson and profile
// pages showed the level computed from XP, and a test account sat at level 12
// with the XP of level 52. Rewards already keep the two in step (levels.addXp);
// this catches rows changed some other way before the rule existed.
//
// Nobody goes down: a level won by an exam with little XP stays. Level 0 is an
// account whose sign-up placement is not done and is left alone. The curve is
// read from levels.js row by row rather than rewritten in SQL, so there is one
// formula; the update itself is parameterised.

const levels = require('./levels');

async function migrateLevelSync(db) {
  const [rows] = await db.query('SELECT user_id, level, xp FROM users WHERE level >= 1');
  for (const row of rows) {
    const next = levels.currentLevel(row.level, row.xp);
    if (next !== Number(row.level)) {
      await db.query('UPDATE users SET level = ? WHERE user_id = ?', [next, row.user_id]);
    }
  }
}

module.exports = { migrateLevelSync };
