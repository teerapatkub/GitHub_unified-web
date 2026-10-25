// What the post-match achievement check paid on top of the match coins, kept
// on the match receipt so the result screen can show the whole amount
// (Spec 0005 ticket 08, bug A10). NULL = not checked yet; [] = checked, nothing
// unlocked. Receipts written before this have NULL and simply show no list.
async function migrateArcadeAchievementRewards(db) {
  await db.query('ALTER TABLE arcade_reward_receipts ADD COLUMN IF NOT EXISTS achievement_rewards JSONB');
}

module.exports = { migrateArcadeAchievementRewards };
