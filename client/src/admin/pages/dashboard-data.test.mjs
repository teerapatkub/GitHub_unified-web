import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadDashboardData } from './dashboard-data.js';

test('dashboard loads both responses from a separate API origin', async () => {
  const urls = [];
  const result = await loadDashboardData({
    apiBase: 'https://api.example.test',
    fetchImpl: async url => {
      urls.push(url);
      return new Response(JSON.stringify(url.endsWith('/stats')
        ? { totalUsers: 3 } : { lesson_summaries: [] }), { status: 200 });
    },
  });
  assert.deepEqual(urls, [
    'https://api.example.test/api/dashboard/stats',
    'https://api.example.test/api/dashboard/learning-progress',
  ]);
  assert.equal(result.stats.totalUsers, 3);
});

for (const status of [401, 500]) {
  test(`dashboard does not turn HTTP ${status} into zero metrics`, async () => {
    await assert.rejects(loadDashboardData({
      fetchImpl: async url => new Response('{}', { status: url.endsWith('/stats') ? status : 200 }),
    }), error => error.status === status);
  });
}
