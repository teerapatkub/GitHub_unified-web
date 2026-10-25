import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchWhenServerReady } from './startupRetry.js';

const answers = (...statuses) => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    const next = statuses.shift();
    if (next instanceof Error) throw next;
    return { status: next, ok: next < 400 };
  };
  return { fetchImpl, calls };
};
const noSleep = async () => {};

// Bug U7: the login page gave up on the first 503 while the server booted.
test('503s while the server boots are waited out until it answers', async () => {
  const { fetchImpl, calls } = answers(503, 503, 200);
  const waits = [];
  const res = await fetchWhenServerReady('/api/auth/me', undefined, { fetchImpl, sleep: noSleep, onWaiting: n => waits.push(n) });
  assert.equal(res.status, 200);
  assert.equal(calls.length, 3);
  assert.deepEqual(waits, [1, 2]);
});

test('a network error is retried like a 503', async () => {
  const { fetchImpl } = answers(new TypeError('Failed to fetch'), 200);
  assert.equal((await fetchWhenServerReady('/x', undefined, { fetchImpl, sleep: noSleep })).status, 200);
});

test('a real answer such as 401 is returned at once, not retried', async () => {
  const { fetchImpl, calls } = answers(401);
  assert.equal((await fetchWhenServerReady('/x', undefined, { fetchImpl, sleep: noSleep })).status, 401);
  assert.equal(calls.length, 1);
});

test('it gives up after the last delay and hands back what it got', async () => {
  const { fetchImpl, calls } = answers(503, 503, 503);
  const res = await fetchWhenServerReady('/x', undefined, { fetchImpl, sleep: noSleep, delays: [1, 1] });
  assert.equal(res.status, 503);
  assert.equal(calls.length, 3);
});
