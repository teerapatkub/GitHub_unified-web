// Phase 8.3 — the player's durable Arcade career totals, shown above the room
// browser in the lobby. Rendered even for a player who has never finished a
// match (the endpoint returns a zeroed record rather than 404), so the card
// doubles as an invitation rather than popping into existence later.
export default function PlayerStatsCard({ stats, playerName, t }) {
  if (!stats) return null;

  const played = stats.matches_played || 0;
  const wins = stats.wins || 0;
  // Guarded: a player with no finished matches would otherwise divide by zero.
  const winRate = played > 0 ? Math.round((wins / played) * 100) : 0;

  const cells = [
    { label: t('statsMatches'), value: played },
    { label: t('statsWins'), value: wins },
    { label: t('statsWinRate'), value: `${winRate}%` },
    { label: t('statsBestRank'), value: stats.best_rank ? `#${stats.best_rank}` : '—' },
    { label: t('statsTotalScore'), value: (stats.total_score || 0).toLocaleString() },
    { label: t('statsTotalCash'), value: `🪙 ${(stats.total_cash_earned || 0).toLocaleString()}` }
  ];

  return (
    <div data-tour="arcade-stats" className="bg-pysim-card rounded-3xl shadow-sm border border-pysim-outline-variant overflow-hidden">
      <div className="px-6 py-4 border-b border-pysim-outline-variant flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-pysim-on-surface">{t('statsCardTitle')}</h3>
          <p className="text-xs text-pysim-label mt-0.5">{playerName}</p>
        </div>
        {played === 0 && (
          <span className="text-label font-bold text-pysim-label text-right">{t('statsNoMatchesYet')}</span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-pysim-outline-variant">
        {cells.map((cell) => (
          <div key={cell.label} className="px-4 py-4 text-center">
            <div className="text-lg font-black text-pysim-on-surface leading-none">{cell.value}</div>
            <div className="text-label font-bold text-pysim-label uppercase tracking-wide mt-1.5">{cell.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
