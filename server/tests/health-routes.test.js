const assert = require('node:assert/strict');
const test = require('node:test');

// Load the real application wiring, not a hand-built copy of it. The probes
// broke because the player-auth middleware was installed before them in
// server.js, and a test that rebuilds the app in its own order cannot see that.
// The database URL points at a closed port: liveness must not need it, and
// readiness must answer 503 rather than wait for a login.
process.env.DATABASE_URL = 'postgres://health:health@127.0.0.1:1/health';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SECRET_KEY = 'sb_secret_health_test_only';

const { app } = require('../server');

test('health probes answer without a session on the real application', async (t) => {
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const probe = async (path) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`);
    return { status: response.status, body: await response.json() };
  };

  assert.deepEqual(await probe('/api/health/live'), { status: 200, body: { status: 'alive' } });
  const notReady = { status: 503, body: { status: 'not-ready', error: 'Dependencies are not ready' } };
  assert.deepEqual(await probe('/api/health/ready'), notReady);
  assert.deepEqual(await probe('/api/health'), notReady);

  // Everything else stays behind the startup gate and then the login check.
  assert.equal((await probe('/api/auth/me')).status, 503);
});
