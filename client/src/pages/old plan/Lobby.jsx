import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { User, Crown, CheckCircle, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Lobby() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const currentUserId = currentUser?.user_id || currentUser?.id;
    const roomPassword = location.state?.password || '';
    const [roomData, setRoomData] = useState(null);
    const [players, setPlayers] = useState([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

    const fetchRoomData = async () => {
        try {
            const res = await axios.get(`http://localhost:3001/rooms/${roomId}`);
            setRoomData(res.data.room);
            const filled = [...res.data.players];
            while (filled.length < (res.data.room?.max_players || 5)) filled.push({ user_id: null });
            setPlayers(filled);
        } catch { navigate('/online'); }
    };

    useEffect(() => {
        if (!currentUser) return navigate('/');
        const enterRoom = async () => {
            try {
                await axios.post('http://localhost:3001/rooms/join', {
                    roomId,
                    userId: currentUserId,
                    password: roomPassword,
                });
                fetchRoomData();
            } catch (error) {
                const status = error?.response?.status;
                if (status === 401) {
                    alert(t('joinRoom.passwordInvalid', 'รหัสผ่านห้องไม่ถูกต้อง'));
                    navigate('/join-room');
                    return;
                }
                if (status === 400 || status === 404) {
                    alert(t('joinRoom.joinFailed', 'ไม่สามารถเข้าร่วมห้องนี้ได้'));
                    navigate('/join-room');
                    return;
                }
                fetchRoomData();
            }
        };
        enterRoom();
        const interval = setInterval(fetchRoomData, 2000);
        return () => clearInterval(interval);
    }, [roomId, currentUserId, navigate, roomPassword, t]);

    const handleLeave = async () => {
        if (window.confirm(t('lobby.leave', "ต้องการออกจากห้องใช่ไหม?"))) {
            try { await axios.post('http://localhost:3001/rooms/leave', { roomId, userId: currentUserId }); navigate('/online'); }
            catch { alert(t('lobby.errors.leaveFailed', "ไม่สามารถออกจากห้องได้ กรุณาลองใหม่")); }
        }
    };

    if (!roomData) return (
        <div className="min-h-screen relative overflow-y-auto transition-colors duration-300 bg-pysim-surface">
            <div className="fixed inset-0 bg-white/40 pointer-events-none"></div>
            <div className="relative z-10 flex items-center justify-center min-h-screen">
                <div className="text-center bg-white/70 backdrop-blur-md p-10 rounded-2xl whisper-shadow">
                    <div className="w-12 h-12 border-4 border-pysim-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-pysim-primary font-bold tracking-widest text-sm uppercase">{t('lobby.waiting', 'CONNECTING TO LOBBY...')}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen relative transition-colors duration-300 overflow-y-auto bg-pysim-surface">
            <div className="fixed inset-0 bg-white/40 pointer-events-none"></div>
            
            <div className="relative z-10 flex items-center justify-center min-h-screen p-4 py-8">

            <div className={`w-full max-w-5xl bg-white/70 backdrop-blur-2xl rounded-2xl p-8 relative z-10 whisper-shadow transition-all duration-700 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 border-b border-pysim-outline-variant/10 pb-6 gap-4">
                    <div>
                        <h2 className="text-pysim-primary text-xs font-bold tracking-widest uppercase mb-1">{t('lobby.title', 'CURRENT LOBBY')}</h2>
                        <h1 className="text-3xl font-black text-pysim-on-surface tracking-tight">{roomData.room_name} <span className="text-pysim-outline font-medium text-xl ml-2 tracking-normal">#{roomId}</span></h1>
                    </div>
                    <div className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm border border-emerald-200 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {t('lobby.statusLabel', 'STATUS:')} {roomData.status}
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 mb-10">
                    {players.map((p, index) => {
                        const isMe = p.user_id === currentUserId;
                        const isHost = p.user_id === roomData.host_user_id;
                        return (
                            <div key={index}
                                className={`relative h-60 rounded-2xl flex flex-col items-center justify-center transition-all duration-500 animate-fade-in-up
                                    ${p.user_id ? (isMe ? 'bg-white border-2 border-pysim-primary whisper-shadow scale-105 z-10' : 'bg-white/80 backdrop-blur-md whisper-shadow') : 'border-2 border-dashed border-pysim-outline-variant/30 bg-pysim-surface-low/50'}`}
                                style={{ animationDelay: `${index * 100}ms` }}>
                                {p.user_id ? (
                                    <>
                                        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-xl python-gradient border-[3px] border-white">
                                            <User size={36} className="text-white" />
                                        </div>
                                        <div className="text-pysim-on-surface px-4 py-1.5 rounded-xl text-sm font-bold max-w-[90%] truncate bg-pysim-surface-low">
                                            {p.username} {isMe && <span className="text-pysim-primary ml-1">{t('lobby.you', '(YOU)')}</span>}
                                        </div>
                                        <div className="flex gap-2 mt-3 bg-white/50 px-3 py-1.5 rounded-full">
                                            {isHost && <Crown size={16} className="text-amber-500 animate-float" title="Host" />}
                                            <CheckCircle size={16} className="text-emerald-500" title="Ready" />
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-pysim-outline font-bold text-sm tracking-widest uppercase">{t('lobby.emptySlot', 'EMPTY')}</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center p-5 rounded-2xl bg-pysim-surface-low/80 gap-4">
                    <button onClick={handleLeave} className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-pysim-error font-bold text-sm bg-pysim-error-container/30 hover:bg-pysim-error-container border border-pysim-error/10 transition-all duration-300 active:scale-95 uppercase tracking-wide">{t('lobby.leave')}</button>
                    {currentUserId === roomData.host_user_id ? (
                        <button onClick={() => alert("Start Game!")} className="w-full sm:w-auto px-10 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 python-gradient text-white hover:opacity-90 transition-all duration-300 active:scale-95 uppercase tracking-wider">
                            <Play fill="white" size={18} /> {t('lobby.startGame')}
                        </button>
                    ) : (
                        <div className="text-pysim-on-surface-variant font-bold text-sm animate-pulse bg-pysim-surface-low px-6 py-2.5 rounded-full w-full sm:w-auto text-center">{t('lobby.waitHost')}</div>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
}
