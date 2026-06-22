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
  if (!rules || rules.length === 0) return "default";

  // 1. ทำความสะอาดค่า Output ที่ได้จากการ print ของผู้เล่น
  const cleanOutput = output ? output.trim() : "";

  // 2. ดึงเฉพาะตัวเลขออกมา เผื่อกรณีที่ใน SQL ยังเป็นสูตรคณิตศาสตร์แบบเก่า (เช่น float > 500)
  // หากคำตอบคือ "1070.0" หรือ "1A" ตัวนี้จะพยายามหาตัวเลขจุดทศนิยมหรือเลขเดี่ยวๆ ออกมา
  const matchNum = cleanOutput.match(/-?\d+(\.\d+)?/);
  const numericValue = matchNum ? parseFloat(matchNum[0]) : 0;

  for (const rule of rules) {
    try {
      let conditionStr = rule.condition;

      // 3. ปรับให้รองรับเงื่อนไขทุกรูปแบบ:
      if (conditionStr.includes("value")) {
        // ถ้าในเงื่อนไขใช้คำว่า 'value' (เช่น value == '1A') -> เอาข้อความเต็มๆ ไปเช็ค
        conditionStr = conditionStr.replace(/value/g, `'${cleanOutput}'`);
      } else if (conditionStr.includes("float")) {
        // ถ้าในเงื่อนไขใช้คำว่า 'float' (เช่น float > 500) -> เอาเฉพาะตัวเลขไปแทนค่า
        conditionStr = conditionStr.replace(/float/g, String(numericValue));
      }

      // 4. สั่งคำนวณสูตรด้วย eval
      if (eval(conditionStr)) {
        return rule.branch_key;
      }
    } catch (e) {
      console.error("Error evaluating rule:", e, rule.condition);
    }
  }

  // ถ้าไม่ตรงเงื่อนไขใดๆ เลย ให้ส่งค่าของแถวสุดท้ายกลับไป (เหมือน Logic เดิมของคุณ)
  return rules[rules.length - 1].branch_key;
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

