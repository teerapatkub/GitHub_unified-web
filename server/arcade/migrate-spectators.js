// A guess of the last survivor by a player who is already out (Spec 0005 #24):
// one row per spectator per match, paid at settlement through the reward
// receipt (guess_coins), which is written once per match and so cannot pay twice.
async function migrateArcadeSpectators(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS arcade_spectator_guesses (
    match_id INTEGER NOT NULL REFERENCES arcade_matches(match_id) ON DELETE CASCADE,
    user_name VARCHAR(50) NOT NULL,
    guessed_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (match_id, user_name)
  )`);
  await db.query('ALTER TABLE arcade_spectator_guesses ENABLE ROW LEVEL SECURITY');
  await db.query('REVOKE ALL ON arcade_spectator_guesses FROM PUBLIC');
  await db.query('ALTER TABLE arcade_reward_receipts ADD COLUMN IF NOT EXISTS guess_coins INTEGER NOT NULL DEFAULT 0');
}

module.exports = { migrateArcadeSpectators };
