const { test } = require('node:test');
const assert = require('node:assert/strict');
const { arcadeFixture } = require('./helpers/arcade-fixture');
const { createArcadePhaseFinalizer } = require('../arcade/phase-finalizer');

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
    judgeCodeQuality: async () => ({ score: 40 })
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

  const history = (await call('/api/arcade/players/alice/history')).body.matches;
  const match = history.find(entry => entry.match_id === matchId);
  assert.equal(match.total_score, 80);
  assert.equal(match.final_rank, 1);
  assert.equal(match.coins_awarded, 50);
  assert.equal(match.rounds[0].score_multiplier, 2);
});
