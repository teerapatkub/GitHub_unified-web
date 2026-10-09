const { verifiedMultiplier } = require('./self-effects');
const arcadeConfig = require('../../shared/arcadeConfig.json');
const { readPhaseClock } = require('./phase-clock');
const { gradeSubmission } = require('../problemGrader');
const { settleArcadeRewards } = require('./match-rewards');

const ARCADE_PHASE_DURATIONS = arcadeConfig.phaseDurations;
const ARCADE_QUICK_PHASE_DURATIONS = arcadeConfig.quickModePhaseDurations;

// Phase 8.4 — a room's phase lengths come from its own `round_duration_mode`,
// not from a module-level constant. Every timing decision (start, and each
// finalize step) goes through this, so a Quick Mode room and a standard room
// can run side by side with the right pacing each. Falls back to standard for
// any unrecognised/legacy value, including rooms created before the column
// existed.
function arcadePhaseDurations(room) {
  return room?.round_duration_mode === 'quick' ? ARCADE_QUICK_PHASE_DURATIONS : ARCADE_PHASE_DURATIONS;
}
// How many of the lowest cumulative scorers get cut after each round finishes
// (Round 1 is a free look — nobody's cut until Round 2, matching the client's
// existing 5→5→3→2→1 pattern).
const ARCADE_ELIMINATE_COUNT = { 1: 0, 2: 2, 3: 1, 4: 1 };
const ARCADE_RANK_CASH_REWARDS = [500, 400, 300, 200, 100];
// Real test-case counts per round's fixed task (client's TASK_TEST_CASES) —
// only used to scale a bot's synthetic round score onto the same range a
// human's real passCount could reach. Round 4 pulls its count live from
// arcade_tasks (DB hard pool) since that task isn't fixed.
const ARCADE_ROUND_CASE_COUNTS = arcadeConfig.roundCaseCounts;

// A bot has no real code to judge, so its round score is synthesized on the
// same equal-weight scale used for real players (see submitMyRound()
// client-side): testScore + qualityScore + timeScore, each 0-100, summed to
// a 0-300 round score — ported here so it's computed once, authoritatively,
// instead of separately (and inconsistently) per browser.
//
// Two things about this must stay in lockstep with the client's own formula:
//
//   1. timeScore is EARNED BY CORRECTNESS - it is scaled by the fraction of
//      test cases passed. Awarding it flat meant finishing instantly with
//      nothing written scored close to 100 on time, while fighting to a real
//      3-of-5 finish scored ~17: the rules paid better for giving up than for
//      trying. Beginners felt that hardest, being the players most likely to
//      have nothing to submit.
//   2. How strong a bot is now follows the room's own difficulty. One fixed
//      band for every room meant picking an easy room got you easier problems
//      against exactly the same opposition, so it was not actually easier to
//      survive. arcadeConfig's `medium` band reproduces the old fixed numbers
//      exactly, so any change in behaviour is attributable to the room.
function synthesizeBotRoundScore(totalCount, roundDuration, difficulty, random) {
  const skill = arcadeConfig.botSkillByDifficulty[difficulty]
      || arcadeConfig.botSkillByDifficulty.default;
  const band = Math.min(1, Math.max(0, skill.passMin + random() * skill.passSpread));
  const passCount = totalCount === 0 ? 0 : Math.min(totalCount, Math.max(0, Math.round(totalCount * band)));
  const passRatio = totalCount === 0 ? 0 : passCount / totalCount;
  const testScore = passRatio * 100;
  const qualityScore = skill.qualityMin + Math.floor(random() * skill.qualitySpread);
  const timeUsed = Math.floor(random() * roundDuration);
  const timeScore = passRatio * ((roundDuration - timeUsed) / roundDuration) * 100;
  return Math.round(testScore + qualityScore + timeScore);
}


