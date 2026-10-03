const crypto = require('crypto');

// Server-issued proof of a successful admin login. A browser-supplied user id
// alone is not authentication. Restarting the server requires signing in again.
const signingKey = crypto.randomBytes(32);
function issueAdminToken(user, now = Date.now()) {
  if (user.role !== 'admin') return undefined;
  const payload = Buffer.from(JSON.stringify({ id: Number(user.user_id), expires: now + 8 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', signingKey).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}
function verifyAdminToken(token, now = Date.now()) {
  if (typeof token !== 'string' || token.length > 1000) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const expected = crypto.createHmac('sha256', signingKey).update(parts[0]).digest();
  const actual = Buffer.from(parts[1], 'base64url');
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    return Number.isSafeInteger(payload.id) && payload.id > 0 && payload.expires > now ? payload.id : null;
  } catch { return null; }
}
module.exports = { issueAdminToken, verifyAdminToken };
