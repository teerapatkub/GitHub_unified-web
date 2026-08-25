import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Award,
    BookOpen,
    Coins,
    Flame,
    Gamepad2,
    Lock,
    Star,
    Target,
    Trophy,
    ArrowLeft,
    CheckCircle2,
    CircleDot,
    Circle,
} from 'lucide-react';
import { API_BASE } from '../config/api.js';


const SKILL_TIER_TH = {
    Beginner: 'ผู้เริ่มต้น',
    Intermediate: 'ระดับกลาง',
    Advanced: 'ระดับสูง',
};

const STATUS_META = {
    done: { label: 'เรียนจบแล้ว', icon: CheckCircle2, text: 'text-emerald-600', bg: 'bg-emerald-50' },
    in_progress: { label: 'กำลังเรียน', icon: CircleDot, text: 'text-amber-600', bg: 'bg-amber-50' },
    not_started: { label: 'ยังไม่เริ่ม', icon: Circle, text: 'text-slate-400', bg: 'bg-slate-50' },
};

const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
};

// A bar that always renders its track, so "0%" still reads as a measured zero
// rather than a component that failed to load.
const ProgressBar = ({ percent, className = '' }) => (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-pysim-surface-low ${className}`}>
        <div
            className="h-full rounded-full python-gradient transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, Number(percent) || 0))}%` }}
        />
    </div>
);

// `icon` is a rendered element rather than a component reference: this project's
// ESLint config has no React plugin, so an identifier used only inside JSX is
// reported as unused.
const StatTile = ({ icon, label, value, hint }) => (
    <div className="rounded-xl bg-white p-5 whisper-shadow">
        <div className="flex items-center gap-2 text-pysim-on-surface-variant">
            {icon}
            <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </div>
        <p className="mt-2 text-3xl font-black leading-none text-pysim-on-surface">{value}</p>
        {hint && <p className="mt-1 text-xs text-pysim-outline">{hint}</p>}
    </div>
);

