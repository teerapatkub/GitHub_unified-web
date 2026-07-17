import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Trophy, 
  BookOpen, 
  User, 
  ArrowLeft,
  Mail,
  Play,
  Send,
  PlusCircle,
  Clock,
  Award,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  PanelRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';

export default function CompetitiveArena() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // States for Challenges Feed
  const [challenges, setChallenges] = useState([]);

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
  const getLocalizedTitle = (c) => {
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
    if (Number(c.is_test) === 1) {
      if (c.title.includes("Hello World")) {
        return i18n.language === 'th' 
          ? "เขียนโปรแกรม Python แสดงผลคำว่า 'Hello World' ออกทางหน้าจอ แม้ส่งไฟล์เปล่าไร้โค้ดก็สามารถผ่านการทดสอบและได้รับรางวัลเพื่อจุดประสงค์การทดสอบ"
          : "Write a Python script that prints 'Hello World'. Even an empty file submission will pass and earn rewards for testing purposes.";
      } else if (c.title.includes("Number Adder")) {
        return i18n.language === 'th'
          ? "เขียนโปรแกรม Python รับค่าอินพุตเป็นตัวเลข 2 บรรทัดและพิมพ์ผลบวกออกทางหน้าจอ แม้ส่งไฟล์เปล่าไร้โค้ดก็สามารถผ่านการทดสอบและได้รับรางวัลเพื่อจุดประสงค์การทดสอบ"
          : "Write a Python script that takes two inputs and prints their sum. Even an empty file submission will pass and earn rewards for testing purposes.";
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
      const response = await fetch(`http://localhost:3001/api/mailbox/${userId}`);
      const data = await response.json();
      setMailbox(data);
      setUnreadCount(data.filter(m => Number(m.is_read) === 0).length);
    } catch (e) {
      console.error("Error fetching mailbox:", e);
    }
  };

  // Fetch challenges feed
  const fetchChallenges = async () => {
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:3001/api/competitive/challenges?userId=${user.user_id}`);
      const data = await response.json();
      setChallenges(data);
      
      // Update active tabs if they were modified on the backend
      const acceptedChallenges = data.filter(c => Number(c.is_accepted) === 1);
      if (acceptedChallenges.length > 0) {
        setActiveTabs(acceptedChallenges);
        if (!activeTabId) {
          setActiveTabId(acceptedChallenges[0].challenge_id);
          setEditorCode(acceptedChallenges[0].code_state || "");
        }
      }
    } catch (e) {
      console.error("Error fetching challenges:", e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user]);

  // Handle Tab Switch
  const handleTabChange = (challengeId) => {
    if (activeTabId && editorCode) {
      saveDraftCode(activeTabId, editorCode);
    }
    setActiveTabId(challengeId);
    const target = activeTabs.find(t => t.challenge_id === challengeId);
    if (target) {
      setEditorCode(target.code_state || "");
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
      await fetch(`http://localhost:3001/api/competitive/challenges/${challengeId}/save-draft`, {
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
      await fetch(`http://localhost:3001/api/competitive/challenges/${challenge.challenge_id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id })
      });
      
      await fetchChallenges();
      
      setIsEditorOpen(true);
      setActiveTabId(challenge.challenge_id);
      setEditorCode(challenge.code_state || "");
    } catch (e) {
      console.error("Error accepting challenge:", e);
    }
  };

  // Submit Challenge Solution
  const handleSubmitCode = async () => {
    if (!user || !activeTabId) return;
    setConsoleOutput("Submitting solution...\nRunning test cases...");
    try {
      const response = await fetch(`http://localhost:3001/api/competitive/challenges/${activeTabId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, code: editorCode })
      });
      const res = await response.json();
      if (res.success) {
        setConsoleOutput(`Success: ${res.passed}/${res.total} test cases passed.\nScore: ${res.score}/100\nSubmitted successfully!`);
        fetchChallenges();
      } else {
        setConsoleOutput(`Error: ${res.error}`);
      }
    } catch (e) {
      setConsoleOutput(`Error: Connection failed.`);
    }
  };

  // Run mock tests locally
  const handleRunTests = () => {
    setConsoleOutput("Compiling code...\nExecuting test cases...\n\nMock Run Status: Success (100% Passed)\nOutput: Output matches expected results.");
  };

  // Claim Mail Attachment Reward
  const handleClaimMailReward = async (mail) => {
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:3001/api/mailbox/${mail.mail_id}/claim`, {
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
      const response = await fetch(`http://localhost:3001/api/competitive/challenges/${challengeId}/force-summary`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        alert(i18n.language === 'th' ? "สรุปผลการประลองและแจกรางวัลเข้ากล่องจดหมายผู้เล่นเรียบร้อย!" : "Instant summary completed! Mailbox rewards generated.");
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
    
    try {
      const response = await fetch('http://localhost:3001/api/competitive/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle,
          description: postDesc,
          difficulty: 'Easy',
          reward: postReward,
          time_limit: postTimeLimit,
          created_by: user.user_id,
          test_cases: [{ input: "", output: "" }]
        })
      });
      
      if (response.status === 201) {
        setPostTitle("");
        setPostDesc("");
        setShowPostForm(false);
        fetchChallenges();
      }
    } catch(e) {
      console.error("Error creating post:", e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans antialiased overflow-x-hidden relative">
      
      {/* 1. CUSTOM TOP NAVBAR (Adapting previous dark navbar to light site theme) */}
      <nav className="h-16 sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex justify-between items-center shadow-sm w-full mb-8">
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
            <span className="text-yellow-500 font-bold text-sm">🪙</span>
            <span className="text-xs font-black text-slate-700">
              {user ? user.virtual_currency || 0 : 0} {i18n.language === 'th' ? "เหรียญ" : "Coins"}
            </span>
          </div>

          {/* SYSTEM MAILBOX TOGGLE */}
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

      {/* 2. BODY CONTENT (SPLIT-SCREEN DRAWER LAYOUT) */}
      <div className="max-w-6xl mx-auto w-full flex-1 flex relative">
        
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
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">{t('arena.postTitle')}</label>
                      <input 
                        type="text" 
                        required 
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="e.g. Find Max Number"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">{t('arena.postDesc')}</label>
                      <textarea 
                        required
                        value={postDesc}
                        onChange={(e) => setPostDesc(e.target.value)}
                        placeholder="Explain the inputs, outputs, and requirements..."
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

            {/* FEED ACTIVE POSTS LIST */}
            {challenges.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs font-bold">
                {t('arena.noActiveChallenges')}
              </div>
            ) : (
              challenges.map((c) => {
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
                            {c.is_test ? "SYSTEM TEST CHALLENGE" : "USER CONTRIBUTOR"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Challenge contents */}
                    <div className="p-5 space-y-4">
                      <h3 className="text-sm font-black text-slate-800">{getLocalizedTitle(c)}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium whitespace-pre-wrap">{getLocalizedDesc(c)}</p>
                      
                      <div className="flex items-center space-x-6 text-[10px] text-slate-400 font-bold">
                        <span className="flex items-center space-x-1">
                          <Award className="h-3.5 w-3.5 text-yellow-500" />
                          <span className="text-slate-600">🪙 {c.reward} {i18n.language === 'th' ? "เหรียญ" : "Coins"}</span>
                        </span>
                        
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-slate-600">
                            {c.is_test ? t('arena.unlimitedTime') : `${t('arena.timeRemaining')}: ${c.time_limit}s`}
                          </span>
                        </span>
                      </div>
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
                          👥 {c.active_count} {t('arena.activeSolversSuffix')}
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
                          <span className="text-[9px] text-blue-600 font-bold">(⏱️ {tab.time_limit}s)</span>
                        )}
                      </button>
                    );
                  })}
                </div>

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
                        fontSize: 13,
                        lineHeight: 20,
                        fontFamily: 'Fira Code, Source Code Pro, monospace',
                        padding: { top: 16 }
                      }}
                    />
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
                      className="px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-black transition-colors shadow-sm"
                    >
                      {t('arena.runTests')}
                    </button>
                    
                    <button 
                      onClick={handleSubmitCode}
                      className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl text-xs font-black transition-all shadow-md shadow-blue-500/10"
                    >
                      {t('arena.submitCode')}
                    </button>
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 font-bold text-xs bg-white">
                  {i18n.language === 'th' ? "กรุณาเลือกแท็บโจทย์หรือกดรับโจทย์ในระบบเพื่อเริ่มเขียนโค้ด" : "Please select a tab or accept a challenge to start coding."}
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
            <span>{i18n.language === 'th' ? "กระดานเขียนโค้ด" : "Code Editor"}</span>
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
                            <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100">🪙 +{mail.attachment_coins} Coins</span>
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
