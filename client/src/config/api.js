// Where the API lives. One answer, for the whole front end.
//
// It used to be the literal string 'http://localhost:3001' written out at 52
// call sites across 21 files, which is the single reason this app could not be
// deployed anywhere: every request a real user made would have gone to a server
// on THEIR OWN machine. Nothing about the app was wrong except the address.
//
// The default is the empty string, meaning "same origin as the page". That is
// the correct answer in both places it has to work:
//
//   - in production the API server also serves the built front end, so the page
//     and the API share an origin and a relative /api/... just works - and
//     there is no cross-origin request to configure, which is why this default
//     is the deployment shape rather than a convenience;
//   - in development the Vite dev server proxies /api and /uploads through to
//     :3001, so a relative path works there too, without the front end needing
//     to know that the two are separate processes.
//
// VITE_API_BASE_URL exists as the escape hatch for the case where they really
// are on different hosts (an API on its own subdomain, say). Set it to an
// origin with no trailing slash, e.g. https://api.example.com. Vite inlines it
// at build time, so it is baked into the bundle - it is a build input, not a
// runtime setting, and it must never hold a secret.
const configured = String(import.meta.env.VITE_API_BASE_URL || '').trim();

export const API_BASE = configured.replace(/\/+$/, '');

// Turns a path stored in the database into something the browser can load.
//
// Upload URLs live in rows written months apart: some are relative
// ('/uploads/x.png'), and older ones are absolute with a hardcoded
// 'http://localhost:3001' in front, seeded before any of this was portable.
// Both have to keep working, and the absolute-localhost ones have to stop
// being localhost on a deployed server - a profile picture that 404s is a
// broken page for the user, not a config detail.
export const assetUrl = (value) => {
  const raw = String(value || '');
  if (!raw) return '';
  const path = raw.replace(/^https?:\/\/localhost:\d+/i, '');
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith('/') ? `${API_BASE}${path}` : path;
};
