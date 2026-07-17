import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shuffle, PlusSquare, Users, Settings, User, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SettingsModal from '../components/SettingsModal';

export default function OnlineMenu() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [mounted, setMounted] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [createData, setCreateData] = useState({ roomName: '', maxPlayers: 2, password: '' });
    const [volume, setVolume] = useState(localStorage.getItem('musicVolume') || 50);
    const userId = user?.user_id || user?.id;

    useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!createData.roomName) return alert(t('onlineMenu.settingsModal.errorNameEmpty'));
        if (!userId) return alert(t('onlineMenu.settingsModal.errorCreateRoom'));
        try {
            const res = await axios.post('http://localhost:3001/rooms/create', {
                ...createData,
                roomName: createData.roomName.trim(),
                hostId: userId,
            });
            navigate(`/lobby/${res.data.roomId}`, {
                state: { password: createData.password || '' }
            });
        } catch {
            alert(t('onlineMenu.settingsModal.errorCreateRoom'));
        }
    };

    const handleVolumeChange = (nextVolume) => {
        setVolume(nextVolume);
        localStorage.setItem('musicVolume', nextVolume);
        const music = document.getElementById('bg-music');
        if (music) {
            music.volume = nextVolume / 100;
            if (music.paused) music.play().catch(() => {});
        }
    };

    const actionPrimary = { name: t('onlineMenu.quickJoin'), sub: "Auto-Matchmaking", icon: <Shuffle size={32} className="opacity-80" />, color: "python-gradient", action: () => navigate('/matchmaking') };
    
    const actionGrid = [
        { name: t('onlineMenu.createRoom'), sub: "Host Session", icon: <PlusSquare size={24} />, color: "bg-gradient-to-br from-green-500 to-green-600", action: () => setShowCreateModal(true) },
        { name: t('onlineMenu.joinList'), sub: "Server Browser", icon: <Users size={24} />, color: "bg-gradient-to-br from-pysim-primary-container to-pysim-primary", action: () => navigate('/join-room') },
        { name: t('onlineMenu.solo'), sub: "Local Mode", icon: <User size={24} />, color: "bg-gradient-to-br from-cat-amber to-amber-600", action: () => navigate('/menu') },
        { name: t('onlineMenu.settings'), sub: "Preferences", icon: <Settings size={24} />, color: "bg-gradient-to-br from-slate-500 to-slate-600", action: () => setShowSettingsModal(true) },
    ];

    return (
        <div className="min-h-screen relative bg-pysim-surface transition-colors duration-300 overflow-y-auto">
            {/* Background Artwork - Tonal Layering */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-pysim-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -right-48 w-[600px] h-[600px] bg-pysim-secondary-container/10 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#145d91 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8 px-4">

                {/* Header */}
                <header className={`relative mb-12 flex flex-col items-center space-y-2 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
                    <div className="text-3xl font-black bg-gradient-to-r from-pysim-primary to-pysim-primary-container bg-clip-text text-transparent tracking-tighter uppercase">
                        {t('onlineMenu.title')}
                    </div>
                    <div className="text-[10px] font-bold tracking-[0.3em] text-pysim-outline uppercase opacity-60">
                        Multiplayer Hub
                    </div>
                </header>

                {/* Menu Card */}
                <div className="w-full max-w-lg">
                    <div className="bg-white rounded-xl whisper-shadow p-8 flex flex-col space-y-6 relative border border-pysim-outline-variant/10">
                        
                        {/* Status Row */}
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-pysim-surface-high flex items-center justify-center overflow-hidden">
                                    <span className="text-lg">🌐</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-pysim-outline uppercase tracking-wider">Network Identity</p>
                                    <p className="text-sm font-bold text-pysim-on-surface">{user?.username || 'Guest'}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-[10px] font-bold text-pysim-outline uppercase tracking-wider">Server Status</p>
                                <div className="flex items-center space-x-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-xs font-semibold text-emerald-600">Connected</span>
                                </div>
                            </div>
                        </div>

                        {/* Main Actions */}
                        <nav className="flex flex-col space-y-3">
                            {/* Primary Start Action */}
                            <button onClick={actionPrimary.action}
                                className={`w-full h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-between px-8 text-white transition-all active:scale-[0.98] group relative overflow-hidden
                                    ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                                style={{ transitionDelay: '300ms' }}>
                                <div className="flex items-center space-x-6">
                                    {actionPrimary.icon}
                                    <div className="text-left">
                                        <span className="block text-lg font-black tracking-tight leading-none uppercase">{actionPrimary.name}</span>
                                        <span className="text-[11px] font-medium opacity-70">{actionPrimary.sub}</span>
                                    </div>
                                </div>
                            </button>

                            {/* Secondary Actions Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {actionGrid.map((menu, index) => (
                                    <button key={index} onClick={menu.action}
                                        className={`bg-pysim-surface-low hover:bg-pysim-surface-high rounded-lg p-5 flex flex-col items-start space-y-3 transition-colors active:scale-[0.98]
                                            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                                        style={{ transitionDelay: `${400 + index * 80}ms` }}>
                                        <div className={`p-2 rounded-lg ${menu.color} text-white`}>
                                            {menu.icon}
                                        </div>
                                        <div>
                                            <span className="block text-sm font-bold text-pysim-on-surface">{menu.name}</span>
                                            <span className="text-[10px] text-pysim-outline">{menu.sub}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </nav>
                    </div>

                    {/* Footer Meta Info */}
                    <div className={`mt-8 flex justify-between items-center px-4 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="text-[10px] font-mono text-pysim-outline/50">
                            {t('mainMenu.version') || 'BUILD_ID: PS_OS_2024.0.1'}
                        </div>
                        <div className="text-[10px] font-mono text-pysim-outline/50">
                            Server: SEA-Central 1
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals remain mostly unchanged but positioned correctly above z-10 */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-pysim-on-surface/20 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md relative animate-scale-in whisper-shadow border border-pysim-outline-variant/10">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-6 right-6 text-pysim-outline hover:text-pysim-error transition-colors bg-pysim-surface-low hover:bg-pysim-error-container p-2 rounded-full"><X size={20} /></button>
                        <h2 className="text-2xl font-black text-pysim-on-surface mb-6 flex items-center gap-3"><PlusSquare size={24} className="text-emerald-500" /> {t('onlineMenu.createModal.title')}</h2>
                        <form onSubmit={handleCreateRoom} className="space-y-5">
                            <div>
                                <label className="text-pysim-primary text-xs font-bold tracking-widest uppercase">{t('onlineMenu.createModal.roomName')}</label>
                                <input type="text" className="w-full bg-pysim-surface-low border border-pysim-outline-variant/10 text-pysim-on-surface p-3 rounded-xl mt-1.5 focus:outline-none focus:border-pysim-primary focus:ring-4 focus:ring-pysim-primary/10 transition-all font-medium"
                                    value={createData.roomName} onChange={(e) => setCreateData({ ...createData, roomName: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-pysim-primary text-xs font-bold tracking-widest uppercase">{t('onlineMenu.createModal.maxPlayers')} ({createData.maxPlayers})</label>
                                <input type="range" min="2" max="5" className="w-full mt-3 accent-pysim-primary cursor-pointer h-2 bg-pysim-surface-container rounded-lg appearance-none"
                                    value={createData.maxPlayers} onChange={(e) => setCreateData({ ...createData, maxPlayers: parseInt(e.target.value) })} />
                                <div className="flex justify-between text-pysim-outline font-bold text-xs mt-2 px-1"><span>2</span><span>3</span><span>4</span><span>5</span></div>
                            </div>
                            <div>
                                <label className="text-pysim-primary text-xs font-bold tracking-widest uppercase">{t('onlineMenu.createModal.password')}</label>
                                <input type="text" placeholder={t('onlineMenu.createModal.passwordPlaceholder')}
                                    className="w-full bg-pysim-surface-low border border-pysim-outline-variant/10 text-pysim-on-surface p-3 rounded-xl mt-1.5 focus:outline-none focus:border-pysim-primary focus:ring-4 focus:ring-pysim-primary/10 transition-all placeholder-pysim-outline font-medium"
                                    value={createData.password} onChange={(e) => setCreateData({ ...createData, password: e.target.value })} />
                            </div>
                            <button type="submit" className="w-full python-gradient text-white font-bold py-4 rounded-xl transition-all duration-300 hover:opacity-90 active:scale-[0.98] mt-4 tracking-wide uppercase">{t('onlineMenu.createModal.submit')}</button>
                        </form>
                    </div>
                </div>
            )}
            <SettingsModal
                open={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                volume={volume}
                onVolumeChange={handleVolumeChange}
            />
        </div>
    );
}
