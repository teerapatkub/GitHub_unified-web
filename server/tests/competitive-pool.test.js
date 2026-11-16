// Competitive problems written ahead of time (competitivePool.js): a player
// gets one at once without the model being asked, two players never get the
// same one, and an empty topic still falls back to live generation.
const assert = require('node:assert/strict');
const test = require('node:test');
const { Pool } = require('pg');
const { startFakeOllama } = require('./helpers/fake-ollama');
const { createTestDatabase, startServer } = require('./helpers/start-server');
const { createCompetitivePool } = require('../competitivePool');

const READY = {
  title: 'นับสระ',
  description: 'รับข้อความหนึ่งบรรทัด แล้วพิมพ์จำนวนสระภาษาอังกฤษ',
  testCases: [{ input: 'apple', expected: '2' }, { input: 'sky', expected: '0' }],
  verifiedCases: 8,
};

// The server's db wrapper speaks `?` placeholders; this is the same for a pg Pool.
const asWrapper = pool => ({
  execute: async (sql, params = []) => {
    let n = 0;
    const result = await pool.query(sql.replace(/\?/g, () => `$${++n}`), params);
    return [result.rows];
  },
});

test('Generated โจทย์ hands out a ready problem at once', { timeout: 600_000 }, async t => {
  const ollama = await startFakeOllama();
  t.after(() => ollama.close());
  const url = await createTestDatabase(t, 'pyarena_pool');
  const server = await startServer(t, {
    url,
    players: ['second'],
    env: { LLM_BASE_URL: ollama.baseURL, LLM_CHAT_MODEL: 'scb10x/typhoon2.5-qwen3-4b', LLM_TIMEOUT_MS: '1500' },
  });
  const db = new Pool({ connectionString: url, ssl: false });
  db.on('error', () => {});
  t.after(() => db.end());
  await db.query('UPDATE users SET level = 10');

  await t.test('a topic with a ready problem answers without asking the model', async () => {
    await db.query("INSERT INTO competitive_generated_pool (topic, scope, payload) VALUES ('Loop', 'community', $1)", [JSON.stringify(READY)]);
    ollama.reset();
    const res = await server.call('/api/competitive/challenges/generate', { body: { topic: 'Loop', scope: 'community' } });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.source, 'pool');
    assert.equal(res.body.title, READY.title);
    assert.deepEqual(res.body.testCases, READY.testCases);
    assert.equal(ollama.chatRequests().length, 0);
    const { rows } = await db.query("SELECT used_at, used_by FROM competitive_generated_pool WHERE topic = 'Loop'");
    assert.ok(rows[0].used_at, 'the problem is marked as handed out');
    assert.equal(Number(rows[0].used_by), Number(server.userId));
  });

  await t.test('an empty topic falls back to asking the model', async () => {
    ollama.reset();
    ollama.respond(() => ({ status: 500, body: { error: 'model crashed' } }));
    const res = await server.players.second.call('/api/competitive/challenges/generate', { body: { topic: 'String', scope: 'community' } });
    assert.equal(res.status, 502, JSON.stringify(res.body));
    assert.ok(ollama.chatRequests().length > 0, 'the model was asked live');
  });

  await t.test('two players asking at once never get the same problem', async () => {
    await db.query("INSERT INTO competitive_generated_pool (topic, scope, payload) VALUES ('List', 'community', $1)", [JSON.stringify(READY)]);
    const pool = createCompetitivePool({ db: asWrapper(db) });
    const taken = await Promise.all([pool.take('List', 'community', 1), pool.take('List', 'community', 2)]);
    assert.equal(taken.filter(Boolean).length, 1);
  });

  await t.test('refilling writes for the emptiest topic, and only while the model is free', async () => {
    let asked = [];
    const generate = async ({ topic }, options) => {
      asked.push({ topic, priority: options.priority });
      return { ...READY, title: `ใหม่ ${topic}` };
    };
    const busy = createCompetitivePool({ db: asWrapper(db), generate, isModelIdle: () => false, topics: ['Math'], perTopic: 1 });
    assert.equal(await busy.refillOnce(), 'model-busy');
    assert.deepEqual(asked, []);

    // List still has none ready (its one was handed out above); Math gets one
    // first, then List, then both are full.
    await db.query("INSERT INTO competitive_generated_pool (topic, scope, payload) VALUES ('Dictionary', 'community', $1)", [JSON.stringify(READY)]);
    const free = createCompetitivePool({ db: asWrapper(db), generate, isModelIdle: () => true, topics: ['Dictionary', 'Math', 'List'], perTopic: 1 });
    assert.equal(await free.refillOnce(), 'added:Math');
    assert.deepEqual(asked, [{ topic: 'Math', priority: 'idle' }], 'idle work: cancelled when anyone needs the model');
    assert.equal(await free.refillOnce(), 'added:List');
    assert.equal(await free.refillOnce(), 'full', 'Dictionary already had one');
  });
});