async function ensurePyodideLoader() {
  if (typeof window.loadPyodide === "function") {
    return window.loadPyodide;
  }

  let script = document.getElementById(PYODIDE_SCRIPT_ID);
  if (!script) {
    script = document.createElement("script");
    script.id = PYODIDE_SCRIPT_ID;
    script.src = PYODIDE_SCRIPT_URL;
    script.async = true;
    document.head.appendChild(script);
  }

  await new Promise((resolve, reject) => {
    if (typeof window.loadPyodide === "function") {
      resolve();
      return;
    }

    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", () => reject(new Error("Unable to load Python runtime.")), {
      once: true,
    });
  });

  return window.loadPyodide;
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

  const terminalRef = useRef(null);
  const inputResolverRef = useRef(null);
  const runOutputRef = useRef("");
  const dialogueAudioRef = useRef(null);
  const outputTargetRef = useRef("terminal");

  const subtopics = useMemo(() => {
    if (!moduleData) return [];
    if (Array.isArray(moduleData.subtopics) && moduleData.subtopics.length > 0) {
      return moduleData.subtopics;
    }
    return [moduleData];
  }, [moduleData]);

  const currentSubtopic = subtopics[currentSubtopicIndex] ?? null;
  const getSubtopicIndexForBranch = (branchKey = "") => {
    const key = String(branchKey || "").trim();
    if (!key || key === "default" || key === "end") return -1;
    return subtopics.findIndex((subtopic) =>
      String(subtopic.exercise_order ?? subtopic.order_index ?? subtopic.branch_key ?? "") === key
    );
  };
  const currentProgress = currentSubtopic
    ? progressBySubtopic[currentSubtopic.exercise_id]
    : null;
  const isCurrentSubtopicCompleted = Boolean(currentProgress?.completed_this_run);
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
  const selectedBranchKey = getSafeBranchKey(
    currentSubtopic,
    pendingChoice?.branch_key || currentProgress?.selected_branch_key || inheritedBranchKey
  );
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
  const sceneBackgroundImage =
    currentSubtopic?.scene_background_image || moduleData?.scene_background_image || "scene_school.jpg";
  const sceneBackgroundUrl = `/data_MiNiGame/${sceneBackgroundImage}`;
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
    && !isProgramDialogue
    && isAtLastDialogue
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
        const loadPyodide = await ensurePyodideLoader();
        const instance = await loadPyodide();

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

  useEffect(() => {
    let active = true;

    const loadModule = async () => {
      setLoading(true);
      setError("");
      setTerminalLines([]);
      setDialogueIndex(0);
      setCurrentSubtopicIndex(0);
      setProgressBySubtopic({});
      setPendingChoicesBySubtopic({});

      try {
        const response = await fetch(`${API_BASE}/api/mini-game/modules/${moduleId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Unable to load MiNi Game module.");
        }

        if (!active) return;

        setModuleData(data);
        const firstSubtopic = data.subtopics?.[0] ?? data;
        setCode(firstSubtopic?.starter_code || 'print("Hello")');

        if (user?.user_id && !user?.isGuest) {
          try {
            const progressResponse = await fetch(
              `${API_BASE}/api/mini-game/modules/${moduleId}/progress/${user.user_id}`
            );
            const progress = await progressResponse.json();
            const progressRows = Array.isArray(progress) ? progress : progress ? [progress] : [];
            const nextProgressBySubtopic = progressRows.reduce((acc, item) => {
              acc[item.exercise_id] = item;
              return acc;
            }, {});
            setProgressBySubtopic(nextProgressBySubtopic);
            const firstProgress = nextProgressBySubtopic[firstSubtopic?.exercise_id];
            if (firstProgress?.submitted_code) {
              setCode(firstProgress.submitted_code);
            }
          } catch {
            // ignore progress load failures
          }
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadModule();
    return () => {
      active = false;
    };
  }, [moduleId, user?.user_id, user?.isGuest]);

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
    setProgramDialogue(null);
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
          const message = [
            `FAIL Test ${index + 1}`,
            `Expected: ${expected.join(" OR ")}`,
            `Got: ${actual || "(no output)"}`,
          ].join("\n");
          setProgramDialogue({ text: message });
          appendTerminalLine(`FAIL Test ${index + 1}`);
          appendTerminalLine(`Expected: ${expected.join(" OR ")}`);
          appendTerminalLine(`Got: ${actual || "(no output)"}`);
          return { ok: false, output: lastOutput || "(no output)", reply: null };
        }
      }

      const branch = evaluateBranchRules(testConfig.rules, storyOutput || lastOutput)
        || resolveDialogueBranch(storyOutput || lastOutput)
        || { branch_key: selectedBranchKey || "default", trigger_output: storyOutput || lastOutput, is_correct: 1 };
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

  // ดักเอาไอดีด่านปัจจุบันและไอดีผู้ใช้ออกมารอไว้ ป้องกันค่าว่าง (undefined)
  const currentExerciseId = currentSubtopic?.exercise_id || currentSubtopic?.id;
  const currentUserId = user?.user_id || user?.id || 1; 

  try {
    // 🌟 ดึงค่าระบุตัวตนด่านจาก params (ให้แน่ใจว่ายิงไปหา Endpoint หลังบ้านถูกเส้น)
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

      const nextDialogues = getVisibleDialogues(currentSubtopic.dialogues || [], true, nextBranchKey);
      const postSubmitIndex = nextDialogues.findIndex(
        (dialogue) => dialogue.dialogue_phase === "post_submit"
      );
      if (postSubmitIndex >= 0) {
        window.setTimeout(() => {
          setProgramDialogue(null);
          setShowTerminal(false);
          setDialogueIndex(postSubmitIndex);
        }, 900);
      } else if (getSubtopicIndexForBranch(nextBranchKey) >= 0) {
        window.setTimeout(() => {
          setProgramDialogue(null);
          setShowTerminal(false);
          setCurrentSubtopicIndex(getSubtopicIndexForBranch(nextBranchKey));
        }, 900);
      }

      if (result?.is_module_completed) {
        setRewardModal({
          xp: result?.xp_reward ?? moduleData.reward_xp ?? 0,
          currency: result?.currency_reward ?? moduleData.reward_coins ?? 0,
        });
      }
    } catch (submitError) {
      setTerminalLines((prev) => [...prev, `Submit Error: ${submitError.message}`]);
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
        },
      }));
      const nextDialogues = getVisibleDialogues(currentSubtopic.dialogues || [], true, nextBranchKey);
      const postSubmitIndex = nextDialogues.findIndex((dialogue) => dialogue.dialogue_phase === "post_submit");
      if (postSubmitIndex >= 0) {
        window.setTimeout(() => {
          setProgramDialogue(null);
          setShowTerminal(false);
          setDialogueIndex(postSubmitIndex);
        }, 900);
      }
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
            <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-400">Stage</p>
              <p className="mt-1 text-sm font-black text-indigo-700">
                ด่านที่ {currentSubtopicIndex + 1} จาก {subtopics.length}
              </p>
              <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">
                {currentSubtopic?.title || currentMissionCopy.title || moduleData.title}
              </p>
            </div>
            <div className="mt-5 rounded-xl bg-slate-900 px-4 py-3 text-white">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Progress</p>
              <p className="mt-1 text-lg font-black">
                {completedSubtopicCount}/{subtopics.length} Subtopics
              </p>
            </div>
            <div className="mt-8 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Hint</p>
              <p className="mt-2 text-sm font-medium text-slate-600">
                {currentMissionCopy.hint || "Write code that matches this subtopic objective."}
              </p>
            </div>
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
                      event.currentTarget.src = "/data_MiNiGame/minigame01.jpg";
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
                <div className="relative top-5 flex h-full w-full flex-col justify-end">
                  {!isProgramDialogue && currentDialogue?.speaker !== "user" && currentDialogue?.speaker !== "system" ? (
                    <div className="absolute bottom-28 right-10 z-10 h-[400px] w-[340px] transition-all duration-300">
                      <img
                        src={`/data_MiNiGame/lumi_${currentDialogue?.emotion || "smile"}.png`}
                        className="absolute bottom-0 left-1/2 h-2/3 max-w-none -translate-x-1/2 object-contain drop-shadow-[0_18px_32px_rgba(15,23,42,0.45)]"
                        alt="Lumi"
                        onError={(event) => {
                          event.currentTarget.src = "/data_MiNiGame/Error.png";
                        }}
                      />
                    </div>
                  ) : null}

                  <div className="relative z-20 w-full rounded-3xl border border-white/70 bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
                    {!isProgramDialogue ? (
                      <div className="absolute -top-3 left-8 rounded-lg bg-pink-500 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-md">
                        {currentDialogue?.speaker === "user" ? "You" : currentDialogue?.speaker === "system" ? "System" : "Lumi"}
                      </div>
                    ) : null}

                    <div className="min-h-[60px] text-xl font-bold leading-relaxed text-slate-800">
                      {isProgramDialogue ? currentDialogueText : displayedDialogueText}
                      {isDialogueTyping || isRunning ? <span className="animate-pulse text-indigo-500">|</span> : null}
                    </div>

                    {inputResolverRef.current && !showTerminal ? (
                      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-indigo-100 bg-slate-50 px-4 py-3 text-base text-slate-800">
                        <span className="font-bold text-indigo-600">{currentPrompt}</span>
                        <input
                          autoFocus
                          value={currentInput}
                          onChange={(event) => setCurrentInput(event.target.value)}
                          onKeyDown={handleInputKeyDown}
                          className="min-w-0 flex-1 bg-transparent font-mono outline-none"
                        />
                      </div>
                    ) : null}

                    {!isDialogueTyping && currentDialogueChoices.length > 0 ? (
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {currentDialogueChoices.map((choice) => (
                          <button
                            key={choice.choice_id}
                            onClick={() => handleDialogueChoice(choice)}
                            className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-left text-sm font-bold text-indigo-700 transition-all hover:border-indigo-300 hover:bg-indigo-100 active:scale-[0.99]"
                          >
                            {choice.choice_text}
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {!isProgramDialogue && dialogueIndex < dialogues.length - 1 && currentDialogueChoices.length === 0 ? (
                      <button
                        onClick={() => {
                          if (isDialogueTyping) {
                            setDisplayedDialogueText(currentDialogueText);
                            return;
                          }
                          setDialogueIndex((prev) => prev + 1);
                        }}
                        className="mt-6 rounded-2xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white"
                      >
                        Next Dialogue
                      </button>
                    ) : null}
                    {dialogueIndex >= dialogues.length - 1 &&
                    isCurrentSubtopicCompleted &&
                    nextSubtopicIndex >= 0 ? (
                      <button
                        onClick={() => {
                          if (nextSubtopicIndex >= 0) setCurrentSubtopicIndex(nextSubtopicIndex);
                        }}
                        className="mt-6 rounded-2xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white"
                      >
                        Next Subtopic
                      </button>
                    ) : null}
                  </div>
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
