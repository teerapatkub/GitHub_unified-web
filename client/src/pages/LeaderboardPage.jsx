import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, RefreshCw } from 'lucide-react';

// The learner-facing leaderboard, opened from the main menu's Leaderboard card.
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
const MEDALS = ['🥇', '🥈', '🥉'];

const BOARDS = [
    {
        key: 'xp',
        tab: 'XP รวม',
        title: 'สะสม XP มากที่สุด',
        subtitle: 'นับ XP จากทุกโหมดรวมกัน ทั้งบทเรียน แบบฝึกหัด และการแข่ง',
        format: (row) => `${row.metric.toLocaleString()} XP`,
        tone: 'text-emerald-600',
        empty: 'ยังไม่มีใครเก็บ XP ได้เลย ลองเรียนบทแรกแล้วกลับมาดูใหม่',
    },
    {
        key: 'level',
        tab: 'เลเวล',
        title: 'เลเวลสูงที่สุด',
        subtitle: 'เลเวลเพิ่มขึ้นทุกครั้งที่ XP เต็มหลอด',
        format: (row) => `เลเวล ${row.metric}`,
        tone: 'text-indigo-600',
        empty: 'ยังไม่มีผู้เล่นในตาราง',
    },
    {
        key: 'arcade_winrate',
        tab: 'อัตราชนะ Arcade',
        title: 'อัตราชนะ Arcade สูงที่สุด',
        subtitle: 'นับเฉพาะคนที่เล่นครบตามจำนวนแมตช์ขั้นต่ำ เพื่อไม่ให้ชนะครั้งเดียวแล้วขึ้นอันดับหนึ่ง',
        format: (row) => `${row.metric}%`,
        detail: (row) => (row.metric_detail
            ? `ชนะ ${row.metric_detail.wins} จาก ${row.metric_detail.matches} แมตช์`
            : null),
        tone: 'text-rose-600',
        empty: 'ยังไม่มีใครเล่น Arcade ครบตามจำนวนแมตช์ขั้นต่ำ',
    },
    {
        key: 'competitive',
        tab: 'โจทย์ Competitive',
        title: 'ทำโจทย์ Competitive Arena ได้มากที่สุด',
        subtitle: 'นับจำนวนโจทย์ที่ไม่ซ้ำกัน ส่งข้อเดิมซ้ำไม่ได้นับเพิ่ม',
        format: (row) => `${row.metric} ข้อ`,
        tone: 'text-blue-600',
        empty: 'ยังไม่มีใครส่งคำตอบในโหมด Competitive Arena',
    },
    {
        key: 'coins',
        tab: 'เหรียญ',
        title: 'มีเหรียญมากที่สุด',
        subtitle: 'เหรียญที่ถืออยู่ตอนนี้ ไม่ใช่ยอดที่หามาได้ทั้งหมด — ซื้อของแล้วตัวเลขนี้จะลดลง',
        format: (row) => `🪙 ${row.metric.toLocaleString()}`,
        tone: 'text-amber-600',
        empty: 'ยังไม่มีใครมีเหรียญ',
    },
    {
        key: 'cosmetics',
        tab: 'ไอเทมตกแต่ง',
        title: 'ครอบครองไอเทมตกแต่งมากที่สุด',
        subtitle: 'นับชิ้นที่ซื้อไว้ในคลังจริง ทั้งธีม กรอบโปรไฟล์ และเอฟเฟกต์เมาส์',
        format: (row) => `${row.metric} ชิ้น`,
        tone: 'text-purple-600',
        empty: 'ยังไม่มีใครซื้อไอเทมตกแต่งเลย',
    },
];

export default function LeaderboardPage({ user }) {
    const navigate = useNavigate();
    const [boardKey, setBoardKey] = useState('xp');
    const [rows, setRows] = useState([]);
    const [minMatches, setMinMatches] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const board = BOARDS.find((b) => b.key === boardKey) || BOARDS[0];

    // Split so the effect never calls setState in its own body: `loading` is
    // already true before the first fetch, and only switching tabs or pressing
    // refresh - both event handlers, where a synchronous setState is fine -
    // has to put it back.
    const fetchRows = useCallback((key) => fetch(`/api/leaderboard?board=${key}&limit=20`)
        .then((res) => res.json())
        .then((data) => {
            setRows(Array.isArray(data?.rows) ? data.rows : []);
            setMinMatches(data?.minMatches ?? null);
            setLoading(false);
        })
        .catch(() => {
            setError('โหลดตารางอันดับไม่สำเร็จ ลองใหม่อีกครั้ง');
            setLoading(false);
        }), []);

    useEffect(() => { fetchRows(boardKey); }, [boardKey, fetchRows]);

    const reload = () => {
        setLoading(true);
        setError('');
        fetchRows(boardKey);
    };

    const switchBoard = (key) => {
        if (key === boardKey) return;
        setLoading(true);
        setError('');
        setRows([]);
        setBoardKey(key);
    };

    const myName = user?.username;

    return (
        <div className="min-h-screen bg-pysim-surface">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">

                <button
                    onClick={() => navigate('/menu')}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-pysim-on-surface-variant hover:text-pysim-on-surface"
                >
                    <ArrowLeft size={16} /> กลับไปหน้าหลัก
                </button>

                <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 python-gradient rounded-lg flex items-center justify-center">
                            <Trophy size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-pysim-on-surface tracking-tight">ตารางเกียรติยศ</h1>
                            <p className="text-sm text-pysim-on-surface-variant">{board.title}</p>
                        </div>
                    </div>

                    <button
                        onClick={reload}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                        <RefreshCw size={14} /> รีเฟรช
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
                        ? ` (ขั้นต่ำ ${minMatches} แมตช์)`
                        : ''}
                </p>

                {loading && (
                    <div className="bg-white rounded-xl whisper-shadow p-10 text-center text-sm text-pysim-on-surface-variant">
                        กำลังโหลด...
                    </div>
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
                    <div className="bg-white rounded-xl whisper-shadow overflow-hidden">
                        {rows.map((row) => {
                            const isMe = myName && row.username === myName;
                            const detail = board.detail?.(row);
                            return (
                                <div
                                    key={`${boardKey}-${row.rank}`}
                                    className={`flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0
                                        ${isMe ? 'bg-pysim-primary/5' : ''}`}
                                >
                                    <span className="w-10 text-center text-sm font-black text-slate-400">
                                        {MEDALS[row.rank - 1] || `#${row.rank}`}
                                    </span>

                                    <div className="flex-1 min-w-0">
                                        <span className={`block truncate text-sm ${isMe ? 'font-black text-pysim-primary' : 'font-bold text-pysim-on-surface'}`}>
                                            {row.username}{isMe ? ' (คุณ)' : ''}
                                        </span>
                                        <span className="block text-[11px] text-pysim-on-surface-variant">
                                            {detail || `เลเวล ${row.level} · 🪙 ${row.coins}`}
                                        </span>
                                    </div>

                                    <span className={`text-sm font-black whitespace-nowrap ${board.tone}`}>
                                        {board.format(row)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
}
