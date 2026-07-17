import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, User, Lock, Frown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function JoinRoom() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [rooms, setRooms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);
    useEffect(() => {
        const fetchRooms = async () => {
            try { const res = await axios.get('http://localhost:3001/rooms'); setRooms(res.data.filter(r => r.room_name?.toLowerCase().includes(searchTerm.toLowerCase()))); }
            catch { console.error('fetch rooms failed'); }
        };
        fetchRooms();
        const interval = setInterval(fetchRooms, 3000);
        return () => clearInterval(interval);
    }, [searchTerm]);

    const handleJoinRoom = (room) => {
        if (room.has_password) {
            const pw = prompt(t('joinRoom.enterPassword', 'กรุณากรอกรหัสผ่านห้อง'));
            if (!pw) return;
            navigate(`/lobby/${room.room_id}`, { state: { password: pw } });
        } else { navigate(`/lobby/${room.room_id}`); }
    };

    return (
        <div className="min-h-screen relative overflow-y-auto p-4 sm:p-8 transition-colors duration-300 bg-pysim-surface">
            <div className="absolute inset-0 bg-white/40 pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className={`flex flex-col md:flex-row justify-between items-center mb-10 gap-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <h1 className="text-4xl font-black tracking-tight"><span className="bg-gradient-to-r from-pysim-primary to-pysim-primary-container bg-clip-text text-transparent">{t('joinRoom.title')}</span></h1>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-3.5 text-pysim-outline" size={18} />
                        <input type="text" placeholder={t('joinRoom.searchPlaceholder', "ค้นหาชื่อห้อง...")}
                            className="w-full bg-white rounded-xl py-3 pl-11 pr-4 text-pysim-on-surface text-sm font-medium focus:border-pysim-primary focus:ring-4 focus:ring-pysim-primary/10 focus:outline-none transition-all placeholder-pysim-outline whisper-shadow"
                            onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                {rooms.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center h-72 bg-white/70 backdrop-blur-md rounded-2xl border-2 border-dashed border-pysim-outline-variant/20 transition-all duration-700 whisper-shadow ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                        <Frown size={56} className="text-pysim-outline-variant mb-6 animate-float" />
                        <h3 className="text-2xl text-pysim-on-surface font-bold mb-2">{t('joinRoom.noRooms')}</h3>
                        <p className="text-pysim-on-surface-variant font-medium">{t('joinRoom.noRoomsSub')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room, i) => (
                            <div key={room.room_id}
                                className={`bg-white/80 backdrop-blur-xl rounded-2xl p-6 group hover:border-pysim-primary/20 whisper-shadow transition-all duration-300 hover:translate-y-[-4px] relative overflow-hidden
                                    ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                                style={{ transitionDelay: `${150 + i * 50}ms` }}>
                                <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"><User size={96} className="text-pysim-primary" /></div>
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <h3 className="text-xl font-bold text-pysim-on-surface truncate pr-4 group-hover:text-pysim-primary transition-colors uppercase tracking-wide">{room.room_name}</h3>
                                    {room.has_password ? <Lock size={18} className="text-red-500 flex-shrink-0" /> : null}
                                </div>
                                <div className="flex items-center text-pysim-on-surface-variant mb-6 relative z-10 bg-pysim-surface-low px-4 py-2 rounded-xl w-fit text-sm font-medium">
                                    <User size={16} className="mr-2 text-pysim-outline" /><span className="font-bold">{room.current_players} / {room.max_players}</span>
                                </div>
                                <button onClick={() => handleJoinRoom(room)}
                                    className="w-full py-3.5 rounded-xl text-white font-bold text-sm relative z-10 python-gradient hover:opacity-90 transition-all duration-300 active:scale-[0.98] uppercase tracking-wider">
                                    {t('joinRoom.joinBtn')}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button onClick={() => navigate('/online')} className={`mt-10 inline-flex items-center text-pysim-outline hover:text-pysim-primary text-sm font-bold transition-colors duration-300 uppercase tracking-widest ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                    ← {t('joinRoom.back')}
                </button>
            </div>
        </div>
    );
}
