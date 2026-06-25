import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Target, FlaskConical, Globe, LogOut, Monitor, Store
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TheInfiniteGrid } from './components/ui/the-infinite-grid';
import { NavBar } from './components/ui/tubelight-navbar';
import { ThemeProvider } from './contexts/ThemeContext';
import MouseEffectLayer from './components/MouseEffectLayer';

// --- Friend's Learning Pages ---
import LearningPage from './pages/LearningPage';
import LessonPage from './pages/LessonPage';
import ExercisePage from './pages/ExercisePage';
import MiNi_Game from './pages/MiNi_Game';
import FriendLogin from './pages/FriendLogin';
import ShopPage from './pages/ShopPage';

// --- Your Original Pages ---
import MainMenu from './pages/MainMenu';
import OnlineMenu from './pages/OnlineMenu';
import Matchmaking from './pages/Matchmaking';
import Lobby from './pages/Lobby';
import JoinRoom from './pages/JoinRoom';
import Achievements from './pages/Achievements';
import ChallengePage from './pages/ChallengePage';
import DesktopPage from './pages/DesktopPage';
import AiTaskPage from './components/learning/AiTaskPage';
import Dashboard from './admin/pages/Dashboard';
import ManageAccount from './admin/pages/ManageAccount';
import ThemePage from './admin/pages/ThemePage';
import AddLesson from './admin/pages/AddLesson';
import Leaderboard from './admin/pages/Leaderboard';

