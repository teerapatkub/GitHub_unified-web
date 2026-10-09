import useRoundDraft from './hooks/useRoundDraft.js';
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
  ArrowLeft,
  VolumeX,
  Sparkles,
  ShoppingBag,
  Coins
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import useRoomLifecycle from './hooks/useRoomLifecycle.js';
import useRoundJudging from './hooks/useRoundJudging.js';
import useShopEconomy from './hooks/useShopEconomy.js';
import useCombat from './hooks/useCombat.js';
import useProgression from './hooks/useProgression.js';
import useChat from './hooks/useChat.js';
import CreateRoomModal from './widgets/CreateRoomModal.jsx';
import RoomSettingsModal from './widgets/RoomSettingsModal.jsx';
import PasswordPromptModal from './widgets/PasswordPromptModal.jsx';
import GlossaryModal from './widgets/GlossaryModal.jsx';
import NotificationStack from './widgets/NotificationStack.jsx';
import PublicRoomBrowser from './widgets/PublicRoomBrowser.jsx';
import ModeEntryHeader from '../../components/ModeEntryHeader';
import RoomLobbyView from './widgets/RoomLobbyView.jsx';
import ShopPhaseView from './widgets/ShopPhaseView.jsx';
import BattleRoyaleGameplayView from './widgets/BattleRoyaleGameplayView.jsx';
import ExitConfirmModal from './widgets/ExitConfirmModal.jsx';
import RoundSummaryView from './widgets/RoundSummaryView.jsx';
import RoundHistoryPanel from './widgets/RoundHistoryPanel.jsx';
import PlayerStatsCard from './widgets/PlayerStatsCard.jsx';
import PastMatchesPanel from './widgets/PastMatchesPanel.jsx';
import ChatPanel from './widgets/ChatPanel.jsx';
import { TRANSLATIONS } from './translations.js';
import { parseUtcTimestamp, PHASES, TASKS, TASK_TEST_CASES, SHOP_ITEMS, BOT_NAMES, AUTO_SUBMIT_LEAD_SECONDS,
         AUTO_SUBMIT_WARN_SECONDS, ROUND_TIMES, phaseDurationsFor } from './constants.js';

