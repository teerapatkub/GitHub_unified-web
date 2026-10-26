// What a right guess paid a spectator who left the room before the match ended
// (Spec 0005 #24). They have no seat and so no reward receipt; this column is
// set once in the settle transaction, so a settle that runs twice pays once.
async function migrateArcadeGuessPayouts(db) {
  await db.query('ALTER TABLE arcade_spectator_guesses ADD COLUMN IF NOT EXISTS paid_coins INTEGER');
}

module.exports = { migrateArcadeGuessPayouts };
