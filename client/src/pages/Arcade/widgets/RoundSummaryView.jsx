export default function RoundSummaryView({ roundSummary, timeLeft, t, nextRoundLabel = '' }) {
  if (!roundSummary) return null;
  const { roundNum, entries } = roundSummary;

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="min-h-full p-8 max-w-2xl mx-auto flex flex-col items-center justify-center text-center space-y-6">
      <div className="space-y-2">
        <span className="px-3 py-1 text-label font-black uppercase tracking-widest text-pysim-accent-strong bg-pysim-accent-container rounded-full border border-pysim-accent-border">
          {t('roundSummaryBadge')} {roundNum}
        </span>
        <h1 className="text-3xl font-black text-pysim-on-surface tracking-tight">{t('roundSummaryTitle')}</h1>
        <p className="text-xs text-pysim-label font-bold uppercase tracking-wider">
          {t('roundSummaryNextIn')} <span className="text-pysim-accent-strong text-base">{timeLeft}s</span>
        </p>
        {nextRoundLabel && <p className="text-sm font-black text-pysim-on-surface-variant">{nextRoundLabel}</p>}
      </div>

      <div className="w-full bg-pysim-card rounded-3xl overflow-hidden shadow-sm border border-pysim-outline-variant">
        {entries.map((entry, idx) => (
          <div key={idx} className={`flex justify-between items-center p-5 border-b border-pysim-outline-variant last:border-0 ${entry.isPlayer ? 'bg-pysim-accent-container/50 font-black' : 'hover:bg-pysim-surface'}`}>
            <div className="flex items-center gap-4">
              <span className={`w-8 text-center text-xs font-black ${entry.rank === 1 ? 'text-pysim-warning-strong' : 'text-pysim-label'}`}>#{entry.rank}</span>
              <span className={`text-xs ${entry.eliminated ? 'text-pysim-label line-through font-normal' : 'text-pysim-on-surface-variant'}`}>
                {entry.name} {entry.isPlayer ? t('youSuffix') : ""}
              </span>
              {entry.eliminated && (
                <span className="text-label font-black uppercase tracking-wider bg-pysim-accent-container text-pysim-accent-strong px-2 py-1 rounded-lg">
                  {t('eliminated')}
                </span>
              )}
            </div>
            <span className="flex flex-col items-end">
              <span className="text-pysim-success-strong font-mono text-xs font-bold">🪙 +{entry.cashGain}</span>
              {/* Where the money came from (server/arcade/round-cash.js): the
                  comeback part is what lets the player behind afford an item. */}
              {entry.cashParts && (
                <span className="mt-0.5 text-label font-semibold text-pysim-label">
                  {t('cashBase')} {entry.cashParts.base} · {t('cashRank')} +{entry.cashParts.rank}
                  {entry.cashParts.comeback > 0 && <span className="text-pysim-info"> · {t('cashComeback')} +{entry.cashParts.comeback}</span>}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
