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
import ProfileAppearance from '../components/ProfileAppearance';
import { assetUrl } from '../config/api.js';
import { requestJson } from '../config/api-client.js';
import SkeletonLoading from '../components/ui/Skeleton.jsx';
import { useTranslation } from 'react-i18next';


// Labels live in the locale files under `profile` (Spec 0005 #13).
const STATUS_META = {
    done: { icon: CheckCircle2, text: 'text-emerald-600', bg: 'bg-emerald-50' },
    in_progress: { icon: CircleDot, text: 'text-amber-600', bg: 'bg-amber-50' },
    not_started: { icon: Circle, text: 'text-slate-400', bg: 'bg-slate-50' },
};

const formatDate = (value, lang = 'th') => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
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

export default function ProfilePage({ user: propUser, onUserRefresh }) {
    const navigate = useNavigate();
    const params = useParams();
    const { t, i18n } = useTranslation();
    const lang = i18n.language === 'en' ? 'en' : 'th';
    const p = (key, options) => t(`profile.${key}`, options);
    // Error states hold a locale key ("profile.…") when the message is ours, or
    // the server's own text; tx() renders either.
    const tx = (value) => (typeof value === 'string' && value.startsWith('profile.') ? t(value) : value);
    const fmt = (value) => formatDate(value, lang);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAllLessons, setShowAllLessons] = useState(false);
    const [editingShowcase, setEditingShowcase] = useState(false);
    const [picked, setPicked] = useState([]);
    const [savingShowcase, setSavingShowcase] = useState(false);
    const [showcaseError, setShowcaseError] = useState('');
    const [avatarBusy, setAvatarBusy] = useState(false);
    const [avatarError, setAvatarError] = useState('');
    const [historyTab, setHistoryTab] = useState('arcade');
    const [compHistory, setCompHistory] = useState(null);
    const [compLoading, setCompLoading] = useState(false);
    const [compError, setCompError] = useState('');
    const [compRetry, setCompRetry] = useState(0);

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
            setError('profile.errors.signInToView');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const profile = await requestJson(`/api/profile/${userId}`);
            if (!profile?.user || !profile?.learning || !profile?.achievements || !profile?.arcade) {
                throw new Error('Invalid profile response');
            }
            setData(profile);
        } catch (err) {
            setError(err.status === 404 ? 'profile.errors.notFound'
                : err.kind === 'unauthorized' ? 'profile.errors.signInAgain' : 'profile.errors.loadFailed');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { load(); }, [load]);

    // Competitive history is its own endpoint and only fetched when the tab is
    // opened, so a profile that never looks at it costs nothing extra.
    useEffect(() => {
        if (historyTab !== 'competitive' || compHistory !== null || !userId) return;
        let cancelled = false;
        setCompLoading(true);
        requestJson(`/api/competitive/players/${userId}/history`)
            .then(d => {
                if (!Array.isArray(d?.history)) throw new Error('Invalid history response');
                if (!cancelled) { setCompHistory(d.history); setCompError(''); }
            })
            .catch(error => {
                if (!cancelled) setCompError(error.kind === 'unauthorized'
                    ? 'profile.errors.signInAgain' : 'profile.errors.competitiveFailed');
            })
            .finally(() => { if (!cancelled) setCompLoading(false); });
        return () => { cancelled = true; };
    }, [historyTab, compHistory, userId, compRetry]);

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
                setShowcaseError(p('errors.showcaseMax', { max }));
                return current;
            }
            return [...current, id];
        });
    };

    const saveShowcase = async () => {
        setSavingShowcase(true);
        setShowcaseError('');
        try {
            await requestJson(`/api/profile/${userId}/showcase`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ achievement_ids: picked }),
            });
            setEditingShowcase(false);
            await load();
        } catch (err) {
            setShowcaseError(err.detail || 'profile.errors.saveFailed');
        } finally {
            setSavingShowcase(false);
        }
    };

    // Select and reset are the same shape: POST, then reload the profile and ask
    // the navbar to refresh so the new picture shows everywhere at once. Only the
    // request and the failure wording differ, so they share one runner.
    const runAvatarChange = async (request, failMessage) => {
        setAvatarBusy(true);
        setAvatarError('');
        try {
            await request();
            await load();
            onUserRefresh?.();
        } catch (err) {
            setAvatarError(err.detail || failMessage);
        } finally {
            setAvatarBusy(false);
        }
    };

    const handleAvatarReset = () => runAvatarChange(
        () => requestJson(`/api/profile/${userId}/avatar/reset`, { method: 'POST' }),
        'profile.errors.resetPictureFailed');

    // Picking a picture the player already has. "Back to default" is the reset
    // route; the rest go through the select route with their source (and, for a
    // shop picture, the itemId the server checks ownership of).
    const handleSelectOption = (opt) => {
        if (opt.selected) return;
        if (opt.source === 'default') { handleAvatarReset(); return; }
        runAvatarChange(
            () => requestJson(`/api/profile/${userId}/avatar/select`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source: opt.source, itemId: opt.itemId }),
            }),
            'profile.errors.selectPictureFailed');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-pysim-surface px-4 py-8">
                <SkeletonLoading variant="profile" label={p('loading')} className="mx-auto max-w-5xl" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-pysim-surface px-4 py-16">
                <div className="mx-auto max-w-md rounded-xl bg-white p-8 text-center whisper-shadow">
                    <p className="text-sm font-bold text-red-600">{tx(error) || p('errors.loadFailed')}</p>
                    <button
                        onClick={() => navigate('/learn')}
                        className="mt-5 rounded-lg python-gradient px-6 py-2.5 text-sm font-bold text-white"
                    >
                        {p('backToLessons')}
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
        <ProfileAppearance user={user}>
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">

                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-pysim-on-surface-variant hover:text-pysim-on-surface"
                >
                    <ArrowLeft size={16} /> {p('back')}
                </button>

                {/* ---------- identity ---------- */}
                <div className="rounded-2xl bg-white p-6 whisper-shadow sm:p-8">
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                        <div className="flex flex-col items-center gap-2 shrink-0">
                            <div className="relative h-28 w-28">
                                {/* The resolved profile picture: whatever the user chose, or a
                                    level-based default the server picked. The server always
                                    sends a url, so the initials only show if that ever fails. */}
                                {user.avatar?.url ? (
                                    <img
                                        src={assetUrl(user.avatar.url)}
                                        alt=""
                                        referrerPolicy="no-referrer"
                                        className="absolute inset-[14px] h-[calc(100%-28px)] w-[calc(100%-28px)] rounded-full bg-pysim-surface-low object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-[14px] flex items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-3xl font-black text-white">
                                        {initial}
                                    </div>
                                )}
                                {/* The equipped profile frame, drawn around the avatar rather
                                    than replacing it — every frame has a transparent centre. */}
                                {user.profile_frame_url && (
                                    <img src={assetUrl(user.profile_frame_url)} alt="" className="pointer-events-none absolute inset-0 h-full w-full" />
                                )}
                            </div>

                            {/* Only the owner can change their own picture. The picker
                                shows every picture they can switch to: the level
                                default, Google, and pictures from the shop or
                                achievements. Players cannot upload their own. */}
                            {isOwner && (
                                <div className="flex flex-col items-center gap-2">
                                    {user.avatar_options?.length > 1 && (
                                        <div className="flex max-w-[13rem] flex-wrap justify-center gap-2">
                                            {user.avatar_options.map((opt) => (
                                                <button
                                                    key={`${opt.source}-${opt.itemId || opt.url}`}
                                                    onClick={() => handleSelectOption(opt)}
                                                    disabled={avatarBusy}
                                                    title={opt.label}
                                                    className={`h-11 w-11 overflow-hidden rounded-full border-2 transition disabled:opacity-60 ${opt.selected ? 'border-pysim-primary ring-2 ring-pysim-primary/30' : 'border-transparent hover:border-pysim-outline/40'}`}
                                                >
                                                    {/* Google's picture host refuses requests that carry a Referer. */}
                                                    <img src={assetUrl(opt.url)} alt={opt.label} referrerPolicy="no-referrer" className="h-full w-full bg-pysim-surface-low object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {avatarError && <p className="max-w-[12rem] text-center text-[11px] font-semibold text-red-500">{tx(avatarError)}</p>}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                                <h1 className="text-3xl font-black text-pysim-on-surface">{user.username}</h1>
                                <span className="rounded-full bg-pysim-primary/10 px-3 py-1 text-xs font-black text-pysim-primary">
                                    {p(`tier.${progression.skill_tier}`, { defaultValue: progression.skill_tier })}
                                </span>
                                {user.role === 'admin' && (
                                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-black text-white">{p('admin')}</span>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-pysim-on-surface-variant">
                                {p('memberSince', { date: fmt(user.created_at) })}
                            </p>

                            <div className="mt-5">
                                <div className="flex items-end justify-between gap-3">
                                    <span className="text-sm font-black text-pysim-on-surface">
                                        {p('level', { level: progression.level })}
                                    </span>
                                    <span className="text-xs font-bold text-pysim-outline">
                                        {progression.xp_into_level} / {progression.xp_needed_this_level} XP
                                    </span>
                                </div>
                                <ProgressBar percent={progression.xp_percent} className="mt-2" />
                            </div>

                            <div className="mt-5 flex flex-wrap justify-center gap-4 sm:justify-start">
                                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600">
                                    <Coins size={16} /> {p('coins', { count: user.virtual_currency.toLocaleString() })}
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-500">
                                    <Flame size={16} /> {p('streak', { days: progression.streak_days })}
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-pysim-on-surface-variant">
                                    <Star size={16} /> {p('xpTotal', { xp: progression.xp.toLocaleString() })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <section aria-label={p('cosmeticsInUse')} className="mt-4 rounded-xl bg-white/95 p-4 text-sm text-slate-600 whisper-shadow">
                    <h2 className="font-bold text-slate-800">{p('cosmeticsInUse')}</h2>
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                        <span>{p('themeLabel', { name: user.theme_name || p('defaultTheme') })}</span>
                        <span>{p('frameLabel', { name: user.profile_frame_name || p('notWorn') })}</span>
                        <span>{p('effectLabel', { name: user.mouse_effect_name || p('notWorn') })}</span>
                    </div>
                    {user.mouse_effect_name && <p className="mt-2 text-xs">{p('effectHint')}</p>}
                </section>

                {/* ---------- headline numbers ---------- */}
                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatTile
                        icon={<BookOpen size={16} className="text-pysim-primary" />} label={p('stats.lessonsDone')}
                        value={`${learning.summary.lessons_done}/${learning.summary.lessons_total}`}
                        hint={p('stats.lessonsInProgress', { count: learning.summary.lessons_in_progress })}
                    />
                    <StatTile
                        icon={<Target size={16} className="text-emerald-500" />} label={p('stats.exercisesPassed')}
                        value={`${learning.summary.exercises_passed}/${learning.summary.exercises_total}`}
                        hint={p('stats.overallProgress', { percent: learning.summary.percent })}
                    />
                    <StatTile
                        icon={<Gamepad2 size={16} className="text-violet-500" />} label={p('stats.arcadePlayed')}
                        value={arcade.matches_played}
                        hint={p('stats.winsLosses', { wins: arcade.wins, losses: arcade.losses })}
                    />
                    <StatTile
                        icon={<Trophy size={16} className="text-amber-500" />} label={p('stats.winRate')}
                        value={`${arcade.win_rate}%`}
                        hint={arcade.best_rank ? p('stats.bestRank', { rank: arcade.best_rank }) : p('stats.noStats')}
                    />
                </div>

                {/* ---------- currently studying ---------- */}
                {current && (
                    <div className="mt-6 rounded-2xl bg-white p-6 whisper-shadow">
                        <h2 className="text-xs font-black uppercase tracking-widest text-pysim-outline">{p('current.title')}</h2>
                        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                            <div className="min-w-0">
                                <p className="truncate text-xl font-black text-pysim-on-surface">{current.title}</p>
                                <p className="mt-1 text-xs text-pysim-on-surface-variant">
                                    {p('current.preTest', { score: current.pre_score ? `${current.pre_score.score}/${current.pre_score.total}` : p('current.notTaken') })}
                                    {' · '}
                                    {p('current.postTest', { score: current.post_score ? `${current.post_score.score}/${current.post_score.total}` : p('current.notTaken') })}
                                    {' · '}
                                    {p('current.exercises', { passed: current.exercises_passed, total: current.exercises_total })}
                                </p>
                            </div>
                            <span className="text-3xl font-black text-pysim-primary">{current.percent}%</span>
                        </div>
                        <ProgressBar percent={current.percent} className="mt-4" />
                        <button
                            onClick={() => navigate(`/lesson/${current.lesson_id}`)}
                            className="mt-5 rounded-lg python-gradient px-6 py-2.5 text-sm font-bold text-white"
                        >
                            {p('current.continue')}
                        </button>
                    </div>
                )}

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* ---------- progress per module ---------- */}
                    <div className="rounded-2xl bg-white p-6 whisper-shadow">
                        <h2 className="text-lg font-black text-pysim-on-surface">{p('modules.title')}</h2>
                        <div className="mt-4 space-y-4">
                            {learning.modules.map((m) => (
                                <div key={m.module_id}>
                                    <div className="flex items-baseline justify-between gap-3">
                                        <p className="min-w-0 truncate text-sm font-bold text-pysim-on-surface">{m.title}</p>
                                        <span className="shrink-0 text-xs font-bold text-pysim-outline">
                                            {p('modules.lessons', { done: m.lessons_done, total: m.lessons_total, percent: m.percent })}
                                        </span>
                                    </div>
                                    <ProgressBar percent={m.percent} className="mt-1.5" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ---------- match history: Arcade / Competitive tabs ---------- */}
                    <div className="rounded-2xl bg-white p-6 whisper-shadow">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setHistoryTab('arcade')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${historyTab === 'arcade' ? 'python-gradient text-white' : 'bg-pysim-surface-low text-pysim-on-surface-variant hover:bg-pysim-surface'}`}
                            >
                                {p('history.arcade')}
                            </button>
                            <button
                                onClick={() => setHistoryTab('competitive')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${historyTab === 'competitive' ? 'python-gradient text-white' : 'bg-pysim-surface-low text-pysim-on-surface-variant hover:bg-pysim-surface'}`}
                            >
                                {p('history.competitive')}
                            </button>
                        </div>

                        {historyTab === 'arcade' ? (
                            <>
                                {arcade.recent_matches.length === 0 ? (
                                    <p className="mt-4 text-sm text-pysim-outline">{p('history.noArcade')}</p>
                                ) : (
                                    <div className="mt-4 overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="text-pysim-outline">
                                                <tr>
                                                    <th className="pb-2 font-bold">{p('history.room')}</th>
                                                    <th className="pb-2 font-bold">{p('history.difficulty')}</th>
                                                    <th className="pb-2 text-right font-bold">{p('history.score')}</th>
                                                    <th className="pb-2 text-right font-bold">{p('history.tests')}</th>
                                                    <th className="pb-2 text-right font-bold">{p('history.when')}</th>
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
                                                        <td className="py-2 text-right text-pysim-outline">{fmt(m.ended_at)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <p className="mt-4 text-xs text-pysim-outline">
                                    {p('history.arcadeTotals', { score: arcade.total_score.toLocaleString(), cash: arcade.total_cash_earned.toLocaleString() })}
                                </p>
                            </>
                        ) : (
                            <>
                                {compLoading ? (
                                    <SkeletonLoading variant="table" label={p('history.loadingCompetitive')} className="mt-4" />
                                ) : compError ? (
                                    <div className="mt-4 text-sm text-red-600" role="alert">
                                        {tx(compError)}
                                        <button type="button" className="ml-3 underline" onClick={() => { setCompError(''); setCompRetry(value => value + 1); }}>{p('history.retry')}</button>
                                    </div>
                                ) : !compHistory || compHistory.length === 0 ? (
                                    <p className="mt-4 text-sm text-pysim-outline">{p('history.noCompetitive')}</p>
                                ) : (
                                    <div className="mt-4 overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="text-pysim-outline">
                                                <tr>
                                                    <th className="pb-2 font-bold">{p('history.problem')}</th>
                                                    <th className="pb-2 font-bold">{p('history.difficulty')}</th>
                                                    <th className="pb-2 text-right font-bold">{p('history.score')}</th>
                                                    <th className="pb-2 text-right font-bold">{p('history.tests')}</th>
                                                    <th className="pb-2 text-right font-bold">{p('history.when')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-pysim-on-surface">
                                                {compHistory.map((m) => (
                                                    <tr key={m.challenge_id} className="border-t border-pysim-outline/10">
                                                        <td className="py-2 font-bold">{m.title}</td>
                                                        <td className="py-2">{m.difficulty || '-'}</td>
                                                        <td className="py-2 text-right font-bold">{m.score}</td>
                                                        <td className="py-2 text-right">{m.passed_cases}/{m.total_cases}</td>
                                                        <td className="py-2 text-right text-pysim-outline">{fmt(m.submitted_at)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* ---------- lesson by lesson ---------- */}
                <div className="mt-6 rounded-2xl bg-white p-6 whisper-shadow">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-black text-pysim-on-surface">{p('lessons.title')}</h2>
                        <button
                            onClick={() => setShowAllLessons(v => !v)}
                            className="rounded-lg bg-pysim-surface-low px-4 py-2 text-xs font-bold text-pysim-on-surface-variant hover:bg-pysim-surface"
                        >
                            {showAllLessons ? p('lessons.hideNotStarted') : p('lessons.showAll', { count: learning.lessons.length })}
                        </button>
                    </div>

                    {lessons.length === 0 ? (
                        <p className="mt-4 text-sm text-pysim-outline">{p('lessons.none')}</p>
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
                                                {p(`status.${STATUS_META[l.status] ? l.status : 'not_started'}`)} · {p('lessons.exercises', { passed: l.exercises_passed, total: l.exercises_total })}
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
                        <h2 className="text-lg font-black text-pysim-on-surface">{p('achievements.title')}</h2>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-pysim-on-surface-variant">
                                {p('achievements.unlockedOf', { unlocked: achievements.unlocked, total: achievements.total })}
                            </span>
                            {isOwner && !editingShowcase && unlockedItems.length > 0 && (
                                <button
                                    onClick={startEditing}
                                    className="rounded-lg bg-pysim-surface-low px-4 py-2 text-xs font-bold text-pysim-on-surface-variant hover:bg-pysim-surface"
                                >
                                    {p('achievements.choose')}
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
                                {p('achievements.pickLimit', { max: maxShowcase, count: picked.length })}
                            </p>
                            {showcaseError && (
                                <p className="mt-2 text-sm font-bold text-red-600">{tx(showcaseError)}</p>
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
                                                    {on ? p('achievements.showAt', { n: picked.indexOf(a.achievement_id) + 1 }) : p('achievements.tapToPick')}
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
                                    {savingShowcase ? p('achievements.saving') : p('achievements.save')}
                                </button>
                                <button
                                    onClick={() => setEditingShowcase(false)}
                                    className="rounded-lg bg-pysim-surface-low px-6 py-2.5 text-sm font-bold text-pysim-on-surface-variant"
                                >
                                    {p('achievements.cancel')}
                                </button>
                                {picked.length > 0 && (
                                    <button
                                        onClick={() => setPicked([])}
                                        className="rounded-lg px-4 py-2.5 text-sm font-bold text-pysim-outline hover:text-pysim-on-surface"
                                    >
                                        {p('achievements.clear')}
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
                                                    {p('achievements.unlockedOn', { date: fmt(a.unlocked_at) })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {showcase.length === 0 && (
                                <p className="mt-5 text-sm text-pysim-outline">{p('achievements.none')}</p>
                            )}

                            <details className="mt-6">
                                <summary className="cursor-pointer text-sm font-bold text-pysim-on-surface-variant hover:text-pysim-on-surface">
                                    {p('achievements.viewAll', { count: achievements.total })}
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
                                                    {a.unlocked ? p('achievements.unlockedOn', { date: fmt(a.unlocked_at) }) : p('achievements.reward', { reward: a.reward, difficulty: t(`achievements.difficulty.${a.difficulty}`, a.difficulty) })}
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
        </ProfileAppearance>
    );
}
