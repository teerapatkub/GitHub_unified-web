import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, Lock, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Achievements() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

    const achievements = [
        { id: 1, title: t('achievements.firstLogin', 'First Login'), desc: 'เข้าสู่ระบบครั้งแรก', icon: '🎉', unlocked: true, progress: 100 },
        { id: 2, title: t('achievements.pyBeginner', 'Python Beginner'), desc: 'ผ่านบทเรียนแรกสำเร็จ', icon: '🐍', unlocked: true, progress: 100 },
        { id: 3, title: t('achievements.codeStreak', 'Code Streak'), desc: 'เขียนโค้ดติดต่อกัน 7 วัน', icon: '🔥', unlocked: false, progress: 57 },
        { id: 4, title: t('achievements.bugHunter', 'Bug Hunter'), desc: 'แก้ไข bug ได้ 10 ตัว', icon: '🐛', unlocked: false, progress: 30 },
        { id: 5, title: t('achievements.speedRunner', 'Speed Runner'), desc: 'ผ่าน Challenge ภายใน 1 นาที', icon: '⚡', unlocked: false, progress: 0 },
        { id: 6, title: t('achievements.masterCoder', 'Master Coder'), desc: 'เรียนจบหลักสูตรทั้งหมด', icon: '👑', unlocked: false, progress: 15 },
    ];

    return (
        <div className="min-h-screen bg-pysim-surface relative overflow-y-auto">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-pysim-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-pysim-secondary-container/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-8">
                {/* Header */}
                <div className={`mb-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 python-gradient rounded-lg flex items-center justify-center">
                            <Trophy size={20} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-pysim-on-surface tracking-tight">{t('achievements.title', 'Achievements')}</h1>
                    </div>
                    <p className="text-pysim-on-surface-variant ml-[52px]">{t('achievements.subtitle', 'เส้นทางความสำเร็จของคุณ')}</p>
                </div>
                
                {/* Summary Stats */}
                <div className={`grid grid-cols-3 gap-4 mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="bg-white rounded-xl whisper-shadow p-5 text-center">
                        <p className="text-3xl font-black text-pysim-primary">{achievements.filter(a => a.unlocked).length}</p>
                        <p className="text-xs font-bold text-pysim-outline uppercase tracking-wider mt-1">Unlocked</p>
                    </div>
                    <div className="bg-white rounded-xl whisper-shadow p-5 text-center">
                        <p className="text-3xl font-black text-pysim-on-surface">{achievements.length}</p>
                        <p className="text-xs font-bold text-pysim-outline uppercase tracking-wider mt-1">Total</p>
                    </div>
                    <div className="bg-white rounded-xl whisper-shadow p-5 text-center">
                        <p className="text-3xl font-black text-pysim-secondary">{Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}%</p>
                        <p className="text-xs font-bold text-pysim-outline uppercase tracking-wider mt-1">Complete</p>
                    </div>
                </div>

                {/* Achievement List */}
                <div className="space-y-4">
                    {achievements.map((ach, index) => (
                        <div key={ach.id}
                            className={`bg-white rounded-xl whisper-shadow p-6 flex items-center gap-6 transition-all duration-300 hover:translate-y-[-2px]
                                ${!ach.unlocked ? 'opacity-75' : ''}
                                ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                            style={{ transitionDelay: `${200 + index * 80}ms` }}>
                            {/* Icon */}
                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 ${
                                ach.unlocked ? 'bg-pysim-primary-fixed' : 'bg-pysim-surface-high'
                            }`}>
                                {ach.unlocked ? ach.icon : <Lock size={24} className="text-pysim-outline" />}
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-pysim-on-surface">{ach.title}</h3>
                                    {ach.unlocked && <CheckCircle2 size={16} className="text-emerald-500" />}
                                </div>
                                <p className="text-sm text-pysim-on-surface-variant mb-3">{ach.desc}</p>
                                {/* Progress Bar */}
                                <div className="w-full h-2 bg-pysim-surface-container rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${ach.unlocked ? 'bg-emerald-500' : 'bg-pysim-primary'}`}
                                        style={{width: `${ach.progress}%`}}></div>
                                </div>
                            </div>
                            
                            {/* Progress Label */}
                            <span className={`text-sm font-bold flex-shrink-0 ${ach.unlocked ? 'text-emerald-600' : 'text-pysim-on-surface-variant'}`}>
                                {ach.progress}%
                            </span>
                        </div>
                    ))}
                </div>

                {/* Back Button */}
                <button onClick={() => navigate('/menu')}
                    className={`mt-10 text-pysim-outline hover:text-pysim-primary text-sm font-bold transition-colors uppercase tracking-widest ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                    ← {t('achievements.back', 'กลับหน้าหลัก')}
                </button>
            </div>
        </div>
    );
}
