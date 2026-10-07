const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const bcrypt = require('bcryptjs');
const { installAuth } = require('../auth');
const { actorMatches, accountEnabled, normalizeEmail } = require('../auth/policy');

async function fixture(t, { mapped = true, confirmed = true, role = 'user', mailFails = false } = {}) {
  const user = { user_id: 42, username: 'learner', email: 'learner@example.com', role, level: 10, xp: 3400, virtual_currency: 500, password_hash: await bcrypt.hash('OldPass1!', 4) };
  const state = { binding: mapped ? { user_id: 42, auth_user_id: 'auth-42', email: user.email } : null, created: [], cookies: new Map(), mails: 0 };
  const execute = async (sql, args = []) => {
    if (/CREATE|ALTER|REVOKE|pg_roles|pg_advisory/.test(sql)) return [[]];
    if (sql.includes('JOIN player_auth_identities')) return [[state.binding && args[0] === state.binding.auth_user_id ? user : null].filter(Boolean)];
    if (sql.includes('JOIN player_google_sessions')) return [[state.cookies.has(args[0]) ? user : null].filter(Boolean)];
    if (sql.startsWith('INSERT INTO player_google_sessions')) { state.cookies.set(args[0], user.user_id); return [{}]; }
    if (sql.startsWith('DELETE FROM player_google_sessions')) { if (args.length) state.cookies.delete(args[0]); return [{}]; }
    if (sql.startsWith('SELECT * FROM player_auth_identities')) return [[state.binding].filter(Boolean)];
    if (sql.startsWith('SELECT * FROM users WHERE username')) return [[args[0] === user.username || args[1] === user.email ? user : null].filter(Boolean)];
    if (sql.includes('AND user_id !=')) return [[]];
    if (sql.includes('FOR UPDATE')) return [[{ user_id: user.user_id }]];
    if (sql.startsWith('INSERT INTO player_auth_identities')) { state.binding = { user_id: args[0], auth_user_id: args[1], email: args[2] }; return [{}]; }
    if (sql.startsWith('UPDATE users SET email')) { user.email = args[0]; return [{}]; }
    if (sql.startsWith('SELECT user_id FROM player_auth_identities')) return [[state.binding].filter(Boolean)];
    throw new Error('Unmocked SQL: ' + sql);
  };
  const db = { execute, getConnection: async () => ({ execute, beginTransaction: async () => {}, commit: async () => {}, rollback: async () => {}, release() {} }) };
  const admin = { auth: {
    getUser: async token => token === 'valid' ? { data: { user: { id: 'auth-42', email_confirmed_at: confirmed ? '2026-01-01' : null } } } : { data: {}, error: new Error('invalid') },
    admin: { createUser: async input => { state.created.push(input); return { data: { user: { id: 'auth-42' } } }; } },
  } };
  const publicClient = { auth: {
    resend: async () => { state.mails++; return { error: mailFails ? new Error('smtp password must not leak') : null }; },
    resetPasswordForEmail: async () => ({ error: null }),
    signInWithPassword: async input => input.password === 'NewPass1!' ? { data: { session: { access_token: 'valid', refresh_token: 'refresh' } } } : { error: { code: 'invalid_credentials' } },
  } };
  const app = express(); app.use(express.json());
  const auth = installAuth(app, db, admin, { AUTH_ALLOWED_ORIGINS: 'http://localhost:5174' }, { createPublicClient: () => publicClient });
  app.post('/api/shop/buy', (req, res) => res.json({ user_id: req.player.user_id }));
  app.post('/api/profile/:id/avatar', (req, res) => res.json({ ok: true }));
  app.get('/api/admin/users', (req, res) => res.json([]));
  await auth.ready;
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (url, body, headers = {}) => {
    const response = await fetch(base + url, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', 'X-PyArena-Request': '1', ...headers }, body: body ? JSON.stringify(body) : undefined });
    return { status: response.status, body: await response.json() };
  };
  return { user, state, call, auth };
}

test('profile cache and arbitrary player ID cannot authenticate requests', async t => {
  const { call } = await fixture(t);
  assert.equal((await call('/api/auth/me')).status, 401);
  assert.equal((await call('/api/shop/buy', { userId: 42, role: 'admin' })).status, 401);
  assert.equal((await call('/api/auth/me', null, { Authorization: 'Bearer forged' })).status, 401);
});
test('verified email identity keeps player ID, role and progression; unconfirmed identity is rejected', async t => {
  const { call } = await fixture(t);
  const response = await call('/api/auth/me', null, { Authorization: 'Bearer valid' });
  assert.equal(response.status, 200); assert.equal(response.body.user_id, 42); assert.equal(response.body.xp, 3400);
  assert.equal(response.body.password_hash, undefined);
  const other = await fixture(t, { confirmed: false });
  assert.equal((await other.call('/api/auth/me', null, { Authorization: 'Bearer valid' })).status, 401);
});
test('identity cannot buy as another user, edit another avatar or read admin roster', async t => {
  const { call } = await fixture(t); const headers = { Authorization: 'Bearer valid' };
  assert.equal((await call('/api/shop/buy', { userId: 99 }, headers)).status, 403);
  assert.equal((await call('/api/profile/99/avatar', {}, headers)).status, 403);
  assert.equal((await call('/api/admin/users', null, headers)).status, 403);
  assert.equal((await call('/api/shop/buy', { userId: 42 }, headers)).status, 200);
});
test('legacy credentials migrate once, preserving bcrypt hash and player data until email confirmation', async t => {
  const { call, state, user } = await fixture(t, { mapped: false });
  assert.equal((await call('/api/auth/sign-in', { identifier: 'learner', password: 'wrong' })).status, 401);
  assert.equal(state.created.length, 0);
  const response = await call('/api/auth/sign-in', { identifier: 'learner', password: 'OldPass1!' });
  assert.equal(response.body.confirmationRequired, true);
  assert.equal(state.created.length, 1); assert.equal(state.created[0].email_confirm, false);
  assert.equal(state.created[0].password_hash, user.password_hash);
  assert.equal(state.binding.user_id, 42); assert.equal(user.xp, 3400); assert.equal(user.virtual_currency, 500);
});
test('mapped accounts never fall back to old bcrypt password after a reset', async t => {
  const { call, state } = await fixture(t);
  assert.equal((await call('/api/auth/sign-in', { identifier: 'learner', password: 'OldPass1!' })).status, 401);
  assert.equal((await call('/api/auth/sign-in', { identifier: 'learner@example.com', password: 'NewPass1!' })).body.session.access_token, 'valid');
  assert.equal(state.created.length, 0);
});
test('mail failure preserves migration and returns no secret or debug reset link', async t => {
  const { call, state } = await fixture(t, { mapped: false, mailFails: true });
  const result = await call('/api/auth/sign-in', { identifier: 'learner', password: 'OldPass1!' });
  assert.equal(result.status, 503); assert.equal(result.body.code, 'EMAIL_DELIVERY');
  assert.equal(state.binding.user_id, 42);
  assert(!JSON.stringify(result).includes('smtp password'));
});
test('old login, registration and recovery routes cannot bypass new auth', async t => {
  const { call } = await fixture(t);
  for (const path of ['/login', '/register', '/api/login', '/api/register', '/api/password/reset', '/api/password/forgot']) assert.equal((await call(path, {})).status, 410);
});
test('Google session cookie is httpOnly and logout revokes it', async t => {
  const { auth, call } = await fixture(t);
  let cookie;
  await auth.issueGoogleSession({ cookie: (name, value, opts) => { assert(opts.httpOnly); assert.equal(opts.sameSite, 'lax'); cookie = `${name}=${value}`; } }, 42);
  assert.equal((await call('/api/auth/me', null, { Cookie: cookie })).status, 200);
  assert.equal((await call('/api/auth/sign-out', {}, { Cookie: cookie })).status, 200);
  assert.equal((await call('/api/auth/me', null, { Cookie: cookie })).status, 401);
});
test('cross-origin credential requests are rejected', async t => {
  const { call } = await fixture(t);
  assert.equal((await call('/api/auth/sign-in', {}, { Origin: 'https://attacker.example' })).status, 403);
});
test('actor policy distinguishes actor from target and rejects spoofing', () => {
  const user = { user_id: 42, username: 'learner' };
  assert(actorMatches(user, { user_id: 42, attacker_name: 'learner', target_name: 'other' }));
  assert(!actorMatches(user, { current_host: 'other' }));
  assert(!accountEnabled({ is_deleted: 1 }));
  assert.equal(normalizeEmail(' User@Example.COM '), 'user@example.com');
});
