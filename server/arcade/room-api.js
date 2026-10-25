// Room polling and membership responses contain public gameplay state only.
const arcadeConfig = require('../../shared/arcadeConfig.json');
const { rematchRoster } = require('./match-api');
const { gradeSubmission } = require('../problemGrader');
const { arcadeCodeJudge } = require('./code-judge');
const { summarise } = require('./code-metrics');
const { loadArcadeProblem } = require('./round-problem');
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
      const [rooms] = await db.query(`SELECT r.*, m.final_standings, m.ended_at AS previous_match_ended_at, clock_timestamp() AS server_now FROM arcade_rooms r
        LEFT JOIN arcade_matches m ON m.match_id = r.current_match_id WHERE r.room_id = ?`, [roomId]);
      if (!rooms || rooms.length === 0) {
        return res.status(404).json({ error: 'ไม่พบห้องแข่งขัน' });
      }
      const [participants] = await db.query(
        `SELECT * FROM arcade_participants WHERE room_id = ? ORDER BY joined_at ASC`,
        [roomId]
      );
      const { password: storedPassword, server_now: serverNow, previous_match_ended_at: previousMatchEndedAt, ...roomSafe } = rooms[0];
      roomSafe.is_password_protected = Boolean(storedPassword);
      const lobbyParticipants = roomSafe.status === 'WAITING' && roomSafe.phase === 'LOBBY'
        ? rematchRoster(roomSafe, { ended_at: previousMatchEndedAt }, participants)
        : participants;
      const viewer = participants.find(participant => participant.user_name === userName && participant.participant_kind === 'human');
      const viewerPendingChoice = roomSafe.status === 'WAITING' && roomSafe.phase === 'LOBBY'
        && Boolean(previousMatchEndedAt) && viewer?.match_id === roomSafe.current_match_id;
      // The viewer's own payout for the match on screen: match coins plus what
      // the achievement check paid (null until that check has run).
      let viewerReward = null;
      if (userName && roomSafe.current_match_id) {
        const [[receipt]] = await db.query(
          'SELECT coins, achievement_rewards FROM arcade_reward_receipts WHERE match_id = ? AND user_name = ?',
          [roomSafe.current_match_id, userName]
        );
        if (receipt) viewerReward = { coins: receipt.coins, achievements: receipt.achievement_rewards ?? null };
      }
      res.json({
        success: true, room: roomSafe, serverNow: new Date(serverNow).getTime(),
        viewer_reward: viewerReward,
        participants: publicParticipants(lobbyParticipants),
        viewer_pending_choice: viewerPendingChoice,
        viewer_participant: viewerPendingChoice ? publicParticipants([viewer])[0] : null
      });
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
  // Bots type real answers (ADR 0005), so their draft is served the same way.
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

      const submitted = Number(targetRow.has_submitted) === 1;
      res.json({
        user_name: target,
        is_bot: targetRow.participant_kind === 'bot',
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
      const before = parseInt(req.query.before, 10);

      // Paged by match in SQL (Spec 0005 #10): pick this page's match ids
      // first, then load only their rounds. This used to fetch every round the
      // player ever played and slice in JavaScript. Filters are whitelisted
      // against shared/arcadeConfig.json; anything else is ignored.
      const where = ['h.user_name = ?', 'h.match_ended_at IS NOT NULL'];
      const args = [userName];
      if (arcadeConfig.difficulties.includes(req.query.difficulty)) {
        where.push('h.difficulty = ?');
        args.push(req.query.difficulty);
      }
      if (arcadeConfig.roundDurationModes.includes(req.query.round_duration_mode)) {
        where.push('h.round_duration_mode = ?');
        args.push(req.query.round_duration_mode);
      }
      const [[{ total }]] = await db.query(
        `SELECT COUNT(DISTINCT h.match_id) AS total FROM arcade_round_history h WHERE ${where.join(' AND ')}`,
        args
      );
      const pageWhere = Number.isFinite(before) ? [...where, 'h.match_id < ?'] : where;
      const pageArgs = Number.isFinite(before) ? [...args, before] : args;
      const [idRows] = await db.query(
        `SELECT DISTINCT h.match_id FROM arcade_round_history h WHERE ${pageWhere.join(' AND ')}
         ORDER BY h.match_id DESC LIMIT ?`,
        [...pageArgs, limit + 1]
      );
      const pageIds = idRows.slice(0, limit).map(row => row.match_id);
      const nextBefore = idRows.length > limit ? pageIds[pageIds.length - 1] : null;

      const [rows] = pageIds.length === 0 ? [[]] : await db.query(
        `SELECT h.id AS history_id, h.match_id, h.room_id, h.room_code, h.room_name, h.difficulty, h.round_duration_mode,
            h.round_num, h.code, h.pass_count, h.total_count, h.quality_score, h.time_used_seconds,
            h.score_multiplier, h.round_score, h.match_ended_at,
            h.quality_rubric, h.quality_reason, h.quality_feedback, h.quality_source,
            rr.final_rank, COALESCE(rr.coins, 0) AS coins_awarded
        FROM arcade_round_history h
        LEFT JOIN arcade_reward_receipts rr ON rr.match_id = h.match_id AND rr.user_name = h.user_name
        WHERE h.user_name = ? AND h.match_id IN (${pageIds.map(() => '?').join(', ')})
        ORDER BY h.match_id DESC, h.round_num ASC`,
        [userName, ...pageIds]
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
          history_id: row.history_id, round_num: row.round_num, code: row.code,
          pass_count: row.pass_count, total_count: row.total_count,
          quality_score: row.quality_score, time_used_seconds: row.time_used_seconds,
          score_multiplier: row.score_multiplier,
          round_score: row.round_score,
          quality_rubric: row.quality_rubric, quality_reason: row.quality_reason,
          quality_feedback: row.quality_feedback, quality_source: row.quality_source
        });
      }

      res.json({ success: true, matches: Array.from(byMatch.values()), next_before: nextBefore, total_matches: Number(total) || 0 });
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
        `SELECT id AS history_id, round_num, code, pass_count, total_count, quality_score, time_used_seconds,
          score_multiplier, round_score, match_ended_at,
          quality_rubric, quality_reason, quality_feedback, quality_source
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

  // A few sentences of advice on one finished round (ADR 0007). Written by
  // the local model once and kept in quality_feedback; it never changes a score. Only
  // the round's own player may ask, and only after the match is over, so the
  // advice cannot coach anyone mid-match. Without a model, or when it fails,
  // the answer is the measured findings and nothing is stored, so it can be
  // tried again later.
  // One model call per round even when the panel asks twice at once.
  const adviceInFlight = new Map();
  app.post('/api/arcade/history/:historyId/advice', async (req, res) => {
    const historyId = Number(req.params.historyId);
    if (!Number.isSafeInteger(historyId) || historyId <= 0) return res.status(400).json({ error: 'รหัสรอบไม่ถูกต้อง' });
    try {
      const [[row]] = await db.query(
        `SELECT h.id, h.user_name, h.round_num, h.code, h.match_ended_at, h.quality_rubric, h.quality_reason,
            h.quality_feedback, h.quality_source, m.round_task_ids
         FROM arcade_round_history h LEFT JOIN arcade_matches m ON m.match_id = h.match_id
         WHERE h.id = ?`, [historyId]);
      // Someone else's round and no round look the same: ids are not a way to
      // find out who played what.
      if (!row || row.user_name !== req.player.username) return res.status(404).json({ error: 'ไม่พบรอบนี้' });
      if (!row.match_ended_at) return res.status(409).json({ error: 'ดูคำแนะนำได้หลังจบแมตช์' });
      // Only rows scored by measurement (or by the model judge before it,
      // ADR 0006) ever get model-written text here; an untouched starter, a
      // flagged answer or a fallback keeps the server's own fixed message.
      const storedSource = ['metrics', 'ai'].includes(row.quality_source) ? 'ai' : 'metrics';
      if (row.quality_feedback) return res.json({ advice: row.quality_feedback, source: storedSource });

      const findings = row.quality_rubric?.findings || [];
      const judged = { rubric: row.quality_rubric, reason: row.quality_reason, feedback: summarise(findings).feedback };
      if (!row.quality_rubric) return res.json({ advice: judged.feedback || judged.reason || '', source: 'metrics' });
      const taskId = Array.isArray(row.round_task_ids) ? row.round_task_ids[row.round_num - 1] : undefined;
      const problem = await loadArcadeProblem(db, taskId);

      // A match from before round_task_ids was kept has no problem to show the
      // model; the code and the findings still say enough.
      if (!adviceInFlight.has(historyId)) {
        adviceInFlight.set(historyId, (async () => {
          const verdict = problem ? await gradeSubmission({ problem, code: row.code || '' }) : null;
          const advice = await arcadeCodeJudge().advise({ problem, code: row.code || '', verdict, judged });
          if (advice.source === 'ai') {
            await db.query('UPDATE arcade_round_history SET quality_feedback = ? WHERE id = ? AND quality_feedback IS NULL', [advice.text, historyId]);
          }
          return advice;
        })().finally(() => adviceInFlight.delete(historyId)));
      }
      const advice = await adviceInFlight.get(historyId);
      res.json({ advice: advice.text, source: advice.source });
    } catch (err) {
      console.error('❌ POST /api/arcade/history/:id/advice error:', err.message);
      res.status(500).json({ error: 'โหลดคำแนะนำไม่สำเร็จ' });
    }
  });
}
module.exports = { installArcadeRoomReads, publicParticipants };
