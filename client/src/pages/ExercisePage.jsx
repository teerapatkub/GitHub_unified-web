import React, { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import {
  RotateCcw,
  Play,
  CheckCircle2,
  Terminal,
  Copy,
  MessageSquareCode,
  Send,
  X,
  Star,
  Coins,
  Trophy,
  Loader2,
  ArrowLeft,
} from "lucide-react";

const API_BASE = "http://localhost:3001";
const PYODIDE_SCRIPT_ID = "lesson-exercise-pyodide";
const PYODIDE_SCRIPT_URL = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js";

const parseTestCases = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [];
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

    const handleLoad = () => resolve();
    const handleError = () => reject(new Error("Unable to load Pyodide runtime."));
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
  });

  return window.loadPyodide;
}

function RewardModal({ xp, currency, hasNext, onClose, onNext }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
          <Trophy size={34} className="text-amber-500" />
        </div>
        <h2 className="mb-2 text-2xl font-extrabold text-slate-900">ผ่านแล้ว</h2>
        <p className="mb-6 text-sm text-slate-500">คุณทำแบบฝึกหัดข้อนี้สำเร็จแล้ว</p>

        <div className="mb-8 flex gap-4">
          <div className="flex-1 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <Star size={20} className="mx-auto mb-1 text-amber-500" />
            <p className="text-[11px] text-slate-500">XP ที่ได้รับ</p>
            <p className="text-2xl font-black text-amber-600">+{xp}</p>
          </div>
          <div className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <Coins size={20} className="mx-auto mb-1 text-emerald-500" />
            <p className="text-[11px] text-slate-500">เหรียญที่ได้รับ</p>
            <p className="text-2xl font-black text-emerald-600">+{currency}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-slate-200 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-300"
          >
            ปิด
          </button>
          {hasNext ? (
            <button
              onClick={onNext}
              className="flex-1 rounded-xl bg-blue-700 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-800"
            >
              ข้อถัดไป
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function ExercisePage({ lessonId, user, onUserRefresh, onNavigate }) {
  const params = useParams();
  const resolvedLessonId = lessonId ?? params.lessonId;
  lessonId = resolvedLessonId;
  const [exercises, setExercises] = useState([]);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [code, setCode] = useState("");
  const [terminalLines, setTerminalLines] = useState([]);
  const [pyodide, setPyodide] = useState(null);
  const [pyReady, setPyReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [passedExercises, setPassedExercises] = useState({});
  const [submittedCodeByExerciseId, setSubmittedCodeByExerciseId] = useState({});
  const [rewardModal, setRewardModal] = useState(null);
  const [currentInput, setCurrentInput] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "สวัสดี เราคือ Lumi ผู้ช่วยของแบบฝึกหัดนี้ ถ้าอยากได้ hint หรืออยากให้ช่วยดูโค้ด ถามเราได้เลย" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiResponding, setIsAiResponding] = useState(false);

  const inputResolverRef = useRef(null);
  const terminalRef = useRef(null);
  const chatEndRef = useRef(null);

  const currentEx = exercises[currentExIdx];

  const appendLine = (text) => setTerminalLines((prev) => [...prev, text]);

  const files = currentEx?.files || ["main.py"];
// ใน component ExercisePage
const [activeFile, setActiveFile] = useState("main.py");
const [fileContents, setFileContents] = useState({}); 

// เมื่อ currentEx เปลี่ยน ให้โหลดค่าเริ่มต้น
useEffect(() => {
  if (currentEx && currentEx.files) {
    const contents = {};
    currentEx.files.forEach(file => {
      // ตรวจสอบโครงสร้างไฟล์ให้ชัวร์
      const name = typeof file === 'string' ? file : file.name;
      const content = typeof file === 'string' ? "" : (file.content || "");
      contents[name] = content;
    });
    
    setFileContents(contents);
    // ตั้งค่าหน้าเริ่มต้นให้เป็นไฟล์แรก (เช่น main.py)
    const firstFileName = currentEx.files[0] 
      ? (typeof currentEx.files[0] === 'string' ? currentEx.files[0] : currentEx.files[0].name)
      : "main.py";
    setActiveFile(firstFileName);
  }
}, [currentEx]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  useEffect(() => {
    const initPyodide = async () => {
      try {
        const loadPyodide = await ensurePyodideLoader();
        const instance = await loadPyodide();

        instance.setStdout({
          batched: (text) => {
            if (text.trim()) appendLine(text);
          },
        });
        instance.setStderr({
          batched: (text) => appendLine(`Error: ${text}`),
        });

        await instance.runPythonAsync(`
import builtins
from js import requestInputFromJS
async def custom_input(prompt=""):
    return await requestInputFromJS(prompt)
builtins.input = custom_input
`);

        setPyodide(instance);
        setPyReady(true);
        appendLine("Python runtime ready.");
      } catch (error) {
        appendLine(`Failed to load Python: ${error.message}`);
      }
    };

    window.requestInputFromJS = (promptText) => {
      setCurrentPrompt(promptText);
      return new Promise((resolve) => {
        inputResolverRef.current = resolve;
      });
    };

    initPyodide();

    return () => {
      if (window.requestInputFromJS) {
        delete window.requestInputFromJS;
      }
    };
  }, []);

  useEffect(() => {
    if (!lessonId && lessonId !== 0) {
      setFetchError("ไม่พบบทเรียนสำหรับโหลดแบบฝึกหัด");
      setLoadingList(false);
      return;
    }

    const hydrateProgress = async (list) => {
      if (!user?.user_id || user?.isGuest || list.length === 0) return;
      try {
        const res = await fetch(
          `${API_BASE}/api/exercises/progress/${lessonId}/${user.user_id}`
        );
        if (!res.ok) return;

        const rows = await res.json();
        const passedByIndex = {};
        const submittedCodeMap = {};

        list.forEach((exercise, index) => {
          const row = rows.find(
            (item) => Number(item.exercise_id) === Number(exercise.exercise_id)
          );
          if (row?.is_passed) {
            passedByIndex[index] = true;
          }
          if (row?.latest_submitted_code) {
            submittedCodeMap[Number(exercise.exercise_id)] = row.latest_submitted_code;
          }
        });

        setPassedExercises(passedByIndex);
        setSubmittedCodeByExerciseId(submittedCodeMap);
      } catch {
        // ignore progress hydration failures
      }
    };

const loadExercises = async () => {
  setLoadingList(true);
  setFetchError("");
  setPassedExercises({});
  setSubmittedCodeByExerciseId({});

  // ฟังก์ชันช่วยจัดการข้อมูลให้มีโครงสร้าง files เสมอ
  const normalizeExercise = (ex) => ({
    ...ex,
    // ตรวจสอบว่ามี files หรือไม่ ถ้าไม่มีให้ใส่ ["main.py"] เป็นค่าเริ่มต้น
    files: ex.files && Array.isArray(ex.files) ? ex.files : ["main.py"],
    starter_code: ex.starter_code || ex.initial_code || "",
    xp_reward: ex.xp_reward || 50,
    currency_reward: ex.currency_reward || 10
  });

  try {
    const res = await fetch(`${API_BASE}/api/exercises/list/${lessonId}`);
    if (res.ok) {
      const list = await res.json();
      console.log("ข้อมูลแบบฝึกหัดที่ได้รับจาก API:", list);
      if (Array.isArray(list) && list.length > 0) {
        const processed = list.map(normalizeExercise); // Map ข้อมูลทั้งหมด
        setExercises(processed);
        setCurrentExIdx(0);
        setCode(processed[0].starter_code);
        await hydrateProgress(processed);
        setLoadingList(false);
        return;
      }
    }
  } catch {}

  try {
    const res = await fetch(`${API_BASE}/api/exercises/${lessonId}`);
    if (res.ok) {
      const payload = await res.json();
      if (payload?.exercise) {
        const normalized = [normalizeExercise(payload.exercise)];
        setExercises(normalized);
        setCurrentExIdx(0);
        setCode(normalized[0].starter_code);
        await hydrateProgress(normalized);
        setLoadingList(false);
        return;
      }
    }
  } catch {}

  try {
    const res = await fetch(`${API_BASE}/api/lessons/${lessonId}/exercise`);
    if (res.ok) {
      const exercise = await res.json();
      const normalized = [normalizeExercise(exercise)];
      setExercises(normalized);
      setCurrentExIdx(0);
      setCode(normalized[0].starter_code);
      await hydrateProgress(normalized);
      setLoadingList(false);
      return;
    }
  } catch {}

  setFetchError(`ไม่พบแบบฝึกหัดสำหรับบทเรียน ${lessonId}`);
  setLoadingList(false);
};

    loadExercises();
  }, [lessonId, user?.user_id, user?.isGuest]);

  useEffect(() => {
    if (!currentEx) return;
    const savedCode = submittedCodeByExerciseId[Number(currentEx.exercise_id)];
    setCode(savedCode ?? currentEx.starter_code ?? "");
    setTerminalLines([]);
    setIsAiResponding(false);
    setChatInput("");
    setChatHistory([
      {
        role: "ai",
        text: `เราพร้อมช่วยในโจทย์ "${currentEx.title}" ถ้าต้องการ hint หรือให้ดูโค้ดของคุณ ส่งข้อความมาได้เลย`,
      },
    ]);
  }, [currentExIdx, currentEx, submittedCodeByExerciseId]);

  const normalizeOut = (text) => {
    if (!text) return "";
    return text
      .trim()
      .replace(/\r/g, "")
      .replace(/(\d+\.\d{5,})/g, (match) =>
        parseFloat(parseFloat(match).toFixed(2)).toString()
      )
      .replace(/\s+/g, " ");
  };

const handleRun = async () => {
    if (!pyodide || isRunning) return;
    setTerminalLines([]);
    setIsRunning(true);

    try {
      // 1. เขียนไฟล์ทั้งหมดในระบบ (main.py, data.txt, math_util.py, ฯลฯ) ลงใน VFS ของ Pyodide ก่อน
      Object.entries(fileContents).forEach(([fileName, content]) => {
        pyodide.FS.writeFile(fileName, content || "", { encoding: "utf8" });
      });

      // 2. ดึงโค้ดเฉพาะจากไฟล์หลักที่จะรัน (เช่น main.py)
      const mainCode = fileContents["main.py"] || "";

      // 3. ปรับแก้ input() ให้รองรับการทำงานแบบ Async ของฝั่ง JS Terminal
      const processedCode = mainCode.replace(/\binput\(/g, "await input(");

      // 4. รันโค้ดผ่าน Python Environment อย่างถูกต้อง ปราศจากการ Map ย่อหน้ายัดฟังก์ชัน
      await pyodide.runPythonAsync(`
import asyncio, sys, builtins, ast
from js import requestInputFromJS

sys.stdout = sys.__stdout__
sys.stdin = sys.__stdin__

async def custom_input(prompt=""):
    return await requestInputFromJS(prompt)
builtins.input = custom_input

# สร้างสภาพแวดล้อมที่รองรับคำสั่ง await นอกฟังก์ชัน
async def __main__():
    # รันโค้ดหลักของ user โดยใช้ exec และส่งตัวแปรระดับ Global ให้ใช้งานได้
    local_vars = {}
    # ใช้ compile พร้อม flag PyCF_ALLOW_TOP_LEVEL_AWAIT เพื่ออนุญาตให้มี await
    # อยู่ระดับบนสุดของโค้ดที่ compile ได้ (ไม่งั้น compile() จะมองว่าเป็น
    # module แยกต่างหากที่ไม่มี async def ครอบ แล้วโยน SyntaxError)
    compiled_code = compile(
        ${JSON.stringify(processedCode)},
        "main.py",
        "exec",
        flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT,
    )
    # ถ้าโค้ดมี await อยู่ระดับบนสุดจริง ๆ ตัว code object ที่ได้จะถูกทำเครื่องหมาย
    # เป็น coroutine (CO_COROUTINE) ต้องใช้ eval() แล้ว await ผลลัพธ์
    if compiled_code.co_flags & 0x80:
        await eval(compiled_code, globals(), local_vars)
    else:
        exec(compiled_code, globals(), local_vars)

await __main__()
`);
    } catch (error) {
      appendLine(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

const handleSubmit = async () => {
    if (!pyodide || isRunning || !currentEx) return;

    const testCases = parseTestCases(currentEx.test_cases);
    if (testCases.length === 0) {
      appendLine("ไม่พบ test cases สำหรับแบบฝึกหัดนี้");
      return;
    }

    setIsRunning(true);
    setTerminalLines(["--- กำลังตรวจแบบฝึกหัด ---"]);
    let allPassed = true;

    try {
      // 1. เขียนไฟล์ทั้งหมดในระบบ (รวมไฟล์เสริมทั้งหมด) ลงใน VFS ก่อนการรัน Test Cases
      Object.entries(fileContents).forEach(([fileName, content]) => {
        pyodide.FS.writeFile(fileName, content || "", { encoding: "utf8" });
      });

      // 2. ดึงโค้ดจาก main.py ที่ user เขียนมาเตรียมส่งและทดสอบ
      const mainCode = fileContents["main.py"] || "";

      for (let index = 0; index < testCases.length; index += 1) {
        const testCase = testCases[index];
        
        // เข้ารหัสโค้ดหลักเพื่อส่งไปรันอย่างปลอดภัย
        const encoded = btoa(unescape(encodeURIComponent(mainCode)));
        
        const script = `
import sys, builtins, base64
from io import StringIO

def sync_input(prompt=""):
    return sys.stdin.readline().rstrip('\\n')

builtins.input = sync_input
sys.stdin = StringIO(${JSON.stringify(String(testCase.input ?? ""))})
sys.stdout = StringIO()

try:
    # รันโค้ดหลักในกระดานรันแบบปิดเพื่อให้ได้ output
    exec(base64.b64decode("${encoded}").decode("utf-8"), {"input": sync_input, "__builtins__": builtins}, {})
    output = sys.stdout.getvalue()
except Exception as e:
    output = str(e)

output.strip()
`;

        const raw = await pyodide.runPythonAsync(script);
        const actual = normalizeOut(raw);
        const expected = normalizeOut(String(testCase.expected ?? testCase.expected_output ?? ""));

        if (actual.includes(expected)) {
          appendLine(`PASS Test ${index + 1}`);
        } else {
          appendLine(`FAIL Test ${index + 1}`);
          appendLine(`Expected: ${expected}`);
          appendLine(`Got: ${actual}`);
          allPassed = false;
          break;
        }
      }
    } catch (error) {
      appendLine(`System Error: ${error.message}`);
      allPassed = false;
    } finally {
      try {
        await pyodide.runPythonAsync(`
import builtins
from js import requestInputFromJS
async def custom_input(prompt=""):
    return await requestInputFromJS(prompt)
builtins.input = custom_input
`);
      } catch {
        // ignore bridge restore issues
      }
      setIsRunning(false);
    }

    if (!allPassed) return;

    // ดึงโค้ดจาก main.py เพื่ออัปเดตลง State สรุปผล
    const mainCode = fileContents["main.py"] || "";

    setSubmittedCodeByExerciseId((prev) => ({
      ...prev,
      [Number(currentEx.exercise_id)]: mainCode,
    }));
    setPassedExercises((prev) => ({ ...prev, [currentExIdx]: true }));

    try {
      const response = await fetch(
        `${API_BASE}/api/exercises/${currentEx.exercise_id}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user?.user_id,
            submitted_code: mainCode, // บันทึกโค้ดของไฟล์หลัก
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        appendLine(`Submit Error: ${result?.error || "Unable to submit exercise."}`);
        return;
      }

      if (result?.user) {
        localStorage.setItem("user", JSON.stringify({ ...user, ...result.user }));
        onUserRefresh?.({ ...user, ...result.user });
      }

      appendLine("ผ่านทุกข้อและบันทึกแบบฝึกหัดแล้ว");
      setRewardModal({
        xp: result?.xp_reward || 0,
        currency: result?.currency_reward || 0,
      });
    } catch (error) {
      appendLine(`Submit Error: ${error.message}`);
    }
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter" && inputResolverRef.current) {
      appendLine(`${currentPrompt}${currentInput}`);
      inputResolverRef.current(currentInput);
      inputResolverRef.current = null;
      setCurrentInput("");
      setCurrentPrompt("");
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      appendLine("คัดลอกโค้ดแล้ว");
    } catch {
      appendLine("ไม่สามารถคัดลอกโค้ดได้ในเบราว์เซอร์นี้");
    }
  };

  const getTerminalLineClassName = (line) => {
    if (line.startsWith("PASS") || line.startsWith("เธเนเธฒเธ")) {
      return "text-emerald-400";
    }
    if (
      line.startsWith("FAIL") ||
      line.startsWith("Error:") ||
      line.startsWith("System Error:") ||
      line.startsWith("Submit Error:")
    ) {
      return "text-red-400";
    }
    if (
      line.startsWith("Expected:") ||
      line.startsWith("Got:") ||
      line.startsWith("Failed to load Python:")
    ) {
      return "text-yellow-400";
    }
    if (line.startsWith("---") || line.startsWith("Python runtime ready.")) {
      return "text-blue-400 font-semibold";
    }
    return "text-gray-300";
  };

  const sendAiMessage = async (customMessage = null) => {
    const messageToSend = customMessage || chatInput;
    if (!messageToSend.trim() || isAiResponding) return;

    const nextHistory = [...chatHistory, { role: "user", text: messageToSend }];
    setChatHistory([...nextHistory, { role: "ai", text: "Lumi กำลังดูโจทย์และโค้ดของคุณ..." }]);
    setChatInput("");
    setIsAiResponding(true);

    try {
      const response = await fetch("http://localhost:3001/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          code,
          level: user?.level || 1,
          lessonId,
          exerciseTitle: currentEx?.title || "",
          instructions: currentEx?.description || "",
        }),
      });

      const data = await response.json();
      setChatHistory([
        ...nextHistory,
        { role: "ai", text: data?.reply || "Lumi ยังตอบกลับไม่ครบ ลองถามใหม่อีกครั้งได้เลย" },
      ]);
    } catch {
      setChatHistory([
        ...nextHistory,
        { role: "ai", text: "ตอนนี้ระบบ AI ตอบกลับไม่ได้ชั่วคราว ลองใหม่อีกครั้งได้เลย" },
      ]);
    } finally {
      setIsAiResponding(false);
    }
  };

  const completionCount = useMemo(
    () => Object.values(passedExercises).filter(Boolean).length,
    [passedExercises]
  );

  if (loadingList) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl bg-white/90 px-6 py-5 shadow-sm">
          <Loader2 size={20} className="animate-spin text-blue-600" />
          <span className="font-semibold text-slate-700">กำลังโหลดแบบฝึกหัด...</span>
        </div>
      </div>
    );
  }

  if (fetchError || !currentEx) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl bg-white/90 p-10 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">ไม่สามารถโหลดแบบฝึกหัดได้</h2>
        <p className="mt-3 text-slate-600">{fetchError || "ไม่พบข้อมูลแบบฝึกหัด"}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-[1520px] flex-col px-2 pb-2 sm:px-3 sm:pb-3">
<div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
  {/* ฝั่งขวา: ใช้ flex-wrap gap-3 โดยไม่ต้องมี flex-1 ก็ได้ เพราะ justify-between จะดันออกจากกันเอง */}
  <div className="flex flex-wrap justify-end gap-3">
    <button
      onClick={() => onNavigate?.("lesson", lessonId)}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 sm:px-4 sm:py-2.5"
    >
      <ArrowLeft size={16} />
      กลับไปบทเรียน
    </button>
  </div>
</div>
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-[22px] border border-white/70 bg-white/90 shadow-[0_18px_48px_rgba(15,23,42,0.10)]">
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="overflow-y-auto border-b border-slate-200 bg-slate-50/90 p-5 lg:border-b-0 lg:border-r lg:p-6">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-600">
              Practice Exercise
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-[2rem]">
              {currentEx.title}
            </h1>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
                เลือกโจทย์
              </p>
              <div className="mt-3 space-y-2">
                {exercises.map((exercise, index) => {
                  const isActive = index === currentExIdx;
                  const isPassed = Boolean(passedExercises[index]);

                  return (
                    <button
                      key={exercise.exercise_id ?? index}
                      type="button"
                      onClick={() => setCurrentExIdx(index)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition-colors ${
                        isActive
                          ? "border-blue-600 bg-blue-600 text-white"
                          : isPassed
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                            isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="text-left">{exercise.title || `โจทย์ที่ ${index + 1}`}</span>
                      </span>
                      {isPassed ? (
                        <CheckCircle2 size={16} className={isActive ? "text-white" : "text-emerald-500"} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <h2 className="mt-6 inline-block border-b-4 border-blue-600 pb-1 text-xl font-black text-blue-600 sm:mt-8 sm:text-2xl">
              คำอธิบาย
            </h2>
            <p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-700 sm:mt-5 sm:text-lg">
              {currentEx.description}
            </p>

            <div className="mt-6 rounded-3xl bg-slate-900 px-4 py-4 font-mono text-sm text-slate-100 sm:mt-8 sm:px-5">
              <p className="mb-3 text-xs font-bold text-emerald-400">// ตัวอย่างผลลัพธ์</p>
              {parseTestCases(currentEx.test_cases)[0] ? (
                <>
                  <p className="mb-2 text-slate-300">
                    Input: {String(parseTestCases(currentEx.test_cases)[0].input ?? "")}
                  </p>
                  <p className="text-sm font-bold text-white sm:text-base">
                    Output: {String(parseTestCases(currentEx.test_cases)[0].expected ?? parseTestCases(currentEx.test_cases)[0].expected_output ?? "")}
                  </p>
                </>
              ) : (
                <p className="text-slate-300">ไม่มีตัวอย่าง</p>
              )}
            </div>
            
            <div className="mt-6 flex items-end justify-between gap-3 sm:mt-8">
              <div>
                <p className="text-2xl font-black text-slate-900 sm:text-3xl">
                  {completionCount}/{exercises.length}
                </p>
                <p className="mt-1 text-sm text-slate-500">ความคืบหน้าแบบฝึกหัด</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-right sm:px-4">
                <div className="text-xs font-semibold text-slate-500">รางวัล</div>
                <div className="mt-1 text-sm font-black text-slate-900">
                  +{currentEx.xp_reward || 0} XP
                </div>
                <div className="text-sm font-black text-slate-900">
                  +{currentEx.currency_reward || 0} Coins
                </div>
              </div>
            </div>
          </aside>
          
          <section className={`relative flex min-h-0 min-w-0 flex-col ${isAiOpen ? "xl:pr-[320px]" : ""}`}>
              <div className="flex min-h-0 flex-1 flex-col">
<div className="min-h-0 flex-1 border-b border-slate-200">
  <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
    <div className="flex gap-2">
      {/* 
        ปรับให้ map ตัวแปรเป็น fileObj (ซึ่งเป็น Object) 
        และเปลี่ยนการ fallback ให้เป็นโครงสร้าง Object ที่ถูกต้อง { name: "main.py" }
      */}
      {(currentEx.files || [{ name: "main.py" }]).map((fileObj) => {
        // ดึงชื่อไฟล์ออกมาใช้งานอย่างปลอดภัย
        const fileName = typeof fileObj === 'string' ? fileObj : fileObj.name;

        return (
          <button
            key={fileName}
            onClick={() => setActiveFile(fileName)}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
              activeFile === fileName 
                ? "bg-blue-600 text-white" 
                : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
            }`}
          >
            {/* ✅ แสดงเฉพาะชื่อไฟล์ที่เป็น String แล้วเรียบร้อย ไม่พังแน่นอนค่ะ! */}
            {fileName}
          </button>
        );
      })}
    </div>
  </div>

  <div className="h-[190px] sm:h-[210px] lg:h-[240px] xl:h-[280px]">
    <Editor
      height="100%"
      defaultLanguage="python"
      theme="light"
      // 1. เปลี่ยนมาใช้ fileContents ตามไฟล์ที่เลือก
      value={fileContents[activeFile] || ""} 
      // 2. ปรับ onChange ให้บันทึกเข้าสู่ state ตาม activeFile
      onChange={(value) => {
        setFileContents(prev => ({
          ...prev,
          [activeFile]: value || ""
        }));
      }}
      options={{
        minimap: { enabled: false },
        fontSize: 15,
        lineNumbersMinChars: 3,
        scrollBeyondLastLine: false,
        wordWrap: "on",
      }}
    />
  </div>
</div>
<div className="flex w-full border-b border-slate-200 bg-slate-50 px-2 py-1.5 sm:px-4">
  {/* เพิ่ม w-full ให้ div ลูก เพื่อให้มันขยายตัวเต็มพื้นที่ แล้ว justify-end จะดันปุ่มไปไว้ขวาสุด */}
  <div className="flex w-full gap-2">
        <button
      onClick={() => setIsAiOpen((value) => !value)}
      className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-bold shadow-sm transition-colors sm:px-4 sm:py-2.5 ${
        isAiOpen
          ? "bg-blue-700 text-white hover:bg-blue-800"
          : "border border-slate-200 bg-white text-blue-600 hover:bg-slate-50"
      }`}
    >
      <MessageSquareCode size={16} />
      {isAiOpen ? "ซ่อนผู้ช่วย AI" : "เปิดผู้ช่วย AI"}
    </button>
  </div>
  <div className="flex w-full flex-wrap items-center justify-end gap-2">
    <button
      onClick={copyCode}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
    >
      <Copy size={16} />
      คัดลอก
    </button>
<button
  onClick={() => {
    if (!currentEx) return;

    // 1. สร้างโครงสร้างข้อมูลเริ่มต้นขึ้นมาใหม่
    const resetContents = {};

    if (currentEx.files && currentEx.files.length > 0) {
      currentEx.files.forEach((file) => {
        const fileName = typeof file === 'string' ? file : file.name;
        
        // ถ้าเป็นไฟล์หลัก (main.py) ให้ใช้ starter_code เริ่มต้นของแบบฝึกหัดนั้น
        // แต่ถ้าเป็นไฟล์อื่น ให้ใช้เนื้อหาเริ่มต้น (content) ที่แนบมากับไฟล์นั้น ๆ
        let defaultContent = "";
        if (fileName === "main.py") {
          defaultContent = currentEx.starter_code || "";
        } else {
          defaultContent = typeof file === 'string' ? "" : (file.content || "");
        }

        resetContents[fileName] = defaultContent;
      });

      // 2. อัปเดตเนื้อหาทุกไฟล์ใน State หลักกลับเป็นค่าเริ่มต้น
      setFileContents(resetContents);

      // 3. ตั้งหน้าแท็บที่เปิดอยู่กลับไปที่ไฟล์แรกสุดเสมอ (เช่น main.py)
      const firstFile = currentEx.files[0];
      const firstFileName = typeof firstFile === 'string' ? firstFile : firstFile.name;
      setActiveFile(firstFileName);
    } else {
      // กรณี fallback หากไม่มีไฟล์อื่นเลย ให้รีเซ็ตเฉพาะ main.py ตัวเดียว
      setFileContents({ "main.py": currentEx.starter_code || "" });
      setActiveFile("main.py");
    }
  }}
  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 sm:px-4 sm:py-2.5"
>
  <RotateCcw size={16} />
  รีเซ็ตโค้ด
</button>
    <button
      onClick={handleRun}
      disabled={!pyReady || isRunning}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Play size={16} />
      Run
    </button>
    <button
      onClick={handleSubmit}
      disabled={!pyReady || isRunning}
      className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
    >
      <CheckCircle2 size={16} />
      ส่งแบบฝึกหัด
    </button>
  </div>
</div>
              <div className="h-[185px] flex shrink-0 flex-col bg-[#070d18]">
                <div className="flex items-center gap-2 border-b border-gray-800/50 bg-gray-900/30 px-4 py-1.5">
                  <Terminal size={12} className="text-gray-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Terminal
                  </span>
                </div>

                <div
                  ref={terminalRef}
                  className="flex-1 overflow-y-auto p-4 font-mono text-sm"
                >
                  {terminalLines.length === 0 ? (
                    <p className="text-slate-500">Run your code to see output here.</p>
                  ) : (
                    terminalLines.map((line, index) => (
                      <div key={`${line}-${index}`} className={`mb-0.5 leading-snug ${getTerminalLineClassName(line)}`}>{line}</div>
                    ))
                  )}

                  {inputResolverRef.current ? (
                    <div className="flex items-center text-blue-400">
                      <span>{currentPrompt} &gt;&nbsp;</span>
                      <input
                        autoFocus
                        value={currentInput}
                        onChange={(event) => setCurrentInput(event.target.value)}
                        onKeyDown={handleInputKeyDown}
                        className="flex-1 bg-transparent text-white outline-none"
                      />
                    </div>
                  ) : null}
                </div>

                {false ? (
                  <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-4">
                    <p className="mb-2 text-sm text-slate-300">{currentPrompt}</p>
                    <input
                      value={currentInput}
                      onChange={(event) => setCurrentInput(event.target.value)}
                      onKeyDown={handleInputKeyDown}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                      placeholder="พิมพ์คำตอบแล้วกด Enter"
                    />
                  </div>
                ) : null}
              </div>
            </div>

            {isAiOpen ? (
              <aside className="absolute inset-y-3 right-3 z-20 hidden w-[300px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl xl:flex">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setIsAiOpen(false)} className="text-slate-400 transition-colors hover:text-slate-700">
                      <X size={18} />
                    </button>
                    <span className="font-bold text-slate-900">Lumi AI Assistant</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setChatHistory([
                        {
                          role: "ai",
                          text: `เราพร้อมช่วยในโจทย์ "${currentEx.title}" ถ้าต้องการ hint หรือให้ดูโค้ดของคุณ ส่งข้อความมาได้เลย`,
                        },
                      ])
                    }
                    className="text-xs font-bold text-blue-600"
                  >
                    ล้างแชต
                  </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  {chatHistory.map((message, index) => (
                    <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "ai" ? "" : "flex-row-reverse"}`}>
                      {message.role === "ai" ? (
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          <MessageSquareCode size={16} />
                        </div>
                      ) : null}
                      <div
                        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-7 whitespace-pre-wrap ${
                          message.role === "ai"
                            ? "rounded-tl-sm bg-slate-100 text-slate-700"
                            : "rounded-tr-sm bg-blue-700 text-white"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <div className="border-t border-slate-200 bg-white p-4">
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      sendAiMessage();
                    }}
                    className="relative"
                  >
                    <input
                      value={chatInput}
                      onChange={(event) => setChatInput(event.target.value)}
                      placeholder="ถาม Lumi เรื่องโจทย์หรือโค้ด..."
                      disabled={isAiResponding}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-11 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isAiResponding}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 disabled:opacity-40"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </aside>
            ) : null}
          </section>
        </div>
      </div>

      {rewardModal ? (
        <RewardModal
          xp={rewardModal.xp}
          currency={rewardModal.currency}
          hasNext={currentExIdx < exercises.length - 1}
          onClose={() => setRewardModal(null)}
          onNext={() => {
            setRewardModal(null);
            setCurrentExIdx((prev) => Math.min(exercises.length - 1, prev + 1));
          }}
        />
      ) : null}
    </div>
  );
}