import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  BookOpen, Target, FlaskConical
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TheInfiniteGrid } from './components/ui/the-infinite-grid';
import { NavBar } from './components/ui/tubelight-navbar';
import MouseEffectLayer from './components/MouseEffectLayer';
import ModeEntryHeader from './components/ModeEntryHeader';
import useModeTransition from './hooks/useModeTransition';


// --- Friend's Learning Pages ---
import LearningPage from './pages/LearningPage';
import LessonPage from './pages/LessonPage';
import ExercisePage from './pages/ExercisePage';
import MiNi_Game from './pages/MiNi_Game';
import FriendLogin from './pages/FriendLogin';
import ShopPage from './pages/ShopPage';
import Achievements from './pages/Achievements';
import LeaderboardPage from './pages/LeaderboardPage';

// --- Your Original Pages ---
import GameModeLocked from './pages/GameModeLocked';
import { canEnterGameModes } from './utils/gameModeAccess.js';
import CompetitiveArena from './pages/CompetitiveArena';
import ArcadeBattleRoyale from './pages/Arcade/ArcadeBattleRoyale';
import ChallengePage from './pages/ChallengePage';
import AiTaskPage from './components/learning/AiTaskPage';
import PromotionExamPage from './pages/PromotionExamPage';
import ProfilePage from './pages/ProfilePage';
import Dashboard from './admin/pages/Dashboard';
import ManageAccount from './admin/pages/ManageAccount';
import ThemePage from './admin/pages/ThemePage';
import AddLesson from './admin/pages/AddLesson';
import StudentProgressPage from './admin/pages/StudentProgressPage';
import Leaderboard from './admin/pages/Leaderboard';
import CompetitiveChallengePage from './admin/pages/CompetitiveChallengePage';
import { API_BASE } from './config/api.js';

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
  );
}

