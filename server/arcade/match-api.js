const arcadeConfig = require('../../shared/arcadeConfig.json');
const arcadePhaseDurations = room => room?.round_duration_mode === 'quick' ? arcadeConfig.quickModePhaseDurations : arcadeConfig.phaseDurations;

async function drawArcadeRoundTasks(db, room) {
  const pickFrom = room.difficulty && room.difficulty !== 'default'
    ? [room.difficulty]
    : ['easy', 'medium'];
  const finaleDifficulty = arcadeConfig.finalePoolByDifficulty[room.difficulty || 'default']
    || arcadeConfig.finalePoolByDifficulty.default;

  const [pool] = await db.query(
    `SELECT task_id, work_chars FROM arcade_tasks WHERE difficulty IN (${pickFrom.map(() => '?').join(',')})`,
    pickFrom
  );
  const [finalePool] = await db.query(
    `SELECT task_id, work_chars FROM arcade_tasks WHERE difficulty = ?`,
    [finaleDifficulty]
  );

  // Every round in a mode is the same length, so one budget covers the draw.
  // autoSubmitLeadSeconds comes off the top because the client submits for
  // the player that far before the deadline - those seconds were never
  // typing time.
  const roundSeconds = arcadePhaseDurations(room).ROUND_1;
  const budget = Math.max(0, roundSeconds - arcadeConfig.autoSubmitLeadSeconds)
    * arcadeConfig.beginnerCharsPerMinute / 60;

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Prefer problems that fit the clock, but never fail the draw over it. If
  // too few fit - a very short mode, or rows seeded before work_chars existed
  // and still NULL - fall back to the shortest available. Returning null here
  // would silently drop the match back onto the three fixed built-in tasks.
  const fitted = (rows, needed) => {
    const list = (rows || []).map(r => ({ id: r.task_id, work: r.work_chars ?? Infinity }));
    const inBudget = shuffle(list.filter(r => r.work <= budget)).map(r => r.id);
    if (inBudget.length >= needed) return inBudget;
    const rest = list.filter(r => r.work > budget)
      .sort((a, b) => a.work - b.work)
      .map(r => r.id);
    return [...inBudget, ...rest];
  };

  const early = fitted(pool, 3).slice(0, 3);
  // Round 4 must not repeat anything Rounds 1-3 already used, which is
  // possible whenever the finale pool is the same one Rounds 1-3 drew from.
  const finale = fitted(finalePool, 1).filter(id => !early.includes(id))[0];

  if (early.length < 3 || finale === undefined) return null;
  return [...early, finale];
}

