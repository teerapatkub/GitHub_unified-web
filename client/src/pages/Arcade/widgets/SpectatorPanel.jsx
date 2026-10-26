import { useEffect, useState } from 'react';
import { SHOP_ITEMS } from '../constants.js';

// For a player who is out (Spec 0005 #24): the survivors live - score, whether
// this round's answer is in and how many tests it passes, what debuffs are on
// them - one guess of who lasts, and cheers into the room chat. None of it
// reaches a survivor's score; the server only lets eliminated players in.
export default function SpectatorPanel({ roomId, matchId, apiBase, emojiSet, notify, t }) {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let stopped = false;
    let timer;
    const load = async () => {
      try {
        const response = await fetch(`${apiBase}/api/arcade/rooms/${roomId}/spectate`, { signal: AbortSignal.timeout(8000) });
        const data = await response.json();
        if (!stopped && response.ok && data.match_id === matchId) setState(data);
      } catch { /* the next poll tries again */ }
      if (!stopped) timer = setTimeout(load, 3000);
    };
    void load();
    return () => { stopped = true; clearTimeout(timer); };
  }, [apiBase, roomId, matchId, refresh]);

  const post = async (path, body, done) => {
    setBusy(true);
    try {
      const response = await fetch(`${apiBase}/api/arcade/rooms/${roomId}/${path}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) notify(data.error || t('spectatorActionFailed'), 'error');
      else done?.();
    } catch {
      notify(t('spectatorActionFailed'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const debuffName = type => {
    const item = SHOP_ITEMS.find(candidate => candidate.id === type);
    return item ? `${item.icon} ${t(item.nameKey)}` : type;
  };

  if (!state) return <p className="text-sm text-pysim-label">{t('spectatorLoading')}</p>;

  return (
    <div className="w-full space-y-4 text-left">
      <section aria-labelledby="spectator-live" className="rounded-2xl border border-pysim-outline-variant bg-pysim-card p-4">
        <h2 id="spectator-live" className="mb-3 text-sm font-black text-pysim-on-surface">{t('spectatorSurvivorsTitle')}</h2>
        <ul className="space-y-2">
          {state.survivors.map(survivor => (
            <li key={survivor.name} className="rounded-xl bg-pysim-surface px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <b className="text-pysim-on-surface">{survivor.name}</b>
                <span className="text-xs font-bold text-pysim-label">⭐ {survivor.score} {t('ptsUnit')}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs font-bold">
                <span className={survivor.submitted ? 'text-pysim-success-strong' : 'text-pysim-label'}>
                  {survivor.submitted ? t('spectatorSubmitted') : survivor.progress !== null
                    ? t('spectatorWorking').replace('{{progress}}', String(survivor.progress)) : t('spectatorWorkingHuman')}
                </span>
                {survivor.tests && (
                  <span className="text-pysim-on-surface-variant">
                    {t('spectatorTests').replace('{{passed}}', String(survivor.tests.passed)).replace('{{total}}', String(survivor.tests.total))}
                  </span>
                )}
                {survivor.debuffs.map(type => (
                  <span key={type} className="rounded-md bg-pysim-accent-container px-1.5 text-pysim-accent-strong">{debuffName(type)}</span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="spectator-guess" className="rounded-2xl border border-pysim-outline-variant bg-pysim-card p-4">
        <h2 id="spectator-guess" className="text-sm font-black text-pysim-on-surface">
          {t('spectatorGuessTitle').replace('{{coins}}', String(state.guess_reward))}
        </h2>
        {state.guess ? (
          <p className="mt-2 text-sm text-pysim-on-surface-variant">{t('spectatorGuessMade').replace('{{name}}', state.guess)}</p>
        ) : state.can_guess ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {state.survivors.map(survivor => (
              <button key={survivor.name} type="button" disabled={busy}
                onClick={() => post('guess', { match_id: matchId, guessed_name: survivor.name }, () => setRefresh(n => n + 1))}
                className="min-h-target-primary rounded-xl border border-pysim-accent-border bg-pysim-accent-container px-4 text-sm font-black text-pysim-accent-strong hover:bg-pysim-accent-border disabled:opacity-60">
                {survivor.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-pysim-label">{t('spectatorGuessClosed')}</p>
        )}
        <p className="mt-2 text-xs text-pysim-label">{t('spectatorGuessNote')}</p>
      </section>

      {emojiSet.length > 0 && (
        <section aria-labelledby="spectator-cheer" className="rounded-2xl border border-pysim-outline-variant bg-pysim-card p-4">
          <h2 id="spectator-cheer" className="mb-2 text-sm font-black text-pysim-on-surface">{t('spectatorCheerTitle')}</h2>
          <div className="flex flex-wrap gap-1.5">
            {emojiSet.map(emoji => (
              <button key={emoji} type="button" disabled={busy} aria-label={`${t('spectatorCheerTitle')} ${emoji}`}
                onClick={() => post('cheer', { emoji })}
                className="inline-flex min-h-target min-w-target items-center justify-center rounded-xl text-lg hover:bg-pysim-surface-container disabled:opacity-40">
                {emoji}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