function createArcadePhaseFinalizer({ db, judgeCodeQuality, random = Math.random }) {
  async function gradeArcadeRoundSubmissions({ room, roundNum, participants, roundDuration, db }) {
    const graded = new Map();
    const humans = (participants || []).filter(
      (p) => p.participant_kind === 'human' && p.has_submitted && typeof p.submitted_code === 'string'
    );
    if (humans.length === 0) return graded;

    const drawn = Array.isArray(room.round_task_ids) ? room.round_task_ids : null;
    const taskId = drawn ? drawn[roundNum - 1] : undefined;
    let problem = null;
    if (taskId !== undefined) {
      const [rows] = await db.query(
        `SELECT p.test_kind, p.test_cases, p.solution_code, p.starter_code
         FROM problem_modes m JOIN problems p ON p.problem_id = m.problem_id
         WHERE m.mode = 'arcade' AND m.entry_id = ?`,
        [taskId]
      );
      problem = rows?.[0] || null;
    }

    // The round's timer is the source of truth for when it started: the server
    // set phase_deadline itself when the round opened.
    const phaseClock = await readPhaseClock(db, room.room_id);
    const deadlineMs = phaseClock?.deadlineMs ?? null;
    const startedMs = deadlineMs ? deadlineMs - roundDuration * 1000 : null;

    // In parallel: four players each cost one Python run and one judge call,
    // and the tick loop is serial, so doing these one after another would hold
    // the whole match up.
    await Promise.all(humans.map(async (p) => {
      const code = p.submitted_code || '';
      let passCount = 0;
      let totalCount = 0;

      if (problem) {
        const verdict = await gradeSubmission({ problem, code });
        passCount = verdict.passed;
        totalCount = verdict.total;
      }

      // judgeCodeQuality already supplies its established local fallback when
      // the remote service is unavailable. Unexpected failures abort the round.
      const judged = await judgeCodeQuality(code.slice(0, 4000));
      const quality = Number(judged?.score || 0);

      const submittedMs = p.submitted_at ? new Date(p.submitted_at).getTime() : null;
      const timeUsed = (startedMs && submittedMs)
        ? Math.max(0, Math.min(roundDuration, Math.round((submittedMs - startedMs) / 1000)))
        : roundDuration;

      const passRatio = totalCount === 0 ? 0 : passCount / totalCount;
      const testScore = passRatio * 100;
      // Speed only counts for work that actually runs, the same rule the
      // browser used: paying the time leg flat rewarded submitting an
      // untouched starter the second the round opened.
      const timeScore = passRatio * ((roundDuration - timeUsed) / roundDuration) * 100;
      let roundScore = testScore + quality + timeScore;
      if (Number(p.score_multiplier_active) === 1) roundScore *= 2;

      graded.set(p.id, {
        roundScore: Math.max(0, Math.min(arcadeConfig.maxSubmittableRoundScore, Math.round(roundScore))),
        passCount, totalCount, quality: Math.round(quality), timeUsed, code,
      });
    }));

    // History and gameplay state share the settlement transaction. A failed
    // history write must abort the entire round so the ticker can retry it.
    for (const [participantId, g] of graded) {
      const p = humans.find(h => h.id === participantId);
      await db.query(
        `INSERT INTO arcade_round_history
          (match_id, room_id, room_code, room_name, difficulty, round_duration_mode, user_name, round_num,
           code, pass_count, total_count, quality_score, time_used_seconds, round_score)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [room.current_match_id, room.room_id, room.room_code, room.room_name,
          room.difficulty || 'default', room.round_duration_mode || 'standard',
          p.user_name, roundNum, g.code.slice(0, 20000),
          g.passCount, g.totalCount, g.quality, g.timeUsed, g.roundScore]
      );
    }

    return graded;
  }

  async function finalizeLockedPhase(room, db) {
    const roomId = room.room_id;
    const phase = room.phase;

    if (phase.startsWith('ROUND_')) {
      const roundNum = parseInt(phase.split('_')[1], 10);
      const roundDuration = arcadePhaseDurations(room)[phase];
      const eliminateCount = ARCADE_ELIMINATE_COUNT[roundNum] || 0;

      // Scale synthetic bot scores against the problem drawn for this round.
      let totalCount = ARCADE_ROUND_CASE_COUNTS[roundNum];
      const drawn = Array.isArray(room.round_task_ids) ? room.round_task_ids : null;
      if (drawn && drawn[roundNum - 1] !== undefined) {
        const [drawnTask] = await db.query(
          `SELECT test_cases FROM arcade_tasks WHERE task_id = ?`,
          [drawn[roundNum - 1]]
        );
        const cases = drawnTask?.[0]?.test_cases;
        if (Array.isArray(cases)) totalCount = cases.length;
      } else if (roundNum === 4) {
        // Legacy rooms only (started before round_task_ids existed). This
        // has to read the same pool the client's own Round 4 fallback
        // picks from, which now follows the room's difficulty rather than
        // always being `hard` - otherwise bots would be scaled against a
        // different problem than the humans were shown.
        const finaleDifficulty = arcadeConfig.finalePoolByDifficulty[room.difficulty || 'default']
          || arcadeConfig.finalePoolByDifficulty.default;
        const [finaleTasks] = await db.query(
          `SELECT test_cases FROM arcade_tasks WHERE difficulty = ? ORDER BY task_id ASC LIMIT 1`,
          [finaleDifficulty]
        );
        const cases = finaleTasks?.[0]?.test_cases;
        totalCount = Array.isArray(cases) ? cases.length : 2;
      }

      // Wait for an answer transaction accepted before the deadline to commit
      // before taking the grading snapshot. New writes after expiry are rejected.
      const [participants] = await db.query(`SELECT * FROM arcade_participants WHERE room_id = ? AND match_id = ? ORDER BY id FOR UPDATE`, [roomId, room.current_match_id]);
      const alive = (participants || []).filter(p => !p.is_eliminated);

      // Elimination counts are tuned for a full 5-player bracket
      // (5→5→3→2→1) but rooms are allowed as small as 2 players — clamp so
      // a round can never cut everyone left standing (always leave at
      // least 1 survivor to be the match's eventual winner).
      const safeEliminateCount = Math.min(eliminateCount, Math.max(0, alive.length - 1));

      // Grade the humans now, from what they submitted. Until ADR 0001 this
      // read pending_round_score - a number the browser had computed and sent.
      const graded = await gradeArcadeRoundSubmissions({
        room, roundNum, participants: alive, roundDuration, db,
      });

      const phaseClock = await readPhaseClock(db, roomId);
      const roundResults = await Promise.all(alive.map(async p => {
        const isBot = p.participant_kind === 'bot';
        const roundScore = isBot
          ? synthesizeBotRoundScore(totalCount, roundDuration, room.difficulty, random)
            * (await verifiedMultiplier(db, room.current_match_id, p.user_name, room.phase, phaseClock.deadlineMs - 1) ? 2 : 1)
          : (graded.get(p.id)?.roundScore || 0);
        return { participant: p, roundScore };
      }));

      // Rank this round's performance only (not cumulative) to pay out coins.
      roundResults.sort((a, b) => b.roundScore - a.roundScore);
      for (let i = 0; i < roundResults.length; i++) {
        const cashGain = ARCADE_RANK_CASH_REWARDS[i] || 0;
        const { participant, roundScore } = roundResults[i];
        await db.query(
          `UPDATE arcade_participants SET score = score + ?, cash = cash + ?, has_submitted = 0, pending_round_score = NULL, submitted_code = NULL, submitted_at = NULL, score_multiplier_active = 0, draft_code = NULL, draft_updated_at = NULL WHERE id = ?`,
          [roundScore, cashGain, participant.id]
        );
      }

      // Cumulative-score elimination — recompute standings from the fresh
      // totals just written above so a round's own score counts toward
      // whether its owner survives it.
      const eliminatedNames = new Set();
      if (safeEliminateCount > 0) {
        const cumulative = roundResults.map(({ participant, roundScore }) => ({
          user_name: participant.user_name,
          newScore: participant.score + roundScore
        }));
        cumulative.sort((a, b) => a.newScore - b.newScore);
        for (const p of cumulative.slice(0, safeEliminateCount)) {
          eliminatedNames.add(p.user_name);
          await db.query(`UPDATE arcade_participants SET is_eliminated = 1 WHERE room_id = ? AND user_name = ?`, [roomId, p.user_name]);
        }
      }

      const summary = {
        roundNum,
        entries: roundResults.map(({ participant }, i) => ({
          name: participant.user_name,
          rank: i + 1,
          cashGain: ARCADE_RANK_CASH_REWARDS[i] || 0,
          eliminated: eliminatedNames.has(participant.user_name)
        }))
      };

      // A small room (as few as 2 players) can reach a sole survivor
      // before Round 4 — finish the match right there instead of dragging
      // everyone through empty rounds nobody else can be cut from.
      const remainingAlive = alive.length - eliminatedNames.size;
      if (roundNum === 4 || remainingAlive <= 1) {
        await settleArcadeRewards(db, room);
        await db.query(
          `UPDATE arcade_rooms SET phase = 'RESULT', phase_deadline = NULL, current_round = ?, last_round_summary = ? WHERE room_id = ?`,
          [roundNum, JSON.stringify(summary), roomId]
        );
        return { finished: true, roomId, matchId: room.current_match_id };
      } else {
        const nextDeadline = new Date(Date.now() + arcadePhaseDurations(room)[`SUMMARY_${roundNum}`] * 1000);
        await db.query(
          `UPDATE arcade_rooms SET phase = ?, phase_deadline = ?, current_round = ?, last_round_summary = ? WHERE room_id = ?`,
          [`SUMMARY_${roundNum}`, nextDeadline, roundNum, JSON.stringify(summary), roomId]
        );
      }
      return;
    }

    if (phase.startsWith('SUMMARY_')) {
      const roundNum = phase.split('_')[1];
      const nextPhase = `SHOP_${roundNum}`;
      const nextDeadline = new Date(Date.now() + arcadePhaseDurations(room)[nextPhase] * 1000);
      await db.query(`UPDATE arcade_rooms SET phase = ?, phase_deadline = ? WHERE room_id = ?`, [nextPhase, nextDeadline, roomId]);
      return;
    }

    if (phase.startsWith('SHOP_')) {
      const roundNum = parseInt(phase.split('_')[1], 10);
      const nextPhase = `ROUND_${roundNum + 1}`;
      const nextDeadline = new Date(Date.now() + arcadePhaseDurations(room)[nextPhase] * 1000);
      await db.query(`UPDATE arcade_rooms SET phase = ?, phase_deadline = ? WHERE room_id = ?`, [nextPhase, nextDeadline, roomId]);
      return;
    }
  }


  return async function finalizeArcadePhase(expectedRoom) {
    const connection = await db.getConnection();
    let result;
    try {
      await connection.beginTransaction();
      const [rooms] = await connection.query('SELECT * FROM arcade_rooms WHERE room_id = ? FOR UPDATE', [expectedRoom.room_id]);
      const room = rooms[0];
      // A queued worker must re-read identity and deadline after acquiring the lock.
      // Advancing the phase in this same transaction is the once-only settlement marker.
      if (!room || room.status !== 'PLAYING' || !room.current_match_id
        || room.current_match_id !== expectedRoom.current_match_id || room.phase !== expectedRoom.phase) {
        await connection.rollback();
        return;
      }
      const [clock] = await connection.query('SELECT phase_deadline <= clock_timestamp() AS expired FROM arcade_rooms WHERE room_id = ?', [room.room_id]);
      if (!clock[0]?.expired) {
        await connection.rollback();
        return;
      }
      result = await finalizeLockedPhase(room, connection);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return result;
  };
}

module.exports = { createArcadePhaseFinalizer };
