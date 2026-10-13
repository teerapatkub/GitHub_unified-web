const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createLessonContentRouter } = require('../lessonContentRoutes');

test('lesson quiz HTTP hides answers and grades the signed-in player on the server', async t => {
  const writes = [];
  const db = {
    execute: async (sql, args = []) => {
      if (sql.includes('FROM lesson_quizzes') && !sql.includes('JOIN')) return [[{ quiz_id: 7, quiz_type: 'post' }]];
      if (sql.includes('FROM quiz_questions') || sql.includes('JOIN quiz_questions')) return [[
        { question_id: 11, question_text: 'Two plus two?', question_type: 'fill', correct_answer: '4' },
      ]];
      if (sql.includes('FROM question_choices')) return [[]];
      if (sql.includes('INSERT INTO lesson_quiz_attempts')) { writes.push(args); return [{}]; }
      throw new Error(`Unexpected SQL: ${sql}`);
    },
  };
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => { req.player = { user_id: 42, role: 'user' }; next(); });
  app.use('/api', createLessonContentRouter(db, { evaluateAchievements: async () => [] }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;

  const quiz = await fetch(`${base}/api/lessons/3/quizzes`).then(r => r.json());
  assert.equal(quiz[0].questions[0].correct_answer, undefined);
  assert.equal(quiz[0].questions[0].question_text, 'Two plus two?');

  const response = await fetch(`${base}/api/lessons/3/quiz-results`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: 42, quiz_type: 'post', score: 999, total_questions: 1, answers: { 0: '4' } }),
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.score, 1);
  assert.equal(result.correct, undefined);
  assert.equal(writes[0][0], 42);
  assert.equal(writes[0][3], 1);

  const rejected = await fetch(`${base}/api/lessons/3/quiz-results`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quiz_type: 'post', answers: { 0: '5' } }),
  }).then(r => r.json());
  assert.equal(rejected.passed, false);
  assert.equal(rejected.correct, undefined);
  assert.equal(writes.length, 1);
});
