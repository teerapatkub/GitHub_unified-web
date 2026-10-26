// Things to do once you are out of a match (Spec 0005 #24): watch the survivors,
// guess who lasts, cheer. Everything here is for eliminated players of the
// room's current match only, and nothing here touches a survivor's score,
// cash or answer.
const crypto = require('node:crypto');
const config = require('../../shared/arcadeConfig.json');
const { readPhaseClock } = require('./phase-clock');
const { activeAttackEffects } = require('./attacks');
const { gradeSubmission } = require('../problemGrader');
const { loadArcadeProblem, roundTaskIdOf } = require('./round-problem');
const { roundKindOf, problemForKind, isChoiceKind } = require('./round-kinds');

// Each submitted answer is graded once for spectators, however often they poll.
const testsSeen = new Map();
async function testsPassed(db, room, roundNum, player) {
  const key = `${room.current_match_id}:${roundNum}:${player.user_name}:`
    + crypto.createHash('sha256').update(player.submitted_code || '').digest('hex');
  if (!testsSeen.has(key)) {
    testsSeen.set(key, (async () => {
      const kind = roundKindOf(room, roundNum);
      const problem = problemForKind(await loadArcadeProblem(db, roundTaskIdOf(room, roundNum)), kind);
      if (!problem) return null;
      const verdict = await gradeSubmission({ problem, code: player.submitted_code });
      return { passed: verdict.passed, total: verdict.total };
    })().catch(() => { testsSeen.delete(key); return null; }));
    if (testsSeen.size > 500) testsSeen.delete(testsSeen.keys().next().value);
  }
  return testsSeen.get(key);
}

// The viewer's row in the room's current match, if they are out of it.
async function eliminatedViewer(db, room, userName) {
  const [[viewer]] = await db.query(
    `SELECT * FROM arcade_participants WHERE room_id = ? AND user_name = ? AND participant_kind = 'human'`,
    [room.room_id, userName]
  );
  if (!viewer || viewer.match_id !== room.current_match_id || room.status !== 'PLAYING') return null;
  return Number(viewer.is_eliminated) === 1 ? viewer : null;
}

// Guessing closes when the final round starts.
const guessOpen = room => room.status === 'PLAYING' && !/^(ROUND_4|RESULT)$/.test(room.phase || '');

