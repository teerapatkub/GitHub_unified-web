// How many reverse proxies stand between a player and this process: Tailscale
// Funnel, or the university's reverse proxy, is one. Express then reads the
// player's address from X-Forwarded-For instead of seeing every request come
// from the proxy, which matters for the per-address sign-in rate limit.
//
// Left empty, nothing is trusted and X-Forwarded-For is ignored, so a request
// that reaches the port directly cannot pick its own address.
function trustProxySetting(env = process.env) {
  const raw = String(env.TRUST_PROXY || '').trim();
  if (!raw) return false;
  if (!/^\d+$/.test(raw)) throw new Error('TRUST_PROXY must be the number of reverse proxies in front of the app, e.g. 1');
  return Number(raw);
}

module.exports = { trustProxySetting };
