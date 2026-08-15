import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Trophy, 
  Gamepad2, 
  Zap, 
  Dice5, 
  BookOpen, 
  Users, 
  Bot, 
  Play, 
  Flame, 
  Shield, 
  HelpCircle, 
  ArrowLeft, 
  VolumeX, 
  Sparkles,
  AlertTriangle,
  RotateCcw,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { botManager } from '../bot/botManager.js';
import usePyodide from '../hooks/usePyodide.js';

// --- Localized texts to prevent mixing languages ---
const TRANSLATIONS = {
  en: {
    title: "Arcade Battle Royale",
    statusFinding: "Status: Scanning for opponents...",
    startMatch: "Start Battle",
    shopPhase: "Shop Intermission",
    timeRemaining: "Time remaining:",
    yourCash: "Your Balance:",
    reroll: "Reroll Shop",
    purchase: "Buy",
    inventory: "YOUR INVENTORY",
    empty: "No items",
    cancelTargeting: "Cancel debuff targeting",
    lobbyStatus: "BATTLEFIELD ALIVE PLAYERS",
    pickTarget: "PICK TARGET",
    clickToAttack: "LAUNCH ATTACK",
    eliminated: "ELIMINATED",
    matchOver: "Arena Match Over",
    winner: "CHAMPION",
    playAgain: "Find Another Match",
    spectatorMode: "SPECTATING MODE",
    price: "Price:",
    type: "TYPE:",
    targetAttack: "🔴 Target Debuff",
    aoeAttack: "🟣 Area of Effect (All)",
    selfBuff: "🟢 Self Support",
    notEnoughCash: "Insufficient Survival Cash!",
    notEnoughCashReroll: "Not enough cash to reroll shop!",
    bought: "Purchased",
    selectTarget: "Select target to strike with",
    fromLobby: "from the players panel on the right!",
    aiHint: "💡 AI Advice: Try using a loop or dictionary to speed up matches.",
    aiActivated: "AI Assistant online! Hint revealed.",
    shieldActivated: "Firewall activated! Next attack will be blocked.",
    soldOut: "SOLD OUT",
    deployed: "Deployed",
    allEnemiesAffected: "All active opponents hit!",
    stole: "Stole",
    from: "from",
    fired: "Fired",
    at: "at",
    backspaceLocked: "🔒 Backspace is locked by opponent!",
    round1Over: "Round 1 Finished! Enter the Shop.",
    round2Start: "Round 2 Started! Bottom 2 will be eliminated.",
    finalRound: "Final Round! Top 3 battle for victory.",
    matchFinished: "Game Over!",
    youEliminated: "You have been eliminated!",
    wasEliminated: "was eliminated!",
    blockedAttack: "🛡️ Firewall successfully absorbed the attack!",
    used: "used",
    andStole: "and stole",
    hitYouWith: "struck you with",
    itemGlossary: "Item Guide",
    langBtn: "🇹🇭 ภาษาไทย",
    round1Note: "Round 1: Pure Skill. Debuffs disabled.",
    codeOutput: "Console output",
    runTests: "Run local tests",
    submitCode: "Submit solution",
    testsPassed: "All tests passed! Ready for submission.",
    codeEmpty: "Please write some code before submitting.",
    judgingCode: "🧪 Judging your code...",
    pythonFile: "arcade_main.py",
    backToHub: "Exit to Hub",
    activeEffects: "Active Debuffs",
    
    // Items
    inkFogName: "Ink Fog",
    inkFogDesc: "Blurs target editor screen for 15 seconds.",
    backspaceLockName: "Backspace Lock",
    backspaceLockDesc: "Disables target backspace key for 10 seconds.",
    keyScramblerName: "Key Scrambler",
    keyScramblerDesc: "Scrambles specific typed letters for 10 seconds.",
    aiHelperName: "AI Code Helper",
    aiHelperDesc: "Requests AI hint for the current python problem.",
    screenShakeName: "Earthquake",
    screenShakeDesc: "Shakes target screen violently for 8 seconds.",
    typoGeneratorName: "Glitch Injector",
    typoGeneratorDesc: "Injects random typos into target editor for 10 seconds.",
    timeFreezeName: "Time Freeze",
    timeFreezeDesc: "Freezes all active opponents from typing for 5 seconds.",
    blackoutName: "EMP Strike",
    blackoutDesc: "Turns off target screens completely for 8 seconds.",
    shieldName: "Firewall Shield",
    shieldDesc: "Blocks the next incoming attack completely.",
    cashStealName: "Data Heist",
    cashStealDesc: "Steals 🪙 300 Cash from a chosen target.",
    capsLockLockName: "Caps Lock Trap",
    capsLockLockDesc: "Forces target to type in uppercase for 10 seconds, causing syntax errors.",
    mirrorModeName: "Mirror Mirror",
    mirrorModeDesc: "Horizontally flips target's editor container for 12 seconds.",
    taxCollectionName: "Tax Collector",
    taxCollectionDesc: "Steals 20% of Survival Cash from the wealthiest player.",
    scoreMultiplierName: "Double Score Booster",
    scoreMultiplierDesc: "Doubles the score earned in the current round upon success.",
    screenDimmerName: "Screen Dimmer",
    screenDimmerDesc: "Reduces target editor brightness/opacity to 10% for 15 seconds.",
    
    // Tasks
    task1Title: "Easy: Fibonacci",
    task1Desc: "Write a python function `fib(n)` that returns the nth Fibonacci number.",
    task2Title: "Medium: Anagram check",
    task2Desc: "Write a python function `is_anagram(s, t)` returning True if they are anagrams.",
    task3Title: "Hard: Two Sum Solver",
    task3Desc: "Write a function `two_sum(nums, target)` returning indices of numbers adding up to target."
  },
  th: {
    title: "อาร์เคด แบทเทิลรอยัล",
    statusFinding: "สถานะ: กำลังสแกนหาคู่ต่อสู้...",
    startMatch: "เริ่มการต่อสู้",
    shopPhase: "ช่วงพักซื้อไอเทม",
    timeRemaining: "เวลาที่เหลือ:",
    yourCash: "เงินสะสม:",
    reroll: "สุ่มร้านใหม่",
    purchase: "ซื้อไอเทม",
    inventory: "ช่องเก็บไอเทมของคุณ",
    empty: "ไม่มีไอเทม",
    cancelTargeting: "ยกเลิกเป้าหมายดีบัฟ",
    lobbyStatus: "ผู้รอดชีวิตในสนามประลอง",
    pickTarget: "เลือกเป้าหมาย",
    clickToAttack: "ปล่อยการโจมตี",
    eliminated: "ตกรอบ",
    matchOver: "จบการแข่งขันในห้อง",
    winner: "ผู้ชนะเลิศ",
    playAgain: "หาห้องเล่นใหม่",
    spectatorMode: "โหมดผู้สังเกตการณ์",
    price: "ราคา:",
    type: "ประเภท:",
    targetAttack: "🔴 โจมตีเดี่ยว",
    aoeAttack: "🟣 โจมตีหมู่ (ทุกคน)",
    selfBuff: "🟢 ตัวช่วยตัวเอง",
    notEnoughCash: "เงินสะสมไม่เพียงพอ!",
    notEnoughCashReroll: "เงินไม่พอสำหรับการสุ่มร้านค้าใหม่!",
    bought: "ซื้อสำเร็จ",
    selectTarget: "เลือกเป้าหมายเพื่อยิงดีบัฟ",
    fromLobby: "จากหน้าต่างรายชื่อผู้เล่นฝั่งขวามือ!",
    aiHint: "💡 คำแนะนำ AI: ลองใช้วิธีวนซ้ำ หรือใช้ดิกชันนารีเพื่อลดเวลาประมวลผล",
    aiActivated: "ตัวช่วย AI ทำงาน! แสดงคำใบ้เรียบร้อย",
    shieldActivated: "ไฟร์วอลล์ทำงาน! การโจมตีครั้งถัดไปจะถูกบล็อก 100%",
    soldOut: "ขายแล้ว",
    deployed: "ใช้งานแล้ว",
    allEnemiesAffected: "คู่ต่อสู้ทุกคนได้รับผลกระทบ!",
    stole: "ขโมยเงิน",
    from: "จาก",
    fired: "ยิง",
    at: "ใส่",
    backspaceLocked: "🔒 ปุ่มลบถูกล็อกชั่วคราวโดยไอเทมคู่ต่อสู้!",
    round1Over: "จบรอบที่ 1! ยินดีต้อนรับสู่ร้านค้าเตรียมไอเทม",
    round2Start: "เริ่มรอบที่ 2! 2 อันดับสุดท้ายของคะแนนสะสมจะตกรอบ",
    finalRound: "รอบชิงชนะเลิศ! 3 คนสุดท้ายชิงชัยความเป็นหนึ่ง",
    matchFinished: "จบเกมแล้ว!",
    youEliminated: "คุณตกรอบแล้ว!",
    wasEliminated: "ตกรอบ!",
    blockedAttack: "🛡️ ระบบ Firewall ป้องกันการโจมตีได้สำเร็จ!",
    used: "ใช้",
    andStole: "และขโมยเงิน",
    hitYouWith: "โจมตีคุณด้วย",
    itemGlossary: "คู่มือไอเทม",
    langBtn: "🇬🇧 English",
    round1Note: "รอบที่ 1: วัดฝีมือล้วนๆ ยังไม่อนุญาตให้ใช้ไอเทมแกล้งกัน",
    codeOutput: "ผลการรันโปรแกรม",
    runTests: "ทดสอบโค้ด",
    submitCode: "ส่งคำตอบ",
    testsPassed: "โค้ดผ่านการทดสอบทั้งหมด! กดส่งได้เลย",
    codeEmpty: "กรุณาเขียนโค้ดก่อนทำการส่งคำตอบ",
    judgingCode: "🧪 กำลังตรวจโค้ด...",
    pythonFile: "arcade_main.py",
    backToHub: "ย้อนกลับหน้าหลัก",
    activeEffects: "เอฟเฟกต์ดีบัฟที่โดน",
    
    // Items
    inkFogName: "หมอกดำบังจอ (Ink Fog)",
    inkFogDesc: "ทำให้จอพิมพ์โค้ดของเป้าหมายเบลอเป็นเวลา 15 วินาที",
    backspaceLockName: "ล็อกปุ่มลบ (Backspace Lock)",
    backspaceLockDesc: "เป้าหมายไม่สามารถกดลบตัวอักษรได้ 10 วินาที",
    keyScramblerName: "สลับแป้นพิมพ์ (Key Scrambler)",
    keyScramblerDesc: "พิมพ์แล้วตัวอักษรจะสลับตำแหน่งมั่วๆ เป็นเวลา 10 วินาที",
    aiHelperName: "AI บอกใบ้โค้ด (AI Helper)",
    aiHelperDesc: "ขอคำแนะนำและโครงสร้างโค้ดจากระบบ Gemini AI",
    screenShakeName: "แผ่นดินไหว (Earthquake)",
    screenShakeDesc: "เขย่าหน้าจอกล่องเขียนโค้ดของเป้าหมายอย่างรุนแรง 8 วินาที",
    typoGeneratorName: " Glitch ก่อกวน",
    typoGeneratorDesc: "สุ่มพิมพ์ตัวอักษรแปลกปลอมแทรกในโค้ดเป้าหมาย 10 วินาที",
    timeFreezeName: "หยุดเวลาแช่แข็ง (Time Freeze)",
    timeFreezeDesc: "หยุดศัตรูทั้งหมดไม่ให้แก้ไขโค้ดได้ชั่วคราว 5 วินาที",
    blackoutName: "ระเบิดไฟดับ (EMP Strike)",
    blackoutDesc: "ปิดจอของเป้าหมายทุกคนให้มืดสนิทเป็นเวลา 8 วินาที",
    shieldName: "กำแพงไฟร์วอลล์ (Firewall)",
    shieldDesc: "ป้องกันความเสียหายจากดีบัฟครั้งถัดไป 100%",
    cashStealName: "โจรกรรม Survival Cash",
    cashStealDesc: "ขโมยเงิน 🪙 300 จากเป้าหมายมาเป็นของตัวเอง",
    capsLockLockName: "กับดักอักษรใหญ่ (Caps Lock Trap)",
    capsLockLockDesc: "บังคับให้พิมพ์เป็นตัวอักษรพิมพ์ใหญ่ทั้งหมด 10 วินาที ทำให้เกิด Error ในโค้ด Python",
    mirrorModeName: "กระจกสลับฝั่ง (Mirror Mode)",
    mirrorModeDesc: "สะท้อนหน้าจอเขียนโค้ดของเป้าหมายกลับด้านซ้าย-ขวาเป็นเวลา 12 วินาที",
    taxCollectionName: "เก็บภาษีคนรวย (Tax Collector)",
    taxCollectionDesc: "ขโมยเงิน 20% จากผู้เล่นที่มี Survival Cash สูงสุดมาเป็นของคุณ",
    scoreMultiplierName: "ตัวคูณคะแนน 2 เท่า (Score Booster)",
    scoreMultiplierDesc: "คูณคะแนนสะสมที่จะได้รับในรอบปัจจุบันเป็น 2 เท่าเมื่อทำโจทย์สำเร็จ",
    screenDimmerName: "แสงจ้าหน้าจอมืด (Screen Dimmer)",
    screenDimmerDesc: "หรี่แสงหน้าจอกล่องพิมพ์โค้ดของเป้าหมายให้มืดลงเหลือ 10% นาน 15 วินาที",
    
    // Tasks
    task1Title: "ง่าย: เลขฟีโบนัชชี (Fibonacci)",
    task1Desc: "เขียนฟังก์ชัน `fib(n)` เพื่อคืนค่าตัวเลขฟีโบนัชชีลำดับที่ n (รอบแรกวัดฝีมือเพียวๆ)",
    task2Title: "กลาง: ตรวจสอบแอนนาแกรม",
    task2Desc: "เขียนฟังก์ชัน `is_anagram(s, t)` ส่งกลับ True หากทั้งสองคำสร้างจากกลุ่มอักษรเดียวกัน",
    task3Title: "ยาก: ผลรวมสองจำนวน (Two Sum)",
    task3Desc: "เขียนฟังก์ชัน `two_sum(nums, target)` คืนค่าดัชนีของเลขสองตำแหน่งในอาร์เรย์ที่บวกได้เป้าหมาย"
  }
};

