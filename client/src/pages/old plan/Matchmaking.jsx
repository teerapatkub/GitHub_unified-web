import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Matchmaking() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [seconds, setSeconds] = useState(0);
    const [foundPlayers, setFoundPlayers] = useState([]);
    const [isReady, setIsReady] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(s => {
                const next = s + 1;
                if (next === 5) setFoundPlayers([
                    { name: "Player1", avatar: "P1" }, { name: "You", avatar: "Me" },
                    { name: "DevX", avatar: "DX" }, { name: "CodeGod", avatar: "CG" },
                    { name: "NoobPy", avatar: "NP" }
                ]);
                return next;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleReady = () => {
        setIsReady(true);
        setTimeout(() => { alert("Game Starting!"); navigate('/online'); }, 2000);
    };

    return (
        <div className="min-h-screen relative transition-colors duration-300 overflow-y-auto bg-slate-50">
            <div className="fixed inset-0 bg-white/40 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8 px-4">

            {foundPlayers.length < 5 ? (
                <div className={`text-center z-10 transition-all duration-700 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <div className="relative w-40 h-40 mx-auto mb-8">
                        <div className="absolute inset-0 rounded-full border-2 border-pysim-primary/30"></div>
                        <div className="absolute inset-4 rounded-full border border-pysim-primary/20"></div>
                        <div className="absolute inset-8 rounded-full border border-pysim-primary/10"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 bg-pysim-primary rounded-full animate-ping opacity-75"></div>
                            <div className="absolute w-3 h-3 bg-pysim-primary rounded-full"></div>
                        </div>
                        <div className="absolute inset-0 rounded-full animate-spin" style={{ animationDuration: '3s' }}>
                            <div className="absolute top-1/2 left-1/2 w-1/2 h-[2px] origin-left" style={{ background: 'linear-gradient(to right, #145D91, transparent)' }}></div>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-pysim-on-surface mb-2">{t('matchmaking.searching')}</h2>
                    <p className="text-4xl font-mono text-pysim-primary mb-4 font-bold">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</p>
                    <p className="text-pysim-on-surface-variant text-sm font-medium">{t('matchmaking.findingRoomText')}</p>
                </div>
            ) : (
                <div className="w-full max-w-4xl z-10 px-4">
                    <h2 className="text-3xl text-center mb-8 font-black animate-bounce-in">
                        <span className="bg-gradient-to-r from-emerald-500 to-green-400 bg-clip-text text-transparent">{t('matchmaking.matchFound')}</span>
                    </h2>
                    <div className="flex justify-center gap-4 mb-12">
                        {foundPlayers.map((p, i) => (
                            <div key={i} className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl w-32 text-center animate-fade-in-up whisper-shadow"
                                style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-white text-xl
                                    python-gradient">{p.avatar}</div>
                                <p className="text-pysim-on-surface text-sm font-bold truncate px-1">{p.name}</p>
                            </div>
                        ))}
                    </div>
                    <div className="text-center">
                        <button onClick={handleReady} disabled={isReady}
                            className={`px-12 py-4 text-xl font-bold rounded-2xl transition-all duration-300 active:scale-95 tracking-wide uppercase shadow-lg
                                ${isReady ? 'bg-emerald-500 text-white' : 'bg-pysim-secondary-container text-pysim-on-secondary-container hover:opacity-90'}`}>
                            {isReady ? t('matchmaking.ready', '✓ READY!') : t('matchmaking.joinRoomBtn')}
                        </button>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}