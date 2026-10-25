import axios from 'axios';
import { API_BASE } from '../config/api.js';
import { getSupabaseClient } from '../supabaseClient.js';
import { returnPath } from './return-path.js';
import { fetchWhenServerReady } from '../config/startupRetry.js';

const originalFetch = window.fetch.bind(window);
const apiOrigin = new URL(API_BASE || window.location.origin, window.location.origin).origin;
const SIGN_OUT_PENDING = 'pyarena_sign_out_pending';
const SIGN_OUT_PROVIDERS = ['api', 'supabase'];
const OAUTH_RETURN = 'pyarena_oauth_return';
let session = null;
let ready;
let installed = false;
let initialized = false;
export const isRecovery = () => new URLSearchParams(window.location.search).get('auth') === 'recovery';
export const isOAuthReturn = () => new URLSearchParams(window.location.search).get('auth') === 'google';
const isApi = (value) => {
  const url = new URL(value, window.location.origin);
  return url.origin === apiOrigin && /^\/(api(?:\/|$)|rooms(?:\/|$)|shop(?:\/|$)|user\/|achievements\/|music\/)/.test(url.pathname);
};

export function initializeAuth() {
  if (ready) return ready;
  ready = (async () => {
    try {
      const client = getSupabaseClient();
      client.auth.onAuthStateChange((event, nextSession) => {
        const previousUser = session?.user?.id;
        session = nextSession;
        // supabase-js re-announces SIGNED_IN for the same user whenever the tab
        // becomes visible again, and TOKEN_REFRESHED hourly. The new token is
        // kept above; the app only re-reads the player when the user changed.
        const userChanged = event === 'SIGNED_OUT' || nextSession?.user?.id !== previousUser;
        // Do not await another Supabase method inside its auth callback lock.
        if (initialized && event !== 'INITIAL_SESSION' && userChanged) {
          window.setTimeout(() => window.dispatchEvent(new CustomEvent('pyarena:session-changed', { detail: { event } })), 0);
        }
      });
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      session = data.session;
    } catch {
      // A missing or unreachable Supabase config leaves the visitor signed out.
      session = null;
    }
    initialized = true;
  })();
  return ready;
}