// ######################################################################
// ### APP CONTENT (Inside Router)
// ######################################################################
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  useModeTransition(location.pathname);

  // === Auth State ===
  // Seeded synchronously from localStorage on the very first render rather
  // than starting at null and waiting for the hydration effect below. Starting
  // at null meant a hard load of any protected deep link rendered its route
  // guard as unauthenticated for one render, redirecting to /login before the
  // effect could restore the saved session — the URL had already changed, so
  // the player ended up on /learn instead of the page they asked for. Reading
  // the same key the effect reads keeps the two in agreement; the effect still
  // runs afterwards to handle an injected user, guest defaults, and profile
  // refresh.
  const [user, setUser] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('user') || 'null');
      if (saved?.user_id && !saved?.isGuest) {
        return { ...saved, isGuest: false, level: Number(saved.level || 1) };
      }
      return saved;
    } catch {
      return null;
    }
  });
  const [authReady, setAuthReady] = useState(false);
  const isAuthenticated = Boolean(user && !user.isGuest);


  const syncUserToState = useCallback((nextUser) => {
    if (!nextUser) return;
    setUser(nextUser);
    localStorage.setItem('user', JSON.stringify(nextUser));
    window.dispatchEvent(new CustomEvent('pysim:user-updated', {
      detail: { user: nextUser },
    }));
  }, []);

  const refreshUserProfile = useCallback(async (injectedUser = null) => {
    const currentUser = injectedUser || JSON.parse(localStorage.getItem('user') || 'null');
    if (!currentUser || currentUser.isGuest) return;
    const uid = currentUser.user_id || currentUser.id;
    if (!uid) return;

    if (injectedUser && typeof injectedUser === 'object' && injectedUser.xp != null) {
      syncUserToState({ ...currentUser, ...injectedUser, isGuest: false });
    }

    try {
      const response = await fetch(`${API_BASE}/api/user/profile/${uid}`);
      if (response.status === 404) {
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/';
        return;
      }
      if (!response.ok) return;
      const profile = await response.json();
      syncUserToState({ ...currentUser, ...profile, isGuest: false });
    } catch {
      // keep existing local profile if refresh fails
    }
  }, [syncUserToState]);

  const getPresenceInfo = useCallback((pathname) => {
    if (pathname.startsWith('/admin')) {
      return { mode: 'admin', activityLabel: 'อยู่ในหน้าแอดมิน' };
    }
    if (pathname.startsWith('/lesson')) {
      return { mode: 'learn', activityLabel: 'กำลังอ่านบทเรียน' };
    }
    if (pathname.startsWith('/exercise') || pathname.startsWith('/debug')) {
      return { mode: 'exercise', activityLabel: 'กำลังทำแบบฝึกหัด' };
    }
    if (pathname.startsWith('/mini-game')) {
      return { mode: 'mini-game', activityLabel: 'กำลังเล่นมินิเกม' };
    }
    if (pathname.startsWith('/challenge')) {
      return { mode: 'challenge', activityLabel: 'กำลังทำความท้าทาย' };
    }
    if (
      pathname.startsWith('/online') ||
      pathname.startsWith('/competitive-arena') ||
      pathname.startsWith('/matchmaking') ||
      pathname.startsWith('/join-room') ||
      pathname.startsWith('/lobby')
    ) {
      return { mode: 'online', activityLabel: 'กำลังเล่นโหมดออนไลน์' };
    }
    if (pathname.startsWith('/shop')) {
      return { mode: 'shop', activityLabel: 'กำลังดูร้านค้า' };
    }
    return { mode: 'learn', activityLabel: 'กำลังดูบทเรียน' };
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userParam = searchParams.get('user');
    const persistAuthenticatedUser = (incomingUser) => {
      const authenticatedUser = {
        ...incomingUser,
        isGuest: false,
        level: Number(incomingUser?.level ?? 1),
      };
      syncUserToState(authenticatedUser);
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
          setAuthReady(true);
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
      syncUserToState({
        ...savedUser,
        isGuest: false,
        level: Number(savedUser.level ?? 1),
      });
      setAuthReady(true);
      return;
    }

    if (!savedUser || (savedUser.isGuest && savedUser.level !== defaultGuest.level)) {
      syncUserToState(defaultGuest);
      setAuthReady(true);
      if (savedUser) window.location.reload();
    } else {
      syncUserToState(savedUser);
      setAuthReady(true);
    }
  }, [location.pathname, location.search, navigate, syncUserToState]);

  useEffect(() => {
    const onUserUpdated = (event) => {
      if (event.detail?.user) {
        setUser(event.detail.user);
        localStorage.setItem('user', JSON.stringify(event.detail.user));
      }
    };
    window.addEventListener('pysim:user-cosmetic-equipped', onUserUpdated);
    window.addEventListener('pysim:user-updated', onUserUpdated);
    return () => {
      window.removeEventListener('pysim:user-cosmetic-equipped', onUserUpdated);
      window.removeEventListener('pysim:user-updated', onUserUpdated);
    };
  }, []);

  useEffect(() => {
    if (!user || user.isGuest) return;

    refreshUserProfile();

    const prewarmTasks = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/learning/ai-task?userId=${user.user_id}&mode=challenge`);
        if (response.ok) {
          const payload = await response.json();
          if (payload?.task) {
            sessionStorage.setItem(`learning-ai-task:${user.user_id}:challenge`, JSON.stringify(payload.task));
          }
        }
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

  useEffect(() => {
    if (!user || user.isGuest || !user.user_id) return;

    const sendPresence = () => {
      const presence = getPresenceInfo(location.pathname);
      fetch(`${API_BASE}/api/presence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.user_id,
          currentPath: location.pathname,
          ...presence,
        }),
      }).catch(() => {
        // Presence is best-effort; the app should keep working if the API is unavailable.
      });
    };

    sendPresence();
    const interval = setInterval(sendPresence, 30000);
    return () => clearInterval(interval);
  }, [getPresenceInfo, location.pathname, user?.isGuest, user?.user_id]);

  // === Login Success ===
  const handleLoginSuccess = (userData) => {
    const authenticatedUser = { ...userData, isGuest: false };
    syncUserToState(authenticatedUser);
    navigate(authenticatedUser.role === 'admin' ? '/admin/dashboard' : '/learn');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login', { replace: true });
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
      'promotion-exam': '/promotion-exam',
      'shop': '/shop',
      'login': '/login',
      'simulation': '/learn', // Legacy entry now lands on learning.
    };
    navigate(routeMap[page] || `/${page}`);
  };

  // Game pages render the shared navbar themselves to supply mode tools and
  // guard navigation while a match is active. Locked routes use the app navbar.
  const isGameRoute = ['/online', '/competitive-arena', '/matchmaking'].includes(location.pathname);
  const isSimulationMode = isGameRoute && canEnterGameModes(user);
  const isAdminRoute = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  const hideNavbar = location.pathname === '/login' || isAdminRoute;
  const isLearningRoute = ['/learn', '/lesson', '/exercise', '/mini-game', '/challenge', '/debug', '/promotion-exam']
    .some(route => location.pathname === route || location.pathname.startsWith(`${route}/`));
  const isCodingWorkspace = ['/exercise', '/mini-game', '/challenge', '/debug', '/promotion-exam']
    .some(route => location.pathname.startsWith(route));
  const isAdminUser = user?.role === 'admin';
  const requireStudent = (element) => {
    if (!authReady) return null;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (isAdminUser) return <Navigate to="/admin/dashboard" replace />;
    return element;
  };
  const requireAdmin = (element) => {
    if (!authReady) return null;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!isAdminUser) return <Navigate to="/learn" replace />;
    return element;
  };
  // Game modes open at the rank defined in utils/gameModeAccess.js. Guarding
  // the routes and not just the buttons, so typing /matchmaking straight into
  // the address bar goes the same way as clicking it.
  const requireGameModeRank = (element) => {
    if (!authReady) return null;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!canEnterGameModes(user)) return <GameModeLocked user={user} />;
    return element;
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-transparent text-slate-800 font-sans transition-colors duration-300 relative">
      <MouseEffectLayer user={user} />
      <TheInfiniteGrid>
        {!hideNavbar && !isSimulationMode && (
          <ModeEntryHeader mode={isLearningRoute ? 'learn' : undefined} user={user} onLogout={handleLogout} />
        )}

        {isLearningRoute && !hideNavbar && !isCodingWorkspace && (
          <div className="mode-entry mode-entry-shortcuts"><BottomNavBarSimple /></div>
        )}

        <div className={isAdminRoute
          ? 'min-h-screen bg-pysim-surface text-pysim-on-surface'
          : isSimulationMode || hideNavbar
          ? 'min-h-screen'
          : isCodingWorkspace
            ? 'app-coding-workspace box-border overflow-hidden p-4'
            : 'app-page-content pb-8'}>
            <Routes location={location}>
              <Route path="/" element={
                authReady
                  ? <Navigate to={isAuthenticated ? (isAdminUser ? "/admin/dashboard" : "/learn") : "/login"} replace />
                  : null
              } />
              <Route
                path="/shop"
                element={requireStudent(<ShopPage />)}
              />
              <Route
                path="/login"
                element={
                  !authReady
                    ? null
                    : isAuthenticated
                    ? <Navigate to={isAdminUser ? "/admin/dashboard" : "/learn"} replace />
                    : <FriendLogin onLoginSuccess={handleLoginSuccess} />
                }
              />

              {/* Friend's Learning Pages */}
              <Route path="/learn" element={
                requireStudent(<div data-mode-transition-content><LearningPage onNavigate={handleNavigate} user={user} /></div>)
              } />
              <Route path="/lesson" element={<Navigate to="/learn" replace />} />
              <Route path="/lesson/:lessonId" element={
                requireStudent(
                  <LessonPage
                    lessonId={currentLessonId}
                    module={currentModule}
                    onNavigate={handleNavigate}
                    user={user}
                  />
                )
              } />
              <Route path="/exercise" element={<Navigate to="/learn" replace />} />
              <Route path="/exercise/:lessonId" element={
                requireStudent(
                  <ExercisePage
                    lessonId={currentLessonId}
                    onNavigate={handleNavigate}
                    user={user}
                    onUserRefresh={refreshUserProfile}
                  />
                )
              } />
              <Route path="/mini-game" element={<Navigate to="/learn" replace />} />
              <Route path="/mini-game/:lessonId" element={
                requireStudent(
                  <MiNi_Game
                    lessonId={currentLessonId}
                    onNavigate={handleNavigate}
                    user={user}
                    onUserRefresh={refreshUserProfile}
                  />
                )
              } />
              <Route path="/debug" element={
                requireStudent(<AiTaskPage mode="exercise" user={user} onUserRefresh={refreshUserProfile} />)
              } />
              <Route path="/challenge" element={
                requireStudent(<ChallengePage onNavigate={handleNavigate} user={user} onUserRefresh={refreshUserProfile} />)
              } />
              <Route path="/promotion-exam" element={
                isAuthenticated
                  ? <PromotionExamPage user={user} onUserRefresh={refreshUserProfile} onNavigate={handleNavigate} />
                  : <Navigate to="/login" replace />
              } />

              {/* Student pages and direct mode routes */}
              <Route path="/profile" element={requireStudent(<ProfilePage key={location.pathname} user={user} onUserRefresh={refreshUserProfile} />)} />
              <Route path="/profile/:userId" element={requireStudent(<ProfilePage key={location.pathname} user={user} onUserRefresh={refreshUserProfile} />)} />
              <Route path="/menu" element={<Navigate to="/learn" replace />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/leaderboard" element={<LeaderboardPage user={user} />} />
              <Route path="/online" element={requireGameModeRank(<CompetitiveArena user={user} onLogout={handleLogout} onUserUpdate={syncUserToState} />)} />
              {/* Person 2 reached the Competitive Arena at /competitive-arena on their
                  branch; kept as a second path so links and bookmarks from there
                  still land, rather than renaming /online out from under ours. */}
              <Route path="/competitive-arena" element={requireGameModeRank(<CompetitiveArena user={user} onLogout={handleLogout} onUserUpdate={syncUserToState} />)} />
              <Route path="/matchmaking" element={requireGameModeRank(<ArcadeBattleRoyale user={user} onLogout={handleLogout} />)} />
              <Route
                path="/admin/dashboard"
                element={requireAdmin(<Dashboard />)}
              />
              <Route
                path="/admin/manage-account"
                element={requireAdmin(<ManageAccount />)}
              />
              <Route
                path="/admin/theme"
                element={requireAdmin(<ThemePage />)}
              />
              <Route
                  path="/admin/student-progress"
                  element={requireAdmin(<StudentProgressPage />)}
                />
                <Route
                  path="/admin/add-lesson/*"
                element={requireAdmin(<AddLesson />)}
              />
              <Route
                path="/admin/leaderboard"
                element={requireAdmin(<Leaderboard />)}
              />
              <Route
                path="/admin/competitive-challenge"
                element={requireAdmin(<CompetitiveChallengePage />)}
              />
            </Routes>
        </div>

      </TheInfiniteGrid>
    </div>
  );
}

// Learning shortcuts stay separate from the account and mode navigation.
const BottomNavBarSimple = () => {
  const { t } = useTranslation();

  const navItems = [
    { name: t('navbar.learn', 'บทเรียน'), icon: BookOpen, url: '/learn' },
    { name: t('navbar.debug', 'แก้ไขโค้ด'), icon: FlaskConical, url: '/debug' },
    { name: t('navbar.challenge', 'ความท้าทาย'), icon: Target, url: '/challenge' },
  ];

  return <NavBar items={navItems} />;
};
