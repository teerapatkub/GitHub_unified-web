// Room polling and membership responses contain public gameplay state only.
function publicParticipants(rows) {
  const fields = ['id', 'room_id', 'match_id', 'user_name', 'is_host', 'score', 'cash',
    'participant_kind', 'bot_profile', 'is_eliminated', 'joined_at', 'last_seen', 'has_submitted', 'coins_awarded'];
  return rows.map(row => ({ ...Object.fromEntries(fields.filter(key => key in row).map(key => [key, row[key]])),
    ...(row.participant_kind === 'bot' ? { bot_progress: row.bot_state?.progress || 0 } : {}) }));
}

function installArcadeRoomReads(app, db) {
  // New players receive a zeroed career record for the lobby stats card.
  app.get('/api/arcade/players/:user_name/stats', async (req, res) => {
    try {
      const userName = req.params.user_name;
      const [rows] = await db.query(
        `SELECT user_name, matches_played, wins, best_rank, total_score, total_cash_earned
         FROM arcade_player_stats WHERE user_name = ?`,
        [userName]
      );
      const stats = rows?.[0] || {
        user_name: userName, matches_played: 0, wins: 0,
        best_rank: null, total_score: 0, total_cash_earned: 0
      };
      res.json({ success: true, stats });
    } catch (err) {
      console.error('❌ GET /api/arcade/players/:user_name/stats error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Get specific room state & participants. Polled every ~2s by every
  // connected client for the whole lobby+match lifetime, so it also doubles as
  // the presence heartbeat consumed by the stale-connection sweep below.
  app.get('/api/arcade/rooms/:id', async (req, res) => {
    try {
      const roomId = req.params.id;
      const userName = req.player.username;
      if (userName) {
        await db.query(
          `UPDATE arcade_participants SET last_seen = CURRENT_TIMESTAMP WHERE room_id = ? AND user_name = ? AND participant_kind = 'human'`,
          [roomId, userName]
        );
      }
      const [rooms] = await db.query(`SELECT r.*, m.final_standings, clock_timestamp() AS server_now FROM arcade_rooms r
        LEFT JOIN arcade_matches m ON m.match_id = r.current_match_id WHERE r.room_id = ?`, [roomId]);
      if (!rooms || rooms.length === 0) {
        return res.status(404).json({ error: 'ไม่พบห้องแข่งขัน' });
      }
      const [participants] = await db.query(
        `SELECT * FROM arcade_participants WHERE room_id = ? ORDER BY joined_at ASC`,
        [roomId]
      );
      const { password: _pwd, server_now: serverNow, ...roomSafe } = rooms[0];
      res.json({ success: true, room: roomSafe, serverNow: new Date(serverNow).getTime(), participants: publicParticipants(participants) });
    } catch (err) {
      console.error('❌ GET /api/arcade/rooms/:id error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Read another player's code during a match - the spectator view.
  //
  // The permission rule is the whole point: only a viewer who has already
  // submitted this round, or who is out of the match, may look. Anyone still able
  // to edit their own answer would simply be copying, so they are refused even
  // when the player they want to watch has finished. A viewer may always read
  // their own row back, which is what makes this double as reconnect recovery.
  //
  // Bots have no code. They are answered honestly rather than with an empty
  // editor that reads like a player who has written nothing.
  app.get('/api/arcade/rooms/:id/code/:user_name', async (req, res) => {
    try {
      const roomId = req.params.id;
      const target = req.params.user_name;
      const viewer = req.player.username;
      if (!viewer) return res.status(400).json({ error: 'ต้องระบุผู้ขอดู' });

      const [rows] = await db.query(
        `SELECT p.participant_kind, p.user_name, p.draft_code, p.submitted_code, p.has_submitted,
           p.is_eliminated, p.draft_updated_at, p.draft_revision, r.current_match_id AS match_id, r.phase
         FROM arcade_participants p JOIN arcade_rooms r ON r.room_id = p.room_id
         WHERE p.room_id = ? AND p.user_name IN (?, ?)`,
        [roomId, viewer, target]
      );
      const viewerRow = rows.find((r) => r.user_name === viewer);
      const targetRow = rows.find((r) => r.user_name === target);
      if (!viewerRow || viewerRow.participant_kind !== 'human') return res.status(404).json({ error: 'ไม่พบผู้ขอดูในห้องนี้' });
      if (!targetRow) return res.status(404).json({ error: 'ไม่พบผู้เล่นคนนี้ในห้อง' });

      const lookingAtSelf = viewer === target;
      const mayWatch = lookingAtSelf
        || Number(viewerRow.has_submitted) === 1
        || Number(viewerRow.is_eliminated) === 1;
      if (!mayWatch) {
        return res.status(403).json({ error: 'ดูโค้ดของผู้เล่นคนอื่นได้หลังจากส่งคำตอบแล้วเท่านั้น' });
      }

      if (targetRow.participant_kind === 'bot') {
        return res.json({ user_name: target, is_bot: true, code: null, has_submitted: Number(targetRow.has_submitted) === 1 });
      }

      const submitted = Number(targetRow.has_submitted) === 1;
      res.json({
        user_name: target,
        is_bot: false,
        match_id: targetRow.match_id,
        phase: targetRow.phase,
        has_saved_code: submitted ? targetRow.submitted_code !== null : targetRow.draft_code !== null,
        draft_revision: targetRow.draft_revision,
        is_eliminated: Boolean(targetRow.is_eliminated),
        has_submitted: submitted,
        code: (submitted ? targetRow.submitted_code : targetRow.draft_code) || '',
        updated_at: targetRow.draft_updated_at,
      });
    } catch (err) {
      console.error('❌ GET /api/arcade/rooms/:id/code/:user_name error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/arcade/players/:user_name/history', async (req, res) => {
    try {
      const userName = req.player.username;
      if (req.params.user_name !== userName) return res.status(403).json({ error: 'ดูประวัติโค้ดได้เฉพาะบัญชีของคุณ' });
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

      const [rows] = await db.query(
        `SELECT h.match_id, h.room_id, h.room_code, h.room_name, h.difficulty, h.round_duration_mode,
            h.round_num, h.code, h.pass_count, h.total_count, h.quality_score, h.time_used_seconds,
            h.score_multiplier, h.round_score, h.match_ended_at,
            rr.final_rank, COALESCE(rr.coins, 0) AS coins_awarded
        FROM arcade_round_history h
        LEFT JOIN arcade_reward_receipts rr ON rr.match_id = h.match_id AND rr.user_name = h.user_name
        WHERE h.user_name = ? AND h.match_ended_at IS NOT NULL
        ORDER BY h.match_id DESC, h.round_num ASC`,
        [userName]
      );

      // Group flat rows into matches, preserving the newest-first ordering
      // the query already established.
      const byMatch = new Map();
      for (const row of rows || []) {
        if (!byMatch.has(row.match_id)) {
          byMatch.set(row.match_id, {
            match_id: row.match_id,
            room_id: row.room_id,
            room_code: row.room_code,
            room_name: row.room_name,
            // What the match was actually played at. Needed to judge a
            // result at all: "2 of 4 rounds finished" means something
            // different in a 30-second room than a 60-second one.
            difficulty: row.difficulty,
            round_duration_mode: row.round_duration_mode,
            ended_at: row.match_ended_at,
            final_rank: row.final_rank,
            coins_awarded: row.coins_awarded,
            total_score: 0,
            rounds: []
          });
        }
        const match = byMatch.get(row.match_id);
        match.total_score += row.round_score || 0;
        match.rounds.push({
          round_num: row.round_num, code: row.code,
          pass_count: row.pass_count, total_count: row.total_count,
          quality_score: row.quality_score, time_used_seconds: row.time_used_seconds,
          score_multiplier: row.score_multiplier,
          round_score: row.round_score
        });
      }

      res.json({ success: true, matches: Array.from(byMatch.values()).slice(0, limit) });
    } catch (err) {
      console.error('❌ GET /api/arcade/players/:user_name/history error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/arcade/rooms/:id/round-history', async (req, res) => {
    try {
      const roomId = req.params.id;
      const userName = req.player.username;
      if (!userName) return res.status(400).json({ error: 'ต้องระบุชื่อผู้เล่น' });

      const [rows] = await db.query(
        `SELECT round_num, code, pass_count, total_count, quality_score, time_used_seconds,
          score_multiplier, round_score
        FROM arcade_round_history
        WHERE room_id = ? AND user_name = ?
         AND match_id = COALESCE(?, (SELECT current_match_id FROM arcade_rooms WHERE room_id = ?))
        ORDER BY round_num ASC`,
        [roomId, userName, req.query.match_id || null, roomId]
      );
      res.json({ success: true, history: rows || [] });
    } catch (err) {
      console.error('❌ GET /api/arcade/rooms/:id/round-history error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });
}
module.exports = { installArcadeRoomReads, publicParticipants };
