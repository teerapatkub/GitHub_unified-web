const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const { createPlacementRouter, passScoreFor } = require('../placementRoutes');

// Same rows db.js seeds: option 12 starts at level 1, 13/14 open the test.
const OPTIONS = { 12: 1, 13: 10, 14: 10, 1: null };
const QUESTIONS = [
  { id: 1, question_text: 'len([1, 2, 3])?', correct_answer: '3', choices: ['2', '3', '4'] },
  { id: 2, question_text: 'empty dict?', correct_answer: '{}', choices: ['[]', '{}', '()'] },
  { id: 3, question_text: '"Hello"[1]?', correct_answer: 'e', choices: ['H', 'e', 'l'] },
];

const startApp = async (t, { level = 0, playerId = 42 } = {}) => {
  const state = { level, updates: [] };
  const db = {
    execute: async (sql, args = []) => {
      if (sql.startsWith('SELECT user_id, username, level, xp, virtual_currency FROM users')) {
        return [[{ user_id: args[0], username: 'newbie', level: state.level, xp: 0, virtual_currency: 0 }]];
      }
      if (sql.startsWith('UPDATE users SET level = ? WHERE user_id = ? AND level = ?')) {
        state.updates.push(args);
        if (Number(args[1]) !== playerId || Number(args[2]) !== state.level) return [{ affectedRows: 0 }];
        state.level = args[0];
        return [{ affectedRows: 1 }];
      }
      if (sql.startsWith('SELECT o.level_value FROM survey_options o')) {
        return [args[0] in OPTIONS ? [{ level_value: OPTIONS[args[0]] }] : []];
      }
      if (sql.startsWith('SELECT id, question_text FROM advanced_validation')) {
        return [QUESTIONS.map(({ id, question_text }) => ({ id, question_text }))];
      }
      if (sql.startsWith('SELECT id, correct_answer FROM advanced_validation')) {
        return [QUESTIONS.map(({ id, correct_answer }) => ({ id, correct_answer }))];
      }
      if (sql.startsWith('SELECT question_id, choice_text FROM advanced_validation_choices')) {
        return [QUESTIONS.flatMap(q => q.choices.map(choice_text => ({ question_id: q.id, choice_text })))];
      }
      throw new Error(`Unexpected SQL: ${sql}`);
    },
  };
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => { req.player = { user_id: playerId, role: 'user' }; next(); });
  app.use('/api', createPlacementRouter(db));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const post = (route, body) => fetch(`${base}${route}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return { base, post, state };
};

const answerSheet = (correctCount) => Object.fromEntries(QUESTIONS.map((q, i) => [
  String(q.id),
  i < correctCount ? q.correct_answer : q.choices.find(choice => choice !== q.correct_answer),
]));

test('server.js mounts the placement router and no longer serves update-level', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  assert.match(source, /app\.use\('\/api', createPlacementRouter\(db,/);
  assert.doesNotMatch(source, /app\.post\('\/api\/user\/update-level'/);
  assert.doesNotMatch(source, /app\.post\('\/api\/assessment\/submit'/);
  assert.doesNotMatch(source, /SELECT \* FROM advanced_validation/);
});

test('placement questions never carry the answer key to the browser', async t => {
  const { base } = await startApp(t);
  const response = await fetch(`${base}/advanced-validation`);
  assert.equal(response.status, 200);
  const questions = await response.json();
  assert.equal(questions.length, QUESTIONS.length);
  for (const q of questions) assert.deepEqual(Object.keys(q).sort(), ['choices', 'id', 'question_text']);
  assert.deepEqual(questions[0].choices, ['2', '3', '4']);
  assert.doesNotMatch(JSON.stringify(questions), /correct_answer/);
});

test('a client-reported score, total or level is ignored', async t => {
  const { post, state } = await startApp(t);
  const response = await post('/assessment/submit', {
    user_id: 42, option_id: 13, answers: answerSheet(0),
    score: 99, total_questions: 1, selected_level: 10, level: 10,
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.passed, false);
  assert.equal(result.score, 0);
  assert.equal(state.level, 0);
  assert.deepEqual(state.updates, []);
});

test('passing on the server places the new account at the survey option level', async t => {
  const { post, state } = await startApp(t);
  const passScore = passScoreFor(QUESTIONS.length);
  const response = await post('/assessment/submit', { option_id: 14, answers: answerSheet(passScore) });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.passed, true);
  assert.equal(result.score, passScore);
  assert.equal(result.user.level, 10);
  assert.equal(state.level, 10);
  assert.deepEqual(state.updates, [[10, 42, 0]]);
});

test('one short of the pass score does not move the level', async t => {
  const { post, state } = await startApp(t);
  const result = await (await post('/assessment/submit', {
    option_id: 13, answers: answerSheet(passScoreFor(QUESTIONS.length) - 1),
  })).json();
  assert.equal(result.passed, false);
  assert.equal(state.level, 0);
});

test('placement only applies during signup: a player past level 0 cannot use it to level up', async t => {
  const { post, state } = await startApp(t, { level: 3 });
  const response = await post('/assessment/submit', { option_id: 13, answers: answerSheet(QUESTIONS.length) });
  assert.equal(response.status, 409);
  assert.equal(state.level, 3);
  assert.deepEqual(state.updates, []);
});

test('only an experience option above level 1 opens the test', async t => {
  const { post, state } = await startApp(t);
  for (const option_id of [12, 1, 999, 'abc']) {
    const response = await post('/assessment/submit', { option_id, answers: answerSheet(QUESTIONS.length) });
    assert.equal(response.status, 400, String(option_id));
  }
  assert.equal(state.level, 0);
});

test('beginner path moves level 0 to 1 and nothing else', async t => {
  const fresh = await startApp(t);
  const placed = await (await fresh.post('/assessment/beginner', { level: 10 })).json();
  assert.equal(placed.user.level, 1);
  assert.equal(fresh.state.level, 1);

  const veteran = await startApp(t, { level: 5 });
  const kept = await (await veteran.post('/assessment/beginner', { level: 10 })).json();
  assert.equal(kept.user.level, 5);
  assert.deepEqual(veteran.state.updates, []);
});
