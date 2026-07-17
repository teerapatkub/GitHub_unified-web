import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Battery, BatteryCharging, Wifi, Volume2, Power, RefreshCw,
    Settings, Save, LogOut, Play, Monitor, Trash2, Mail, Code,
    Folder, File, UserCircle, Zap, Briefcase, Palette, Download, X, Lock, Unlock, Plus, Clock
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

import Window from '../components/os/Window';
import DraggableIcon from '../components/os/DraggableIcon';
import CodeEditor from '../components/app/CodeEditor';
import EmailClient from '../components/app/EmailClient';
import MyComputer from '../components/app/MyComputer';
import RecycleBin from '../components/app/RecycleBin';
import JobPlatform from '../components/app/JobPlatform';
import Notepad from '../components/app/Notepad';

const BIOS_LINES = [
    { text: "AMIBIOS (C) 2026 CatTech Industries =^._.^=", delay: 0, cls: "text-t-text" },
    { text: "CPU: Intel(R) Core(TM) i9-13900K @ 5.80GHz", delay: 200, cls: "text-t-text-soft" },
    { text: "Memory Test: 65536MB OK", delay: 400, cls: "text-t-text-soft" },
    { text: "Detecting Primary IDE... NVME SSD 2TB [OK]", delay: 700, cls: "text-t-success" },
    { text: "Detecting Secondary IDE... None", delay: 900, cls: "text-t-muted" },
    { text: "GPU: NVIDIA GeForce RTX 5090 24GB [OK]", delay: 1100, cls: "text-t-success" },
    { text: "Network: Ethernet 10Gbps [CONNECTED]", delay: 1300, cls: "text-t-success" },
    { text: "", delay: 1500 },
    { text: "Boot device: NVME SSD", delay: 1600, cls: "text-t-accent" },
    { text: "Loading PythonCoderOS v2.0.26...", delay: 1800, cls: "text-t-accent" },
];

