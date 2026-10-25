import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, History } from 'lucide-react';
import { API_BASE } from '../../config/api.js';
import { makeTranslator } from './translations.js';
import MatchHistoryRow from './widgets/MatchHistoryRow.jsx';
import { historyQuery, mergeMatchPages } from './matchHistory.js';

const PAGE_SIZE = 20;

// Every finished Arcade match of the signed-in player (Spec 0005 #10): newest
// first, 20 at a time, filterable by the room's difficulty and pacing. A page
// rather than a popup: the list has no upper bound, the browser's back button
// returns to the lobby, and the URL can be bookmarked.
export default function ArcadeHistoryPage({ user }) {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'th' ? 'th' : 'en';
  const t = useMemo(() => makeTranslator(lang), [lang]);
  const id = useId();
  const playerName = user?.username || '';

  const [difficulty, setDifficulty] = useState('all');
  const [pace, setPace] = useState('all');
  const [matches, setMatches] = useState([]);
  const [total, setTotal] = useState(0);
  const [nextBefore, setNextBefore] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error | more
  const [openMatch, setOpenMatch] = useState(null);

  const load = useCallback(async (before) => {
    if (!playerName) return;
    setStatus(before ? 'more' : 'loading');
    try {
      const query = historyQuery({ limit: PAGE_SIZE, before, difficulty, roundDurationMode: pace });
      const res = await fetch(`${API_BASE}/api/arcade/players/${encodeURIComponent(playerName)}/history?${query}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error('history failed');
      setMatches(prev => (before ? mergeMatchPages(prev, data.matches || []) : data.matches || []));
      setTotal(data.total_matches ?? 0);
      setNextBefore(data.next_before ?? null);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [playerName, difficulty, pace]);

  // Restored on the way out: other pages do not set a title yet (ticket 11).
  useEffect(() => {
    const previous = document.title;
    document.title = `${t('matchHistoryPageTitle')} · PyArena`;
    return () => { document.title = previous; };
  }, [t]);

  useEffect(() => {
    // Deferred so the state updates in load() run after the effect, not inside it.
    const timer = setTimeout(() => { load(null); }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const choice = (selected) => `min-h-[40px] px-3 rounded-xl text-xs font-bold border transition-colors ${selected ? 'bg-rose-600 text-white border-rose-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`;
  const filters = [
    { label: t('difficultyLabel'), value: difficulty, set: setDifficulty, key: 'difficulty', options: [
      ['all', t('historyFilterAll')], ['default', t('difficultyDefault')], ['easy', t('difficultyEasy')], ['medium', t('difficultyMedium')], ['hard', t('difficultyHard')],
    ] },
    { label: t('roundModeLabel'), value: pace, set: setPace, key: 'pace', options: [
      ['all', t('historyFilterAll')], ['standard', t('roundModeStandard')], ['quick', t('roundModeQuick')],
    ] },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-5">
      <Link to="/matchmaking" className="inline-flex items-center gap-1.5 min-h-[40px] text-sm font-bold text-slate-700 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t('backToArcadeLobby')}
      </Link>

      <div className="flex items-center gap-3">
        <History className="h-6 w-6 text-rose-600" aria-hidden="true" />
        <div>
          <h1 className="text-xl font-black text-slate-900">{t('matchHistoryPageTitle')}</h1>
          <p className="text-sm text-slate-600">{t('pastMatchesSubtitle')}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3">
        {filters.map(filter => (
          <div key={filter.key} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            <p id={`${id}-${filter.key}`} className="text-xs font-black text-slate-700 sm:w-28 shrink-0">{filter.label}</p>
            <div role="group" aria-labelledby={`${id}-${filter.key}`} className="flex flex-wrap gap-2">
              {filter.options.map(([value, label]) => (
                <button key={value} type="button" aria-pressed={filter.value === value}
                  onClick={() => filter.set(value)} className={choice(filter.value === value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div aria-live="polite" className="text-sm font-bold text-slate-600">
        {status === 'loading' ? t('historyLoading')
          : status === 'error' ? t('historyLoadError')
            : t('historyCount').replace('{{shown}}', String(matches.length)).replace('{{total}}', String(total))}
      </div>

      {status === 'error' && (
        <button type="button" onClick={() => load(null)} className={choice(false)}>{t('retryBtn')}</button>
      )}

      {status !== 'loading' && status !== 'error' && matches.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
          <p className="text-sm font-bold text-slate-700">
            {difficulty === 'all' && pace === 'all' ? t('historyEmpty') : t('historyEmptyFiltered')}
          </p>
          <Link to="/matchmaking" className="inline-flex items-center min-h-[44px] px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-black">
            {t('historyEmptyCta')}
          </Link>
        </div>
      )}

      {matches.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {matches.map(m => (
            <MatchHistoryRow key={m.match_id} match={m} open={openMatch === m.match_id}
              onToggle={() => setOpenMatch(openMatch === m.match_id ? null : m.match_id)} t={t} lang={lang} />
          ))}
        </div>
      )}

      {nextBefore && status !== 'error' && (
        <div className="flex justify-center">
          <button type="button" disabled={status === 'more'} aria-busy={status === 'more'} onClick={() => load(nextBefore)}
            className="min-h-[44px] px-6 rounded-2xl border border-slate-300 bg-white text-sm font-black text-slate-700 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70">
            {status === 'more' ? t('historyLoading') : t('historyLoadMore')}
          </button>
        </div>
      )}
    </main>
  );
}
