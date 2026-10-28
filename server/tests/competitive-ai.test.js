const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createCompetitiveAiRouter, generateChallenge, validateChallenge, restrictedSolution } = require('../competitiveAi');
const { createLocalJsonAsker } = require('../ai/localJson');
const { gradeSubmission } = require('../problemGrader');

const draft = () => ({ title: 'เพิ่มเป็นสองเท่า', description: 'อ่านจำนวนเต็มหนึ่งตัวแล้วพิมพ์สองเท่า', solution: 'n = int(input())\nprint(n * 2)',
  testCases: Array.from({ length: 8 }, (_, i) => ({ input: String(i - 3), expected: String((i - 3) * 2) })) });

test('generated challenge must contain eight distinct exact tests and a reference', () => {
  assert.equal(validateChallenge(draft()).testCases.length, 8);
  for (const mutate of [d => d.testCases.pop(), d => { d.solution = ''; }, d => { d.testCases[1].input = d.testCases[0].input; }]) {
    const d = draft(); mutate(d); assert.throws(() => validateChallenge(d), { status: 422 });
  }
});

test('reference solution passes real Python cases; solution is withheld from generated draft', async () => {
  const result = await generateChallenge({ topic: 'Math', scope: 'community' }, { ask: async () => draft() });
  assert.equal(result.verifiedCases, 8);
  assert.equal(result.solution, undefined);
  const invalid = draft(); invalid.solution = 'print(999)';
  await assert.rejects(generateChallenge({ topic: 'Math', scope: 'weekly' }, { ask: async () => invalid }), { status: 422 });
});

test('generated reference cannot import modules, read files or access introspection', async () => {
  for (const source of ["import os\nprint('ok')", "print(open('secret').read())", "print((1).__class__)", "print(getattr(1, '__class__'))"]) {
    const result = await gradeSubmission({ problem: { test_kind: 'stdio', test_cases: [{ input: '', expected: 'ok' }] }, code: restrictedSolution(source), timeoutMs: 1000 });
    assert.equal(result.passed, 0);
  }
});

test('expected outputs are what the reference prints, not what the model wrote', async () => {
  const wrong = draft();
  for (const c of wrong.testCases) c.expected = 'nonsense';
  const result = await generateChallenge({ topic: 'Math', scope: 'community' }, { ask: async () => wrong });
  assert.deepEqual(result.testCases.map(c => c.expected), wrong.testCases.map(c => String(Number(c.input) * 2)));
});

test('the local model is asked, never an external provider; its failures map to clear statuses', async () => {
  const asked = [];
  const fakeCaller = (reply) => (options) => ({
    enabled: Boolean(options.baseURL && options.model), model: options.model,
    call: async (request) => { asked.push({ options, request }); if (reply instanceof Error) throw reply; return reply; },
  });
  const env = { LLM_BASE_URL: 'http://ollama:11434/v1', LLM_CHAT_MODEL: 'local-model' };
  const args = { instruction: 'test', data: { topic: 'Loop' }, schema: { type: 'object' } };
  await assert.rejects(createLocalJsonAsker({}, { createCaller: fakeCaller('{}') })(args), { status: 503 });
  assert.deepEqual(await createLocalJsonAsker(env, { createCaller: fakeCaller('ok: {"a":1}') })(args), { a: 1 });
  assert.equal(asked[0].options.model, 'local-model');
  assert.equal(asked[0].options.baseURL, 'http://ollama:11434/v1');
  assert.equal(asked[0].request.json, true);
  await assert.rejects(createLocalJsonAsker(env, { createCaller: fakeCaller('not json') })(args), { status: 422 });
  await assert.rejects(createLocalJsonAsker(env, { createCaller: fakeCaller(Object.assign(new Error('busy'), { status: 503 })) })(args), { status: 429 });
  await assert.rejects(createLocalJsonAsker(env, { createCaller: fakeCaller(new Error('Request timed out.')) })(args), { status: 504 });
});

test('generation enforces identity, level, admin scope and cooldown without publishing', async t => {
  const generated = [];
  const app = express(); app.use(express.json());
  app.use((req, _res, next) => { if (req.headers['x-role']) req.player = { user_id: req.headers['x-id'] || '1', role: req.headers['x-role'], level: Number(req.headers['x-level'] || 10) }; next(); });
  app.use(createCompetitiveAiRouter({ generate: async data => { generated.push(data); return { title: 'preview', verifiedCases: 8 }; } }));
  const server = app.listen(0, '127.0.0.1'); await new Promise(r => server.once('listening', r));
  t.after(() => new Promise(r => { server.close(r); server.closeAllConnections(); }));
  const post = (body, headers = {}) => fetch(`http://127.0.0.1:${server.address().port}/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  assert.equal((await post({})).status, 401);
  assert.equal((await post({}, { 'x-role': 'user', 'x-level': '9' })).status, 403);
  assert.equal((await post({ scope: 'weekly' }, { 'x-role': 'user' })).status, 403);
  assert.equal((await post({ topic: 'invalid' }, { 'x-role': 'user' })).status, 400);
  assert.equal((await post({ topic: 'Loop' }, { 'x-role': 'user' })).status, 200);
  assert.equal((await post({}, { 'x-role': 'user' })).status, 429);
  assert.equal((await post({ scope: 'weekly' }, { 'x-role': 'admin', 'x-id': '2' })).status, 200);
  assert.deepEqual(generated, [{ topic: 'Loop', scope: 'community' }, { topic: 'Python', scope: 'weekly' }]);
});


test('invalid draft and failed reference are repaired before returning a usable challenge', async () => {
  let calls = 0;
  const result = await generateChallenge({ topic: 'Loop', scope: 'weekly' }, { ask: async request => {
    calls++;
    if (calls === 1) return {};
    assert.ok(request.data.correction);
    const value = draft();
    if (calls === 2) value.solution = 'print(undefined_name)';
    else value.solution = 'for _ in range(1):\n    print(int(input()) * 2)';
    return value;
  } });
  assert.equal(calls, 3);
  assert.equal(result.verifiedCases, 8);
});
