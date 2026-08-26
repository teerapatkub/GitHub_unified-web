import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Trophy, 
  BookOpen, 
  User, 
  ArrowLeft,
  CalendarDays,
  Mail,
  Play,
  Send,
  Plus,
  PlusCircle,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  PanelRight,
  Gauge,
  ShieldCheck,
  Sparkles,
  ListChecks,
  Trash2,
  ShoppingBag,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { API_BASE } from '../config/api.js';

const arenaFallbacks = {
  acceptChallenge: 'Accept Challenge',
  accepted: 'Open Editor',
  activeSolversSuffix: 'active solvers',
  backToHub: 'Back to Hub',
  claimBtn: 'Claim',
  claimed: 'Claimed',
  closeEditor: 'Close editor',
  codeOutput: 'Code Output',
  codeOutputPlaceholder: 'Run tests to see output here.',
  feedTitle: 'Competitive Challenges',
  forceSummary: 'Force Summary',
  forceSummaryWarning: 'Summarize this test challenge immediately.',
  mailboxEmpty: 'No mail yet.',
  mailboxTitle: 'Mailbox',
  noActiveChallenges: 'No active challenges yet.',
  openEditor: 'Open editor',
  postChallenge: 'Post a challenge',
  postDesc: 'Description',
  postSubmit: 'Post',
  postTitle: 'Title',
  rewardCoins: 'Reward coins',
  runTests: 'Run tests',
  saved: 'Saved',
  saving: 'Saving',
  solverReward: 'Solver reward',
  submitCode: 'Submit code',
  submitted: 'Submitted',
  timeRemaining: 'Time remaining',
  unlimitedTime: 'Unlimited time',
};

const scoringRubric = [
  { key: 'correctness', label: 'Correctness', weight: 50, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'complexity', label: 'Efficiency', weight: 20, icon: Gauge, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'cleanCode', label: 'Clean Code', weight: 30, icon: Sparkles, color: 'text-violet-600', bg: 'bg-violet-50' },
];

const defaultPostTestCases = [
  { input: '', expected: '' },
];

const challengeTemplates = [
  { category: 'Loop', guide: 'เหมาะกับโจทย์ที่ต้องทำซ้ำ เช่น รวมค่า นับจำนวน หรือพิมพ์รูปแบบหลายบรรทัด' },
  { category: 'If-Else', guide: 'เหมาะกับโจทย์ตัดสินเงื่อนไข เช่น ผ่าน/ไม่ผ่าน มากกว่า/น้อยกว่า หรือแบ่งกลุ่มคำตอบ' },
  { category: 'List', guide: 'เหมาะกับโจทย์ข้อมูลหลายตัว เช่น หาค่าสูงสุด ค่าต่ำสุด กรองข้อมูล หรือคำนวณจากรายการ' },
  { category: 'String', guide: 'เหมาะกับโจทย์ข้อความ เช่น นับตัวอักษร กลับข้อความ ตรวจคำ หรือจัดรูปแบบข้อความ' },
  { category: 'Function', guide: 'เหมาะกับโจทย์ที่อยากให้ผู้เล่นแยก logic เป็นฟังก์ชัน เพื่อฝึกโครงสร้างโค้ด' },
  { category: 'Nested Loop', guide: 'เหมาะกับโจทย์ลูปซ้อน เช่น ตาราง รูปดาว matrix หรือการเปรียบเทียบข้อมูลเป็นคู่' },
  { category: 'Dictionary', guide: 'เหมาะกับโจทย์ key-value เช่น นับความถี่ จัดกลุ่มข้อมูล หรือค้นหาจากรหัส' },
  { category: 'Math', guide: 'เหมาะกับโจทย์คำนวณ เช่น สูตรพื้นฐาน หารลงตัว จำนวนเฉพาะ หรือเลขลำดับ' },
];

const challengeScopeMeta = {
  daily: {
    th: 'โจทย์รายวัน',
    en: 'Daily',
    className: 'bg-sky-50 text-sky-700 border-sky-100',
    icon: CalendarDays,
  },
  weekly: {
    th: 'โจทย์รายสัปดาห์',
    en: 'Weekly',
    className: 'bg-orange-50 text-orange-700 border-orange-100',
    icon: Flame,
  },
};

const getChallengeScopeMeta = (challenge) => (
  challengeScopeMeta[String(challenge?.challenge_scope || '').toLowerCase()] || null
);

const getInputLines = (value) => String(value ?? '').split(/\r?\n/);

const buildScoreLine = (scoreBreakdown) => {
  if (!scoreBreakdown) return 'Rubric pending.';
  return `Correctness ${scoreBreakdown.correctness}/50 | Efficiency ${scoreBreakdown.complexity}/20 | Clean ${scoreBreakdown.cleanCode}/30 | Speed ${scoreBreakdown.speedBonus || 0}`;
};

const buildAiReviewLine = (scoreBreakdown) => {
  if (!scoreBreakdown) return '';
  if (scoreBreakdown.aiReviewed) {
    return scoreBreakdown.aiApproved
      ? 'AI review: approved for reward.'
      : 'AI review: needs fixes before reward.';
  }
  if (scoreBreakdown.aiUnavailable) {
    return 'AI review: temporarily unavailable, fallback rubric used.';
  }
  return '';
};

