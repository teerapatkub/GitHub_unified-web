const crypto = require('node:crypto');
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const validEmail = (email) => email.length <= 100 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const accountEnabled = (user) => user && !Number(user.is_deleted) &&
  (!Number(user.is_banned) || (user.ban_until && new Date(user.ban_until).getTime() <= Date.now()));
const strongPassword = (password) => typeof password === 'string' && password.length >= 8 && password.length <= 128 &&
  /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password);

// Only actor fields are checked. target_name/target_user_name are intentionally
// different: a player may attack or spectate another player in Arcade.
function actorMatches(user, values = {}) {
  const ids = ['user_id', 'userId', 'hostId', 'created_by'];
  const names = ['user_name', 'host_name', 'current_host', 'attacker_name', 'viewer'];
  return ids.every(key => values[key] == null || String(values[key]) === String(user.user_id)) &&
    names.every(key => values[key] == null || values[key] === user.username);
}
module.exports = { normalizeEmail, validEmail, hashToken, accountEnabled, strongPassword, actorMatches };
