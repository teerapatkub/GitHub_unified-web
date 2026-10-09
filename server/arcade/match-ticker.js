const { tickArcadeBots } = require('./bot-ticker');
const { createArcadePhaseFinalizer } = require('./phase-finalizer');

async function settleDueArcadeRooms({ db, judgeCodeQuality, afterMatchSettled, random }) {
  const finalize = createArcadePhaseFinalizer({ db, judgeCodeQuality, random });
  const [rooms] = await db.query(
    `SELECT * FROM arcade_rooms WHERE status = 'PLAYING' AND phase NOT IN ('LOBBY', 'RESULT') AND phase_deadline IS NOT NULL AND phase_deadline <= CURRENT_TIMESTAMP ORDER BY room_id`
  );
  const failures = [];
  for (const room of rooms) {
    try {
      const result = await finalize(room);
      if (result?.finished && afterMatchSettled) await afterMatchSettled(result.matchId);
    } catch (error) {
      // Keep this room due for retry, without blocking the other rooms' clocks.
      failures.push({ roomId: room.room_id, error });
    }
  }
  const [activeRooms] = await db.query("SELECT room_id FROM arcade_rooms WHERE status = 'PLAYING' AND phase_deadline > CURRENT_TIMESTAMP AND phase ~ '^(ROUND_[1-4]|SHOP_[1-3])$' ORDER BY room_id");
  for (const room of activeRooms) {
    try { await tickArcadeBots(db, room.room_id, random); }
    catch (error) { failures.push({ roomId: room.room_id, error }); }
  }
  return failures;
}

module.exports = { settleDueArcadeRooms };
