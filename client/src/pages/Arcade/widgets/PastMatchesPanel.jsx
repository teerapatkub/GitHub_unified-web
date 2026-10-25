import { useState } from 'react';
import { Link } from 'react-router-dom';
import { History } from 'lucide-react';
import MatchHistoryRow from './MatchHistoryRow.jsx';

// The lobby's look back: the three newest finished matches and a way to the
// full history page. It sits below the room list on purpose (Spec 0005 #10):
// the lobby's job is to get a player into a game, and a player with a long
// record used to scroll past every past match to reach "create room".
export default function PastMatchesPanel({ matches, total, t, lang }) {
  const [openMatch, setOpenMatch] = useState(null);

  if (!matches || matches.length === 0) return null;

  return (
    <div data-tour="arcade-history" className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-black text-slate-800">{t('pastMatchesTitle')}</h2>
            <p className="text-xs text-slate-600 mt-0.5">{t('pastMatchesSubtitle')}</p>
          </div>
        </div>
        <Link
          to="/matchmaking/history"
          className="inline-flex items-center min-h-[40px] px-4 rounded-xl border border-slate-300 text-xs font-black text-slate-700 hover:bg-slate-50"
        >
          {t('viewAllHistoryBtn').replace('{{count}}', String(total ?? matches.length))}
        </Link>
      </div>

      {matches.map((m) => (
        <MatchHistoryRow
          key={m.match_id}
          match={m}
          open={openMatch === m.match_id}
          onToggle={() => setOpenMatch(openMatch === m.match_id ? null : m.match_id)}
          t={t}
          lang={lang}
        />
      ))}
    </div>
  );
}
