import { API_BASE } from '../../config/api.js';
import { requestJson } from '../../config/api-client.js';

export async function loadDashboardData({ apiBase = API_BASE, fetchImpl = fetch } = {}) {
  const options = { base: apiBase, fetchImpl };
  const [stats, learning] = await Promise.all([
    requestJson('/api/dashboard/stats', options),
    requestJson('/api/dashboard/learning-progress', options),
  ]);
  if (!stats || typeof stats !== 'object' || Array.isArray(stats)
    || !learning || typeof learning !== 'object' || Array.isArray(learning)) {
    throw new Error('Invalid dashboard response');
  }
  return { stats, learning };
}
