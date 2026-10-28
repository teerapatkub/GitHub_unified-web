const createSupabaseAuthCheck = ({
  url,
  secretKey,
  publishableKey,
  fetchImpl = fetch,
  cacheMs = 10000,
  // Supabase can take several seconds to wake a paused project or recover
  // from a transient network/DNS issue. Three seconds made a brief slowdown
  // abort the entire server boot, even when the database itself was healthy.
  timeoutMs = 15000,
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
        try {
          const response = await fetchImpl(healthUrl, {
            headers: { apikey: secretKey },
            signal: AbortSignal.timeout(timeoutMs),
          });
          if (!response.ok) throw new Error(`Supabase Auth health returned ${response.status}`);
          lastReadyAt = now();
        } catch (error) {
          const detail = error?.name === 'TimeoutError'
            ? `timed out after ${timeoutMs}ms`
            : error?.message || 'request failed';
          throw new Error(`Supabase Auth readiness check ${detail} (${healthUrl.origin})`, { cause: error });
        }
      })().finally(() => { pendingProbe = undefined; });
    }
    await pendingProbe;
  };
};

module.exports = { createSupabaseAuthCheck };
