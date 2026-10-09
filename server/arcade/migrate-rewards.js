// Receipts belong to a match and account, not the disposable room/participant.
async function migrateArcadeRewards(db) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('SELECT pg_advisory_xact_lock(71602105)');
    await connection.query('ALTER TABLE arcade_matches ADD COLUMN IF NOT EXISTS final_standings JSONB');
    await connection.query(`CREATE TABLE IF NOT EXISTS arcade_reward_receipts (
      match_id INTEGER NOT NULL REFERENCES arcade_matches(match_id),
      user_id INTEGER NOT NULL REFERENCES users(user_id),
      user_name VARCHAR(50) NOT NULL,
      final_rank INTEGER NOT NULL CHECK (final_rank > 0),
      score INTEGER NOT NULL, cash INTEGER NOT NULL,
      coins INTEGER NOT NULL CHECK (coins >= 0),
      paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (match_id, user_id)
    )`);
    await connection.query('CREATE INDEX IF NOT EXISTS arcade_receipts_account ON arcade_reward_receipts (user_id, match_id DESC)');
    await connection.query('ALTER TABLE arcade_reward_receipts ENABLE ROW LEVEL SECURITY');
    await connection.query('REVOKE ALL ON arcade_reward_receipts FROM PUBLIC');
    const [roles] = await connection.query("SELECT rolname FROM pg_roles WHERE rolname IN ('anon', 'authenticated')");
    for (const { rolname } of roles) {
      await connection.query(`REVOKE ALL ON arcade_reward_receipts FROM "${rolname}"`);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { migrateArcadeRewards };
