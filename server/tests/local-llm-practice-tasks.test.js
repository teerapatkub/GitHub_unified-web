// Practice problems the local model writes (Debug Lab / Hard Challenge) - Spec
// 0004, ticket 02. The real server is booted against a fake Ollama and driven
// through GET /api/learning/ai-task, the endpoint the learner's page calls.
//
// A generated problem only reaches a learner when its own solution passes its
// own test cases (and, for Debug Lab, its buggy starter does not). Anything
// else - broken JSON, a missing field, wrong expected output, a timeout - gets
// the built-in problem instead.
const assert = require('node:assert/strict');
const test = require('node:test');
const { Pool } = require('pg');
const { startFakeOllama } = require('./helpers/fake-ollama');
const { createTestDatabase, startServer } = require('./helpers/start-server');

const greetingTask = (overrides = {}) => ({
  title: 'Fix the Greeting',
  instructions: ['แก้โค้ดให้ทักทายโดยมีช่องว่างหลังคำว่า Hello'],
  example: { input: 'Pong', output: 'Hello Pong' },
  starterCode: 'name = input()\nprint("Hello" + name)',
  solutionCode: 'name = input()\nprint("Hello " + name)',
  testCases: [
    { input: 'Pong', expected: 'Hello Pong' },
    { input: 'Mi', expected: 'Hello Mi' },
    { input: 'Ann', expected: 'Hello Ann' },
  ],
  rewardXp: 120,
  rewardCoins: 30,
  ...overrides,
});

const BUILT_IN_DEBUG_LAB = 'Fix the Tax Calculator';

test('practice problems come from the local model only when they check out', { timeout: 600_000 }, async t => {
  const ollama = await startFakeOllama();
  t.after(() => ollama.close());
  const url = await createTestDatabase(t, 'pyarena_tasks');
  const server = await startServer(t, {
    url,
    env: { LLM_BASE_URL: ollama.baseURL, LLM_CHAT_MODEL: 'scb10x/typhoon2.5-qwen3-4b', LLM_TIMEOUT_MS: '1500' },
  });
  const db = new Pool({ connectionString: url, ssl: false });
  // The database is dropped WITH (FORCE) at teardown, which ends idle clients.
  db.on('error', () => {});
  t.after(() => db.end());

  // The bank is always tried first; empty it so every draw reaches the model.
  await db.query("UPDATE problem_modes SET is_active = 0 WHERE mode = 'lesson'");

  const draw = async (mode = 'exercise') => {
    await db.query('DELETE FROM learning_ai_tasks WHERE user_id = $1', [server.userId]);
    ollama.reset();
    const res = await server.call(`/api/learning/ai-task?userId=${server.userId}&mode=${mode}`, { method: 'GET' });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const { rows: [row] } = await db.query('SELECT test_cases_json, ai_payload FROM learning_ai_tasks WHERE user_id = $1', [server.userId]);
    return { task: res.body.task, row };
  };

  await t.test('a problem whose solution passes its own tests is served', async () => {
    ollama.respond(() => ({ content: JSON.stringify(greetingTask()) }));
    const { task, row } = await draw();
    assert.equal(task.title, 'Fix the Greeting');
    assert.equal(task.starterCode, 'name = input()\nprint("Hello" + name)');
    assert.deepEqual(JSON.parse(row.test_cases_json), greetingTask().testCases);
    assert.doesNotMatch(JSON.stringify(row.ai_payload), /solutionCode|print\("Hello " \+ name\)/, 'the solution must never be stored with the task');
    const [sent] = ollama.chatRequests();
    assert.equal(sent.body.model, 'scb10x/typhoon2.5-qwen3-4b');
    assert.deepEqual(sent.body.response_format, { type: 'json_object' });
  });

  await t.test('text that is not JSON gets the built-in problem', async () => {
    ollama.respond(() => ({ content: 'นี่คือโจทย์ของคุณ: ให้เขียนโปรแกรมทักทาย' }));
    assert.equal((await draw()).task.title, BUILT_IN_DEBUG_LAB);
  });

  await t.test('JSON without test cases gets the built-in problem, not a mix of the two', async () => {
    ollama.respond(() => ({ content: JSON.stringify(greetingTask({ testCases: undefined })) }));
    const { task, row } = await draw();
    assert.equal(task.title, BUILT_IN_DEBUG_LAB);
    assert.doesNotMatch(row.test_cases_json, /Hello/);
  });

  await t.test('test cases the solution does not pass get the built-in problem', async () => {
    ollama.respond(() => ({ content: JSON.stringify(greetingTask({ testCases: [
      { input: 'Pong', expected: 'Hello Pong' },
      { input: 'Mi', expected: 'Hi Mi' },
      { input: 'Ann', expected: 'Hello Ann' },
    ] })) }));
    assert.equal((await draw()).task.title, BUILT_IN_DEBUG_LAB);
  });

  await t.test('a Debug Lab whose starter already passes has nothing to fix, so it is not served', async () => {
    ollama.respond(() => ({ content: JSON.stringify(greetingTask({ starterCode: 'name = input()\nprint("Hello " + name)' })) }));
    assert.equal((await draw()).task.title, BUILT_IN_DEBUG_LAB);
  });

  await t.test('a model slower than LLM_TIMEOUT_MS gets the built-in problem', async () => {
    ollama.respond(() => ({ delayMs: 4000, content: JSON.stringify(greetingTask()) }));
    assert.equal((await draw()).task.title, BUILT_IN_DEBUG_LAB);
  });

  await t.test('a Hard Challenge may start from comments only', async () => {
    ollama.respond(() => ({ content: JSON.stringify(greetingTask({ title: 'Greet Everyone', starterCode: '# write your code here' })) }));
    assert.equal((await draw('challenge')).task.title, 'Greet Everyone');
  });

  await t.test('an example that matches none of the tests is replaced by the first test', async () => {
    ollama.respond(() => ({ content: JSON.stringify(greetingTask({ example: { input: 'Zed', output: 'Hi Zed' } })) }));
    const { task } = await draw();
    assert.deepEqual(task.example, { input: 'Pong', output: 'Hello Pong' });
  });

  await t.test('more than five tests are cut to the five that were checked', async () => {
    const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    ollama.respond(() => ({ content: JSON.stringify(greetingTask({
      testCases: names.map(n => ({ input: n, expected: `Hello ${n}` })),
    })) }));
    const { task, row } = await draw();
    assert.equal(task.title, 'Fix the Greeting');
    assert.deepEqual(JSON.parse(row.test_cases_json).map(c => c.input), ['A', 'B', 'C', 'D', 'E']);
  });
});

test('without LLM_BASE_URL a practice problem is the built-in one, and no model is called', { timeout: 600_000 }, async t => {
  const ollama = await startFakeOllama();
  t.after(() => ollama.close());
  const url = await createTestDatabase(t, 'pyarena_tasks_nollm');
  const server = await startServer(t, { url, env: { LLM_BASE_URL: '', LLM_CHAT_MODEL: 'scb10x/typhoon2.5-qwen3-4b' } });
  const db = new Pool({ connectionString: url, ssl: false });
  db.on('error', () => {});
  t.after(() => db.end());
  await db.query("UPDATE problem_modes SET is_active = 0 WHERE mode = 'lesson'");

  const res = await server.call(`/api/learning/ai-task?userId=${server.userId}&mode=exercise`, { method: 'GET' });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.task.title, BUILT_IN_DEBUG_LAB);
  assert.equal(ollama.requests.length, 0);
});
