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

// Google sign-in goes through Supabase Auth: a full-page OAuth redirect, then
// one server call that binds the Supabase user to a player account.
test('Google sign-in redirects through Supabase and remembers the page to return to', async () => {
  const sessionStore = new Map();
  globalThis.sessionStorage = {
    getItem: key => sessionStore.get(key) ?? null,
    setItem: (key, value) => sessionStore.set(key, String(value)),
    removeItem: key => sessionStore.delete(key),
  };
  let oauthRequest;
  globalThis.__authTestSupabase.auth.signInWithOAuth = async (request) => { oauthRequest = request; return { error: null }; };
  window.location.search = '?returnTo=%2Fpromotion-exam%3Fstage%3D2';
  await authSession.startGoogleSignIn();
  assert.deepEqual(oauthRequest, { provider: 'google', options: { redirectTo: 'http://localhost:5174/login?auth=google' } });

  // Back from Google: the exact-match redirect URL carries no returnTo, so it
  // is put back before the router reads the address.
  let replaced;
  window.location.href = 'http://localhost:5174/login?auth=google#access_token=t';
  window.location.search = '?auth=google';
  window.history = { state: null, replaceState: (_state, _title, url) => { replaced = url; } };
  authSession.restoreOAuthReturn();
  assert.equal(replaced, '/login?auth=google&returnTo=%2Fpromotion-exam%3Fstage%3D2#access_token=t');
  assert.equal(sessionStore.size, 0);
  window.location.search = '';
});

test('completing Google sign-in binds the account on the server and returns the player', async () => {
  await authSession.acceptEmailSession({ access_token: 'google-access', refresh_token: 'refresh' });
  const calls = [];
  fetchResponse = async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method, auth: new Headers(init.headers).get('Authorization') });
    return new Response(JSON.stringify({ user_id: 141, username: 'max', level: 10, created: false }), { status: 200 });
  };
  const player = await authSession.completeOAuthSignIn();
  assert.equal(player.user_id, 141);
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/api\/auth\/oauth\/complete$/);
  assert.equal(calls[0].method, 'POST');
});

test('a refused Google binding leaves no half-signed-in Supabase session behind', async () => {
  await authSession.acceptEmailSession({ access_token: 'google-access', refresh_token: 'refresh' });
  const signOutsBefore = supabaseSignOutCalls;
  fetchResponse = async () => new Response(JSON.stringify({ message: 'บัญชีนี้เชื่อมกับการเข้าสู่ระบบอื่นแล้ว' }), { status: 409 });
  await assert.rejects(authSession.completeOAuthSignIn(), /เชื่อมกับการเข้าสู่ระบบอื่นแล้ว/);
  assert.equal(supabaseSignOutCalls, signOutsBefore + 1);
});
