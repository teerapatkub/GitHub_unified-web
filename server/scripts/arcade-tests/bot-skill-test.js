// Checks that choosing an easier room actually gives you easier OPPONENTS.
//
// Bot round scores used to come from one fixed band no matter what the room was
// set to, so picking `easy` got you easier problems against exactly the same
// opposition - the room setting did not make the match more survivable, which is
// the only reason a beginner would pick it. synthesizeBotRoundScore() now reads
// botSkillByDifficulty from shared/arcadeConfig.json.
//
// Method: run Round 1 of several quick-mode matches per difficulty and compare
// the scores the SERVER wrote for the bots. Round 1 eliminates nobody, so every
// bot's first-round score survives to be read back.
//
// Requires the server AND the database. Takes about a minute (it waits for real
// 30-second rounds to finish). Creates and removes its own rooms.
const BASE = process.env.ARCADE_TEST_BASE || 'http://localhost:3001';
const ROOMS_PER_DIFFICULTY = 6;
const BOTS_PER_ROOM = 3;

const j = async (method, p, body) => {
  const r = await fetch(`${BASE}${p}`, {
    method, headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let data = null;
  try { data = await r.json(); } catch { /* empty body is fine */ }
  return { status: r.status, data };
};
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const stats = (xs) => ({
  n: xs.length,
  mean: xs.reduce((a, b) => a + b, 0) / xs.length,
  min: Math.min(...xs),
  max: Math.max(...xs),
});

const made = [];

(async () => {
  const probe = await j('GET', '/api/arcade/tasks');
  if (probe.status !== 200) {
    console.error(`could not reach ${BASE} — is the server running?`);
    process.exit(2);
  }

  const mkRoom = async (user, difficulty) => {
    const created = await j('POST', '/api/arcade/rooms/create', {
      room_name: 'Bot Skill', host_name: user, max_players: 5, password: '',
      round_duration_mode: 'quick', difficulty,
    });
    const id = created.data?.room?.room_id ?? created.data?.room_id;
    for (let i = 0; i < BOTS_PER_ROOM; i++) {
      await j('POST', `/api/arcade/rooms/${id}/add-bot`, { host_name: user });
    }
    await j('POST', `/api/arcade/rooms/${id}/start`, { host_name: user });
    made.push({ id, user });
    return { id, user };
  };

  const ids = {};
  for (const d of ['easy', 'hard']) {
    ids[d] = [];
    for (let i = 0; i < ROOMS_PER_DIFFICULTY; i++) {
      ids[d].push(await mkRoom(`botskill_${d}_${i}`, d));
    }
  }

  // Poll until every room has left ROUND_1. Polling also acts as the host's
  // heartbeat, which is what stops the stale sweep from removing these rooms
  // out from under the test.
  for (let waited = 0; waited < 90; waited += 3) {
    await sleep(3000);
    const phases = [];
    for (const d of ['easy', 'hard']) {
      for (const r of ids[d]) {
        const room = (await j('GET', `/api/arcade/rooms/${r.id}?user_name=${r.user}`)).data?.room;
        phases.push(room?.phase);
      }
    }
    if (phases.every(p => p && p !== 'ROUND_1')) break;
  }

  const scores = {};
  for (const d of ['easy', 'hard']) {
    scores[d] = [];
    for (const r of ids[d]) {
      const res = (await j('GET', `/api/arcade/rooms/${r.id}?user_name=${r.user}`)).data;
      for (const p of res?.participants || []) {
        if (p.user_name.startsWith('Bot_') && Number(p.score) > 0) scores[d].push(Number(p.score));
      }
    }
  }

  for (const r of made) await j('POST', `/api/arcade/rooms/${r.id}/leave`, { user_name: r.user });

  if (!scores.easy.length || !scores.hard.length) {
    console.error('no bot scores were recorded — the rounds may not have finalized');
    process.exit(2);
  }

  const e = stats(scores.easy);
  const h = stats(scores.hard);
  console.log(`easy room bots: n=${e.n} mean=${e.mean.toFixed(1)} range ${e.min}-${e.max}`);
  console.log(`hard room bots: n=${h.n} mean=${h.mean.toFixed(1)} range ${h.min}-${h.max}`);
  const pass = e.mean < h.mean;
  console.log(`\n${pass ? 'PASS' : 'FAIL'}  bots score lower in an easy room than in a hard one`
    + `  (difference ${(h.mean - e.mean).toFixed(1)} points)`);
  process.exit(pass ? 0 : 1);
})();
