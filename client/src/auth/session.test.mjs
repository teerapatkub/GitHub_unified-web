import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const storage = new Map();
let fetchResponse;
let supabaseSignOutError = null;
let supabaseSignOutCalls = 0;
let vite;
let authSession;

globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key),
};
globalThis.window = {
  location: { origin: 'http://localhost:5174', search: '' },
  fetch: (...args) => fetchResponse(...args),
  setTimeout,
  dispatchEvent: () => true,
};
globalThis.CustomEvent ??= class CustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
};
globalThis.fetch = (...args) => fetchResponse(...args);
globalThis.__authTestSupabase = {
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    getSession: async () => ({ data: { session: null }, error: null }),
    setSession: async () => ({ error: null }),
    signOut: async () => {
      supabaseSignOutCalls += 1;
      return { error: supabaseSignOutError };
    },
  },
};

before(async () => {
  vite = await createServer({
    configFile: false,
    root: fileURLToPath(new URL('../..', import.meta.url)),
    server: { middlewareMode: true },
    optimizeDeps: { noDiscovery: true },
    plugins: [{
      name: 'auth-test-supabase',
      enforce: 'pre',
      resolveId(source) {
        return source === '../supabaseClient.js' ? '\0auth-test-supabase' : null;
      },
      load(id) {
        if (id === '\0auth-test-supabase') {
          return 'export const getSupabaseClient = () => globalThis.__authTestSupabase;';
        }
        return null;
      },
    }],
  });
  authSession = await vite.ssrLoadModule('/src/auth/session.js');
  await authSession.initializeAuth();
});

after(async () => {
  await vite?.close();
});

test('API sign-out failure still clears the cached player', async () => {
  storage.set('user', JSON.stringify({ user_id: 42 }));
  supabaseSignOutCalls = 0;
  supabaseSignOutError = null;
  fetchResponse = async () => new Response(JSON.stringify({ message: 'server unavailable' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  });
  await authSession.acceptEmailSession({ access_token: 'access', refresh_token: 'refresh' });

  await assert.rejects(authSession.signOut(), /server unavailable/);
  assert.equal(supabaseSignOutCalls, 1);
  assert.equal(storage.has('user'), false);

  fetchResponse = async url => new Response(JSON.stringify(
    String(url).endsWith('/api/auth/sign-out')
      ? { success: true }
      : { user_id: 42, username: 'learner' }
  ), { status: 200, headers: { 'Content-Type': 'application/json' } });
  assert.equal(await authSession.currentPlayer(), null);
  assert.equal(storage.has('pyarena_sign_out_pending'), false);
});

test('Supabase sign-out failure still clears the cached player', async () => {
  storage.set('user', JSON.stringify({ user_id: 42 }));
  supabaseSignOutCalls = 0;
  fetchResponse = async () => new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  supabaseSignOutError = new Error('Supabase unavailable');
  await authSession.acceptEmailSession({ access_token: 'access', refresh_token: 'refresh' });

  await assert.rejects(authSession.signOut(), /ออกจากระบบไม่สำเร็จ/);
  assert.equal(supabaseSignOutCalls, 1);
  assert.equal(storage.has('user'), false);

  supabaseSignOutError = null;
  assert.equal(await authSession.currentPlayer(), null);
  assert.equal(supabaseSignOutCalls, 2);
  assert.equal(storage.has('pyarena_sign_out_pending'), false);
});
