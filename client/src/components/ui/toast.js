// App-wide toast messages (Spec 0005 ticket 14). Pages used window.alert(),
// which blocks the page, can't be styled, and showed raw English server text
// such as "Unable to equip item". Any module can call toast(); <ToastHost/>
// in App renders them.
const listeners = new Set();
let nextId = 1;

export const TOAST_MS = 5000;

export function toast(message, type = 'error') {
  const text = String(message || '').trim();
  if (!text) return null;
  const entry = { id: nextId++, message: text, type };
  listeners.forEach(listener => listener(entry));
  return entry.id;
}

export function subscribeToasts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Server errors are shown to the player as-is only when they are already Thai
// (or English while the page is in English); otherwise the page's own message.
export function friendlyError(serverMessage, fallback, lang = 'th') {
  const text = String(serverMessage || '').trim();
  if (!text) return fallback;
  const isThai = /[฀-๿]/.test(text);
  return (lang === 'th') === isThai ? text : fallback;
}
