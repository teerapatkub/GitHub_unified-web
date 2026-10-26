// The predict round (Spec 0005 #22, ADR 0010): read a short piece of code and
// one call, tap what it prints.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { arcadeFixture } = require('./helpers/arcade-fixture');
const { createArcadePhaseFinalizer } = require('../arcade/phase-finalizer');
const { computeRoundData } = require('../arcade/round-kinds');
const config = require('../../shared/arcadeConfig.json');

const SUM_TO_N = {
  test_kind: 'function',
  test_cases: [{ args: [3], expected: 6 }, { args: [1], expected: 1 }, { args: [0], expected: 0 }, { args: [4], expected: 10 }],
  starter_code: 'def sum_to_n(n):\n    total = 0\n    for i in range(1, n + 1):\n        # TODO: add i\n        pass\n    return total',
  solution_code: 'def sum_to_n(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total',
};
const PREDICT = {
  code: SUM_TO_N.solution_code, call: 'print(sum_to_n(3))', answer: '6',
  options: [{ id: 'a', text: '3' }, { id: 'b', text: '6' }, { id: 'c', text: '0' }],
};

// Round 1 is a predict round on task 1; the room is mid-match.
async function predictMatch(t) {
  const f = await arcadeFixture(t);
  const { db, call } = f;
  for (const id of [1, 2, 3, 4]) {
    await db.query('INSERT INTO arcade_tasks (task_id, work_chars, difficulty, test_cases) VALUES (?, 10, ?, ?)',
      [id, id === 4 ? 'medium' : 'easy', JSON.stringify(SUM_TO_N.test_cases)]);
    await db.query('INSERT INTO problems (problem_id, test_kind, test_cases, solution_code, starter_code) VALUES (?, ?, ?, ?, ?)',
      [id, SUM_TO_N.test_kind, JSON.stringify(SUM_TO_N.test_cases), SUM_TO_N.solution_code, SUM_TO_N.starter_code]);
    await db.query(`INSERT INTO problem_modes (mode, entry_id, problem_id, difficulty, round_kinds, round_data)
      VALUES ('arcade', ?, ?, ?, '["write","predict"]', ?)`, [id, id, id === 4 ? 'medium' : 'easy', JSON.stringify({ predict: PREDICT })]);
  }
  await db.query("UPDATE arcade_rooms SET difficulty = 'easy'");
  const matchId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  const send = (body, user = 'alice') => call('/api/arcade/rooms/1/submit-round', { user, body: { match_id: matchId, round_num: 1, ...body } });
  const settle = async () => {
    await db.query("UPDATE arcade_rooms SET phase_deadline = CURRENT_TIMESTAMP - INTERVAL '1 second'");
    await createArcadePhaseFinalizer({ db, judgeArcadeCode: async () => { throw new Error('a choice round never asks the judge'); } })(
      (await call('/api/arcade/rooms/1')).body.room);
  };
  return { ...f, matchId, send, settle };
}

test('a mixed room opens on a short predict round', async t => {
  const { db, call } = await predictMatch(t);
  const { room } = (await call('/api/arcade/rooms/1')).body;
  assert.equal(room.round_kinds[0], 'predict');
  const [[{ seconds }]] = await db.query('SELECT EXTRACT(EPOCH FROM (phase_deadline - clock_timestamp())) AS seconds FROM arcade_rooms');
  assert.ok(seconds <= config.predictRoundSeconds.standard && seconds > config.predictRoundSeconds.standard - 5, `round lasts ${seconds}s`);
});

test('the round view shows the code and the options but never which one is right', async t => {
  const { call } = await predictMatch(t);
  const view = (await call('/api/arcade/rooms/1/round')).body;
  assert.equal(view.kind, 'predict');
  assert.deepEqual(view.predict, { code: PREDICT.code, call: PREDICT.call, options: PREDICT.options });
  assert.ok(!JSON.stringify(view).includes('"answer"'));
});

