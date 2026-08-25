import { useState } from 'react';
import { History } from 'lucide-react';
import RoundHistoryPanel from './RoundHistoryPanel.jsx';

// Step 5 — review any of your recent finished matches from the lobby.
//
// Round history used to cascade away with its room, so a player lost their own
// code the instant they left the match. It now outlives the room, and this is
// where they get at it. Collapsed by default: the lobby's job is to get you
// into a game, not to bury the room list under a wall of past results.
export default function PastMatchesPanel({ matches, t }) {
  const [openRoom, setOpenRoom] = useState(null);

  if (!matches || matches.length === 0) return null;

  const formatEnded = (raw) => {
    if (!raw) return '';
    // Server timestamps come back without a zone marker (see parseUtcTimestamp
    // in constants.js for the same problem on phase deadlines).
    const iso = String(raw).includes('T') ? String(raw) : String(raw).replace(' ', 'T');
    const d = new Date(iso.endsWith('Z') ? iso : `${iso}Z`);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <History className="h-4 w-4 text-slate-400" />
        <div>
          <h3 className="text-sm font-black text-slate-800">{t('pastMatchesTitle')}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{t('pastMatchesSubtitle')}</p>
        </div>
      </div>

      {matches.map((m) => {
        const isOpen = openRoom === m.room_id;
        return (
          <div key={m.room_id} className="border-b border-slate-100 last:border-0">
            <button
              onClick={() => setOpenRoom(isOpen ? null : m.room_id)}
              className="w-full flex items-center justify-between gap-4 px-6 py-3 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-700 truncate">
                  {m.room_name || m.room_code}
                </div>
                <div className="text-[10px] font-bold text-slate-400">
                  {m.room_code} · {formatEnded(m.ended_at)} · {m.rounds.length} {t('roundsUnit')}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-emerald-600 font-mono text-xs font-black">
                  {m.total_score} {t('ptsUnit')}
                </span>
                <span className={`text-slate-300 text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4">
                {/* Same panel the RESULT screen uses, so a past match reads
                    exactly like the one you just finished. */}
                <RoundHistoryPanel history={m.rounds} t={t} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
