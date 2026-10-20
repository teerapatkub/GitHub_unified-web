const { verifiedMultiplier } = require('./self-effects');
const arcadeConfig = require('../../shared/arcadeConfig.json');
const { readPhaseClock } = require('./phase-clock');
const { gradeSubmission } = require('../problemGrader');
const { settleArcadeRewards } = require('./match-rewards');
const coder = require('./bot-coder');
const { arcadeCodeJudge, heuristicCodeQualityScore } = require('./code-judge');
const { loadArcadeProblem } = require('./round-problem');
const { roundCashFor } = require('./round-cash');

// A safety net only: quality is measured locally (code-metrics.js, ADR 0007)
// in well under a second, and usually before the round ends, because it
// starts the moment an answer is sent (submission-api.js). It is reached only
// if Python hangs; the local score is used then.
const JUDGE_WAIT_MS = 6000;

// The quality leg of a round score (ADR 0006, 0007). An untouched starter is worth
// nothing, and well-written code that does not work is worth at most half:
// beautiful wrong answers must not outscore plain right ones.
function qualityFor(judged, passRatio) {
  if (!judged || judged.source === 'starter') return 0;
  return Math.round(Number(judged.score || 0) * (0.5 + 0.5 * passRatio));
}

function withDeadline(promise, ms, fallback) {
  let timer;
  return Promise.race([
    promise,
    new Promise(resolve => { timer = setTimeout(() => resolve(fallback()), ms); }),
  ]).finally(() => clearTimeout(timer));
}

const ARCADE_PHASE_DURATIONS = arcadeConfig.phaseDurations;
const ARCADE_QUICK_PHASE_DURATIONS = arcadeConfig.quickModePhaseDurations;
// Phase deadlines are set from the database clock, the same clock every
// open/closed check and serverNow read. The app server (Render) and the
// database (Supabase) are different machines, so Date.now() here would
// stretch or cut every phase by their clock skew.
const NEXT_DEADLINE_SQL = 'clock_timestamp() + make_interval(secs => ?)';

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
//
// The skill roll says how good the bot's answer is; its progress bar says how
// far it got and when. `bar` comes from botRoundBar():
//
//   - finished (bar hit 100%): time is scored from that moment, exactly like a
//     human's submit time. Fog and Freeze stop the bar, so they push it later.
//   - never finished: the bot passes only its share of the cases
//     (completion x skill roll) and gets no speed points - it is a human whose
//     answer was auto-submitted at the deadline half-written.
//
// Quality is not scaled: a fogged bot writes less code, not worse code.
function synthesizeBotRoundScore({ totalCount, roundDuration, difficulty, random, bar }) {
  const skill = arcadeConfig.botSkillByDifficulty[difficulty]
      || arcadeConfig.botSkillByDifficulty.default;
  const band = Math.min(1, Math.max(0, skill.passMin + random() * skill.passSpread));
  const passCount = totalCount === 0 ? 0
    : Math.min(totalCount, Math.max(0, Math.round(totalCount * band * bar.completion)));
  const passRatio = totalCount === 0 ? 0 : passCount / totalCount;
  const testScore = passRatio * 100;
  const qualityScore = skill.qualityMin + Math.floor(random() * skill.qualitySpread);
  const timeScore = passRatio * ((roundDuration - bar.timeUsed) / roundDuration) * 100;
  return Math.round(testScore + qualityScore + timeScore);
}

// Read a bot's bar (bot-ticker.js) for the round being settled. State left
// over from an earlier round counts as no work in this one.
function botRoundBar(botState, phase, roundStartMs, roundDuration) {
  const state = botState || {};
  if (state.phase !== phase) return { completion: 0, timeUsed: roundDuration };
  const progress = Math.max(0, Math.min(100, Number(state.progress) || 0));
  if (progress < 100) return { completion: progress / 100, timeUsed: roundDuration };
  // A bar filled before finishedAt was recorded (a round in flight across the
  // deploy) keeps its cases but earns no speed points.
  const finishedAt = Number(state.finishedAt);
  if (!Number.isFinite(finishedAt)) return { completion: 1, timeUsed: roundDuration };
  const timeUsed = Math.max(0, Math.min(roundDuration, (finishedAt - roundStartMs) / 1000));
  return { completion: 1, timeUsed };
}


