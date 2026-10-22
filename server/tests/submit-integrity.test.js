// Can a learner still collect XP and coins without solving anything?
//
// Both learning submit endpoints used to say yes:
//   POST /api/exercises/:id/submit     set is_passed = true for every request and
//                                      never looked at the code
//   POST /api/learning/ai-task/submit  read `passed` out of the request body
//
// so `{passed:true}` was worth a full reward. The real server is booted against
// a disposable database and driven over HTTP as a signed-in player; balances are
// read back out of the database, because what is worth protecting is what
// actually got paid.
//
// This replaces scripts/submit-integrity-test.js, which sent no auth token and
// so, after the move to Supabase Auth, passed every "cheating is rejected"
// check on a 401 alone.
const assert = require('node:assert/strict');
const test = require('node:test');
const { Pool } = require('pg');
const { createTestDatabase, startServer } = require('./helpers/start-server');

test('learning rewards are paid only for a correct answer', { timeout: 600_000 }, async t => {
  const url = await createTestDatabase(t, 'pyarena_submit');
  // No model: the ai-task draw below must come from the bank or the built-in set.
  const server = await startServer(t, { url, env: { LLM_BASE_URL: '', LLM_CHAT_MODEL: '' } });
  const db = new Pool({ connectionString: url, ssl: false });
  // The database is dropped WITH (FORCE) at teardown, which ends idle clients.
  db.on('error', () => {});
  t.after(() => db.end());

  const userId = server.userId;
  // A level well above what any one reward could reach, so a level-up never
  // resets the stored xp and the wallet difference is exactly what was paid.
  await db.query('UPDATE users SET level = 50, xp = 0, virtual_currency = 0 WHERE user_id = $1', [userId]);

  const wallet = async () => {
    const { rows: [u] } = await db.query('SELECT xp, virtual_currency FROM users WHERE user_id = $1', [userId]);
    return { xp: Number(u.xp), coins: Number(u.virtual_currency) };
  };
  const submit = (entryId, code) => server.call(`/api/exercises/${entryId}/submit`, { body: { user_id: userId, submitted_code: code } });
  const passedRows = async () => {
    // is_passed is SMALLINT, not BOOLEAN - every flag in this schema is,
    // because the old database layer could not bind real booleans.
    const { rows: [r] } = await db.query('SELECT count(*)::int AS n FROM exercise_submissions WHERE user_id = $1 AND is_passed = 1', [userId]);
    return r.n;
  };

  // A lesson exercise the server actually grades, with a known solution.
  const { rows: [ex] } = await db.query(`
    SELECT m.entry_id, p.solution_code, e.xp_reward, e.currency_reward
      FROM problem_modes m JOIN problems p ON p.problem_id = m.problem_id
      JOIN exercises e ON e.exercise_id = m.entry_id
     WHERE m.mode = 'lesson' AND p.is_auto_gradable = 1
       AND p.solution_code IS NOT NULL AND btrim(p.solution_code) <> ''
       AND jsonb_array_length(p.test_cases) > 0
     ORDER BY m.entry_id LIMIT 1`);
  assert.ok(ex, 'the seeded bank has an auto-gradable lesson exercise');

  await t.test('empty code is rejected and pays nothing', async () => {
    const before = await wallet();
    const res = await submit(ex.entry_id, '');
    assert.equal(res.status, 400, JSON.stringify(res.body));
    assert.deepEqual(await wallet(), before);
    assert.equal(await passedRows(), 0);
  });

  await t.test('a wrong answer is rejected by the grader and pays nothing', async () => {
    const before = await wallet();
    const res = await submit(ex.entry_id, 'print("ไม่ใช่คำตอบ")');
    assert.equal(res.status, 400, JSON.stringify(res.body));
    // A grader verdict, not an auth or validation refusal: it ran the tests.
    assert.ok(res.body.total > 0, JSON.stringify(res.body));
    assert.ok(res.body.passed < res.body.total, JSON.stringify(res.body));
    assert.deepEqual(await wallet(), before);
    assert.equal(await passedRows(), 0);
  });

  await t.test('{passed:true} without code is rejected on the ai-task endpoint', async () => {
    const drawn = await server.call(`/api/learning/ai-task?userId=${userId}&mode=exercise`, { method: 'GET' });
    assert.equal(drawn.status, 200, JSON.stringify(drawn.body));
    const { taskId } = drawn.body.task;
    assert.ok(taskId, JSON.stringify(drawn.body.task));

    const before = await wallet();
    const res = await server.call('/api/learning/ai-task/submit', { body: { userId, taskId, mode: 'exercise', passed: true } });
    assert.equal(res.status, 400, JSON.stringify(res.body));
    assert.deepEqual(await wallet(), before);
    const { rows: [task] } = await db.query('SELECT status FROM learning_ai_tasks WHERE task_id = $1', [taskId]);
    assert.equal(task.status, 'ACTIVE', 'the task was not completed');
  });

  await t.test('a correct answer is accepted and pays the exercise reward', async () => {
    const before = await wallet();
    const res = await submit(ex.entry_id, ex.solution_code);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.xp_reward, Number(ex.xp_reward));
    assert.equal(res.body.currency_reward, Number(ex.currency_reward));
    // A first pass can also unlock achievements, which pay coins of their own.
    const achievementCoins = (res.body.new_achievements || []).reduce((sum, a) => sum + Number(a.reward || 0), 0);
    assert.deepEqual(await wallet(), {
      xp: before.xp + Number(ex.xp_reward),
      coins: before.coins + Number(ex.currency_reward) + achievementCoins,
    });
    assert.equal(await passedRows(), 1);
  });

  await t.test('passing the same exercise again pays nothing more', async () => {
    const before = await wallet();
    const res = await submit(ex.entry_id, ex.solution_code);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.alreadyPassed, true);
    assert.deepEqual(await wallet(), before);
  });

  // The problems that cannot be auto-graded are the other half of this hole.
  // They are accepted WITHOUT a verdict, so for a long time an empty string
  // collected the full reward on them.
  await t.test('a problem that cannot be auto-graded still refuses junk', async () => {
    const { rows: [ungraded] } = await db.query(`
      SELECT m.entry_id, p.starter_code
        FROM problem_modes m JOIN problems p ON p.problem_id = m.problem_id
       WHERE m.mode = 'lesson' AND p.is_auto_gradable = 0
       ORDER BY m.entry_id LIMIT 1`);
    assert.ok(ungraded, 'the seeded bank has a lesson problem that is not auto-gradable');

    const before = await wallet();
    const blank = await submit(ungraded.entry_id, '');
    assert.equal(blank.status, 400, JSON.stringify(blank.body));
    const untouched = await submit(ungraded.entry_id, ungraded.starter_code || '');
    assert.equal(untouched.status, 400, JSON.stringify(untouched.body));
    assert.deepEqual(await wallet(), before);
    const { rows: [r] } = await db.query(
      'SELECT count(*)::int AS n FROM exercise_submissions WHERE user_id = $1 AND exercise_id = $2 AND is_passed = 1',
      [userId, ungraded.entry_id]);
    assert.equal(r.n, 0);
  });
});
