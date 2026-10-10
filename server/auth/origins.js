function addOrigin(origins, value) {
  const candidate = String(value || '').trim();
  if (!candidate) return;
  try {
    origins.add(new URL(candidate).origin);
  } catch {
    // Invalid optional configuration is ignored here; callers still fail closed.
  }
}

function authOrigins(env = process.env) {
  const origins = new Set();
  const configured = String(env.AUTH_ALLOWED_ORIGINS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  for (const value of configured.length
    ? configured
    : ['http://localhost:5174', 'http://127.0.0.1:5174']) addOrigin(origins, value);
  addOrigin(origins, env.CLIENT_URL);
  addOrigin(origins, env.PUBLIC_BASE_URL);

  // During local same-origin development Express serves the built client itself.
  // Its own port is trusted even when AUTH_ALLOWED_ORIGINS was left blank.
  const port = Number(env.PORT) || 3001;
  addOrigin(origins, `http://localhost:${port}`);
  addOrigin(origins, `http://127.0.0.1:${port}`);
  return origins;
}

module.exports = { authOrigins };
