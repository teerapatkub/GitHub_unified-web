async function migrateArcadeBots(db) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('SELECT pg_advisory_xact_lock(71602109)');
    const [installed] = await connection.query("SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'arcade_participants' AND column_name = 'participant_kind'");
    if (!installed.length) {
      const [active] = await connection.query("SELECT room_id FROM arcade_rooms WHERE status = 'PLAYING' AND phase NOT IN ('LOBBY', 'RESULT')");
      if (active.length) throw new Error('Finish active Arcade matches before installing server bots.');
      const [unknown] = await connection.query('SELECT p.id FROM arcade_participants p LEFT JOIN users u ON u.username = p.user_name WHERE u.user_id IS NULL LIMIT 1');
      if (unknown.length) throw new Error('Remove legacy bots or close their rooms before installing typed participants; unowned names cannot safely identify bots.');
    }
    await connection.query("ALTER TABLE arcade_participants ADD COLUMN IF NOT EXISTS participant_kind TEXT NOT NULL DEFAULT 'human' CHECK (participant_kind IN ('human', 'bot'))");
    await connection.query('ALTER TABLE arcade_participants ADD COLUMN IF NOT EXISTS bot_profile TEXT');
    await connection.query("ALTER TABLE arcade_participants ADD COLUMN IF NOT EXISTS bot_state JSONB NOT NULL DEFAULT '{}'");
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
module.exports = { migrateArcadeBots };
