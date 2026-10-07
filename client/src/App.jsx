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
import { currentPlayer, signOut, isRecovery } from './auth/session';
import { getSupabaseClient } from './supabaseClient.js';


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
      audioRef.current.play().catch(() => console.log("รอ User คลิกหน้าเว็บก่อนเล่นเพลง"));
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
function SupabaseConnectionTest() {
  const [result, setResult] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let active = true;
    async function checkConnection() {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('arcade_items')
          .select('item_id,item_code,name_th,name_en,price,icon,type')
          .order('item_id')
          .limit(20)
          .abortSignal(controller.signal);
        if (error) throw new Error('Supabase query failed. Check network access, API key, table grants, and SELECT policies.');
        if (active) setResult({ loading: false, error: '', data });
      } catch (error) {
        if (active) setResult({ loading: false, error: error.message, data: null });
      } finally {
        clearTimeout(timeout);
      }
    }
    checkConnection();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return (
    <section className="mx-auto w-full max-w-3xl p-6 text-white" aria-label="Supabase connection test">
      <h1 className="mb-4 text-2xl font-bold">Supabase connection test</h1>
      <p>Read-only query: arcade_items (up to 20 public shop items).</p>
      {result.loading && <p role="status">Connecting to Supabase…</p>}
      {result.error && <p role="alert" className="mt-4 text-red-300">{result.error}</p>}
      {result.data !== null && (
        <>
          <p role="status" className="mt-4">Connected. Returned {result.data.length} rows.</p>
          {result.data.length === 0 && <p>No visible rows. The table may be empty or row-level security may hide its rows.</p>}
          <pre className="mt-4 max-w-full overflow-auto rounded bg-black/30 p-4">{JSON.stringify(result.data, null, 2)}</pre>
        </>
      )}
    </section>
  );
}


function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  useModeTransition(location.pathname);

  // Cached cosmetics are presentation only; access starts closed until /auth/me verifies it.
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
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
    let cancelled = false;
    let sequence = 0;
    const restore = async () => {
      const request = ++sequence;
      try {
        const player = await currentPlayer();
        if (cancelled || request !== sequence) return;
        setAuthError('');
        if (player) syncUserToState(player);
        else { setUser(null); localStorage.removeItem('user'); }
      } catch (error) {
        if (!cancelled && request === sequence) { setUser(null); setAuthError(error.message); }
      } finally {
        if (!cancelled && request === sequence) setAuthReady(true);
      }
    };
    restore();
    window.addEventListener('pyarena:session-changed', restore);
    return () => { cancelled = true; window.removeEventListener('pyarena:session-changed', restore); };
  }, [syncUserToState]);

  useEffect(() => {
    const onUserUpdated = (event) => {
      if (event.detail?.user) {
        setUser(current => {
          if (!current || Number(event.detail.user.user_id) !== Number(current.user_id)) return current;
          const next = { ...event.detail.user, user_id: current.user_id, role: current.role, username: current.username, isGuest: false };
          localStorage.setItem('user', JSON.stringify(next));
          return next;
        });
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
  const handleLoginSuccess = async () => {
    try {
      const player = await currentPlayer();
      if (!player) throw new Error('กรุณาเข้าสู่ระบบอีกครั้ง');
      syncUserToState(player);
      setAuthError('');
      if (player.level > 0 || player.role === 'admin') navigate(player.role === 'admin' ? '/admin/dashboard' : '/learn');
    } catch (error) { setAuthError(error.message); }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      navigate('/login', { replace: true });
    } catch (error) { setAuthError(error.message); }
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
    if (user.level === 0 && user.role !== 'admin') return <Navigate to="/login" replace />;
    if (isAdminUser) return <Navigate to="/admin/dashboard" replace />;
    return element;
  };
  const requireAdmin = (element) => {
    if (!authReady) return null;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user.level === 0 && user.role !== 'admin') return <Navigate to="/login" replace />;
    if (!isAdminUser) return <Navigate to="/learn" replace />;
    return element;
  };
  // Game modes open at the rank defined in utils/gameModeAccess.js. Guarding
  // the routes and not just the buttons, so typing /matchmaking straight into
  // the address bar goes the same way as clicking it.
  const requireGameModeRank = (element) => {
    if (!authReady) return null;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user.level === 0 && user.role !== 'admin') return <Navigate to="/login" replace />;
    if (!canEnterGameModes(user)) return <GameModeLocked user={user} />;
    return element;
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-transparent text-slate-800 font-sans transition-colors duration-300 relative">
      {authError && <div role="alert" className="relative z-50 bg-rose-50 p-4 text-center text-sm text-rose-700">{authError} <button className="underline" onClick={() => window.location.reload()}>ลองใหม่</button></div>}
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
                    : isAuthenticated && user.level > 0 && !isRecovery()
                    ? <Navigate to={isAdminUser ? "/admin/dashboard" : "/learn"} replace />
                    : <FriendLogin onLoginSuccess={handleLoginSuccess} sessionUser={user} />
                }
              />

              <Route path="/supabase-test" element={<SupabaseConnectionTest />} />
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
