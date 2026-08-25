// client/src/pages/Arcade/hooks/useRoomLifecycle.js
// Room lifecycle / matchmaking concern: public room list, create/join/leave/
// kick/transfer-host/add-bot/settings, resume-an-active-match-on-mount, and
// the browser-back/beforeunload guard during an active match. Extracted as-
// is from ArcadeBattleRoyale.jsx — no behavior change, only relocated. Does
// NOT own `phase`/`timeLeft`/`currentRoom`/`roomParticipants`/the
// phase-transition refs or the room-state poller itself — those stay in the
// main component (passed in here as controlled values) since the poller is
// the cross-cutting orchestrator that also resets round-judging/combat state
// on every phase change, and other hooks (shop/combat/judging) need
// `currentRoom` too; owning it here would create a circular hook dependency
// (this hook also needs `getRound4Task` from useRoundJudging).
import { useState, useRef, useEffect, useCallback } from 'react';
import { PHASES, TASKS } from '../constants.js';
import { parseUtcTimestamp } from '../constants.js';

export default function useRoomLifecycle({
  playerState, setPlayerState, notify, t, navigate, API_BASE,
  phase, setPhase, appliedPhaseRef, lastShopRolledPhaseRef, phaseDeadlineRef,
  setTimeLeft, setRoundSummary, getRound4Task, getPoolTask, tasksReady, setShowExitConfirm,
  currentRoom, setCurrentRoom, setRoomParticipants
}) {
  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ room_name: '', password: '', max_players: 4, round_duration_mode: 'standard', difficulty: 'default' });
  const [searchCode, setSearchCode] = useState('');
  const [joinPasswordPrompt, setJoinPasswordPrompt] = useState(null);
  const [inputPassword, setInputPassword] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ room_name: '', password: '', max_players: 4 });

  // Resume-in-progress-match support: a refresh, crash, or accidental tab
  // close used to lose the match entirely — the player's own
  // arcade_participants row survives server-side (until the 45s stale
  // sweep), but the client had nothing telling it a match was still live.
  // Remembering {room_id, room_code} per user_name here lets the restore
  // effect below reconnect to that exact room on the next mount instead of
  // dropping back to an empty lobby.
  const activeRoomStorageKey = (userName) => `arcade_active_room_${userName}`;
  const restoreAttemptedRef = useRef(false);

  // Keep localStorage in sync with whatever room this player is currently
  // in — written whenever they end up in one (create/join/restore all funnel
  // through setCurrentRoom), removed once they're back at the lobby (leave,
  // finish-choice LEAVE, or a restore attempt finding the room gone).
  useEffect(() => {
    if (!playerState.name) return;
    const key = activeRoomStorageKey(playerState.name);
    if (currentRoom) {
      localStorage.setItem(key, JSON.stringify({ room_id: currentRoom.room_id, room_code: currentRoom.room_code }));
      return;
    }
    // Only forget the room once the restore effect below has actually had its
    // turn. Both effects run on mount and THIS one is declared first, so an
    // unguarded removeItem() here deleted the saved room a moment before the
    // restore effect went looking for it — every single time. That is why
    // resuming a match after closing the browser never worked: the feature was
    // erasing its own input on startup. Verified 2026-08-19 by writing the key
    // by hand and reloading: it came back null.
    if (restoreAttemptedRef.current) {
      localStorage.removeItem(key);
    }
  }, [currentRoom, playerState.name]);

  // On mount, before anything else, check whether this player has a match
  // still marked active from a previous session and try to reconnect —
  // fetching the same GET /rooms/:id the regular poller already uses, so
  // once setCurrentRoom lands here that poller effect takes over exactly as
  // if the player had just joined normally (picks up phase/timer/opponents
  // on its own). Only ever attempted once per mount (restoreAttemptedRef)
  // so it can't fight with an explicit create/join the player does instead.
  useEffect(() => {
    // Waits for the task pool. Restoring a room means resolving the problem
    // that round is on, and doing that before the pool has loaded resolves to
    // nothing and falls back to a fixed built-in task — the player would come
    // back to the right title above the wrong starting code.
    if (restoreAttemptedRef.current || currentRoom || !playerState.name || !tasksReady) return;
    restoreAttemptedRef.current = true;
    const key = activeRoomStorageKey(playerState.name);
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (!saved?.room_id) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/arcade/rooms/${saved.room_id}?user_name=${encodeURIComponent(playerState.name)}`);
        const data = await res.json();
        const myRow = (data.participants || []).find(p => p.user_name === playerState.name);
        if (data.success && myRow) {
          setCurrentRoom(data.room);
          setRoomParticipants(data.participants);

          // Land directly on whatever phase the room is already in instead
          // of routing through the room-state poller's normal "phase just
          // changed" path — that path resets the round's starting code and
          // hasSubmittedThisRound, which is correct for an actual new round
          // but wrong here (we're only catching up to a round already in
          // progress, not entering a fresh one). Pre-seeding appliedPhaseRef
          // to match is what stops the poller from re-triggering that reset
          // on its very next tick.
          const serverPhase = data.room.phase || PHASES.LOBBY;
          appliedPhaseRef.current = serverPhase;
          lastShopRolledPhaseRef.current = serverPhase.startsWith('SHOP_') ? serverPhase : null;
          setPhase(serverPhase);
          if (data.room.phase_deadline) {
            phaseDeadlineRef.current = parseUtcTimestamp(data.room.phase_deadline);
            setTimeLeft(Math.max(0, Math.ceil((phaseDeadlineRef.current - Date.now()) / 1000)));
          }
          if (serverPhase === PHASES.SUMMARY_1 || serverPhase === PHASES.SUMMARY_2 || serverPhase === PHASES.SUMMARY_3) {
            const summary = data.room.last_round_summary;
            setRoundSummary(summary ? { ...summary, entries: summary.entries.map(e => ({ ...e, isPlayer: e.name === playerState.name })) } : null);
          }
          // Resuming into a live round has to restore the problem the match
          // actually drew, not the fixed built-in task. `data.room` is passed
          // explicitly because `currentRoom` state has not been set from this
          // payload yet at this point in the effect — the same ordering trap
          // documented on getPoolTask() in useRoundJudging.js.
          const roundNum = String(serverPhase).startsWith('ROUND_')
            ? parseInt(String(serverPhase).split('_')[1], 10) : 0;
          let roundCode;
          if (roundNum === 4) {
            roundCode = getRound4Task(data.room)?.initialCode;
          } else if (roundNum) {
            roundCode = getPoolTask(roundNum, data.room)?.initialCode
              ?? TASKS[`ROUND_${roundNum}`]?.initialCode;
          }
          setPlayerState(prev => ({
            ...prev,
            score: myRow.score || 0,
            cash: myRow.cash || 0,
            eliminated: myRow.is_eliminated === 1,
            hasSubmittedThisRound: myRow.has_submitted === 1,
            code: roundCode !== undefined ? roundCode : prev.code
          }));

          notify(t('resumedActiveMatch'), "info");
        } else {
          localStorage.removeItem(key);
        }
      } catch {
        // Network hiccup on the very first load — leave the saved room
        // alone so a plain page refresh a moment later can still try again,
        // rather than deleting a possibly-still-valid session on one blip.
      }
    })();
  }, [playerState.name, notify, t, tasksReady]);

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
          round_duration_mode: createForm.round_duration_mode,
          difficulty: createForm.difficulty,
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
    } catch {
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
    } catch {
      notify("เกิดข้อผิดพลาดในการเข้าร่วมห้อง", "error");
    }
  };

  // Search Room by Code
  const handleSearchJoin = (e) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    handleJoinRoom(searchCode.trim());
  };

  // Host Start Room Match — just tells the server to flip the room into
  // Round 1 (see /api/arcade/rooms/:id/start). The host doesn't set any
  // local phase/opponents state itself anymore; the room-state poller in the
  // main component picks up the new phase within ~2s exactly the same way
  // every other participant does, so there's no separate "host path" left to
  // drift out of sync with everyone else's.
  const handleHostStartMatch = async () => {
    if (!currentRoom) return;
    try {
      const res = await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host_name: playerState.name })
      });
      const data = await res.json();
      if (!data.success) {
        notify(data.error || "ไม่สามารถเริ่มการแข่งขันได้", "error");
      }
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    appliedPhaseRef.current = PHASES.LOBBY;
    lastShopRolledPhaseRef.current = null;
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

    appliedPhaseRef.current = PHASES.LOBBY;
    lastShopRolledPhaseRef.current = null;

    if (choice === 'LEAVE') {
      setCurrentRoom(null);
      setRoomParticipants([]);
      setPhase(PHASES.LOBBY);
      fetchRooms();
    } else {
      // Mirrors the reset /finish-choice's REMAIN branch already did to the
      // DB row (score/cash/is_eliminated) — cash starts at 0, same as a
      // fresh match, not the old flat 1000 starting balance.
      setPlayerState(prev => ({
        ...prev,
        score: 0,
        cash: 0,
        eliminated: false,
        inventory: [],
        activeEffects: [],
        hasSubmittedThisRound: false,
        code: "",
        hint: ""
      }));
      setPhase(PHASES.LOBBY);
    }
  };

  // Guard against accidentally losing an in-progress match: once any active
  // match phase starts (everything except LOBBY/RESULT), pushing a dummy
  // history entry means the browser back button's first press lands here
  // instead of immediately leaving the SPA route — popstate re-pushes that
  // entry (cancelling the navigation) and opens a confirmation dialog
  // instead. beforeunload separately covers tab close/refresh/typed URL.
  useEffect(() => {
    const isActiveMatch = phase !== PHASES.LOBBY && phase !== PHASES.RESULT;
    if (!isActiveMatch) return;

    window.history.pushState({ arcadeGuard: true }, '');

    const handlePopState = () => {
      window.history.pushState({ arcadeGuard: true }, '');
      setShowExitConfirm(true);
    };
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [phase, setShowExitConfirm]);

  const handleConfirmForfeitExit = async () => {
    setShowExitConfirm(false);
    await handleLeaveRoom();
    navigate('/menu');
  };

  return {
    rooms, fetchRooms,
    showCreateModal, setShowCreateModal,
    createForm, setCreateForm,
    searchCode, setSearchCode,
    joinPasswordPrompt, setJoinPasswordPrompt,
    inputPassword, setInputPassword,
    showSettingsModal, setShowSettingsModal,
    settingsForm, setSettingsForm,
    handleCreateRoom, handleJoinRoom, handleSearchJoin, handleHostStartMatch,
    handleUpdateSettings, handleTransferHost, handleKickPlayer, handleAddBot,
    handleLeaveRoom, handleFinishChoice, handleConfirmForfeitExit
  };
}
