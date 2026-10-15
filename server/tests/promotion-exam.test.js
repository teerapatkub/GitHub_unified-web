const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const { PROMOTION_STAGES, createPromotionExamRouter } = require('../promotionExamRoutes');

// Same thresholds as normalizePlayerLevel() in server.js.
const tierForLevel = (level) => (level <= 1 ? 'Beginner' : level === 2 ? 'Intermediate' : 'Advanced');

const startApp = async (t, { level = 1, playerId = 42 } = {}) => {
  const state = { level, updates: [], achievementsFor: [] };
  const db = {
    execute: async (sql, args = []) => {
      if (sql.startsWith('SELECT user_id, username, level, xp, virtual_currency FROM users')) {
        return [[{ user_id: args[0], username: 'learner', level: state.level, xp: 650, virtual_currency: 30 }]];
      }
      if (sql.startsWith('UPDATE users SET level = ? WHERE user_id = ? AND level = ?')) {
        state.updates.push(args);
        if (Number(args[2]) !== state.level) return [{ affectedRows: 0 }];
        state.level = args[0];
        return [{ affectedRows: 1 }];
      }
      throw new Error(`Unexpected SQL: ${sql}`);
    },
  };
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => { req.player = { user_id: playerId, role: 'user' }; next(); });
  app.use('/api', createPromotionExamRouter(db, {
    tierForLevel,
    evaluateAchievements: async (userId) => { state.achievementsFor.push(userId); return []; },
  }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/api/learning/promotion-exam`;
  const submit = (body) => fetch(`${base}/submit`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return { base, submit, state };
};

const answerSheet = (stage, correctCount) => Object.fromEntries(
  PROMOTION_STAGES[stage].questions.map((q, i) => [
    String(i + 1),
    i < correctCount ? q.answer : q.choices.find(choice => choice !== q.answer),
  ]),
);

// The page called these routes for months while server.js never mounted them.
test('server.js mounts the promotion exam router', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  assert.match(source, /require\('\.\/promotionExamRoutes'\)/);
  assert.match(source, /app\.use\('\/api', createPromotionExamRouter\(db,/);
});

test('promotion exam route exists and never sends the answer key to the browser', async t => {
  const { base } = await startApp(t, { level: 1 });
  const response = await fetch(`${base}?userId=42`);
  assert.equal(response.status, 200);
  const { exam } = await response.json();
  assert.equal(exam.stage, 'beginner_to_intermediate');
  assert.equal(exam.totalQuestions, 10);
  assert.equal(exam.passScore, 7);
  assert.equal(exam.questions.length, 10);
  for (const question of exam.questions) {
    assert.deepEqual(Object.keys(question).sort(), ['choices', 'prompt']);
  }
  assert.doesNotMatch(JSON.stringify(exam), /"answer"/);
});

test('bank is well formed: every answer is one of its unique choices', () => {
  for (const [stage, { questions, passScore }] of Object.entries(PROMOTION_STAGES)) {
    assert.ok(passScore <= questions.length, stage);
    for (const q of questions) {
      assert.equal(new Set(q.choices).size, q.choices.length, q.prompt);
      assert.ok(q.choices.includes(q.answer), q.prompt);
    }
  }
});

test('passing promotes on the server; client-claimed score and level are ignored', async t => {
  const { submit, state } = await startApp(t, { level: 1 });
  const failed = await submit({
    userId: 42, examId: 'beginner_to_intermediate:v1', score: 10, passed: true, level: 9,
    answers: answerSheet('beginner_to_intermediate', 6),
  }).then(r => r.json());
  assert.equal(failed.passed, false);
  assert.equal(failed.score, 6);
  assert.equal(failed.user, undefined);
  assert.equal(state.updates.length, 0);

  const passed = await submit({
    userId: 42, examId: 'beginner_to_intermediate:v1',
    answers: answerSheet('beginner_to_intermediate', 7),
  }).then(r => r.json());
  assert.equal(passed.passed, true);
  assert.equal(passed.score, 7);
  assert.equal(passed.user.level, 2);
  assert.equal(passed.user.skill_tier, 'Intermediate');
  assert.deepEqual(passed.celebration, { previousLevel: 1, newLevel: 2, previousTier: 'Beginner', newTier: 'Intermediate' });
  assert.deepEqual(state.updates, [[2, 42, 1]]);
  assert.deepEqual(state.achievementsFor, [42]);

  // The beginner exam cannot be replayed once promoted.
  const replay = await submit({ examId: 'beginner_to_intermediate:v1', answers: answerSheet('beginner_to_intermediate', 10) });
  assert.equal(replay.status, 409);
  assert.equal(state.level, 2);
});

test('intermediate stage promotes to the first Advanced level; Advanced has no exam', async t => {
  const { base, submit, state } = await startApp(t, { level: 2 });
  const { exam } = await fetch(base).then(r => r.json());
  assert.equal(exam.stage, 'intermediate_to_advanced');
  assert.equal(exam.totalQuestions, 12);
  const passed = await submit({ examId: exam.examId, answers: answerSheet('intermediate_to_advanced', 9) }).then(r => r.json());
  assert.equal(passed.user.level, 3);
  assert.equal(state.level, 3);
  assert.equal((await fetch(base)).status, 409);
});

test('another player cannot be named, and malformed answers are rejected', async t => {
  const { base, submit, state } = await startApp(t, { level: 1 });
  assert.equal((await fetch(`${base}?userId=7`)).status, 403);
  const forOther = await submit({ userId: 7, examId: 'beginner_to_intermediate:v1', answers: answerSheet('beginner_to_intermediate', 10) });
  assert.equal(forOther.status, 403);
  assert.equal((await submit({ examId: 'beginner_to_intermediate:v1', answers: ['11'] })).status, 400);
  assert.equal((await submit({ examId: 'intermediate_to_advanced:v1', answers: {} })).status, 409);
  assert.equal(state.updates.length, 0);
});
