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
import { motion, AnimatePresence } from 'framer-motion';
import { botManager } from './bot/botManager.js';
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

export default function ArcadeBattleRoyale({ user: propUser }) {
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
  const lastShopRolledPhaseRef = useRef(null);
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

  // Each concern's logic now lives in its own hook (client/src/pages/Arcade/hooks/*.js)
  // — called in dependency order: combat first (round-judging needs its
  // checkEffectActive for the scoreMultiplier check), round-judging next
  // (room-lifecycle needs its getRound4Task for the resume-match effect),
  // then shop, then room-lifecycle last.
  // The hint for the problem currently on screen, held in a ref because
  // useCombat() is constructed here — above the point where the round's task is
  // resolved — and because a hint changing must not re-create the combat
  // handlers. useCombat reads it only at the moment the aiHelper item is used.
  const activeRoundHintRef = useRef('');

  const {
    targetingItem, setTargetingItem, checkEffectActive, dispatchBotAttackOnPlayer,
    initiateItemUse, handleTargetClick, handleEditorKeyDown, handleCodeChange
  } = useCombat({ playerState, setPlayerState, opponents, setOpponents, currentRoom,
    phase, notify, t, API_BASE, activeRoundHintRef });

  const {
    getRound4Task, getPoolTask, submitMyRound, runCodeTests, handleManualSubmit,
    isGrading, consoleOutput, tasksReady
  } = useRoundJudging({ playerState, setPlayerState, currentRoom, notify, t, lang, checkEffectActive, API_BASE });

  const {
    shopState, rollShop, canBuyItem, buyItem, sellItem
  } = useShopEconomy({ playerState, setPlayerState, currentRoom, notify, t, API_BASE });

  // Phase 8.3 — read-only progression views (RESULT-screen code review + lobby
  // career card). Takes primitives rather than the currentRoom object so its
  // effects don't re-subscribe on every room-state poll.
  const { roundHistory, playerStats, pastMatches } = useProgression({
    playerName: playerState.name, roomId, phase, API_BASE
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
    phase, setPhase, appliedPhaseRef, lastShopRolledPhaseRef, phaseDeadlineRef,
    setTimeLeft, setRoundSummary, getRound4Task, getPoolTask, tasksReady, setShowExitConfirm,
    currentRoom, setCurrentRoom, roomParticipants, setRoomParticipants
  });

  // Phase 8.1 — the room this client is sitting in no longer exists server
  // side. Drop every trace of it and put the player back in the room browser
  // with an explanation, rather than leaving them staring at a match that
  // can never progress. Clearing currentRoom also clears the saved
  // active-room entry in localStorage (see useRoomLifecycle's sync effect),
  // so the next mount won't try to restore a room that's gone.
  const handleRoomVanished = useCallback(() => {
    appliedPhaseRef.current = PHASES.LOBBY;
    lastShopRolledPhaseRef.current = null;
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

  // Latest task resolvers for the room-state poller below. The poller's own
  // dependency array deliberately stays small (see its comment), which means
  // anything it closes over is captured on mount — and on mount `dbTasks` is
  // still empty and `currentRoom` is null. Calling getPoolTask/getRound4Task
  // through that stale closure therefore always fell back to the built-in
  // tasks: a room with a chosen difficulty showed the pool task's title while
  // handing the player the OLD task's starting code (seen live: title
  // "Anagram Checker" with `def fib(n):` in the editor), and Round 4 silently
  // always used ROUND_4_FALLBACK_TASK instead of the DB's hard task. Reading
  // through a ref gives the poller the current resolvers without widening its
  // deps and re-subscribing it on every render.
  const taskResolverRef = useRef({});
  useEffect(() => {
    taskResolverRef.current = { getPoolTask, getRound4Task, rollShop };
  });

  // Fetch specific room status if joined. This is now the ONLY place that
  // ever moves `phase` forward — the server (tickArcadeMatches) is the sole
  // authority on what phase a room is in, so every client (host included)
  // just mirrors it here. Comparing against `appliedPhaseRef` (not `phase`
  // state) keeps this effect's own deps free of `phase`, so it can't re-run
  // into the same stale-closure re-entrancy class of bug the old
  // client-driven handlePhaseTransition() had.
  useEffect(() => {
    if (!roomId) return;
    const fetchRoomState = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/arcade/rooms/${roomId}?user_name=${encodeURIComponent(playerState.name)}`);

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
        if (!data.success) return;

        // A poll that got through means the connection is healthy again.
        failedPollsRef.current = 0;
        setConnectionLost(false);

        setCurrentRoom(data.room);
        setRoomParticipants(data.participants || []);

        // Mirror DB-authoritative score/cash/eliminated onto every opponent —
        // real or bot, both are real arcade_participants rows now — while
        // keeping client-local cosmetic fields (progress, isDebuffed) intact
        // instead of clobbering them every 2s (those come from botManager's
        // own tick, not the DB).
        const others = (data.participants || []).filter(p => p.user_name !== playerState.name);
        setOpponents(prevOpponents => others.map(p => {
          const prev = prevOpponents.find(o => o.name === p.user_name);
          return {
            name: p.user_name,
            score: p.score || 0,
            cash: p.cash || 0,
            eliminated: p.is_eliminated === 1,
            hasSubmitted: p.has_submitted === 1,
            isBot: p.user_name.startsWith('Bot_'),
            progress: prev?.progress || 0,
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
            eliminated: myRow.is_eliminated === 1
          }));
        }

        // Refreshed on EVERY poll, deliberately before the phase-unchanged
        // early return below. The deadline used to be read only when the phase
        // itself changed, so any adjustment the server made to phase_deadline
        // within a phase was invisible to this client until the next phase —
        // it kept counting down against a deadline it captured once.
        if (data.room.phase_deadline) {
          phaseDeadlineRef.current = parseUtcTimestamp(data.room.phase_deadline);
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
          botManager.resetAllBots();
          setOpponents(prev => prev.map(o => ({ ...o, progress: 0 })));
          setPlayerState(prev => ({ ...prev, code: (taskResolverRef.current.getPoolTask(1, data.room) || TASKS.ROUND_1).initialCode, hint: "", hasSubmittedThisRound: false, inventory: [], activeEffects: [] }));
          notify("🎮 เริ่มการแข่งขัน!", "success");
        } else if (serverPhase === PHASES.ROUND_2) {
          botManager.resetRoundProgress();
          setOpponents(prev => prev.map(o => ({ ...o, progress: 0 })));
          setPlayerState(prev => ({ ...prev, code: (taskResolverRef.current.getPoolTask(2, data.room) || TASKS.ROUND_2).initialCode, hint: "", hasSubmittedThisRound: false }));
          notify(t('round2Start'), "warning");
        } else if (serverPhase === PHASES.ROUND_3) {
          botManager.resetRoundProgress();
          setOpponents(prev => prev.map(o => ({ ...o, progress: 0 })));
          setPlayerState(prev => ({ ...prev, code: (taskResolverRef.current.getPoolTask(3, data.room) || TASKS.ROUND_3).initialCode, hint: "", hasSubmittedThisRound: false }));
          notify(t('round3Start'), "warning");
        } else if (serverPhase === PHASES.ROUND_4) {
          botManager.resetRoundProgress();
          setOpponents(prev => prev.map(o => ({ ...o, progress: 0 })));
          const round4Task = taskResolverRef.current.getRound4Task(data.room);
          setPlayerState(prev => ({ ...prev, code: round4Task.initialCode, hint: "", hasSubmittedThisRound: false }));
          notify(t('finalRound'), "warning");
        } else if (serverPhase === PHASES.SUMMARY_1 || serverPhase === PHASES.SUMMARY_2 || serverPhase === PHASES.SUMMARY_3) {
          // The server has no notion of "which client is viewing this" —
          // its {roundNum, entries:[{name,rank,cashGain,eliminated}]}
          // payload is the same for everyone, so `isPlayer` (used by
          // RoundSummaryView to highlight/badge "(You)") is stamped on here.
          const summary = data.room.last_round_summary;
          setRoundSummary(summary ? { ...summary, entries: summary.entries.map(e => ({ ...e, isPlayer: e.name === playerState.name })) } : null);
        } else if (serverPhase === PHASES.SHOP_1 || serverPhase === PHASES.SHOP_2 || serverPhase === PHASES.SHOP_3) {
          if (lastShopRolledPhaseRef.current !== serverPhase) {
            lastShopRolledPhaseRef.current = serverPhase;
            taskResolverRef.current.rollShop(true);
          }
        } else if (serverPhase === PHASES.RESULT) {
          notify(t('matchFinished'), "info");
        }
      } catch (err) {
        // One dropped poll is normal (a hiccup, a backgrounded tab); several
        // in a row means the player is genuinely disconnected and their match
        // is still running without them, which is worth telling them about.
        // The banner is purely informational — polling keeps retrying, and a
        // single successful poll clears it again.
        failedPollsRef.current += 1;
        if (failedPollsRef.current >= CONNECTION_LOST_AFTER_FAILED_POLLS) {
          setConnectionLost(true);
        }
        console.error("Error updating room state:", err);
      }
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
      clearInterval(roomInterval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [roomId, playerState.name, notify, t, API_BASE, handleRoomVanished]);

  // Latest-value mirror for the match tick below. The tick needs the current
  // playerState/opponents/roomParticipants plus a few callbacks, but naming
  // those in the tick effect's own dependency array is what broke it: the tick
  // calls botManager.update(), which writes new playerState/opponents objects,
  // so the effect re-subscribed on its own output — measured at ~164 re-runs
  // per second. Every re-subscribe ran the cleanup, cancelling the pending 1s
  // timeout before it could ever fire, which is why the phase countdown sat
  // frozen on screen and the timeLeft===0 auto-submit safety net never ran (a
  // player who didn't manually click submit silently scored 0 for the round).
  // Reading through a ref keeps the tick on a real once-a-second interval.
  const tickRef = useRef({});
  useEffect(() => {
    tickRef.current = {
      playerState, opponents, roomParticipants,
      notify, dispatchBotAttackOnPlayer, submitMyRound
    };
  });

  // Sync Timer and cosmetic Bot AI ticking. The server (tickArcadeMatches)
  // is what actually advances the match once time runs out — this effect no
  // longer transitions phase itself. Once timeLeft hits 0, all it does is
  // make sure THIS player's own round result has been submitted (in case
  // they never clicked the submit button); the room-state poller above is
  // what will notice the server has moved everyone into the next phase.
  useEffect(() => {
    if (phase === PHASES.LOBBY || phase === PHASES.RESULT) return;

    const tick = () => {
      const {
        playerState: ps, opponents: ops, roomParticipants: rp,
        notify: notifyNow, dispatchBotAttackOnPlayer: attackNow, submitMyRound: submitNow
      } = tickRef.current;

      // Recomputed from the absolute deadline every tick rather than
      // decrementing, so a throttled background tab self-corrects to the true
      // remaining time instead of drifting.
      const remaining = Math.max(0, Math.ceil((phaseDeadlineRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining > 0) {
        // Sync and update active bot AI instances (cosmetic only now — see
        // botManager.js — real score/cash/elimination come from the server).
        botManager.syncBots(rp, ps.name);
        botManager.update(phase, ps, ops, setPlayerState, setOpponents, notifyNow, attackNow);
      }

      // Safety net for a player who never pressed submit. Fires with
      // AUTO_SUBMIT_LEAD_SECONDS to spare rather than at 0 because
      // POST /submit-round refuses anything arriving after the server has
      // already finalized the round, and the request still has a network trip
      // to make. Firing at exactly 0 meant it was always too late and the round
      // silently scored 0 (confirmed live). The lead used to also cover several
      // seconds of Pyodide and AI work in the browser; that is the server's job
      // now, so the margin is only for the network.
      // Re-entry once a second across the lead window is harmless:
      // submitMyRound() sets hasSubmittedThisRound up front and also guards on
      // its own in-flight ref, so only the first call does any work.
      if (
        String(phase).startsWith('ROUND_') &&
        remaining <= AUTO_SUBMIT_LEAD_SECONDS &&
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

  // Keeps the server's copy of this player's unfinished work roughly current
  // while a round is open. It is what makes the spectator view possible at all
  // (the server used to see a player's code for the first time when they
  // pressed submit) and it doubles as crash recovery.
  //
  // Every 4 seconds rather than on every keystroke, and only when the text has
  // actually changed since the last send: this is a nice-to-have running
  // underneath a live match, and it must never become the reason a round feels
  // slow. Stops the moment the answer is in - after that the draft would only
  // disagree with what was submitted.
  const lastDraftSentRef = useRef(null);
  useEffect(() => {
    if (!roomId || !String(phase).startsWith('ROUND_')) return;
    lastDraftSentRef.current = null;

    const send = async () => {
      // Read through the tick mirror, never from a captured playerState: the
      // code changes on every keystroke, so naming it as a dependency would
      // tear this interval down and rebuild it on every character typed - and
      // a 4s interval that restarts every 200ms never fires at all.
      const ps = tickRef.current.playerState;
      if (!ps || ps.hasSubmittedThisRound || ps.eliminated) return;
      const code = ps.code || '';
      if (code === lastDraftSentRef.current) return;
      lastDraftSentRef.current = code;
      try {
        await fetch(`${API_BASE}/api/arcade/rooms/${roomId}/code-draft`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_name: ps.name, code })
        });
      } catch {
        // A dropped draft is not worth telling the player about; the next
        // tick resends, and the answer itself goes through submit-round.
        lastDraftSentRef.current = null;
      }
    };

    const interval = setInterval(send, 4000);
    return () => clearInterval(interval);
  }, [roomId, phase, API_BASE]);

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
  // Publish this round's hint for the aiHelper item. Sourced from the same
  // shaped task as the title, the description and the starter code, so the item
  // can never describe a different problem than the one being played. Written
  // in an effect rather than during render — a ref write during render is a
  // side effect, and React may render a component without committing it.
  const activeRoundHint = activeRoundTask.hint || '';
  useEffect(() => {
    activeRoundHintRef.current = activeRoundHint;
  }, [activeRoundHint]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-50 relative font-sans select-none antialiased">
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

      {/* 1. TOP BAR */}
      <nav className="min-h-[4rem] border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-y-2 px-4 sm:px-6 py-2 sm:py-0 z-10 shadow-sm shrink-0">
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

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
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
            <span className="hidden sm:inline">📖 {t('itemGlossary')}</span>
          </button>

          <button 
            onClick={() => i18n.changeLanguage(lang === 'th' ? 'en' : 'th')}
            className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl border border-slate-200 transition-all font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            {t('langBtn')}
          </button>

          <button
            onClick={() => {
              const isActiveMatch = phase !== PHASES.LOBBY && phase !== PHASES.RESULT;
              if (isActiveMatch) {
                setShowExitConfirm(true);
              } else {
                navigate('/menu');
              }
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('backToHub')}</span>
          </button>
        </div>
      </nav>

      {/* 2. BODY CONTENT */}
      <div className="flex-1 relative overflow-hidden bg-slate-50/50">
        
        {/* GLOSSARY OVERLAY */}
        <GlossaryModal show={showGlossary} onClose={() => setShowGlossary(false)} items={SHOP_ITEMS} t={t} />

        {/* EXIT-DURING-ACTIVE-MATCH CONFIRMATION (back button / Exit to Hub) */}
        <ExitConfirmModal
          show={showExitConfirm}
          onCancel={() => setShowExitConfirm(false)}
          onConfirm={handleConfirmForfeitExit}
          t={t}
        />

        {/* --- LOBBY PHASE VIEW (PUBLIC ROOM BROWSER & ROOM LOBBY) --- */}
        {phase === PHASES.LOBBY && (
          <div className="h-full w-full overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
            
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
            runCodeTests={runCodeTests}
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-2"
            >
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">{t('matchOver')}</h1>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">{t('finalPlacementsSubtitle')}</p>
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
