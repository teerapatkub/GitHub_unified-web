import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, RefreshCw } from 'lucide-react';

// The learner-facing leaderboard, opened from the main menu's Leaderboard card.
//
// Ranked by XP rather than by any one mode's score: XP is earned in lessons,
// exercises, mini-games and matches alike, so it is the only number that means
// the same thing to everyone reading the table. The Competitive Arena keeps its
// own board for its own scores.
//
// Reads /api/leaderboard, which returns name, level, XP and coins and nothing
// else. The admin roster endpoint returns far more about each account and is
// deliberately not what this page calls.
const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage({ user }) {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Split so the effect never calls setState in its own body: `loading` is
    // already true on the first render, and only the refresh button - an event
    // handler, where a synchronous setState is fine - has to put it back.
    const fetchRows = () => fetch('/api/leaderboard?limit=20')
        .then((res) => res.json())
        .then((data) => {
            setRows(Array.isArray(data) ? data : []);
            setLoading(false);
        })
        .catch(() => {
            setError('โหลดตารางอันดับไม่สำเร็จ ลองใหม่อีกครั้ง');
            setLoading(false);
        });

    const load = () => {
        setLoading(true);
        setError('');
        fetchRows();
    };

    useEffect(() => { fetchRows(); }, []);

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

                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 python-gradient rounded-lg flex items-center justify-center">
                            <Trophy size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-pysim-on-surface tracking-tight">ตารางเกียรติยศ</h1>
                            <p className="text-sm text-pysim-on-surface-variant">
                                จัดอันดับจาก XP ที่สะสมได้จากทุกโหมด
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={load}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                        <RefreshCw size={14} /> รีเฟรช
                    </button>
                </div>

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
                        ยังไม่มีใครเก็บ XP ได้เลย ลองเรียนบทแรกแล้วกลับมาดูใหม่
                    </div>
                )}

                {!loading && !error && rows.length > 0 && (
                    <div className="bg-white rounded-xl whisper-shadow overflow-hidden">
                        {rows.map((row) => {
                            const isMe = myName && row.username === myName;
                            return (
                                <div
                                    key={row.rank}
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
                                            เลเวล {row.level} · 🪙 {row.coins}
                                        </span>
                                    </div>

                                    <span className="text-sm font-black text-emerald-600 whitespace-nowrap">
                                        {row.xp} XP
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
