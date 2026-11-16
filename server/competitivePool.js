// Competitive problems written ahead of time, so "Generated โจทย์" answers at
// once instead of after minutes.
//
// One generation on the CPU-only university host (no GPU, 2026-11) asks the
// local model for a full problem, a reference solution and eight inputs, then
// runs the solution on each - and may try three times. That is minutes on a
// live HTTP request. Instead, while nobody is using the model, the server
// writes problems for every topic into this pool; a player's request takes one.
// The live path (competitiveAi.js) is still there when a topic runs dry.
//
// Refilling is 'idle' work in the model's queue (ai/llm.js): the moment a
// learner asks Lumi anything, the refill in progress is cancelled and tried
// again later, so it never makes anyone wait.

const TABLE = 'competitive_generated_pool';

// The table (migration 202611160001). `topic` is one topic today; it is a text
// column so a later "several topics" choice can store them sorted and joined.
async function migrateCompetitivePool(db) {
  await db.execute(`CREATE TABLE IF NOT EXISTS ${TABLE} (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(200) NOT NULL,
    scope VARCHAR(20) NOT NULL DEFAULT 'community',
    payload JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    used_at TIMESTAMP NULL,
    used_by INTEGER NULL
  )`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_competitive_pool_ready
    ON ${TABLE} (topic, scope, created_at) WHERE used_at IS NULL`);
  await db.lockDownPublicSchema?.();
}

function createCompetitivePool({
  db,
  generate,
  isModelIdle = () => true,
  topics = [],
  scope = 'community',
  perTopic = 3,
  intervalMs = 30000,
  log = console,
} = {}) {
  // One ready problem for this topic, marked as used in the same statement so
  // two players asking at once never get the same one.
  async function take(topic, wantedScope, userId = null) {
    // An UPDATE comes back as mysql2's summary object; RETURNING rows ride on it.
    const [result] = await db.execute(
      `UPDATE ${TABLE} SET used_at = NOW(), used_by = ?
        WHERE id = (
          SELECT id FROM ${TABLE}
           WHERE topic = ? AND scope = ? AND used_at IS NULL
           ORDER BY created_at
           LIMIT 1
           FOR UPDATE SKIP LOCKED)
        RETURNING payload`,
      [userId, topic, wantedScope],
    );
    const payload = (Array.isArray(result) ? result : result?.rows)?.[0]?.payload;
    if (!payload) return null;
    return typeof payload === 'string' ? JSON.parse(payload) : payload;
  }

  async function readyCounts() {
    const [rows] = await db.execute(
      `SELECT topic, COUNT(*) AS n FROM ${TABLE}
        WHERE scope = ? AND used_at IS NULL GROUP BY topic`,
      [scope],
    );
    return new Map(rows.map(r => [r.topic, Number(r.n)]));
  }

  let filling = false;
  // Writes one problem for the topic that has the fewest ready, if the model
  // is free. Returns what it did, for tests and logs.
  async function refillOnce() {
    if (filling) return 'busy';
    if (!isModelIdle()) return 'model-busy';
    filling = true;
    try {
      const counts = await readyCounts();
      const short = topics
        .map(topic => ({ topic, n: counts.get(topic) || 0 }))
        .filter(t => t.n < perTopic)
        .sort((a, b) => a.n - b.n)[0];
      if (!short) return 'full';
      const draft = await generate({ topic: short.topic, scope }, { priority: 'idle' });
      await db.execute(
        `INSERT INTO ${TABLE} (topic, scope, payload) VALUES (?, ?, ?)`,
        [short.topic, scope, JSON.stringify(draft)],
      );
      return `added:${short.topic}`;
    } catch (error) {
      if (error?.code !== 'LLM_PREEMPTED') {
        log.warn?.(`⚠️ เติมคลังโจทย์ Competitive ไม่สำเร็จ: ${error?.message || error}`);
      }
      return 'failed';
    } finally {
      filling = false;
    }
  }

  let timer = null;
  function start() {
    if (timer) return;
    timer = setInterval(() => { refillOnce(); }, intervalMs);
    timer.unref?.();
  }
  function stop() {
    clearInterval(timer);
    timer = null;
  }

  return { take, refillOnce, readyCounts, start, stop };
}

module.exports = { createCompetitivePool, migrateCompetitivePool, COMPETITIVE_POOL_TABLE: TABLE };
