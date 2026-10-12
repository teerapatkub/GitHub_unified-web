const createSupabaseAuthCheck = ({
  url,
  secretKey,
  publishableKey,
  fetchImpl = fetch,
  cacheMs = 10000,
  timeoutMs = 3000,
  now = Date.now,
}) => {
  let healthUrl;
  try {
    healthUrl = new URL('/auth/v1/health', url);
  } catch {
    healthUrl = null;
  }
  const configured = healthUrl
    && /^https?:$/.test(healthUrl.protocol)
    && String(secretKey || '').startsWith('sb_secret_')
    && String(publishableKey || '').startsWith('sb_publishable_');
  let lastReadyAt = null;
  let pendingProbe;

  return async () => {
    if (!configured) throw new Error('Supabase Auth configuration is incomplete');
    if (lastReadyAt !== null && now() - lastReadyAt < cacheMs) return;
    if (!pendingProbe) {
      pendingProbe = (async () => {
        const response = await fetchImpl(healthUrl, {
          headers: { apikey: secretKey },
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (!response.ok) throw new Error(`Supabase Auth health returned ${response.status}`);
        lastReadyAt = now();
      })().finally(() => { pendingProbe = undefined; });
    }
    await pendingProbe;
  };
};

module.exports = { createSupabaseAuthCheck };
