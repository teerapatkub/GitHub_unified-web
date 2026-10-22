// Post-match Arcade advice from the local model - Spec 0004, ticket 04. The real
// server is booted against a fake Ollama and driven through
// POST /api/arcade/history/:id/advice, the call the round-history panel makes.
// Scores are never involved: the row already holds the measured result.
const assert = require('node:assert/strict');
const test = require('node:test');
const { startServerWithFakeOllama } = require('./helpers/start-server');

const ADVICE_MODEL = 'scb10x/typhoon2.1-gemma3-4b';
const FINDINGS = [{ criterion: 'standard', line: 2, th: 'ชื่อ myList ควรเป็น snake_case' }];

// One finished round of a finished match, played by the probe player.
let rounds = 0;
async function seedFinishedRound(db, username) {
  rounds += 1;
  const code = `ARC-A${rounds}`;
  const { rows: [room] } = await db.query(
    "INSERT INTO arcade_rooms (room_code, room_name, host_name) VALUES ($1, 'Advice room', $2) RETURNING room_id", [code, username]);
  const { rows: [match] } = await db.query(
    "INSERT INTO arcade_matches (room_id, room_code, room_name, ended_at) VALUES ($1, $2, 'Advice room', now()) RETURNING match_id",
    [room.room_id, code]);
  const { rows: [history] } = await db.query(
    `INSERT INTO arcade_round_history
       (room_id, match_id, user_name, round_num, code, pass_count, total_count, quality_score, match_ended_at, quality_rubric, quality_source)
     VALUES ($1, $2, $3, 1, $4, 3, 3, 90, now(), $5, 'metrics') RETURNING id`,
    [room.room_id, match.match_id, username, 'def total(xs):\n    myList = xs\n    return sum(myList)',
      JSON.stringify({ time: 100, efficiency: 100, standard: 70, findings: FINDINGS })]);
  return history.id;
}

async function boot(t, prefix, envFor) {
  const { ollama, server, db } = await startServerWithFakeOllama(t, { prefix, envFor });
  const { rows: [player] } = await db.query('SELECT username FROM users WHERE user_id = $1', [server.userId]);
  return { ollama, server, db, username: player.username };
}

const ask = (server, id) => server.call(`/api/arcade/history/${id}/advice`, { body: {} });
const storedAdvice = async (db, id) => (await db.query('SELECT quality_feedback FROM arcade_round_history WHERE id = $1', [id])).rows[0].quality_feedback;

test('post-match advice comes from the local model, once per round', { timeout: 600_000 }, async t => {
  const { ollama, server, db, username } = await boot(t, 'pyarena_advice', o => ({
    LLM_BASE_URL: o.baseURL, LLM_ADVICE_MODEL: ADVICE_MODEL, LLM_TIMEOUT_MS: '1500',
  }));

  await t.test('the advice is the model\'s, asked of the advice model, and kept', async () => {
    const id = await seedFinishedRound(db, username);
    ollama.reset();
    ollama.respond(() => ({ content: 'ลองตั้งชื่อตัวแปรแบบ snake_case เช่น my_list นะ' }));
    const res = await ask(server, id);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.deepEqual(res.body, { advice: 'ลองตั้งชื่อตัวแปรแบบ snake_case เช่น my_list นะ', source: 'ai' });
    assert.equal(await storedAdvice(db, id), 'ลองตั้งชื่อตัวแปรแบบ snake_case เช่น my_list นะ');
    const [sent] = ollama.chatRequests();
    assert.equal(sent.body.model, ADVICE_MODEL);
    assert.match(sent.body.messages.at(-1).content, /snake_case/, 'the measured findings are given to the model');
  });

  await t.test('asking again returns the kept advice without calling the model', async () => {
    const id = await seedFinishedRound(db, username);
    ollama.respond(() => ({ content: 'คำแนะนำครั้งแรก' }));
    await ask(server, id);
    ollama.reset();
    ollama.respond(() => ({ content: 'ไม่ควรถูกเรียก' }));
    assert.equal((await ask(server, id)).body.advice, 'คำแนะนำครั้งแรก');
    assert.equal(ollama.chatRequests().length, 0);
  });

  await t.test('two requests at once for the same round ask the model once', async () => {
    const id = await seedFinishedRound(db, username);
    ollama.reset();
    ollama.respond(() => ({ delayMs: 300, content: 'คำแนะนำเดียว' }));
    const [a, b] = await Promise.all([ask(server, id), ask(server, id)]);
    assert.equal(a.body.advice, 'คำแนะนำเดียว');
    assert.equal(b.body.advice, 'คำแนะนำเดียว');
    assert.equal(ollama.chatRequests().length, 1);
  });

  await t.test('a busy model (Ollama 503, queue full) is asked once more and its advice kept', async () => {
    const id = await seedFinishedRound(db, username);
    ollama.reset();
    ollama.respond(() => (ollama.chatRequests().length === 1
      ? { status: 503, body: { error: 'server busy, please try again' } }
      : { content: 'ลองตั้งชื่อตัวแปรให้อ่านง่ายขึ้น' }));
    const res = await ask(server, id);
    assert.deepEqual(res.body, { advice: 'ลองตั้งชื่อตัวแปรให้อ่านง่ายขึ้น', source: 'ai' });
    assert.equal(ollama.chatRequests().length, 2);
  });

  await t.test('a failing or slow model gives the measured findings, and is not kept', async () => {
    for (const reply of [{ status: 500, body: { error: 'model crashed' } }, { delayMs: 4000, content: 'มาช้า' }]) {
      const id = await seedFinishedRound(db, username);
      ollama.respond(() => reply);
      const res = await ask(server, id);
      assert.equal(res.status, 200, JSON.stringify(res.body));
      assert.equal(res.body.source, 'metrics');
      assert.match(res.body.advice, /snake_case/);
      assert.equal(await storedAdvice(db, id), null, 'a fallback must not block real advice later');
    }
  });
});

test('without LLM_BASE_URL the advice is the measured findings and no model is called', { timeout: 600_000 }, async t => {
  const { ollama, server, db, username } = await boot(t, 'pyarena_advice_nollm', () => ({
    LLM_BASE_URL: '', LLM_ADVICE_MODEL: ADVICE_MODEL,
  }));
  const id = await seedFinishedRound(db, username);
  const res = await ask(server, id);
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.source, 'metrics');
  assert.match(res.body.advice, /snake_case/);
  assert.equal(ollama.requests.length, 0);
});
