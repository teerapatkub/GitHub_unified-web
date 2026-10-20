const { test } = require('node:test');
const assert = require('node:assert/strict');
const { arcadeFixture } = require('./helpers/arcade-fixture');
const { createArcadePhaseFinalizer } = require('../arcade/phase-finalizer');

const FINDING = { criterion: 'standard', line: 1, th: 'ชื่อ myX ควรเป็น snake_case', en: 'name myX should be snake_case' };

test('result and match history expose the persisted score breakdown, multiplier and reward', async t => {
  const { call, db } = await arcadeFixture(t);
  const started = await call('/api/arcade/rooms/1/start', { body: {} });
  assert.equal(started.status, 200);
  const matchId = started.body.match_id;

  await db.query(
    `UPDATE arcade_rooms
     SET phase = 'ROUND_2', current_round = 2,
         phase_deadline = CURRENT_TIMESTAMP - INTERVAL '1 second'
     WHERE room_id = 1`
  );
  await db.query(
    `UPDATE arcade_participants
     SET has_submitted = 1, submitted_code = 'print(7)',
         submitted_at = CURRENT_TIMESTAMP - INTERVAL '31 seconds',
         score_multiplier_active = 1
     WHERE room_id = 1 AND user_name = 'alice'`
  );
  const room = (await call('/api/arcade/rooms/1')).body.room;
  await createArcadePhaseFinalizer({
    db,
    // Nothing ran a test (0/0), so the measured 80 counts half: quality 40.
    judgeArcadeCode: async () => ({
      score: 80, rubric: { time: 70, efficiency: 80, standard: 90, stepRatio: 1.5, findings: [FINDING] },
      reason: 'เสียคะแนนด้านมาตรฐาน', feedback: 'บรรทัด 1: ชื่อ myX ควรเป็น snake_case', source: 'metrics',
    })
  })(room);

  const current = (await call(`/api/arcade/rooms/1/round-history?match_id=${matchId}`)).body.history;
  assert.equal(current.length, 1);
  assert.deepEqual(
    {
      passCount: current[0].pass_count,
      totalCount: current[0].total_count,
      qualityScore: current[0].quality_score,
      timeUsedSeconds: current[0].time_used_seconds,
      scoreMultiplier: current[0].score_multiplier,
      roundScore: current[0].round_score
    },
    { passCount: 0, totalCount: 0, qualityScore: 40, timeUsedSeconds: 30, scoreMultiplier: 2, roundScore: 80 }
  );
  // The measured review is kept for the round-history panel (ADR 0007); the
  // advice slot stays empty until the player asks after the match.
  assert.deepEqual(
    { rubric: current[0].quality_rubric, reason: current[0].quality_reason, feedback: current[0].quality_feedback, source: current[0].quality_source },
    { rubric: { time: 70, efficiency: 80, standard: 90, stepRatio: 1.5, findings: [FINDING] }, reason: 'เสียคะแนนด้านมาตรฐาน', feedback: null, source: 'metrics' }
  );

  const history = (await call('/api/arcade/players/alice/history')).body.matches;
  const match = history.find(entry => entry.match_id === matchId);
  assert.equal(match.total_score, 80);
  assert.equal(match.final_rank, 1);
  assert.equal(match.coins_awarded, 50);
  assert.equal(match.rounds[0].score_multiplier, 2);
  assert.equal(match.rounds[0].quality_source, 'metrics');
  const historyId = match.rounds[0].history_id;
  assert.ok(historyId);

  // ---- advice after the match (ADR 0007) ----
  const advice = id => call(`/api/arcade/history/${id}/advice`, { body: {} });
  assert.equal((await call(`/api/arcade/history/${historyId}/advice`, { user: 'bob', body: {} })).status, 403, 'not your round');
  // No model configured: the measured findings are the advice, and nothing is stored.
  assert.deepEqual((await advice(historyId)).body, { advice: 'บรรทัด 1: ชื่อ myX ควรเป็น snake_case', source: 'metrics' });

  const judgeModule = require('../arcade/code-judge');
  const previous = judgeModule.arcadeCodeJudge();
  const asked = [];
  judgeModule.installArcadeCodeJudge(judgeModule.createArcadeCodeJudge({
    generate: async args => { asked.push(args); return 'ลองตั้งชื่อตัวแปรให้สื่อความหมายมากขึ้น'; },
  }));
  t.after(() => judgeModule.installArcadeCodeJudge(previous));
  assert.deepEqual((await advice(historyId)).body, { advice: 'ลองตั้งชื่อตัวแปรให้สื่อความหมายมากขึ้น', source: 'ai' });
  assert.deepEqual((await advice(historyId)).body, { advice: 'ลองตั้งชื่อตัวแปรให้สื่อความหมายมากขึ้น', source: 'ai' });
  assert.equal(asked.length, 1, 'written once, then kept');
  assert.match(asked[0].prompt, /line 1: ชื่อ myX/);

  await db.query('UPDATE arcade_round_history SET match_ended_at = NULL, quality_feedback = NULL WHERE id = ?', [historyId]);
  assert.equal((await advice(historyId)).status, 409, 'no advice while the match is still on');
});
