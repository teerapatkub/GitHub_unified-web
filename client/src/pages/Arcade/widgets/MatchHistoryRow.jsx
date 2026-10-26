import RoundHistoryPanel from './RoundHistoryPanel.jsx';
import { formatMatchDate } from '../matchHistory.js';

// One finished match: a summary line that expands into the same round panel
// the RESULT screen uses, so a past match reads exactly like the one you just
// finished. Shared by the lobby card and the full history page.
export default function MatchHistoryRow({ match: m, open, onToggle, t, lang }) {
  return (
    <div className="border-b border-pysim-outline-variant last:border-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="w-full flex flex-col items-stretch gap-3 px-4 py-4 hover:bg-pysim-surface transition-colors text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
      >
        <div className="min-w-0">
          <div className="text-sm font-black text-pysim-on-surface truncate">
            {m.room_name || m.room_code}
          </div>
          <div className="text-xs font-bold text-pysim-label">
            {m.room_code} · {formatMatchDate(m.ended_at, lang)} · {m.rounds.length} {t('roundsUnit')}
            {m.round_format === 'mixed' && <> · {t('roundFormatMixed')}</>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 border-t border-pysim-outline-variant pt-3 sm:border-0 sm:pt-0">
          <div className="grid flex-1 grid-cols-3 gap-2 sm:flex">
            <span className="rounded-xl bg-pysim-surface-container px-2 py-1 text-center text-xs font-bold text-pysim-label">
              {t('matchTotalLabel')}<br />
              <b className="text-sm text-pysim-success-strong">{m.total_score} {t('ptsUnit')}</b>
            </span>
            <span className="rounded-xl bg-pysim-surface-container px-2 py-1 text-center text-xs font-bold text-pysim-label">
              {t('finalRankHistoryLabel')}<br />
              <b className="text-sm text-pysim-on-surface">#{m.final_rank ?? '-'}</b>
            </span>
            <span className="rounded-xl bg-pysim-warning-container px-2 py-1 text-center text-xs font-bold text-pysim-warning-strong">
              {t('rewardHistoryLabel')}<br />
              <b className="text-sm">+{m.coins_awarded ?? 0} 🪙</b>
            </span>
          </div>
          <span aria-hidden="true" className={`text-pysim-label text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
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