test('a right pick scores tests, quality and time; a wrong pick scores nothing', async t => {
  const { send, settle, call } = await predictMatch(t);
  assert.equal((await send({ choice: 'b' })).status, 200);
  assert.equal((await send({ choice: 'a' }, 'bob')).status, 200);
  await settle();
  const right = (await call('/api/arcade/rooms/1/round-history')).body.history[0];
  assert.deepEqual([right.round_kind, right.code, right.pass_count, right.total_count, right.quality_score], ['predict', '6', 1, 1, 100]);
  // 100 test + 100 quality; settle() moves the deadline back to now, so the
  // answer counts as sent at the end of the round and earns no time points.
  assert.equal(right.round_score, 200);
  const wrong = (await call('/api/arcade/rooms/1/round-history', { user: 'bob' })).body.history[0];
  assert.deepEqual([wrong.code, wrong.pass_count, wrong.quality_score, wrong.round_score], ['3', 0, 0, 0]);
});

test('a predict round refuses code, unknown options and drafts', async t => {
  const { send, call, matchId } = await predictMatch(t);
  assert.equal((await send({ code: 'print(6)' })).status, 400);
  assert.equal((await send({ choice: 'z' })).status, 400);
  assert.equal((await send({ choice: { id: 'b' } })).status, 400);
  const draft = await call('/api/arcade/rooms/1/code-draft', { body: { match_id: matchId, round_num: 1, code: 'x' } });
  assert.equal(draft.status, 409);
});

test('an attack on typing is refused in a predict round and stays in the inventory', async t => {
  const { db, call, matchId } = await predictMatch(t);
  await db.query("UPDATE arcade_rooms SET round_kinds = '[\"write\",\"predict\",\"write\",\"write\"]', phase = 'SHOP_1', phase_deadline = clock_timestamp() + INTERVAL '5 minutes'");
  await db.query('UPDATE arcade_participants SET cash = 5000');
  const command = body => call('/api/arcade/rooms/1/shop', { body: { match_id: matchId, request_id: randomUUID(), ...body } });
  await call(`/api/arcade/rooms/1/shop?match_id=${matchId}`);
  const meta = config.shopItems.find(item => item.id === 'backspaceLock');
  const offer = { ...meta, offer_id: randomUUID(), purchased: false };
  await db.query("UPDATE arcade_shop_states SET offers = ? WHERE match_id = ? AND user_name = 'alice'", [JSON.stringify([offer]), matchId]);
  const bought = await command({ phase: 'SHOP_1', action: 'buy', offer_id: offer.offer_id });
  const item = bought.body.inventory.find(entry => entry.id === 'backspaceLock');
  await db.query("UPDATE arcade_rooms SET phase = 'ROUND_2'");
  const used = await command({ phase: 'ROUND_2', action: 'consume', instance_id: item.instance_id, target_name: 'bob' });
  assert.equal(used.status, 409);
  assert.match(used.body.error, /พิมพ์โค้ด/);
  const state = (await call(`/api/arcade/rooms/1/shop?match_id=${matchId}`)).body;
  assert.ok(state.inventory.some(entry => entry.instance_id === item.instance_id));
});

test('predict data is what Python really prints, with distinct wrong options from real wrong answers', async () => {
  const { kinds, data } = await computeRoundData(SUM_TO_N);
  assert.ok(kinds.includes('predict'));
  const texts = data.predict.options.map(option => option.text);
  assert.ok(texts.includes(data.predict.answer));
  assert.equal(new Set(texts).size, texts.length);
  assert.ok(texts.length >= 3);
  // sum_to_n(3) is 6, sum_to_n(1) is 1, ...: the answer is the real sum for the call shown.
  const n = Number(/sum_to_n\((\d+)\)/.exec(data.predict.call)[1]);
  assert.equal(data.predict.answer, String((n * (n + 1)) / 2));
  // Never a worked example (shown under the problem with its result): those are n = 3 and n = 1.
  assert.ok(![3, 1].includes(n), `predict used worked example sum_to_n(${n})`);
});