export default function DesktopPage() {
    const navigate = useNavigate();
    const { theme, setTheme, themes, isDark } = useTheme();

    // --- 1. GAME STATE ---
    const [gameState, setGameState] = useState("BOOT");
    const [bootPhase, setBootPhase] = useState(0);
    const [bootLines, setBootLines] = useState([]);
    const [bootProgress, setBootProgress] = useState(0);
    const [userData, setUserData] = useState(null);   // user จาก localStorage
    const [simState, setSimState] = useState(null);   // state จาก server (เงิน วัน ฯลฯ)
    const [energy, setEnergy] = useState(100);
    const [isEndingDay, setIsEndingDay] = useState(false);
    const [dailySummary, setDailySummary] = useState({
        earned: 0, spent: 0, events: [],
        rentDue: false, rentPaid: false, rentDeducted: 0, daysUntilRent: 7, day: 1
    });

    // --- 2. JOB SYSTEM STATE ---
    const [activeJob, setActiveJob] = useState(null);
    const [hasOnboarded, setHasOnboarded] = useState(() => localStorage.getItem('hasOnboarded') === 'true');
    const [jobNotification, setJobNotification] = useState(false);
    const lastJobCountRef = useRef(0);
    const gameMinutesRef = useRef(0);
    const [saves, setSaves] = useState([null, null, null]);
    const [showSavesModal, setShowSavesModal] = useState(false);
    const [savesModalMode, setSavesModalMode] = useState('SAVE'); // 'SAVE' or 'LOAD'

    const RENT_AMOUNT = 3000;
    const RENT_CYCLE = 7;
    // ดึงค่าจาก simState (server)
    const day = simState?.current_day || 1;
    const currentMoney = parseFloat(simState?.sim_money || 0);

    // --- 3. UI STATE ---
    // --- เวลาในเกม ---
    // 09:00 → 21:00 = 12 ชม.เกม ใน 36 นาทีจริง
    // 3 วินาทีจริง = 1 นาทีเกม (720 นาทีเกม = 36 นาทีจริง)
    const GAME_START_HOUR = 8;
    const GAME_END_HOUR   = 20;
    const REAL_MS_PER_GAME_MINUTE = 3000; // ms จริงต่อ 1 นาทีเกม

    const [gameMinutes, setGameMinutes] = useState(0); // 0 = 09:00, 720 = 21:00

    // --- helper: แปลง gameMinutes → { hour, minute, display, progress } ---
    const getGameTime = (mins) => {
        const totalMins = GAME_START_HOUR * 60 + mins;
        const h = Math.floor(totalMins / 60) % 24;
        const m = totalMins % 60;
        const display = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        const progress = Math.min(100, (mins / 720) * 100); // 720 = 12 ชม. * 60
        const isEvening = h >= 18;  // 18:00+ = กลางคืน
        const isNight   = h >= 20;  // 20:00+ = ดึกมาก
        return { h, m, display, progress, isEvening, isNight };
    };
    const gameTime = getGameTime(gameMinutes);

    const [windows, setWindows] = useState([]);
    const [minimizedWindows, setMinimizedWindows] = useState([]);
    const [activeWindowId, setActiveWindowId] = useState(null);
    const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
    const [isPauseMenuOpen, setIsPauseMenuOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, targetFile: null });

    // --- 4. FILE SYSTEM ---
    const [userFiles, setUserFiles] = useState(() => {
        try { return JSON.parse(localStorage.getItem('game_filesystem') || '[]'); } catch { return []; }
    });
    const [recycleBin, setRecycleBin] = useState(() => {
        try { return JSON.parse(localStorage.getItem('game_recycleBin') || '[]'); } catch { return []; }
    });

    const updateFiles = useCallback((nf) => { setUserFiles(nf); localStorage.setItem('game_filesystem', JSON.stringify(nf)); }, []);
    const updateBin = useCallback((nb) => { setRecycleBin(nb); localStorage.setItem('game_recycleBin', JSON.stringify(nb)); }, []);

    // --- 5. BOOT SEQUENCE ---
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) { navigate('/'); return; }
        setUserData(JSON.parse(userStr));

        const timers = [];
        BIOS_LINES.forEach((line) => {
            timers.push(setTimeout(() => setBootLines(prev => [...prev, line]), line.delay));
        });

        timers.push(setTimeout(() => {
            setBootPhase(1);
            let prog = 0;
            const pi = setInterval(() => {
                prog += Math.random() * 15 + 5;
                if (prog >= 100) { prog = 100; clearInterval(pi); setTimeout(() => { setBootPhase(2); setTimeout(() => setGameState("LOGIN"), 800); }, 500); }
                setBootProgress(Math.min(100, prog));
            }, 200);
            timers.push(pi);
        }, 2200));

        return () => timers.forEach(t => clearTimeout(t));
    }, []);

    // --- 6. DESKTOP EFFECTS ---
    useEffect(() => {
        if (gameState !== "DESKTOP") return;

        // Reset เวลาเกมเป็น 09:00 ตอนเริ่มวันใหม่
        setGameMinutes(0);

        // fetchSimState
        const fetchSimState = () => {
            const uid = userData?.user_id || userData?.id;
            if (!uid) return;
            axios.get(`http://localhost:3001/simulation/state/${uid}`)
                .then(r => {
                    setSimState(r.data);
                    if (r.data?.current_hour !== undefined) {
                        const restoredMins = Math.round((Number(r.data.current_hour) - GAME_START_HOUR) * 60);
                        setGameMinutes(Math.max(0, Math.min(720, restoredMins)));
                        gameMinutesRef.current = Math.max(0, Math.min(720, restoredMins));
                    }
                })
                .catch(() => {});

            axios.get(`http://localhost:3001/jobs/my-active-v2/${uid}`)
                .then(r => {
                    if (r.data.length > 0) {
                        setActiveJob(r.data[0]);
                    } else {
                        setActiveJob(null);
                    }
                })
                .catch(() => {});

            axios.get(`http://localhost:3001/simulation/saves/${uid}`)
                .then(r => setSaves(r.data))
                .catch(() => {});
        };
        fetchSimState();

        // ── Game Clock ──────────────────────────────────────────────
        // ทุก REAL_MS_PER_GAME_MINUTE (3000ms) = 1 นาทีเกม
        // 09:00 → 21:00 = 720 นาทีเกม = 36 นาทีจริง
        const clockTimer = setInterval(() => {
            setGameMinutes(prev => {
                const next = prev + 1;
                gameMinutesRef.current = next;
                // ถึง 20:00 (720 นาที) → จบวันอัตโนมัติ
                if (next >= 720) {
                    clearInterval(clockTimer);
                    return 720;
                }
                return next;
            });
        }, REAL_MS_PER_GAME_MINUTE);

        // ── Energy Drain ──────────────────────────────────────────────
        // ลด 100 หน่วยใน 36 นาที → ลดทุก 3 วินาที ครั้งละ 100/720 ≈ 0.139
        // ใช้ REAL_MS_PER_GAME_MINUTE เพื่อให้ sync กับ clock
        const ENERGY_DRAIN_PER_TICK = 100 / 720; // ≈ 0.139 ต่อนาทีเกม
        const energyTimer = setInterval(() => {
            setEnergy(prev => {
                const next = Math.max(0, prev - ENERGY_DRAIN_PER_TICK);
                if (next <= 0) handleShutdown(true);
                return next;
            });
        }, REAL_MS_PER_GAME_MINUTE);

        // ── System Polling (server sync) ─────────────────────────────
        const systemTimer = setInterval(() => {
            const uid = userData?.user_id || userData?.id;
            if (!uid) return;
            fetchSimState();
            
            // Sync time to server
            const currentHour = GAME_START_HOUR + (gameMinutesRef.current / 60);
            axios.post('http://localhost:3001/simulation/sync-time', {
                userId: uid,
                currentHour: currentHour
            }).catch(() => {});

            axios.get('http://localhost:3001/jobs/available', {
                params: { userId: uid }
            }).then(r => {
                const c = r.data.length;
                if (c > lastJobCountRef.current) setJobNotification(true);
                if (c === 0) setJobNotification(false);
                lastJobCountRef.current = c;
            }).catch(() => {});
        }, 15000); // sync ทุก 15 วินาทีจริง (= 5 นาทีเกม)

        // ── Onboard ──────────────────────────────────────────────────
        let onboardTimer;
        if (!hasOnboarded) {
            onboardTimer = setTimeout(() => {
                if (!windows.find(w => w.id === 'jobs')) {
                    openApp('jobs', 'DevFreelance', 'jobs');
                    setHasOnboarded(true);
                    localStorage.setItem('hasOnboarded', 'true');
                    setJobNotification(false);
                }
            }, 1500);
        }

        const handleEsc = (e) => { if (e.key === 'Escape') setIsPauseMenuOpen(p => !p); };
        window.addEventListener('keydown', handleEsc);

        return () => {
            clearInterval(clockTimer);
            clearInterval(energyTimer);
            clearInterval(systemTimer);
            if (onboardTimer) clearTimeout(onboardTimer);
            window.removeEventListener('keydown', handleEsc);
        };
    }, [gameState, userData?.id, hasOnboarded, windows]); // eslint-disable-line react-hooks/exhaustive-deps

    // --- 6.5 AUTO END DAY เมื่อถึง 21:00 ---
    useEffect(() => {
        if (gameState !== "DESKTOP") return;
        if (gameMinutes >= 720 && !isEndingDay) {
            handleShutdown(false); // จบวันปกติ
        }
    }, [gameMinutes, gameState]);

    // --- 7. FUNCTIONS ---
    const openApp = (appId, title, type, params = {}) => {
        if (appId === 'jobs') setJobNotification(false);
        if (minimizedWindows.includes(appId)) { setMinimizedWindows(p => p.filter(id => id !== appId)); setActiveWindowId(appId); return; }
        if (windows.find(w => w.id === appId)) { setActiveWindowId(appId); return; }
        setWindows(p => [...p, { id: appId, title, type, params }]); setActiveWindowId(appId); setIsStartMenuOpen(false);
    };
    const closeApp = (appId) => { setWindows(p => p.filter(w => w.id !== appId)); setMinimizedWindows(p => p.filter(id => id !== appId)); };
    const toggleMinimize = (appId) => {
        if (minimizedWindows.includes(appId)) { setMinimizedWindows(p => p.filter(id => id !== appId)); setActiveWindowId(appId); }
        else { setMinimizedWindows([...minimizedWindows, appId]); setActiveWindowId(null); }
    };

    const handleCreateFile = (f) => updateFiles([...userFiles, f]);
    const handleDeleteFile = (fileId) => {
        const file = userFiles.find(f => f.id === fileId); if (!file) return;
        const ids = [fileId];
        const collect = (pid) => { userFiles.filter(f => f.parentId === pid).forEach(c => { ids.push(c.id); if (c.type === 'folder') collect(c.id); }); };
        if (file.type === 'folder') collect(fileId);
        const deleted = userFiles.filter(f => ids.includes(f.id)).map(f => ({ ...f, deletedAt: new Date().toISOString() }));
        updateFiles(userFiles.filter(f => !ids.includes(f.id))); updateBin([...recycleBin, ...deleted]);
    };
    const handleUpdateFile = (fid, content) => updateFiles(userFiles.map(f => f.id === fid ? { ...f, content } : f));
    const handleRestoreFile = (fid) => { const i = recycleBin.find(f => f.id === fid); if (!i) return; const { deletedAt, ...r } = i; updateFiles([...userFiles, r]); updateBin(recycleBin.filter(f => f.id !== fid)); };
    const handleDeletePermanent = (fid) => updateBin(recycleBin.filter(f => f.id !== fid));
    const handleEmptyBin = () => updateBin([]);
    const handleOpenFile = (file) => {
        const ext = file.name.split('.').pop()?.toLowerCase(); const wid = `file_${file.id}`;
        if (ext === 'py' || ext === 'js') openApp(wid, file.name, 'code', { folderId: file.parentId, initialFileId: file.id });
        else openApp(wid, file.name, 'notepad', { fileId: file.id });
    };
    const handleContextMenu = (e, targetFile = null) => { e.preventDefault(); setContextMenu({ visible: true, x: e.clientX, y: e.clientY, targetFile }); };
    const createNewFile = (type) => {
        const name = prompt(`Enter ${type} Name:`, type === 'Folder' ? 'New Folder' : 'new_file.txt');
        if (name) handleCreateFile({ id: Date.now(), name, type: type === 'Folder' ? 'folder' : 'file', parentId: null, content: type !== 'Folder' ? '' : undefined, createdAt: new Date().toISOString(), pos: { x: contextMenu.x, y: contextMenu.y } });
        setContextMenu({ ...contextMenu, visible: false });
    };
    const handleMoveFile = (fid, tid) => updateFiles(userFiles.map(f => { if (f.id === fid) { const { pos, ...r } = f; return { ...r, parentId: tid }; } return f; }));
    const handleDropOnBin = (d) => { if (d?.fileId) handleDeleteFile(d.fileId); };
    const handleDropOnFolder = (fid, d) => { if (d?.fileId && d.fileId !== fid) handleMoveFile(d.fileId, fid); };
    const handleDeleteFromDesktop = () => { if (contextMenu.targetFile) handleDeleteFile(contextMenu.targetFile.id); setContextMenu({ ...contextMenu, visible: false }); };

    const handleShutdown = async (forced = false) => {
        if (isEndingDay) return;
        setIsEndingDay(true);
        const uid = userData?.user_id || userData?.id;
        try {
            const res = await axios.post('http://localhost:3001/simulation/next-day', { userId: uid });
            const data = res.data;

            if (data.gameOver) {
                // Game Over
                setDailySummary({
                    gameOver: true,
                    finalDay: data.finalDay,
                    finalMoney: data.finalMoney,
                    jobsCompleted: data.jobsCompleted,
                    reason: data.reason,
                    events: [`💀 ${data.reason}`],
                    earned: 0, spent: 0,
                    rentDue: true, rentPaid: false, rentDeducted: 0,
                    daysUntilRent: 0, day: data.finalDay
                });
                setGameState("GAME_OVER");
                return;
            }

            // Build events list
            const events = [...(data.summary.rentEvents || [])];
            if (forced) events.push("⚠️ หมดพลังงาน — บันทึกข้อมูลบางส่วนอาจหาย");
            if (data.summary.todayJobsDone > 0)
                events.push(`✅ ส่งงานวันนี้ ${data.summary.todayJobsDone} งาน`);
            if (events.length === 0)
                events.push("📝 วันนี้ยังไม่ได้ส่งงาน — ค่าเช่ากำลังใกล้เข้ามา!");

            setDailySummary({
                gameOver: false,
                earned: data.summary.todayEarned,
                spent: data.rentDeducted,
                events,
                rentDue: data.rentDue,
                rentPaid: data.rentPaid,
                rentDeducted: data.rentDeducted,
                daysUntilRent: data.daysUntilRent,
                day: data.summary.day,
                newDay: data.newDay,
                money: data.money,
            });
            // อัปเดต simState ทันที
            setSimState(prev => ({ ...prev, current_day: data.newDay, sim_money: data.money }));
            setGameState("SUMMARY");
        } catch (err) {
            console.error("❌ next-day error:", err);
            // Fallback: ถ้า server ล่ม ให้ข้ามวันโดยไม่เช็คค่าเช่า
            setDailySummary({
                gameOver: false, earned: 0, spent: 0,
                events: ["⚠️ ไม่สามารถเชื่อมต่อ server ได้"],
                rentDue: false, rentPaid: false, rentDeducted: 0, daysUntilRent: 7,
                day: day
            });
            setGameState("SUMMARY");
        } finally {
            setIsEndingDay(false);
        }
    };
    const startNextDay = () => {
        setGameMinutes(0);   // reset เวลาเกมเป็น 09:00
        setEnergy(100);
        setGameState("DESKTOP");
    };
    const handleAcceptJob = (job) => setActiveJob(job);
    const handleJobComplete = () => { setActiveJob(null); closeApp('code'); };

    const handleSaveGame = async (slotNum) => {
        const uid = userData?.user_id || userData?.id;
        if (!uid) return;

        const target = saves[slotNum - 1];
        if (target) {
            if (target.is_locked === 1) {
                alert("Cannot overwrite a locked save slot.");
                return;
            }
            const confirmText = "คุณต้องการเซฟทับช่องเซฟนี้ใช่หรือไม่? ข้อมูลเดิมจะถูกลบ";
            if (!window.confirm(confirmText)) return;
        }

        try {
            const res = await axios.post('http://localhost:3001/simulation/save', {
                userId: uid,
                slotNumber: slotNum
            });
            if (res.data.success) {
                alert("Game Saved Successfully!");
                setShowSavesModal(false);
                axios.get(`http://localhost:3001/simulation/saves/${uid}`)
                    .then(r => setSaves(r.data))
                    .catch(() => {});
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save game');
        }
    };

    const handleLoadGame = async (saveId) => {
        const uid = userData?.user_id || userData?.id;
        if (!uid) return;

        try {
            const res = await axios.post('http://localhost:3001/simulation/load', {
                userId: uid,
                saveId: saveId
            });
            if (res.data.success) {
                alert("Game Loaded!");
                setShowSavesModal(false);
                setIsPauseMenuOpen(false);
                fetchSimState();
            }
        } catch (err) {
            alert('Failed to load save');
        }
    };

    const handleDeleteSave = async (saveId) => {
        const uid = userData?.user_id || userData?.id;
        if (!uid) return;

        const confirmText = "คุณต้องการลบเซฟนี้ใช่หรือไม่? ข้อมูลทั้งหมดจะหายไปและไม่สามารถกู้คืนได้";
        if (!window.confirm(confirmText)) return;

        try {
            const res = await axios.post('http://localhost:3001/simulation/delete', {
                userId: uid,
                saveId: saveId
            });
            if (res.data.success) {
                axios.get(`http://localhost:3001/simulation/saves/${uid}`)
                    .then(r => setSaves(r.data))
                    .catch(() => {});
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete save');
        }
    };

    const handleToggleLock = async (saveId, currentLocked) => {
        const uid = userData?.user_id || userData?.id;
        if (!uid) return;

        try {
            const res = await axios.post('http://localhost:3001/simulation/toggle-lock', {
                userId: uid,
                saveId: saveId,
                isLocked: !currentLocked
            });
            if (res.data.success) {
                axios.get(`http://localhost:3001/simulation/saves/${uid}`)
                    .then(r => setSaves(r.data))
                    .catch(() => {});
            }
        } catch (err) {
            alert('Failed to toggle lock status');
        }
    };

    const renderWindow = (win) => {
        switch (win.type) {
            case 'pc': return <MyComputer files={userFiles} onCreateFile={handleCreateFile} onDeleteFile={handleDeleteFile} onOpenFile={handleOpenFile} initialFolderId={win.params?.initialFolderId} />;
            case 'bin': return <RecycleBin items={recycleBin} onRestore={handleRestoreFile} onDeletePermanent={handleDeletePermanent} onEmptyBin={handleEmptyBin} />;
            case 'code': return <CodeEditor files={userFiles} folderId={win.params?.folderId} onCreateFile={handleCreateFile} onDeleteFile={handleDeleteFile} onUpdateFile={handleUpdateFile} />;
            case 'notepad': const nf = userFiles.find(f => f.id === win.params?.fileId); return <Notepad fileId={win.params?.fileId} fileName={nf?.name || 'Untitled'} content={nf?.content || ''} onSave={handleUpdateFile} />;
            case 'mail': return <EmailClient />;
            case 'jobs': return <JobPlatform 
                onAcceptJob={handleAcceptJob} 
                userData={{ ...userData, id: userData?.user_id || userData?.id }} 
                files={userFiles}
                currentDay={day}
                currentHour={GAME_START_HOUR + (gameMinutes / 60)} />;
            default: return <div className="p-4 text-t-muted">Unknown app</div>;
        }
    };

    // =============================================
    // RENDER: BOOT SEQUENCE
    // =============================================
    if (gameState === "BOOT") {
        return (
            <div className="h-screen font-mono relative overflow-hidden select-none transition-colors duration-300"
                style={{ background: 'var(--t-boot-bg)' }}>
                <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
                    style={{ background: `repeating-linear-gradient(0deg, transparent, transparent 2px, var(--t-boot-scanline) 2px, var(--t-boot-scanline) 4px)` }} />

                {bootPhase === 0 && (
                    <div className="p-8 animate-fade-in">
                        {bootLines.map((line, i) => (
                            <div key={i} className={`${line.cls || 'text-t-success'} text-sm mb-0.5 animate-fade-in`}
                                style={{ animationDelay: `${i * 50}ms` }}>{line.text}</div>
                        ))}
                        <span className="inline-block w-2 h-4 bg-t-accent animate-blink mt-2"></span>
                    </div>
                )}

                {bootPhase === 1 && (
                    <div className="h-full flex flex-col items-center justify-center animate-fade-in">
                        <div className="mb-8 relative">
                            <div className="text-5xl font-black text-t-accent animate-neon-pulse">⟨/⟩</div>
                            <div className="absolute -top-3 -right-4 text-sm opacity-60 animate-cat-blink select-none">🐱</div>
                        </div>
                        <h2 className="text-t-text text-xl font-bold mb-2 tracking-widest">PythonCoderOS</h2>
                        <p className="text-t-muted text-xs mb-8 tracking-wider">v2.0.26 BUILD 20260227</p>
                        <div className="w-72 h-1.5 rounded-full overflow-hidden border"
                            style={{ background: 'var(--t-input)', borderColor: 'var(--t-border)' }}>
                            <div className="h-full bg-t-accent rounded-full transition-all duration-300"
                                style={{ width: `${bootProgress}%` }} />
                        </div>
                        <p className="text-t-muted text-xs mt-3 font-mono">
                            {bootProgress < 30 ? 'Loading kernel modules...' : bootProgress < 60 ? 'Initializing services...' : bootProgress < 90 ? 'Starting desktop environment...' : 'Almost ready...'}
                        </p>
                    </div>
                )}

                {bootPhase === 2 && (
                    <div className="h-full animate-fade-in" style={{ animationDuration: '0.3s', background: isDark ? 'white' : 'var(--t-bg)' }} />
                )}
            </div>
        );
    }

    // =============================================
    // RENDER: LOGIN SCREEN
    // =============================================
    if (gameState === "LOGIN") {
        return (
            <div className="h-screen relative overflow-hidden flex flex-col items-center justify-center transition-colors duration-300">
                <div className="absolute inset-0 bg-animated-gradient pointer-events-none"></div>
                <div className="absolute inset-0 bg-dots-pattern opacity-20 pointer-events-none"></div>

                <div className="glass-panel p-10 rounded-3xl flex flex-col items-center relative z-10 animate-scale-in
                    shadow-[0_0_60px_var(--t-glow)] border border-t-border">
                    <div className="w-28 h-28 rounded-full flex items-center justify-center text-5xl font-black text-white mb-6 relative
                        bg-gradient-to-br from-t-accent to-t-accent-2 shadow-[0_0_30px_var(--t-glow)] border-4 border-t-border animate-pulse-glow">
                        {userData?.username?.[0].toUpperCase()}
                    </div>
                    <h2 className="text-3xl text-t-text font-bold mb-2">{userData?.username}</h2>
                    <p className="text-t-muted text-sm mb-8">Welcome back, Developer</p>
                    <button onClick={() => setGameState("DESKTOP")}
                        className="px-12 py-3.5 rounded-2xl font-bold text-white text-sm tracking-wider uppercase
                        bg-t-accent-soft border border-t-border hover:border-t-border-accent
                        hover:bg-t-accent/20 hover:shadow-[0_0_25px_var(--t-glow)]
                        transition-all duration-300 active:scale-95 text-t-accent">LOGIN</button>
                    <div className="absolute -bottom-6 right-2 flex gap-3 opacity-30 text-xs select-none">
                        <span>🐾</span><span className="mt-1">🐾</span><span>🐾</span>
                    </div>
                </div>
                <div className="absolute bottom-8 text-t-muted text-sm font-mono">
                    {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    <span className="ml-2 opacity-50">— Day {day}</span>
                </div>
            </div>
        );
    }

    // =============================================
    // RENDER: DAILY SUMMARY
    // =============================================
    // =============================================
    // RENDER: GAME OVER
    // =============================================
    if (gameState === "GAME_OVER") {
        return (
            <div className="h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-300">
                <div className="absolute inset-0 bg-black pointer-events-none"></div>
                <div className="relative z-10 text-center animate-scale-in max-w-lg w-full px-6">
                    <div className="text-8xl mb-6 animate-bounce">💀</div>
                    <h1 className="text-5xl font-black text-red-500 mb-2 tracking-wider uppercase">Game Over</h1>
                    <p className="text-red-300 text-lg mb-8">{dailySummary.reason}</p>

                    <div className="bg-gray-900 border border-red-900/50 rounded-2xl p-6 mb-8 text-left space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">อยู่รอดมาได้</span>
                            <span className="text-white font-bold">{dailySummary.finalDay} วัน</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">เงินสุดท้าย</span>
                            <span className="text-red-400 font-bold">{(dailySummary.finalMoney || 0).toLocaleString()} ฿</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">งานที่ทำสำเร็จ</span>
                            <span className="text-white font-bold">{dailySummary.jobsCompleted || 0} งาน</span>
                        </div>
                    </div>

                    <button
                        onClick={async () => {
                            const uid = userData?.user_id || userData?.id;
                            await axios.post('http://localhost:3001/simulation/new-game', { userId: uid });
                            setSimState(null);
                            setEnergy(100);
                            setGameState("DESKTOP");
                        }}
                        className="w-full py-4 rounded-xl font-black text-lg text-white uppercase tracking-wider
                            bg-red-600 hover:bg-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]
                            transition-all duration-300 active:scale-[0.98]"
                    >
                        🔄 เริ่มใหม่
                    </button>
                </div>
            </div>
        );
    }

    // =============================================
    // RENDER: DAILY SUMMARY
    // =============================================
    if (gameState === "SUMMARY") {
        const netBalance = (dailySummary.earned || 0) - (dailySummary.rentDeducted || 0);
        return (
            <div className="h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-300">
                <div className="absolute inset-0 bg-animated-gradient pointer-events-none"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

                <div className="glass-panel p-8 rounded-2xl max-w-lg w-full relative z-10 animate-scale-in shadow-[0_0_40px_var(--t-glow)]">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full
                        bg-gradient-to-r from-cat-orange to-cat-amber text-black font-black text-sm tracking-wider
                        shadow-[0_0_20px_rgba(249,115,22,0.4)] animate-bounce-in whitespace-nowrap">
                        DAY {dailySummary.day} COMPLETE! 🐱
                    </div>

                    <h1 className="text-2xl font-black text-center mb-6 mt-4 text-t-text tracking-wider uppercase">Daily Report</h1>

                    <div className="space-y-3 mb-6">
                        {/* รายรับวันนี้ */}
                        <div className="flex justify-between items-center p-3 rounded-xl bg-t-success-soft border border-t-success/20">
                            <span className="text-t-text-soft text-sm">รายรับวันนี้</span>
                            <span className="text-t-success font-bold text-lg">+{(dailySummary.earned || 0).toLocaleString()} ฿</span>
                        </div>

                        {/* ค่าเช่า (แสดงเฉพาะวันที่ถึงกำหนด) */}
                        {dailySummary.rentDue && (
                            <div className={`flex justify-between items-center p-3 rounded-xl border ${
                                dailySummary.rentPaid
                                    ? 'bg-t-success-soft border-t-success/20'
                                    : 'bg-t-danger-soft border-t-danger/20'
                            }`}>
                                <span className="text-t-text-soft text-sm">
                                    {dailySummary.rentPaid ? '🏠 จ่ายค่าเช่าแล้ว' : '🏠 ค่าเช่า'}
                                </span>
                                <span className={`font-bold text-lg ${dailySummary.rentPaid ? 'text-t-success' : 'text-t-danger'}`}>
                                    -{(dailySummary.rentDeducted || RENT_AMOUNT).toLocaleString()} ฿
                                </span>
                            </div>
                        )}

                        {/* Events log */}
                        <div className="p-4 rounded-xl text-sm text-t-text-soft space-y-1.5 border border-t-border" style={{ background: 'var(--t-input)' }}>
                            {dailySummary.events.map((e, i) => <div key={i}>{e}</div>)}
                            <div className="text-cat-orange/60 text-xs mt-2 italic">เหมียว~ วันนี้ทำงานเก่งมาก!</div>
                        </div>

                        {/* เงินคงเหลือ + ค่าเช่าถัดไป */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-t-card border border-t-border text-center">
                                <div className="text-xs text-t-muted uppercase tracking-widest mb-1">เงินปัจจุบัน</div>
                                <div className="text-xl font-black text-t-text">
                                    {(dailySummary.money ?? currentMoney).toLocaleString()}
                                    <span className="text-sm font-normal text-t-muted ml-1">฿</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-t-danger-soft border border-t-danger/20 text-center">
                                <div className="text-xs text-t-danger uppercase tracking-widest mb-1">ค่าเช่าใน</div>
                                <div className="text-xl font-black text-t-text">
                                    {dailySummary.daysUntilRent}
                                    <span className="text-sm font-normal text-t-muted ml-1">วัน</span>
                                </div>
                                <div className="text-[10px] text-t-danger mt-0.5">{RENT_AMOUNT.toLocaleString()} ฿</div>
                            </div>
                        </div>
                    </div>

                    <button onClick={startNextDay}
                        className="w-full py-4 rounded-xl font-bold text-lg text-white uppercase tracking-wider
                        bg-t-accent hover:bg-t-accent-hover hover:shadow-[0_0_25px_var(--t-glow)]
                        transition-all duration-300 active:scale-[0.98]">
                        Start Day {(dailySummary.newDay || day + 1)}
                    </button>
                </div>
            </div>
        );
    }

    // =============================================
    // RENDER: DESKTOP
    // =============================================
    return (
        <div className="w-screen h-screen overflow-hidden relative font-sans select-none transition-colors duration-300"
            onContextMenu={(e) => handleContextMenu(e)}
            onClick={() => { setContextMenu({ ...contextMenu, visible: false }); setIsStartMenuOpen(false); }}>
            
            <div className="absolute inset-0 bg-animated-gradient pointer-events-none"></div>
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.06] pointer-events-none"></div>
            <div className="absolute bottom-14 right-8 opacity-[0.04] text-[80px] select-none pointer-events-none">🐱</div>

            {/* Desktop Icons */}
            <DraggableIcon id="pc" label="My Computer" icon={<Monitor size={28} />} initialPos={{ x: 20, y: 20 }} onOpen={() => openApp('pc', 'My Computer', 'pc')} onContextMenu={handleContextMenu} />
            <DraggableIcon id="bin" label="Recycle Bin" icon={<Trash2 size={28} />} initialPos={{ x: 20, y: 110 }} onOpen={() => openApp('bin', 'Recycle Bin', 'bin')} onContextMenu={handleContextMenu} isDropTarget onFileDrop={handleDropOnBin} dropHighlightColor="ring-red-400" />
            <DraggableIcon id="code" label="VS Code" icon={<Code size={28} />} initialPos={{ x: 20, y: 200 }} onOpen={() => openApp('code', 'VS Code', 'code')} onContextMenu={handleContextMenu} />
            <DraggableIcon id="jobs" label="Freelance" initialPos={{ x: 20, y: 290 }} onOpen={() => openApp('jobs', 'DevFreelance', 'jobs')} onContextMenu={handleContextMenu}
                icon={<div className="relative"><Briefcase size={28} />{jobNotification && (<span className="absolute -top-1 -right-1 flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span></span>)}</div>} />
            <DraggableIcon id="settings" label="Game Menu" icon={<Settings size={28} />} initialPos={{ x: 20, y: 470 }} onOpen={() => setIsPauseMenuOpen(true)} onContextMenu={handleContextMenu} />

            {userFiles.filter(f => !f.parentId && f.pos).map(f => (
                <DraggableIcon key={f.id} id={f.id} label={f.name} initialPos={f.pos}
                    icon={f.type === 'folder' ? <Folder size={28} className="text-cat-amber" /> : <File size={28} className="text-t-text-soft" />}
                    onOpen={() => f.type === 'folder' ? openApp(`pc_${f.id}`, f.name, 'pc', { initialFolderId: f.id }) : handleOpenFile(f)}
                    onContextMenu={(e) => handleContextMenu(e, f)} dragData={{ fileId: f.id, fileName: f.name, fileType: f.type }}
                    isDropTarget={f.type === 'folder'} onFileDrop={(data) => handleDropOnFolder(f.id, data)} />
            ))}

            {/* Windows */}
            {windows.map(win => (
                <div key={win.id} style={{ display: minimizedWindows.includes(win.id) ? 'none' : 'block' }}>
                    <Window id={win.id} title={win.title} onClose={() => closeApp(win.id)} onMinimize={() => toggleMinimize(win.id)} isActive={activeWindowId === win.id} onFocus={() => setActiveWindowId(win.id)}>
                        {renderWindow(win)}
                    </Window>
                </div>
            ))}

            {/* Context Menu */}
            {contextMenu.visible && (
                <div className="absolute glass-panel rounded-xl shadow-2xl py-1.5 w-48 z-50 text-t-text text-sm animate-slide-menu overflow-hidden"
                    style={{ top: contextMenu.y, left: contextMenu.x }}>
                    {contextMenu.targetFile ? (
                        <>
                            <div className="px-4 py-1.5 text-xs text-t-muted border-b border-t-border truncate">{contextMenu.targetFile.name}</div>
                            <button onClick={() => { handleOpenFile(contextMenu.targetFile); setContextMenu({...contextMenu, visible: false}); }}
                                className="w-full text-left px-4 py-2.5 hover:bg-t-card-hover flex gap-2 items-center transition-colors"><File size={14} /> Open</button>
                            <button onClick={handleDeleteFromDesktop}
                                className="w-full text-left px-4 py-2.5 hover:bg-t-danger-soft flex gap-2 items-center text-t-danger transition-colors"><Trash2 size={14} /> Delete</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => createNewFile('Folder')} className="w-full text-left px-4 py-2.5 hover:bg-t-card-hover flex gap-2 items-center transition-colors"><Folder size={14} className="text-cat-amber" /> New Folder</button>
                            <button onClick={() => createNewFile('File')} className="w-full text-left px-4 py-2.5 hover:bg-t-card-hover flex gap-2 items-center transition-colors"><File size={14} /> New File</button>
                        </>
                    )}
                </div>
            )}

            {/* Pause Menu */}
            {isPauseMenuOpen && (
                <div className="absolute inset-0 bg-t-overlay backdrop-blur-md z-[60] flex items-center justify-center animate-fade-in">
                    <div className="glass-panel p-8 rounded-2xl shadow-2xl w-96 animate-scale-in border border-t-border">
                        <h2 className="text-2xl font-black text-t-text text-center mb-8 uppercase tracking-[0.3em]">Pause</h2>
                        <div className="space-y-3">
                            <MenuButton icon={<Play size={18} />} label="RESUME" onClick={() => setIsPauseMenuOpen(false)} primary />
                            <MenuButton icon={<Palette size={18} />} label="CHANGE THEME" onClick={() => {
                                const idx = themes.findIndex(t => t.id === theme.id);
                                setTheme(themes[(idx + 1) % themes.length].id);
                            }} />
                            <MenuButton icon={<Settings size={18} />} label="SETTINGS" onClick={() => alert("Settings Modal")} />
                            <MenuButton icon={<Save size={18} />} label="SAVE GAME" onClick={() => { setSavesModalMode('SAVE'); setShowSavesModal(true); }} />
                            <MenuButton icon={<Download size={18} />} label="LOAD GAME" onClick={() => { setSavesModalMode('LOAD'); setShowSavesModal(true); }} />
                            <MenuButton icon={<LogOut size={18} />} label="EXIT TO TITLE" onClick={() => navigate('/menu')} danger />
                        </div>
                    </div>
                </div>
            )}

            {/* Start Menu */}
            {isStartMenuOpen && (
                <div className="absolute bottom-12 left-0 w-80 glass-panel rounded-tr-2xl rounded-tl-2xl shadow-2xl text-t-text z-[60] flex flex-col animate-slide-menu overflow-hidden"
                    onClick={e => e.stopPropagation()}>
                    <div className="p-4 flex items-center gap-3 border-b border-t-border" style={{ background: 'var(--t-input)' }}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-t-accent to-t-accent-2 flex items-center justify-center">
                            <UserCircle size={24} className="text-white" />
                        </div>
                        <div>
                            <div className="font-bold text-t-text">{userData?.username}</div>
                            <div className="text-xs text-t-success flex items-center gap-1"><span className="w-1.5 h-1.5 bg-t-success rounded-full"></span> Online</div>
                        </div>
                    </div>
                    <div className="p-3 border-t border-t-border flex justify-between">
                        <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-3 py-2 hover:bg-t-card-hover rounded-lg text-cat-amber text-sm font-medium transition-colors"><RefreshCw size={14} /> Restart</button>
                        <button 
                        onClick={() => handleShutdown(false)} 
                        disabled={isEndingDay}
                        className={`flex items-center gap-2 px-3 py-2 hover:bg-t-danger-soft rounded-lg text-t-danger text-sm font-medium transition-colors ${isEndingDay ? 'opacity-50 cursor-wait' : ''}`}>
                        <Power size={14} /> {isEndingDay ? 'กำลังบันทึก...' : 'Sleep'}
                    </button>
                    </div>
                </div>
            )}

            {/* Taskbar */}
            <div className="absolute bottom-0 w-full h-12 glass-panel border-t border-t-border flex justify-between items-center px-2 z-[50]">
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setIsStartMenuOpen(!isStartMenuOpen); }}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-white transition-all duration-200
                        bg-gradient-to-r from-cat-orange/80 to-cat-amber/80 hover:from-cat-orange hover:to-cat-amber
                        hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] active:scale-95">
                        <span className="text-sm">🐱</span><span className="font-bold tracking-wide text-xs">Start</span>
                    </button>
                    <div className="w-px h-6 bg-t-border mx-1"></div>
                    <div className="flex gap-1 ml-1">
                        {windows.map(win => (
                            <button key={win.id} onClick={() => toggleMinimize(win.id)}
                                className={`px-3 py-1.5 rounded-md text-xs max-w-[140px] truncate transition-all duration-200
                                ${activeWindowId === win.id && !minimizedWindows.includes(win.id)
                                    ? 'bg-t-accent-soft text-t-text border-b-2 border-t-accent'
                                    : 'text-t-muted hover:bg-t-card-hover border-b-2 border-transparent'}`}>
                                {win.title}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 px-2 h-full">
                    <div className="flex flex-col items-end mr-2">
                        <div className="text-[9px] text-cat-amber font-bold tracking-wider flex items-center gap-1 mb-0.5"><Zap size={9} /> STAMINA</div>
                        <div className="w-28 h-2 rounded-full overflow-hidden border border-t-border" style={{ background: 'var(--t-input)' }}>
                            <div className={`h-full transition-all duration-500 rounded-full ${energy < 20 ? 'bg-red-500 animate-pulse' : energy < 50 ? 'bg-yellow-500' : 'bg-t-success'}`}
                                style={{ width: `${energy}%` }} />
                        </div>
                    </div>
                    {/* แบตเตอรี่จาก simState */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono
                        ${(simState?.battery_percent || 100) < 20 ? 'bg-t-danger-soft text-t-danger' : 'bg-t-card text-t-text-soft'}`}>
                        <span>{simState?.battery_percent || 100}%</span>
                        {simState?.is_plugged_in ? <BatteryCharging size={14} className="text-t-success" /> : <Battery size={14} />}
                    </div>
                    {/* เงินปัจจุบัน */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-t-success-soft text-t-success border border-t-success/20">
                        <span className="font-bold">฿{currentMoney.toLocaleString()}</span>
                    </div>
                    {/* Active Job Timer */}
                    {activeJob && (() => {
                        const currentHour = GAME_START_HOUR + (gameMinutes / 60);
                        const totalDeadlineMins = Number(activeJob.deadline_day) * 12 * 60 + (Number(activeJob.deadline_hour) - 8.0) * 60;
                        const totalCurrentMins = day * 12 * 60 + (currentHour - 8.0) * 60;
                        const diffMins = totalDeadlineMins - totalCurrentMins;
                        const isLate = diffMins <= 0;
                        
                        let timerText = "LATE!";
                        if (!isLate) {
                            const h = Math.floor(diffMins / 60);
                            const m = Math.floor(diffMins % 60);
                            timerText = `${h}h ${m}m`;
                        }

                        return (
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                                isLate 
                                    ? 'bg-red-500/15 text-red-500 border-red-500/35 animate-pulse' 
                                    : 'bg-amber-500/15 text-amber-500 border-amber-500/35'
                            }`} title={`Active Job: ${activeJob.title}`}>
                                <Briefcase size={12} />
                                <span className="truncate max-w-[80px]">{activeJob.title}</span>
                                <span className="opacity-40">|</span>
                                <Clock size={12} />
                                <span>{timerText}</span>
                            </div>
                        );
                    })()}
                    <div className="w-px h-6 bg-t-border"></div>
                    <div className="flex items-center gap-2.5 text-t-muted px-1"><Wifi size={13} /><Volume2 size={13} /></div>
                    <div className="w-px h-6 bg-t-border"></div>
                    <div className="flex flex-col items-end justify-center leading-tight px-1.5 h-full cursor-default min-w-[64px]">
                        {/* เวลาในเกม */}
                        <div className={`text-xs font-bold font-mono tracking-wider ${
                            gameTime.isNight   ? 'text-purple-400' :
                            gameTime.isEvening ? 'text-orange-400' :
                            'text-t-text'
                        }`}>
                            {gameTime.display}
                            <span className="ml-1 text-[9px] font-normal opacity-60">
                                {gameTime.isNight ? '🌙' : gameTime.isEvening ? '🌆' : '☀️'}
                            </span>
                        </div>
                        {/* Day N */}
                        <div className="text-[9px] text-t-muted font-mono">Day {day}</div>
                        {/* Progress bar เวลา */}
                        <div className="w-full h-0.5 rounded-full mt-0.5 overflow-hidden" style={{ background: 'var(--t-border)' }}>
                            <div
                                className={`h-full rounded-full transition-all duration-[3000ms] ease-linear ${
                                    gameTime.isNight   ? 'bg-purple-400' :
                                    gameTime.isEvening ? 'bg-orange-400' :
                                    'bg-t-accent'
                                }`}
                                style={{ width: `${gameTime.progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Saves Modal inside Desktop */}
            {showSavesModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setShowSavesModal(false)}
                >
                    <div
                        className="w-full max-w-xl rounded-2xl bg-t-card border border-t-border p-6 shadow-2xl animate-scale-in text-t-text"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6 border-b border-t-border pb-4">
                            <h2 className="text-xl font-black flex items-center gap-2 tracking-wider">
                                {savesModalMode === 'SAVE' ? '💾 SAVE GAME' : '📂 LOAD GAME'}
                            </h2>
                            <button
                                onClick={() => setShowSavesModal(false)}
                                className="p-1.5 hover:bg-t-card-hover hover:text-t-danger rounded-full border border-t-border transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {[0, 1, 2].map((index) => {
                                const save = saves[index];
                                return (
                                    <div
                                        key={index}
                                        className={`border rounded-xl p-4 flex items-center justify-between transition-all ${
                                            save
                                                ? 'border-t-accent/20 bg-t-accent-soft/10'
                                                : 'border-dashed border-t-border bg-t-card-hover/20'
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-t-accent text-white text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                                                    SLOT {index + 1}
                                                </span>
                                                <span className="font-bold text-t-text text-sm truncate">
                                                    {save ? save.save_name : 'Empty Slot'}
                                                </span>
                                                {save?.is_locked === 1 && (
                                                    <Lock size={12} className="text-t-danger" />
                                                )}
                                            </div>
                                            {save && (
                                                <div className="flex gap-3 text-[11px] text-t-muted font-medium">
                                                    <span>📅 Day {save.current_day}</span>
                                                    <span>💰 ฿{Number(save.sim_money).toLocaleString()}</span>
                                                    <span className="truncate">🕒 {new Date(save.updated_at).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {savesModalMode === 'SAVE' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleSaveGame(index + 1)}
                                                        className="px-3.5 py-2 bg-t-accent hover:bg-t-accent-hover text-white rounded-lg shadow-lg shadow-t-accent/20 text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
                                                    >
                                                        <Save size={12} /> {save ? 'OVERWRITE' : 'SAVE'}
                                                    </button>

                                                    {save && (
                                                        <>
                                                            <button
                                                                onClick={() => handleToggleLock(save.save_id, save.is_locked === 1)}
                                                                className={`p-2 rounded-lg border transition-all active:scale-95 ${
                                                                    save.is_locked === 1
                                                                        ? 'bg-t-danger-soft/20 border-t-danger/20 text-t-danger hover:bg-t-danger-soft/30'
                                                                        : 'bg-t-card border-t-border text-t-text hover:bg-t-card-hover'
                                                                }`}
                                                                title={save.is_locked === 1 ? 'Unlock Slot' : 'Lock Slot'}
                                                            >
                                                                {save.is_locked === 1 ? <Lock size={14} /> : <Unlock size={14} />}
                                                            </button>

                                                            <button
                                                                onClick={() => handleDeleteSave(save.save_id)}
                                                                disabled={save.is_locked === 1}
                                                                className={`p-2 rounded-lg border transition-all active:scale-95 ${
                                                                    save.is_locked === 1
                                                                        ? 'bg-t-card border-t-border text-t-muted opacity-50 cursor-not-allowed'
                                                                        : 'bg-t-danger-soft/10 border-t-danger/10 text-t-danger hover:bg-t-danger-soft/20'
                                                                }`}
                                                                title="Delete Save"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {save ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleLoadGame(save.save_id)}
                                                                className="px-3.5 py-2 bg-t-success hover:bg-t-success-hover text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
                                                            >
                                                                <Play size={12} fill="white" /> LOAD
                                                            </button>

                                                            <button
                                                                onClick={() => handleToggleLock(save.save_id, save.is_locked === 1)}
                                                                className={`p-2 rounded-lg border transition-all active:scale-95 ${
                                                                    save.is_locked === 1
                                                                        ? 'bg-t-danger-soft/20 border-t-danger/20 text-t-danger'
                                                                        : 'bg-t-card border-t-border text-t-text hover:bg-t-card-hover'
                                                                }`}
                                                                title={save.is_locked === 1 ? 'Unlock Slot' : 'Lock Slot'}
                                                            >
                                                                {save.is_locked === 1 ? <Lock size={14} /> : <Unlock size={14} />}
                                                            </button>

                                                            <button
                                                                onClick={() => handleDeleteSave(save.save_id)}
                                                                disabled={save.is_locked === 1}
                                                                className={`p-2 rounded-lg border transition-all active:scale-95 ${
                                                                    save.is_locked === 1
                                                                        ? 'bg-t-card border-t-border text-t-muted opacity-50 cursor-not-allowed'
                                                                        : 'bg-t-danger-soft/10 border-t-danger/10 text-t-danger hover:bg-t-danger-soft/20'
                                                                }`}
                                                                title="Delete Save"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-t-muted select-none italic">Empty Slot</span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MenuButton({ icon, label, onClick, primary, danger }) {
    let base = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 text-sm active:scale-[0.98] ";
    if (primary) base += "bg-t-accent hover:bg-t-accent-hover text-white hover:shadow-[0_0_20px_var(--t-glow)]";
    else if (danger) base += "bg-t-danger-soft hover:bg-t-danger/20 text-t-danger border border-t-danger/20";
    else base += "bg-t-card hover:bg-t-card-hover text-t-text-soft border border-t-border";
    return <button onClick={onClick} className={base}>{icon} {label}</button>;
}