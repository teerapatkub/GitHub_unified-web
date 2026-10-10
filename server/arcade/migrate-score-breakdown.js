async function migrateArcadeScoreBreakdown(db) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('SELECT pg_advisory_xact_lock(71602111)');
    await connection.query(
      `ALTER TABLE arcade_round_history
       ADD COLUMN IF NOT EXISTS score_multiplier SMALLINT NOT NULL DEFAULT 1
       CHECK (score_multiplier IN (1, 2))`
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { migrateArcadeScoreBreakdown };