const PHASES = {
  LOBBY: 'LOBBY',
  ROUND_1: 'ROUND_1',
  SHOP_1: 'SHOP_1',
  ROUND_2: 'ROUND_2',
  SHOP_2: 'SHOP_2',
  ROUND_3: 'ROUND_3',
  RESULT: 'RESULT'
};

const ROUND_TIMES = {
  ROUND_1: 60,
  SHOP_1: 20, 
  ROUND_2: 60,
  SHOP_2: 20,
  ROUND_3: 60
};

const TASKS = {
  ROUND_1: { titleKey: "task1Title", descKey: "task1Desc", initialCode: "def fib(n):\n    # Write your python code here\n    pass" },
  ROUND_2: { titleKey: "task2Title", descKey: "task2Desc", initialCode: "def is_anagram(s, t):\n    # Write your python code here\n    pass" },
  ROUND_3: { titleKey: "task3Title", descKey: "task3Desc", initialCode: "def two_sum(nums, target):\n    # Write your python code here\n    pass" }
};

// Test cases for real correctness checking, one set per static TASKS entry
// above — kept in lockstep with those (not with the separate dbTasks/
// getTaskForRound pool, which nothing currently wires into what's actually
// shown/edited per round) so the function graded is always exactly the one
// the player is looking at.
const TASK_TEST_CASES = {
  ROUND_1: {
    functionName: 'fib',
    cases: [{ input: [5], output: 5 }, { input: [7], output: 13 }, { input: [0], output: 0 }, { input: [1], output: 1 }]
  },
  ROUND_2: {
    functionName: 'is_anagram',
    cases: [
      { input: ["listen", "silent"], output: true },
      { input: ["hello", "world"], output: false },
      { input: ["aabbcc", "abcabc"], output: true }
    ]
  },
  ROUND_3: {
    functionName: 'two_sum',
    cases: [{ input: [[2, 7, 11, 15], 9], output: [0, 1] }, { input: [[3, 2, 4], 6], output: [1, 2] }]
  }
};

const SHOP_ITEMS = [
  { id: 'inkFog', nameKey: 'inkFogName', price: 400, icon: '🌫️', descKey: 'inkFogDesc', type: 'attack' },
  { id: 'backspaceLock', nameKey: 'backspaceLockName', price: 500, icon: '🔒', descKey: 'backspaceLockDesc', type: 'attack' },
  { id: 'keyScrambler', nameKey: 'keyScramblerName', price: 450, icon: '⌨️', descKey: 'keyScramblerDesc', type: 'attack' },
  { id: 'aiHelper', nameKey: 'aiHelperName', price: 600, icon: '🤖', descKey: 'aiHelperDesc', type: 'buff' },
  { id: 'screenShake', nameKey: 'screenShakeName', price: 300, icon: '🌋', descKey: 'screenShakeDesc', type: 'attack' },
  { id: 'typoGenerator', nameKey: 'typoGeneratorName', price: 550, icon: '🐛', descKey: 'typoGeneratorDesc', type: 'attack' },
  { id: 'timeFreeze', nameKey: 'timeFreezeName', price: 1200, icon: '❄️', descKey: 'timeFreezeDesc', type: 'aoe' },
  { id: 'blackout', nameKey: 'blackoutName', price: 900, icon: '🔌', descKey: 'blackoutDesc', type: 'aoe' },
  { id: 'shield', nameKey: 'shieldName', price: 700, icon: '🛡️', descKey: 'shieldDesc', type: 'buff' },
  { id: 'cashSteal', nameKey: 'cashStealName', price: 600, icon: '🎭', descKey: 'cashStealDesc', type: 'attack' },
  { id: 'capsLockLock', nameKey: 'capsLockLockName', price: 350, icon: '🔠', descKey: 'capsLockLockDesc', type: 'attack' },
  { id: 'mirrorMode', nameKey: 'mirrorModeName', price: 500, icon: '🪞', descKey: 'mirrorModeDesc', type: 'attack' },
  { id: 'taxCollection', nameKey: 'taxCollectionName', price: 800, icon: '💸', descKey: 'taxCollectionDesc', type: 'buff' },
  { id: 'scoreMultiplier', nameKey: 'scoreMultiplierName', price: 650, icon: '⚡', descKey: 'scoreMultiplierDesc', type: 'buff' },
  { id: 'screenDimmer', nameKey: 'screenDimmerName', price: 400, icon: '🕶️', descKey: 'screenDimmerDesc', type: 'attack' }
];

// Visual/gameplay debuff duration per effect id, shared by AOE dispatch and by
// the incoming-effects poll (the server only carries the effect id — the actual
// duration is applied client-side by whoever receives it).
const EFFECT_DURATIONS = {
  inkFog: 15000,
  timeFreeze: 5000,
  blackout: 8000,
  screenShake: 8000,
  capsLockLock: 10000,
  mirrorMode: 12000,
  screenDimmer: 15000,
  backspaceLock: 10000,
  keyScrambler: 10000,
  typoGenerator: 10000,
};
const DEFAULT_EFFECT_DURATION = 10000;

const BOT_NAMES = ["Dev_Ninja", "Code_BotX", "SyntaxError", "NullPointer"];

