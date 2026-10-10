async function removeMemberLocked(connection, room, userName) {
  const [[member]] = await connection.query(
    `SELECT id, user_name, participant_kind FROM arcade_participants
     WHERE room_id = ? AND user_name = ? FOR UPDATE`,
    [room.room_id, userName]
  );
  if (!member) return { removed: false, roomDeleted: false, nextHost: room.host_name };

  await connection.query('DELETE FROM arcade_participants WHERE id = ?', [member.id]);
  const [humans] = await connection.query(
    `SELECT id, user_name FROM arcade_participants
     WHERE room_id = ? AND participant_kind = 'human'
     ORDER BY joined_at ASC, id ASC FOR UPDATE`,
    [room.room_id]
  );

  if (!humans.length) {
    await connection.query('DELETE FROM arcade_rooms WHERE room_id = ?', [room.room_id]);
    return { removed: true, roomDeleted: true, nextHost: null };
  }

  const currentHostStillPresent = humans.some((participant) => participant.user_name === room.host_name);
  const nextHost = currentHostStillPresent ? room.host_name : humans[0].user_name;
  await connection.query('UPDATE arcade_rooms SET host_name = ?, updated_at = CURRENT_TIMESTAMP WHERE room_id = ?', [nextHost, room.room_id]);
  await connection.query(
    `UPDATE arcade_participants
     SET is_host = CASE WHEN participant_kind = 'human' AND user_name = ? THEN 1 ELSE 0 END
     WHERE room_id = ?`,
    [nextHost, room.room_id]
  );
  return { removed: true, roomDeleted: false, nextHost };
}

