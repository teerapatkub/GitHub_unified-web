const { test } = require('node:test');
const assert = require('node:assert/strict');
const { arcadeFixture } = require('./helpers/arcade-fixture');
const { PROMOTION_STAGES, createPromotionExamRouter } = require('../promotionExamRoutes');

// Real PostgreSQL and the production Auth middleware in front of the router:
// the session, not the request body, decides whose level moves.
test('promotion exam behind real Auth grades on the server and promotes only the signed-in player', async t => {
  const { app, db, call } = await arcadeFixture(t);
  await db.query('ALTER TABLE users ADD COLUMN xp integer DEFAULT 0');
  await db.query("UPDATE users SET level = 1, xp = 400 WHERE username IN ('alice', 'bob')");
  app.use('/api', createPromotionExamRouter(db, {
    tierForLevel: level => (level <= 1 ? 'Beginner' : level === 2 ? 'Intermediate' : 'Advanced'),
  }));
  const [[alice]] = await db.query("SELECT user_id FROM users WHERE username = 'alice'");
  const [[bob]] = await db.query("SELECT user_id FROM users WHERE username = 'bob'");
  const levelOf = async id => (await db.query('SELECT level, xp FROM users WHERE user_id = ?', [id]))[0][0];

  assert.equal((await call('/api/learning/promotion-exam', { user: null })).status, 401);
  assert.equal((await call(`/api/learning/promotion-exam?userId=${bob.user_id}`)).status, 403);

  const loaded = await call(`/api/learning/promotion-exam?userId=${alice.user_id}`);
  assert.equal(loaded.status, 200);
  assert.equal(loaded.body.exam.examId, 'beginner_to_intermediate:v1');
  assert.doesNotMatch(JSON.stringify(loaded.body), /"answer"/);

  const correct = Object.fromEntries(
    PROMOTION_STAGES.beginner_to_intermediate.questions.map((q, i) => [String(i + 1), q.answer]),
  );
  const forBob = await call('/api/learning/promotion-exam/submit', {
    body: { userId: bob.user_id, examId: loaded.body.exam.examId, answers: correct },
  });
  assert.equal(forBob.status, 403);
  assert.equal((await levelOf(bob.user_id)).level, 1);

  const passed = await call('/api/learning/promotion-exam/submit', {
    body: { userId: alice.user_id, examId: loaded.body.exam.examId, answers: correct },
  });
  assert.equal(passed.status, 200);
  assert.equal(passed.body.passed, true);
  assert.equal(passed.body.score, 10);
  assert.deepEqual(await levelOf(alice.user_id), { level: 2, xp: 400 });

  const replay = await call('/api/learning/promotion-exam/submit', {
    body: { examId: loaded.body.exam.examId, answers: correct },
  });
  assert.equal(replay.status, 409);
  assert.equal((await levelOf(alice.user_id)).level, 2);
});
