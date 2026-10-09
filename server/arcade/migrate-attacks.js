async function migrateArcadeAttacks(db) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('SELECT pg_advisory_xact_lock(71602108)');
    const [installed] = await connection.query("SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'arcade_shop_states' AND column_name = 'attack_effects'");
    if (!installed.length) {
      const [active] = await connection.query("SELECT room_id FROM arcade_rooms WHERE status = 'PLAYING' AND phase NOT IN ('LOBBY', 'RESULT')");
      if (active.length) throw new Error('Finish active Arcade matches before applying authoritative attacks. Browser-only debuffs cannot be recovered.');
    }
    await connection.query("ALTER TABLE arcade_shop_states ADD COLUMN IF NOT EXISTS attack_effects JSONB NOT NULL DEFAULT '[]'");
    await connection.query('ALTER TABLE arcade_shop_commands ADD COLUMN IF NOT EXISTS result JSONB');
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
module.exports = { migrateArcadeAttacks };
