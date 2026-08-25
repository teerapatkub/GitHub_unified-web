export default function RoundSummaryView({ roundSummary, timeLeft, t }) {
  if (!roundSummary) return null;
  const { roundNum, entries } = roundSummary;

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="min-h-full p-8 max-w-2xl mx-auto flex flex-col items-center justify-center text-center space-y-6">
      <div className="space-y-2">
        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 rounded-full border border-rose-100">
          {t('roundSummaryBadge')} {roundNum}
        </span>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t('roundSummaryTitle')}</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          {t('roundSummaryNextIn')} <span className="text-rose-500 text-base">{timeLeft}s</span>
        </p>
      </div>

      <div className="w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
        {entries.map((entry, idx) => (
          <div key={idx} className={`flex justify-between items-center p-5 border-b border-slate-100 last:border-0 ${entry.isPlayer ? 'bg-rose-50/50 font-black' : 'hover:bg-slate-50'}`}>
            <div className="flex items-center gap-4">
              <span className={`w-8 text-center text-xs font-black ${entry.rank === 1 ? 'text-amber-500' : 'text-slate-400'}`}>#{entry.rank}</span>
              <span className={`text-xs ${entry.eliminated ? 'text-slate-400 line-through font-normal' : 'text-slate-700'}`}>
                {entry.name} {entry.isPlayer ? t('youSuffix') : ""}
              </span>
              {entry.eliminated && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-600 px-2 py-1 rounded-lg">
                  {t('eliminated')}
                </span>
              )}
            </div>
            <span className="text-emerald-600 font-mono text-xs font-bold">🪙 +{entry.cashGain}</span>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