function installArcadeMatchStart(app, db) {
  app.post('/api/arcade/rooms/:id/start', async (req, res) => {
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
      const [rooms] = await connection.query('SELECT * FROM arcade_rooms WHERE room_id = ? FOR UPDATE', [req.params.id]);
      const room = rooms[0];
      const reject = async (status, error) => {
        await connection.rollback();
        return res.status(status).json({ error });
      };
      if (!room) return await reject(404, 'ไม่พบห้อง');
      const [participants] = await connection.query('SELECT user_name FROM arcade_participants WHERE room_id = ?', [room.room_id]);
      if (room.host_name !== req.player.username || !participants.some(p => p.user_name === req.player.username)) {
        return await reject(403, 'สิทธิ์เฉพาะหัวห้องเท่านั้น');
      }
      if (room.status !== 'WAITING' || room.phase !== 'LOBBY') {
        return await reject(409, 'ห้องนี้เริ่มการแข่งขันแล้ว');
      }
      if (participants.length < 2) return await reject(400, 'ต้องมีผู้เล่นอย่างน้อย 2 คน');
      const drawnTasks = await drawArcadeRoundTasks(connection, room);
      const tasks = drawnTasks ? JSON.stringify(drawnTasks) : null;
      const deadline = new Date(Date.now() + arcadePhaseDurations(room).ROUND_1 * 1000);
      const [inserted] = await connection.query(
        `INSERT INTO arcade_matches (room_id, room_code, room_name, difficulty, round_duration_mode, round_task_ids)
         VALUES (?, ?, ?, ?, ?, ?) RETURNING match_id`,
        [room.room_id, room.room_code, room.room_name, room.difficulty, room.round_duration_mode, tasks]
      );
      const matchId = inserted.insertId;
      await connection.query(
        `UPDATE arcade_rooms SET current_match_id = ?, status = 'PLAYING', phase = 'ROUND_1', phase_deadline = ?,
         current_round = 1, last_round_summary = NULL, round_task_ids = ? WHERE room_id = ?`,
        [matchId, deadline, tasks, room.room_id]
      );
      await connection.query(
        `UPDATE arcade_participants SET match_id = ?, score = 0, cash = 0, coins_awarded = 0, is_eliminated = 0,
         has_submitted = 0, pending_round_score = NULL, submitted_code = NULL, submitted_at = NULL,
         score_multiplier_active = 0, draft_code = NULL, draft_updated_at = NULL WHERE room_id = ?`,
        [matchId, room.room_id]
      );
      await connection.query('DELETE FROM arcade_effects WHERE room_id = ?', [room.room_id]);
      await connection.commit();
      res.json({ success: true, match_id: matchId, message: 'เริ่มการแข่งขันแล้ว!' });
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Arcade match action failed:', error.message);
      res.status(500).json({ error: 'ดำเนินการไม่สำเร็จ กรุณาลองอีกครั้ง' });
    } finally {
      if (connection) connection.release();
    }
  });
  // Protect the start invariant: a finish action must not reopen a live match.
  app.post('/api/arcade/rooms/:id/finish-choice', async (req, res) => {
    let connection;
    try {
      const { choice } = req.body;
      if (!['LEAVE', 'REMAIN'].includes(choice)) return res.status(400).json({ error: 'Invalid finish choice' });
      connection = await db.getConnection();
      await connection.beginTransaction();
      const [[room]] = await connection.query('SELECT * FROM arcade_rooms WHERE room_id = ? FOR UPDATE', [req.params.id]);
      const [members] = await connection.query('SELECT id FROM arcade_participants WHERE room_id = ? AND user_name = ?', [req.params.id, req.player.username]);
      if (!room || !members.length) {
        await connection.rollback();
        return res.status(403).json({ error: 'เฉพาะผู้เล่นในห้องเท่านั้น' });
      }
      const alreadyReopened = room.status === 'WAITING' && room.phase === 'LOBBY' && room.current_match_id;
      if (room.phase !== 'RESULT' && !alreadyReopened) {
        await connection.rollback();
        return res.status(409).json({ error: 'การแข่งขันยังไม่จบ' });
      }
      if (choice === 'LEAVE') {
        await connection.query('DELETE FROM arcade_participants WHERE id = ?', [members[0].id]);
      } else {
        await connection.query(
          `UPDATE arcade_participants SET score = 0, cash = 0, is_eliminated = 0, has_submitted = 0,
           pending_round_score = NULL, submitted_code = NULL, submitted_at = NULL, score_multiplier_active = 0,
           draft_code = NULL, draft_updated_at = NULL WHERE id = ?`, [members[0].id]
        );
        await connection.query(
          `UPDATE arcade_rooms SET status = 'WAITING', current_round = 0, phase = 'LOBBY', phase_deadline = NULL,
           last_round_summary = NULL WHERE room_id = ?`, [room.room_id]
        );
      }
      await connection.commit();
      res.json({ success: true, choice });
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Arcade match action failed:', error.message);
      res.status(500).json({ error: 'ดำเนินการไม่สำเร็จ กรุณาลองอีกครั้ง' });
    } finally {
      if (connection) connection.release();
    }
  });
}
module.exports = { installArcadeMatchStart };
