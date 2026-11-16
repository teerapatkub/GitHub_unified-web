// The model's queue (ai/llm.js): a learner watching Lumi never waits behind
// idle work, and a reasoning block cut across streamed pieces is never shown.
const assert = require('node:assert/strict');
const test = require('node:test');
const { createScheduler, createThinkingFilter } = require('../ai/llm');

const tick = () => new Promise(resolve => setImmediate(resolve));

test('an interactive job goes ahead of a normal one already waiting', async () => {
  const queue = createScheduler();
  const order = [];
  const first = await queue.acquire('normal');
  const normal = queue.acquire('normal').then(lease => { order.push('normal'); lease.release(); });
  const interactive = queue.acquire('interactive').then(lease => { order.push('interactive'); lease.release(); });
  await tick();
  assert.deepEqual(order, [], 'nothing starts while the first job holds the model');
  first.release();
  await Promise.all([normal, interactive]);
  assert.deepEqual(order, ['interactive', 'normal']);
});

test('idle work is cancelled the moment somebody needs the model', async () => {
  const queue = createScheduler();
  const idle = await queue.acquire('idle');
  assert.equal(idle.signal.aborted, false);
  const waiting = queue.acquire('interactive');
  assert.equal(idle.signal.aborted, true);
  assert.equal(idle.signal.reason.code, 'LLM_PREEMPTED');
  idle.release();
  (await waiting).release();
  assert.equal(queue.isIdle(), true);
});

test('normal work is never cancelled for an interactive job', async () => {
  const queue = createScheduler();
  const normal = await queue.acquire('normal');
  const waiting = queue.acquire('interactive');
  assert.equal(normal.signal.aborted, false);
  normal.release();
  (await waiting).release();
});

test('a caller who gives up while waiting leaves the queue', async () => {
  const queue = createScheduler();
  const held = await queue.acquire('normal');
  const controller = new AbortController();
  const waiting = queue.acquire('interactive', { signal: controller.signal });
  controller.abort();
  await assert.rejects(waiting);
  assert.equal(queue.size(), 1);
  held.release();
  assert.equal(queue.isIdle(), true);
});

test('reasoning split across streamed pieces is dropped', () => {
  const filter = createThinkingFilter();
  const pieces = ['  <thi', 'nk>ผู้ใช้ถาม', 'เรื่องลูป</th', 'ink>\nลูป', 'คือการ', 'ทำซ้ำ <', 'b>'];
  const shown = pieces.map(p => filter.push(p)).join('') + filter.end();
  assert.equal(shown, 'ลูปคือการทำซ้ำ <b>');
});

test('an answer with no reasoning passes through unchanged', () => {
  const filter = createThinkingFilter();
  const shown = ['print', '("hi")', ' ใช้ < กับ >'].map(p => filter.push(p)).join('') + filter.end();
  assert.equal(shown, 'print("hi") ใช้ < กับ >');
});
