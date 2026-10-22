// Lumi answers through the local model (Ollama) at LLM_BASE_URL - Spec 0004,
// ticket 01. The real server is booted against a fake Ollama, so these tests
// drive the endpoint a learner's browser calls, not an internal function.
const assert = require('node:assert/strict');
const test = require('node:test');
const { startFakeOllama } = require('./helpers/fake-ollama');
const { createTestDatabase, startServer } = require('./helpers/start-server');

const POLITE = 'Lumi ขัดข้องชั่วคราว';
const ask = (server, question = 'for loop คืออะไร') => server.call('/api/ai/chat', {
  body: { messages: [{ role: 'user', content: question }] },
});

test('Lumi answers through the local model, and falls back politely when it fails', { timeout: 600_000 }, async t => {
  const ollama = await startFakeOllama();
  t.after(() => ollama.close());
  const url = await createTestDatabase(t, 'pyarena_llm');
  const server = await startServer(t, {
    url,
    env: { LLM_BASE_URL: ollama.baseURL, LLM_CHAT_MODEL: 'scb10x/typhoon2.5-qwen3-4b', LLM_TIMEOUT_MS: '1500' },
  });

  await t.test('the reply comes from the configured model', async () => {
    ollama.reset();
    ollama.respond(() => ({ content: 'for loop ใช้วนทำซ้ำตามจำนวนรอบ' }));
    const res = await ask(server);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.reply, 'for loop ใช้วนทำซ้ำตามจำนวนรอบ');
    const [sent] = ollama.chatRequests();
    assert.equal(sent.body.model, 'scb10x/typhoon2.5-qwen3-4b');
    assert.equal(sent.body.messages.at(-1).content, 'for loop คืออะไร');
    assert.equal(sent.body.chat_template_kwargs, undefined, 'NVIDIA-only parameters must not be sent');
    assert.equal(sent.body.reasoning_effort, 'none', 'thinking must be switched off, not just hidden');
  });

  await t.test('a server that rejects the thinking switch is asked again without it, once', async () => {
    ollama.reset();
    ollama.respond(request => (request.body.reasoning_effort
      ? { status: 400, body: { error: { message: 'invalid reasoning_effort' } } }
      : { content: 'ตอบได้โดยไม่ต้องคิด' }));
    assert.equal((await ask(server)).body.reply, 'ตอบได้โดยไม่ต้องคิด');
    assert.equal((await ask(server)).body.reply, 'ตอบได้โดยไม่ต้องคิด');
    assert.deepEqual(ollama.chatRequests().map(r => 'reasoning_effort' in r.body), [true, false, false]);
  });

  await t.test('a model that thinks aloud only shows its answer', async () => {
    ollama.respond(() => ({ content: '<think>ผู้ใช้ถามเรื่องลูป</think>\nลูปคือการทำซ้ำ' }));
    const res = await ask(server);
    assert.equal(res.body.reply, 'ลูปคือการทำซ้ำ');
  });

  await t.test('a failing model gets a polite reply, not an error page', async () => {
    ollama.respond(() => ({ status: 500, body: { error: 'model crashed' } }));
    const res = await ask(server);
    assert.match(res.body.reply, new RegExp(POLITE));
  });

  await t.test('a model slower than LLM_TIMEOUT_MS gets the same polite reply', async () => {
    ollama.respond(() => ({ delayMs: 4000, content: 'มาช้าเกินไป' }));
    const started = Date.now();
    const res = await ask(server);
    assert.match(res.body.reply, new RegExp(POLITE));
    assert.ok(Date.now() - started < 3500, 'the request must give up at the timeout, not wait for the model');
  });
});

test('without LLM_BASE_URL the server still boots and never calls a model', { timeout: 600_000 }, async t => {
  const ollama = await startFakeOllama();
  t.after(() => ollama.close());
  const url = await createTestDatabase(t, 'pyarena_nollm');
  const server = await startServer(t, {
    url,
    env: { LLM_BASE_URL: '', LLM_CHAT_MODEL: 'scb10x/typhoon2.5-qwen3-4b' },
  });

  const res = await ask(server);
  assert.match(res.body.reply, new RegExp(POLITE));
  assert.equal(ollama.requests.length, 0);
});
