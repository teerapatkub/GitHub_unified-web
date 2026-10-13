import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLeaderboard } from './leaderboard-data.js';

test('leaderboard uses the configured API origin and returns rows', async () => {
  let requestedUrl;
  const result = await loadLeaderboard('xp', {
    apiBase: 'https://api.example.test',
    fetchImpl: async url => {
      requestedUrl = url;
      return new Response(JSON.stringify({ rows: [{ username: 'alice' }], minMatches: 3 }), { status: 200 });
    },
  });
  assert.equal(requestedUrl, 'https://api.example.test/api/leaderboard?board=xp&limit=20');
  assert.deepEqual(result.rows, [{ username: 'alice' }]);
});

test('leaderboard accepts a successful empty board', async () => {
  const result = await loadLeaderboard('xp', {
    fetchImpl: async () => new Response(JSON.stringify({ rows: [] }), { status: 200 }),
  });
  assert.deepEqual(result.rows, []);
});

for (const [status, message] of [[401, /เข้าสู่ระบบ/], [500, /โหลดตารางอันดับไม่สำเร็จ/]]) {
  test(`leaderboard reports HTTP ${status} as an error`, async () => {
    await assert.rejects(loadLeaderboard('xp', {
      fetchImpl: async () => new Response(JSON.stringify({ rows: [] }), { status }),
    }), message);
  });
}

test('leaderboard reports network errors and malformed success responses', async () => {
  await assert.rejects(loadLeaderboard('xp', {
    fetchImpl: async () => { throw new Error('offline'); },
  }), /เครือข่าย/);
  await assert.rejects(loadLeaderboard('xp', {
    fetchImpl: async () => new Response('{}', { status: 200 }),
  }), /ไม่ถูกต้อง/);
});
