const { randomInt, randomUUID } = require('node:crypto');
const profiles = require('../../shared/arcadeBotProfiles.json');
const { publicParticipants } = require('./room-api');

function installArcadeBots(app, db) {
  // A later account registration must not acquire control of an existing bot.
  app.use('/api/arcade/rooms/:id', async (req, res, next) => {
    if (!/^\d+$/.test(req.params.id)) return next();
    try {
      const [[actor]] = await db.query('SELECT participant_kind FROM arcade_participants WHERE room_id = ? AND user_name = ?', [req.params.id, req.player.username]);
      if (actor?.participant_kind === 'bot') return res.status(403).json({ error: 'Only human members can send player commands' });
      next();
    } catch (error) { next(error); }
  });
  app.post('/api/arcade/rooms/:id/add-bot', async (req, res) => {
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
      const reject = async (status, error) => {
        await connection.rollback();
        return res.status(status).json({ error });
      };
      const [[room]] = await connection.query('SELECT * FROM arcade_rooms WHERE room_id = ? FOR UPDATE', [req.params.id]);
      if (!room) return await reject(404, 'ไม่พบห้อง');
      const [participants] = await connection.query('SELECT * FROM arcade_participants WHERE room_id = ?', [room.room_id]);
      if (room.host_name !== req.player.username || !participants.some(p => p.user_name === req.player.username && p.participant_kind === 'human')) return await reject(403, 'สิทธิ์เฉพาะหัวห้องเท่านั้น');
      if (room.status !== 'WAITING' || room.phase !== 'LOBBY') return await reject(409, 'เพิ่มบอทได้ก่อนเริ่มการแข่งขันเท่านั้น');
      if (participants.length >= room.max_players) return await reject(409, 'ห้องเต็มแล้ว');
      const profile = profiles[randomInt(profiles.length)];
      let name = profile.name;
      for (;;) {
        const [accounts] = await connection.query('SELECT user_id FROM users WHERE username = ?', [name]);
        if (!accounts.length && !participants.some(p => p.user_name === name)) break;
        name = `${profile.name}_${randomUUID().slice(0, 8)}`;
      }
      await connection.query("INSERT INTO arcade_participants (room_id, user_name, participant_kind, bot_profile) VALUES (?, ?, 'bot', ?)", [room.room_id, name, profile.id]);
      const [updated] = await connection.query('SELECT * FROM arcade_participants WHERE room_id = ? ORDER BY joined_at, id', [room.room_id]);
      await connection.commit();
      res.json({ success: true, bot_name: name, participants: publicParticipants(updated) });
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Arcade add bot failed:', error.message);
      res.status(500).json({ error: 'เพิ่มบอทไม่สำเร็จ กรุณาลองอีกครั้ง' });
    } finally {
      if (connection) connection.release();
    }
  });
}
module.exports = { installArcadeBots };