// Keep credentials scoped to this API, including existing fetch and axios callers.
export function installAuthTransport() {
  if (installed) return;
  installed = true;
  window.fetch = async (input, init = {}) => {
    if (!isApi(input instanceof Request ? input.url : String(input))) return originalFetch(input, init);
    await initializeAuth();
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    headers.set('X-PyArena-Request', '1');
    if (session?.access_token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${session.access_token}`);
    return originalFetch(input, { ...init, headers, credentials: 'include' });
  };
  axios.interceptors.request.use(async config => {
    if (isApi(new URL(config.url, config.baseURL || window.location.origin).href)) {
      await initializeAuth();
      config.withCredentials = true;
      config.headers.set('X-PyArena-Request', '1');
      if (session?.access_token) config.headers.set('Authorization', `Bearer ${session.access_token}`);
    }
    return config;
  });
}

export async function authRequest(path, body) {
  const response = await fetch(`${API_BASE}/api/auth/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}),
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('เชื่อมต่อระบบบัญชีไม่ได้ กรุณาลองอีกครั้งหรือติดต่อผู้ดูแล');
  }
  if (!data || typeof data !== 'object') {
    throw new Error('ระบบบัญชีตอบกลับไม่ถูกต้อง กรุณาลองอีกครั้ง');
  }
  if (!response.ok) {
    const error = new Error(data.message || 'ดำเนินการไม่ได้ กรุณาลองอีกครั้ง');
    error.code = data.code;
    throw error;
  }
  return data;
}
function pendingSignOutProviders() {
  const value = localStorage.getItem(SIGN_OUT_PENDING);
  if (!value) return [];
  // Support the marker written by the first version of the logout fix.
  if (value === '1') return SIGN_OUT_PROVIDERS;
  return value.split(',').filter(provider => SIGN_OUT_PROVIDERS.includes(provider));
}
function storePendingSignOut(providers) {
  if (providers.length) localStorage.setItem(SIGN_OUT_PENDING, providers.join(','));
  else localStorage.removeItem(SIGN_OUT_PENDING);
}
async function revokeSessions(providers) {
  let signOutError = null;
  const failedProviders = [];
  if (providers.includes('api')) {
    try {
      // Also clears the cookie of the retired server-side Google session.
      await authRequest('sign-out');
    } catch (error) {
      signOutError = error;
      failedProviders.push('api');
    }
  }
  if (providers.includes('supabase')) {
    try {
      // Independent of the API call: one failure must not leave the Supabase
      // session active on this device.
      const { error } = await getSupabaseClient().auth.signOut({ scope: 'local' });
      if (error) throw new Error('ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง');
    } catch (error) {
      signOutError ||= error;
      failedProviders.push('supabase');
    }
  }
  return { signOutError, failedProviders };
}
export async function currentPlayer() {
  await initializeAuth();
  const pendingProviders = pendingSignOutProviders();
  if (pendingProviders.length) {
    const { failedProviders } = await revokeSessions(pendingProviders);
    session = null;
    localStorage.removeItem('user');
    storePendingSignOut(failedProviders);
    return null;
  }
  const response = await fetchWhenServerReady(`${API_BASE}/api/auth/me`);
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('ตรวจสอบการเข้าสู่ระบบไม่ได้ กรุณาลองอีกครั้ง');
  return response.json();
}
export async function acceptEmailSession(next) {
  const { error } = await getSupabaseClient().auth.setSession({ access_token: next.access_token, refresh_token: next.refresh_token });
  if (error) throw new Error('เริ่มการเข้าสู่ระบบไม่ได้ กรุณาลองใหม่');
  session = next;
  localStorage.removeItem(SIGN_OUT_PENDING);
}
export async function signOut() {
  await initializeAuth();
  const providers = ['api'];
  if (session) providers.push('supabase');
  const { signOutError, failedProviders } = await revokeSessions(providers);
  session = null;
  localStorage.removeItem('user');
  storePendingSignOut(failedProviders);
  window.dispatchEvent(new CustomEvent('pyarena:session-changed', { detail: { event: 'SIGNED_OUT' } }));
  if (signOutError) throw signOutError;
}

// Google sign-in is Supabase's Google provider: a full-page redirect to Google
// and back to /login?auth=google, where Supabase picks the session up from the
// URL. That return URL must match Supabase's exact allowlist, so the page the
// player was heading to travels in sessionStorage instead of the URL.
export async function startGoogleSignIn() {
  const returnTo = returnPath(new URLSearchParams(window.location.search).get('returnTo'));
  try {
    if (returnTo) sessionStorage.setItem(OAUTH_RETURN, returnTo);
    else sessionStorage.removeItem(OAUTH_RETURN);
  } catch { /* storage blocked: the player lands on the default page */ }
  const { error } = await getSupabaseClient().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/login?auth=google` },
  });
  if (error) throw new Error('เริ่มเข้าสู่ระบบด้วย Google ไม่ได้ กรุณาลองอีกครั้ง');
}

// Call before the router reads the address bar.
export function restoreOAuthReturn() {
  if (!isOAuthReturn()) return;
  let returnTo = null;
  try {
    returnTo = returnPath(sessionStorage.getItem(OAUTH_RETURN));
    sessionStorage.removeItem(OAUTH_RETURN);
  } catch { return; }
  if (!returnTo) return;
  const url = new URL(window.location.href);
  url.searchParams.set('returnTo', returnTo);
  window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
}

// The server binds the Supabase user to a player account (an existing player
// with the same Google-verified email, or a new one). A refused binding signs
// the Supabase session out, so the device is not left half signed in.
export async function completeOAuthSignIn() {
  await initializeAuth();
  if (!session) throw new Error('เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองอีกครั้ง');
  const response = await fetch(`${API_BASE}/api/auth/oauth/complete`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || typeof data !== 'object') {
    try { await getSupabaseClient().auth.signOut({ scope: 'local' }); } catch { /* best effort */ }
    session = null;
    throw new Error(data?.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองอีกครั้ง');
  }
  localStorage.removeItem(SIGN_OUT_PENDING);
  return data;
}
