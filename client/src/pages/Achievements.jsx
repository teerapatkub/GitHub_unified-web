import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Lock, CheckCircle2, Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE, assetUrl } from '../config/api.js';

const DIFFICULTY_TH = {
    Medium: 'ปานกลาง',
    Hard: 'ยาก',
    'Very Hard': 'ยากมาก',
};

export default function Achievements() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

    const userId = useMemo(() => {
        try {
            const u = JSON.parse(localStorage.getItem('user') || 'null');
            return Number(u?.user_id || 0);
        } catch {
            return 0;
        }
    }, []);

    const load = useCallback(async () => {
        if (!userId) { setError('กรุณาเข้าสู่ระบบเพื่อดูความสำเร็จ'); setLoading(false); return; }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/api/achievements/${userId}`);
            if (!res.ok) throw new Error('โหลดความสำเร็จไม่สำเร็จ');
            const data = await res.json();
            setRows(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'โหลดความสำเร็จไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { load(); }, [load]);

    const unlockedCount = rows.filter(a => Number(a.is_unlocked) === 1).length;
    const percent = rows.length > 0 ? Math.round((unlockedCount / rows.length) * 100) : 0;

    return (
        <div className="min-h-screen bg-pysim-surface relative overflow-y-auto">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-pysim-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-pysim-secondary-container/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-8">
                <div className={`mb-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 python-gradient rounded-lg flex items-center justify-center">
                            <Trophy size={20} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-pysim-on-surface tracking-tight">{t('achievements.title', 'ความสำเร็จ')}</h1>
                    </div>
                    <p className="text-pysim-on-surface-variant ml-[52px]">{t('achievements.subtitle', 'เส้นทางความสำเร็จของคุณ')}</p>
                </div>

                {loading ? (
                    <p className="py-16 text-center text-sm font-semibold text-pysim-outline">กำลังโหลด...</p>
                ) : error ? (
                    <div className="mx-auto max-w-md rounded-xl bg-white p-8 text-center whisper-shadow">
                        <p className="text-sm font-bold text-red-600">{error}</p>
                    </div>
                ) : (
                    <>
                        <div className={`grid grid-cols-3 gap-4 mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <div className="bg-white rounded-xl whisper-shadow p-5 text-center">
                                <p className="text-3xl font-black text-pysim-primary">{unlockedCount}</p>
                                <p className="text-xs font-bold text-pysim-outline uppercase tracking-wider mt-1">ปลดล็อกแล้ว</p>
                            </div>
                            <div className="bg-white rounded-xl whisper-shadow p-5 text-center">
                                <p className="text-3xl font-black text-pysim-on-surface">{rows.length}</p>
                                <p className="text-xs font-bold text-pysim-outline uppercase tracking-wider mt-1">ทั้งหมด</p>
                            </div>
                            <div className="bg-white rounded-xl whisper-shadow p-5 text-center">
                                <p className="text-3xl font-black text-pysim-secondary">{percent}%</p>
                                <p className="text-xs font-bold text-pysim-outline uppercase tracking-wider mt-1">ความคืบหน้า</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {rows.map((ach, index) => {
                                const unlocked = Number(ach.is_unlocked) === 1;
                                return (
                                    <div key={ach.achievement_id}
                                        className={`bg-white rounded-xl whisper-shadow p-6 flex items-center gap-6 transition-all duration-300
                                            ${!unlocked ? 'opacity-75' : ''}
                                            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                                        style={{ transitionDelay: `${150 + index * 50}ms` }}>
                                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 ${unlocked ? 'bg-pysim-primary-fixed' : 'bg-pysim-surface-high'}`}>
                                            {unlocked ? ach.icon : <Lock size={24} className="text-pysim-outline" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-pysim-on-surface">{ach.name}</h3>
                                                {unlocked && <CheckCircle2 size={16} className="text-emerald-500" />}
                                                <span className="rounded-full bg-pysim-surface-low px-2 py-0.5 text-[10px] font-bold text-pysim-outline">
                                                    {DIFFICULTY_TH[ach.difficulty] || ach.difficulty}
                                                </span>
                                            </div>
                                            <p className="text-sm text-pysim-on-surface-variant">{ach.description}</p>
                                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                                {Number(ach.reward_money) > 0 && (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                                                        <Coins size={14} /> {Number(ach.reward_money).toLocaleString()}
                                                    </span>
                                                )}
                                                {ach.reward_item_url && (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2 py-1 text-[11px] font-bold text-violet-700">
                                                        <img src={assetUrl(ach.reward_item_url)} alt="" className="h-5 w-5 rounded-full object-cover" />
                                                        รูปพิเศษ: {ach.reward_item_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <span className={`text-sm font-bold flex-shrink-0 ${unlocked ? 'text-emerald-600' : 'text-pysim-outline'}`}>
                                            {unlocked ? 'สำเร็จ' : 'ยังไม่ปลดล็อก'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                <button onClick={() => navigate('/menu')}
                    className={`mt-10 text-pysim-outline hover:text-pysim-primary text-sm font-bold transition-colors uppercase tracking-widest ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                    ← {t('achievements.back', 'กลับหน้าหลัก')}
                </button>
            </div>
        </div>
    );
}
