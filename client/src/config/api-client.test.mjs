import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requestJson } from './api-client.js';

test('API client uses the configured origin and preserves a successful empty response', async () => {
  let requestedUrl;
  const data = await requestJson('/api/leaderboard?board=xp', {
    base: 'https://api.example.test/',
    fetchImpl: async url => {
      requestedUrl = url;
      return new Response(JSON.stringify({ rows: [] }), { status: 200 });
    }
  });
  assert.equal(requestedUrl, 'https://api.example.test/api/leaderboard?board=xp');
  assert.deepEqual(data.rows, []);
});

for (const [status, kind] of [[401, 'unauthorized'], [500, 'server']]) {
  test(`API client distinguishes HTTP ${status}`, async () => {
    await assert.rejects(requestJson('/api/leaderboard', {
      fetchImpl: async () => new Response('{}', { status })
    }), error => error.status === status && error.kind === kind);
  });
}

test('API client distinguishes network and invalid JSON failures', async () => {
  await assert.rejects(requestJson('/api/leaderboard', {
    fetchImpl: async () => { throw new Error('offline'); }
  }), error => error.kind === 'network');
  await assert.rejects(requestJson('/api/leaderboard', {
    fetchImpl: async () => new Response('<html>error</html>', { status: 200 })
  }), error => error.kind === 'invalid');
});

test('API client keeps structured validation feedback for exercise submissions', async () => {
  await assert.rejects(requestJson('/api/exercises/1/submit', {
    method: 'POST',
    fetchImpl: async () => new Response(JSON.stringify({
      error: 'ยังผ่านไม่ครบทุกเทสเคส',
      detail: 'ผ่าน 1 จาก 2 เทสเคส',
      hint: 'ตรวจบรรทัดสุดท้าย',
      errorLine: 3,
    }), { status: 400 }),
  }), error => error.kind === 'http'
    && error.body?.detail === 'ผ่าน 1 จาก 2 เทสเคส'
    && error.body?.hint === 'ตรวจบรรทัดสุดท้าย'
    && error.body?.errorLine === 3);
});