export default function ArcadeBattleRoyale({ user: propUser, onLogout }) {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'th' ? 'th' : 'en';
  // Memoized on `lang` so its identity is stable across renders. As a plain
  // inline arrow this was a brand-new function on every render, and since `t`
  // is in the dependency array of both polling effects (the room-state poll
  // below and useCombat's incoming-effects poll), every render tore those
  // effects down and re-ran them — meaning each render fired another fetch
  // instead of one every 2s.
  const t = useCallback(
    (key) => TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key] || key,
    [lang]
  );

  const navigate = useNavigate();
  const [phase, setPhase] = useState(PHASES.LOBBY);
  const [timeLeft, setTimeLeft] = useState(0);

  // States
  const [playerState, setPlayerState] = useState({
    name: propUser?.username || "You (Player_1)",
    cash: 0,
    score: 0,
    inventory: [],
    activeEffects: [],
    eliminated: false,
    hasSubmittedThisRound: false,
    code: "",
    hint: ""
  });

  const [opponents, setOpponents] = useState(
    BOT_NAMES.map(name => ({ name, cash: 0, score: 0, eliminated: false, progress: 0 }))
  );

  const [notifications, setNotifications] = useState([]);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const pendingNavigationRef = useRef(null);
  // Snapshot of the round that just finished — {roundNum, entries: [{name,
  // isPlayer, rank, cashGain, eliminated}]} — built server-side by
  // finalizeArcadePhase() (server/server.js), polled down via
  // data.room.last_round_summary, and shown by RoundSummaryView between the
  // coding round and the shop.
  const [roundSummary, setRoundSummary] = useState(null);

  // Phase 8.1 — connection continuity. `connectionLost` drives the reconnect
  // banner; the ref counts consecutive failed room-state polls so a single
  // blip doesn't flash a scary banner at the player mid-round.
  const [connectionLost, setConnectionLost] = useState(false);
  const failedPollsRef = useRef(0);

  // Spectating. Once this player has sent their answer they can no longer
  // change it, so the rest of the round is theirs to watch: `watchedPlayer` is
  // whose editor they are looking at (null = their own, frozen), and
  // `watchedCode` is what the server last handed back for that player. The
  // server decides whether they are allowed to look at all - see
  // GET /rooms/:id/code/:user_name - so a refusal is shown here rather than
  // guessed at.
  // One piece of state, not two: choosing someone to watch and forgetting the
  // last person's code are the same event, and splitting them meant clearing
  // the code from inside an effect - a render cascade React rightly complains
  // about, and a frame in which the previous player's code is shown under the
  // new player's name.
  const [watched, setWatched] = useState({ player: null, data: null });
  const watchPlayer = useCallback((name) => {
    setWatched((prev) => ({ player: prev.player === name ? null : name, data: null }));
  }, []);

  const timerRef = useRef(null);
  // Absolute wall-clock deadline (ms since epoch) for when the current phase
  // should end — set from the server's own `phase_deadline` every time the
  // room-state poll below sees a new one, never computed locally. The
  // countdown effect recomputes timeLeft from this deadline on every tick
  // instead of blindly subtracting 1, so a throttled/delayed background tab
  // (browser tabs get their setTimeout intervals slowed down when hidden)
  // self-corrects to the true remaining time next time it fires, rather than
  // the displayed timer appearing to freeze.
  const phaseDeadlineRef = useRef(0);
  // Which server-reported phase this client has already run the "onEnter"
  // side effect for (reset code, roll shop, show round summary, ...) — a
  // ref rather than comparing against `phase` state directly so the
  // room-state poller (below) doesn't need `phase` in its own dependency
  // array at all. The match's phase itself is now decided entirely by the
  // server (see server/server.js's tickArcadeMatches); this client only
  // ever mirrors it.
  const appliedPhaseRef = useRef(PHASES.LOBBY);
  // Which SHOP_* phase this client has already rolled a personal shop
  // offering for — shop contents are per-player and never synced, so this
  // just stops re-rolling every 2s poll while still inside the same shop.
  const editorRef = useRef(null);

  // Monotonic counter instead of Date.now() — several notifications can
  // legitimately fire within the same millisecond (e.g. a burst of bot
  // attacks), and colliding ids would make the dismiss-by-id filter below
  // remove the wrong entries.
  const notificationIdRef = useRef(0);
  const MAX_VISIBLE_NOTIFICATIONS = 5;
  // Polls run every 2s, so this is roughly 6 seconds of silence before the
  // player is told anything is wrong.
  const CONNECTION_LOST_AFTER_FAILED_POLLS = 3;

  const notify = useCallback((msg, type = 'info') => {
    const id = ++notificationIdRef.current;
    setNotifications(prev => [...prev, { id, msg, type }].slice(-MAX_VISIBLE_NOTIFICATIONS));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  // Relative — goes through client/vite.config.js's `/api` -> :3001 dev proxy
  // instead of hardcoding the backend host, so this keeps working behind
  // whatever origin the app is actually served from (dev server or a reverse
  // proxy in front of a real deployment).
  const API_BASE = '';

  // Room/participants state is lifted here (rather than owned inside
  // useRoomLifecycle) because useCombat/useRoundJudging/useShopEconomy all
  // need `currentRoom` too, and useRoomLifecycle itself needs
  // `getRound4Task` back from useRoundJudging — owning it in one of those
  // hooks would create a circular hook-to-hook dependency.
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomParticipants, setRoomParticipants] = useState([]);
  // The polling effects below key off this primitive rather than the
  // `currentRoom` object itself. Each poll calls setCurrentRoom(data.room)
  // with a freshly-parsed object, so depending on the object meant the poll's
  // own result invalidated its effect and re-triggered an immediate refetch —
  // an unthrottled request loop rather than one poll every 2s. The room id is
  // what actually decides which room to poll, and it only changes when the
  // player really does move rooms.
  const roomId = currentRoom?.room_id ?? null;

  // Shop state restores inventory and self effects before combat renders them.
  // Round judging supplies the task resolvers used by room lifecycle.
  const {
    shopState, rollShop, canBuyItem, buyItem, sellItem, consumeItem, retryShopCommand, shopRetryNeeded, retryShopSync, shopSyncError
  } = useShopEconomy({ playerState, setPlayerState, setOpponents, currentRoom, notify, t, API_BASE });


  const {
    targetingItem, setTargetingItem, checkEffectActive,
    initiateItemUse, handleTargetClick, handleEditorKeyDown, handleCodeChange
  } = useCombat({ playerState, setPlayerState, opponents, setOpponents, currentRoom,
    phase, notify, t, API_BASE, consumeItem });

  const {
    getRound4Task, getPoolTask, submitMyRound, runCodeTests, handleManualSubmit,
    isGrading, consoleOutput, tasksReady
  } = useRoundJudging({ playerState, setPlayerState, currentRoom, notify, t, lang, API_BASE });


  const draftRound = Number(currentRoom?.phase?.split('_')[1]);
  const draftStarter = draftRound === 4 ? getRound4Task()?.initialCode
    : (getPoolTask(draftRound) || TASKS[currentRoom?.phase])?.initialCode;
  const { draftReady, draftStatus, retryDraft } = useRoundDraft({
    playerState, setPlayerState, currentRoom, starterCode: draftStarter ?? '', tasksReady, API_BASE
  });

  // Phase 8.3 — read-only progression views (RESULT-screen code review + lobby
  // career card). Takes primitives rather than the currentRoom object so its
  // effects don't re-subscribe on every room-state poll.
  const { roundHistory, playerStats, pastMatches } = useProgression({
    playerName: playerState.name, roomId, matchId: currentRoom?.current_match_id, phase, API_BASE
  });

  // Phase 8.2 — chat/reactions. Same primitive-only inputs as useProgression
  // so its poll doesn't re-subscribe on every room-state tick.
  const {
    messages: chatMessages, emojiSet, chatOpen, sending: chatSending,
    sendMessage: sendChatMessage, sendEmoji: sendChatEmoji
  } = useChat({ playerName: playerState.name, roomId, phase, notify, t, API_BASE });

  const {
    rooms, fetchRooms,
    showCreateModal, setShowCreateModal, createForm, setCreateForm,
    searchCode, setSearchCode, joinPasswordPrompt, setJoinPasswordPrompt,
    inputPassword, setInputPassword, showSettingsModal, setShowSettingsModal,
    settingsForm, setSettingsForm,
    handleCreateRoom, handleJoinRoom, handleSearchJoin, handleHostStartMatch,
    handleUpdateSettings, handleTransferHost, handleKickPlayer, handleAddBot,
    handleLeaveRoom, handleFinishChoice, handleConfirmForfeitExit
  } = useRoomLifecycle({
    playerState, setPlayerState, notify, t, navigate, API_BASE,
    phase, setPhase, appliedPhaseRef, phaseDeadlineRef,
    setTimeLeft, setRoundSummary, getRound4Task, getPoolTask, tasksReady, setShowExitConfirm,
    currentRoom, setCurrentRoom, roomParticipants, setRoomParticipants
  });

  const requestHeaderAction = async (action) => {
    const isActiveMatch = phase !== PHASES.LOBBY && phase !== PHASES.RESULT;
    if (isActiveMatch) {
      pendingNavigationRef.current = action;
      setShowExitConfirm(true);
      return;
    }
    if (currentRoom) await handleLeaveRoom();
    action();
  };

  const confirmHeaderExit = async () => {
    const action = pendingNavigationRef.current || (() => navigate('/learn'));
    pendingNavigationRef.current = null;
    await handleConfirmForfeitExit(action);
  };

  // Phase 8.1 — the room this client is sitting in no longer exists server
  // side. Drop every trace of it and put the player back in the room browser
  // with an explanation, rather than leaving them staring at a match that
  // can never progress. Clearing currentRoom also clears the saved
  // active-room entry in localStorage (see useRoomLifecycle's sync effect),
  // so the next mount won't try to restore a room that's gone.
  const handleRoomVanished = useCallback(() => {
    appliedPhaseRef.current = PHASES.LOBBY;
    phaseDeadlineRef.current = 0;
    failedPollsRef.current = 0;
    setConnectionLost(false);
    setCurrentRoom(null);
    setRoomParticipants([]);
    setRoundSummary(null);
    setTimeLeft(0);
    setPhase(PHASES.LOBBY);
    // Per-match player state has to be cleared too, not just the room. Without
    // this the spectator badge ("🛡️ โหมดผู้สังเกตการณ์") stayed lit in the
    // lobby after recovering from a vanished room, because `eliminated` was
    // still true from the match that no longer exists — observed on screen
    // 2026-08-19. Score and cash are per-match as well and are re-seeded from
    // the server on the next join.
    setPlayerState(prev => ({
      ...prev,
      eliminated: false,
      hasSubmittedThisRound: false,
      score: 0,
      cash: 0,
      inventory: [],
      activeEffects: [],
      hint: ""
    }));
    notify(t('roomClosedByServer'), "error");
  }, [notify, t, setPhase]);

  // Fetch specific room status if joined. This is now the ONLY place that
  // ever moves `phase` forward — the server (tickArcadeMatches) is the sole
  // authority on what phase a room is in, so every client (host included)
  // just mirrors it here. Comparing against `appliedPhaseRef` (not `phase`
  // state) keeps this effect's own deps free of `phase`, so it can't re-run
  // into the same stale-closure re-entrancy class of bug the old
  // client-driven handlePhaseTransition() had.
  useEffect(() => {
    if (!roomId) return;
    let stopped = false;
    let polling = false;
    const fetchRoomState = async () => {
      if (polling || stopped) return;
      polling = true;
      const startedAt = performance.now();
      try {
        const res = await fetch(`${API_BASE}/api/arcade/rooms/${roomId}?user_name=${encodeURIComponent(playerState.name)}`, { signal: AbortSignal.timeout(8000) });
        if (stopped) return;

        // The room can legitimately disappear underneath a connected client:
        // the host leaves and empties it, or the server's stale-connection
        // sweep removes it. Without this the client sat forever on a lobby or
        // match screen for a room that no longer existed, with no way back
        // except a manual page reload.
        if (res.status === 404) {
          handleRoomVanished();
          return;
        }

        const data = await res.json();
        if (stopped) return;
        if (!res.ok || !data.success) throw new Error('Room state unavailable');

        // A poll that got through means the connection is healthy again.
        failedPollsRef.current = 0;
        setConnectionLost(false);

        setCurrentRoom(data.room);
        setRoomParticipants(data.participants || []);

        // Scores, money and bot progress are shared server state.
        const others = (data.participants || []).filter(p => p.user_name !== playerState.name);
        setOpponents(prevOpponents => others.map(p => {
          const prev = prevOpponents.find(o => o.name === p.user_name);
          return {
            name: p.user_name,
            score: p.score || 0,
            cash: p.cash || 0,
            eliminated: p.is_eliminated === 1,
            hasSubmitted: p.has_submitted === 1,
            isBot: p.participant_kind === 'bot',
            progress: p.bot_progress || 0,
            serverDebuffed: prev?.serverDebuffed || false,
            serverEffects: prev?.serverEffects || [],
            isDebuffed: prev?.isDebuffed || false
          };
        }));

        // Mirror my own authoritative score/cash/eliminated too — those are
        // only ever written by the server's round-finalize step now, not by
        // anything client-local.
        const myRow = (data.participants || []).find(p => p.user_name === playerState.name);
        if (myRow) {
          setPlayerState(prev => ({
            ...prev,
            score: myRow.score || 0,
            cash: myRow.cash || 0,
            eliminated: myRow.is_eliminated === 1,
            hasSubmittedThisRound: myRow.has_submitted === 1
              || (prev.codeScope === `${data.room.room_id}:${data.room.current_match_id}:${data.room.phase}:${prev.name}` && prev.hasSubmittedThisRound)
          }));
        }

        // Refreshed on EVERY poll, deliberately before the phase-unchanged
        // early return below. The deadline used to be read only when the phase
        // itself changed, so any adjustment the server made to phase_deadline
        // within a phase was invisible to this client until the next phase —
        // it kept counting down against a deadline it captured once.
        if (data.room.phase_deadline) {
          phaseDeadlineRef.current = Date.now() + Math.max(0, parseUtcTimestamp(data.room.phase_deadline) - data.serverNow - (performance.now() - startedAt));
        }

        const serverPhase = data.room.phase || PHASES.LOBBY;
        if (serverPhase === appliedPhaseRef.current) return;
        appliedPhaseRef.current = serverPhase;
        setPhase(serverPhase);
        // A new round means a new problem for whoever was being watched, and
        // this player's own editor comes back.
        setWatched({ player: null, data: null });
        setTimeLeft(Math.max(0, Math.ceil((phaseDeadlineRef.current - Date.now()) / 1000)));

        if (serverPhase === PHASES.ROUND_1) {

          setOpponents(prev => prev.map(o => ({ ...o, progress: 0 })));
          notify("🎮 เริ่มการแข่งขัน!", "success");
        } else if (serverPhase === PHASES.ROUND_2) {

          setOpponents(prev => prev.map(o => ({ ...o, progress: 0 })));
          notify(t('round2Start'), "warning");
        } else if (serverPhase === PHASES.ROUND_3) {

          setOpponents(prev => prev.map(o => ({ ...o, progress: 0 })));
          notify(t('round3Start'), "warning");
        } else if (serverPhase === PHASES.ROUND_4) {

          setOpponents(prev => prev.map(o => ({ ...o, progress: 0 })));
          notify(t('finalRound'), "warning");
        } else if (serverPhase === PHASES.SUMMARY_1 || serverPhase === PHASES.SUMMARY_2 || serverPhase === PHASES.SUMMARY_3) {
          // The server has no notion of "which client is viewing this" —
          // its {roundNum, entries:[{name,rank,cashGain,eliminated}]}
          // payload is the same for everyone, so `isPlayer` (used by
          // RoundSummaryView to highlight/badge "(You)") is stamped on here.
          const summary = data.room.last_round_summary;
          setRoundSummary(summary ? { ...summary, entries: summary.entries.map(e => ({ ...e, isPlayer: e.name === playerState.name })) } : null);
        } else if (serverPhase === PHASES.RESULT) {
          notify(t('matchFinished'), "info");
        }
      } catch (err) {
        // One dropped poll is normal (a hiccup, a backgrounded tab); several
        // in a row means the player is genuinely disconnected and their match
        // is still running without them, which is worth telling them about.
        // The banner is purely informational — polling keeps retrying, and a
        // single successful poll clears it again.
        if (stopped) return;
        failedPollsRef.current += 1;
        if (failedPollsRef.current >= CONNECTION_LOST_AFTER_FAILED_POLLS) {
          setConnectionLost(true);
        }
        console.error("Error updating room state:", err);
      } finally { polling = false; }
    };

    fetchRoomState();
    const roomInterval = setInterval(fetchRoomState, 2000);

    // Phase 8.1 — a backgrounded tab has its interval throttled to roughly
    // one wake per minute, so on the way back the player would otherwise
    // stare at a minute-old board (and their heartbeat would have been
    // silent that whole time). Poll once immediately on becoming visible so
    // the match state and the presence heartbeat both catch up at once.
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchRoomState();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stopped = true;
      clearInterval(roomInterval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [roomId, playerState.name, notify, t, API_BASE, handleRoomVanished]);

  // Read current state without restarting the once-a-second countdown.
  const tickRef = useRef({});
  useEffect(() => {
    tickRef.current = {
      playerState, submitMyRound, draftReady
    };
  });

  // Sync the countdown and automatic submission. The server (tickArcadeMatches)
  // is what actually advances the match once time runs out — this effect no
  // longer transitions phase itself. Once timeLeft hits 0, all it does is
  // make sure THIS player's own round result has been submitted (in case
  // they never clicked the submit button); the room-state poller above is
  // what will notice the server has moved everyone into the next phase.
  useEffect(() => {
    if (phase === PHASES.LOBBY || phase === PHASES.RESULT) return;

    const tick = () => {
      const { playerState: ps, submitMyRound: submitNow, draftReady: ready } = tickRef.current;

      // Recomputed from the absolute deadline every tick rather than
      // decrementing, so a throttled background tab self-corrects to the true
      // remaining time instead of drifting.
      const remaining = Math.max(0, Math.ceil((phaseDeadlineRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);

      // Safety net for a player who never pressed submit. Fires with
      // AUTO_SUBMIT_LEAD_SECONDS to spare rather than at 0 because
      // POST /submit-round refuses anything arriving after the server has
      // already finalized the round, and the request still has a network trip
      // to make. Firing at exactly 0 meant it was always too late and the round
      // silently scored 0 (confirmed live). The lead used to also cover several
      // seconds of Pyodide and AI work in the browser; that is the server's job
      // now, so the margin is only for the network.
      // Re-entry once a second across the lead window is harmless:
      // submitMyRound() guards in-flight requests and retries the same answer
      // until the server confirms it. Stop retrying once the deadline expires.
      if (
        String(phase).startsWith('ROUND_') &&
        ready && remaining > 0 && remaining <= AUTO_SUBMIT_LEAD_SECONDS &&
        !ps.hasSubmittedThisRound &&
        !ps.eliminated
      ) {
        submitNow();
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, setPlayerState, setOpponents]);

  // Whoever the player is watching, refreshed on the same 2s beat as the rest
  // of the room so a watched editor keeps up with the person typing in it.
  const watchedPlayer = watched.player;
  useEffect(() => {
    if (!roomId || !watchedPlayer) return;
    let cancelled = false;

    const load = async () => {
      let next;
      try {
        const res = await fetch(
          `${API_BASE}/api/arcade/rooms/${roomId}/code/${encodeURIComponent(watchedPlayer)}`
          + `?viewer=${encodeURIComponent(playerState.name)}`
        );
        const data = await res.json();
        next = res.ok ? data : { error: data?.error || t('watchUnavailable') };
      } catch {
        next = { error: t('watchUnavailable') };
      }
      if (cancelled) return;
      // Guarded on the player still being the one asked for, so a slow reply
      // for the previous player cannot land under the current one's name.
      setWatched((prev) => (prev.player === watchedPlayer ? { ...prev, data: next } : prev));
    };

    load();
    const interval = setInterval(load, 2000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [roomId, watchedPlayer, playerState.name, API_BASE, t]);

  // Phase 8.4 — the warning threshold has to scale with the room's round
  // length. A flat 16s warning is fine on a 60s round but would cover more
  // than half of a 30s Quick Mode round, turning a heads-up into a permanent
  // fixture. Clamped to 40% of the round, which still leaves a clear gap
  // before the auto-submit fires at AUTO_SUBMIT_LEAD_SECONDS.
  const roundDurationSeconds = phaseDurationsFor(currentRoom)[phase] || ROUND_TIMES.ROUND_1;
  const autoSubmitWarnSeconds = Math.max(
    AUTO_SUBMIT_LEAD_SECONDS + 1,
    Math.min(AUTO_SUBMIT_WARN_SECONDS, Math.ceil(roundDurationSeconds * 0.4))
  );

  // Phase 8.4 — what the player is actually looking at this round. Rounds 1-3
  // use the fixed built-in tasks unless the room picked a difficulty, in which
  // case they come from the DB pool (getPoolTask); Round 4 always comes from
  // the pool. Resolved in one place so the title, the description and the
  // starting code can't disagree about which task this round is.
  const activeRoundTask = (() => {
    if (phase === PHASES.ROUND_4) return getRound4Task();
    const roundNum = String(phase).startsWith('ROUND_') ? parseInt(String(phase).split('_')[1], 10) : 0;
    if (!roundNum) return { title: '', desc: '' };
    const pooled = getPoolTask(roundNum);
    if (pooled) return pooled;
    // Built-in-task fallback. It carries its test cases too, so the worked
    // examples under the description are present here as well rather than
    // silently disappearing on the one path that isn't DB-backed.
    const builtIn = TASK_TEST_CASES[`ROUND_${roundNum}`];
    return {
      title: t(`task${roundNum}Title`),
      desc: t(`task${roundNum}Desc`),
      functionName: builtIn?.functionName,
      testCases: builtIn?.cases
    };
  })();
  const isModeEntry = phase === PHASES.LOBBY && !currentRoom;

  // The server owns hint entitlement; the current localized task supplies its text.
  const activeRoundHint = activeRoundTask.hint || t('aiHint');
  const hintUnlocked = playerState.activeEffects.some(effect => effect.type === 'aiHelper' && effect.expiresAt > Date.now());
  useEffect(() => {
    setPlayerState(prev => {
      const hint = hintUnlocked ? activeRoundHint : '';
      return prev.hint === hint ? prev : { ...prev, hint };
    });
  }, [activeRoundHint, hintUnlocked]);

  return (
    <div className={`${isModeEntry ? 'mode-entry mode-entry--arcade ' : ''}h-dvh w-full overflow-hidden flex flex-col bg-pysim-surface relative font-sans select-none antialiased`}>
      {/* Phase 8.1 — connection-instability banner. Deliberately a plain
          conditional render rather than an AnimatePresence exit animation:
          an animated wrapper that fails to unmount is exactly what left an
          invisible full-screen click-blocker over the create-room modal
          earlier, and this element sits above the whole match UI. */}
      {connectionLost && (
        <div className="shrink-0 bg-amber-500 text-white text-center text-xs font-black py-2 px-4 flex items-center justify-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-white animate-pulse" />
          {t('connectionLostBanner')}
        </div>
      )}

      <ModeEntryHeader
        mode="arcade"
        user={propUser}
        onLogout={onLogout ? () => requestHeaderAction(onLogout) : undefined}
        onNavigate={(path) => {
          if (path !== '/matchmaking') requestHeaderAction(() => navigate(path));
        }}
      >
        <button type="button" className="mode-entry-button" onClick={() => setShowGlossary(true)} aria-label={t('itemGlossary')} title={t('itemGlossary')}>
          <BookOpen aria-hidden="true" /><span className="app-action-label">{t('itemGlossary')}</span>
        </button>
        {playerState.eliminated && <span className="text-xs font-bold text-rose-600">{t('spectatorMode')}</span>}
      </ModeEntryHeader>

      {shopRetryNeeded && (
        <div role="status" className="shrink-0 bg-amber-50 text-amber-900 p-3 text-center text-sm">
          <span>{t('shopRequestFailed')} </span>
          <button type="button" disabled={shopState.busy} onClick={retryShopCommand} className="font-bold underline disabled:opacity-50">
            {t('shopRetryAction')}
          </button>
        </div>
      )}


      {/* 2. BODY CONTENT */}
      <div data-mode-transition-content className="flex-1 relative overflow-hidden">
        
        {/* GLOSSARY OVERLAY */}
        <GlossaryModal show={showGlossary} onClose={() => setShowGlossary(false)} items={SHOP_ITEMS} t={t} />

        {/* EXIT-DURING-ACTIVE-MATCH CONFIRMATION (back button / Exit to Hub) */}
        <ExitConfirmModal
          show={showExitConfirm}
          onCancel={() => { pendingNavigationRef.current = null; setShowExitConfirm(false); }}
          onConfirm={confirmHeaderExit}
          t={t}
        />

        {/* --- LOBBY PHASE VIEW (PUBLIC ROOM BROWSER & ROOM LOBBY) --- */}
        {phase === PHASES.LOBBY && (
          <div className={isModeEntry ? "h-full w-full overflow-y-auto px-4 py-8 sm:px-6 max-w-7xl mx-auto space-y-6" : "h-full w-full overflow-y-auto p-6 max-w-6xl mx-auto space-y-6"}>
            
            {/* VIEW A: NO ROOM JOINED -> PUBLIC ROOM BROWSER */}
            {!currentRoom ? (
              <>
              {/* Phase 8.3 — career card above the room list */}
              <PlayerStatsCard stats={playerStats} playerName={playerState.name} t={t} />
              {/* Step 5 — reviewable long after the room is gone */}
              <PastMatchesPanel matches={pastMatches} t={t} />
              <PublicRoomBrowser
                rooms={rooms}
                fetchRooms={fetchRooms}
                searchCode={searchCode}
                setSearchCode={setSearchCode}
                handleSearchJoin={handleSearchJoin}
                setShowCreateModal={setShowCreateModal}
                setJoinPasswordPrompt={setJoinPasswordPrompt}
                handleJoinRoom={handleJoinRoom}
                t={t}
              />
              </>
            ) : (
              /* VIEW B: ROOM LOBBY (WAITING IN JOINED ROOM) */
              <>
              <RoomLobbyView
                currentRoom={currentRoom}
                roomParticipants={roomParticipants}
                playerState={playerState}
                notify={notify}
                handleAddBot={handleAddBot}
                setSettingsForm={setSettingsForm}
                setShowSettingsModal={setShowSettingsModal}
                handleLeaveRoom={handleLeaveRoom}
                handleTransferHost={handleTransferHost}
                handleKickPlayer={handleKickPlayer}
                handleHostStartMatch={handleHostStartMatch}
                t={t}
              />

              {/* Phase 8.2 — the lobby is where a party actually talks */}
                <ChatPanel
                  messages={chatMessages}
                  emojiSet={emojiSet}
                  chatOpen={chatOpen}
                  sending={chatSending}
                  sendMessage={sendChatMessage}
                  sendEmoji={sendChatEmoji}
                  playerName={playerState.name}
                  t={t}
                />
              </>
            )}

            {/* MODAL 1: CREATE ROOM */}
            <CreateRoomModal
              show={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              createForm={createForm}
              setCreateForm={setCreateForm}
              onSubmit={handleCreateRoom}
              t={t}
            />

            {/* MODAL 2: HOST ROOM SETTINGS */}
            <RoomSettingsModal
              show={showSettingsModal}
              onClose={() => setShowSettingsModal(false)}
              settingsForm={settingsForm}
              setSettingsForm={setSettingsForm}
              onSubmit={handleUpdateSettings}
              t={t}
            />

            {/* MODAL 3: PASSWORD PROMPT */}
            <PasswordPromptModal
              prompt={joinPasswordPrompt}
              onClose={() => setJoinPasswordPrompt(null)}
              inputPassword={inputPassword}
              setInputPassword={setInputPassword}
              onConfirm={() => handleJoinRoom(joinPasswordPrompt, inputPassword)}
              t={t}
            />

          </div>
        )}

        {/* --- ROUND SUMMARY VIEW (rank + coins earned, auto-advances) --- */}
        {(phase === PHASES.SUMMARY_1 || phase === PHASES.SUMMARY_2 || phase === PHASES.SUMMARY_3) && (
          <RoundSummaryView roundSummary={roundSummary} timeLeft={timeLeft} t={t} />
        )}

        {/* --- SHOP PHASE VIEW --- */}
        {(phase === PHASES.SHOP_1 || phase === PHASES.SHOP_2 || phase === PHASES.SHOP_3) && (
          <div className="h-full w-full overflow-y-auto">
            <ShopPhaseView
              timeLeft={timeLeft}
              playerState={playerState}
              shopState={shopState}
              rollShop={rollShop}
              canBuyItem={canBuyItem}
              buyItem={buyItem}
              sellItem={sellItem}
              t={t}
            />
            {/* Phase 8.2 — the shop intermission is the other moment players
                are free to talk without it becoming an answer channel. */}
            <div className="px-6 pb-6 max-w-6xl mx-auto">
              <ChatPanel
                messages={chatMessages}
                emojiSet={emojiSet}
                chatOpen={chatOpen}
                sending={chatSending}
                sendMessage={sendChatMessage}
                sendEmoji={sendChatEmoji}
                playerName={playerState.name}
                t={t}
              />
            </div>
          </div>
        )}

        {/* --- ELIMINATED SPECTATOR VIEW ---
            The room's phase is shared by everyone still playing, so once a
            player is cut it keeps advancing through further rounds without
            them. Rendering the live coding view (blank editor + running
            timer) to someone who's already out is misleading — this takes
            its place until the match actually reaches RESULT. Only applies
            to the coding-round phases (the round-summary and shop screens
            stay visible either way, since watching standings/shop as a
            spectator is harmless and matches what RoundSummaryView and
            ShopPhaseView already show everyone). */}
        {playerState.eliminated && (phase === PHASES.ROUND_1 || phase === PHASES.ROUND_2 || phase === PHASES.ROUND_3 || phase === PHASES.ROUND_4) && (
          <div className="h-full w-full overflow-y-auto">
            <div className="min-h-full p-8 max-w-lg mx-auto flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-slate-100 rounded-full text-slate-400 inline-block shadow-inner">
              <Users className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('eliminatedSpectatingTitle')}</h1>
            <p className="text-sm text-slate-500">{t('eliminatedSpectatingDesc')}</p>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              ⭐ {playerState.score} {t('ptsUnit')}
            </span>
            </div>
          </div>
        )}

        {/* --- BATTLE ROYALE GAMEPLAY VIEW --- */}
        {!playerState.eliminated && (phase === PHASES.ROUND_1 || phase === PHASES.ROUND_2 || phase === PHASES.ROUND_3 || phase === PHASES.ROUND_4) && (
          <BattleRoyaleGameplayView
            draftReady={draftReady && shopState.ready}
            draftStatus={!shopState.ready ? (shopSyncError ? 'restoreError' : 'restoring') : draftStatus}
            retryDraft={() => { retryDraft(); retryShopSync(); }}
            phase={phase}
            PHASES={PHASES}
            t={t}
            challengeTitle={activeRoundTask.title}
            challengeDesc={activeRoundTask.desc}
            challengeFunctionName={activeRoundTask.functionName}
            challengeTestCases={activeRoundTask.testCases}
            timeLeft={timeLeft}
            playerState={playerState}
            checkEffectActive={checkEffectActive}
            SHOP_ITEMS={SHOP_ITEMS}
            handleCodeChange={handleCodeChange}
            editorRef={editorRef}
            handleEditorKeyDown={handleEditorKeyDown}
            consoleOutput={consoleOutput}
            runCodeTests={() => runCodeTests(activeRoundTask)}
            handleManualSubmit={handleManualSubmit}
            isGrading={isGrading}
            autoSubmitLeadSeconds={AUTO_SUBMIT_LEAD_SECONDS}
            autoSubmitWarnSeconds={autoSubmitWarnSeconds}
            targetingItem={targetingItem}
            opponents={opponents}
            handleTargetClick={handleTargetClick}
            initiateItemUse={initiateItemUse}
            setTargetingItem={setTargetingItem}
            watchedPlayer={watched.player}
            setWatchedPlayer={watchPlayer}
            watchedCode={watched.data}
          />
        )}

        {/* --- RESULT / SCORE SUMMARY VIEW --- */}
        {phase === PHASES.RESULT && (
          <div className="h-full w-full overflow-y-auto">
            <div className="min-h-full p-8 max-w-3xl mx-auto flex flex-col items-center justify-center text-center space-y-8">
            <Motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-2"
            >
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">{t('matchOver')}</h1>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">{t('finalPlacementsSubtitle')}</p>
            </Motion.div>

            {/* Winner Trophy Box */}
            {(() => {
              const allPlayers = currentRoom?.final_standings?.length
                ? currentRoom.final_standings.map(p => ({ ...p, isPlayer: p.name === playerState.name }))
                : [
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
                    <p className="text-sm text-slate-400 font-mono mt-1">{t('finalScoreLabel')} <span className="text-emerald-600 font-bold">{winner.score} {t('ptsUnit')}</span></p>
                  </div>

                  {/* Placement List */}
                  <div className="w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
                    {allPlayers.map((p, idx) => (
                      <div key={idx} className={`flex justify-between items-center p-5 border-b border-slate-100 last:border-0 ${p.isPlayer ? 'bg-rose-50/50 font-black' : 'hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-4">
                          <span className={`w-8 text-center text-xs font-black ${idx === 0 ? 'text-amber-500' : 'text-slate-400'}`}>#{idx + 1}</span>
                          <span className={`text-xs ${p.eliminated ? 'text-slate-400 line-through font-normal' : 'text-slate-700'}`}>
                            {p.name} {p.isPlayer ? t('youSuffix') : ""}
                          </span>
                        </div>
                        <span className="text-emerald-600 font-mono text-xs font-bold">{p.score} {t('ptsUnit')}</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            {/* Gold this match paid into the shop wallet. The figure comes from the
                participant row the server wrote when the match ended, so it states
                what was actually credited rather than re-deriving the reward table
                on the client. Guests and names without an account are paid nothing,
                and get the explanation instead of a silent zero. */}
            {(() => {
              const myRow = roomParticipants.find(p => p.user_name === playerState.name);
              const coins = Number(myRow?.coins_awarded || 0);
              return (
                <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-3 bg-amber-50 rounded-2xl text-amber-500 shrink-0">
                      <Coins className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('coinsEarnedTitle')}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {coins > 0 ? t('coinsEarnedHint') : t('coinsNoneHint')}
                      </p>
                    </div>
                  </div>
                  <div className="text-3xl font-black text-amber-500 whitespace-nowrap">
                    +{coins} <span className="text-sm font-bold text-slate-400">{t('coinsUnit')}</span>
                  </div>
                </div>
              );
            })()}

            {/* Phase 8.3 — this player's own code from each round they played */}
            <RoundHistoryPanel history={roundHistory} t={t} />

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => handleFinishChoice('LEAVE')}
                className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-2xl border border-slate-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                {t('leaveRoomBtn')}
              </button>

              <button
                onClick={() => handleFinishChoice('REMAIN')}
                className="px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                {t('remainRoomBtn')}
              </button>
            </div>
            </div>
          </div>
        )}

      </div>

      {/* 3. NOTIFICATION DISPATCHER POPUPS */}
      <NotificationStack notifications={notifications} />

    </div>
  );
}
