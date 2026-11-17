// users.xp becomes total XP on the new level curve (fix list item 11,
// 2026-11-17; the curve itself is server/levels.js).
//
// What users.xp held before depended on which reward last touched it: lesson
// rewards reset it to 0 at every level-up, Debug Lab rewards let it run on. A
// player's true total cannot be rebuilt from that, so the owner chose to keep
// everyone's level and convert the XP around it:
//
//   - a level above 100 comes down to 100;
//   - xp becomes the total at which that level starts, plus the XP the player
//     already had towards the next one - capped one short of it, so nobody
//     levels up (or down) from the conversion itself;
//   - at level 100 the extra XP is all kept.
//
// Accounts still at level 0 (sign-up placement not done) are left alone;
// placement sets their level and the first reward counts from there.
//
// The formulas below are levels.xpForLevel and levels.xpToNext written in SQL,
// so the conversion is one statement however many players there are.

async function migrateLevelCurve(db) {
  const L = 'LEAST(level, 100)';
  await db.query(
    `UPDATE users
        SET xp = (100 * (${L} - 1) + 30 * (${L} - 1) * (${L} - 2))
                 + CASE WHEN ${L} >= 100 THEN GREATEST(COALESCE(xp, 0), 0)
                        ELSE LEAST(GREATEST(COALESCE(xp, 0), 0), 100 + 60 * (${L} - 1) - 1)
                   END,
            level = ${L}
      WHERE level >= 1`,
  );
}

module.exports = { migrateLevelCurve };
