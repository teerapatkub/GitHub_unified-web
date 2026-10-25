import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, RefreshCw, Crown, Medal, ChevronRight } from 'lucide-react';
import { assetUrl } from '../config/api.js';
import { loadLeaderboard } from './leaderboard-data.js';
import SkeletonLoading from '../components/ui/Skeleton.jsx';
import { useTranslation } from 'react-i18next';

// The learner-facing leaderboard, with links to each player's public profile.
//
// Six boards, because there is no single number that everyone in this game is
// playing for: someone grinding lessons, someone who only plays Arcade, and
// someone collecting cosmetics are all doing well at different things, and one
// XP column tells the last two they are nobody. Each board answers "best at
// what?" out loud in its own subtitle.
//
// Reads /api/leaderboard?board=..., which returns name, level, XP, coins and
// the metric that board sorts by - and nothing else. The admin roster endpoint
// returns far more about each account and is deliberately not what this calls.
const PODIUM_STYLES = {
  1: {
    order: 'md:order-2',
    card: 'border-amber-300 bg-gradient-to-b from-amber-50 via-white to-white shadow-[0_18px_45px_-22px_rgba(161,98,7,0.55)] md:-translate-y-3 md:hover:-translate-y-4',
    badge: 'bg-amber-100 text-amber-800',
    avatar: 'ring-4 ring-amber-300',
    metric: 'bg-amber-100 text-amber-900',
    icon: 'text-amber-600',
  },
  2: {
    order: 'md:order-1',
    card: 'border-slate-300 bg-gradient-to-b from-slate-100 via-white to-white shadow-[0_14px_35px_-24px_rgba(51,65,85,0.5)]',
    badge: 'bg-slate-200 text-slate-700',
    avatar: 'ring-4 ring-slate-300',
    metric: 'bg-slate-100 text-slate-800',
    icon: 'text-slate-500',
  },
  3: {
    order: 'md:order-3',
    card: 'border-orange-200 bg-gradient-to-b from-orange-50 via-white to-white shadow-[0_14px_35px_-24px_rgba(154,52,18,0.45)]',
    badge: 'bg-orange-100 text-orange-800',
    avatar: 'ring-4 ring-orange-200',
    metric: 'bg-orange-100 text-orange-900',
    icon: 'text-orange-700',
  },
};

function playerDetail(board, row, lb) {
  return board.detail?.(row) || lb('levelCoins', { level: row.level, coins: row.coins });
}

function PodiumCard({ row, board, isMe, lb }) {
  const style = PODIUM_STYLES[row.rank];
  const Card = row.user_id ? Link : 'div';

  return (
    <Card
      {...(row.user_id ? { to: `/profile/${row.user_id}` } : {})}
      aria-label={row.user_id ? lb('viewProfileOfRank', { name: row.username, rank: row.rank }) : undefined}
      className={`group relative flex min-w-0 flex-col items-center rounded-3xl border-2 px-4 pb-5 pt-6 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pysim-primary ${style.order} ${style.card}`}
    >
      <span className={`absolute -top-3 rounded-full px-4 py-1 text-xs font-black shadow-sm ${style.badge}`}>
        {lb('rank', { rank: row.rank })}
      </span>
      {row.rank === 1
        ? <Crown size={30} className={`mb-4 ${style.icon}`} aria-hidden="true" />
        : <Medal size={28} className={`mb-4 ${style.icon}`} aria-hidden="true" />}
      <div className={`mb-4 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-3xl font-black text-pysim-primary ${style.avatar}`}>
        {row.avatar?.url
          ? <img src={assetUrl(row.avatar.url)} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          : <span aria-hidden="true">{row.username?.slice(0, 1).toUpperCase() || '?'}</span>}
      </div>
      <span className={`max-w-full truncate text-base font-black ${isMe ? 'text-pysim-primary' : 'text-pysim-on-surface'}`}>
        {row.username}{isMe ? lb('you') : ''}
      </span>
      <span className="mt-1 min-h-8 text-xs leading-4 text-pysim-on-surface-variant">{playerDetail(board, row, lb)}</span>
      <span className={`mt-4 rounded-full px-4 py-2 text-sm font-black ${style.metric}`}>
        {board.format(row)}
      </span>
      {row.user_id && (
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-pysim-primary group-hover:underline">
          {lb('viewProfile')} <ChevronRight size={14} aria-hidden="true" />
        </span>
      )}
    </Card>
  );
}

