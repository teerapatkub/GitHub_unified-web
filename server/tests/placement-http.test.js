const { test } = require('node:test');
const assert = require('node:assert/strict');
const { arcadeFixture } = require('./helpers/arcade-fixture');
const { createPlacementRouter } = require('../placementRoutes');

// Real PostgreSQL and the production Auth middleware in front of the router:
// the session decides who is placed, the survey option decides the level, and
// only an account still at signup level 0 moves.
test('signup placement behind real Auth grades on the server and only moves a level-0 account', async t => {
  const { app, db, call, addUsers } = await arcadeFixture(t);
  await db.query('ALTER TABLE users ADD COLUMN xp integer DEFAULT 0');
  // Same shape and experience options as the boot seed in db.js.
  await db.query(`
    CREATE TABLE survey_questions (id integer PRIMARY KEY, title text NOT NULL, question_key varchar(50), is_active smallint DEFAULT 1, "order" integer DEFAULT 0);
    CREATE TABLE survey_options (id integer PRIMARY KEY, question_id integer, option_text varchar(100) NOT NULL, "order" integer DEFAULT 0, level_value integer, option_key varchar(50));
    CREATE TABLE advanced_validation (id integer PRIMARY KEY, question_text text NOT NULL, correct_answer varchar(500) NOT NULL);
    CREATE TABLE advanced_validation_choices (id serial PRIMARY KEY, question_id integer NOT NULL, choice_text varchar(500) NOT NULL);
    INSERT INTO survey_questions (id, title, question_key, "order") VALUES (1, 'goal', 'goal', 1), (4, 'experience', 'experience', 4);
    INSERT INTO survey_options (id, question_id, option_text, option_key, level_value) VALUES
      (1, 1, 'web', 'web', NULL), (12, 4, 'none', 'none', 1), (13, 4, 'some', 'some', 10), (14, 4, 'python', 'python', 10);
    INSERT INTO advanced_validation (id, question_text, correct_answer) VALUES
      (1, 'len("abc")', '3'), (2, 'type(1.0)', 'float'), (3, '2 ** 3', '8');
    INSERT INTO advanced_validation_choices (question_id, choice_text) VALUES
      (1, '2'), (1, '3'), (2, 'int'), (2, 'float'), (3, '6'), (3, '8');
  `);
  const achieved = [];
  app.use('/api', createPlacementRouter(db, { evaluateAchievements: async id => { achieved.push(id); return []; } }));
  await addUsers(['passer', 'failer', 'starter']);
  await db.query("UPDATE users SET level = 0 WHERE username IN ('passer', 'failer', 'starter')");
  const idOf = async name => (await db.query('SELECT user_id FROM users WHERE username = ?', [name]))[0][0].user_id;
  const levelOf = async name => (await db.query('SELECT level FROM users WHERE username = ?', [name]))[0][0].level;
  const correct = { 1: '3', 2: 'float', 3: '8' };

  // Signed out: nothing is served and nothing moves.
  assert.equal((await call('/api/advanced-validation', { user: null })).status, 401);
  assert.equal((await call('/api/assessment/submit', { user: null, body: { option_id: 13, answers: correct } })).status, 401);
  assert.equal((await call('/api/assessment/beginner', { user: null, body: {} })).status, 401);

  // The test reaches the browser without its answer key.
  const loaded = await call('/api/advanced-validation', { user: 'passer' });
  assert.equal(loaded.status, 200);
  assert.deepEqual(loaded.body, [
    { id: 1, question_text: 'len("abc")', choices: ['2', '3'] },
    { id: 2, question_text: 'type(1.0)', choices: ['int', 'float'] },
    { id: 3, question_text: '2 ** 3', choices: ['6', '8'] },
  ]);
  assert.doesNotMatch(JSON.stringify(loaded.body), /correct_answer/);

  // Pass: the level comes from the survey option, not from what the client claims.
  const passed = await call('/api/assessment/submit', {
    user: 'passer',
    body: { option_id: 13, answers: correct, score: 0, total_questions: 99, selected_level: 2, level: 3 },
  });
  assert.equal(passed.status, 200);
  assert.equal(passed.body.passed, true);
  assert.equal(passed.body.score, 3);
  assert.equal(passed.body.user.level, 10);
  assert.equal(await levelOf('passer'), 10);
  assert.deepEqual(achieved, [await idOf('passer')]);

  // Fail: one of three right (needs two), a claimed perfect score is ignored.
  const failed = await call('/api/assessment/submit', {
    user: 'failer',
    body: { option_id: 14, answers: { 1: '3', 2: 'int', 3: '6' }, score: 3, total_questions: 3, selected_level: 10 },
  });
  assert.equal(failed.status, 200);
  assert.equal(failed.body.passed, false);
  assert.equal(failed.body.score, 1);
  assert.equal(failed.body.passScore, 2);
  assert.equal(failed.body.user, undefined);
  assert.equal(await levelOf('failer'), 0);
  assert.equal(achieved.length, 1);

  // The retired endpoint that wrote any level from the body is gone.
  const retired = await call('/api/user/update-level', {
    user: 'failer',
    body: { user_id: await idOf('failer'), level: 10 },
  });
  assert.equal(retired.status, 404);
  assert.equal(await levelOf('failer'), 0);

  // "Never programmed": 0 -> 1, and that account has left signup.
  const beginner = await call('/api/assessment/beginner', { user: 'starter', body: {} });
  assert.equal(beginner.status, 200);
  assert.equal(beginner.body.user.level, 1);
  assert.equal(await levelOf('starter'), 1);

  const afterSignup = await call('/api/assessment/submit', { user: 'starter', body: { option_id: 13, answers: correct } });
  assert.equal(afterSignup.status, 409);
  assert.equal(await levelOf('starter'), 1);
  assert.equal(achieved.length, 1);
});
