// Match identity survives room deletion. This migration runs in one transaction.
async function migrateArcadeMatches(db) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("SELECT pg_advisory_xact_lock(71602102)");
    const [columns] = await connection.query(`SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'arcade_rooms' AND column_name = 'current_match_id'`);
    if (!columns.length) {
      const [active] = await connection.query("SELECT room_id FROM arcade_rooms WHERE status = 'PLAYING' AND phase <> 'RESULT'");
      if (active.length) throw new Error('Finish active Arcade matches before applying the match identity migration.');
    }
    await connection.query(`CREATE TABLE IF NOT EXISTS arcade_matches (
      match_id SERIAL PRIMARY KEY,
      room_id INTEGER NOT NULL,
      legacy_room_id INTEGER UNIQUE,
      room_code VARCHAR(10), room_name VARCHAR(100),
      difficulty VARCHAR(20), round_duration_mode VARCHAR(20), round_task_ids JSONB,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ended_at TIMESTAMP
    )`);
    await connection.query('ALTER TABLE arcade_matches ENABLE ROW LEVEL SECURITY');
    await connection.query('REVOKE ALL ON arcade_matches FROM PUBLIC');
    const [roles] = await connection.query("SELECT rolname FROM pg_roles WHERE rolname IN ('anon', 'authenticated')");
    for (const { rolname } of roles) {
      await connection.query(`REVOKE ALL ON arcade_matches FROM "${rolname}"`);
    }
    await connection.query('ALTER TABLE arcade_rooms ADD COLUMN IF NOT EXISTS current_match_id INTEGER REFERENCES arcade_matches(match_id)');
    await connection.query('ALTER TABLE arcade_participants ADD COLUMN IF NOT EXISTS match_id INTEGER REFERENCES arcade_matches(match_id)');
    await connection.query('ALTER TABLE arcade_effects ADD COLUMN IF NOT EXISTS match_id INTEGER REFERENCES arcade_matches(match_id)');
    await connection.query('ALTER TABLE arcade_round_history ADD COLUMN IF NOT EXISTS match_id INTEGER REFERENCES arcade_matches(match_id)');
    // The old schema retained at most one round set per room. Preserve exactly
    // those recorded rows, including abandoned matches; never invent lost games.
    await connection.query(`INSERT INTO arcade_matches
      (room_id, legacy_room_id, room_code, room_name, difficulty, round_duration_mode, started_at, ended_at)
      SELECT room_id, room_id, MAX(room_code), MAX(room_name), MAX(difficulty), MAX(round_duration_mode), NULL, MAX(match_ended_at)
      FROM arcade_round_history WHERE match_id IS NULL GROUP BY room_id ORDER BY room_id ASC
      ON CONFLICT (legacy_room_id) DO NOTHING`);
    await connection.query(`UPDATE arcade_round_history h SET match_id = m.match_id
      FROM arcade_matches m WHERE h.match_id IS NULL AND m.legacy_room_id = h.room_id`);
    await connection.query(`INSERT INTO arcade_matches
      (room_id, legacy_room_id, room_code, room_name, difficulty, round_duration_mode, round_task_ids, started_at)
      SELECT room_id, room_id, room_code, room_name, difficulty, round_duration_mode, round_task_ids, NULL
      FROM arcade_rooms WHERE phase = 'RESULT' AND current_match_id IS NULL
      ON CONFLICT (legacy_room_id) DO NOTHING`);
    await connection.query(`UPDATE arcade_rooms r SET current_match_id = m.match_id FROM arcade_matches m
      WHERE r.phase = 'RESULT' AND r.current_match_id IS NULL AND m.legacy_room_id = r.room_id`);
    await connection.query(`UPDATE arcade_participants p SET match_id = r.current_match_id FROM arcade_rooms r
      WHERE p.room_id = r.room_id AND p.match_id IS NULL AND r.current_match_id IS NOT NULL`);
    await connection.query(`UPDATE arcade_effects e SET match_id = r.current_match_id FROM arcade_rooms r
      WHERE e.room_id = r.room_id AND e.match_id IS NULL AND r.current_match_id IS NOT NULL`);
    await connection.query('ALTER TABLE arcade_round_history ALTER COLUMN match_id SET NOT NULL');
    await connection.query('ALTER TABLE arcade_round_history DROP CONSTRAINT IF EXISTS arcade_round_history_room_id_user_name_round_num_key');
    await connection.query('CREATE UNIQUE INDEX IF NOT EXISTS arcade_history_match_round ON arcade_round_history (match_id, user_name, round_num)');
    await connection.query('CREATE INDEX IF NOT EXISTS arcade_history_player_match ON arcade_round_history (user_name, match_id DESC)');
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
module.exports = { migrateArcadeMatches };