function installArcadeSpectators(app, db, { emojiSet }) {
  // The survivors, as anyone watching the room could see them: score,
  // whether they have sent this round's answer and how many tests it passes,
  // and which debuffs are on them. Never their code.
  app.get('/api/arcade/rooms/:id/spectate', async (req, res) => {
    try {
      const [[room]] = await db.query('SELECT * FROM arcade_rooms WHERE room_id = ?', [req.params.id]);
      if (!room) return res.status(404).json({ error: 'ไม่พบห้อง' });
      const viewer = await eliminatedViewer(db, room, req.player.username);
      if (!viewer) return res.status(403).json({ error: 'ดูสถานะผู้รอดได้เฉพาะผู้เล่นที่ตกรอบแล้ว' });
      const [players] = await db.query(
        `SELECT p.user_name, p.participant_kind, p.score, p.has_submitted, p.submitted_code, p.bot_state, s.attack_effects
         FROM arcade_participants p
         LEFT JOIN arcade_shop_states s ON s.match_id = p.match_id AND s.user_name = p.user_name
         WHERE p.room_id = ? AND p.match_id = ? AND p.is_eliminated = 0 ORDER BY p.score DESC, p.id`,
        [room.room_id, room.current_match_id]
      );
      const clock = await readPhaseClock(db, room.room_id);
      const roundNum = Number(/^ROUND_([1-4])$/.exec(room.phase || '')?.[1]) || 0;
      const codeRound = roundNum && !isChoiceKind(roundKindOf(room, roundNum));
      const survivors = await Promise.all(players.map(async player => ({
        name: player.user_name,
        kind: player.participant_kind,
        score: player.score,
        submitted: Boolean(roundNum && Number(player.has_submitted) === 1),
        progress: player.participant_kind === 'bot' && roundNum ? Math.round(player.bot_state?.progress || 0) : null,
        tests: codeRound && Number(player.has_submitted) === 1 ? await testsPassed(db, room, roundNum, player) : null,
        debuffs: roundNum ? activeAttackEffects(player.attack_effects, room.phase, clock.nowMs).map(effect => effect.type) : [],
      })));
      const [[guess]] = await db.query('SELECT guessed_name FROM arcade_spectator_guesses WHERE match_id = ? AND user_name = ?',
        [room.current_match_id, viewer.user_name]);
      res.json({
        success: true, match_id: room.current_match_id, phase: room.phase, survivors,
        guess: guess?.guessed_name || null,
        can_guess: !guess && guessOpen(room) && survivors.length > 1,
        guess_reward: config.spectatorGuessReward,
      });
    } catch (err) {
      console.error('❌ GET /api/arcade/rooms/:id/spectate error:', err.message);
      res.status(500).json({ error: 'โหลดสถานะผู้รอดไม่สำเร็จ' });
    }
  });

  // One guess per spectator per match, of someone still in, before the final.
  app.post('/api/arcade/rooms/:id/guess', async (req, res) => {
    try {
      const { match_id: matchId, guessed_name: guessedName } = req.body || {};
      const [[room]] = await db.query('SELECT * FROM arcade_rooms WHERE room_id = ?', [req.params.id]);
      if (!room) return res.status(404).json({ error: 'ไม่พบห้อง' });
      if (!Number.isSafeInteger(matchId) || matchId !== room.current_match_id || typeof guessedName !== 'string') {
        return res.status(400).json({ error: 'ข้อมูลการทายไม่ถูกต้อง' });
      }
      const viewer = await eliminatedViewer(db, room, req.player.username);
      if (!viewer) return res.status(403).json({ error: 'ทายได้เฉพาะผู้เล่นที่ตกรอบแล้ว' });
      if (!guessOpen(room)) return res.status(409).json({ error: 'ปิดการทายแล้ว เพราะเข้ารอบชิงแล้ว' });
      const [[target]] = await db.query(
        'SELECT user_name, is_eliminated FROM arcade_participants WHERE room_id = ? AND match_id = ? AND user_name = ?',
        [room.room_id, room.current_match_id, guessedName]
      );
      if (!target || Number(target.is_eliminated) === 1) return res.status(400).json({ error: 'ทายได้เฉพาะผู้เล่นที่ยังอยู่ในแมตช์' });
      const [inserted] = await db.query(
        `INSERT INTO arcade_spectator_guesses (match_id, user_name, guessed_name) VALUES (?, ?, ?)
         ON CONFLICT (match_id, user_name) DO NOTHING`,
        [room.current_match_id, viewer.user_name, guessedName]
      );
      if (!inserted.affectedRows) return res.status(409).json({ error: 'ทายไปแล้วในแมตช์นี้' });
      res.json({ success: true, guess: guessedName });
    } catch (err) {
      console.error('❌ POST /api/arcade/rooms/:id/guess error:', err.message);
      res.status(500).json({ error: 'บันทึกการทายไม่สำเร็จ' });
    }
  });

  // An emoji into the room chat, open to spectators during rounds too, at most
  // one per spectatorCheerIntervalMs.
  app.post('/api/arcade/rooms/:id/cheer', async (req, res) => {
    try {
      const { emoji } = req.body || {};
      const [[room]] = await db.query('SELECT * FROM arcade_rooms WHERE room_id = ?', [req.params.id]);
      if (!room) return res.status(404).json({ error: 'ไม่พบห้อง' });
      const viewer = await eliminatedViewer(db, room, req.player.username);
      if (!viewer) return res.status(403).json({ error: 'เชียร์ได้เฉพาะผู้เล่นที่ตกรอบแล้ว' });
      if (!emojiSet.includes(emoji)) return res.status(400).json({ error: 'อีโมจิไม่ถูกต้อง' });
      const [[recent]] = await db.query(
        `SELECT EXTRACT(EPOCH FROM (clock_timestamp() - MAX(created_at))) * 1000 AS ago
         FROM arcade_chat_messages WHERE room_id = ? AND user_name = ? AND kind = 'emoji'`,
        [room.room_id, viewer.user_name]
      );
      if (recent?.ago !== null && recent?.ago !== undefined && Number(recent.ago) < config.spectatorCheerIntervalMs) {
        return res.status(429).json({ error: 'เชียร์ถี่เกินไป รอสักครู่' });
      }
      await db.query(`INSERT INTO arcade_chat_messages (room_id, user_name, kind, emoji) VALUES (?, ?, 'emoji', ?)`,
        [room.room_id, viewer.user_name, emoji]);
      res.json({ success: true });
    } catch (err) {
      console.error('❌ POST /api/arcade/rooms/:id/cheer error:', err.message);
      res.status(500).json({ error: 'ส่งเชียร์ไม่สำเร็จ' });
    }
  });
}

module.exports = { installArcadeSpectators };
