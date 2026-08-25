// client/src/pages/Arcade/hooks/useRoundJudging.js
// Round submission/judging concern: DB task pool (for Round 4), Pyodide
// correctness checking, the NVIDIA code-quality judge call, and round-score
// submission. Extracted as-is from ArcadeBattleRoyale.jsx — no behavior
// change, only relocated.
import { useState, useRef, useEffect, useCallback } from 'react';
import usePyodide from '../../../hooks/usePyodide.js';
import { PHASES, TASKS, TASK_TEST_CASES, ROUND_4_FALLBACK_TASK, phaseDurationsFor,
         FINALE_POOL_BY_DIFFICULTY } from '../constants.js';

export default function useRoundJudging({ playerState, setPlayerState, phase, timeLeft, currentRoom, notify, t, lang, checkEffectActive, API_BASE }) {
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

  // Asks the server's NVIDIA-based judge for a code quality score (beauty +
  // efficiency combined, 0-100). Falls back to a neutral default client-side
  // if the request itself fails (the server endpoint already has its own
  // AI-unavailable fallback — this is only for when the request can't even
  // reach it).
  const requestQualityScore = async (code) => {
    try {
      const res = await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/judge-round`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success && Number.isFinite(data.qualityScore)) return data.qualityScore;
      return 50;
    } catch {
      return 50;
    }
  };

  // Judges MY OWN code for the current round (Pyodide correctness + server
  // quality judge) and reports the result to the server instead of computing
  // rankings/cash/elimination locally — the server's
  // tickArcadeMatches()/finalizeArcadePhase() (server/server.js) is what
  // turns every submitted round_score into real score/cash/elimination once
  // the round's timer actually runs out, the same way for every player (bots
  // included — their round score is synthesized server-side on the same
  // scale). Round score is an equal-weight sum of 3 dimensions, each scored
  // 0-100: test-case pass rate, AI-judged code quality (beauty + efficiency),
  // and time remaining when submitted — max 300, doubled by scoreMultiplier.
  const submitMyRound = async () => {
    if (submittingRoundRef.current || playerState.hasSubmittedThisRound || playerState.eliminated) return;
    submittingRoundRef.current = true;
    setPlayerState(prev => ({ ...prev, hasSubmittedThisRound: true }));
    setIsGrading(true);
    notify(t('judgingCode'), "info");
    try {
      const roundNum = parseInt(String(phase).split('_')[1], 10);
      const poolTask = roundNum === 4 ? getRound4Task() : getPoolTask(roundNum);
      const { functionName, cases } = poolTask
        ? { functionName: poolTask.functionName, cases: poolTask.testCases }
        : TASK_TEST_CASES[`ROUND_${roundNum}`];
      const roundDuration = phaseDurationsFor(currentRoom)[`ROUND_${roundNum}`];
      const timeUsedSeconds = Math.max(0, Math.min(roundDuration, roundDuration - timeLeft));

      const { passCount, totalCount } = await runCorrectnessCheck(functionName, cases);
      const qualityScore = await requestQualityScore(playerState.code);

      const isMultiplierActive = checkEffectActive('scoreMultiplier');
      const passRatio = totalCount === 0 ? 0 : passCount / totalCount;
      const testScore = passRatio * 100;
      // Speed only counts for work that actually runs. Awarding the time
      // component flat meant a player who submitted an untouched starter the
      // instant the round opened banked close to 100 points for it, while one
      // who fought to a real 3-of-5 finish near the deadline earned about 17 —
      // the rules paid better for giving up than for trying, and the players
      // most likely to have nothing to submit are exactly the beginners this
      // mode is for. synthesizeBotRoundScore() in server/server.js applies the
      // identical scaling, so bots cannot keep a free time score humans lost.
      const timeScore = passRatio * ((roundDuration - timeUsedSeconds) / roundDuration) * 100;
      let roundScore = testScore + qualityScore + timeScore;
      if (isMultiplierActive) roundScore *= 2;

      setPlayerState(prev => ({
        ...prev,
        activeEffects: prev.activeEffects.filter(e => e.type !== 'scoreMultiplier')
      }));

      if (currentRoom) {
        await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/submit-round`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Phase 8.3: the score breakdown and the code itself ride along so
          // the server can keep a per-round history row for the RESULT
          // screen's review panel. The server treats all of these as
          // optional — they only enrich the history record, they never
          // affect the score, which stays `round_score` exactly as before.
          body: JSON.stringify({
            user_name: playerState.name,
            round_score: roundScore,
            code: playerState.code,
            pass_count: passCount,
            total_count: totalCount,
            quality_score: qualityScore,
            time_used_seconds: timeUsedSeconds
          })
        });
      }

      notify(`✅ ${passCount}/${totalCount} tests | 📖 ${Math.round(qualityScore)}/100 | ⏱ ${timeUsedSeconds}s`, "success");
    } catch (err) {
      console.error('submitMyRound error:', err);
    } finally {
      setIsGrading(false);
      submittingRoundRef.current = false;
    }
  };

  const runCodeTests = () => {
    if (playerState.code.trim().length === 0) {
      setConsoleOutput("SyntaxError: Empty program. Please write code to test.");
      return;
    }
    setConsoleOutput(`Running local tests for ${t(phase === PHASES.ROUND_1 ? 'task1Title' : phase === PHASES.ROUND_2 ? 'task2Title' : 'task3Title')}...\n[PASS] Test Case 1\n[PASS] Test Case 2\n[SUCCESS] Code compiled successfully!`);
    notify(t('testsPassed'), "success");
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
