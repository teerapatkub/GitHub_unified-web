const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { validatePair, generatePair, signDraft, verifyDraft } = require('../lessonQuizAi');
const { createLessonAdminRouter } = require('../lessonAdminRoutes');

const pair = () => Object.fromEntries(['pre', 'post'].map(kind => [kind, Array.from({ length: 5 }, (_, i) => ({ type: i < 3 ? 'choice' : 'fill', question: `${kind} print(${i}) จะแสดงอะไร`, ...(i < 3 ? { options: ['0', '1', '2', '3'], correct: i } : { answer: String(i) }) }))]));

test('requires exactly five distinct questions per quiz and four valid choices', () => {
  assert.equal(validatePair(pair()).post.length, 5);
  for (const mutate of [p => p.pre.pop(), p => { p.post[0] = p.pre[0]; }, p => { p.pre[0].correct = 4; }, p => { p.pre[0].options[1] = '0'; }, p => { p.pre[0].question = ''; }, p => { p.pre[3].answer = ''; }, p => { p.pre[3].type = 'choice'; }]) {
    const p = pair(); mutate(p);
    assert.throws(() => validatePair(p), { status: 422 });
  }
});

test('draft cannot be changed, reused for another lesson or used after expiry', () => {
  const token = signDraft({ lessonId: 3, pair: pair() });
  assert.equal(verifyDraft(token, 3).pair.pre.length, 5);
  assert.throws(() => verifyDraft(`${token}x`, 3), { status: 400 });
  assert.throws(() => verifyDraft(token, 4), { status: 400 });
  const now = Date.now;
  Date.now = () => now() + 3600001;
  try { assert.throws(() => verifyDraft(token, 3), { status: 400 }); } finally { Date.now = now; }
});

test('the local model receives the lesson content and the quiz shape; bad answers are refused', async () => {
  const result = await generatePair('lesson Python print', { model: 'local-model', ask: async (request) => {
    assert.equal(request.data, 'lesson Python print');
    const variants = request.schema.properties.pre.items.anyOf;
    assert.ok(variants.find(v => v.properties.type.enum[0] === 'choice').required.includes('correct'));
    assert.ok(variants.find(v => v.properties.type.enum[0] === 'choice').required.includes('options'));
    assert.ok(variants.find(v => v.properties.type.enum[0] === 'fill').required.includes('answer'));
    return pair();
  } });
  assert.equal(result.pair.pre.length, 5);
  assert.equal(result.model, 'local-model');
  await assert.rejects(generatePair('lesson', { ask: async () => ({ pre: [] }) }), { status: 422 });
  await assert.rejects(generatePair('lesson', { ask: async () => { throw Object.assign(new Error('busy'), { status: 429 }); } }), { status: 429 });
});

async function fixture(t, options = {}) {
  const state = { writes: [], committed: [], rollback: 0, existing: false, description: 'สอน print และค่าตัวเลข', ...options };
  const query = async (sql, args) => {
    if (sql.includes('SELECT lesson_id, title')) return [[{ lesson_id: 3, title: 'Python print', description: state.description }]];
    if (sql.includes('FROM lesson_slides')) return [[]];
    if (sql.includes('JOIN lesson_quizzes')) return [state.existing ? [{ question_id: 1 }] : []];
    if (sql.includes('FOR UPDATE')) return [[{ lesson_id: 3 }]];
    if (sql.startsWith('SELECT quiz_id')) return [[]];
    if (sql.startsWith('INSERT')) {
      state.writes.push({ sql, args });
      if (state.failWrite && state.writes.length === 15) throw new Error('database failed');
      return [{ rows: [{ quiz_id: state.writes.length, question_id: state.writes.length }] }];
    }
    throw new Error(`Unexpected SQL ${sql}`);
  };
  const db = { query, getConnection: async () => ({ query, beginTransaction: async () => {},
    commit: async () => { state.committed = [...state.writes]; state.existing = true; },
    rollback: async () => { state.rollback++; state.writes = []; }, release() {} }) };
  const app = express(); app.use(express.json({ limit: '1mb' }));
  app.use((req, _res, next) => { if (req.headers['x-role']) req.player = { role: req.headers['x-role'] }; next(); });
  app.use('/api/admin/lessons', createLessonAdminRouter(db, { generate: async source => {
    assert.ok(source.includes(state.description)); return { pair: pair(), model: 'fake' };
  } }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const post = (action, body = {}, role = 'admin') => fetch(`http://127.0.0.1:${server.address().port}/api/admin/lessons/3/quizzes/${action}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(role ? { 'x-role': role } : {}) }, body: JSON.stringify(body),
  });
  return { state, post };
}

test('only admin generates; preview writes nothing; publish saves 10 questions and 24 choices once', async t => {
  const { post, state } = await fixture(t);
  assert.equal((await post('generate', {}, '')).status, 401);
  assert.equal((await post('generate', {}, 'user')).status, 403);
  const draft = await (await post('generate')).json();
  assert.equal(state.writes.length, 0);
  assert.equal((await post('generate')).status, 429);
  assert.equal((await post('publish', { token: draft.token })).status, 201);
  assert.equal(state.committed.filter(w => w.sql.includes('INSERT INTO quiz_questions')).length, 10);
  assert.equal(state.committed.filter(w => w.sql.includes('INSERT INTO question_choices')).length, 24);
  const written = state.committed.filter(w => w.sql.includes('INSERT INTO quiz_questions'));
  assert.equal(written.filter(w => w.args[3] === 'fill').length, 4);
  assert.ok(written.filter(w => w.args[3] === 'fill').every(w => ['3', '4'].includes(w.args[4])));
  assert.equal((await post('publish', { token: draft.token })).status, 409);
});

test('rejects missing text and existing quizzes before AI generation', async t => {
  const empty = await fixture(t, { description: '' });
  assert.equal((await empty.post('generate')).status, 422);
  const existing = await fixture(t, { existing: true });
  assert.equal((await existing.post('generate')).status, 409);
});

test('changed lesson content invalidates a preview without database writes', async t => {
  const { post, state } = await fixture(t);
  const draft = await (await post('generate')).json();
  state.description = 'บทเรียนใหม่';
  assert.equal((await post('publish', { token: draft.token })).status, 409);
  assert.equal(state.committed.length, 0);
});

test('a failed write rolls back both quizzes', async t => {
  const { post, state } = await fixture(t, { failWrite: true });
  const draft = await (await post('generate')).json();
  assert.equal((await post('publish', { token: draft.token })).status, 500);
  assert.equal(state.rollback, 1);
  assert.equal(state.committed.length, 0);
});
