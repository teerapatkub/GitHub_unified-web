// Practice problems the local model writes for Hard Challenge - Spec 0004,
// ticket 02. Debug Lab is drawn from the bank only and never asks the model: its
// "bugs" left the output unchanged in 14 of 15 generated problems (2026-10-27).
// The real server is booted against a fake Ollama and driven
// through GET /api/learning/ai-task, the endpoint the learner's page calls.
//
// A generated problem's expected outputs are what its own solution prints for
// each test input, not what the model wrote down (the model's own values were
// wrong in 8 of 10 generated problems, 2026-10-27). It reaches a learner only
// when that solution runs cleanly on every input. Anything else - broken JSON,
// a missing field, a solution that crashes or prints nothing, a timeout - gets
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
const BUILT_IN_CHALLENGE = 'Calculate VAT';

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

  const draw = async (mode = 'challenge') => {
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
    assert.equal((await draw()).task.title, BUILT_IN_CHALLENGE);
  });

  await t.test('JSON without test cases gets the built-in problem, not a mix of the two', async () => {
    ollama.respond(() => ({ content: JSON.stringify(greetingTask({ testCases: undefined })) }));
    const { task, row } = await draw();
    assert.equal(task.title, BUILT_IN_CHALLENGE);
    assert.doesNotMatch(row.test_cases_json, /Hello/);
  });

  await t.test('a wrong expected output is replaced by what the solution prints', async () => {
    ollama.respond(() => ({ content: JSON.stringify(greetingTask({ testCases: [
      { input: 'Pong', expected: 'Hello Pong' },
      { input: 'Mi', expected: 'Hi Mi' },
      { input: 'Ann' },
    ] })) }));
    const { task, row } = await draw();
    assert.equal(task.title, 'Fix the Greeting');
    assert.deepEqual(JSON.parse(row.test_cases_json), greetingTask().testCases);
  });

  await t.test('output from an input() prompt is not part of the expected output', async () => {
    ollama.respond(() => ({ content: JSON.stringify(greetingTask({
      solutionCode: 'name = input("Your name: ")\nprint("Hello " + name)',
    })) }));
    const { row } = await draw();
    assert.deepEqual(JSON.parse(row.test_cases_json), greetingTask().testCases);
  });

  await t.test('a solution that crashes on one of its inputs gets the built-in problem', async () => {
    ollama.respond(() => ({ content: JSON.stringify(greetingTask({
      solutionCode: 'name = input()\nprint("Hello " + name[3])',
      testCases: [{ input: 'Pong' }, { input: 'Mi' }, { input: 'Anne' }],
    })) }));
    assert.equal((await draw()).task.title, BUILT_IN_CHALLENGE);
  });

  await t.test('a solution that prints the same thing whatever the input gets the built-in problem', async () => {
    ollama.respond(() => ({ content: JSON.stringify(greetingTask({
      starterCode: 'name = input()\nprint("Helo World")',
      solutionCode: 'name = input()\nprint("Hello World")',
    })) }));
    assert.equal((await draw()).task.title, BUILT_IN_CHALLENGE);
  });

  await t.test('a solution that prints nothing gets the built-in problem', async () => {
    ollama.respond(() => ({ content: JSON.stringify(greetingTask({ solutionCode: 'name = input()' })) }));
    assert.equal((await draw()).task.title, BUILT_IN_CHALLENGE);
  });

  await t.test('a Debug Lab never asks the model, even with the bank empty', async () => {
    ollama.respond(() => ({ content: JSON.stringify(greetingTask()) }));
    assert.equal((await draw('exercise')).task.title, BUILT_IN_DEBUG_LAB);
    assert.equal(ollama.chatRequests().length, 0);
  });

  await t.test('a model slower than LLM_TIMEOUT_MS gets the built-in problem', async () => {
    ollama.respond(() => ({ delayMs: 4000, content: JSON.stringify(greetingTask()) }));
    assert.equal((await draw()).task.title, BUILT_IN_CHALLENGE);
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
