async function migrateArcadeShop(db) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('SELECT pg_advisory_xact_lock(71602106)');
    const [installed] = await connection.query("SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'arcade_shop_states'");
    if (!installed.length) {
      const [active] = await connection.query("SELECT room_id FROM arcade_rooms WHERE status = 'PLAYING' AND phase NOT IN ('LOBBY', 'RESULT')");
      if (active.length) throw new Error('Finish active Arcade matches before applying the server shop migration. Browser-only inventories cannot be recovered.');
    }
    await connection.query(`CREATE TABLE IF NOT EXISTS arcade_shop_states (
      match_id INTEGER NOT NULL REFERENCES arcade_matches(match_id),
      user_name VARCHAR(50) NOT NULL,
      shop_phase VARCHAR(20), revision INTEGER NOT NULL DEFAULT 0,
      reroll_cost INTEGER NOT NULL DEFAULT 200,
      offers JSONB NOT NULL DEFAULT '[]', inventory JSONB NOT NULL DEFAULT '[]',
      PRIMARY KEY (match_id, user_name)
    )`);
    await connection.query(`CREATE TABLE IF NOT EXISTS arcade_shop_commands (
      match_id INTEGER NOT NULL, user_name VARCHAR(50) NOT NULL, request_id UUID NOT NULL,
      command JSONB NOT NULL,
      PRIMARY KEY (match_id, user_name, request_id),
      FOREIGN KEY (match_id, user_name) REFERENCES arcade_shop_states(match_id, user_name) ON DELETE CASCADE
    )`);
    const [roles] = await connection.query("SELECT rolname FROM pg_roles WHERE rolname IN ('anon', 'authenticated')");
    for (const table of ['arcade_shop_states', 'arcade_shop_commands']) {
      await connection.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
      await connection.query(`REVOKE ALL ON ${table} FROM PUBLIC`);
      for (const { rolname } of roles) await connection.query(`REVOKE ALL ON ${table} FROM "${rolname}"`);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
module.exports = { migrateArcadeShop };
