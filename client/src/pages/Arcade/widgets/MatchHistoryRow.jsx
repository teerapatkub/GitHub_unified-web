import RoundHistoryPanel from './RoundHistoryPanel.jsx';
import { formatMatchDate } from '../matchHistory.js';

// One finished match: a summary line that expands into the same round panel
// the RESULT screen uses, so a past match reads exactly like the one you just
// finished. Shared by the lobby card and the full history page.
export default function MatchHistoryRow({ match: m, open, onToggle, t, lang }) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="w-full flex flex-col items-stretch gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
      >
        <div className="min-w-0">
          <div className="text-sm font-black text-slate-800 truncate">
            {m.room_name || m.room_code}
          </div>
          <div className="text-xs font-bold text-slate-600">
            {m.room_code} · {formatMatchDate(m.ended_at, lang)} · {m.rounds.length} {t('roundsUnit')}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
          <div className="grid flex-1 grid-cols-3 gap-2 sm:flex">
            <span className="rounded-xl bg-slate-100 px-2 py-1 text-center text-xs font-bold text-slate-600">
              {t('matchTotalLabel')}<br />
              <b className="text-sm text-emerald-700">{m.total_score} {t('ptsUnit')}</b>
            </span>
            <span className="rounded-xl bg-slate-100 px-2 py-1 text-center text-xs font-bold text-slate-600">
              {t('finalRankHistoryLabel')}<br />
              <b className="text-sm text-slate-800">#{m.final_rank ?? '-'}</b>
            </span>
            <span className="rounded-xl bg-amber-50 px-2 py-1 text-center text-xs font-bold text-amber-800">
              {t('rewardHistoryLabel')}<br />
              <b className="text-sm">+{m.coins_awarded ?? 0} 🪙</b>
            </span>
          </div>
          <span aria-hidden="true" className={`text-slate-500 text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4">
          <RoundHistoryPanel history={m.rounds} t={t} />
        </div>
      )}
    </div>
  );
}
