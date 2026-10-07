import axios from 'axios';
import { API_BASE } from '../config/api.js';
import { getSupabaseClient } from '../supabaseClient.js';

const originalFetch = window.fetch.bind(window);
const apiOrigin = new URL(API_BASE || window.location.origin, window.location.origin).origin;
let session = null;
let ready;
let installed = false;
let initialized = false;
export const isRecovery = () => new URLSearchParams(window.location.search).get('auth') === 'recovery';
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
        session = nextSession;
        // Do not await another Supabase method inside its auth callback lock.
        if (initialized && event !== 'INITIAL_SESSION') {
          window.setTimeout(() => window.dispatchEvent(new CustomEvent('pyarena:session-changed', { detail: { event } })), 0);
        }
      });
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      session = data.session;
    } catch {
      // Google remains available even if Supabase settings are temporarily missing.
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
export async function currentPlayer() {
  await initializeAuth();
  const response = await fetch(`${API_BASE}/api/auth/me`);
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('ตรวจสอบการเข้าสู่ระบบไม่ได้ กรุณาลองอีกครั้ง');
  return response.json();
}
export async function acceptEmailSession(next) {
  const { error } = await getSupabaseClient().auth.setSession({ access_token: next.access_token, refresh_token: next.refresh_token });
  if (error) throw new Error('เริ่มการเข้าสู่ระบบไม่ได้ กรุณาลองใหม่');
  session = next;
}
export async function signOut() {
  // Revoke Google first while its cookie is present, then revoke Supabase refresh tokens.
  await authRequest('sign-out');
  if (session) {
    const { error } = await getSupabaseClient().auth.signOut({ scope: 'local' });
    if (error) throw new Error('ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง');
  }
  session = null;
  localStorage.removeItem('user');
}
export async function acceptGoogleSession() {
  if (session) {
    const { error } = await getSupabaseClient().auth.signOut({ scope: 'local' });
    if (error) throw new Error('เปลี่ยนวิธีเข้าสู่ระบบไม่สำเร็จ');
  }
  session = null;
}
