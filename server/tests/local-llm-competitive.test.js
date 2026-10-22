// Competitive Arena: the score, the breakdown and the reward come from the local
// rubric and the test results, never from a model; the local model only writes
// the advice - Spec 0004, ticket 03. The real server is booted against a fake
// Ollama and driven through accept + submit, the endpoints the arena page calls.
const assert = require('node:assert/strict');
const test = require('node:test');
const { Pool } = require('pg');
const { startFakeOllama } = require('./helpers/fake-ollama');
const { createTestDatabase, startServer } = require('./helpers/start-server');

const JUDGE_MODEL = 'scb10x/typhoon2.1-gemma3-4b';
// Upper-cases one word. print(input()) passes only the first case.
const UPPER_CASES = [
  { input: 'A', expected: 'A' },
  { input: 'b', expected: 'B' },
  { input: 'c', expected: 'C' },
];
const HALF_RIGHT = 'word = input()\nprint(word)';
const RIGHT = 'word = input()\nprint(word.upper())';

// The old judge's score fields are still sent, at extreme values, to show the
// server ignores them: only `feedback` is ever read.
const review = fields => ({ content: JSON.stringify({ correctness: 0, complexity: 0, cleanCode: 0, approved: false, feedback: '', ...fields }) });

test('Competitive scores and pays by the rubric whatever the model says', { timeout: 600_000 }, async t => {
  const ollama = await startFakeOllama();
  t.after(() => ollama.close());
  const url = await createTestDatabase(t, 'pyarena_comp');
  const server = await startServer(t, {
    url,
    env: {
      LLM_BASE_URL: ollama.baseURL,
      LLM_CHAT_MODEL: 'scb10x/typhoon2.5-qwen3-4b',
      LLM_JUDGE_MODEL: JUDGE_MODEL,
      LLM_TIMEOUT_MS: '1500',
    },
  });
  const db = new Pool({ connectionString: url, ssl: false });
  db.on('error', () => {});
  t.after(() => db.end());
  // The arena is behind level 10, and only an admin may post a challenge.
  await db.query("UPDATE users SET level = 10, role = 'admin' WHERE user_id = $1", [server.userId]);

  const created = await server.call('/api/competitive/challenges', {
    body: { title: 'Upper', description: 'พิมพ์คำที่รับมาเป็นตัวพิมพ์ใหญ่', reward: 200, time_limit: 600, test_cases: UPPER_CASES, created_by: server.userId },
  });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  const challengeId = created.body.challenge_id;

  const submit = async (code) => {
    const accepted = await server.call(`/api/competitive/challenges/${challengeId}/accept`, { body: { user_id: server.userId } });
    assert.ok([200, 201].includes(accepted.status), JSON.stringify(accepted.body));
    ollama.reset();
    const res = await server.call(`/api/competitive/challenges/${challengeId}/submit`, { body: { user_id: server.userId, code } });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    return res.body;
  };
  const numbers = body => ({ score: body.score, passed: body.passed, total: body.total, rewardCoins: body.rewardCoins, correctness: body.breakdown.correctness, complexity: body.breakdown.complexity, cleanCode: body.breakdown.cleanCode, aiApproved: body.breakdown.aiApproved });

  ollama.respond(() => review({ correctness: 50, complexity: 20, cleanCode: 30, approved: true, feedback: 'ยอดเยี่ยม ให้ผ่าน' }));
  const flattered = await submit(HALF_RIGHT);
  ollama.respond(() => review({ correctness: 0, complexity: 0, cleanCode: 0, approved: false, feedback: 'ลองใช้ .upper() กับข้อความ' }));
  const scolded = await submit(HALF_RIGHT);
  ollama.respond(() => ({ status: 500, body: { error: 'model crashed' } }));
  const unreachable = await submit(HALF_RIGHT);
  ollama.respond(() => ({ delayMs: 4000, ...review({ feedback: 'มาช้าเกินไป' }) }));
  const started = Date.now();
  const slow = await submit(HALF_RIGHT);
  const slowMs = Date.now() - started;
  ollama.respond(() => ({ content: 'ไม่ใช่ JSON' }));
  const garbled = await submit(HALF_RIGHT);

  await t.test('a very high or very low model verdict changes no number', () => {
    assert.deepEqual(numbers(flattered), numbers(scolded));
    assert.deepEqual(numbers(unreachable), numbers(scolded));
    assert.deepEqual(numbers(slow), numbers(scolded));
    assert.deepEqual(numbers(garbled), numbers(scolded));
    assert.equal(scolded.passed, 1);
    assert.equal(scolded.total, 3);
  });

  await t.test('failing tests earn no reward and are not approved, however the model judged them', () => {
    assert.equal(flattered.rewardCoins, 0);
    assert.equal(flattered.breakdown.aiApproved, false);
  });

  await t.test('the advice comes from the model when it answers, and from the rubric when it does not', () => {
    assert.equal(scolded.feedback, 'ลองใช้ .upper() กับข้อความ');
    assert.equal(scolded.breakdown.aiReviewed, true);
    for (const body of [unreachable, slow, garbled]) {
      assert.match(body.feedback, /correctness/i);
      assert.equal(body.breakdown.aiReviewed, false, 'the page must say the model was unavailable, not that it reviewed the code');
      assert.equal(body.breakdown.aiUnavailable, true);
      assert.equal(body.breakdown.aiVerdict, 'fallback');
    }
  });

  await t.test('a slow model does not hold the score back past the timeout', () => {
    assert.ok(slowMs < 3500, `submit took ${slowMs} ms`);
  });

  await t.test('the advice is asked of the judge model, as JSON', async () => {
    ollama.respond(() => review({ feedback: 'ใช้ .upper()' }));
    await submit(HALF_RIGHT);
    const [sent] = ollama.chatRequests();
    assert.equal(sent.body.model, JUDGE_MODEL);
    assert.deepEqual(sent.body.response_format, { type: 'json_object' });
  });

  await t.test('an answer that passes every test is paid without asking the model', async () => {
    ollama.respond(() => review({ approved: false, feedback: 'ไม่ควรถูกเรียก' }));
    const body = await submit(RIGHT);
    assert.equal(body.passed, 3);
    assert.ok(body.rewardCoins > 0, JSON.stringify(body));
    assert.equal(ollama.chatRequests().length, 0);
  });
});