export default function ArcadeBattleRoyale({ user: propUser }) {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'th' ? 'th' : 'en';
  const t = (key) => TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key] || key;

  const navigate = useNavigate();
  const [phase, setPhase] = useState(PHASES.LOBBY);
  const [timeLeft, setTimeLeft] = useState(0);

  // States
  const [playerState, setPlayerState] = useState({
    name: propUser?.username || "You (Player_1)",
    cash: 1000,
    score: 0,
    inventory: [],
    activeEffects: [],
    eliminated: false,
    code: "",
    hint: ""
  });

  const [opponents, setOpponents] = useState(
    BOT_NAMES.map(name => ({ name, cash: 1000, score: 0, eliminated: false, progress: 0 }))
  );

  const [notifications, setNotifications] = useState([]);
  const [shopState, setShopState] = useState({ items: [], rerollCost: 200 });
  const [targetingItem, setTargetingItem] = useState(null);
  const [showGlossary, setShowGlossary] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState("");
  const [isGrading, setIsGrading] = useState(false);

  // Reused as-is from Person 1's learning system (client/src/hooks/usePyodide.js)
  // to run player code for real instead of the old fake "always PASS" checker.
  const { status: pyodideStatus, runCode: runPyCode, clearOutput: clearPyOutput, setOnOutput: setPyOnOutput } = usePyodide();
  const pyOutputRef = useRef([]);
  useEffect(() => {
    setPyOnOutput((lines) => { pyOutputRef.current = lines; });
  }, [setPyOnOutput]);

  const timerRef = useRef(null);
  const editorRef = useRef(null);
  // Mirrors playerState for the incoming-effects poller below, so its interval
  // doesn't need `playerState` (which changes on every keystroke) in its deps.
  const playerStateRef = useRef(playerState);
  useEffect(() => { playerStateRef.current = playerState; }, [playerState]);

  const notify = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  // PostgreSQL Room Management States
  // Relative — goes through client/vite.config.js's `/api` -> :3001 dev proxy
  // instead of hardcoding the backend host, so this keeps working behind
  // whatever origin the app is actually served from (dev server or a reverse
  // proxy in front of a real deployment).
  const API_BASE = '';
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomParticipants, setRoomParticipants] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ room_name: '', password: '', max_players: 4 });
  const [searchCode, setSearchCode] = useState('');
  const [joinPasswordPrompt, setJoinPasswordPrompt] = useState(null);
  const [inputPassword, setInputPassword] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ room_name: '', password: '', max_players: 4 });

  // PostgreSQL Tasks State (Bilingual TH/EN)
  const [dbTasks, setDbTasks] = useState({ easy: [], medium: [], hard: [] });

  useEffect(() => {
    fetch(`${API_BASE}/api/arcade/tasks`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDbTasks({ easy: data.easy || [], medium: data.medium || [], hard: data.hard || [] });
        }
      })
      .catch(err => console.error("Error fetching tasks from DB:", err));
  }, [API_BASE]);

  // Bilingual Task Resolver
  const getTaskForRound = useCallback((roundNum) => {
    let list = dbTasks.easy;
    if (roundNum === 2) list = dbTasks.medium;
    if (roundNum === 3) list = dbTasks.hard;

    if (list && list.length > 0) {
      const task = list[0];
      return {
        title: lang === 'en' ? task.title_en : task.title_th,
        desc: lang === 'en' ? task.desc_en : task.desc_th,
        initialCode: task.initial_code
      };
    }
    return TASKS[`ROUND_${roundNum}`] || TASKS.ROUND_1;
  }, [dbTasks, lang]);

  // Fetch Public Rooms list
  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/arcade/rooms`);
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms || []);
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 3000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  // Fetch specific room status if joined
  useEffect(() => {
    if (!currentRoom) return;
    const fetchRoomState = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}?user_name=${encodeURIComponent(playerState.name)}`);
        const data = await res.json();
        if (data.success) {
          setCurrentRoom(data.room);
          setRoomParticipants(data.participants || []);
          
          // Auto start transition if host started room
          if (data.room.status === 'PLAYING' && phase === PHASES.LOBBY) {
            const others = (data.participants || []).filter(p => p.user_name !== playerState.name);
            if (others.length > 0) {
              setOpponents(others.map(p => ({
                name: p.user_name,
                score: p.score || 0,
                cash: p.cash || 1000,
                eliminated: false,
                isBot: p.user_name.startsWith('Bot_')
              })));
            }

            setPhase(PHASES.ROUND_1);
            setTimeLeft(ROUND_TIMES.ROUND_1);
            setPlayerState(prev => ({ ...prev, code: TASKS.ROUND_1.initialCode }));
            notify("🎮 หัวห้องเริ่มการแข่งขันแล้ว!", "success");
          }
        }
      } catch (err) {
        console.error("Error updating room state:", err);
      }
    };

    fetchRoomState();
    const roomInterval = setInterval(fetchRoomState, 2000);
    return () => clearInterval(roomInterval);
  }, [currentRoom, phase, notify, API_BASE, playerState.name]);

  // Create Room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!createForm.room_name.trim()) {
      notify("กรุณาระบุชื่อห้องแข่งขัน", "error");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/arcade/rooms/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_name: createForm.room_name,
          password: createForm.password,
          max_players: createForm.max_players,
          host_name: playerState.name
        })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentRoom(data.room);
        setShowCreateModal(false);
        setCreateForm({ room_name: '', password: '', max_players: 4 });
        notify(`สร้างห้อง "${data.room.room_name}" (รหัส: ${data.room.room_code}) สำเร็จ!`, "success");
        fetchRooms();
      } else {
        notify(data.error || "สร้างห้องไม่สำเร็จ", "error");
      }
    } catch (err) {
      notify("เกิดข้อผิดพลาดในการสร้างห้อง", "error");
    }
  };

  // Join Room
  const handleJoinRoom = async (targetRoom, pwd = '') => {
    try {
      const res = await fetch(`${API_BASE}/api/arcade/rooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_code_or_id: targetRoom.room_code || targetRoom.room_id || targetRoom,
          password: pwd,
          user_name: playerState.name
        })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentRoom(data.room);
        setRoomParticipants(data.participants);
        setJoinPasswordPrompt(null);
        setInputPassword('');
        setSearchCode('');
        notify(`เข้าร่วมห้อง "${data.room.room_name}" เรียบร้อยแล้ว`, "success");
      } else {
        notify(data.error || "ไม่สามารถเข้าร่วมห้องได้", "error");
      }
    } catch (err) {
      notify("เกิดข้อผิดพลาดในการเข้าร่วมห้อง", "error");
    }
  };

  // Search Room by Code
  const handleSearchJoin = (e) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    handleJoinRoom(searchCode.trim());
  };

  // Host Start Room Match
  const handleHostStartMatch = async () => {
    if (!currentRoom) return;
    try {
      const res = await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host_name: playerState.name })
      });
      const data = await res.json();
      if (data.success) {
        setPhase(PHASES.ROUND_1);
        setTimeLeft(ROUND_TIMES.ROUND_1);
        setPlayerState(prev => ({ ...prev, code: TASKS.ROUND_1.initialCode }));
        notify("🎮 เริ่มการแข่งขัน!", "success");
      } else {
        notify(data.error || "ไม่สามารถเริ่มการแข่งขันได้", "error");
      }
    } catch (err) {
      notify("เกิดข้อผิดพลาดในการเริ่มเกม", "error");
    }
  };

  // Host Update Settings
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    if (!currentRoom) return;
    try {
      const res = await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host_name: playerState.name,
          room_name: settingsForm.room_name,
          max_players: settingsForm.max_players,
          password: settingsForm.password
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowSettingsModal(false);
        notify("อัปเดตการตั้งค่าห้องสำเร็จ", "success");
      } else {
        notify(data.error || "ไม่สามารถอัปเดตการตั้งค่าได้", "error");
      }
    } catch (err) {
      notify("เกิดข้อผิดพลาดในการตั้งค่าห้อง", "error");
    }
  };

  // Host Transfer Ownership
  const handleTransferHost = async (targetUser) => {
    if (!currentRoom) return;
    try {
      const res = await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/transfer-host`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_host: playerState.name, target_user_name: targetUser })
      });
      const data = await res.json();
      if (data.success) {
        notify(`โอนสิทธิ์หัวห้องให้คุณ ${targetUser} แล้ว`, "success");
      } else {
        notify(data.error || "โอนสิทธิ์ไม่สำเร็จ", "error");
      }
    } catch (err) {
      notify("เกิดข้อผิดพลาดในการโอนสิทธิ์", "error");
    }
  };

  // Host Kick Player
  const handleKickPlayer = async (targetUser) => {
    if (!currentRoom) return;
    try {
      const res = await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/kick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host_name: playerState.name, target_user_name: targetUser })
      });
      const data = await res.json();
      if (data.success) {
        notify(`เตะผู้เล่น ${targetUser} ออกจากห้องแล้ว`, "success");
      } else {
        notify(data.error || "เตะผู้เล่นไม่สำเร็จ", "error");
      }
    } catch (err) {
      notify("เกิดข้อผิดพลาดในการเตะผู้เล่น", "error");
    }
  };

  // Host Add Bot Player
  const handleAddBot = async () => {
    if (!currentRoom) return;
    try {
      const res = await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/add-bot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host_name: playerState.name })
      });
      const data = await res.json();
      if (data.success) {
        setRoomParticipants(data.participants || []);
        notify(`🤖 เพิ่มบอท "${data.bot_name}" เข้าร่วมห้องแล้ว!`, "success");
      } else {
        notify(data.error || "ไม่สามารถเพิ่มบอทได้", "error");
      }
    } catch (err) {
      notify("เกิดข้อผิดพลาดในการเพิ่มบอท", "error");
    }
  };

  // Leave Room
  const handleLeaveRoom = async () => {
    if (currentRoom) {
      try {
        await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_name: playerState.name })
        });
      } catch (err) {
        console.error("Error leaving room:", err);
      }
    }
    setCurrentRoom(null);
    setRoomParticipants([]);
    setPhase(PHASES.LOBBY);
    fetchRooms();
  };

  // Finish Match Choice (LEAVE vs REMAIN)
  const handleFinishChoice = async (choice) => {
    if (currentRoom) {
      try {
        await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/finish-choice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_name: playerState.name, choice })
        });
      } catch (err) {
        console.error("Error handling finish choice:", err);
      }
    }

    if (choice === 'LEAVE') {
      setCurrentRoom(null);
      setRoomParticipants([]);
      setPhase(PHASES.LOBBY);
      fetchRooms();
    } else {
      setPlayerState(prev => ({
        ...prev,
        score: 0,
        cash: 1000,
        eliminated: false,
        inventory: [],
        activeEffects: [],
        code: "",
        hint: ""
      }));
      setPhase(PHASES.LOBBY);
    }
  };

  // Sync Timer and Bot AI Engine Actions
  useEffect(() => {
    if (phase === PHASES.LOBBY) return;

    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      
      // Sync and update active bot AI instances
      botManager.syncBots(roomParticipants, playerState.name);
      botManager.update(phase, playerState, setPlayerState, setOpponents, notify);
    } else {
      handlePhaseTransition();
    }

    return () => clearTimeout(timerRef.current);
  }, [timeLeft, phase, roomParticipants, playerState.name, setPlayerState, setOpponents, notify]);

  const handlePhaseTransition = async () => {
    switch (phase) {
      case PHASES.ROUND_1:
        await evaluateRound(1);
        setPhase(PHASES.SHOP_1);
        setTimeLeft(ROUND_TIMES.SHOP_1);
        rollShop(true);
        notify(t('round1Over'), "info");
        break;
      case PHASES.SHOP_1:
        setPhase(PHASES.ROUND_2);
        setTimeLeft(ROUND_TIMES.ROUND_2);
        setPlayerState(prev => ({...prev, code: TASKS.ROUND_2.initialCode, hint: ""}));
        setOpponents(prev => prev.map(b => ({...b, progress: 0})));
        notify(t('round2Start'), "warning");
        break;
      case PHASES.ROUND_2:
        await evaluateRound(2);
        eliminateBottom(2);
        setPhase(PHASES.SHOP_2);
        setTimeLeft(ROUND_TIMES.SHOP_2);
        rollShop(true);
        break;
      case PHASES.SHOP_2:
        if (playerState.eliminated) {
          setPhase(PHASES.RESULT);
        } else {
          setPhase(PHASES.ROUND_3);
          setTimeLeft(ROUND_TIMES.ROUND_3);
          setPlayerState(prev => ({...prev, code: TASKS.ROUND_3.initialCode, hint: ""}));
          setOpponents(prev => prev.map(b => ({...b, progress: 0})));
          notify(t('finalRound'), "warning");
        }
        break;
      case PHASES.ROUND_3:
        await evaluateRound(3);
        setPhase(PHASES.RESULT);
        notify(t('matchFinished'), "info");
        break;
      default:
        break;
    }
  };

  // Wraps the player's code in a small harness that calls the round's target
  // function against each test case and prints a single marker line with a
  // JSON array of booleans — parsed back out of Pyodide's stdout below.
  // Test cases/inputs are base64-embedded so no quoting/escaping in the
  // player's own code can ever break the harness itself.
  const buildTestHarness = (code, functionName, cases) => {
    const json = JSON.stringify(cases);
    const b64 = btoa(unescape(encodeURIComponent(json)));
    return `${code}\n\nimport json as __json, base64 as __b64\n__tc = __json.loads(__b64.b64decode("${b64}").decode("utf-8"))\n__results = []\nfor __case in __tc:\n    try:\n        __actual = ${functionName}(*__case["input"])\n        __results.append(bool(__actual == __case["output"]))\n    except Exception:\n        __results.append(False)\nprint("__ARCADE_JUDGE__" + __json.dumps(__results))\n`;
  };

  // Runs the player's real code through Pyodide (reusing Person 1's
  // usePyodide hook as-is) and reads back how many test cases it passed.
  // Never throws — an empty task, a not-yet-loaded runtime, a syntax error,
  // or a missing marker line all just resolve to 0/total so a bad submission
  // can't get the player stuck instead of simply scoring zero.
  const runCorrectnessCheck = async (functionName, cases) => {
    const totalCount = cases.length;
    if (!functionName || totalCount === 0) return { passCount: 0, totalCount: 0 };
    if (pyodideStatus !== 'ready') return { passCount: 0, totalCount };

    clearPyOutput();
    const harness = buildTestHarness(playerState.code, functionName, cases);
    await runPyCode(harness);

    const marker = '__ARCADE_JUDGE__';
    const line = pyOutputRef.current.find(l => l.type === 'stdout' && l.text.startsWith(marker));
    if (!line) return { passCount: 0, totalCount };
    try {
      const results = JSON.parse(line.text.slice(marker.length));
      return { passCount: results.filter(Boolean).length, totalCount };
    } catch {
      return { passCount: 0, totalCount };
    }
  };

  // Asks the server's Claude-based judge for a readability score. Falls back
  // to a neutral default client-side if the request itself fails (the server
  // endpoint already has its own AI-unavailable fallback — this is only for
  // when the request can't even reach it).
  const requestReadabilityScore = async (code) => {
    try {
      const res = await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/judge-round`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success && Number.isFinite(data.readabilityScore)) return data.readabilityScore;
      return 50;
    } catch {
      return 50;
    }
  };

  // Real per-round judging: runs the player's code against the round's test
  // cases, asks the readability judge, and folds pass count / readability /
  // time-used into one number that ranks strictly by priority order —
  // passCount always dominates readability, which always dominates time —
  // by giving each tier a value range the tier below it can never reach.
  // Bots don't have real code, so their three components are synthesized
  // from randomness scaled to the same task's test-case count, keeping them
  // on the same scale as real players for eliminateBottom()'s comparison.
  const evaluateRound = async (roundNum) => {
    setIsGrading(true);
    notify(t('judgingCode'), "info");
    try {
      const { functionName, cases } = TASK_TEST_CASES[`ROUND_${roundNum}`];
      const roundDuration = ROUND_TIMES[`ROUND_${roundNum}`];
      const timeUsedSeconds = Math.max(0, Math.min(roundDuration, roundDuration - timeLeft));

      const { passCount, totalCount } = await runCorrectnessCheck(functionName, cases);
      const readabilityScore = await requestReadabilityScore(playerState.code);

      const isMultiplierActive = checkEffectActive('scoreMultiplier');
      const timeBonus = roundDuration - timeUsedSeconds;
      let roundScore = passCount * 10_000_000 + readabilityScore * 10_000 + timeBonus;
      if (isMultiplierActive) roundScore *= 2;
      const cashGain = passCount * 150 + Math.floor(readabilityScore * 2);

      setPlayerState(prev => ({
        ...prev,
        score: prev.score + roundScore,
        cash: prev.cash + cashGain,
        activeEffects: prev.activeEffects.filter(e => e.type !== 'scoreMultiplier')
      }));

      setOpponents(prev => prev.map(bot => {
        if (bot.eliminated) return bot;
        const botPassCount = totalCount === 0 ? 0 : Math.min(totalCount, Math.max(0, Math.round(totalCount * (0.35 + Math.random() * 0.65))));
        const botReadability = 40 + Math.floor(Math.random() * 50);
        const botTimeUsed = Math.floor(Math.random() * roundDuration);
        const botScoreGain = botPassCount * 10_000_000 + botReadability * 10_000 + (roundDuration - botTimeUsed);
        const botCashGain = botPassCount * 150 + Math.floor(botReadability * 2);
        return { ...bot, score: bot.score + botScoreGain, cash: bot.cash + botCashGain };
      }));

      notify(`✅ ${passCount}/${totalCount} tests | 📖 ${readabilityScore}/100 | ⏱ ${timeUsedSeconds}s`, "success");
    } finally {
      setIsGrading(false);
    }
  };

  const eliminateBottom = (count) => {
    const allPlayers = [
      { isPlayer: true, score: playerState.score, eliminated: playerState.eliminated },
      ...opponents.map((b, i) => ({ isPlayer: false, index: i, score: b.score, eliminated: b.eliminated }))
    ].filter(p => !p.eliminated);

    allPlayers.sort((a, b) => a.score - b.score);
    const toEliminate = allPlayers.slice(0, count);
    
    toEliminate.forEach(p => {
      if (p.isPlayer) {
        setPlayerState(prev => ({...prev, eliminated: true}));
        notify(t('youEliminated'), "error");
      } else {
        setOpponents(prev => {
          const newOpp = [...prev];
          newOpp[p.index] = { ...newOpp[p.index], eliminated: true };
          return newOpp;
        });
        notify(`${opponents[p.index].name} ${t('wasEliminated')}`, "info");
      }
    });
  };

  const checkEffectActive = (effectId) => {
    const effect = playerState.activeEffects.find(e => e.type === effectId);
    return effect && effect.expiresAt > Date.now();
  };

  // Housekeeping for expired effects
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerState(prev => {
        const active = prev.activeEffects.filter(e => e.expiresAt > Date.now());
        if (active.length !== prev.activeEffects.length) {
          return { ...prev, activeEffects: active };
        }
        return prev;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Poll for incoming sabotage effects from real human opponents — bots apply
  // their debuffs directly via botManager.update() instead, entirely client-local.
  useEffect(() => {
    if (!currentRoom || phase === PHASES.LOBBY) return;

    const pollEffects = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/effects?user_name=${encodeURIComponent(playerState.name)}`
        );
        const data = await res.json();
        if (!data.success || !data.effects || data.effects.length === 0) return;

        data.effects.forEach(effect => {
          if (effect.effect_type === 'cashSteal') {
            setPlayerState(prev => ({ ...prev, cash: Math.max(0, prev.cash - (effect.amount || 0)) }));
            notify(`💸 ${effect.attacker_name} ${t('andStole')} 🪙 ${effect.amount}!`, "error");
            return;
          }

          const hasShield = playerStateRef.current.activeEffects.some(e => e.type === 'shield' && e.expiresAt > Date.now());
          if (hasShield) {
            setPlayerState(prev => ({ ...prev, activeEffects: prev.activeEffects.filter(e => e.type !== 'shield') }));
            notify(t('blockedAttack'), "success");
            return;
          }

          const duration = EFFECT_DURATIONS[effect.effect_type] || DEFAULT_EFFECT_DURATION;
          setPlayerState(prev => ({
            ...prev,
            activeEffects: [...prev.activeEffects.filter(e => e.type !== effect.effect_type), { type: effect.effect_type, expiresAt: Date.now() + duration }]
          }));
          notify(`🚨 ${effect.attacker_name} ${t('hitYouWith')} ${effect.item_name}!`, "error");
        });
      } catch (err) {
        console.error('Error polling incoming effects:', err);
      }
    };

    pollEffects();
    const effectsInterval = setInterval(pollEffects, 2000);
    return () => clearInterval(effectsInterval);
  }, [currentRoom, phase, playerState.name, API_BASE, notify, t]);

  const rollShop = (isInitial = false) => {
    if (!isInitial) {
      if (playerState.cash < shopState.rerollCost) {
        notify(t('notEnoughCashReroll'), "error");
        return;
      }
      setPlayerState(prev => ({ ...prev, cash: prev.cash - shopState.rerollCost }));
      setShopState(prev => ({ ...prev, rerollCost: prev.rerollCost * 2 }));
    } else {
      setShopState(prev => ({ ...prev, rerollCost: 200 }));
    }

    const shuffled = [...SHOP_ITEMS].sort(() => 0.5 - Math.random());
    setShopState(prev => ({ ...prev, items: shuffled.slice(0, 4).map(item => ({ ...item, purchased: false })) }));
  };

  const initiateItemUse = (item) => {
    if (item.type === 'attack') {
      setTargetingItem(item);
      notify(`${t('selectTarget')} [${t(item.nameKey)}] ${t('fromLobby')}`, "info");
    } else {
      executeItem(item, null); 
    }
  };

  // Delivers one attack item's effect onto a single target — a bot (applied
  // instantly via botManager, entirely client-local) or a real human
  // participant (synced through the server's arcade_effects delivery queue so
  // it actually lands on that player's own screen, not just the attacker's).
  const dispatchAttack = useCallback(async (target, item) => {
    if (item.id === 'cashSteal') {
      if (botManager.botMap.has(target.name)) {
        const bot = botManager.botMap.get(target.name);
        const stolen = Math.min(300, bot.cash);
        bot.cash -= stolen;
        setPlayerState(prev => ({ ...prev, cash: prev.cash + stolen }));
        notify(`${t('stole')} 🪙 ${stolen} ${t('from')} ${target.name}!`, "success");
        return;
      }
      if (!currentRoom) return;
      try {
        const res = await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/attack`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attacker_name: playerState.name, target_name: target.name, effect_type: 'cashSteal' })
        });
        const data = await res.json();
        if (data.success) {
          setPlayerState(prev => ({ ...prev, cash: prev.cash + data.stolen }));
          notify(`${t('stole')} 🪙 ${data.stolen} ${t('from')} ${target.name}!`, "success");
        } else {
          notify(data.error || 'Attack failed', "error");
        }
      } catch (err) {
        console.error('Attack dispatch error:', err);
      }
      return;
    }

    if (botManager.botMap.has(target.name)) {
      const result = botManager.botMap.get(target.name).receiveAttack(playerState.name, item);
      if (result.blocked) {
        notify(result.msg, "warning");
      } else {
        notify(`${t('fired')} ${t(item.nameKey || item.id)} ${t('at')} ${target.name}!`, "success");
      }
      return;
    }

    if (!currentRoom) return;
    try {
      const res = await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attacker_name: playerState.name, target_name: target.name, effect_type: item.id, item_name: t(item.nameKey || item.id) })
      });
      const data = await res.json();
      if (data.success) {
        notify(`${t('fired')} ${t(item.nameKey || item.id)} ${t('at')} ${target.name}!`, "success");
      } else {
        notify(data.error || 'Attack failed', "error");
      }
    } catch (err) {
      console.error('Attack dispatch error:', err);
    }
  }, [playerState.name, currentRoom, API_BASE, notify, t]);

  const executeItem = (item, targetIndex) => {
    setPlayerState(prev => {
      const newInv = [...prev.inventory];
      const index = newInv.findIndex(i => i.id === item.id);
      if(index > -1) newInv.splice(index, 1);
      return { ...prev, inventory: newInv };
    });

    if (item.type === 'buff') {
      if (item.id === 'aiHelper') {
        setPlayerState(prev => ({...prev, hint: t('aiHint')}));
        notify(t('aiActivated'), "success");
      } else if (item.id === 'shield') {
        setPlayerState(prev => ({
          ...prev,
          activeEffects: [...prev.activeEffects, { type: 'shield', expiresAt: Date.now() + 99999999 }] 
        }));
        notify(t('shieldActivated'), "success");
      } else if (item.id === 'scoreMultiplier') {
        setPlayerState(prev => ({
          ...prev,
          activeEffects: [...prev.activeEffects, { type: 'scoreMultiplier', expiresAt: Date.now() + 99999999 }]
        }));
        notify("⚡ Score Multiplier activated! 2x round points will be awarded.", "success");
      } else if (item.id === 'taxCollection') {
        const activeBots = opponents.filter(b => !b.eliminated);
        if (activeBots.length > 0) {
          const richBot = activeBots.reduce((max, bot) => bot.cash > max.cash ? bot : max, activeBots[0]);
          const botIdx = opponents.findIndex(b => b.name === richBot.name);
          const tax = Math.floor(richBot.cash * 0.20);
          setOpponents(prev => {
            const newOpp = [...prev];
            newOpp[botIdx] = { ...newOpp[botIdx], cash: newOpp[botIdx].cash - tax };
            return newOpp;
          });
          setPlayerState(prev => ({ ...prev, cash: prev.cash + tax }));
          notify(`💸 Tax collected! Stole 20% (🪙 ${tax}) from wealthy player ${richBot.name}!`, "success");
        } else {
          notify("No active wealthy targets to collect taxes from!", "warning");
        }
      }
    } 
    else if (item.type === 'aoe') {
      const activeTargets = opponents.filter(o => !o.eliminated);
      activeTargets.forEach(target => dispatchAttack(target, item));
      notify(`${t('deployed')} ${t(item.nameKey)}! ${t('allEnemiesAffected')}`, "success");
    }
    else if (item.type === 'attack' && targetIndex !== null) {
      const target = opponents[targetIndex];
      dispatchAttack(target, item);
    }
    
    setTargetingItem(null); 
  };

  const handleTargetClick = (botIndex) => {
    if (targetingItem && !opponents[botIndex].eliminated) {
      executeItem(targetingItem, botIndex);
    }
  };

  // Keyboard and Input Debuffs for Monaco
  const handleEditorKeyDown = (e) => {
    if (checkEffectActive('timeFreeze') || checkEffectActive('blackout')) {
      e.preventDefault();
      return;
    }

    if (checkEffectActive('backspaceLock') && (e.key === 'Backspace' || e.key === 'Delete')) {
      e.preventDefault();
      notify(t('backspaceLocked'), "error");
    }
  };

  const handleCodeChange = (value) => {
    if (checkEffectActive('timeFreeze') || checkEffectActive('blackout')) {
      return;
    }

    let nextValue = value || "";

    // Scramble Keys active
    if (checkEffectActive('keyScrambler')) {
      const scrambleMap = { 'a': 'q', 'e': 'w', 'i': 'r', 'o': 't', 'u': 'y', 's': 'd', 't': 'f' };
      const lastChar = nextValue.slice(-1).toLowerCase();
      if (scrambleMap[lastChar]) {
        nextValue = nextValue.slice(0, -1) + scrambleMap[lastChar];
      }
    }

    // Typo Glitch active
    if (checkEffectActive('typoGenerator') && Math.random() < 0.15) {
      const randomChars = "xyz1!#";
      nextValue += randomChars[Math.floor(Math.random() * randomChars.length)];
    }

    // Caps Lock Lock active
    if (checkEffectActive('capsLockLock')) {
      nextValue = nextValue.toUpperCase();
    }

    setPlayerState(prev => ({...prev, code: nextValue}));
  };

  const runCodeTests = () => {
    if (playerState.code.trim().length === 0) {
      setConsoleOutput("SyntaxError: Empty program. Please write code to test.");
      return;
    }
    setConsoleOutput(`Running local tests for ${t(phase === PHASES.ROUND_1 ? 'task1Title' : phase === PHASES.ROUND_2 ? 'task2Title' : 'task3Title')}...\n[PASS] Test Case 1\n[PASS] Test Case 2\n[SUCCESS] Code compiled successfully!`);
    notify(t('testsPassed'), "success");
  };

  const handleManualSubmit = () => {
    if (isGrading) return;
    if (playerState.code.trim().length === 0) {
      notify(t('codeEmpty'), "error");
      return;
    }
    notify(t('submitCode') + " Done!", "success");
    handlePhaseTransition();
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-50 relative font-sans select-none antialiased">
      {/* 1. TOP BAR */}
      <nav className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-10 shadow-sm shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-rose-500 text-white p-2 rounded-xl shadow-md shadow-rose-500/20">
            <Gamepad2 className="h-5 w-5 fill-white animate-bounce-slight" />
          </div>
          <div>
            <span className="text-sm font-black uppercase tracking-[0.24em] bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
              {t('title')}
            </span>
            <span className="block text-[9px] font-bold tracking-widest text-slate-400 uppercase">
              {phase !== PHASES.LOBBY && phase !== PHASES.RESULT ? `ROUND PHASE: ${phase.replace('_', ' ')}` : 'MATCHMAKING ZONE'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {playerState.eliminated && (
            <div className="text-xs font-black text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl animate-pulse">
              🛡️ {t('spectatorMode')}
            </div>
          )}
          
          <button 
            onClick={() => setShowGlossary(true)}
            className="text-xs bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 font-bold flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <BookOpen className="h-3.5 w-3.5 text-rose-500" />
            <span>📖 {t('itemGlossary')}</span>
          </button>

          <button 
            onClick={() => i18n.changeLanguage(lang === 'th' ? 'en' : 'th')}
            className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl border border-slate-200 transition-all font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            {t('langBtn')}
          </button>

          <button
            onClick={() => navigate('/menu')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t('backToHub')}</span>
          </button>
        </div>
      </nav>

      {/* 2. BODY CONTENT */}
      <div className="flex-1 relative overflow-hidden bg-slate-50/50">
        
        {/* GLOSSARY OVERLAY */}
        <AnimatePresence>
          {showGlossary && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col border border-slate-200 overflow-hidden"
              >
                <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center space-x-2 text-rose-500 font-black">
                    <HelpCircle className="h-5 w-5" />
                    <h2 className="text-xl uppercase tracking-widest font-mono">{t('itemGlossary')}</h2>
                  </div>
                  <button onClick={() => setShowGlossary(false)} className="text-slate-400 hover:text-slate-600 text-3xl font-light">&times;</button>
                </div>
                
                <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SHOP_ITEMS.map(item => (
                    <div key={item.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col gap-2 hover:shadow-md transition-shadow relative">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-black text-slate-800 flex items-center gap-2">
                          <span className="text-2xl">{item.icon}</span>
                          {t(item.nameKey)}
                        </div>
                        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-xl text-xs font-black border border-amber-200">
                          🪙 {item.price}
                        </span>
                      </div>
                      <div className="text-[10px] font-black text-slate-400 tracking-wider">
                        {t('type')} {item.type === 'attack' ? t('targetAttack') : item.type === 'aoe' ? t('aoeAttack') : t('selfBuff')}
                      </div>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">{t(item.descKey)}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- LOBBY PHASE VIEW (PUBLIC ROOM BROWSER & ROOM LOBBY) --- */}
        {phase === PHASES.LOBBY && (
          <div className="h-full w-full overflow-y-auto p-6 max-w-6xl mx-auto flex flex-col space-y-6">
            
            {/* VIEW A: NO ROOM JOINED -> PUBLIC ROOM BROWSER */}
            {!currentRoom ? (
              <div className="space-y-6">
                
                {/* Header & Quick Code Search Bar */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                  <div className="space-y-2 text-left">
                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 rounded-full border border-rose-100">
                      🌐 POSTGRESQL LIVE ARENA LOBBY
                    </span>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                      รายการห้องประลองสาธารณะ
                    </h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      เลือกห้องแข่งขันเพื่อเข้าร่วม หรือค้นหาด้วยรหัสสุ่มประจำห้อง
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Quick Search Input Form */}
                    <form onSubmit={handleSearchJoin} className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                      <input 
                        type="text" 
                        placeholder="กรอกรหัสสุ่ม เช่น ARC-YLY4..." 
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                        className="bg-transparent px-3 py-1.5 text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none w-48"
                      />
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all"
                      >
                        🔍 ค้นหาห้อง
                      </button>
                    </form>

                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <span>➕</span>
                      <span>สร้างห้องประลองใหม่</span>
                    </button>
                  </div>
                </div>

                {/* Rooms Grid */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      ห้องที่กำลังเปิดรับสมัคร ({rooms.length} ห้อง)
                    </span>
                    <button onClick={fetchRooms} className="text-xs font-bold text-rose-500 hover:underline">
                      🔄 รีเฟรชรายการ
                    </button>
                  </div>

                  {rooms.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                      <div className="text-4xl">🎮</div>
                      <h3 className="text-base font-black text-slate-700">ยังไม่มีห้องประลองที่เปิดอยู่</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        สร้างห้องใหม่เป็นคนแรกและรอให้ผู้เล่นอื่นเข้าร่วม หรือแชร์รหัสสุ่มห้องให้เพื่อน!
                      </p>
                      <button 
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-md transition-all"
                      >
                        ➕ สร้างห้องแรกเลย
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {rooms.map(r => (
                        <div key={r.room_id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-black text-slate-800 text-base">{r.room_name}</h3>
                                {r.is_password_protected && (
                                  <span className="text-amber-500 text-xs" title="ห้องมีรหัสผ่าน">🔒</span>
                                )}
                              </div>
                              <span className="inline-block mt-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-mono font-bold rounded-lg border border-slate-200">
                                รหัส: {r.room_code}
                              </span>
                            </div>

                            <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-xl text-xs font-black border border-rose-100">
                              👥 {r.current_players} / {r.max_players} คน
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                            <span className="text-slate-500 font-bold flex items-center gap-1">
                              👑 หัวห้อง: <strong className="text-slate-800">{r.host_name}</strong>
                            </span>

                            <button 
                              onClick={() => {
                                if (r.is_password_protected) {
                                  setJoinPasswordPrompt(r);
                                } else {
                                  handleJoinRoom(r);
                                }
                              }}
                              className="px-5 py-2 bg-slate-900 hover:bg-rose-600 text-white rounded-xl font-black text-xs transition-all hover:scale-105 active:scale-95"
                            >
                              เข้าร่วม
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (

              /* VIEW B: ROOM LOBBY (WAITING IN JOINED ROOM) */
              <div className="space-y-6">
                
                {/* Room Info Header */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 rounded-full border border-emerald-100">
                        🟢 IN ROOM LOBBY
                      </span>
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-mono font-bold rounded-full border border-amber-200 flex items-center gap-1.5">
                        <span>รหัสสุ่มห้อง: <strong>{currentRoom.room_code}</strong></span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(currentRoom.room_code);
                            notify("คัดลอกรหัสสุ่มห้องเรียบร้อยแล้ว!", "success");
                          }}
                          className="hover:text-amber-900 underline text-[10px]"
                        >
                          📋 คัดลอก
                        </button>
                      </span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                      {currentRoom.room_name}
                    </h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      ผู้ร่วมประลองในห้อง: ({roomParticipants.length} / {currentRoom.max_players} คน)
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Host Controls */}
                    {playerState.name === currentRoom.host_name && (
                      <>
                        <button 
                          onClick={handleAddBot}
                          disabled={roomParticipants.length >= currentRoom.max_players}
                          className={`px-4 py-2.5 font-black text-xs rounded-xl border transition-all flex items-center gap-1.5 ${
                            roomParticipants.length >= currentRoom.max_players 
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 hover:scale-105 active:scale-95'
                          }`}
                          title={roomParticipants.length >= currentRoom.max_players ? 'ห้องเต็มแล้ว' : 'เพิ่มบอทเข้าร่วมการแข่งขัน'}
                        >
                          🤖 เพิ่มบอท
                        </button>

                        <button 
                          onClick={() => {
                            setSettingsForm({
                              room_name: currentRoom.room_name,
                              password: currentRoom.password || '',
                              max_players: currentRoom.max_players
                            });
                            setShowSettingsModal(true);
                          }}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1.5"
                        >
                          ⚙️ ตั้งค่าห้อง
                        </button>
                      </>
                    )}

                    <button 
                      onClick={handleLeaveRoom}
                      className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-xs rounded-xl border border-rose-200 transition-all"
                    >
                      🚪 ออกจากห้อง
                    </button>
                  </div>
                </div>

                {/* Participants List & Host Controls Grid */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    รายชื่อผู้เล่นในห้อง (Participants)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {roomParticipants.map((p, idx) => (
                      <div key={p.id || idx} className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 relative ${p.is_host ? 'bg-amber-50/50 border-amber-300' : p.user_name.startsWith('Bot_') ? 'bg-rose-50/30 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${p.is_host ? 'bg-amber-500 text-white' : p.user_name.startsWith('Bot_') ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                            {p.is_host ? '👑' : p.user_name.startsWith('Bot_') ? '🤖' : idx + 1}
                          </div>
                          <div>
                            <span className="font-black text-xs text-slate-800">{p.user_name} {p.user_name === playerState.name ? "(คุณ)" : ""}</span>
                            <span className="block text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                              {p.is_host ? 'หัวห้อง (Host)' : p.user_name.startsWith('Bot_') ? '🤖 Bot Opponent' : 'ผู้เข้าแข่งขัน'}
                            </span>
                          </div>
                        </div>

                        {/* Host actions on other players */}
                        {playerState.name === currentRoom.host_name && p.user_name !== playerState.name && (
                          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/60">
                            {!p.user_name.startsWith('Bot_') && (
                              <button 
                                onClick={() => handleTransferHost(p.user_name)}
                                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold rounded-lg transition-all"
                                title="โอนสิทธิ์หัวห้อง"
                              >
                                👑 โอนหัวห้อง
                              </button>
                            )}
                            <button 
                              onClick={() => handleKickPlayer(p.user_name)}
                              className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-bold rounded-lg transition-all"
                              title="เตะออกจากห้อง"
                            >
                              👢 เตะผู้เล่น
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Placeholder slots */}
                    {Array.from({ length: Math.max(0, currentRoom.max_players - roomParticipants.length) }).map((_, i) => (
                      <div key={i} className="p-6 rounded-3xl border border-dashed border-slate-200 flex items-center justify-center text-slate-300 font-bold text-xs">
                        ⏳ รอผู้เล่นคนถัดไป...
                      </div>
                    ))}
                  </div>

                  {/* Start Match Button */}
                  <div className="pt-6 border-t border-slate-100 flex justify-center">
                    {playerState.name === currentRoom.host_name ? (
                      <button 
                        onClick={handleHostStartMatch}
                        className="px-12 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm tracking-wider uppercase rounded-2xl shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        🎮 เริ่มการแข่งขัน ({roomParticipants.length} / {currentRoom.max_players})
                      </button>
                    ) : (
                      <div className="px-8 py-3.5 bg-slate-100 text-slate-500 font-bold text-xs rounded-2xl border border-slate-200 animate-pulse">
                        ⏳ รอหัวห้อง ({currentRoom.host_name}) กดเริ่มการแข่งขัน...
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* MODAL 1: CREATE ROOM */}
            <AnimatePresence>
              {showCreateModal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                  <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-black text-slate-800">➕ สร้างห้องแข่งขันใหม่</h3>
                      <button onClick={() => setShowCreateModal(false)} className="text-slate-400 text-2xl">&times;</button>
                    </div>

                    <form onSubmit={handleCreateRoom} className="space-y-4">
                      <div>
                        <label className="block text-xs font-black text-slate-600 uppercase mb-1">ชื่อห้องแข่งขัน *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="เช่น ห้องประลอง Python ชิงแชมประเพณี..."
                          value={createForm.room_name}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, room_name: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-600 uppercase mb-1">จำนวนผู้เล่นสูงสุด (2 - 5 คน)</label>
                        <div className="flex gap-2">
                          {[2, 3, 4, 5].map(num => (
                            <button 
                              key={num} 
                              type="button" 
                              onClick={() => setCreateForm(prev => ({ ...prev, max_players: num }))}
                              className={`flex-1 py-2 rounded-xl font-bold text-xs border transition-all ${createForm.max_players === num ? 'bg-rose-500 text-white border-rose-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                            >
                              {num} คน
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-600 uppercase mb-1">รหัสผ่านห้อง (ถ้าไม่ใส่จะเป็นห้องสาธารณะ)</label>
                        <input 
                          type="password" 
                          placeholder="กรอกรหัสผ่านลับ..."
                          value={createForm.password}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl">ยกเลิก</button>
                        <button type="submit" className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md">สร้างห้องทันที</button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MODAL 2: HOST ROOM SETTINGS */}
            <AnimatePresence>
              {showSettingsModal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                  <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-black text-slate-800">⚙️ ตั้งค่าห้องแข่งขัน</h3>
                      <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 text-2xl">&times;</button>
                    </div>

                    <form onSubmit={handleUpdateSettings} className="space-y-4">
                      <div>
                        <label className="block text-xs font-black text-slate-600 uppercase mb-1">ชื่อห้อง</label>
                        <input 
                          type="text" 
                          value={settingsForm.room_name}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, room_name: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-600 uppercase mb-1">จำนวนผู้เล่นสูงสุด</label>
                        <div className="flex gap-2">
                          {[2, 3, 4, 5].map(num => (
                            <button 
                              key={num} 
                              type="button" 
                              onClick={() => setSettingsForm(prev => ({ ...prev, max_players: num }))}
                              className={`flex-1 py-2 rounded-xl font-bold text-xs border transition-all ${settingsForm.max_players === num ? 'bg-rose-500 text-white border-rose-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                            >
                              {num} คน
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-600 uppercase mb-1">รหัสผ่านห้อง</label>
                        <input 
                          type="password" 
                          placeholder="เปลี่ยนรหัสผ่านห้อง..."
                          value={settingsForm.password}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowSettingsModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl">ยกเลิก</button>
                        <button type="submit" className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md">บันทึกการตั้งค่า</button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MODAL 3: PASSWORD PROMPT */}
            <AnimatePresence>
              {joinPasswordPrompt && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                  <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 space-y-4 text-center">
                    <h3 className="text-base font-black text-slate-800">🔒 ใส่รหัสผ่านห้องประลอง</h3>
                    <p className="text-xs text-slate-400">ห้อง "{joinPasswordPrompt.room_name}" มีการตั้งรหัสผ่านลับ</p>
                    <input 
                      type="password" 
                      placeholder="กรอกรหัสผ่านห้อง..." 
                      value={inputPassword}
                      onChange={(e) => setInputPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setJoinPasswordPrompt(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl">ยกเลิก</button>
                      <button onClick={() => handleJoinRoom(joinPasswordPrompt, inputPassword)} className="flex-1 py-2.5 bg-rose-600 text-white font-black text-xs rounded-xl">ยืนยัน</button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

        {/* --- SHOP PHASE VIEW --- */}
        {(phase === PHASES.SHOP_1 || phase === PHASES.SHOP_2) && (
          <div className="h-full w-full overflow-y-auto p-8 max-w-[1400px] mx-auto flex flex-col">
            <div className="text-center mb-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-orange-500"></div>
              <h2 className="text-3xl font-black text-slate-800">{t('shopPhase')}</h2>
              <p className="text-sm text-slate-400 font-bold mt-1">
                {t('timeRemaining')} <span className="text-rose-500 text-lg font-black ml-1">{timeLeft}s</span>
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-100">
                <p className="text-lg font-black text-slate-700 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-2">
                  <span>{t('yourCash')}</span>
                  <span className="text-emerald-600">🪙 {playerState.cash}</span>
                </p>
                <button 
                  onClick={() => rollShop()}
                  className="bg-white hover:bg-amber-50 border border-amber-300 text-amber-600 px-6 py-2.5 rounded-2xl font-black text-xs uppercase flex items-center gap-2 transition-all hover:scale-102 active:scale-98 shadow-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>{t('reroll')} (🪙 {shopState.rerollCost})</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {shopState.items.map((item, index) => (
                <div key={`${item.id}-${index}`} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between transition-all hover:shadow-lg relative overflow-hidden group">
                  {item.purchased && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center">
                      <span className="bg-slate-900 text-white font-black px-5 py-2 rounded-xl rotate-[-8deg] text-sm tracking-widest uppercase shadow-md">
                        {t('soldOut')}
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner
                        ${item.type === 'attack' ? 'bg-rose-50 text-rose-600' : item.type === 'aoe' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <span>{item.icon}</span>
                      </div>
                      <span className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl font-mono text-sm font-black border border-slate-200 shadow-sm">
                        🪙 {item.price}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-800 mb-1 leading-tight">
                      {t(item.nameKey)}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{t(item.descKey)}</p>
                  </div>

                  <button 
                    onClick={() => {
                      if (playerState.cash >= item.price && !item.purchased) {
                        setPlayerState(prev => ({
                          ...prev,
                          cash: prev.cash - item.price,
                          inventory: [...prev.inventory, item]
                        }));
                        setShopState(prev => {
                          const newItems = [...prev.items];
                          newItems[index] = { ...newItems[index], purchased: true };
                          return { ...prev, items: newItems };
                        });
                        notify(`${t('bought')} ${t(item.nameKey)}!`, "success");
                      } else if (playerState.cash < item.price) {
                        notify(t('notEnoughCash'), "error");
                      }
                    }}
                    disabled={playerState.cash < item.price || item.purchased}
                    className={`py-3 rounded-2xl font-black text-xs uppercase transition-all w-full ${
                      item.purchased ? 'bg-slate-100 text-slate-400' :
                      playerState.cash >= item.price 
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md hover:scale-[1.02] active:scale-[0.98]' 
                      : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    {t('purchase')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- BATTLE ROYALE GAMEPLAY VIEW --- */}
        {(phase === PHASES.ROUND_1 || phase === PHASES.ROUND_2 || phase === PHASES.ROUND_3) && (
          <div className="h-full w-full p-6 flex flex-col lg:flex-row gap-6 max-w-[1850px] mx-auto">
            
            {/* LEFT AREA: Coding Workspace */}
            <div className="flex-1 lg:w-3/5 flex flex-col gap-4 overflow-hidden">
              
              {/* Challenge Description Card */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden shrink-0">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 rounded border border-rose-100">
                      Active Problem
                    </span>
                    <h2 className="text-base font-black text-slate-800">
                      {t(phase === PHASES.ROUND_1 ? 'task1Title' : phase === PHASES.ROUND_2 ? 'task2Title' : 'task3Title')}
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-medium">
                      {t(phase === PHASES.ROUND_1 ? 'task1Desc' : phase === PHASES.ROUND_2 ? 'task2Desc' : 'task3Desc')}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 flex items-center space-x-2">
                      <span className="text-rose-500 text-sm">⏱️</span>
                      <span className="text-xs font-black text-rose-700">
                        {timeLeft}s
                      </span>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 flex items-center space-x-2">
                      <span className="text-emerald-500 text-sm">🪙</span>
                      <span className="text-xs font-black text-emerald-700">
                        {playerState.cash}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Hint Display */}
                {playerState.hint && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl flex items-center gap-2">
                    <span>💡</span>
                    <span>{playerState.hint}</span>
                  </div>
                )}

                {phase === PHASES.ROUND_1 && (
                  <div className="mt-3 text-[10px] text-slate-400 font-bold">
                    ⚠️ {t('round1Note')}
                  </div>
                )}
              </div>

              {/* Code Editor Frame with Debuff Effects */}
              <div className={`flex-1 min-h-[300px] relative rounded-3xl border-2 overflow-hidden bg-white flex flex-col shadow-sm transition-all duration-300
                ${checkEffectActive('inkFog') ? 'border-slate-800' : 'border-slate-200'} 
                ${checkEffectActive('keyScrambler') || checkEffectActive('typoGenerator') || checkEffectActive('capsLockLock') ? 'border-red-500' : ''} 
                ${checkEffectActive('screenShake') ? 'animate-bounce' : ''}
              `}>
                
                {/* Active Debuffs Warn Panel */}
                {playerState.activeEffects.length > 0 && (
                  <div className="bg-red-600 text-white py-2 px-4 text-center font-black text-xs animate-pulse tracking-wider flex items-center justify-center gap-2 z-20 shrink-0">
                    <AlertTriangle className="h-3.5 w-3.5 animate-spin" />
                    <span>SYSTEM FAILURE: DEBUFF ACTIVE ({
                      playerState.activeEffects.map(e => {
                        const itm = SHOP_ITEMS.find(s => s.id === e.type);
                        return t(itm ? itm.nameKey : e.type);
                      }).join(', ')
                    })</span>
                  </div>
                )}

                {/* Monaco Editor Container */}
                <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
                  {/* Tab header */}
                  <div className="h-10 bg-slate-50 border-b border-slate-200 px-4 flex items-center justify-between text-xs text-slate-400 font-bold shrink-0">
                    <span>{t('pythonFile')}</span>
                    {checkEffectActive('shield') && (
                      <span className="flex items-center gap-1 text-blue-600">
                        <Shield className="h-3.5 w-3.5" /> Firewall Active
                      </span>
                    )}
                  </div>

                  {/* Monaco Editor Component */}
                  <div className={`flex-1 w-full relative overflow-hidden transition-all duration-300
                    ${checkEffectActive('inkFog') ? 'blur-md pointer-events-none' : ''}
                    ${checkEffectActive('blackout') ? 'brightness-[0.05] pointer-events-none' : ''}
                    ${checkEffectActive('mirrorMode') ? 'scale-x-[-1]' : ''}
                    ${checkEffectActive('screenDimmer') ? 'opacity-[0.12] pointer-events-none' : ''}
                  `}>
                    <Editor
                      height="100%"
                      defaultLanguage="python"
                      theme="vs-light"
                      value={playerState.code}
                      onChange={handleCodeChange}
                      onMount={(editor) => { editorRef.current = editor; }}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineHeight: 22,
                        fontFamily: 'Fira Code, monospace',
                        padding: { top: 12 },
                        domReadOnly: checkEffectActive('timeFreeze') || checkEffectActive('blackout'),
                        readOnly: checkEffectActive('timeFreeze') || checkEffectActive('blackout')
                      }}
                    />
                    
                    {/* Visual Overlay: Blackout / Fog Alert */}
                    {checkEffectActive('blackout') && (
                      <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-30 select-none pointer-events-auto">
                        <span className="text-red-500 font-mono font-bold text-lg tracking-widest animate-pulse">
                          SYSTEM SHUTDOWN: EMP DETONATION
                        </span>
                        <span className="text-slate-500 text-[10px] font-mono mt-2 uppercase tracking-widest">
                          Rebooting monitor screen...
                        </span>
                      </div>
                    )}

                    {checkEffectActive('inkFog') && (
                      <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center z-25 text-white pointer-events-auto">
                        <span className="text-rose-500 text-lg font-black uppercase tracking-wider animate-pulse">
                          Screen Blurs: Ink Fog Debuff
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-sm text-center">
                          A dark ink fog is covering your screen. Wait 15 seconds for fog to clear!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Monaco Editor Textarea Listener for Keyboard Attacks (Backspace Lock) */}
                <textarea
                  className="hidden-listener absolute opacity-0 pointer-events-none h-0 w-0"
                  onKeyDown={handleEditorKeyDown}
                  autoFocus
                />
              </div>

              {/* Console log outputs */}
              <div className="h-28 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-inner shrink-0">
                <div className="h-8 bg-slate-950 border-b border-slate-800 px-4 flex items-center text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0">
                  {t('codeOutput')}
                </div>
                <textarea
                  readOnly
                  value={consoleOutput || "Python Interpreter online. Press Run Local Tests."}
                  className="flex-1 bg-transparent text-emerald-400 px-4 py-3 text-xs font-mono resize-none focus:outline-none placeholder-slate-600"
                />
              </div>

              {/* Actions Footer */}
              <div className="h-16 bg-white border border-slate-200 rounded-3xl px-5 flex items-center justify-between shrink-0 shadow-sm">
                <button 
                  onClick={runCodeTests}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t('runTests')}
                </button>
                
                <button
                  onClick={handleManualSubmit}
                  disabled={isGrading}
                  className="px-8 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white rounded-xl text-xs font-black transition-all shadow-md shadow-rose-500/10 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isGrading ? t('judgingCode') : t('submitCode')}
                </button>
              </div>
            </div>

            {/* RIGHT AREA: Lobby Status (Active Players and inventory) */}
            <div className="w-full lg:w-2/5 xl:w-[420px] flex flex-col gap-4 shrink-0">
              
              {/* BATTLE ROYALE LOBBY STATUS */}
              <div className={`bg-white p-5 rounded-3xl shadow-sm border-2 flex-1 flex flex-col transition-all duration-300
                ${targetingItem ? 'border-rose-500 shadow-lg shadow-rose-500/5' : 'border-slate-200'}
              `}>
                <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex justify-between items-center tracking-wider uppercase">
                  <span>{t('lobbyStatus')}</span>
                  {targetingItem && (
                    <span className="text-[10px] text-rose-600 font-black animate-pulse bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                      🎯 {t('pickTarget')}
                    </span>
                  )}
                </h3>

                {/* You Info Card */}
                <div className={`p-4 rounded-2xl mb-4 border transition-all ${
                  playerState.eliminated 
                    ? 'bg-rose-50 border-rose-200 opacity-60' 
                    : checkEffectActive('shield') 
                      ? 'bg-blue-50 border-blue-200 shadow-md' 
                      : 'bg-slate-50 border-slate-200 shadow-sm'
                }`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black text-xs">
                        U
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-800">{playerState.name} (You)</span>
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          {playerState.eliminated ? t('eliminated') : 'LIVED'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {checkEffectActive('shield') && <Shield className="h-4 w-4 text-blue-600 fill-blue-100 animate-pulse" />}
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                        ⭐ {playerState.score} pt
                      </span>
                    </div>
                  </div>
                </div>

                {/* Opponents List */}
                <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                  {opponents.map((bot, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleTargetClick(i)}
                      className={`p-4 rounded-2xl border transition-all relative overflow-hidden
                        ${bot.eliminated ? 'bg-slate-50 border-slate-200 opacity-60 grayscale' : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'}
                        ${targetingItem && !bot.eliminated ? 'cursor-crosshair bg-rose-50/50 border-rose-300 hover:bg-rose-50 hover:border-rose-500 shadow-md hover:scale-[1.02]' : ''}
                      `}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${bot.eliminated ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                            B
                          </div>
                          <div>
                            <span className={`text-xs font-black ${bot.eliminated ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                              {bot.name}
                            </span>
                            {bot.eliminated && (
                              <span className="block text-[8px] font-bold text-rose-500 uppercase tracking-wider">{t('eliminated')}</span>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] font-black text-emerald-600 font-mono">🪙 {bot.cash}</span>
                      </div>

                      {!bot.eliminated && (
                        <div className="space-y-1">
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, bot.progress)}%` }}></div>
                          </div>
                          <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>Round Progress</span>
                            <span>{Math.min(100, bot.progress)}%</span>
                          </div>
                        </div>
                      )}

                      {targetingItem && !bot.eliminated && (
                        <div className="absolute inset-x-0 bottom-0 bg-rose-600 py-1 text-center text-[9px] font-black text-white uppercase tracking-wider animate-pulse select-none">
                          ⚡ {t('clickToAttack')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* INVENTORY CARD */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-3 min-h-[140px] relative overflow-hidden shrink-0">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500"></div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                  {t('inventory')}
                </h4>

                <div className="flex flex-wrap gap-2.5 pl-2">
                  {playerState.inventory.length === 0 && (
                    <span className="text-slate-400 italic text-xs bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                      {t('empty')}
                    </span>
                  )}

                  {playerState.inventory.map((item, idx) => (
                    <button 
                      key={idx}
                      onClick={() => initiateItemUse(item)}
                      disabled={playerState.eliminated || targetingItem || phase === PHASES.ROUND_1}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-sm border
                        ${targetingItem === item ? 'bg-rose-600 text-white border-rose-600 animate-pulse' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}
                        disabled:opacity-40 hover:scale-105 active:scale-95
                      `}
                      title={t(item.descKey)}
                    >
                      <span className="text-sm">{item.icon}</span> 
                      <span>{t(item.nameKey)}</span>
                      {targetingItem === item && <span className="text-[9px] bg-black/20 px-2 py-0.5 rounded">{t('pickTarget')}</span>}
                    </button>
                  ))}
                  
                  {targetingItem && (
                    <button 
                      onClick={() => setTargetingItem(null)} 
                      className="text-xs text-rose-500 hover:text-rose-600 underline font-bold px-3 ml-auto"
                    >
                      {t('cancelTargeting')}
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* --- RESULT / SCORE SUMMARY VIEW --- */}
        {phase === PHASES.RESULT && (
          <div className="h-full w-full overflow-y-auto p-8 max-w-3xl mx-auto flex flex-col items-center justify-center text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-2"
            >
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">{t('matchOver')}</h1>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Final Arena Placements</p>
            </motion.div>

            {/* Winner Trophy Box */}
            {(() => {
              const allPlayers = [
                { name: playerState.name, score: playerState.score, isPlayer: true, eliminated: playerState.eliminated },
                ...opponents.map(b => ({ name: b.name, score: b.score, isPlayer: false, eliminated: b.eliminated }))
              ].sort((a, b) => b.score - a.score);
              const winner = allPlayers[0];

              return (
                <>
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 w-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 to-amber-500"></div>
                    <div className="p-4 bg-amber-50 rounded-full text-amber-500 inline-block mb-3 shadow-inner">
                      <Trophy className="h-10 w-10 fill-amber-100" />
                    </div>
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('winner')}</h2>
                    <div className="text-3xl font-black text-slate-800">
                      {winner.name}
                    </div>
                    <p className="text-sm text-slate-400 font-mono mt-1">Final Score: <span className="text-emerald-600 font-bold">{winner.score} pts</span></p>
                  </div>

                  {/* Placement List */}
                  <div className="w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
                    {allPlayers.map((p, idx) => (
                      <div key={idx} className={`flex justify-between items-center p-5 border-b border-slate-100 last:border-0 ${p.isPlayer ? 'bg-rose-50/50 font-black' : 'hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-4">
                          <span className={`w-8 text-center text-xs font-black ${idx === 0 ? 'text-amber-500' : 'text-slate-400'}`}>#{idx + 1}</span>
                          <span className={`text-xs ${p.eliminated ? 'text-slate-400 line-through font-normal' : 'text-slate-700'}`}>
                            {p.name} {p.isPlayer ? "(You)" : ""}
                          </span>
                        </div>
                        <span className="text-emerald-600 font-mono text-xs font-bold">{p.score} pt</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button 
                onClick={() => handleFinishChoice('LEAVE')}
                className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-2xl border border-slate-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                🚪 ออกจากห้อง (Leave Room)
              </button>

              <button 
                onClick={() => handleFinishChoice('REMAIN')}
                className="px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                🔄 อยู่ในห้องเดิมต่อ (Remain in Room)
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 3. NOTIFICATION DISPATCHER POPUPS */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-50 pointer-events-none max-w-sm">
        {notifications.map(n => (
          <div key={n.id} className={`px-4 py-3 rounded-2xl shadow-lg text-xs font-bold flex items-center gap-2 border animate-bounce-slight ${
            n.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
            n.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
            n.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-700' :
            'bg-white border-slate-200 text-slate-700'
          }`}>
            <span>{
              n.type === 'error' ? '🚨' : 
              n.type === 'success' ? '✅' : 
              n.type === 'warning' ? '🔔' : 'ℹ️'
            }</span>
            <span className="flex-1">{n.msg}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
