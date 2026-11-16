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

  // Measured 2026-10-25 on the 4 GB laptop GPU (~13 tokens/s): asked for no
  // length, the model wrote 600+ tokens and 8 of 10 questions hit the timeout.
  await t.test('Lumi is asked for a short answer, in one system message', async () => {
    for (const messages of [
      [{ role: 'user', content: 'for loop คืออะไร' }],
      [{ role: 'system', content: 'โจทย์: ทักทาย' }, { role: 'user', content: 'ผิดตรงไหน' }],
    ]) {
      ollama.reset();
      ollama.respond(() => ({ content: 'สั้นๆ' }));
      await server.call('/api/ai/chat', { body: { messages } });
      const [sent] = ollama.chatRequests();
      assert.ok(sent.body.max_tokens <= 500, `max_tokens ${sent.body.max_tokens}`);
      const systems = sent.body.messages.filter(m => m.role === 'system');
      assert.equal(systems.length, 1, 'a chat template takes one system message');
      assert.equal(sent.body.messages[0].role, 'system');
      assert.match(systems[0].content, /สั้น/);
      // Lumi is a woman on every page, whatever system message the page sent.
      assert.match(systems[0].content, /ผู้หญิง/);
      assert.match(systems[0].content, /ค่ะ/);
      if (messages[0].role === 'system') assert.match(systems[0].content, /โจทย์: ทักทาย/);
    }
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

  // 2026-11-12: two pages sent `message` instead of `messages`; the model got
  // only the system prompt and introduced itself to every question.
  await t.test('a request with no question is refused before it reaches the model', async () => {
    ollama.reset();
    for (const body of [
      { message: 'ช่วยอธิบายโจทย์ข้อนี้' },
      { messages: [{ role: 'system', content: 'โจทย์: ทักทาย' }] },
      { messages: [{ role: 'user', content: '   ' }] },
    ]) {
      const res = await server.call('/api/ai/chat', { body });
      assert.equal(res.status, 400, JSON.stringify(body));
    }
    assert.equal(ollama.chatRequests().length, 0);
  });

  const askStreaming = async (question, { signal } = {}) => fetch(`${server.baseURL}/api/ai/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${server.token}`,
      'Content-Type': 'application/json',
      'x-pyarena-request': '1',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ messages: [{ role: 'user', content: question }] }),
    signal,
  });
  const readEvents = async (response) => (await response.text())
    .split('\n\n')
    .map(block => block.replace(/^data: /, '').trim())
    .filter(Boolean)
    .map(data => JSON.parse(data));

  await t.test('a browser that asks for a stream gets the answer in pieces, without the reasoning', async () => {
    ollama.reset();
    ollama.respond(() => ({ chunks: ['<think>ผู้ใช้', 'ถามเรื่องลูป</think>', 'ลูปคือ', 'การทำซ้ำ'] }));
    const res = await askStreaming('ลูปคืออะไร');
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/event-stream/);
    assert.match(res.headers.get('cache-control'), /no-transform/, 'compression must not buffer the stream');
    const events = await readEvents(res);
    const texts = events.filter(e => typeof e.text === 'string').map(e => e.text);
    assert.ok(texts.length >= 2, `expected several pieces, got ${JSON.stringify(texts)}`);
    assert.equal(texts.join(''), 'ลูปคือการทำซ้ำ');
    assert.deepEqual(events.at(-1), { done: true });
    const [sent] = ollama.chatRequests();
    assert.equal(sent.body.stream, true);
    // (reasoning_effort is not checked here: the test above taught this server
    // to drop it, as a real one that rejects it would.)
    assert.equal(sent.body.messages.at(-1).content, 'ลูปคืออะไร');
  });

  await t.test('a failing model ends the stream with a polite error event', async () => {
    ollama.respond(() => ({ status: 500, body: { error: 'model crashed' } }));
    const events = await readEvents(await askStreaming('ลูปคืออะไร'));
    assert.match(events.at(-1).error, new RegExp(POLITE));
  });

  await t.test('a model that goes quiet mid-answer is cut off, keeping what it wrote', async () => {
    ollama.respond(() => ({ chunks: ['ลูป', 'คือ'], chunkDelayMs: 4000 }));
    const started = Date.now();
    const events = await readEvents(await askStreaming('ลูปคืออะไร'));
    assert.equal(events[0].text, 'ลูป');
    assert.match(events.at(-1).error, new RegExp(POLITE));
    assert.ok(Date.now() - started < 3500, 'the idle limit is LLM_TIMEOUT_MS');
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