async function leaveArcadeRoom(db, roomId, userName) {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [[room]] = await connection.query('SELECT * FROM arcade_rooms WHERE room_id = ? FOR UPDATE', [roomId]);
    if (!room) {
      await connection.rollback();
      return { removed: false, roomDeleted: true, nextHost: null };
    }
    const result = await removeMemberLocked(connection, room, userName);
    await connection.commit();
    return result;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

function installArcadeRoomMembership(app, db) {
  app.post('/api/arcade/rooms/:id/transfer-host', async (req, res) => {
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
      const [[room]] = await connection.query('SELECT * FROM arcade_rooms WHERE room_id = ? FOR UPDATE', [req.params.id]);
      if (!room) {
        await connection.rollback();
        return res.status(404).json({ error: 'ไม่พบห้อง' });
      }
      const [participants] = await connection.query(
        'SELECT id, user_name, participant_kind FROM arcade_participants WHERE room_id = ? ORDER BY id FOR UPDATE',
        [room.room_id]
      );
      const actor = participants.find((participant) => participant.user_name === req.player.username);
      if (!actor || actor.participant_kind !== 'human' || room.host_name !== actor.user_name) {
        await connection.rollback();
        return res.status(403).json({ error: 'สิทธิ์เฉพาะหัวห้องเท่านั้น' });
      }
      const target = participants.find((participant) => participant.user_name === req.body.target_user_name);
      if (!target || target.participant_kind !== 'human') {
        await connection.rollback();
        return res.status(400).json({ error: 'โอนตำแหน่งหัวห้องได้เฉพาะผู้เล่นจริงในห้อง' });
      }

      await connection.query('UPDATE arcade_rooms SET host_name = ?, updated_at = CURRENT_TIMESTAMP WHERE room_id = ?', [target.user_name, room.room_id]);
      await connection.query(
        `UPDATE arcade_participants
         SET is_host = CASE WHEN participant_kind = 'human' AND user_name = ? THEN 1 ELSE 0 END
         WHERE room_id = ?`,
        [target.user_name, room.room_id]
      );
      await connection.commit();
      res.json({ success: true, message: `โอนตำแหน่งหัวห้องให้คุณ ${target.user_name} เรียบร้อยแล้ว` });
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Arcade host transfer failed:', error.message);
      res.status(500).json({ error: 'ดำเนินการไม่สำเร็จ กรุณาลองอีกครั้ง' });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/arcade/rooms/:id/kick', async (req, res) => {
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
      const [[room]] = await connection.query('SELECT * FROM arcade_rooms WHERE room_id = ? FOR UPDATE', [req.params.id]);
      if (!room) {
        await connection.rollback();
        return res.status(404).json({ error: 'ไม่พบห้อง' });
      }
      const [[actor]] = await connection.query(
        "SELECT id FROM arcade_participants WHERE room_id = ? AND user_name = ? AND participant_kind = 'human' FOR UPDATE",
        [room.room_id, req.player.username]
      );
      if (!actor || room.host_name !== req.player.username) {
        await connection.rollback();
        return res.status(403).json({ error: 'สิทธิ์เฉพาะหัวห้องเท่านั้น' });
      }
      const targetName = req.body.target_user_name;
      if (!targetName || targetName === req.player.username) {
        await connection.rollback();
        return res.status(400).json({ error: 'หัวห้องต้องใช้คำสั่งออกจากห้องสำหรับตนเอง' });
      }
      const result = await removeMemberLocked(connection, room, targetName);
      if (!result.removed) {
        await connection.rollback();
        return res.status(404).json({ error: 'ไม่พบผู้เล่นในห้องนี้' });
      }
      await connection.commit();
      res.json({ success: true, message: `เตะผู้เล่น ${targetName} ออกจากห้องแล้ว` });
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Arcade kick failed:', error.message);
      res.status(500).json({ error: 'ดำเนินการไม่สำเร็จ กรุณาลองอีกครั้ง' });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post('/api/arcade/rooms/:id/leave', async (req, res) => {
    try {
      const result = await leaveArcadeRoom(db, req.params.id, req.player.username);
      res.json({ success: true, ...result, message: 'ออกจากห้องเรียบร้อยแล้ว' });
    } catch (error) {
      console.error('Arcade leave failed:', error.message);
      res.status(500).json({ error: 'ดำเนินการไม่สำเร็จ กรุณาลองอีกครั้ง' });
    }
  });

  app.post('/api/arcade/rooms/:id/finish-choice', async (req, res) => {
    const choice = req.body.choice;
    if (!['LEAVE', 'REMAIN'].includes(choice)) return res.status(400).json({ error: 'Invalid finish choice' });

    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
      const [[room]] = await connection.query('SELECT * FROM arcade_rooms WHERE room_id = ? FOR UPDATE', [req.params.id]);
      if (!room) {
        await connection.rollback();
        return res.status(404).json({ error: 'ไม่พบห้อง' });
      }
      const [[member]] = await connection.query(
        "SELECT * FROM arcade_participants WHERE room_id = ? AND user_name = ? AND participant_kind = 'human' FOR UPDATE",
        [room.room_id, req.player.username]
      );
      if (!member) {
        await connection.rollback();
        return res.status(403).json({ error: 'เฉพาะผู้เล่นในห้องเท่านั้น' });
      }
      const [[match]] = await connection.query('SELECT ended_at FROM arcade_matches WHERE match_id = ?', [room.current_match_id]);
      const alreadyReopened = room.status === 'WAITING' && room.phase === 'LOBBY';
      if (!match?.ended_at || (room.phase !== 'RESULT' && !alreadyReopened)) {
        await connection.rollback();
        return res.status(409).json({ error: 'การแข่งขันยังไม่จบ' });
      }

      if (choice === 'LEAVE') {
        const result = await removeMemberLocked(connection, room, member.user_name);
        await connection.commit();
        return res.json({ success: true, choice, ...result });
      }

      await connection.query(
        `UPDATE arcade_participants SET score = 0, cash = 0, is_eliminated = 0, has_submitted = 0,
         pending_round_score = NULL, submitted_code = NULL, submitted_at = NULL, score_multiplier_active = 0,
         draft_code = NULL, draft_updated_at = NULL WHERE id = ?`,
        [member.id]
      );
      if (!alreadyReopened) {
        await connection.query(
          `UPDATE arcade_rooms SET status = 'WAITING', current_round = 0, phase = 'LOBBY', phase_deadline = NULL,
           last_round_summary = NULL, updated_at = CURRENT_TIMESTAMP WHERE room_id = ?`,
          [room.room_id]
        );
      }
      await connection.commit();
      res.json({ success: true, choice });
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Arcade finish choice failed:', error.message);
      res.status(500).json({ error: 'ดำเนินการไม่สำเร็จ กรุณาลองอีกครั้ง' });
    } finally {
      if (connection) connection.release();
    }
  });
}

module.exports = { installArcadeRoomMembership, leaveArcadeRoom };
