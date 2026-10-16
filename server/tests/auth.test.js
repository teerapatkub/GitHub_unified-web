const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const bcrypt = require('bcryptjs');
const { installAuth } = require('../auth');
const { actorMatches, accountEnabled, normalizeEmail } = require('../auth/policy');

async function fixture(t, {
  mapped = true,
  confirmed = true,
  role = 'user',
  mailFails = false,
  failSql = '',
  commitFailsAfterDurableWrite = false,
  deleteFails = false,
  failIdentityOnce = false,
  failProvisioningUpdateOnce = false,
  failCompensatedUpdateOnce = false,
  env,
} = {}) {
  const user = { user_id: 42, username: 'learner', email: 'learner@example.com', role, level: 10, xp: 3400, virtual_currency: 500, password_hash: await bcrypt.hash('OldPass1!', 4) };
  const state = {
    binding: mapped ? { user_id: 42, auth_user_id: 'auth-42', email: user.email } : null,
    signupUser: null,
    created: [],
    deleted: [],
    mails: 0,
    provisioning: new Map(),
    authUsers: new Map(mapped ? [[user.email, { id: 'auth-42', email: user.email }]] : []),
    identityFailures: 0,
    provisioningUpdateFailures: 0,
    compensatedUpdateFailures: 0,
    transactionOpen: false,
    mailWhileTransactionOpen: false,
  };
  const execute = async (sql, args = []) => {
    if (/CREATE|ALTER|REVOKE|pg_roles|pg_advisory/.test(sql)) return [[]];
    if (sql.includes('JOIN player_auth_identities')) return [[state.binding && args[0] === state.binding.auth_user_id ? user : null].filter(Boolean)];
    if (sql.startsWith('SELECT * FROM player_auth_identities')) {
      return [[state.binding && Number(state.binding.user_id) === Number(args[0]) ? state.binding : null].filter(Boolean)];
    }
    if (sql.startsWith('SELECT user_id FROM player_auth_identities WHERE auth_user_id')) {
      if (failSql === 'reconcile') throw new Error('database unavailable during reconcile');
      return [[state.binding?.auth_user_id === args[0] ? { user_id: state.binding.user_id } : null].filter(Boolean)];
    }
    if (sql.startsWith('SELECT * FROM users WHERE username')) {
      const found = [user, state.signupUser].find(row => row && (args[0] === row.username || args[1] === row.email));
      return [[found].filter(Boolean)];
    }
    if (sql.startsWith('SELECT user_id, username, email FROM users WHERE username')) {
      const found = [user, state.signupUser].find(row => row && (args[0] === row.username || args[1] === row.email));
      return [[found].filter(Boolean)];
    }
    if (sql.startsWith('SELECT user_id FROM users WHERE username')) {
      const found = [user, state.signupUser].find(row => row && (args[0] === row.username || args[1] === row.email));
      return [[found && { user_id: found.user_id }].filter(Boolean)];
    }
    if (sql.includes('AND user_id !=')) return [[]];
    if (sql.includes('FOR UPDATE')) return [[{ user_id: user.user_id }]];
    if (sql.startsWith('INSERT INTO users')) {
      if (failSql === 'users') throw new Error('database write failed');
      state.signupUser = { ...user, user_id: 99, username: args[0], email: args[1] };
      return [{ insertId: 99 }];
    }
    if (sql.startsWith('INSERT INTO player_auth_identities')) {
      if (failSql === 'identity' || (failIdentityOnce && state.identityFailures++ === 0)) {
        throw new Error('database write failed');
      }
      state.binding = { user_id: args[0], auth_user_id: args[1], email: args[2] }; return [{}];
    }
    if (sql.startsWith('UPDATE users SET email')) { user.email = args[0]; return [{}]; }
    if (sql.startsWith('SELECT user_id FROM player_auth_identities')) return [[state.binding].filter(Boolean)];
    if (sql.startsWith('INSERT INTO auth_provisioning_operations')) {
      if (!state.provisioning.has(args[0])) {
        state.provisioning.set(args[0], {
          operation_key: args[0], kind: args[1], subject_hash: args[2],
          auth_user_id: null, status: 'started', last_error: null,
        });
      }
      return [{}];
    }
    if (sql.startsWith('SELECT * FROM auth_provisioning_operations')) {
      return [[state.provisioning.get(args[0])].filter(Boolean)];
    }
    if (sql.startsWith('SELECT operation_key FROM auth_provisioning_operations')) {
      const operation = state.provisioning.get(args[0]);
      return [[operation && { operation_key: operation.operation_key }].filter(Boolean)];
    }
    if (sql.startsWith('UPDATE auth_provisioning_operations')) {
      if (failProvisioningUpdateOnce && args[0] === 'auth_created'
        && state.provisioningUpdateFailures++ === 0) {
        throw new Error('connection lost while recording auth user');
      }
      if (failCompensatedUpdateOnce && args[0] === 'compensated'
        && state.compensatedUpdateFailures++ === 0) {
        throw new Error('connection lost after deleting auth user');
      }
      const operation = state.provisioning.get(args[3]);
      if (operation) {
        operation.status = args[0];
        operation.auth_user_id = args[1] || operation.auth_user_id;
        operation.last_error = args[2];
      }
      return [{}];
    }
    throw new Error('Unmocked SQL: ' + sql);
  };
  const db = { execute, getConnection: async () => ({
    execute,
    beginTransaction: async () => { state.transactionOpen = true; },
    commit: async () => {
      if (commitFailsAfterDurableWrite) throw new Error('connection lost after commit');
      state.transactionOpen = false;
    },
    rollback: async () => { state.transactionOpen = false; },
    release() {},
  }) };
  const admin = { auth: {
    getUser: async token => token === 'valid' ? { data: { user: { id: 'auth-42', email_confirmed_at: confirmed ? '2026-01-01' : null } } } : { data: {}, error: new Error('invalid') },
    admin: {
      createUser: async input => {
        state.created.push(input);
        if (state.authUsers.has(input.email)) return { data: {}, error: { code: 'email_exists' } };
        const authUser = { id: 'auth-created', email: input.email };
        state.authUsers.set(input.email, authUser);
        return { data: { user: authUser } };
      },
      deleteUser: async id => {
        state.deleted.push(id);
        if (deleteFails) return { data: {}, error: new Error('delete failed') };
        for (const [email, authUser] of state.authUsers) {
          if (authUser.id === id) state.authUsers.delete(email);
        }
        return { data: { user: null }, error: null };
      },
      listUsers: async () => ({ data: { users: [...state.authUsers.values()] }, error: null }),
      getUserById: async id => {
        const authUser = [...state.authUsers.values()].find(candidate => candidate.id === id);
        return authUser
          ? { data: { user: authUser }, error: null }
          : { data: {}, error: { code: 'user_not_found', status: 404 } };
      },
    },
  } };
  const publicClient = { auth: {
    resend: async () => {
      state.mails++;
      state.mailWhileTransactionOpen ||= state.transactionOpen;
      return { error: mailFails ? new Error('smtp password must not leak') : null };
    },
    resetPasswordForEmail: async () => ({ error: null }),
    signInWithPassword: async input => {
      if (input.email === 'new@example.com' && input.password === 'StrongPass1!') {
        return { data: {}, error: { code: 'email_not_confirmed' } };
      }
      if (state.created.length > 0
        && input.email === 'learner@example.com'
        && input.password === 'OldPass1!') {
        return { data: {}, error: { code: 'email_not_confirmed' } };
      }
      return input.password === 'NewPass1!'
        ? { data: { session: { access_token: 'valid', refresh_token: 'refresh' } } }
        : { error: { code: 'invalid_credentials' } };
    },
  } };
  const app = express(); app.use(express.json());
  const auth = installAuth(app, db, admin, env || { AUTH_ALLOWED_ORIGINS: 'http://localhost:5174' }, { createPublicClient: () => publicClient });
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
  assert.deepEqual(state.deleted, []);
});
test('failed player writes remove newly created Supabase identities', async t => {
  await t.test('new signup', async t => {
    const { call, state } = await fixture(t, { failSql: 'users' });
    const result = await call('/api/auth/sign-up', {
      username: 'new-learner', email: 'new@example.com', password: 'StrongPass1!',
    });
    assert.equal(result.status, 503);
    assert.deepEqual(state.deleted, ['auth-created']);
  });

  await t.test('legacy migration', async t => {
    const { call, state } = await fixture(t, { mapped: false, failSql: 'identity' });
    const result = await call('/api/auth/sign-in', { identifier: 'learner', password: 'OldPass1!' });
    assert.equal(result.status, 503);
    assert.deepEqual(state.deleted, ['auth-created']);
  });
});
test('signup retry reuses the durable player mapping after the commit response is lost', async t => {
  const { call, state } = await fixture(t, { mapped: false, commitFailsAfterDurableWrite: true });
  const signup = {
    username: 'new-learner', email: 'new@example.com', password: 'StrongPass1!',
  };

  assert.equal((await call('/api/auth/sign-up', signup)).status, 503);
  assert.deepEqual(state.deleted, []);
  assert.equal(state.binding.user_id, 99);

  const retry = await call('/api/auth/sign-up', signup);
  assert.equal(retry.status, 200);
  assert.equal(retry.body.confirmationRequired, true);
  assert.equal(state.created.length, 1);
  assert.equal(state.mailWhileTransactionOpen, false);
});
test('legacy migration retry reuses the durable player mapping after the commit response is lost', async t => {
  const { call, state } = await fixture(t, {
    mapped: false,
    commitFailsAfterDurableWrite: true,
  });

  assert.equal((await call('/api/auth/sign-in', {
    identifier: 'learner', password: 'OldPass1!',
  })).status, 503);
  assert.deepEqual(state.deleted, []);

  const retry = await call('/api/auth/sign-in', {
    identifier: 'learner', password: 'OldPass1!',
  });
  assert.equal(retry.status, 200);
  assert.equal(retry.body.confirmationRequired, true);
  assert.equal(state.created.length, 1);
});
test('ambiguous database reconciliation never deletes a newly created Auth user', async t => {
  const { call, state } = await fixture(t, {
    mapped: false,
    failSql: 'reconcile',
    commitFailsAfterDurableWrite: true,
  });

  assert.equal((await call('/api/auth/sign-in', {
    identifier: 'learner', password: 'OldPass1!',
  })).status, 503);
  assert.deepEqual(state.deleted, []);
});
test('retry adopts a verified Supabase user when cleanup failed after a rolled-back link', async t => {
  const { call, state } = await fixture(t, {
    mapped: false,
    failIdentityOnce: true,
    deleteFails: true,
  });

  const credentials = { identifier: 'learner', password: 'OldPass1!' };
  assert.equal((await call('/api/auth/sign-in', credentials)).status, 503);
  assert.equal(state.provisioning.values().next().value.status, 'reconcile_required');

  const retry = await call('/api/auth/sign-in', credentials);
  assert.equal(retry.status, 200);
  assert.equal(retry.body.confirmationRequired, true);
  assert.equal(state.created.length, 1);
  assert.equal(state.binding.auth_user_id, 'auth-created');
  assert.equal(state.provisioning.values().next().value.status, 'committed');
});
test('retry finds and adopts an Auth user created before its ID could be recorded', async t => {
  const { call, state } = await fixture(t, {
    mapped: false,
    failProvisioningUpdateOnce: true,
  });
  const signup = {
    username: 'new-learner', email: 'new@example.com', password: 'StrongPass1!',
  };

  assert.equal((await call('/api/auth/sign-up', signup)).status, 503);
  assert.equal(state.provisioning.values().next().value.auth_user_id, null);

  const retry = await call('/api/auth/sign-up', signup);
  assert.equal(retry.status, 201);
  assert.equal(state.created.length, 2);
  assert.equal(state.binding.auth_user_id, 'auth-created');
  assert.equal(state.provisioning.values().next().value.status, 'committed');
});
test('retry recreates an Auth user deleted before compensated status could be recorded', async t => {
  const { call, state } = await fixture(t, {
    mapped: false,
    failIdentityOnce: true,
    failCompensatedUpdateOnce: true,
  });
  const credentials = { identifier: 'learner', password: 'OldPass1!' };

  assert.equal((await call('/api/auth/sign-in', credentials)).status, 503);
  assert.equal(state.authUsers.size, 0);
  assert.equal(state.provisioning.values().next().value.status, 'reconcile_required');

  const retry = await call('/api/auth/sign-in', credentials);
  assert.equal(retry.status, 200);
  assert.equal(state.created.length, 2);
  assert.equal(state.binding.auth_user_id, 'auth-created');
  assert.equal(state.provisioning.values().next().value.status, 'committed');
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
  assert.deepEqual(state.deleted, []);
  assert(!JSON.stringify(result).includes('smtp password'));
});
test('old login, registration and recovery routes cannot bypass new auth', async t => {
  const { call } = await fixture(t);
  for (const path of ['/login', '/register', '/api/login', '/api/register', '/api/password/reset', '/api/password/forgot']) assert.equal((await call(path, {})).status, 410);
});
test('the retired server-side Google cookie no longer signs anyone in', async t => {
  const { call } = await fixture(t);
  const cookie = `pyarena_google_session=${'a'.repeat(64)}`;
  assert.equal((await call('/api/auth/me', null, { Cookie: cookie })).status, 401);
  assert.equal((await call('/api/auth/google', { token: 'x' })).status, 401);
  assert.equal((await call('/api/auth/sign-out', {}, { Cookie: cookie })).status, 200);
});
test('cross-origin credential requests are rejected', async t => {
  const { call } = await fixture(t);
  assert.equal((await call('/api/auth/sign-in', {}, { Origin: 'https://attacker.example' })).status, 403);
});
test('same-origin deployment accepts its own backend origin when the allowlist is blank', async t => {
  const { call } = await fixture(t, { env: { AUTH_ALLOWED_ORIGINS: '', PORT: '3001' } });
  const response = await call('/api/auth/sign-up', {}, { Origin: 'http://localhost:3001' });
  assert.equal(response.status, 400);
  assert.equal((await call('/api/auth/sign-up', {}, { Origin: 'https://attacker.example' })).status, 403);
});
test('actor policy distinguishes actor from target and rejects spoofing', () => {
  const user = { user_id: 42, username: 'learner' };
  assert(actorMatches(user, { user_id: 42, attacker_name: 'learner', target_name: 'other' }));
  assert(!actorMatches(user, { current_host: 'other' }));
  assert(!accountEnabled({ is_deleted: 1 }));
  assert.equal(normalizeEmail(' User@Example.COM '), 'user@example.com');
});