const parseChallengeTestCases = (challenge) => {
  if (!challenge?.test_cases) return [];
  if (Array.isArray(challenge.test_cases)) return challenge.test_cases;
  try {
    const parsed = JSON.parse(challenge.test_cases);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const buildStarterCode = () => '';

const getInitialEditorCode = (challenge) => {
  const code = String(challenge?.code_state || '');
  if (code.includes('# Read input with input(), then print the answer.') && code.includes('# Example:')) {
    return '';
  }
  return code || buildStarterCode();
};

const getAcceptedAtTime = (acceptedAtValue, nowValue = Date.now()) => {
  const parsed = acceptedAtValue ? new Date(acceptedAtValue).getTime() : NaN;
  if (!Number.isFinite(parsed)) return NaN;
  if (parsed <= nowValue + 1000) return parsed;

  const timezoneAdjusted = parsed + new Date().getTimezoneOffset() * 60000;
  if (Number.isFinite(timezoneAdjusted) && timezoneAdjusted <= nowValue + 1000) {
    return timezoneAdjusted;
  }

  return nowValue;
};

const getRemainingSeconds = (challenge, nowValue = Date.now()) => {
  if (!challenge || Number(challenge.is_test) === 1) return null;
  const timeLimit = Number(challenge.time_limit || 0);
  if (!timeLimit) return null;
  const acceptedAt = getAcceptedAtTime(challenge.accepted_at, nowValue);
  if (!Number.isFinite(acceptedAt)) return timeLimit;
  const elapsed = Math.max(0, Math.floor((nowValue - acceptedAt) / 1000));
  return Math.max(0, timeLimit - elapsed);
};

const formatRemainingTime = (seconds) => {
  if (seconds == null) return 'No limit';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const formatChallengeTimeLimit = (seconds) => {
  const totalSeconds = Number(seconds || 0);
  if (!totalSeconds) return 'No limit';
  if (totalSeconds < 3600) return `${Math.round(totalSeconds / 60)} min`;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

const formatChallengeExpiresAt = (value, language) => {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Intl.DateTimeFormat(language === 'th' ? 'th-TH' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getCreatorBonus = (challenge, userId) => {
  const creatorId = Number(challenge?.created_by || 0);
  const reward = Number(challenge?.reward || 0);
  if (!creatorId || creatorId === Number(userId) || reward <= 0) return 0;
  if (String(challenge?.creator_role || '').toLowerCase() === 'admin') return 0;
  return Math.max(10, Math.round(reward * 0.15));
};

export default function CompetitiveArena() {
  const { t: translate, i18n } = useTranslation();
  const t = (key, fallback) => {
    if (key.startsWith('arena.')) {
      return translate(key, arenaFallbacks[key.replace('arena.', '')] || fallback || key);
    }
    return translate(key, fallback);
  };
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // States for Challenges Feed
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // Mailbox States
  const [mailboxOpen, setMailboxOpen] = useState(false);
  const [mailbox, setMailbox] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Editor Workspace Drawer States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTabs, setActiveTabs] = useState([]); // Array of challenge objects
  const [activeTabId, setActiveTabId] = useState(null);
  const [editorCode, setEditorCode] = useState("");
  const [consoleOutput, setConsoleOutput] = useState("");
  const [saveStatus, setSaveStatus] = useState(""); // saving, saved
  
  // Post Challenge Form States
  const [showPostForm, setShowPostForm] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postDesc, setPostDesc] = useState("");
  const [postReward, setPostReward] = useState(300);
  const [postTimeLimit, setPostTimeLimit] = useState(300);
  const [postTestCases, setPostTestCases] = useState(defaultPostTestCases);
  const [selectedLessonTemplate, setSelectedLessonTemplate] = useState(challengeTemplates[0]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [now, setNow] = useState(Date.now());

  const activeChallenge = activeTabs.find(tab => tab.challenge_id === activeTabId);
  const remainingSeconds = getRemainingSeconds(activeChallenge, now);
  const isActiveExpired = remainingSeconds === 0;

  // Load user details
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      fetchMailbox(parsedUser.user_id);
    } else {
      navigate('/login');
    }
  }, []);

  // Localization Helpers to prevent language mixing in UI
  //
  // Challenges now carry title_en/description_en from the problem bank, so the
  // English text comes from the database rather than from the two hard-coded
  // special cases below. Those stay for the Thai direction: the two test
  // challenges were authored in English, so `c.title` is already English and
  // there is no Thai column to fall back to.
  const getLocalizedTitle = (c) => {
    if (i18n.language !== 'th') {
      const en = String(c.title_en || '').trim();
      if (en) return en;
    }
    if (Number(c.is_test) === 1) {
      if (c.title.includes("Hello World")) {
        return i18n.language === 'th' ? "โจทย์ทดสอบ 1: การแสดงผลข้อความ" : "Test Challenge 1: Hello World";
      } else if (c.title.includes("Number Adder")) {
        return i18n.language === 'th' ? "โจทย์ทดสอบ 2: การบวกเลข" : "Test Challenge 2: Number Adder";
      }
    }
    return c.title;
  };

  const getLocalizedDesc = (c) => {
    if (i18n.language !== 'th') {
      const en = String(c.description_en || '').trim();
      if (en) return en;
    }
    if (Number(c.is_test) === 1) {
      if (c.title.includes("Hello World")) {
        return i18n.language === 'th' 
          ? "เขียนโปรแกรม Python แสดงผลคำว่า 'Hello World' ออกทางหน้าจอ · โจทย์ชุดทดสอบระบบ ไม่มีเวลาจำกัดและส่งซ้ำได้เรื่อยๆ ใช้ลองว่าสนามแข่งทำงานอย่างไร"
          : "Write a Python script that prints 'Hello World'. A system test challenge: no time limit and you can submit as often as you like, so you can see how the arena works.";
      } else if (c.title.includes("Number Adder")) {
        return i18n.language === 'th'
          ? "เขียนโปรแกรม Python รับค่าอินพุตเป็นตัวเลข 2 บรรทัดและพิมพ์ผลบวกออกทางหน้าจอ · โจทย์ชุดทดสอบระบบ ไม่มีเวลาจำกัดและส่งซ้ำได้เรื่อยๆ ใช้ลองว่าสนามแข่งทำงานอย่างไร"
          : "Write a Python script that takes two inputs and prints their sum. A system test challenge: no time limit and you can submit as often as you like, so you can see how the arena works.";
      }
    }
    return c.description;
  };

  const getLocalizedMailTitle = (mail) => {
    if (mail.title.includes("ผลการประลองโจทย์:")) {
      const challengeTitle = mail.title.replace("ผลการประลองโจทย์: ", "");
      let localizedChallengeTitle = challengeTitle;
      if (challengeTitle.includes("Hello World")) {
        localizedChallengeTitle = i18n.language === 'th' ? "โจทย์ทดสอบ 1: การแสดงผลข้อความ" : "Test Challenge 1: Hello World";
      } else if (challengeTitle.includes("Number Adder")) {
        localizedChallengeTitle = i18n.language === 'th' ? "โจทย์ทดสอบ 2: การบวกเลข" : "Test Challenge 2: Number Adder";
      }
      return i18n.language === 'th' 
        ? `ผลการประลองโจทย์: ${localizedChallengeTitle}`
        : `Challenge Summary: ${localizedChallengeTitle}`;
    }
    return mail.title;
  };

  const getLocalizedMailContent = (mail) => {
    if (mail.content.includes("ขอแสดงความยินดี!")) {
      const rankMatch = mail.content.match(/อันดับที่ (\d+)/);
      const coinsMatch = mail.content.match(/จำนวน (\d+) Code Coins/);
      const challengeMatch = mail.content.match(/โจทย์ '([^']+)'/);
      
      const rank = rankMatch ? rankMatch[1] : "1";
      const coins = coinsMatch ? coinsMatch[1] : "0";
      const challengeTitle = challengeMatch ? challengeMatch[1] : "";
      
      let localizedChallengeTitle = challengeTitle;
      if (challengeTitle.includes("Hello World")) {
        localizedChallengeTitle = i18n.language === 'th' ? "โจทย์ทดสอบ 1: การแสดงผลข้อความ" : "Test Challenge 1: Hello World";
      } else if (challengeTitle.includes("Number Adder")) {
        localizedChallengeTitle = i18n.language === 'th' ? "โจทย์ทดสอบ 2: การบวกเลข" : "Test Challenge 2: Number Adder";
      }

      return i18n.language === 'th'
        ? `ขอแสดงความยินดี! คุณได้อันดับที่ ${rank} จากการเข้าร่วมแข่งขันในโจทย์ '${localizedChallengeTitle}' ผลคะแนนของคุณคือ 100/100 และได้รับรางวัลเป็นจำนวน ${coins} Code Coins (โหมดจำลองระบบทดสอบ)`
        : `Congratulations! You placed Rank ${rank} in challenge '${localizedChallengeTitle}'. Your final score is 100/100 and you received a reward of ${coins} Code Coins (Simulation Test Mode).`;
    }
    return mail.content;
  };

  // Fetch mailbox list
  const fetchMailbox = async (userId) => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_BASE}/api/mailbox/${userId}`);
      const data = await response.json();
      setMailbox(data);
      setUnreadCount(data.filter(m => Number(m.is_read) === 0).length);
    } catch (e) {
      console.error("Error fetching mailbox:", e);
    }
  };

  const markMailboxAsRead = async (userId) => {
    if (!userId) return;
    try {
      await fetch(`${API_BASE}/api/mailbox/${userId}/read-all`, {
        method: 'POST'
      });
      setUnreadCount(0);
      setMailbox((current) => current.map((mail) => ({ ...mail, is_read: 1 })));
    } catch (e) {
      console.error("Error marking mailbox as read:", e);
    }
  };

  // Fetch challenges feed
  const fetchChallenges = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE}/api/competitive/challenges?userId=${user.user_id}`);
      const data = await response.json();
      setChallenges(data);
      fetchMailbox(user.user_id);
      
      // Update active tabs if they were modified on the backend
      const acceptedChallenges = data.filter(c => Number(c.is_accepted) === 1);
      if (acceptedChallenges.length > 0) {
        setActiveTabs(acceptedChallenges);
        if (!activeTabId) {
          setActiveTabId(acceptedChallenges[0].challenge_id);
          setEditorCode(getInitialEditorCode(acceptedChallenges[0]));
        }
      }
    } catch (e) {
      console.error("Error fetching challenges:", e);
    }
  };

  const fetchLeaderboard = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE}/api/competitive/leaderboard?userId=${user.user_id}`);
      if (!response.ok) return;
      const data = await response.json();
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching arena leaderboard:", e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChallenges();
      fetchLeaderboard();
    }
  }, [user]);

  useEffect(() => {
    if (mailboxOpen && user?.user_id) {
      markMailboxAsRead(user.user_id);
    }
  }, [mailboxOpen, user?.user_id]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isActiveExpired) {
      setConsoleOutput("Time is up. This challenge is lost and cannot receive score.");
      const syncTimeoutMailbox = async () => {
        await fetchChallenges();
        if (user?.user_id) {
          await fetchMailbox(user.user_id);
          setMailboxOpen(true);
        }
      };
      syncTimeoutMailbox();
    }
  }, [isActiveExpired, activeTabId]);

  // Handle Tab Switch
  const handleTabChange = (challengeId) => {
    if (activeTabId && editorCode) {
      saveDraftCode(activeTabId, editorCode);
    }
    setActiveTabId(challengeId);
    const target = activeTabs.find(t => t.challenge_id === challengeId);
    if (target) {
      setEditorCode(getInitialEditorCode(target));
    }
    setConsoleOutput("");
  };

  // Debounced auto-save draft code
  const saveTimeoutRef = useRef(null);
  const handleCodeChange = (val) => {
    setEditorCode(val);
    
    setActiveTabs(prev => prev.map(tab => 
      tab.challenge_id === activeTabId ? { ...tab, code_state: val } : tab
    ));

    setSaveStatus("saving");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      saveDraftCode(activeTabId, val);
    }, 1000);
  };

  const saveDraftCode = async (challengeId, code) => {
    if (!user || !challengeId) return;
    try {
      await fetch(`${API_BASE}/api/competitive/challenges/${challengeId}/save-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, code })
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 1500);
    } catch (e) {
      console.error("Failed to save draft:", e);
    }
  };

  // Accept a Challenge
  const handleAcceptChallenge = async (challenge) => {
    if (!user) return;
    try {
      await fetch(`${API_BASE}/api/competitive/challenges/${challenge.challenge_id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id })
      });
      
      await fetchChallenges();
      
      setIsEditorOpen(true);
      setActiveTabId(challenge.challenge_id);
      setActiveTabs(prev => {
        const acceptedChallenge = {
          ...challenge,
          is_accepted: 1,
          accepted_at: challenge.accepted_at || new Date().toISOString(),
          code_state: challenge.code_state || '',
        };
        const exists = prev.some(tab => tab.challenge_id === challenge.challenge_id);
        return exists
          ? prev.map(tab => tab.challenge_id === challenge.challenge_id ? acceptedChallenge : tab)
          : [...prev, acceptedChallenge];
      });
      setEditorCode(getInitialEditorCode(challenge));
    } catch (e) {
      console.error("Error accepting challenge:", e);
    }
  };

  // Submit Challenge Solution
  const handleSubmitCode = async () => {
    if (!user || !activeTabId) return;
    if (isActiveExpired) {
      setConsoleOutput("Time is up. You lost this challenge and received 0 score.");
      return;
    }
    setConsoleOutput("Submitting solution...\nRunning test cases...");
    try {
      const response = await fetch(`${API_BASE}/api/competitive/challenges/${activeTabId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, code: editorCode })
      });
      const res = await response.json();
      if (res.success) {
        const creatorBonusLine = Number(res.creatorBonusCoins || 0) > 0
          ? `Creator bonus: ${res.creatorBonusCoins} coins were sent to the poster.`
          : '';
        setConsoleOutput([
          `Submitted successfully.`,
          `Tests: ${res.passed}/${res.total} passed.`,
          `Final score: ${res.score}/100`,
          `Reward mail: ${res.rewardCoins || 0} coins are waiting in your mailbox.`,
          creatorBonusLine,
          buildAiReviewLine(res.breakdown),
          buildScoreLine(res.breakdown),
          res.feedback ? `Feedback: ${res.feedback}` : '',
        ].filter(Boolean).join('\n'));
        await fetchChallenges();
        await fetchLeaderboard();
        await fetchMailbox(user.user_id);
        setIsEditorOpen(false);
        setMailboxOpen(true);
      } else {
        setConsoleOutput(`Error: ${res.error}`);
      }
    } catch (e) {
      setConsoleOutput(`Error: Connection failed.`);
    }
  };

  const handleRunTests = async () => {
    if (!user || !activeTabId) return;
    if (isActiveExpired) {
      setConsoleOutput("Time is up. You cannot run tests for this challenge anymore.");
      return;
    }
    setIsRunningTests(true);
    setConsoleOutput("Running Python test cases on the server...");

    try {
      const response = await fetch(`${API_BASE}/api/competitive/challenges/${activeTabId}/run-tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, code: editorCode })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setConsoleOutput(`Error: ${data.error || 'Failed to run tests.'}`);
        return;
      }

      const lines = [
        `Run complete: ${data.passed}/${data.total} test cases passed.`,
        '',
        ...data.results.map((result, index) => [
          `Case ${index + 1}: ${result.passed ? 'PASS' : 'FAIL'}`,
          `Input: ${result.input || '(empty)'}`,
          `Expected: ${result.expected}`,
          `Actual: ${result.actual || '(empty)'}`,
          result.error ? `Error: ${result.error}` : '',
        ].filter(Boolean).join('\n')),
      ];

      setConsoleOutput(lines.join('\n\n'));
    } catch (e) {
      setConsoleOutput("Error: Connection failed while running tests.");
    } finally {
      setIsRunningTests(false);
    }
  };

  // Claim Mail Attachment Reward
  const handleClaimMailReward = async (mail) => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE}/api/mailbox/${mail.mail_id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id })
      });
      const data = await response.json();
      if (data.success) {
        fetchMailbox(user.user_id);
        const updatedUser = { ...user, virtual_currency: (user.virtual_currency || 0) + data.claimed_coins };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch(e) {
      console.error("Error claiming rewards:", e);
    }
  };

  // Force Summary (Instant evaluation for test challenges)
  const handleForceSummary = async (challengeId) => {
    try {
      const response = await fetch(`${API_BASE}/api/competitive/challenges/${challengeId}/force-summary`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        alert(i18n.language === 'th' ? "สรุปผลและส่งรางวัลเข้ากล่องจดหมายผู้เล่นเรียบร้อย!" : "Instant summary completed! Mailbox rewards generated.");
        fetchChallenges();
        fetchMailbox(user.user_id);
      }
    } catch(e) {
      console.error("Error forcing challenge summary:", e);
    }
  };

  // Post a New Challenge from the Feed creator box
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle || !postDesc) return;
    let normalizedTestCases = postTestCases
      .map((testCase) => ({
        input: String(testCase.input || ''),
        expected: String(testCase.expected || ''),
      }))
      .filter((testCase) => testCase.expected.trim() !== '');

    if (normalizedTestCases.length === 0) {
      alert('กรุณาสร้าง test case เองอย่างน้อย 1 ชุดก่อนโพสต์โจทย์');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/competitive/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle,
          description: postDesc,
          difficulty: 'Easy',
          reward: postReward,
          time_limit: postTimeLimit,
          created_by: user.user_id,
          test_cases: normalizedTestCases
        })
      });
      
      if (response.status === 201) {
        setPostTitle("");
        setPostDesc("");
        setPostTestCases(defaultPostTestCases);
        setPostReward(300);
        setPostTimeLimit(300);
        setShowPostForm(false);
        fetchChallenges();
      }
    } catch(e) {
      console.error("Error creating post:", e);
    }
  };

  const updatePostTestCase = (index, field, value) => {
    setPostTestCases((cases) => cases.map((testCase, caseIndex) => (
      caseIndex === index ? { ...testCase, [field]: value } : testCase
    )));
  };

  const updatePostInputLine = (caseIndex, lineIndex, value) => {
    setPostTestCases((cases) => cases.map((testCase, index) => {
      if (index !== caseIndex) return testCase;
      const lines = getInputLines(testCase.input);
      lines[lineIndex] = value;
      return { ...testCase, input: lines.join('\n') };
    }));
  };

  const addPostInputLine = (caseIndex) => {
    setPostTestCases((cases) => cases.map((testCase, index) => (
      index === caseIndex
        ? { ...testCase, input: [...getInputLines(testCase.input), ''].join('\n') }
        : testCase
    )));
  };

  const removePostInputLine = (caseIndex, lineIndex) => {
    setPostTestCases((cases) => cases.map((testCase, index) => {
      if (index !== caseIndex) return testCase;
      const lines = getInputLines(testCase.input);
      const nextLines = lines.length > 1 ? lines.filter((_, currentIndex) => currentIndex !== lineIndex) : [''];
      return { ...testCase, input: nextLines.join('\n') };
    }));
  };

  const addPostTestCase = () => {
    setPostTestCases((cases) => [...cases, { input: '', expected: '' }]);
  };

  const removePostTestCase = (index) => {
    setPostTestCases((cases) => cases.length > 1 ? cases.filter((_, caseIndex) => caseIndex !== index) : cases);
  };

  const applyChallengeTemplate = (template) => {
    setSelectedLessonTemplate(template);
    setPostTitle("");
    setPostDesc("");
    setPostReward(300);
    setPostTimeLimit(300);
    setPostTestCases(defaultPostTestCases);
  };

  return (
    <div className="min-h-screen bg-pysim-surface text-slate-800 flex flex-col font-sans antialiased overflow-x-hidden relative">
      
      {/* 1. CUSTOM TOP NAVBAR (Adapting previous dark navbar to light site theme) */}
      <nav className="pysim-theme-navbar h-16 sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex justify-between items-center shadow-sm w-full mb-8">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/menu')}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-xs font-black uppercase tracking-[0.24em] bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t('arena.feedTitle')}
            </span>
            <span className="block text-[8px] font-bold tracking-widest text-slate-400 uppercase">
              PyClash Arena • Mode 1
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* COINS BALANCE DISPLAY */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center space-x-2">
            <Award className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-black text-slate-700">
              {user ? user.virtual_currency || 0 : 0} {i18n.language === 'th' ? 'เหรียญ' : 'Coins'}
            </span>
          </div>

          {/* SYSTEM MAILBOX TOGGLE */}
          <button 
            onClick={() => navigate('/shop')}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 transition-all flex items-center justify-center hover:scale-[1.03]"
            title="Shop"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>

          <button 
            onClick={() => setMailboxOpen(true)}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 transition-all flex items-center justify-center relative hover:scale-[1.03]"
          >
            <Mail className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] font-black animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* BACK TO HUB LINK */}
          <button
            onClick={() => navigate('/menu')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('arena.backToHub')}</span>
          </button>
        </div>
      </nav>

      <div className="mx-auto mb-6 flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Trophy className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-black text-slate-800">Competitive Arena</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Community-driven coding challenges</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[10px] font-black uppercase text-slate-500">
          {scoringRubric.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className={`flex items-center gap-2 rounded-xl px-3 py-2 ${item.bg}`}>
                <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                <span>{item.weight}% {item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. BODY CONTENT (SPLIT-SCREEN DRAWER LAYOUT) */}
      <div className="max-w-6xl mx-auto w-full flex-1 flex relative px-4">
        
        {/* LEFT COLUMN: SOCIAL FEED (50% or 100%) */}
        <div className={`transition-all duration-300 flex flex-col items-center overflow-y-auto ${isEditorOpen ? 'w-full md:w-1/2 pr-0 md:pr-4' : 'w-full'}`}>
          <div className="w-full space-y-6">
            
            {/* POST CHALLENGE BOX (like Facebook write post) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <button 
                  onClick={() => setShowPostForm(!showPostForm)}
                  className="flex-1 text-left px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  {t('arena.postChallenge')}...
                </button>
              </div>

              <AnimatePresence>
                {showPostForm && (
                  <motion.form 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    onSubmit={handleCreatePost}
                    className="space-y-4 pt-2 border-t border-slate-100 overflow-hidden"
                  >
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Python Lesson Topic</p>
                          <p className="mt-1 text-[11px] font-semibold text-slate-500">เลือกหมวดบทเรียนเป็นแนวทาง แล้วกำหนด test cases ด้วยตัวเอง</p>
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 ring-1 ring-blue-100">
                          {selectedLessonTemplate?.category}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {challengeTemplates.map((template) => (
                          <button
                            key={template.category}
                            type="button"
                            onClick={() => applyChallengeTemplate(template)}
                            className={`rounded-full border px-3 py-1.5 text-[10px] font-black transition-colors ${selectedLessonTemplate?.category === template.category ? 'border-blue-500 bg-blue-600 text-white' : 'border-blue-100 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'}`}
                          >
                            {template.category}
                          </button>
                        ))}
                      </div>
                      <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-[11px] font-semibold leading-relaxed text-slate-500 ring-1 ring-blue-100">
                        {selectedLessonTemplate?.guide}
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">{t('arena.postTitle')}</label>
                      <input 
                        type="text" 
                        required 
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="เช่น ตั้งชื่อโจทย์ของคุณเอง"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">{t('arena.postDesc')}</label>
                      <textarea 
                        required
                        value={postDesc}
                        onChange={(e) => setPostDesc(e.target.value)}
                        placeholder={'เขียนรายละเอียดโจทย์เอง เช่น\nข้อมูลนำเข้า:\n...\n\nผลลัพธ์:\n...'}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">{t('arena.rewardCoins')}</label>
                        <input 
                          type="number" 
                          value={postReward}
                          onChange={(e) => setPostReward(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">{t('arena.timeRemaining')} (s)</label>
                        <input 
                          type="number" 
                          value={postTimeLimit}
                          onChange={(e) => setPostTimeLimit(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-[11px] font-bold leading-relaxed text-amber-800">
                      {i18n.language === 'th'
                        ? `คนโพสต์จะได้รับโบนัส ${Math.max(10, Math.round(Number(postReward || 0) * 0.15))} เหรียญต่อ 1 คนที่ส่งงานสำเร็จ`
                        : `Poster bonus: ${Math.max(10, Math.round(Number(postReward || 0) * 0.15))} coins for each successful solver.`}
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <ListChecks className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-900">Test cases</h3>
                            <p className="mt-0.5 text-xs font-bold text-slate-400">ผู้โพสต์ต้องกำหนด input และคำตอบเองก่อนโพสต์</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={addPostTestCase}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs font-black text-blue-600 ring-1 ring-slate-200 transition-colors hover:bg-blue-50"
                        >
                          <Plus className="h-4 w-4" />
                          เพิ่ม case
                        </button>
                      </div>

                      <div className="space-y-4">
                        {postTestCases.map((testCase, index) => (
                          <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-black text-slate-900">Test case #{index + 1}</p>
                                <p className="mt-1 text-xs font-bold text-slate-400">ข้อมูลเข้าและคำตอบที่ถูกต้อง</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removePostTestCase(index)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                                title="Remove test case"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr]">
                              <div className="min-h-[266px] rounded-2xl border border-slate-200 bg-white p-5">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-blue-600">Input</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => addPostInputLine(index)}
                                    className="rounded-2xl bg-blue-50 px-4 py-2 text-xs font-black text-blue-600 transition-colors hover:bg-blue-100"
                                  >
                                    เพิ่มบรรทัด
                                  </button>
                                </div>

                                <div className="space-y-2">
                                  {getInputLines(testCase.input).map((line, lineIndex) => (
                                    <div key={lineIndex} className="grid grid-cols-[116px_1fr_auto] items-center gap-2">
                                      <span className="flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 text-center text-xs font-black text-slate-500">
                                        บรรทัด {lineIndex + 1}
                                      </span>
                                      <input
                                        value={line}
                                        onChange={(event) => updatePostInputLine(index, lineIndex, event.target.value)}
                                        placeholder="ค่าที่โปรแกรมอ่านจาก input()"
                                        className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removePostInputLine(index, lineIndex)}
                                        className="flex h-11 w-11 items-center justify-center rounded-2xl text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
                                        title="ลบบรรทัด input"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="min-h-[266px] rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                                <label className="block">
                                  <span className="mb-4 block text-xs font-black uppercase tracking-widest text-emerald-700">
                                    Expected output
                                  </span>
                                  <textarea
                                    rows={6}
                                    required
                                    value={testCase.expected}
                                    onChange={(e) => updatePostTestCase(index, 'expected', e.target.value)}
                                    placeholder="ผลลัพธ์ที่ถูกต้อง"
                                    className="min-h-[182px] w-full resize-none rounded-2xl border border-emerald-200 bg-white px-4 py-4 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400"
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-blue-500/10"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>{t('arena.postSubmit')}</span>
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {leaderboard.length > 0 && (
              <div className="grid gap-3 md:grid-cols-3">
                {leaderboard.slice(0, 3).map((entry, index) => (
                  <div key={`${entry.user_id}-${entry.challenge_id}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rank {index + 1}</span>
                      <Trophy className={`h-4 w-4 ${index === 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                    </div>
                    <p className="truncate text-sm font-black text-slate-800">{entry.username || 'Coder'}</p>
                    <p className="mt-1 truncate text-[11px] font-medium text-slate-500">
                      ทำแล้ว {Number(entry.challenge_count || 0)} โจทย์ • เฉลี่ย {Number(entry.avg_score || 0)}/100
                    </p>
                    <p className="mt-3 text-xl font-black text-blue-600">{Number(entry.score || 0).toLocaleString()} คะแนนรวม</p>
                  </div>
                ))}
              </div>
            )}

            {/* FEED ACTIVE POSTS LIST */}
            {challenges.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs font-bold">
                {t('arena.noActiveChallenges')}
              </div>
            ) : (
              challenges.map((c) => {
                const testCases = parseChallengeTestCases(c);
                const creatorBonus = getCreatorBonus(c, user?.user_id);
                const scopeMeta = getChallengeScopeMeta(c);
                const ScopeIcon = scopeMeta?.icon;
                return (
                  <div key={c.challenge_id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden hover:border-slate-300 transition-colors">
                    
                    {/* Post Author header */}
                    <div className="p-5 flex justify-between items-center border-b border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-700">{c.creator_name}</span>
                          <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                            Challenge #{c.challenge_id} • {c.is_test ? "SYSTEM TEST CHALLENGE" : String(c.creator_role || '').toLowerCase() === 'admin' ? "ADMIN CHALLENGE" : "USER CONTRIBUTOR"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2 text-[10px] font-black uppercase">
                        {scopeMeta && ScopeIcon && (
                          <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${scopeMeta.className}`}>
                            <ScopeIcon className="h-3 w-3" />
                            {i18n.language === 'th' ? scopeMeta.th : scopeMeta.en}
                          </span>
                        )}
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-600">
                          รับแล้ว {Number(c.active_count || 0)}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-600">
                          ส่งแล้ว {Number(c.submission_count || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Challenge contents */}
                    <div className="p-5 space-y-4">
                      <h3 className="text-sm font-black text-slate-800">{getLocalizedTitle(c)}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium whitespace-pre-wrap">{getLocalizedDesc(c)}</p>
                      
                      <div className="flex items-center space-x-6 text-[10px] text-slate-400 font-bold">
                        <span className="flex items-center space-x-1">
                          <Award className="h-3.5 w-3.5 text-yellow-500" />
                          <span className="text-slate-600">{c.reward} {i18n.language === 'th' ? 'เหรียญ' : 'Coins'}</span>
                        </span>
                        
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-slate-600">
                            {c.is_test ? t('arena.unlimitedTime') : `${t('arena.timeRemaining')}: ${formatChallengeTimeLimit(c.time_limit)}`}
                          </span>
                        </span>
                        {c.expires_at && (
                          <span className="flex items-center space-x-1">
                            <CalendarDays className="h-3.5 w-3.5 text-violet-500" />
                            <span className="text-slate-600">
                              {i18n.language === 'th' ? 'ปิดรับ' : 'Closes'} {formatChallengeExpiresAt(c.expires_at, i18n.language)}
                            </span>
                          </span>
                        )}
                        {creatorBonus > 0 && (
                          <span className="flex items-center space-x-1">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-amber-700">
                              {i18n.language === 'th'
                                ? `โบนัสผู้โพสต์ +${creatorBonus} เหรียญ/คนส่ง`
                                : `Poster bonus +${creatorBonus}/submission`}
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {scoringRubric.map((item) => {
                          const Icon = item.icon;
                          return (
                            <div key={item.key} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                              <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                              <span className="text-[10px] font-black uppercase text-slate-500">{item.weight}% {item.label}</span>
                            </div>
                          );
                        })}
                      </div>
                      {testCases.length > 0 && (
                        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
                          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600">
                            <ListChecks className="h-3.5 w-3.5" />
                            {testCases.length} Test Case{testCases.length > 1 ? 's' : ''}
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            {testCases.slice(0, 2).map((testCase, index) => (
                              <div key={index} className="rounded-xl bg-white/80 p-3 text-[11px] font-semibold text-slate-500 ring-1 ring-blue-100">
                                <div className="mb-1 text-slate-400">Case {index + 1}</div>
                                <div className="truncate">Input: {testCase.input || '(empty)'}</div>
                                <div className="truncate">Expected: {testCase.expected || testCase.output || '(empty)'}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Engagement bar (Accept Challenge, active solvers count, no comments) */}
                    <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center flex-wrap gap-4">
                      
                      <div className="flex items-center space-x-3">
                        {/* ACCEPT CHALLENGE / ACCEPTED BUTTON */}
                        {Number(c.is_submitted) === 1 ? (
                          <div className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-black flex items-center space-x-1.5 select-none">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>{t('arena.submitted')}</span>
                          </div>
                        ) : Number(c.is_accepted) === 1 ? (
                          <button 
                            onClick={() => setIsEditorOpen(true)}
                            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-colors"
                          >
                            <Play className="h-3 w-3 fill-blue-600 text-blue-600" />
                            <span>{t('arena.accepted')}</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleAcceptChallenge(c)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all shadow-sm"
                          >
                            <Play className="h-3 w-3 fill-white text-white" />
                            <span>{t('arena.acceptChallenge')}</span>
                          </button>
                        )}

                        {/* INSTANT SUMMARY BUTTON (Only visible on test challenges) */}
                        {Number(c.is_test) === 1 && (
                          <button
                            onClick={() => handleForceSummary(c.challenge_id)}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white rounded-xl text-xs font-black flex items-center space-x-1 transition-all shadow-sm"
                            title={t('arena.forceSummaryWarning')}
                          >
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{t('arena.forceSummary')}</span>
                          </button>
                        )}
                      </div>

                      {/* Solver count */}
                      <div className="flex items-center">
                        <span className="text-[10px] text-slate-400 font-bold">
                          #{c.challenge_id} • รับงานแล้ว {Number(c.active_count || 0)} คน • ส่งสำเร็จ {Number(c.submission_count || 0)} คน
                        </span>
                      </div>

                    </div>

                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: COLLAPSIBLE SPLIT SCREEN MONACO WORKSPACE (50% or 0%) */}
        <AnimatePresence>
          {isEditorOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '50%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden md:flex flex-col bg-white border border-slate-200 rounded-3xl h-[calc(100vh-16rem)] sticky top-28 z-30 overflow-hidden shadow-sm"
            >
              
              {/* Toggle handle button to close drawer */}
              {/* TABS HEADER BAR */}
              <div className="h-12 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-4 overflow-hidden">
                <div className="flex items-center space-x-2 overflow-x-auto pr-2 flex-1 scrollbar-none">
                  {activeTabs.map((tab) => {
                    const isActive = tab.challenge_id === activeTabId;
                    const tabRemaining = getRemainingSeconds(tab, now);
                    const tabExpired = tabRemaining === 0;
                    return (
                      <button
                        key={tab.challenge_id}
                        onClick={() => handleTabChange(tab.challenge_id)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 border whitespace-nowrap ${isActive ? 'bg-white text-blue-600 border-slate-200 shadow-sm' : 'bg-slate-100/60 text-slate-500 border-transparent hover:text-slate-600'}`}
                      >
                        <span className="max-w-[120px] truncate">{getLocalizedTitle(tab)}</span>
                        {Number(tab.is_test) === 1 ? (
                          <span className="text-[9px] text-amber-600 font-bold">(Test)</span>
                        ) : (
                          <span className={`text-[9px] font-black ${tabExpired ? 'text-rose-600' : 'text-blue-600'}`}>
                            {tabExpired ? '(Time up)' : `(${formatRemainingTime(tabRemaining)})`}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {activeTabId && (
                  <div className={`mr-2 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${isActiveExpired ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                    {isActiveExpired ? 'Time up' : `Time ${formatRemainingTime(remainingSeconds)}`}
                  </div>
                )}

                {/* Close Drawer PanelRight Sidebar Toggle button inside editor frame header */}
                <button 
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 border border-transparent text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center ml-2"
                  title={t('arena.closeEditor')}
                >
                  <PanelRight className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* EDITOR WORKSPACE VIEW */}
              {activeTabId ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  
                  {/* Editor view */}
                  <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
                    
                    {/* Draft status */}
                    {saveStatus && (
                      <span className="absolute right-4 top-4 z-40 px-2.5 py-1 rounded bg-slate-50/90 border border-slate-200 text-[9px] font-bold tracking-widest text-slate-400 uppercase select-none shadow-sm">
                        {saveStatus === 'saving' ? t('arena.saving') : t('arena.saved')}
                      </span>
                    )}

                    <Editor
                      height="100%"
                      defaultLanguage="python"
                      theme="vs-light"
                      value={editorCode}
                      onChange={handleCodeChange}
                      options={{
                        minimap: { enabled: false },
                        readOnly: isActiveExpired,
                        domReadOnly: isActiveExpired,
                        fontSize: 13,
                        lineHeight: 20,
                        fontFamily: 'Fira Code, Source Code Pro, monospace',
                        padding: { top: 16 }
                      }}
                    />
                    {isActiveExpired && (
                      <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                        <div className="rounded-2xl border border-rose-100 bg-white px-5 py-4 text-center shadow-lg">
                          <p className="text-sm font-black text-rose-600">Time is up</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">This challenge is lost and receives 0 score.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Test Console Log Output area */}
                  <div className="h-44 bg-slate-50 border-t border-slate-200 flex flex-col">
                    <div className="h-8 border-b border-slate-200 px-4 flex items-center justify-between bg-slate-100/60">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {t('arena.codeOutput')}
                      </span>
                    </div>
                    <textarea
                      readOnly
                      value={consoleOutput || t('arena.codeOutputPlaceholder')}
                      className="flex-1 bg-slate-50 text-slate-600 px-4 py-3 text-xs font-mono resize-none focus:outline-none placeholder-slate-400"
                    />
                  </div>

                  {/* Workspace Actions */}
                  <div className="h-16 bg-slate-50 border-t border-slate-200 px-6 flex justify-between items-center">
                    <button 
                      onClick={handleRunTests}
                      disabled={isRunningTests || isActiveExpired}
                      className="px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-black transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isRunningTests ? 'Running...' : t('arena.runTests')}
                    </button>
                    
                    <button 
                      onClick={handleSubmitCode}
                      disabled={isActiveExpired}
                      className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl text-xs font-black transition-all shadow-md shadow-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                      {t('arena.submitCode')}
                    </button>
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 font-bold text-xs bg-white">
                  {i18n.language === 'th' ? "เลือกโจทย์หรือกดรับโจทย์เพื่อเริ่มเขียนโค้ด" : "Please select a tab or accept a challenge to start coding."}
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Code Editor drawer toggle button when closed (Antigravity layout style) */}
        {!isEditorOpen && activeTabs.length > 0 && (
          <button 
            onClick={() => setIsEditorOpen(true)}
            className="fixed right-6 bottom-8 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-2xl shadow-xl z-40 transition-all hover:scale-105 active:scale-95 flex items-center space-x-2 font-black text-xs uppercase tracking-wider border border-blue-500"
            title={t('arena.openEditor')}
          >
            <PanelRight className="h-4.5 w-4.5" />
            <span>{i18n.language === 'th' ? "เปิดตัวเขียนโค้ด" : "Code Editor"}</span>
          </button>
        )}

      </div>

      {/* 3. MAILBOX MODAL DRAWER OVERLAY */}
      <AnimatePresence>
        {mailboxOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
            
            {/* Click outside to close */}
            <div className="flex-1" onClick={() => setMailboxOpen(false)} />

            {/* Mailbox contents sidebar drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-md bg-white h-full border-l border-slate-200 shadow-2xl flex flex-col z-55"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">{t('arena.mailboxTitle')}</h2>
                </div>
                <button 
                  onClick={() => setMailboxOpen(false)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>

              {/* Message items list */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
                {mailbox.length === 0 ? (
                  <div className="text-center text-slate-400 font-bold text-xs pt-12">
                    {t('arena.mailboxEmpty')}
                  </div>
                ) : (
                  mailbox.map((mail) => {
                    const isClaimed = Number(mail.is_claimed) === 1;
                    const hasAttachment = Number(mail.attachment_coins) > 0;
                    
                    return (
                      <div key={mail.mail_id} className={`p-4 rounded-2xl border transition-all ${isClaimed ? 'bg-white/40 border-slate-100' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs font-black ${isClaimed ? 'text-slate-400' : 'text-slate-700'}`}>
                            {getLocalizedMailTitle(mail)}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold">
                            {new Date(mail.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{getLocalizedMailContent(mail)}</p>
                        
                        {hasAttachment && (
                          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                            <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100">+{mail.attachment_coins} {i18n.language === 'th' ? 'เหรียญ' : 'Coins'}</span>
                            {isClaimed ? (
                              <span className="text-[9px] text-emerald-600 font-black tracking-widest uppercase select-none">{t('arena.claimed')}</span>
                            ) : (
                              <button 
                                onClick={() => handleClaimMailReward(mail)}
                                className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] text-slate-950 font-black rounded-lg text-[10px] tracking-wider uppercase transition-all shadow-md shadow-yellow-500/10"
                              >
                                {t('arena.claimBtn')}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