function createArcadePhaseFinalizer({ db, judgeArcadeCode = args => arcadeCodeJudge().judge(args), random = Math.random }) {
  async function loadRoundProblem(room, roundNum, db) {
    const drawn = Array.isArray(room.round_task_ids) ? room.round_task_ids : null;
    const taskId = drawn ? drawn[roundNum - 1] : undefined;
    if (taskId === undefined) return { taskId, problem: null };
    return { taskId, problem: await loadArcadeProblem(db, taskId) };
  }

  // A bot that typed a real answer this round (bot-ticker.js) is graded like a
  // player: the real grader on what it submitted - or on its unfinished draft
  // if the round ran out, as a player's draft is auto-submitted - and time from
  // when it sent it. Its quality is the code judge's verdict on the answer it
  // set out to type, judged once per answer bank (ADR 0006); a typo left in
  // the draft costs it tests, not a fresh judge call.
  async function gradeBotAnswer({ p, taskId, problem, roundDuration, room, phaseClock, db }) {
    const submitted = Number(p.has_submitted) === 1;
    const code = (submitted ? p.submitted_code : p.draft_code) || '';
    const banked = coder.gradedFromBank(taskId, code);
    const verdict = banked || await gradeSubmission({ problem, code });
    const passRatio = verdict.total ? verdict.passed / verdict.total : 0;
    const judged = await coder.answerQuality(taskId, p.bot_state.answerId);
    const quality = qualityFor(judged, passRatio);
    const elapsed = Number(p.submitted_elapsed_seconds);
    const timeUsed = submitted && Number.isFinite(elapsed) ? Math.max(0, Math.min(roundDuration, elapsed)) : roundDuration;
    const timeScore = passRatio * ((roundDuration - timeUsed) / roundDuration) * 100;
    const multiplied = submitted
      ? Number(p.score_multiplier_active) === 1
      : await verifiedMultiplier(db, room.current_match_id, p.user_name, room.phase, phaseClock.deadlineMs - 1);
    return Math.round((passRatio * 100 + quality + timeScore) * (multiplied ? 2 : 1));
  }

  async function gradeArcadeRoundSubmissions({ room, roundNum, participants, roundDuration, db, problem, taskId }) {
    const graded = new Map();
    const humans = (participants || []).filter(
      (p) => p.participant_kind === 'human' && p.has_submitted && typeof p.submitted_code === 'string'
    );
    if (humans.length === 0) return graded;

    // In parallel: four players each cost one Python run and one judge call,
    // and the tick loop is serial, so doing these one after another would hold
    // the whole match up.
    await Promise.all(humans.map(async (p) => {
      const code = p.submitted_code || '';
      let passCount = 0;
      let totalCount = 0;
      let verdict = null;

      if (problem) {
        verdict = await gradeSubmission({ problem, code });
        passCount = verdict.passed;
        totalCount = verdict.total;
      }
      const passRatio = totalCount === 0 ? 0 : passCount / totalCount;

      // Usually already decided: judging started when the answer was sent.
      // The judge has its own local fallback; unexpected failures abort the
      // round so the ticker retries it.
      const judged = await withDeadline(
        judgeArcadeCode({ taskId, problem, code: code.slice(0, 4000), verdict, priority: 'player' }),
        JUDGE_WAIT_MS,
        () => ({ score: heuristicCodeQualityScore(code), rubric: null, reason: '', feedback: '', source: 'fallback' }),
      );
      const quality = qualityFor(judged, passRatio);

      // PostgreSQL TIMESTAMP values have no zone. Comparing two of them in
      // the database avoids interpreting submitted_at in the Node host's
      // timezone while the deadline clock is UTC-derived.
      const elapsedSeconds = Number(p.submitted_elapsed_seconds);
      const timeUsed = Number.isFinite(elapsedSeconds)
        ? Math.max(0, Math.min(roundDuration, Math.round(elapsedSeconds)))
        : roundDuration;

      const testScore = passRatio * 100;
      // Speed only counts for work that actually runs, the same rule the
      // browser used: paying the time leg flat rewarded submitting an
      // untouched starter the second the round opened.
      const timeScore = passRatio * ((roundDuration - timeUsed) / roundDuration) * 100;
      const scoreMultiplier = Number(p.score_multiplier_active) === 1 ? 2 : 1;
      let roundScore = (testScore + quality + timeScore) * scoreMultiplier;

      graded.set(p.id, {
        roundScore: Math.max(0, Math.min(arcadeConfig.maxSubmittableRoundScore, Math.round(roundScore))),
        passCount, totalCount, quality, timeUsed, scoreMultiplier, code, judged,
      });
    }));

    // History and gameplay state share the settlement transaction. A failed
    // history write must abort the entire round so the ticker can retry it.
    for (const [participantId, g] of graded) {
      const p = humans.find(h => h.id === participantId);
      await db.query(
        `INSERT INTO arcade_round_history
          (match_id, room_id, room_code, room_name, difficulty, round_duration_mode, user_name, round_num,
           code, pass_count, total_count, quality_score, time_used_seconds, score_multiplier, round_score,
           quality_rubric, quality_reason, quality_feedback, quality_source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [room.current_match_id, room.room_id, room.room_code, room.room_name,
          room.difficulty || 'default', room.round_duration_mode || 'standard',
          p.user_name, roundNum, g.code.slice(0, 20000),
          g.passCount, g.totalCount, g.quality, g.timeUsed, g.scoreMultiplier, g.roundScore,
          g.judged.rubric ? JSON.stringify(g.judged.rubric) : null,
          // Measured findings live in the rubric; quality_feedback is left for
          // the post-match advice (room-api.js), except for an answer that
          // explains itself, such as an untouched starter.
          g.judged.reason || null, g.judged.source === 'metrics' ? null : g.judged.feedback || null, g.judged.source || null]
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
      const [participants] = await db.query(
        `SELECT p.*,
          EXTRACT(EPOCH FROM (p.submitted_at - (r.phase_deadline - (? || ' seconds')::interval))) AS submitted_elapsed_seconds
         FROM arcade_participants p
         JOIN arcade_rooms r ON r.room_id = p.room_id
         WHERE p.room_id = ? AND p.match_id = ?
         ORDER BY p.id FOR UPDATE OF p`,
        [roundDuration, roomId, room.current_match_id]
      );
      const alive = (participants || []).filter(p => !p.is_eliminated);

      // Elimination counts are tuned for a full 5-player bracket
      // (5→5→3→2→1) but rooms are allowed as small as 2 players — clamp so
      // a round can never cut everyone left standing (always leave at
      // least 1 survivor to be the match's eventual winner).
      const safeEliminateCount = Math.min(eliminateCount, Math.max(0, alive.length - 1));

      // Grade the humans now, from what they submitted. Until ADR 0001 this
      // read pending_round_score - a number the browser had computed and sent.
      const { taskId, problem } = await loadRoundProblem(room, roundNum, db);
      const graded = await gradeArcadeRoundSubmissions({
        room, roundNum, participants: alive, roundDuration, db, problem, taskId,
      });

      const phaseClock = await readPhaseClock(db, roomId);
      const roundStartMs = phaseClock.deadlineMs - roundDuration * 1000;
      const roundResults = await Promise.all(alive.map(async p => {
        const isBot = p.participant_kind === 'bot';
        const wroteCode = isBot && problem && p.bot_state?.phase === room.phase && p.bot_state?.answerId;
        if (wroteCode) {
          return { participant: p, roundScore: await gradeBotAnswer({ p, taskId, problem, roundDuration, room, phaseClock, db }) };
        }
        const roundScore = isBot
          ? synthesizeBotRoundScore({ totalCount, roundDuration, difficulty: room.difficulty, random,
            bar: botRoundBar(p.bot_state, room.phase, roundStartMs, roundDuration) })
            * (await verifiedMultiplier(db, room.current_match_id, p.user_name, room.phase, phaseClock.deadlineMs - 1) ? 2 : 1)
          : (graded.get(p.id)?.roundScore || 0);
        return { participant: p, roundScore };
      }));

      // Rank this round's performance only (not cumulative) for the summary.
      roundResults.sort((a, b) => b.roundScore - a.roundScore);

      // Cumulative-score elimination: a round's own score counts toward
      // whether its owner survives it.
      const eliminatedNames = new Set();
      if (safeEliminateCount > 0) {
        const cumulative = roundResults.map(({ participant, roundScore }) => ({
          user_name: participant.user_name,
          newScore: participant.score + roundScore
        }));
        cumulative.sort((a, b) => a.newScore - b.newScore);
        for (const p of cumulative.slice(0, safeEliminateCount)) eliminatedNames.add(p.user_name);
      }

      // Shop money: a base for everyone, a smaller bonus for this round's
      // rank, and a comeback bonus for the lowest totals still in the match
      // (round-cash.js), worked out after the cut so it goes to survivors.
      const cash = roundCashFor(roundResults.map(({ participant, roundScore }) => ({
        name: participant.user_name, roundScore,
        totalScore: participant.score + roundScore,
        eliminated: eliminatedNames.has(participant.user_name),
      })));

      for (const { participant, roundScore } of roundResults) {
        await db.query(
          `UPDATE arcade_participants SET score = score + ?, cash = cash + ?, has_submitted = 0, pending_round_score = NULL, submitted_code = NULL, submitted_at = NULL, score_multiplier_active = 0, draft_code = NULL, draft_updated_at = NULL WHERE id = ?`,
          [roundScore, cash.get(participant.user_name).total, participant.id]
        );
      }
      for (const name of eliminatedNames) {
        await db.query(`UPDATE arcade_participants SET is_eliminated = 1 WHERE room_id = ? AND user_name = ?`, [roomId, name]);
      }

      const summary = {
        roundNum,
        entries: roundResults.map(({ participant }, i) => {
          const { total, ...cashParts } = cash.get(participant.user_name);
          return {
            name: participant.user_name,
            rank: i + 1,
            cashGain: total,
            cashParts,
            eliminated: eliminatedNames.has(participant.user_name)
          };
        })
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
        await db.query(
          `UPDATE arcade_rooms SET phase = ?, phase_deadline = ${NEXT_DEADLINE_SQL}, current_round = ?, last_round_summary = ? WHERE room_id = ?`,
          [`SUMMARY_${roundNum}`, arcadePhaseDurations(room)[`SUMMARY_${roundNum}`], roundNum, JSON.stringify(summary), roomId]
        );
      }
      return;
    }

    if (phase.startsWith('SUMMARY_')) {
      const roundNum = phase.split('_')[1];
      const nextPhase = `SHOP_${roundNum}`;
      await db.query(`UPDATE arcade_rooms SET phase = ?, phase_deadline = ${NEXT_DEADLINE_SQL} WHERE room_id = ?`,
        [nextPhase, arcadePhaseDurations(room)[nextPhase], roomId]);
      return;
    }

    if (phase.startsWith('SHOP_')) {
      const roundNum = parseInt(phase.split('_')[1], 10);
      const nextPhase = `ROUND_${roundNum + 1}`;
      await db.query(`UPDATE arcade_rooms SET phase = ?, phase_deadline = ${NEXT_DEADLINE_SQL} WHERE room_id = ?`,
        [nextPhase, arcadePhaseDurations(room)[nextPhase], roomId]);
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
