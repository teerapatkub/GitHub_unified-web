async function readPhaseClock(db, roomId) {
  const [[clock]] = await db.query(`SELECT
    phase_deadline > clock_timestamp() AS is_open,
    EXTRACT(EPOCH FROM clock_timestamp()) * 1000 AS now_ms,
    EXTRACT(EPOCH FROM (phase_deadline - clock_timestamp()::timestamp)) * 1000 AS remaining_ms
    FROM arcade_rooms WHERE room_id = ?`, [roomId]);
  if (!clock) return null;
  const nowMs = Number(clock.now_ms);
  const remainingMs = Number(clock.remaining_ms);
  return {
    isOpen: Boolean(clock.is_open),
    nowMs,
    deadlineMs: Number.isFinite(remainingMs) ? nowMs + remainingMs : null,
  };
}

module.exports = { readPhaseClock };
