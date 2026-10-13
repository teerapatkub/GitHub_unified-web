const bcrypt = require('bcryptjs');
const { rematchRoster } = require('./match-api');
const { publicParticipants } = require('./room-api');

async function previousMatchFor(executor, room) {
  if (!room.current_match_id) return null;
  const [[match]] = await executor.query(
    'SELECT ended_at FROM arcade_matches WHERE match_id = ?',
    [room.current_match_id]
  );
  return match || null;
}

function installArcadeLobbyRoutes(app, db, sanitizeName) {
  app.get('/api/arcade/rooms', async (req, res) => {
    try {
      const [rooms] = await db.query(
        `SELECT r.room_id, r.room_code, r.room_name, r.host_name, r.max_players, r.status, r.created_at,
                (r.password IS NOT NULL AND r.password != '') AS is_password_protected,
                COUNT(p.id) FILTER (WHERE m.ended_at IS NULL OR p.participant_kind = 'bot' OR p.match_id IS NULL) AS current_players
         FROM arcade_rooms r
         LEFT JOIN arcade_matches m ON m.match_id = r.current_match_id
         LEFT JOIN arcade_participants p ON r.room_id = p.room_id
         WHERE r.status = 'WAITING'
         GROUP BY r.room_id, r.room_code, r.room_name, r.host_name, r.max_players, r.status, r.created_at, r.password, m.ended_at
         ORDER BY r.created_at DESC`
      );
      res.json({ success: true, rooms: rooms || [] });
    } catch (error) {
      console.error('Arcade room list failed:', error.message);
      res.status(500).json({ error: 'โหลดรายการห้องไม่สำเร็จ' });
    }
  });

  // Lock the room before counting seats so concurrent joins cannot exceed capacity.
  app.post('/api/arcade/rooms/join', async (req, res) => {
    const { room_code_or_id: roomCodeOrId, password, user_name: userName } = req.body || {};
    if (!roomCodeOrId || !userName) return res.status(400).json({ error: 'กรุณาระบุรหัสห้องและชื่อผู้ใช้' });
    const cleanUserName = sanitizeName(userName, 24);
    if (!cleanUserName) return res.status(400).json({ error: 'ชื่อผู้ใช้ไม่ถูกต้อง' });

    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
      const queryTerm = String(roomCodeOrId).trim().toUpperCase();
      const [[room]] = await connection.query(
        'SELECT * FROM arcade_rooms WHERE (UPPER(room_code) = ? OR CAST(room_id AS TEXT) = ?) FOR UPDATE',
        [queryTerm, queryTerm]
      );
      const reject = async (status, error) => {
        await connection.rollback();
        return res.status(status).json({ error });
      };
      if (!room) return await reject(404, 'ไม่พบห้องแข่งขันที่ระบุ');
      if (room.status !== 'WAITING' || room.phase !== 'LOBBY') {
        return await reject(400, 'ห้องนี้เริ่มการแข่งขันไปแล้ว ไม่สามารถเข้าร่วมได้');
      }
      if (room.password && !(await bcrypt.compare(password || '', room.password))) {
        return await reject(401, 'รหัสผ่านเข้าห้องไม่ถูกต้อง');
      }
      const [participants] = await connection.query(
        'SELECT * FROM arcade_participants WHERE room_id = ? ORDER BY joined_at, id FOR UPDATE',
        [room.room_id]
      );
      const previousMatch = await previousMatchFor(connection, room);
      const active = rematchRoster(room, previousMatch, participants);
      const existing = participants.find(participant => participant.user_name === cleanUserName);
      if (existing?.participant_kind === 'bot') {
        return await reject(409, 'This name belongs to a bot in this room. Ask the host to remove it first.');
      }
      if (existing && !active.includes(existing)) {
        return await reject(409, 'กรุณาเลือกอยู่ต่อจากหน้าผลการแข่งขันก่อนเข้าห้องเดิม');
      }
      if (!existing && active.length >= room.max_players) {
        return await reject(400, 'ห้องนี้มีผู้เล่นเต็มจำนวนแล้ว');
      }
      if (!existing) {
        await connection.query(
          'INSERT INTO arcade_participants (room_id, user_name, is_host) VALUES (?, ?, 0)',
          [room.room_id, cleanUserName]
        );
        if (!active.some(participant => participant.participant_kind === 'human')) {
          await connection.query('UPDATE arcade_rooms SET host_name = ?, updated_at = CURRENT_TIMESTAMP WHERE room_id = ?',
            [cleanUserName, room.room_id]);
          await connection.query("UPDATE arcade_participants SET is_host = CASE WHEN user_name = ? AND participant_kind = 'human' THEN 1 ELSE 0 END WHERE room_id = ?",
            [cleanUserName, room.room_id]);
          room.host_name = cleanUserName;
        }
      }
      const [updated] = await connection.query(
        'SELECT * FROM arcade_participants WHERE room_id = ? ORDER BY joined_at, id',
        [room.room_id]
      );
      await connection.commit();
      const { password: _password, ...roomSafe } = room;
      res.json({ success: true, room: roomSafe, participants: publicParticipants(rematchRoster(room, previousMatch, updated)) });
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Arcade room join failed:', error.message);
      res.status(500).json({ error: 'เข้าห้องไม่สำเร็จ กรุณาลองอีกครั้ง' });
    } finally {
      if (connection) connection.release();
    }
  });
}

module.exports = { installArcadeLobbyRoutes };