export default function ProfilePage({ user: propUser }) {
    const navigate = useNavigate();
    const params = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAllLessons, setShowAllLessons] = useState(false);
    const [editingShowcase, setEditingShowcase] = useState(false);
    const [picked, setPicked] = useState([]);
    const [savingShowcase, setSavingShowcase] = useState(false);
    const [showcaseError, setShowcaseError] = useState('');

    // Viewing someone else's profile is just /profile/:userId; with no id it is
    // the signed-in player's own.
    const storedUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch {
            return null;
        }
    }, []);
    const userId = Number(params.userId || propUser?.user_id || storedUser?.user_id || 0);

    const load = useCallback(async () => {
        if (!userId) {
            setError('กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/api/profile/${userId}`);
            if (!res.ok) throw new Error(res.status === 404 ? 'ไม่พบผู้ใช้คนนี้' : 'โหลดโปรไฟล์ไม่สำเร็จ');
            setData(await res.json());
        } catch (err) {
            setError(err.message || 'โหลดโปรไฟล์ไม่สำเร็จ');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { load(); }, [load]);

    const startEditing = () => {
        setPicked((data?.achievements?.showcase || []).map(a => a.achievement_id));
        setShowcaseError('');
        setEditingShowcase(true);
    };

    const togglePick = (id, max) => {
        setShowcaseError('');
        setPicked((current) => {
            if (current.includes(id)) return current.filter(x => x !== id);
            if (current.length >= max) {
                setShowcaseError(`เลือกได้สูงสุด ${max} รายการ`);
                return current;
            }
            return [...current, id];
        });
    };

    const saveShowcase = async () => {
        setSavingShowcase(true);
        setShowcaseError('');
        try {
            const res = await fetch(`${API_BASE}/api/profile/${userId}/showcase`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ achievement_ids: picked }),
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || 'บันทึกไม่สำเร็จ');
            setEditingShowcase(false);
            await load();
        } catch (err) {
            setShowcaseError(err.message || 'บันทึกไม่สำเร็จ');
        } finally {
            setSavingShowcase(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-pysim-surface px-4 py-16 text-center text-sm font-semibold text-pysim-outline">
                กำลังโหลดโปรไฟล์...
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-pysim-surface px-4 py-16">
                <div className="mx-auto max-w-md rounded-xl bg-white p-8 text-center whisper-shadow">
                    <p className="text-sm font-bold text-red-600">{error || 'โหลดโปรไฟล์ไม่สำเร็จ'}</p>
                    <button
                        onClick={() => navigate('/learn')}
                        className="mt-5 rounded-lg python-gradient px-6 py-2.5 text-sm font-bold text-white"
                    >
                        กลับหน้าบทเรียน
                    </button>
                </div>
            </div>
        );
    }

    const { user, progression, learning, achievements, arcade } = data;
    const current = learning.summary.current_lesson;
    const lessons = showAllLessons ? learning.lessons : learning.lessons.filter(l => l.status !== 'not_started');
    const initial = String(user.username || '?').trim().charAt(0).toUpperCase();
    const isOwner = Number(storedUser?.user_id) === Number(user.user_id);
    const maxShowcase = achievements.max_showcase || 6;
    // Nothing pinned yet falls back to the most recent unlocks, so a profile
    // with achievements never looks empty just because nobody chose any.
    const unlockedItems = achievements.items.filter(a => a.unlocked);
    const showcase = achievements.showcase.length > 0
        ? achievements.showcase
        : unlockedItems.slice(0, maxShowcase);

    return (
        <div className="min-h-screen bg-pysim-surface">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">

                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-pysim-on-surface-variant hover:text-pysim-on-surface"
                >
                    <ArrowLeft size={16} /> ย้อนกลับ
                </button>

                {/* ---------- identity ---------- */}
                <div className="rounded-2xl bg-white p-6 whisper-shadow sm:p-8">
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                        <div className="relative h-28 w-28 shrink-0">
                            <div className="absolute inset-[14px] flex items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-3xl font-black text-white">
                                {initial}
                            </div>
                            {/* The equipped profile frame, drawn around the avatar rather
                                than replacing it — every frame has a transparent centre. */}
                            {user.profile_frame_url && (
                                <img src={user.profile_frame_url} alt="" className="pointer-events-none absolute inset-0 h-full w-full" />
                            )}
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                                <h1 className="text-3xl font-black text-pysim-on-surface">{user.username}</h1>
                                <span className="rounded-full bg-pysim-primary/10 px-3 py-1 text-xs font-black text-pysim-primary">
                                    {SKILL_TIER_TH[progression.skill_tier] || progression.skill_tier}
                                </span>
                                {user.role === 'admin' && (
                                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-black text-white">แอดมิน</span>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-pysim-on-surface-variant">
                                สมาชิกตั้งแต่ {formatDate(user.created_at)}
                            </p>

                            <div className="mt-5">
                                <div className="flex items-end justify-between gap-3">
                                    <span className="text-sm font-black text-pysim-on-surface">
                                        เลเวล {progression.level}
                                    </span>
                                    <span className="text-xs font-bold text-pysim-outline">
                                        {progression.xp_into_level} / {progression.xp_needed_this_level} XP
                                    </span>
                                </div>
                                <ProgressBar percent={progression.xp_percent} className="mt-2" />
                            </div>

                            <div className="mt-5 flex flex-wrap justify-center gap-4 sm:justify-start">
                                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600">
                                    <Coins size={16} /> {user.virtual_currency.toLocaleString()} ทอง
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-500">
                                    <Flame size={16} /> ต่อเนื่อง {progression.streak_days} วัน
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-pysim-on-surface-variant">
                                    <Star size={16} /> {progression.xp.toLocaleString()} XP สะสม
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ---------- headline numbers ---------- */}
                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatTile
                        icon={<BookOpen size={16} className="text-pysim-primary" />} label="บทเรียนที่จบ"
                        value={`${learning.summary.lessons_done}/${learning.summary.lessons_total}`}
                        hint={`กำลังเรียนอยู่ ${learning.summary.lessons_in_progress} บท`}
                    />
                    <StatTile
                        icon={<Target size={16} className="text-emerald-500" />} label="แบบฝึกหัดที่ผ่าน"
                        value={`${learning.summary.exercises_passed}/${learning.summary.exercises_total}`}
                        hint={`ความคืบหน้ารวม ${learning.summary.percent}%`}
                    />
                    <StatTile
                        icon={<Gamepad2 size={16} className="text-violet-500" />} label="เล่น Arcade"
                        value={arcade.matches_played}
                        hint={`ชนะ ${arcade.wins} · แพ้ ${arcade.losses}`}
                    />
                    <StatTile
                        icon={<Trophy size={16} className="text-amber-500" />} label="อัตราการชนะ"
                        value={`${arcade.win_rate}%`}
                        hint={arcade.best_rank ? `อันดับดีที่สุด #${arcade.best_rank}` : 'ยังไม่มีสถิติ'}
                    />
                </div>

                {/* ---------- currently studying ---------- */}
                {current && (
                    <div className="mt-6 rounded-2xl bg-white p-6 whisper-shadow">
                        <h2 className="text-xs font-black uppercase tracking-widest text-pysim-outline">กำลังเรียน</h2>
                        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                            <div className="min-w-0">
                                <p className="truncate text-xl font-black text-pysim-on-surface">{current.title}</p>
                                <p className="mt-1 text-xs text-pysim-on-surface-variant">
                                    แบบทดสอบก่อนเรียน {current.pre_score ? `${current.pre_score.score}/${current.pre_score.total}` : 'ยังไม่ทำ'}
                                    {' · '}
                                    หลังเรียน {current.post_score ? `${current.post_score.score}/${current.post_score.total}` : 'ยังไม่ทำ'}
                                    {' · '}
                                    แบบฝึกหัด {current.exercises_passed}/{current.exercises_total}
                                </p>
                            </div>
                            <span className="text-3xl font-black text-pysim-primary">{current.percent}%</span>
                        </div>
                        <ProgressBar percent={current.percent} className="mt-4" />
                        <button
                            onClick={() => navigate(`/lesson/${current.lesson_id}`)}
                            className="mt-5 rounded-lg python-gradient px-6 py-2.5 text-sm font-bold text-white"
                        >
                            เรียนต่อ
                        </button>
                    </div>
                )}

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* ---------- progress per module ---------- */}
                    <div className="rounded-2xl bg-white p-6 whisper-shadow">
                        <h2 className="text-lg font-black text-pysim-on-surface">ความคืบหน้าตามหมวด</h2>
                        <div className="mt-4 space-y-4">
                            {learning.modules.map((m) => (
                                <div key={m.module_id}>
                                    <div className="flex items-baseline justify-between gap-3">
                                        <p className="min-w-0 truncate text-sm font-bold text-pysim-on-surface">{m.title}</p>
                                        <span className="shrink-0 text-xs font-bold text-pysim-outline">
                                            {m.lessons_done}/{m.lessons_total} บท · {m.percent}%
                                        </span>
                                    </div>
                                    <ProgressBar percent={m.percent} className="mt-1.5" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ---------- arcade record ---------- */}
                    <div className="rounded-2xl bg-white p-6 whisper-shadow">
                        <h2 className="text-lg font-black text-pysim-on-surface">ประวัติการเล่น Arcade</h2>
                        {arcade.recent_matches.length === 0 ? (
                            <p className="mt-4 text-sm text-pysim-outline">ยังไม่มีแมตช์ที่เล่นจบ</p>
                        ) : (
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="text-pysim-outline">
                                        <tr>
                                            <th className="pb-2 font-bold">ห้อง</th>
                                            <th className="pb-2 font-bold">ระดับ</th>
                                            <th className="pb-2 text-right font-bold">คะแนน</th>
                                            <th className="pb-2 text-right font-bold">เทสต์</th>
                                            <th className="pb-2 text-right font-bold">เมื่อ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-pysim-on-surface">
                                        {arcade.recent_matches.map((m) => (
                                            <tr key={m.room_id} className="border-t border-pysim-outline/10">
                                                <td className="py-2 font-mono font-bold">{m.room_code}</td>
                                                <td className="py-2">
                                                    {m.difficulty || '-'}
                                                    <span className="text-pysim-outline"> · {m.round_duration_mode || '-'}</span>
                                                </td>
                                                <td className="py-2 text-right font-bold">{m.match_score}</td>
                                                <td className="py-2 text-right">{m.tests_passed}/{m.tests_total}</td>
                                                <td className="py-2 text-right text-pysim-outline">{formatDate(m.ended_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <p className="mt-4 text-xs text-pysim-outline">
                            คะแนนสะสมทั้งหมด {arcade.total_score.toLocaleString()} · Survival Cash สะสม {arcade.total_cash_earned.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* ---------- lesson by lesson ---------- */}
                <div className="mt-6 rounded-2xl bg-white p-6 whisper-shadow">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-black text-pysim-on-surface">บทเรียนทั้งหมด</h2>
                        <button
                            onClick={() => setShowAllLessons(v => !v)}
                            className="rounded-lg bg-pysim-surface-low px-4 py-2 text-xs font-bold text-pysim-on-surface-variant hover:bg-pysim-surface"
                        >
                            {showAllLessons ? 'ซ่อนบทที่ยังไม่เริ่ม' : `แสดงทั้งหมด (${learning.lessons.length} บท)`}
                        </button>
                    </div>

                    {lessons.length === 0 ? (
                        <p className="mt-4 text-sm text-pysim-outline">ยังไม่ได้เริ่มบทเรียนไหนเลย</p>
                    ) : (
                        <div className="mt-4 space-y-2">
                            {lessons.map((l) => {
                                const meta = STATUS_META[l.status] || STATUS_META.not_started;
                                const Icon = meta.icon;
                                return (
                                    <button
                                        key={l.lesson_id}
                                        onClick={() => navigate(`/lesson/${l.lesson_id}`)}
                                        className="flex w-full items-center gap-4 rounded-xl border border-pysim-outline/10 p-3 text-left transition-colors hover:bg-pysim-surface-low"
                                    >
                                        <span className={`shrink-0 rounded-lg p-2 ${meta.bg} ${meta.text}`}>
                                            <Icon size={16} />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-bold text-pysim-on-surface">{l.title}</span>
                                            <span className="block text-xs text-pysim-outline">
                                                {meta.label} · แบบฝึกหัด {l.exercises_passed}/{l.exercises_total}
                                            </span>
                                        </span>
                                        <span className="w-28 shrink-0">
                                            <ProgressBar percent={l.percent} />
                                        </span>
                                        <span className="w-12 shrink-0 text-right text-sm font-black text-pysim-on-surface">
                                            {l.percent}%
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ---------- achievements ---------- */}
                <div className="mt-6 rounded-2xl bg-white p-6 whisper-shadow">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h2 className="text-lg font-black text-pysim-on-surface">ความสำเร็จ</h2>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-pysim-on-surface-variant">
                                ปลดล็อกแล้ว {achievements.unlocked} / {achievements.total}
                            </span>
                            {isOwner && !editingShowcase && unlockedItems.length > 0 && (
                                <button
                                    onClick={startEditing}
                                    className="rounded-lg bg-pysim-surface-low px-4 py-2 text-xs font-bold text-pysim-on-surface-variant hover:bg-pysim-surface"
                                >
                                    เลือกที่จะโชว์
                                </button>
                            )}
                        </div>
                    </div>
                    <ProgressBar
                        percent={achievements.total ? (achievements.unlocked / achievements.total) * 100 : 0}
                        className="mt-3"
                    />

                    {/* Picking mode lists only what has been unlocked — the rest
                        cannot be pinned, so offering them would only mislead. */}
                    {editingShowcase ? (
                        <div className="mt-5">
                            <p className="text-sm text-pysim-on-surface-variant">
                                เลือกได้สูงสุด {maxShowcase} รายการ — เลือกแล้ว {picked.length}
                            </p>
                            {showcaseError && (
                                <p className="mt-2 text-sm font-bold text-red-600">{showcaseError}</p>
                            )}
                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {unlockedItems.map((a) => {
                                    const on = picked.includes(a.achievement_id);
                                    return (
                                        <button
                                            key={a.achievement_id}
                                            onClick={() => togglePick(a.achievement_id, maxShowcase)}
                                            className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
                                                on ? 'border-pysim-primary bg-pysim-primary/5' : 'border-pysim-outline/10 hover:bg-pysim-surface-low'
                                            }`}
                                        >
                                            <span className="shrink-0 text-2xl">{a.icon}</span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-bold text-pysim-on-surface">{a.name}</span>
                                                <span className="block text-[11px] text-pysim-outline">
                                                    {on ? `โชว์เป็นลำดับที่ ${picked.indexOf(a.achievement_id) + 1}` : 'แตะเพื่อเลือก'}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-5 flex flex-wrap gap-3">
                                <button
                                    onClick={saveShowcase}
                                    disabled={savingShowcase}
                                    className="rounded-lg python-gradient px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                                >
                                    {savingShowcase ? 'กำลังบันทึก...' : 'บันทึก'}
                                </button>
                                <button
                                    onClick={() => setEditingShowcase(false)}
                                    className="rounded-lg bg-pysim-surface-low px-6 py-2.5 text-sm font-bold text-pysim-on-surface-variant"
                                >
                                    ยกเลิก
                                </button>
                                {picked.length > 0 && (
                                    <button
                                        onClick={() => setPicked([])}
                                        className="rounded-lg px-4 py-2.5 text-sm font-bold text-pysim-outline hover:text-pysim-on-surface"
                                    >
                                        ล้างที่เลือก
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {showcase.length > 0 && (
                                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {showcase.map((a) => (
                                        <div
                                            key={a.achievement_id}
                                            className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4"
                                        >
                                            <span className="shrink-0 text-2xl">{a.icon}</span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold text-pysim-on-surface">{a.name}</p>
                                                {a.description && (
                                                    <p className="mt-0.5 line-clamp-2 text-xs text-pysim-on-surface-variant">{a.description}</p>
                                                )}
                                                <p className="mt-1 text-[11px] text-pysim-outline">
                                                    ปลดล็อก {formatDate(a.unlocked_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {showcase.length === 0 && (
                                <p className="mt-5 text-sm text-pysim-outline">ยังไม่ได้ปลดล็อกความสำเร็จใดเลย</p>
                            )}

                            <details className="mt-6">
                                <summary className="cursor-pointer text-sm font-bold text-pysim-on-surface-variant hover:text-pysim-on-surface">
                                    ดูความสำเร็จทั้งหมด {achievements.total} รายการ
                                </summary>
                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {achievements.items.map((a) => (
                                        <div
                                            key={a.achievement_id}
                                            className={`flex items-start gap-3 rounded-xl border p-4 ${
                                                a.unlocked
                                                    ? 'border-amber-200 bg-amber-50/60'
                                                    : 'border-pysim-outline/10 bg-pysim-surface-low/50'
                                            }`}
                                        >
                                            <span className={`shrink-0 rounded-lg p-2 ${a.unlocked ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {a.unlocked ? <Award size={16} /> : <Lock size={16} />}
                                            </span>
                                            <div className="min-w-0">
                                                <p className={`truncate text-sm font-bold ${a.unlocked ? 'text-pysim-on-surface' : 'text-pysim-outline'}`}>
                                                    {a.name}
                                                </p>
                                                {a.description && (
                                                    <p className="mt-0.5 line-clamp-2 text-xs text-pysim-on-surface-variant">{a.description}</p>
                                                )}
                                                <p className="mt-1 text-[11px] text-pysim-outline">
                                                    {a.unlocked ? `ปลดล็อก ${formatDate(a.unlocked_at)}` : `รางวัล ${a.reward} · ${a.difficulty}`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
