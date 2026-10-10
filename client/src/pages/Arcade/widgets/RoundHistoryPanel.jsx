import { useState } from 'react';

// Phase 8.3 — "review your code" panel on the RESULT screen. Shows what this
// player submitted each round, with the same three-part breakdown the round
// score is actually made of (test cases / AI-judged quality / time), so the
// number they were given is explainable rather than mysterious.
//
// Only ever contains the viewing player's own rounds — the endpoint behind it
// is scoped per user on purpose, so the end of a match doesn't hand everyone
// else's solutions out as an answer key.
export default function RoundHistoryPanel({ history, t }) {
  const [openRound, setOpenRound] = useState(null);

  if (!history || history.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden text-left">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-800">{t('roundHistoryTitle')}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{t('roundHistorySubtitle')}</p>
      </div>

      {history.map((row) => {
        const isOpen = openRound === row.round_num;
        return (
          <div key={row.round_num} className="border-b border-slate-100 last:border-0">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenRound(isOpen ? null : row.round_num)}
              className="w-full flex flex-col items-stretch gap-3 px-4 py-4 text-left hover:bg-slate-50 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
            >
              <div className="min-w-0">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
                  {t('roundLabelShort')} {row.round_num}
                </span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-[11px] text-slate-500 sm:flex sm:flex-wrap sm:gap-x-4">
                  <span><b className="text-slate-700">{t('testsResultLabel')}:</b> {row.pass_count}/{row.total_count}</span>
                  <span><b className="text-slate-700">{t('qualityScoreLabel')}:</b> {row.quality_score}/100</span>
                  <span><b className="text-slate-700">{t('timeUsedLabel')}:</b> {row.time_used_seconds} {t('secondsShort')}</span>
                  <span><b className="text-slate-700">{t('multiplierLabel')}:</b> ×{row.score_multiplier ?? 1}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 shrink-0 border-t border-slate-100 pt-3 sm:justify-end sm:border-0 sm:pt-0">
                <span className="text-emerald-700 text-xs font-black">
                  {t('roundTotalLabel')}: {' '}
                  {row.round_score} {t('ptsUnit')}
                </span>
                <span className={`text-slate-300 text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-5 sm:px-6">
                <pre className="bg-slate-900 text-emerald-400 text-[11px] font-mono p-4 rounded-2xl overflow-x-auto whitespace-pre">
                  {row.code || t('noCodeRecorded')}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