// ######################################################################
// ### MAIN APP
// ######################################################################
export default function App() {
  const audioRef = useRef(null);

  useEffect(() => {
    const savedVolume = localStorage.getItem('musicVolume') || 50;
    if (audioRef.current) {
      audioRef.current.volume = savedVolume / 100;
      audioRef.current.play().catch(e => console.log("รอ User คลิกหน้าเว็บก่อนเล่นเพลง"));
    }
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <audio
          ref={audioRef}
          id="bg-music"
          src="/assets/music/Monplaisir.mp3"
          loop
          hidden
        />
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

// ######################################################################
// ### APP CONTENT (Inside Router)
// ######################################################################
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // === Auth State ===
  const [user, setUser] = useState(null);
  const isAuthenticated = Boolean(user && !user.isGuest);

  const syncUserToState = useCallback((nextUser) => {
    if (!nextUser) return;
    setUser(nextUser);
    localStorage.setItem('user', JSON.stringify(nextUser));
  }, []);

  const refreshUserProfile = useCallback(async (injectedUser = null) => {
    const currentUser = injectedUser || JSON.parse(localStorage.getItem('user') || 'null');
    if (!currentUser || currentUser.isGuest || !currentUser.user_id) return;

    if (injectedUser && typeof injectedUser === 'object' && injectedUser.xp != null) {
      syncUserToState({ ...currentUser, ...injectedUser, isGuest: false });
    }

    try {
      const response = await fetch(`http://localhost:3001/api/user/profile/${currentUser.user_id}`);
      if (!response.ok) return;
      const profile = await response.json();
      syncUserToState({ ...currentUser, ...profile, isGuest: false });
    } catch {
      // keep existing local profile if refresh fails
    }
  }, [syncUserToState]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userParam = searchParams.get('user');
    const persistAuthenticatedUser = (incomingUser) => {
      const authenticatedUser = {
        ...incomingUser,
        isGuest: false,
        level: Number(incomingUser?.level || 1),
      };
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      return authenticatedUser;
    };

    if (userParam) {
      try {
        let parsedUser = null;

        try {
          parsedUser = JSON.parse(userParam);
        } catch {
          parsedUser = JSON.parse(decodeURIComponent(userParam));
        }

        if (parsedUser?.user_id || parsedUser?.username) {
          persistAuthenticatedUser(parsedUser);
          navigate(location.pathname, { replace: true });
          return;
        }
      } catch {
        // fall through to stored user / guest fallback
      }
    }

    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    const defaultGuest = {
      user_id: `guest_${Math.random().toString(36).substr(2, 9)}`,
      username: 'Guest User',
      role: 'guest',
      level: 1,
      isGuest: true
    };

    if (savedUser?.user_id && !savedUser?.isGuest) {
      setUser({
        ...savedUser,
        isGuest: false,
        level: Number(savedUser.level || 1),
      });
      return;
    }

    if (!savedUser || (savedUser.isGuest && savedUser.level !== defaultGuest.level)) {
      localStorage.setItem('user', JSON.stringify(defaultGuest));
      setUser(defaultGuest);
      if (savedUser) window.location.reload();
    } else {
      setUser(savedUser);
    }
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    const onCosmeticEquipped = (event) => {
      if (event.detail?.user) syncUserToState(event.detail.user);
    };
    window.addEventListener('pysim:user-cosmetic-equipped', onCosmeticEquipped);
    return () => window.removeEventListener('pysim:user-cosmetic-equipped', onCosmeticEquipped);
  }, [syncUserToState]);

  useEffect(() => {
    if (!user || user.isGuest) return;

    refreshUserProfile();

    const prewarmTasks = async () => {
      try {
        await fetch(`http://localhost:3001/api/learning/ai-task?userId=${user.user_id}&mode=challenge`);
      } catch {
        // ignore prewarm errors
      }
    };

    prewarmTasks();

    const interval = setInterval(() => {
      refreshUserProfile();
    }, 15000);

    const onFocus = () => refreshUserProfile();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  // === Login Success ===
  const handleLoginSuccess = (userData) => {
    const authenticatedUser = { ...userData, isGuest: false };
    syncUserToState(authenticatedUser);
    navigate(authenticatedUser.role === 'admin' ? '/admin/dashboard' : '/learn');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  // === Lesson Navigation (Bridge for friend's onNavigate) ===
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);

  const handleNavigate = (page, lessonId = null, module = null) => {
    if (lessonId !== null && lessonId !== undefined) setCurrentLessonId(lessonId);
    if (module) setCurrentModule(module);

    if (page === 'lesson' && lessonId !== null && lessonId !== undefined) {
      navigate(`/lesson/${lessonId}`);
      return;
    }

    if (page === 'exercise' && lessonId !== null && lessonId !== undefined) {
      navigate(`/exercise/${lessonId}`);
      return;
    }

    if (page === 'mini-game' && lessonId !== null && lessonId !== undefined) {
      navigate(`/mini-game/${lessonId}`);
      return;
    }

    const routeMap = {
      'learn': '/learn',
      'lesson': '/lesson',
      'exercise': '/exercise',
      'mini-game': '/mini-game',
      'challenge': '/challenge',
      'shop': '/shop',
      'login': '/login',
      'simulation': '/menu', // Simulation now goes to MainMenu
    };
    navigate(routeMap[page] || `/${page}`);
  };

  // === Which pages show the Navbar ===
  const hideNavbar = location.pathname === '/login';
  const simulationRoutes = ['/simulation', '/menu', '/online', '/matchmaking', '/join-room', '/achievements'];
  const isSimulationMode = simulationRoutes.some(r => location.pathname.startsWith(r)) || location.pathname.startsWith('/lobby');
  const isCodingWorkspace = ['/exercise', '/mini-game', '/challenge', '/debug']
    .some(route => location.pathname.startsWith(route));
  const isAdminUser = user?.role === 'admin';

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-transparent text-slate-800 font-sans transition-colors duration-300 relative">
      <MouseEffectLayer user={user} />
      <TheInfiniteGrid>
        {/* TOP RIGHT FLOATING HEADER — Hide on login AND simulation routes */}
        <AnimatePresence>
          {!hideNavbar && !isSimulationMode && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="pysim-theme-navbar fixed inset-x-0 top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
                <div className="mx-auto flex h-20 max-w-[1700px] items-center gap-4 px-4 sm:px-6">
                  <div className="hidden min-w-[150px] lg:block">
                    <div className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">PYSIM</div>
                    <div className="mt-1 text-sm font-semibold text-slate-500">
                      {isCodingWorkspace ? 'Coding Workspace' : 'Learning Portal'}
                    </div>
                  </div>
                  <div className="flex-1">
                  <BottomNavBarSimple />
                  </div>
                  <TopRightHeader
                    user={user}
                    onLogout={handleLogout}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ROUTES with page transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isSimulationMode ? 'sim' : 'study'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className={
              isSimulationMode
                ? 'min-h-screen'
                : isCodingWorkspace
                  ? 'box-border h-screen overflow-hidden px-4 pb-4 pt-24'
                  : hideNavbar
                    ? 'min-h-screen'
                    : 'min-h-screen px-4 pb-8 pt-24'
            }
          >
            <Routes location={location}>
              <Route path="/" element={<Navigate to={isAuthenticated ? (isAdminUser ? "/admin/dashboard" : "/learn") : "/login"} replace />} />
              <Route
                path="/shop"
                element={
                  isAuthenticated
                    ? <ShopPage />
                    : <Navigate to="/login" replace />
                }
              />
              <Route
                path="/login"
                element={
                  isAuthenticated
                    ? <Navigate to={isAdminUser ? "/admin/dashboard" : "/learn"} replace />
                    : <FriendLogin onLoginSuccess={handleLoginSuccess} />
                }
              />

              {/* Friend's Learning Pages */}
              <Route path="/learn" element={
                isAuthenticated
                  ? <LearningPage onNavigate={handleNavigate} user={user} />
                  : <Navigate to="/login" replace />
              } />
              <Route path="/lesson" element={<Navigate to="/learn" replace />} />
              <Route path="/lesson/:lessonId" element={
                isAuthenticated ? (
                  <LessonPage
                    lessonId={currentLessonId}
                    module={currentModule}
                    onNavigate={handleNavigate}
                    user={user}
                  />
                ) : <Navigate to="/login" replace />
              } />
              <Route path="/exercise" element={<Navigate to="/learn" replace />} />
              <Route path="/exercise/:lessonId" element={
                isAuthenticated ? (
                  <ExercisePage
                    lessonId={currentLessonId}
                    onNavigate={handleNavigate}
                    user={user}
                    onUserRefresh={refreshUserProfile}
                  />
                ) : <Navigate to="/login" replace />
              } />
              <Route path="/mini-game" element={<Navigate to="/learn" replace />} />
              <Route path="/mini-game/:lessonId" element={
                isAuthenticated ? (
                  <MiNi_Game
                    lessonId={currentLessonId}
                    onNavigate={handleNavigate}
                    user={user}
                    onUserRefresh={refreshUserProfile}
                  />
                ) : <Navigate to="/login" replace />
              } />
              <Route path="/debug" element={
                isAuthenticated
                  ? <AiTaskPage mode="exercise" user={user} onUserRefresh={refreshUserProfile} />
                  : <Navigate to="/login" replace />
              } />
              <Route path="/challenge" element={
                isAuthenticated
                  ? <ChallengePage onNavigate={handleNavigate} user={user} onUserRefresh={refreshUserProfile} />
                  : <Navigate to="/login" replace />
              } />

              {/* Simulation Pages */}
              <Route path="/menu" element={<MainMenu user={user} />} />
              <Route path="/online" element={<OnlineMenu />} />
              <Route path="/matchmaking" element={<Matchmaking />} />
              <Route path="/lobby/:roomId" element={<Lobby />} />
              <Route path="/join-room" element={<JoinRoom />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/simulation" element={<DesktopPage />} />
              <Route
                path="/admin/dashboard"
                element={isAdminUser ? <Dashboard /> : <Navigate to="/learn" replace />}
              />
              <Route
                path="/admin/manage-account"
                element={isAdminUser ? <ManageAccount /> : <Navigate to="/learn" replace />}
              />
              <Route
                path="/admin/theme"
                element={isAdminUser ? <ThemePage /> : <Navigate to="/learn" replace />}
              />
              <Route
                path="/admin/add-lesson"
                element={isAdminUser ? <AddLesson /> : <Navigate to="/learn" replace />}
              />
              <Route
                path="/admin/leaderboard"
                element={isAdminUser ? <Leaderboard /> : <Navigate to="/learn" replace />}
              />
            </Routes>
          </motion.div>
        </AnimatePresence>

      </TheInfiniteGrid>
    </div>
  );
}

// ######################################################################
// ### TOP RIGHT HEADER (User Profile & Language)
// ######################################################################
const TopRightHeader = ({ user, onLogout }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const profileImage = user?.profile_asset_url?.startsWith('/uploads')
    ? `http://localhost:3001${user.profile_asset_url}`
    : user?.profile_asset_url;

  return (
    <div className="flex items-center space-x-3 rounded-2xl border border-slate-200/70 bg-white/80 p-2 pr-4 shadow-sm">
      
      {/* Simulation Mode Toggle (Desktop Only) */}
      {!user?.isGuest && (
        <button
          onClick={() => navigate('/menu')}
          className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 hover:shadow-md hover:scale-105"
        >
          <Monitor className="h-3 w-3" />
          <span>Simulation</span>
        </button>
      )}

      {/* Divier */}
      {!user?.isGuest && <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1"></div>}

      {/* Language Switcher */}
      <div className="relative">
        <button
          onClick={() => setLangMenuOpen(!langMenuOpen)}
          className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
        >
          <Globe className="h-4 w-4" />
        </button>

        <AnimatePresence>
          {langMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 p-1"
            >
              <button
                onClick={() => { i18n.changeLanguage('en'); setLangMenuOpen(false); }}
                className="w-full flex items-center px-4 py-2.5 rounded-xl hover:bg-blue-50 text-sm text-slate-700 font-medium transition-colors"
              >
                <span className="mr-2">🇺🇸</span> EN
              </button>
              <button
                onClick={() => { i18n.changeLanguage('th'); setLangMenuOpen(false); }}
                className="w-full flex items-center px-4 py-2.5 rounded-xl hover:bg-blue-50 text-sm text-slate-700 font-medium transition-colors"
              >
                <span className="mr-2">🇹🇭</span> TH
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-6 w-px bg-slate-200 mx-1"></div>

      {/* User Info & Logout */}
      {user?.isGuest ? (
        <div className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
          Guest Mode
        </div>
      ) : (
        <div className="flex items-center space-x-3 pl-1">
          {profileImage && (
            <img
              src={profileImage}
              alt=""
              className="h-9 w-9 rounded-full border-2 border-sky-300 bg-slate-100 object-cover"
            />
          )}
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">LV. {user?.level || 1}</span>
            <span className="text-xs font-semibold text-slate-700">{user?.username}</span>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// ######################################################################
// ### BOTTOM TUBELIGHT NAVBAR
// ######################################################################
const BottomNavBar = () => {
  const { t } = useTranslation();
  
  const navItems = [
    { name: t('navbar.learn', 'บทเรียน'), icon: BookOpen, url: '/learn' },
    { name: t('navbar.exercise', 'แบบฝึกหัด'), icon: FlaskConical, url: '/exercise' },
    { name: t('navbar.challenge', 'ความท้าทาย'), icon: Target, url: '/challenge' },
    { name: t('navbar.shop', 'ร้านค้า'), icon: Store, url: '/shop' },
  ];

  return <NavBar items={navItems} />;
};

const BottomNavBarSimple = () => {
  const { t } = useTranslation();

  const navItems = [
    { name: t('navbar.learn', 'บทเรียน'), icon: BookOpen, url: '/learn' },
    { name: t('navbar.debug', 'แก้ไขโค้ด'), icon: FlaskConical, url: '/debug' },
    { name: t('navbar.challenge', 'ความท้าทาย'), icon: Target, url: '/challenge' },
    { name: t('navbar.shop', 'ร้านค้า'), icon: Store, url: '/shop' },
  ];

  return <NavBar items={navItems} />;
};