// Board text comes from the locale files (Spec 0005 #13); the page was Thai
// even in English mode. `lb` is t() bound to the leaderboard namespace.
const BOARD_DEFS = [
    { key: 'xp', tone: 'text-emerald-600', format: (row) => `${row.metric.toLocaleString()} XP` },
    { key: 'level', tone: 'text-indigo-600', format: (row, lb) => lb('boards.level.format', { value: row.metric }) },
    {
        key: 'arcade_winrate', tone: 'text-rose-600', format: (row) => `${row.metric}%`,
        detail: (row, lb) => (row.metric_detail
            ? lb('boards.arcade_winrate.detail', { wins: row.metric_detail.wins, matches: row.metric_detail.matches })
            : null),
    },
    { key: 'competitive', tone: 'text-blue-600', format: (row, lb) => lb('boards.competitive.format', { value: row.metric }) },
    { key: 'coins', tone: 'text-amber-600', format: (row) => `🪙 ${row.metric.toLocaleString()}` },
    { key: 'cosmetics', tone: 'text-purple-600', format: (row, lb) => lb('boards.cosmetics.format', { value: row.metric }) },
];

function boardsFor(lb) {
    return BOARD_DEFS.map((def) => ({
        ...def,
        tab: lb(`boards.${def.key}.tab`),
        title: lb(`boards.${def.key}.title`),
        subtitle: lb(`boards.${def.key}.subtitle`),
        empty: lb(`boards.${def.key}.empty`),
        format: (row) => def.format(row, lb),
        detail: def.detail ? (row) => def.detail(row, lb) : undefined,
    }));
}

