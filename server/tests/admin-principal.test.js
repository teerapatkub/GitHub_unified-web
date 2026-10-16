const assert = require('node:assert/strict');
const test = require('node:test');
const express = require('express');

const { installAuth } = require('../auth');
const { createThemeRouter } = require('../themeRoutes');

const users = {
  admin: { user_id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', level: 10 },
  learner: { user_id: 2, username: 'learner', email: 'learner@example.com', role: 'user', level: 10 },
};

async function fixture(t) {
  const execute = async (sql, args = []) => {
    if (/CREATE|ALTER|REVOKE|pg_roles/.test(sql)) return [[]];
    if (sql.includes('JOIN player_auth_identities')) {
      const name = args[0] === 'auth-admin' ? 'admin' : args[0] === 'auth-learner' ? 'learner' : '';
      return [[users[name]].filter(Boolean)];
    }
    if (sql.startsWith('SELECT * FROM shop_items')) return [[{ item_id: 7, name: 'Admin item' }]];
    throw new Error(`Unmocked SQL: ${sql}`);
  };
  const db = { execute };
  const admin = { auth: { getUser: async token => ({
    data: { user: ['admin-access', 'admin-google'].includes(token)
      ? { id: 'auth-admin', email_confirmed_at: '2026-01-01', app_metadata: { provider: token === 'admin-google' ? 'google' : 'email' } }
      : { id: 'auth-learner', email_confirmed_at: '2026-01-01' } },
    error: null,
  }) } };
  const app = express();
  app.use(express.json());
  const auth = installAuth(app, db, admin, { AUTH_ALLOWED_ORIGINS: 'http://localhost:5174' });
  app.use('/api/themes', createThemeRouter(db));
  await auth.ready;
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const getThemes = token => fetch(`${origin}/api/themes`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return { getThemes };
}

test('Supabase admin principal can use admin commands without a legacy admin token', async t => {
  const { getThemes } = await fixture(t);
  assert.equal((await getThemes('admin-access')).status, 200);
  assert.equal((await getThemes('learner-access')).status, 403);
});

test('Google admin principal uses the same server-verified database role', async t => {
  const { getThemes } = await fixture(t);
  assert.equal((await getThemes('admin-google')).status, 200);
});
