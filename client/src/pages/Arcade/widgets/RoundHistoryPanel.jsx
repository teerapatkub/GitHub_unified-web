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
              onClick={() => setOpenRound(isOpen ? null : row.round_num)}
              className="w-full flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="shrink-0 w-16 text-xs font-black text-slate-400 uppercase tracking-wide">
                  {t('roundLabelShort')} {row.round_num}
                </span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-slate-500 min-w-0">
                  <span>✅ {row.pass_count}/{row.total_count}</span>
                  <span>📖 {row.quality_score}/100</span>
                  <span>⏱ {row.time_used_seconds}s</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-emerald-600 font-mono text-xs font-black">
                  {row.round_score} {t('ptsUnit')}
                </span>
                <span className={`text-slate-300 text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
              </div>
            </button>

            {isOpen && (
              <div className="px-6 pb-5">
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
