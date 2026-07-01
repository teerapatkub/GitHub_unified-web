import React, { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import {
  Play,
  CheckCircle2,
  Terminal as TerminalIcon,
  MessageSquareCode,
  Trophy,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const API_BASE = "http://localhost:3001";
const PYODIDE_SCRIPT_ID = "mini-game-pyodide";
const PYODIDE_SCRIPT_URL = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js";

// Singleton: ป้องกัน loadPyodide() ถูกเรียกซ้ำเมื่อ component re-mount
// ซึ่งเป็นสาเหตุของ "WebAssembly.Memory(): could not allocate memory"
let _pyodideInstance = null;
let _pyodideLoading = null;

const parseJsonValue = (value, fallback = null) => {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const parseJsonArray = (value) => {
  const parsed = parseJsonValue(value, []);
  return Array.isArray(parsed) ? parsed : [];
};

const getTestConfig = (value) => {
  const parsed = parseJsonValue(value, null);
  if (Array.isArray(parsed)) {
    return {
      expected_format: "",
      rules: parsed.filter((item) => item.branch_key || item.crossroad),
      correctness: parsed,
      legacy: true,
    };
  }
  if (parsed && typeof parsed === "object") {
    return {
      expected_format: parsed.expected_format || "",
      rules: Array.isArray(parsed.rules) ? parsed.rules : [],
      correctness: Array.isArray(parsed.correctness) ? parsed.correctness : [],
      legacy: false,
    };
  }
  return { expected_format: "", rules: [], correctness: [], legacy: false };
};

const evaluateBranchRules = (rules, output) => {
  if (!rules || rules.length === 0) return null;

  const cleanOutput = output ? output.trim() : "";
  const matchNum = cleanOutput.match(/-?\d+(\.\d+)?/);
  const numericValue = matchNum ? parseFloat(matchNum[0]) : 0;

  for (const rule of rules) {
    try {
      let conditionStr = String(rule.condition || "");
      if (!conditionStr) continue;

      if (conditionStr.includes("value")) {
        conditionStr = conditionStr.replace(/value/g, JSON.stringify(cleanOutput));
      } else if (conditionStr.includes("float")) {
        conditionStr = conditionStr.replace(/float/g, String(numericValue));
      }

      if (eval(conditionStr)) {
        return rule.branch_key || rule.crossroad || "default";
      }
    } catch (e) {
      console.error("Error evaluating rule:", e, rule.condition);
    }
  }

  return null;
};

const normalizeOutput = (text = "") =>
  String(text || "")
    .trim()
    .replace(/\r/g, "")
    .replace(/\s+/g, " ");

const getVisibleDialogues = (rows = [], isCompleted = false, selectedBranchKey = "default") => {
  const activeBranchKey = selectedBranchKey || "default";
  const defaultPreSubmit = rows.filter((dialogue) =>
    dialogue.dialogue_phase !== "post_submit" && (dialogue.branch_key || "default") === "default"
  );
  const branchPreSubmit = rows.filter((dialogue) =>
    dialogue.dialogue_phase !== "post_submit" && (dialogue.branch_key || "default") === activeBranchKey
  );
  const defaultPostSubmit = rows.filter((dialogue) =>
    dialogue.dialogue_phase === "post_submit" && (dialogue.branch_key || "default") === "default"
  );
  const branchPostSubmit = rows.filter((dialogue) =>
    dialogue.dialogue_phase === "post_submit" && (dialogue.branch_key || "default") === activeBranchKey
  );

  const preSubmit = activeBranchKey !== "default" && branchPreSubmit.length > 0
    ? branchPreSubmit
    : defaultPreSubmit;
  const postSubmit = activeBranchKey !== "default" && branchPostSubmit.length > 0
    ? branchPostSubmit
    : defaultPostSubmit;

  return isCompleted ? [...preSubmit, ...postSubmit] : preSubmit;
};

const getAvailableBranchKeys = (subtopic) => {
  if (!subtopic) return new Set(["default"]);

  const keys = new Set(["default"]);
  (subtopic.dialogues || []).forEach((dialogue) => {
    keys.add(dialogue.branch_key || "default");
  });
  (subtopic.dialogue_choices || []).forEach((choice) => {
    keys.add(choice.branch_key || choice.next_branch_key || "default");
  });
  const testConfig = getTestConfig(subtopic.test_cases_json);
  testConfig.rules.forEach((rule) => {
    keys.add(rule.branch_key || rule.crossroad || "default");
  });
  testConfig.correctness.forEach((testCase) => {
    keys.add(testCase.branch_key || testCase.crossroad || "default");
  });
  (subtopic.dialogue_branches || []).forEach((branch) => {
    keys.add(branch.branch_key || "default");
  });
  return keys;
};

const getSafeBranchKey = (subtopic, branchKey = "default") => {
  const key = branchKey || "default";
  return getAvailableBranchKeys(subtopic).has(key) ? key : "default";
};

const getBranchMissionCopy = (subtopic, branchKey = "default") => {
  if (!subtopic) {
    return { title: "", hint: "" };
  }

  const copyBySubtopic = {
    101: {
      mood_good: {
        title: "PRINT: ตอบว่าเราพร้อมเรียน",
        hint: 'เขียน print("ฉันสบายดี") แล้วกด DONE เพื่อส่งคำตอบให้ Lumi',
      },
      mood_confused: {
        title: "PRINT: ขอให้ Lumi ช่วยอธิบาย",
        hint: 'เขียน print("ยังงงอยู่") แล้วกด DONE เพื่อบอก Lumi ว่ายังต้องการความช่วยเหลือ',
      },
    },
    102: {
      learn_example: {
        title: "PRINT: เรียนจากตัวอย่าง",
        hint: 'เขียน print("ขอตัวอย่าง") แล้ว Lumi จะยกตัวอย่างให้ดู',
      },
      learn_try: {
        title: "PRINT: ลองฝึกเอง",
        hint: 'เขียน print("ขอลองเอง") เพื่อเลือกฝึกด้วยตัวเอง',
      },
    },
    103: {
      ending_understood: {
        title: "PRINT: สรุปความเข้าใจ",
        hint: 'เขียน print("print ใช้แสดงข้อความ") เพื่อจบบทเรียนแบบเข้าใจแล้ว',
      },
      ending_review: {
        title: "PRINT: ทบทวนอีกครั้ง",
        hint: 'เขียน print("ขอทบทวนอีกครั้ง") เพื่อให้ Lumi สรุปซ้ำก่อนจบ',
      },
    },
  };

  return copyBySubtopic[subtopic.exercise_id]?.[branchKey] || {
    title: subtopic.title,
    hint: subtopic.hint,
  };
};

async function getPyodideInstance() {
  // คืน instance เดิมถ้ามีอยู่แล้ว — ป้องกัน WebAssembly OOM
  if (_pyodideInstance) return _pyodideInstance;

  // ถ้ากำลังโหลดอยู่ให้รอ Promise เดิม ไม่สร้างใหม่
  if (_pyodideLoading) return _pyodideLoading;

  _pyodideLoading = (async () => {
    // โหลด script ถ้ายังไม่มี
    if (typeof window.loadPyodide !== "function") {
      let script = document.getElementById(PYODIDE_SCRIPT_ID);
      if (!script) {
        script = document.createElement("script");
        script.id = PYODIDE_SCRIPT_ID;
        script.src = PYODIDE_SCRIPT_URL;
        script.async = true;
        document.head.appendChild(script);
      }

      await new Promise((resolve, reject) => {
        if (typeof window.loadPyodide === "function") { resolve(); return; }
        script.addEventListener("load", resolve, { once: true });
        script.addEventListener("error", () => reject(new Error("Unable to load Python runtime.")), { once: true });
      });
    }

    const instance = await window.loadPyodide();
    _pyodideInstance = instance;
    return instance;
  })();

  return _pyodideLoading;
}

export default function MiNi_Game({ lessonId, user, onUserRefresh, onNavigate }) {
  const params = useParams();
  const moduleId = Number(lessonId ?? params.lessonId ?? 1);

  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [code, setCode] = useState('print("Hello")');
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLines, setTerminalLines] = useState([]);
  const [rewardModal, setRewardModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSubtopicIndex, setCurrentSubtopicIndex] = useState(0);
  const [progressBySubtopic, setProgressBySubtopic] = useState({});
  const [pendingChoicesBySubtopic, setPendingChoicesBySubtopic] = useState({});
  const [pyodide, setPyodide] = useState(null);
  const [pyReady, setPyReady] = useState(false);
  const [pyError, setPyError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [displayedDialogueText, setDisplayedDialogueText] = useState("");
  const [programDialogue, setProgramDialogue] = useState(null);
  const [selectedBranchKey, setSelectedBranchKey] = useState("default");

  const terminalRef = useRef(null);
  const inputResolverRef = useRef(null);
  const runOutputRef = useRef("");
  const dialogueAudioRef = useRef(null);
  const outputTargetRef = useRef("terminal");
    // --- วางฟังก์ชัน runDoneChecks ตรงนี้ ---
  const runDoneChecks = async (storyOutput = "") => {
    if ((!pyodide || !pyReady) && pyError) {
      setProgramDialogue({ text: `Failed to load Python: ${pyError}` });
      return { ok: false, output: "", reply: null };
    }

    if (!pyodide || !pyReady || isRunning || !currentSubtopic) {
      setProgramDialogue({ text: "Python runtime is loading. Please try again in a moment." });
      return { ok: false, output: "", reply: null };
    }

    const testConfig = getTestConfig(currentSubtopic.test_cases_json);
    const correctnessCases = testConfig.correctness;
    
    if (correctnessCases.length === 0 && testConfig.rules.length === 0 && dialogueBranches.length === 0 && terminalLogic.length === 0) {
      setProgramDialogue({ text: "FAIL: No correctness tests found for this exercise." });
      return { ok: false, output: "", reply: null };
    }

    setTerminalLines(["--- Checking test cases ---"]);
    setIsRunning(true);

    try {
      const errors = validateCode();
      if (errors.length > 0) {
        const message = errors.map((item) => `Error: ${item}`).join("\n");
        setProgramDialogue({ text: message });
        errors.forEach((item) => appendTerminalLine(`Error: ${item}`));
        return { ok: false, output: "", reply: null };
      }

      let lastOutput = "";
      for (let index = 0; index < correctnessCases.length; index += 1) {
        const testCase = correctnessCases[index];
        const rawOutput = await runCodeForCheck(testCase.input ?? "");
        const actual = normalizeOutput(rawOutput);
        const expectedValues = Array.isArray(testCase.expected_any)
          ? testCase.expected_any
          : [testCase.expected ?? testCase.expected_output ?? ""];
        const expected = expectedValues.map((item) => normalizeOutput(String(item)));
        lastOutput = String(rawOutput || "").trim();

        if (expected.some((item) => item && actual.includes(item))) {
          appendTerminalLine(`PASS Test ${index + 1}`);
        } else {
          const message = [`FAIL Test ${index + 1}`, `Expected: ${expected.join(" OR ")}`, `Got: ${actual || "(no output)"}`].join("\n");
          setProgramDialogue({ text: message });
          appendTerminalLine(`FAIL Test ${index + 1}`);
          appendTerminalLine(`Expected: ${expected.join(" OR ")}`);
          appendTerminalLine(`Got: ${actual || "(no output)"}`);
          return { ok: false, output: lastOutput || "(no output)", reply: null };
        }
      }

      // ระบบกำหนด branch_key ที่แม่นยำ
      const branchKey = testConfig.rules.length > 0
        ? evaluateBranchRules(testConfig.rules, storyOutput || lastOutput)
        : (resolveDialogueBranch(storyOutput || lastOutput)?.branch_key || selectedBranchKey || "default");

      if (testConfig.rules.length > 0 && !branchKey) {
        const message = "FAIL: No branch rule matched the output.";
        setProgramDialogue({ text: message });
        appendTerminalLine(message);
        return { ok: false, output: storyOutput || lastOutput || "(no output)", reply: null };
      }

      const branch = { 
        branch_key: branchKey, 
        trigger_output: storyOutput || lastOutput, 
        is_correct: 1 
      };

      // อัปเดต selectedBranchKey และ mark subtopic ว่า completed ใน progressBySubtopic
      setSelectedBranchKey(branchKey);
      setProgressBySubtopic((prev) => ({
        ...prev,
        [currentSubtopic.exercise_id]: {
          ...(prev[currentSubtopic.exercise_id] || {}),
          exercise_id: currentSubtopic.exercise_id,
          completed_this_run: 1,
          is_completed: 1,
          selected_branch_key: branchKey,
        },
      }));

      appendTerminalLine(`PASS Branch: ${branch.branch_key}`);
      appendTerminalLine("Correct!");
      appendTerminalLine("--- All tests passed ---");
      
      return { ok: true, output: storyOutput || lastOutput || "(no output)", reply: null, branch };
    } catch (checkError) {
      const message = `System Error: ${checkError.message}`;
      setProgramDialogue({ text: message });
      appendTerminalLine(message);
      return { ok: false, output: "", reply: null };
    } finally {
      setIsRunning(false);
      setCurrentPrompt("");
      setCurrentInput("");
      inputResolverRef.current = null;
    }
  };
  const subtopics = useMemo(() => {
    if (!moduleData) return [];
    const list = Array.isArray(moduleData.subtopics) && moduleData.subtopics.length > 0
      ? [...moduleData.subtopics]   // clone เพื่อไม่ mutate original
      : [moduleData];

    // ถ้ายังไม่มี subtopic ที่ exercise_order = "end" ให้สร้างจาก end_dialogues
    const hasEnd = list.some(s => String(s.exercise_order ?? "") === "end");
    if (!hasEnd) {
      // ลองหา end dialogues จาก moduleData.end_dialogues (API ส่งมา)
      // หรือ moduleData.dialogues ที่มี exercise_order = "end" และ exercise_id = null
      const allDialogues = moduleData.end_dialogues
        ?? (Array.isArray(moduleData.dialogues)
            ? moduleData.dialogues.filter(d => String(d.exercise_order ?? "") === "end" && !d.exercise_id)
            : []);

      if (allDialogues.length > 0) {
        list.push({
          exercise_id: -1,
          exercise_order: "end",
          title: "จบบทเรียน",
          starter_code: "",
          test_cases_json: "{}",
          dialogues: allDialogues,
        });
      }
    }

    return list;
  }, [moduleData]);

  const currentSubtopic = subtopics[currentSubtopicIndex] ?? null;
  const getSubtopicIndexForBranch = (branchKey = "") => {
    const key = String(branchKey || "").trim();
    if (!key || key === "default") return -1;
    return subtopics.findIndex((subtopic) =>
      String(subtopic.exercise_order ?? subtopic.order_index ?? subtopic.branch_key ?? "") === key
    );
  };
  const currentProgress = currentSubtopic
    ? progressBySubtopic[currentSubtopic.exercise_id]
    : null;
// เปลี่ยนจากการเช็ค property ที่ไม่มีอยู่ ให้เช็คที่ตัว Object ของ progress เอง
// ใน MiNi_Game.jsx
useEffect(() => {
  console.log("Progress Map Object:", progressBySubtopic);
  console.log("Current Subtopic ID:", currentSubtopic?.exercise_id);
}, [progressBySubtopic, currentSubtopic]);

const isCurrentSubtopicCompleted = useMemo(() => {
  if (!currentSubtopic || !currentSubtopic.exercise_id) return false;
  
  // บังคับเปลี่ยนเป็น String ทั้งคู่ เพื่อให้ตรงกับ Key ที่เก็บไว้ใน progressMap
  const currentId = String(currentSubtopic.exercise_id);
  return !!progressBySubtopic[currentId];
}, [currentSubtopic, progressBySubtopic]);

  const inheritedBranchKey = useMemo(() => {
    for (let index = currentSubtopicIndex - 1; index >= 0; index -= 1) {
      const previousSubtopic = subtopics[index];
      const previousBranchKey = progressBySubtopic[previousSubtopic?.exercise_id]?.selected_branch_key;
      if (previousBranchKey) return previousBranchKey;
    }
    return "default";
  }, [currentSubtopicIndex, progressBySubtopic, subtopics]);
  const pendingChoice = currentSubtopic
    ? pendingChoicesBySubtopic[currentSubtopic.exercise_id]
    : null;
  const dialogues = useMemo(() => {
    const rows = currentSubtopic?.dialogues ?? [];
    return getVisibleDialogues(rows, isCurrentSubtopicCompleted, selectedBranchKey);
  }, [currentSubtopic, isCurrentSubtopicCompleted, selectedBranchKey]);
  const currentMissionCopy = useMemo(
    () => getBranchMissionCopy(currentSubtopic, selectedBranchKey),
    [currentSubtopic, selectedBranchKey]
  );
  const dialogueBranches = currentSubtopic?.dialogue_branches ?? [];
  const terminalLogic = currentSubtopic?.terminal_logic ?? [];
  const currentDialogue = dialogues[dialogueIndex] ?? null;
  const currentDialogueChoices = programDialogue ? [] : currentDialogue?.choices ?? [];
  const currentDialogueText = programDialogue?.text ?? currentDialogue?.dialogue_text ?? "No dialogue found for this module yet.";
  const isProgramDialogue = Boolean(programDialogue);
  const isDialogueTyping = !isProgramDialogue && displayedDialogueText.length < currentDialogueText.length;
  const sceneBackgroundImage = currentDialogue?.bg_image_url || currentSubtopic?.scene_background_image || moduleData?.scene_background_image || "";
  const sceneBackgroundUrl = sceneBackgroundImage
    ? sceneBackgroundImage.startsWith("http") || sceneBackgroundImage.startsWith("/")
      ? sceneBackgroundImage
      : `${API_BASE}/uploads/${sceneBackgroundImage}`
    : "/data_MiNiGame/cat.jpg";
  const completedSubtopicCount = subtopics.filter((subtopic) =>
    Boolean(progressBySubtopic[subtopic.exercise_id]?.completed_this_run)
  ).length;
  const branchSubtopicIndex = getSubtopicIndexForBranch(selectedBranchKey);
  const nextSubtopicIndex = branchSubtopicIndex >= 0
    ? branchSubtopicIndex
    : currentSubtopicIndex + 1 < subtopics.length
      ? currentSubtopicIndex + 1
      : -1;
  const isAtLastDialogue = dialogueIndex >= Math.max(dialogues.length - 1, 0);
  const canSubmit = Boolean(
    currentSubtopic
    && (isProgramDialogue || isAtLastDialogue)
    && currentDialogueChoices.length === 0
  );

  const getTerminalLineClassName = (line = "") => {
    if (line.startsWith("PASS") || line.startsWith("Correct") || line.startsWith("Output:")) {
      return "text-emerald-400";
    }
    if (
      line.startsWith("FAIL") ||
      line.startsWith("Error:") ||
      line.startsWith("System Error:") ||
      line.startsWith("Submit Error:") ||
      line.startsWith("Hint:")
    ) {
      return "text-red-400";
    }
    if (
      line.startsWith("Expected:") ||
      line.startsWith("Got:") ||
      line.startsWith("Failed to load")
    ) {
      return "text-yellow-400";
    }
    if (line.startsWith("---") || line.startsWith(">")) {
      return "text-blue-400 font-semibold";
    }
    return "text-gray-300";
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines, showTerminal]);

  useEffect(() => {
    setDisplayedDialogueText(isProgramDialogue ? currentDialogueText : "");

    if (showTerminal || isProgramDialogue) return undefined;

    if (!dialogueAudioRef.current) {
      dialogueAudioRef.current = new Audio("/data_MiNiGame/universfield-morse-code-131798.mp3");
      dialogueAudioRef.current.loop = true;
      dialogueAudioRef.current.volume = 0.22;
    }

    const audio = dialogueAudioRef.current;
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Browser autoplay policy may block audio until the user clicks once.
    });

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setDisplayedDialogueText(currentDialogueText.slice(0, index));

      if (index >= currentDialogueText.length) {
        window.clearInterval(timer);
        audio.pause();
        audio.currentTime = 0;
      }
    }, 28);

    return () => {
      window.clearInterval(timer);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [currentDialogueText, showTerminal, isProgramDialogue]);

  const appendTerminalLine = (text) => {
    setTerminalLines((prev) => [...prev, text]);
  };

  useEffect(() => {
    const initPyodide = async () => {
      try {
        const instance = await getPyodideInstance();

        // ตั้ง stdout/stderr ทุกครั้งที่ component mount ใหม่
        // (instance เดิม แต่ callback ต้องชี้ไปที่ state ของ component ปัจจุบัน)
        instance.setStdout({
          batched: (text) => {
            const value = String(text ?? "");
            if (!value) return;
            runOutputRef.current += value;
            if (outputTargetRef.current === "story") {
              setProgramDialogue((prev) => prev ? { text: `${prev.text || ""}${value}` } : prev);
            }
            if (value.trim()) appendTerminalLine(value.replace(/\n$/, ""));
          },
        });
        instance.setStderr({
          batched: (text) => appendTerminalLine(`Error: ${String(text ?? "").trim()}`),
        });

        setPyodide(instance);
        setPyReady(true);
        setPyError("");
      } catch (runtimeError) {
        setPyError(runtimeError.message);
        appendTerminalLine(`Failed to load Python: ${runtimeError.message}`);
      }
    };

    window.miniGameRequestInputFromJS = (promptText = "") => {
      setCurrentPrompt(String(promptText || ""));
      setCurrentInput("");
      return new Promise((resolve) => {
        inputResolverRef.current = resolve;
      });
    };

    initPyodide();

    return () => {
      if (window.miniGameRequestInputFromJS) {
        delete window.miniGameRequestInputFromJS;
      }
    };
  }, []);

  // Memoize userId to prevent infinite loops from unstable prop references
  const userId = useMemo(() => {
    return user?.isGuest ? null : (user?.user_id ?? null);
  }, [user?.isGuest, user?.user_id]);

// === ยุบรวมเหลือชุดเดียว ดึงข้อมูลครบจบในหนึ่งเดียว ไม่ยิงซ้ำซ้อน 100% ===
useEffect(() => {
    if (!moduleId) return;

    let active = true;

const loadGameData = async () => {
  try {
    setLoading(true);
    setError(null);

    // 1. ดึงข้อมูลโครงสร้างหลักจากโมดูล
    const res = await fetch(`${API_BASE}/api/mini-game/modules/${moduleId}`);
    if (!res.ok) throw new Error("ไม่สามารถโหลดโครงสร้างมินิเกมได้");
    const data = await res.json();

    if (!active) return;

    // 1b. ดึง end dialogues (ถ้ามี)
    try {
      const endRes = await fetch(`${API_BASE}/api/mini-game/modules/${moduleId}/end-dialogues`);
      if (endRes.ok) {
        const endDialogues = await endRes.json();
        if (Array.isArray(endDialogues) && endDialogues.length > 0) {
          data.end_dialogues = endDialogues;
        }
      }
    } catch (e) {
      // endpoint นี้ optional
    }

    setModuleData(data);

    // 2. ดึงข้อมูล Progress และ Map ข้อมูลด้วย String key เพื่อป้องกันปัญหา Type Mismatch
    let progressMap = {};
    if (userId) {
      try {
        const progRes = await fetch(`${API_BASE}/api/mini-game/modules/${moduleId}/progress/${userId}`);
        if (progRes.ok) {
          const progressRows = await progRes.json();
          
          // ปรับปรุง: บังคับใช้ String เป็น Key เสมอ
          progressMap = (Array.isArray(progressRows) ? progressRows : [progressRows]).reduce((acc, item) => {
            acc[String(item.exercise_id)] = item;
            return acc;
          }, {});
          
          setProgressBySubtopic(progressMap);
        }
      } catch (e) {
        console.warn("ไม่สามารถโหลด Progress ได้");
      }
    }

    // 3. กำหนดค่าเริ่มต้นของ Code
    const subtopicList = Array.isArray(data.subtopics) ? data.subtopics : [data];
    const firstSubtopic = subtopicList[0];

    // ปรับปรุง: ตรวจสอบ Key ด้วย String
    const savedProgress = firstSubtopic ? progressMap[String(firstSubtopic.exercise_id)] : null;
    setCode(savedProgress?.submitted_code || firstSubtopic?.starter_code || 'print("Hello")');

  } catch (err) {
    if (active) setError(err.message);
  } finally {
    if (active) setLoading(false);
  }
};

    loadGameData();
    return () => { active = false; };
  }, [moduleId, userId]);
  
  useEffect(() => {
    if (!currentSubtopic) return;
    const progress = progressBySubtopic[currentSubtopic.exercise_id];
    setCode(progress?.submitted_code || currentSubtopic.starter_code || 'print("Hello")');
    setDialogueIndex(0);
    setShowTerminal(false);
    setTerminalLines([]);
    setCurrentInput("");
    setCurrentPrompt("");
    setProgramDialogue(null);
    inputResolverRef.current = null;
    // Reset branch key เป็น progress ที่บันทึกไว้ หรือ default
    setSelectedBranchKey(progress?.selected_branch_key || "default");
  }, [currentSubtopic?.exercise_id]);

  const requiredSyntax = useMemo(
    () => parseJsonArray(currentSubtopic?.required_syntax_json),
    [currentSubtopic?.required_syntax_json]
  );

  const requiredVars = useMemo(
    () => parseJsonArray(currentSubtopic?.required_vars_json),
    [currentSubtopic?.required_vars_json]
  );

  const validateCode = () => {
    const errors = [];

    requiredSyntax.forEach((syntaxItem) => {
      if (!code.includes(String(syntaxItem))) {
        errors.push(`Missing syntax: ${syntaxItem}`);
      }
    });

    requiredVars.forEach((varName) => {
      const regex = new RegExp(`\\b${String(varName)}\\b`);
      if (!regex.test(code)) {
        errors.push(`Missing variable: ${varName}`);
      }
    });

    const openBrackets = (code.match(/\(/g) || []).length;
    const closeBrackets = (code.match(/\)/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push("SyntaxError: brackets are not balanced");
    }

    const doubleQuotes = (code.match(/"/g) || []).length;
    const singleQuotes = (code.match(/'/g) || []).length;
    if (doubleQuotes % 2 !== 0 || singleQuotes % 2 !== 0) {
      errors.push("SyntaxError: quotes are not balanced");
    }

    return errors;
  };

  const resolveTerminalReply = () => {
    const output = runOutputRef.current.trim() || "(no output)";
    const matchedLogic = terminalLogic.find((item) => output.includes(item.trigger_input));
    return {
      output,
      reply: matchedLogic?.reply_text || null,
    };
  };

  const resolveDialogueBranch = (output) => {
    const normalizedOutput = normalizeOutput(output);
    const matchedBranch = dialogueBranches.find((branch) => {
      const trigger = normalizeOutput(branch.trigger_output);
      return trigger && normalizedOutput.includes(trigger);
    });

    if (matchedBranch) return matchedBranch;

    const matchedLogic = terminalLogic.find((item) => {
      const trigger = normalizeOutput(item.trigger_input);
      return trigger && normalizedOutput.includes(trigger);
    });

    if (!matchedLogic) return null;

    const trigger = normalizeOutput(matchedLogic.trigger_input);
    const branchKey = trigger.includes("ไม่ได้") || trigger.includes("เย็นชา") ? "cold" : "friendly";
    return {
      branch_key: branchKey,
      trigger_output: matchedLogic.trigger_input,
      is_correct: 1,
      feedback_text: matchedLogic.reply_text,
    };
  };

  const runCodeForCheck = async (testInput = "") => {
    const encoded = btoa(unescape(encodeURIComponent(code)));
    const script = `
import sys, builtins, base64, textwrap
from io import StringIO

_saved_stdout = sys.stdout
_saved_stdin = sys.stdin
_saved_input = builtins.input

def sync_input(prompt=""):
    return sys.stdin.readline().rstrip('\\n')

builtins.input = sync_input
sys.stdin = StringIO(${JSON.stringify(String(testInput ?? ""))})
sys.stdout = StringIO()

try:
    source = textwrap.dedent(base64.b64decode("${encoded}").decode("utf-8")).strip()
    exec(source, {"input": sync_input, "__builtins__": builtins}, {})
    output = sys.stdout.getvalue()
except Exception as e:
    output = "Error: " + str(e)
finally:
    sys.stdout = _saved_stdout
    sys.stdin = _saved_stdin
    builtins.input = _saved_input

output.strip()
`;

    return pyodide.runPythonAsync(script);
  };

  const runCodeInTerminal = async () => {
    if (isRunning) {
      return { ok: false, output: "", reply: null };
    }

    if (!pyodide || !pyReady) {
      setShowTerminal(true);
      setTerminalLines([
        pyError
          ? `Failed to load Python: ${pyError}`
          : "Python runtime is loading. Please try again in a moment.",
      ]);
      return { ok: false, output: "", reply: null };
    }

    outputTargetRef.current = "terminal";
    setShowTerminal(true);
    setTerminalLines(["$ python main.py"]);
    setIsRunning(true);
    runOutputRef.current = "";

    try {
      const processedCode = code.replace(/\binput\(/g, "await input(");
      await pyodide.runPythonAsync(`
import builtins
from js import miniGameRequestInputFromJS

async def input(prompt=""):
    return await miniGameRequestInputFromJS(prompt)

builtins.input = input

async def __main__():
${processedCode.split("\n").map((line) => `    ${line}`).join("\n")}

await __main__()
`);

      const { output, reply } = resolveTerminalReply();
      appendTerminalLine("--- Program finished ---");
      return { ok: true, output, reply };
    } catch (runError) {
      appendTerminalLine(`Error: ${runError.message}`);
      return { ok: false, output: "", reply: null };
    } finally {
      setIsRunning(false);
      setCurrentPrompt("");
      setCurrentInput("");
      inputResolverRef.current = null;
    }
  };

  const runCodeInStory = async () => {
    if (isRunning) {
      return { ok: false, output: "", reply: null };
    }

    if (!pyodide || !pyReady) {
      setProgramDialogue({
        text: pyError ? `Failed to load Python: ${pyError}` : "Python runtime is loading. Please try again in a moment.",
      });
      return { ok: false, output: "", reply: null };
    }

    outputTargetRef.current = "story";
    setShowTerminal(false);
    setProgramDialogue({ text: "" });
    setIsRunning(true);
    runOutputRef.current = "";

    try {
      const processedCode = code.replace(/\binput\(/g, "await input(");
      await pyodide.runPythonAsync(`
import builtins
from js import miniGameRequestInputFromJS

async def input(prompt=""):
    return await miniGameRequestInputFromJS(prompt)

builtins.input = input

async def __main__():
${processedCode.split("\n").map((line) => `    ${line}`).join("\n")}

await __main__()
`);

      const output = runOutputRef.current.trim();
      setProgramDialogue((prev) => {
        const existing = String(prev?.text || "").trim();
        return { text: existing || output || "(no output)" };
      });
      return { ok: true, output: output || "(no output)", reply: null };
    } catch (runError) {
      const message = `Error: ${runError.message}`;
      setProgramDialogue({ text: message });
      return { ok: false, output: message, reply: null };
    } finally {
      setIsRunning(false);
      setCurrentPrompt("");
      setCurrentInput("");
      inputResolverRef.current = null;
    }
  };

  const handleRunOnly = async () => {
    await runCodeInTerminal();
  };

  const handleInputKeyDown = (event) => {
    if (event.key !== "Enter" || !inputResolverRef.current) return;

    const value = currentInput;
    appendTerminalLine(`${currentPrompt}${value}`);
    if (outputTargetRef.current === "story") {
      setProgramDialogue((prev) => prev ? { text: `${prev.text || ""}${currentPrompt}${value}\n` } : prev);
    }
    inputResolverRef.current(value);
    inputResolverRef.current = null;
    setCurrentInput("");
    setCurrentPrompt("");
  };

  const handleDialogueChoice = async (choice) => {
    if (!currentSubtopic || !currentDialogue) return;

    if (isDialogueTyping) {
      setDisplayedDialogueText(currentDialogueText);
      return;
    }

    const nextBranchKey = choice.branch_key || choice.next_branch_key || selectedBranchKey || "default";
    const previousHistory = parseJsonArray(
      pendingChoice?.choice_history_json || currentProgress?.choice_history_json
    );
    const nextChoiceHistory = [
      ...previousHistory,
      {
        choice_id: choice.choice_id,
        dialogue_id: currentDialogue.dialogue_id,
        step_index: currentDialogue.step_index,
        choice_text: choice.choice_text,
        branch_key: nextBranchKey,
        ending_key: choice.ending_key || null,
      },
    ];
    const nextChoiceHistoryJson = JSON.stringify(nextChoiceHistory);
    const nextEndingKey = choice.ending_key || pendingChoice?.ending_key || currentProgress?.ending_key || null;

    setPendingChoicesBySubtopic((prev) => ({
      ...prev,
      [currentSubtopic.exercise_id]: {
        branch_key: nextBranchKey,
        choice_history_json: nextChoiceHistoryJson,
        ending_key: nextEndingKey,
      },
    }));
    setProgressBySubtopic((prev) => ({
      ...prev,
      [currentSubtopic.exercise_id]: {
        ...(prev[currentSubtopic.exercise_id] || {}),
        exercise_id: currentSubtopic.exercise_id,
        selected_branch_key: nextBranchKey,
        choice_history_json: nextChoiceHistoryJson,
        ending_key: nextEndingKey,
        last_terminal_input: choice.choice_text,
        last_terminal_reply: choice.feedback_text || null,
      },
    }));

    if (user?.user_id && !user?.isGuest) {
      fetch(`${API_BASE}/api/mini-game/modules/${moduleId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mini_game_module_id: currentSubtopic.exercise_id,
          exercise_id: currentSubtopic.exercise_id,
          user_id: user.user_id,
          submitted_code: code,
          is_completed: isCurrentSubtopicCompleted,
          score: currentProgress?.score || 0,
          last_terminal_input: choice.choice_text,
          last_terminal_reply: choice.feedback_text || null,
          selected_branch_key: nextBranchKey,
          last_output: currentProgress?.last_output || null,
          choice_history_json: nextChoiceHistoryJson,
          ending_key: nextEndingKey,
        }),
      }).catch(() => {
        // Dialogue choices still work locally if the progress autosave fails.
      });
    }

    const nextDialogues = getVisibleDialogues(
      currentSubtopic.dialogues || [],
      isCurrentSubtopicCompleted,
      nextBranchKey
    );
    const explicitNextIndex = nextDialogues.findIndex(
      (dialogue) =>
        dialogue.dialogue_phase === choice.next_dialogue_phase
        && Number(dialogue.step_index) === Number(choice.next_step_index)
    );
    const branchStartIndex = nextDialogues.findIndex(
      (dialogue) =>
        (dialogue.branch_key || "default") === nextBranchKey
        && dialogue.dialogue_id !== currentDialogue.dialogue_id
    );

    setDialogueIndex(
      explicitNextIndex >= 0
        ? explicitNextIndex
        : branchStartIndex >= 0
          ? branchStartIndex
          : Math.min(dialogueIndex + 1, Math.max(nextDialogues.length - 1, 0))
    );
  };

  // เพิ่มเข้าไปในรายการ useState ของคุณ
const [isDoneSubmitted, setIsDoneSubmitted] = useState(false);
const handleSubmit = async () => {
  if (!currentSubtopic || isSubmitting || isRunning || !canSubmit) return;

  setIsSubmitting(true);
  setProgramDialogue(null);

  const storyRun = await runCodeInStory();
  if (!storyRun.ok) {
    setIsSubmitting(false);
    return;
  }

  const execution = await runDoneChecks(storyRun.output);
  if (!execution.ok) {
    setIsSubmitting(false);
    return;
  }

  const { output, reply, branch } = execution;
  const nextBranchKey = branch?.branch_key || selectedBranchKey || "default";
  const isCompleted = true;

  const currentExerciseId = currentSubtopic?.exercise_id || currentSubtopic?.id;
  const currentUserId = user?.user_id || user?.id || 1;

  try {
    const response = await fetch(`${API_BASE}/api/mini-game/modules/${moduleId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mini_game_module_id: currentExerciseId,
        exercise_id: currentExerciseId,
        user_id: currentUserId,
        submitted_code: code,
        is_completed: isCompleted,
        score: 100,
        last_terminal_input: output,
        last_terminal_reply: reply,
        selected_branch_key: nextBranchKey,
        last_output: output,
        choice_history_json: pendingChoice?.choice_history_json || currentProgress?.choice_history_json || null,
        ending_key: pendingChoice?.ending_key || currentProgress?.ending_key || null,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.error || "Unable to save MiNi Game progress.");
    }

    setIsDoneSubmitted(true);

    if (result?.user) {
      localStorage.setItem("user", JSON.stringify({ ...user, ...result.user }));
      onUserRefresh?.({ ...user, ...result.user });
    }

    setTerminalLines((prev) => [
      ...prev,
      "Correct!",
      currentSubtopic.success_message || "Subtopic completed successfully.",
    ]);

    setProgressBySubtopic((prev) => ({
      ...prev,
      [currentSubtopic.exercise_id]: {
        ...(prev[currentSubtopic.exercise_id] || {}),
        exercise_id: currentSubtopic.exercise_id,
        submitted_code: code,
        is_completed: 1,
        completed_this_run: 1,
        selected_branch_key: nextBranchKey,
        last_output: output,
        choice_history_json: pendingChoice?.choice_history_json || currentProgress?.choice_history_json || null,
        ending_key: pendingChoice?.ending_key || currentProgress?.ending_key || null,
      },
    }));

    // ระบบจะอัปเดต State ทำให้ปุ่ม "Next" ปรากฏขึ้นมาโดยอัตโนมัติ 
    // โดยไม่ต้องใช้ setTimeout เพื่อข้ามฉากเองครับ

    if (result?.is_module_completed) {
      setRewardModal({
        xp: result?.xp_reward ?? moduleData.reward_xp ?? 0,
        currency: result?.currency_reward ?? moduleData.reward_coins ?? 0,
      });
    }
  } catch (submitError) {
    setTerminalLines((prev) => [...prev, `Submit Error: ${submitError.message}`]);
    // ในกรณีที่ error ก็จะหยุดอยู่ที่หน้านี้เพื่อให้ผู้เล่นแก้ไข ไม่มีการข้ามฉากอัตโนมัติเช่นกัน[cite: 1]
  } finally {
    setIsSubmitting(false);
  }
};

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl bg-white/90 px-6 py-5 shadow-sm">
          <Loader2 size={20} className="animate-spin text-blue-600" />
          <span className="font-semibold text-slate-700">Loading MiNi Game module...</span>
        </div>
      </div>
    );
  }

  if (error || !moduleData) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl bg-white/90 p-10 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Unable to load MiNi Game</h2>
        <p className="mt-3 text-slate-600">{error || "Module data not found."}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-[1520px] flex-col p-3 bg-slate-50 font-sans relative">
      <div className="mb-2 flex items-center justify-between rounded-xl border-b bg-white px-4 py-2 shadow-sm">
        <button
          onClick={() => onNavigate?.("exercise", moduleId)}
          className="flex items-center text-sm font-bold text-slate-500 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft size={16} className="mr-2" /> Back
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-xl">
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-[320px_1fr]">
          <aside className="hidden border-r bg-slate-50/50 p-6 lg:block">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
              ด่านปัจจุบัน
            </span>
            <h1 className="mt-2 text-2xl font-black text-slate-900 italic underline decoration-indigo-200">
              {currentMissionCopy.title || moduleData.title}
            </h1>
            <div className="mt-8 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Hint</p>
              <p className="mt-2 text-sm font-medium text-slate-600">
                {currentMissionCopy.hint || "Write code that matches this subtopic objective."}
              </p>
            </div>
                        {isCurrentSubtopicCompleted ? (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500">✅ ผ่านแล้ว</p>
                <div className="mt-3 flex gap-3">
                  <div className="flex-1 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-center">
                    <p className="text-[9px] font-bold uppercase text-amber-400">XP ที่ได้</p>
                    <p className="text-base font-black text-amber-600">+{currentProgress?.xp_reward ?? currentSubtopic?.reward_xp ?? 0}</p>
                  </div>
                  <div className="flex-1 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 text-center">
                    <p className="text-[9px] font-bold uppercase text-emerald-400">Coins ที่ได้</p>
                    <p className="text-base font-black text-emerald-600">+{currentProgress?.currency_reward ?? currentSubtopic?.reward_coins ?? 0}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">⏳ ยังไม่ผ่าน</p>
                <div className="mt-3 flex gap-3">
                  <div className="flex-1 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-center">
                    <p className="text-[9px] font-bold uppercase text-amber-400">XP</p>
                    <p className="text-base font-black text-amber-500">{currentSubtopic?.reward_xp ?? 0}</p>
                  </div>
                  <div className="flex-1 rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 text-center">
                    <p className="text-[9px] font-bold uppercase text-slate-400">Coins</p>
                    <p className="text-base font-black text-slate-500">{currentSubtopic?.reward_coins ?? 0}</p>
                  </div>
                </div>
              </div>
            )}
          </aside>

          <section className="relative flex flex-col overflow-hidden bg-white">
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  main.py
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleRunOnly}
                    disabled={isRunning}
                    className="flex items-center gap-2 rounded-xl border bg-white px-4 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Play size={12} className="text-emerald-500" />
                    RUN
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || isRunning || !canSubmit}
                    title={
                      isCurrentSubtopicCompleted
                        ? "This subtopic is already complete."
                        : !canSubmit
                          ? "Continue the dialogue to unlock submit."
                          : "Submit this subtopic."
                    }
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 size={12} />
                    {isCurrentSubtopicCompleted ? "DONE AGAIN" : "DONE"}
                  </button>
                </div>
              </div>
              <Editor
                height="100%"
                defaultLanguage="python"
                theme="light"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{ fontSize: 16, minimap: { enabled: false } }}
              />
            </div>

            <div className="relative flex h-[360px] flex-col justify-end overflow-hidden border-t border-slate-100 bg-slate-900 p-10">
              {!showTerminal ? (
                <>
                  <img
                    src={sceneBackgroundUrl}
                    alt="Scene background"
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(event) => {
                      if (!event.currentTarget.dataset.fallback) {
                        event.currentTarget.dataset.fallback = "1";
                        event.currentTarget.src = "/data_MiNiGame/cat.jpg";
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-slate-900/5 to-slate-950/35" />
                </>
              ) : null}

              <div className="absolute left-8 top-6 z-30">
                <button
                  onClick={() => setShowTerminal((value) => !value)}
                  className={`flex items-center gap-2 rounded-full px-5 py-2 text-[10px] font-black uppercase shadow-md transition-all ${
                    showTerminal
                      ? "bg-slate-900 text-white"
                      : "border border-indigo-100 bg-white text-indigo-600"
                  }`}
                >
                  {showTerminal ? <MessageSquareCode size={14} /> : <TerminalIcon size={14} />}
                  {showTerminal ? "Story Mode" : "View Terminal"}
                </button>
              </div>

              {showTerminal ? (
                <div className="h-full w-full pt-16">
                  <div className="flex h-full flex-col bg-[#070d18]">
                    <div className="flex items-center gap-2 border-b border-gray-800/50 bg-gray-900/30 px-4 py-1.5">
                      <TerminalIcon size={12} className="text-gray-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Terminal
                      </span>
                    </div>
                    

                    <div ref={terminalRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                      {terminalLines.length === 0 ? (
                        <p className="text-gray-500">Run your code to see output here.</p>
                      ) : (
                        terminalLines.map((line, index) => (
                          <div
                            key={`${line}-${index}`}
                            className={`mb-0.5 leading-snug ${getTerminalLineClassName(line)}`}
                          >
                            {line}
                          </div>
                        ))
                      )}
                      {inputResolverRef.current ? (
                        <div className="mt-1 flex items-center text-blue-300">
                          <span>{currentPrompt}</span>
                          <input
                            autoFocus
                            value={currentInput}
                            onChange={(event) => setCurrentInput(event.target.value)}
                            onKeyDown={handleInputKeyDown}
                            className="min-w-0 flex-1 bg-transparent text-white outline-none"
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
<div className="relative z-20 flex w-full items-end gap-6 rounded-3xl border border-white/70 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
  
  {/* ส่วนเนื้อหาข้อความ */}
  <div className="flex-1 space-y-4">
    {!isProgramDialogue && (
      <div className="absolute -top-3 left-8 rounded-lg bg-pink-500 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-md">
        {currentDialogue?.speaker === "user" ? "You" : currentDialogue?.speaker === "system" ? "System" : "Lumi"}
      </div>
    )}

    <div className="text-xl font-medium leading-relaxed text-slate-700 min-h-[80px]">
      {isProgramDialogue ? currentDialogueText : displayedDialogueText}
      {(isDialogueTyping || isRunning) && (
        <span className="animate-pulse text-indigo-500 ml-1">|</span>
      )}
    </div>

    {/* Input Section */}
    {inputResolverRef.current && !showTerminal && (
      <div className="flex items-center gap-2 rounded-2xl border border-indigo-100 bg-slate-50 px-6 py-3 text-base text-slate-800">
        <span className="font-bold text-indigo-600">{currentPrompt}</span>
        <input
          autoFocus
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          className="min-w-0 flex-1 bg-transparent font-mono outline-none"
        />
      </div>
    )}

    {/* Choices Section */}
    {!isDialogueTyping && currentDialogueChoices.length > 0 && (
      <div className="grid gap-2 sm:grid-cols-2">
        {currentDialogueChoices.map((choice) => (
          <button
            key={choice.choice_id}
            onClick={() => handleDialogueChoice(choice)}
            className="rounded-xl border border-indigo-100 bg-indigo-50 px-6 py-2 text-left text-sm font-bold text-indigo-700 transition-all hover:bg-indigo-100 active:scale-[0.98]"
          >
            {choice.choice_text}
          </button>
        ))}
      </div>
    )}

    {/* ส่วนปุ่ม Action */}
    <div className="flex gap-3">
      {/* 1. ปุ่ม Next Dialogue */}
      {!isProgramDialogue && dialogueIndex < dialogues.length - 1 && currentDialogueChoices.length === 0 && (
        <button
          onClick={() => isDialogueTyping ? setDisplayedDialogueText(currentDialogueText) : setDialogueIndex(prev => prev + 1)}
          className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-indigo-700"
        >
          Next Dialogue
        </button>
      )}

      {/* 2. ปุ่ม ไปด่านถัดไป */}
      {isDoneSubmitted && nextSubtopicIndex >= 0 && (
        <button
          onClick={() => { 
            setProgramDialogue(null); 
            setCurrentSubtopicIndex(nextSubtopicIndex); 
            setIsDoneSubmitted(false); 
          }}
          className="rounded-xl bg-emerald-600 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-emerald-700"
        >
          ไปด่านถัดไป →
        </button>
      )}
    </div>
  </div>

  {/* ส่วนรูป NPC */}
  {!isProgramDialogue && currentDialogue?.speaker !== "user" && currentDialogue?.speaker !== "system" && (
    <div className="hidden h-[140px] w-[140px] flex-shrink-0 lg:flex items-end justify-center">
      <img
        src={`${(currentDialogue?.avatar_asset_url || "/data_MiNiGame/NPC_lumi").replace(/\/$/, "")}/${(currentDialogue?.avatar_asset_url?.split("/").pop() || "npc_lumi").replace("NPC_", "").toLowerCase()}_${currentDialogue?.emotion || "smile"}.png`}
        className="h-full w-full object-contain object-bottom"
        alt="NPC Avatar"
      />
    </div>
  )}
</div>
              )}
            </div>
          </section>
        </div>
      </div>

      {rewardModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
          <div className="w-full max-w-sm scale-110 rounded-[40px] bg-white p-10 text-center shadow-2xl">
            <Trophy size={48} className="mx-auto mb-4 text-amber-500" />
            <h2 className="text-3xl font-black italic text-slate-900">MISSION CLEAR!</h2>
            <div className="my-8 flex gap-4">
              <div className="flex-1 rounded-3xl border border-amber-100 bg-amber-50 p-5">
                <p className="text-[10px] font-bold uppercase text-amber-400">XP</p>
                <p className="text-2xl font-black text-amber-600">+{rewardModal.xp}</p>
              </div>
              <div className="flex-1 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
                <p className="text-[10px] font-bold uppercase text-emerald-400">Coins</p>
                <p className="text-2xl font-black text-emerald-600">+{rewardModal.currency}</p>
              </div>
            </div>
            <button
              onClick={() => setRewardModal(null)}
              className="w-full rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-200"
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
