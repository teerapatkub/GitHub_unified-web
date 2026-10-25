const bcrypt = require('bcryptjs');
const arcadeConfig = require('../../shared/arcadeConfig.json');
const { rematchRoster } = require('./match-api');
const { publicParticipants } = require('./room-api');

// Clamps a requested max_players to arcadeConfig.maxPlayers' [min, max] bound
// (shared with the client's "Max Players (2-5)" room-creation label) — used
// by both room creation and the settings-update endpoint.
function clampArcadeMaxPlayers(raw, fallback) {
  const { min, max } = arcadeConfig.maxPlayers;
  const parsed = parseInt(raw);
  return Math.min(max, Math.max(min, Number.isFinite(parsed) ? parsed : fallback));
}

async function previousMatchFor(executor, room) {
  if (!room.current_match_id) return null;
  const [[match]] = await executor.query(
    'SELECT ended_at FROM arcade_matches WHERE match_id = ?',
    [room.current_match_id]
  );
  return match || null;
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ARC-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function installArcadeLobbyRoutes(app, db, sanitizeName) {
  // The response carries the host's participant row so the lobby can show the
  // host and "1 / N" immediately instead of "0 / N" until the first poll (A8).
  app.post('/api/arcade/rooms/create', async (req, res) => {
    try {
      const { room_name: roomName, password, max_players: maxPlayers = 5, host_name: hostName, round_duration_mode: roundDurationMode, difficulty } = req.body || {};
      if (!roomName || !hostName) {
        return res.status(400).json({ error: 'กรุณาระบุชื่อห้องและชื่อผู้สร้างห้อง' });
      }
      const cleanRoomName = sanitizeName(roomName, 60);
      const cleanHostName = sanitizeName(hostName, 24);
      if (!cleanRoomName || !cleanHostName) {
        return res.status(400).json({ error: 'ชื่อห้องหรือชื่อผู้สร้างห้องไม่ถูกต้อง' });
      }
      const maxPlayersNum = clampArcadeMaxPlayers(maxPlayers, 5);
      // Phase 8.4 — validated against the whitelists in shared/arcadeConfig.json
      // rather than trusted, since both end up in the room row that drives
      // match pacing and task selection for everyone in it.
      const durationMode = arcadeConfig.roundDurationModes.includes(roundDurationMode) ? roundDurationMode : 'standard';
      const roomDifficulty = arcadeConfig.difficulties.includes(difficulty) ? difficulty : 'default';
      const roomCode = generateRoomCode();
      const pwdValue = (typeof password === 'string' && password.trim()) ? await bcrypt.hash(password.trim(), 10) : null;

      const [insertResult] = await db.query(
        `INSERT INTO arcade_rooms (room_code, room_name, host_name, password, max_players, status, round_duration_mode, difficulty)
         VALUES (?, ?, ?, ?, ?, 'WAITING', ?, ?) RETURNING room_id`,
        [roomCode, cleanRoomName, cleanHostName, pwdValue, maxPlayersNum, durationMode, roomDifficulty]
      );
      const roomId = insertResult[0]?.room_id || insertResult.insertId;

      await db.query('INSERT INTO arcade_participants (room_id, user_name, is_host) VALUES (?, ?, 1)', [roomId, cleanHostName]);
      const [participants] = await db.query('SELECT * FROM arcade_participants WHERE room_id = ? ORDER BY joined_at, id', [roomId]);

      res.json({
        success: true,
        room: {
          room_id: roomId,
          room_code: roomCode,
          room_name: cleanRoomName,
          host_name: cleanHostName,
          max_players: maxPlayersNum,
          round_duration_mode: durationMode,
          difficulty: roomDifficulty,
          status: 'WAITING',
          phase: 'LOBBY',
          is_password_protected: Boolean(pwdValue)
        },
        participants: publicParticipants(participants)
      });
    } catch (err) {
      console.error('❌ POST /api/arcade/rooms/create error:', err.message);
      res.status(500).json({ error: 'สร้างห้องไม่สำเร็จ กรุณาลองอีกครั้ง' });
    }
  });

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

  // Host updates room settings. The password is three-state on purpose: the
  // client never has the stored hash to echo back, so an omitted or empty
  // password means "keep it", and only clear_password makes the room public.
  // Treating "" as "remove" is how saving a rename used to unlock private rooms.
  app.post('/api/arcade/rooms/:id/settings', async (req, res) => {
    try {
      const { host_name: hostName, room_name: roomName, max_players: maxPlayers, password, clear_password: clearPassword } = req.body || {};
      const [[room]] = await db.query('SELECT * FROM arcade_rooms WHERE room_id = ?', [req.params.id]);
      if (!room) return res.status(404).json({ error: 'ไม่พบห้อง' });
      if (room.host_name !== hostName) return res.status(403).json({ error: 'สิทธิ์เฉพาะหัวห้องเท่านั้น' });

      const newName = roomName ? sanitizeName(roomName, 60) || room.room_name : room.room_name;
      const newMax = maxPlayers ? clampArcadeMaxPlayers(maxPlayers, room.max_players) : room.max_players;
      if (newMax < room.max_players) {
        const [participants] = await db.query('SELECT * FROM arcade_participants WHERE room_id = ?', [room.room_id]);
        const occupied = rematchRoster(room, await previousMatchFor(db, room), participants).length;
        if (newMax < occupied) {
          return res.status(409).json({ error: `ตอนนี้ในห้องมี ${occupied} คน ตั้งจำนวนผู้เล่นสูงสุดต่ำกว่านี้ไม่ได้` });
        }
      }

      const newPassword = typeof password === 'string' && password.trim() ? password.trim() : null;
      let storedPassword = room.password;
      if (newPassword) storedPassword = await bcrypt.hash(newPassword, 10);
      else if (clearPassword === true) storedPassword = null;

      await db.query(
        'UPDATE arcade_rooms SET room_name = ?, max_players = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE room_id = ?',
        [newName, newMax, storedPassword, room.room_id]
      );
      res.json({ success: true, message: 'อัปเดตการตั้งค่าห้องสำเร็จ', is_password_protected: Boolean(storedPassword) });
    } catch (err) {
      console.error('❌ POST /api/arcade/rooms/:id/settings error:', err.message);
      res.status(500).json({ error: 'อัปเดตการตั้งค่าห้องไม่สำเร็จ กรุณาลองอีกครั้ง' });
    }
  });
}

module.exports = { installArcadeLobbyRoutes, clampArcadeMaxPlayers };
