// The first-step achievements ("first lesson passed", "first code passed",
// ...) were all labelled "Medium", and no achievement was "Easy" at all, so the
// difficulty badge said nothing (Spec 0005 ticket 15, user test bug U11).
// The seed lives inside the checksummed core migration, so the change is its
// own migration rather than an edit to that seed.
const EASY_CODES = ['first_lesson', 'first_exercise', 'first_minigame', 'first_arcade', 'first_cosmetic'];

async function migrateAchievementDifficulty(db) {
  await db.query(
    `UPDATE achievements SET difficulty = 'Easy'
      WHERE code IN (${EASY_CODES.map(() => '?').join(', ')}) AND difficulty = 'Medium'`,
    EASY_CODES
  );
}

module.exports = { migrateAchievementDifficulty, EASY_CODES };
