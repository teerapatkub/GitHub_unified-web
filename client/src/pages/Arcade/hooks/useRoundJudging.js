// client/src/pages/Arcade/hooks/useRoundJudging.js
// Round submission/judging concern: DB task pool (for Round 4), Pyodide
// correctness checking, the NVIDIA code-quality judge call, and round-score
// submission. Extracted as-is from ArcadeBattleRoyale.jsx — no behavior
// change, only relocated.
import { useState, useRef, useEffect, useCallback } from 'react';
import usePyodide from '../../../hooks/usePyodide.js';
import { PHASES, TASKS, TASK_TEST_CASES, ROUND_4_FALLBACK_TASK,
         FINALE_POOL_BY_DIFFICULTY } from '../constants.js';

// `phase` and `timeLeft` used to be needed here to work out the round's task
// and the time leg of the score. Both are the server's business now, so the
// hook no longer takes them.
export default function useRoundJudging({ playerState, setPlayerState, currentRoom, notify, t, lang, checkEffectActive, API_BASE }) {
  // PostgreSQL Tasks State (Bilingual TH/EN)
  const [dbTasks, setDbTasks] = useState({ easy: [], medium: [], hard: [] });
  const [isGrading, setIsGrading] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState("");

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

  // Every match draws its own four problems at start; the ids live on the room
  // (round_task_ids) so the client and the server read one identical line-up.
  // Resolving a round means looking its id up in the pools already fetched
  // above. Returns null for a legacy room started before the draw existed, in
  // which case callers fall back to the fixed built-in tasks.
  const taskById = useCallback((taskId) => {
    for (const pool of [dbTasks.easy, dbTasks.medium, dbTasks.hard]) {
      const found = (pool || []).find(t => t.task_id === taskId);
      if (found) return found;
    }
    return null;
  }, [dbTasks]);

  // Shapes a DB task row into what the round UI needs.
  //
  // What the player sees is `starter_code`: a scaffold that already contains
  // the variables, the loop and the return, leaving only the line or two that
  // carry the idea of the problem as a TODO. This mode is played by people
  // still learning Python, and measurement on 2026-08-19 found that starting
  // them at a bare `pass` left a beginner unable to physically TYPE 70% of the
  // bank inside Quick Mode's usable seconds — the round was being lost to
  // keystrokes rather than to thinking.
  //
  // `initial_code` is the finished answer and must never reach the editor:
  // handing it over whole would let a player win by pressing submit without
  // writing anything. It is only read here to recover the function name to
  // grade against, and as the fallback shape for a row seeded before
  // starter_code existed.
  const shapeTask = useCallback((source) => {
    if (!source) return null;
    const sigMatch = /^def\s+(\w+)\s*\([^)]*\)\s*:/m.exec(source.initial_code || '');
    if (!sigMatch) return null;
    const starter = (source.starter_code || '').trim();
    return {
      title: lang === 'en' ? source.title_en : source.title_th,
      desc: lang === 'en' ? source.desc_en : source.desc_th,
      initialCode: starter || `${sigMatch[0]}
    # Write your python code here
    pass`,
      functionName: sigMatch[1],
      testCases: source.test_cases,
      // What the aiHelper item reveals. Falls back to the old generic sentence
      // for a row seeded before hints existed, so the item always does
      // something when used.
      hint: (lang === 'en' ? source.hint_en : source.hint_th) || ''
    };
  }, [lang]);

  // `roomOverride` exists because of an ordering trap in the room poller: it
  // receives the new room payload and calls setCurrentRoom(), then decides in
  // the SAME tick whether the phase changed. React has not re-rendered yet at
  // that point, so `currentRoom` here is still the previous room — the one from
  // before the match started, with no round_task_ids on it. The lookup returned
  // null, the caller fell back to the fixed built-in task, and the player got
  // `def fib(n):` in the editor underneath a description for an entirely
  // different problem (seen on screen 2026-08-19, room ARC-VB44: the panel read
  // "Sum Array" while the editor held the fib stub). Callers that already hold
  // the fresh payload pass it in rather than reading it back out of state.
  const getPoolTask = useCallback((roundNum, roomOverride) => {
    const drawn = (roomOverride || currentRoom)?.round_task_ids;
    if (!Array.isArray(drawn) || drawn[roundNum - 1] === undefined) return null;
    return shapeTask(taskById(drawn[roundNum - 1]));
  }, [currentRoom, taskById, shapeTask]);

  // Round 4 is the elimination finale. Its problem comes from the same drawn
  // line-up as every other round; the pool lookup below is only the fallback
  // for a legacy room (started before round_task_ids existed) or for the brief
  // window before the task fetch lands.
  //
  // That fallback pool follows the ROOM's difficulty rather than always being
  // `hard`, matching arcadeConfig.finalePoolByDifficulty on the server. An
  // easy room used to get a hard finale nobody in it could finish, which
  // scored everyone equally at zero and decided nothing.
  //
  // Shaping goes through shapeTask() rather than repeating the signature
  // regex here — this used to be a second copy of that logic, and the copies
  // drifted: Round 4 kept serving the hardcoded fallback long after the DB
  // pool existed, invisibly, because the fallback happened to be byte-
  // identical to the pool's first entry.
  const getRound4Task = useCallback((roomOverride) => {
    const room = roomOverride || currentRoom;
    const drawn = room?.round_task_ids;
    const drawnFinale = Array.isArray(drawn) && drawn[3] !== undefined ? taskById(drawn[3]) : null;
    const finaleDifficulty = FINALE_POOL_BY_DIFFICULTY[room?.difficulty || 'default']
      || FINALE_POOL_BY_DIFFICULTY.default;
    const finalePool = dbTasks[finaleDifficulty] || [];
    const source = drawnFinale || finalePool[0] || ROUND_4_FALLBACK_TASK;
    return shapeTask(source);
  }, [dbTasks, currentRoom, taskById, shapeTask]);

  // Reused as-is from Person 1's learning system (client/src/hooks/usePyodide.js)
  // to run player code for real instead of the old fake "always PASS" checker.
  const { status: pyodideStatus, runCode: runPyCode, clearOutput: clearPyOutput, setOnOutput: setPyOnOutput } = usePyodide();
  const pyOutputRef = useRef([]);
  useEffect(() => {
    setPyOnOutput((lines) => { pyOutputRef.current = lines; });
  }, [setPyOnOutput]);

  // Guards submitMyRound() against being kicked off twice concurrently — the
  // timer effect in the main component can re-run (its deps include
  // roomParticipants, which gets a new array reference on every 2s
  // room-state poll) while timeLeft is still 0 and the previous
  // submitMyRound() call's own async work (Pyodide run + quality-judge
  // fetch) hasn't resolved yet.
  const submittingRoundRef = useRef(false);
  // Sends MY code to the server and stops there.
  //
  // Everything that decides the round - how many tests passed, the code-quality
  // score, how long it took - is worked out by the server when the round closes
  // (finalizeArcadePhase in server/server.js). The browser used to compute all
  // three and send a finished number, which meant anyone able to edit a request
  // could win every match without writing Python. See
  // docs/adr/0001-server-owns-the-verdict.md.
  //
  // Only the score-multiplier flag still comes from here, because item effects
  // live in the browser and nowhere else. It can only double a score the server
  // computed itself.
  //
  // What has to happen before the timer runs out is the SEND. Grading happens
  // afterwards, so a slow connection can no longer cost a player their round.
  const submitMyRound = async () => {
    if (submittingRoundRef.current || playerState.hasSubmittedThisRound || playerState.eliminated) return;
    submittingRoundRef.current = true;
    setPlayerState(prev => ({ ...prev, hasSubmittedThisRound: true }));
    setIsGrading(true);
    notify(t('judgingCode'), "info");
    try {
      const isMultiplierActive = checkEffectActive('scoreMultiplier');
      setPlayerState(prev => ({
        ...prev,
        activeEffects: prev.activeEffects.filter(e => e.type !== 'scoreMultiplier')
      }));

      if (currentRoom) {
        await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/submit-round`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_name: playerState.name,
            code: playerState.code,
            score_multiplier_active: isMultiplierActive
          })
        });
      }

      notify(t('submittedWaitingForResult'), "success");
    } catch (err) {
      console.error('submitMyRound error:', err);
    } finally {
      setIsGrading(false);
      submittingRoundRef.current = false;
    }
  };

  // A trial run: shows what the code actually prints, and says nothing about
  // whether it is right.
  //
  // This used to print "[PASS] Test Case 1 / [PASS] Test Case 2 / [SUCCESS]
  // Code compiled successfully!" as a fixed string, without running anything at
  // all - so it told every player their code had passed, including players
  // whose code did not even compile. Whether an answer is correct is the
  // server's call, and it arrives with the round summary.
  const runCodeTests = async () => {
    if (playerState.code.trim().length === 0) {
      setConsoleOutput(t('codeEmpty'));
      return;
    }
    if (pyodideStatus !== 'ready') {
      setConsoleOutput(t('pyodideLoading'));
      return;
    }

    // Take this run's lines from a subscription registered here as well as from
    // the shared ref. Both hold the same thing today; the local one removes any
    // dependence on when the effect that registers the shared callback last ran.
    let captured = [];
    setPyOnOutput((lines) => { pyOutputRef.current = lines; captured = lines; });

    clearPyOutput();
    setConsoleOutput(t('running'));
    await runPyCode(playerState.code);

    const printed = (captured.length ? captured : pyOutputRef.current)
      .filter(l => l.type === 'stdout' || l.type === 'stderr')
      .map(l => l.text)
      .join('\n');
    setConsoleOutput(printed.trim() || t('noOutput'));
  };

  // Submitting judges the code and reports the result to the server
  // (submitMyRound) — it does NOT force the phase transition itself. The
  // round keeps running until the server's own clock actually expires it
  // (matching how a real player watches opponents finish, then sees the
  // round summary) — a submitted player just becomes a spectator via
  // hasSubmittedThisRound (see the item-button disabled checks) until the
  // room-state poller picks up the next phase for everyone at once.
  const handleManualSubmit = () => {
    if (isGrading || playerState.hasSubmittedThisRound || playerState.eliminated) return;
    if (playerState.code.trim().length === 0) {
      notify(t('codeEmpty'), "error");
      return;
    }
    submitMyRound();
  };

  // Whether the DB task pool has actually arrived. The resume-match path has
  // to wait for this: restoring a room resolves that round's problem, and
  // resolving it before the pool exists silently falls back to a fixed
  // built-in task — which is how a resumed medium match ended up showing
  // "Valid Parentheses" above `def fib(n):` (seen on screen 2026-08-19).
  const tasksReady = (dbTasks.easy.length + dbTasks.medium.length + dbTasks.hard.length) > 0;

  return {
    tasksReady,
    dbTasks,
    getRound4Task,
    getPoolTask,
    submitMyRound,
    runCodeTests,
    handleManualSubmit,
    isGrading,
    consoleOutput
  };
}