export default function LeaderboardPage({ user }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const lb = useCallback((key, options) => t(`leaderboard.${key}`, options), [t]);
    const BOARDS = boardsFor(lb);
    const [boardKey, setBoardKey] = useState('xp');
    const [rows, setRows] = useState([]);
    const [minMatches, setMinMatches] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const requestId = useRef(0);

    const board = BOARDS.find((b) => b.key === boardKey) || BOARDS[0];

    // Split so the effect never calls setState in its own body: `loading` is
    // already true before the first fetch, and only switching tabs or pressing
    // refresh - both event handlers, where a synchronous setState is fine -
    // has to put it back.
    const fetchRows = useCallback((key) => {
        const request = ++requestId.current;
        return loadLeaderboard(key)
        .then((data) => {
            if (request !== requestId.current) return;
            setError('');
            setRows(data.rows);
            setMinMatches(data?.minMatches ?? null);
            setLoading(false);
        })
        .catch((loadError) => {
            if (request !== requestId.current) return;
            setError(loadError.message || lb('loadFailed'));
            setLoading(false);
        });
    }, [lb]);

    useEffect(() => { fetchRows(boardKey); }, [boardKey, fetchRows]);

    const reload = () => {
        setLoading(true);
        setError('');
        fetchRows(boardKey);
    };

    const switchBoard = (key) => {
        if (key === boardKey) return;
        requestId.current += 1;
        setLoading(true);
        setError('');
        setRows([]);
        setBoardKey(key);
    };

    const myName = user?.username;

    return (
        <div className="min-h-screen bg-pysim-surface">
            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">

                <button
                    onClick={() => navigate('/learn')}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-pysim-on-surface-variant hover:text-pysim-on-surface"
                >
                    <ArrowLeft size={16} /> {lb('back')}
                </button>

                <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 python-gradient rounded-lg flex items-center justify-center">
                            <Trophy size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-pysim-on-surface tracking-tight">{lb('title')}</h1>
                            <p className="text-sm text-pysim-on-surface-variant">{board.title}</p>
                        </div>
                    </div>

                    <button
                        onClick={reload}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                        <RefreshCw size={14} /> {lb('refresh')}
                    </button>
                </div>

                {/* Category picker. Scrolls sideways on a narrow screen rather
                    than wrapping into a block of buttons taller than the table. */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-3">
                    {BOARDS.map((b) => (
                        <button
                            key={b.key}
                            onClick={() => switchBoard(b.key)}
                            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors border
                                ${b.key === boardKey
                                    ? 'bg-pysim-primary text-white border-pysim-primary'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            {b.tab}
                        </button>
                    ))}
                </div>

                <p className="text-[11px] text-pysim-on-surface-variant mb-4 leading-relaxed">
                    {board.subtitle}
                    {board.key === 'arcade_winrate' && minMatches
                        ? lb('minMatches', { count: minMatches })
                        : ''}
                </p>

                {loading && (
                    <SkeletonLoading variant="list" label={lb('loading')} />
                )}

                {!loading && error && (
                    <div className="bg-white rounded-xl whisper-shadow p-10 text-center text-sm text-rose-600">{error}</div>
                )}

                {!loading && !error && rows.length === 0 && (
                    <div className="bg-white rounded-xl whisper-shadow p-10 text-center text-sm text-pysim-on-surface-variant">
                        {board.empty}
                    </div>
                )}

                {!loading && !error && rows.length > 0 && (
                  <>
                    <section aria-label={lb('topThree')} className="mb-9 pt-4">
                      <div className="mb-6 flex items-center gap-2 text-pysim-on-surface">
                        <Trophy size={18} className="text-amber-600" aria-hidden="true" />
                        <h2 className="text-lg font-black">{lb('topPlayers')}</h2>
                      </div>
                      <div className="grid gap-5 md:grid-cols-3 md:items-end">
                        {rows.filter((row) => row.rank <= 3).map((row) => (
                          <PodiumCard
                            key={`${boardKey}-${row.rank}`}
                            row={row}
                            board={board}
                            isMe={Boolean(myName && row.username === myName)}
                            lb={lb}
                          />
                        ))}
                      </div>
                    </section>
                    {rows.length > 3 && (
                      <section aria-label={lb('nextRanks')}>
                        <h2 className="mb-3 text-sm font-black text-pysim-on-surface-variant">{lb('nextRanks')}</h2>
                        <div className="bg-white rounded-xl whisper-shadow overflow-hidden">
                          {rows.filter((row) => row.rank > 3).map((row) => {
                            const isMe = myName && row.username === myName;
                            const Row = row.user_id ? Link : 'div';
                            return (
                              <Row
                                to={row.user_id ? `/profile/${row.user_id}` : undefined}
                                aria-label={row.user_id ? lb('viewProfileOf', { name: row.username }) : undefined}
                                key={`${boardKey}-${row.rank}`}
                                className={`flex items-center gap-3 px-3 sm:px-5 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sky-600
                                  ${isMe ? 'bg-pysim-primary/5' : ''}`}
                              >
                                <span className="w-10 text-center text-sm font-black text-slate-400">
                                  #{row.rank}
                                </span>

                                {row.avatar?.url && (
                                  <img
                                    src={assetUrl(row.avatar.url)}
                                    alt=""
                                    referrerPolicy="no-referrer"
                                    className="h-9 w-9 shrink-0 rounded-full bg-pysim-surface-low object-cover"
                                  />
                                )}

                                <div className="flex-1 min-w-0">
                                  <span className={`block truncate text-sm ${isMe ? 'font-black text-pysim-primary' : 'font-bold text-pysim-on-surface'}`}>
                                    {row.username}{isMe ? lb('you') : ''}
                                  </span>
                                  <span className="block text-[11px] text-pysim-on-surface-variant">
                                    {playerDetail(board, row, lb)}
                                  </span>
                                </div>

                                <span className={`text-sm font-black whitespace-nowrap ${board.tone}`}>
                                  {board.format(row)}
                                </span>
                              </Row>
                            );
                          })}
                        </div>
                      </section>
                    )}
                  </>
                )}

            </div>
        </div>
    );
}
