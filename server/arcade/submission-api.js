// Both writes use the authenticated player and the same room/participant locks.
// Grading is still performed by the server when the round closes.
const { verifiedMultiplier } = require('./self-effects');
function installArcadeSubmissions(app, db) {
  for (const action of ['submit-round', 'code-draft']) {
    app.post(`/api/arcade/rooms/:id/${action}`, async (req, res) => {
      const { match_id: matchId, round_num: roundNum, code } = req.body || {};
      if (!Number.isSafeInteger(matchId) || matchId <= 0
        || !Number.isInteger(roundNum) || roundNum < 1 || roundNum > 4
        || typeof code !== 'string' || code.length > 20000) {
        return res.status(400).json({ error: 'ข้อมูลแมตช์ รอบ หรือคำตอบไม่ถูกต้อง' });
      }
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
        const [[player]] = await connection.query(
          'SELECT * FROM arcade_participants WHERE room_id = ? AND user_name = ? FOR UPDATE',
          [room.room_id, req.player.username]
        );
        if (!player || player.participant_kind !== 'human') return await reject(403, 'เฉพาะผู้เล่นในห้องเท่านั้น');
        if (room.current_match_id !== matchId || player.match_id !== matchId
          || room.status !== 'PLAYING' || room.phase !== `ROUND_${roundNum}`) {
          return await reject(409, 'รอบการแข่งขันเปลี่ยนแล้ว กรุณารอข้อมูลล่าสุด');
        }
        if (player.is_eliminated) return await reject(403, 'คุณตกรอบไปแล้ว');
        const revision = req.body.draft_revision;
        const submitting = action === 'submit-round';
        if (player.has_submitted) {
          // A lost response can be retried, but a different answer cannot replace it.
          if (!submitting || player.submitted_code !== code) {
            return await reject(409, 'ส่งคำตอบสำหรับรอบนี้ไปแล้ว');
          }
          await connection.commit();
          return res.json({ success: true, match_id: matchId, round_num: roundNum });
        }
        if (!submitting && revision !== undefined) {
          if (!Number.isSafeInteger(revision) || revision < 0) return await reject(400, 'Invalid draft revision');
          if (revision !== player.draft_revision) {
            if (revision + 1 === player.draft_revision && code === player.draft_code) {
              await connection.commit();
              return res.json({ success: true, match_id: matchId, round_num: roundNum, draft_revision: player.draft_revision });
            }
            return await reject(409, 'Draft changed in another request. Reload the saved draft.');
          }
        }
        // Read the actual database clock AFTER acquiring locks. CURRENT_TIMESTAMP
        // is frozen at BEGIN and could admit a request that waited past the deadline.
        const [[timing]] = await connection.query(
          `SELECT clock_timestamp() AS received_at, phase_deadline > clock_timestamp() AS is_open
           FROM arcade_rooms WHERE room_id = ?`, [room.room_id]
        );
        if (!timing.is_open) return await reject(409, 'หมดเวลาส่งคำตอบสำหรับรอบนี้แล้ว');
        if (submitting) {
          const multiplierActive = await verifiedMultiplier(connection, matchId, player.user_name, room.phase, timing.received_at);
          await connection.query(
            `UPDATE arcade_participants SET submitted_code = ?, submitted_at = ?, has_submitted = 1,
             score_multiplier_active = ? WHERE id = ? AND has_submitted = 0`,
            [code, timing.received_at, multiplierActive, player.id]
          );
        } else {
          await connection.query(
            'UPDATE arcade_participants SET draft_code = ?, draft_updated_at = ?, draft_revision = draft_revision + 1 WHERE id = ?',
            [code, timing.received_at, player.id]
          );
        }
        await connection.commit();
        res.json({ success: true, match_id: matchId, round_num: roundNum, ...(!submitting ? { draft_revision: player.draft_revision + 1 } : {}) });
      } catch (error) {
        if (connection) await connection.rollback();
        console.error('Arcade answer write failed:', error.message);
        res.status(500).json({ error: 'บันทึกคำตอบไม่สำเร็จ กรุณาลองอีกครั้ง' });
      } finally {
        if (connection) connection.release();
      }
    });
  }
}
module.exports = { installArcadeSubmissions };
