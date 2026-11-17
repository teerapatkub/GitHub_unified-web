import React, { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { EDITOR_FONT_FAMILY } from '../utils/editorFont.js';
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  RotateCcw,
  Play,
  CheckCircle2,
  Copy,
  MessageSquareCode,
  Star,
  Coins,
  Trophy,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import useLumiChat from "../hooks/useLumiChat";
import { buildLumiMessages } from "../utils/lumiChat";
import ProgressCelebration from "../components/learning/ProgressCelebration";
import WebTutorialModal from "../components/WebTutorialModal";
import { problemTitle, problemDescription } from "../utils/problemText";
import { getWebTutorial } from "../data/webTutorials";
import { requestJson } from '../config/api-client.js';
import { loadExerciseList } from './exercise-data.js';
import usePyodide from "../hooks/usePyodide";
import friendlyPyError from "../utils/friendlyPyError";
import SkeletonLoading from "../components/ui/Skeleton";
import CodeWorkbench, { BriefHeading, FileTab, ToolButton } from "../components/workbench/CodeWorkbench";
import WorkbenchMenu from "../components/workbench/WorkbenchMenu";
import WorkbenchFooter from "../components/workbench/WorkbenchFooter";
import LumiPanel from "../components/workbench/LumiPanel";
import OutputPanel, { InputPrompt } from "../components/workbench/OutputPanel";
import InlineCodeText from '../components/ui/InlineCodeText.jsx';

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
            <p className="text-label text-slate-500">XP ที่ได้รับ</p>
            <p className="text-2xl font-black text-amber-600">+{xp}</p>
          </div>
          <div className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <Coins size={20} className="mx-auto mb-1 text-emerald-500" />
            <p className="text-label text-slate-500">เหรียญที่ได้รับ</p>
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
  const [progressError, setProgressError] = useState("");
  const [code, setCode] = useState("");
  const [terminalLines, setTerminalLines] = useState([]);
  // Python runs in the shared Web Worker (usePyodide), not on this thread, so an
  // infinite loop in a learner's code is interrupted instead of freezing the tab.
  const { status: pyStatus, runCode } = usePyodide();
  const pyReady = pyStatus === "ready";
  // The failing case from the last submission, so the learner can ask Lumi
  // about it. Only set when the SERVER says the answer is wrong.
  const [lastFailure, setLastFailure] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [passedExercises, setPassedExercises] = useState({});
  const [submittedCodeByExerciseId, setSubmittedCodeByExerciseId] = useState({});
  const [celebrationQueue, setCelebrationQueue] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "สวัสดีค่ะ เราคือ Lumi ผู้ช่วยของแบบฝึกหัดนี้ ถ้าอยากได้ hint หรืออยากให้ช่วยดูโค้ด ถามเราได้เลยนะคะ" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const lumi = useLumiChat();
  const isAiResponding = lumi.isResponding;
  const stopLumi = lumi.stop;
  const [showTutorial, setShowTutorial] = useState(false);
  const openGuide = () => setShowTutorial(true);

  const inputResolverRef = useRef(null);
  const terminalRef = useRef(null);
  const chatEndRef = useRef(null);

  const currentEx = exercises[currentExIdx];

  // The problem bank stores every problem in both languages. Read whichever the
  // learner picked, falling back to the other rather than to a blank heading -
  // see client/src/utils/problemText.js.
  const { i18n } = useTranslation();
  const lang = i18n.language === "en" ? "en" : "th";
  const exTitle = (exercise) => problemTitle(lang, exercise);
  const exDescription = (exercise) => problemDescription(lang, exercise);
  const exerciseTutorial = getWebTutorial("exercise-page");

  const appendLine = (text) => setTerminalLines((prev) => [...prev, text]);

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

  // Interactive input() for the worker: the worker asks, this shows the prompt in
  // the terminal and resolves once the learner presses Enter (see handleInputKeyDown).
  const requestInputFromLearner = (promptText) => {
    setCurrentPrompt(promptText);
    return new Promise((resolve) => {
      inputResolverRef.current = resolve;
    });
  };

  useEffect(() => {
    if (!lessonId && lessonId !== 0) {
      setFetchError("ไม่พบบทเรียนสำหรับโหลดแบบฝึกหัด");
      setLoadingList(false);
      return;
    }

    const hydrateProgress = async (list) => {
      if (!user?.user_id || user?.isGuest || list.length === 0) return;
      try {
        const rows = await requestJson(`/api/exercises/progress/${encodeURIComponent(lessonId)}/${encodeURIComponent(user.user_id)}`);
        if (!Array.isArray(rows)) throw new Error('Invalid exercise progress response');
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
      } catch (error) {
        const reason = error.kind === 'unauthorized' ? 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง'
          : error.kind === 'server' ? 'เซิร์ฟเวอร์ขัดข้อง'
            : error.kind === 'network' ? 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' : 'โหลดความคืบหน้าไม่สำเร็จ';
        setProgressError(`${reason} ผลที่ทำผ่านแล้วอาจยังไม่แสดง`);
      }
    };

const loadExercises = async () => {
  setLoadingList(true);
  setFetchError("");
  setProgressError("");
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
    const list = await loadExerciseList(lessonId);
    if (list.length === 0) {
      setFetchError(`ไม่พบแบบฝึกหัดสำหรับบทเรียน ${lessonId}`);
      return;
    }
    const processed = list.map(normalizeExercise);
    setExercises(processed);
    setCurrentExIdx(0);
    setCode(processed[0].starter_code);
    await hydrateProgress(processed);
  } catch (error) {
    setFetchError(error.kind === 'unauthorized' ? 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง'
      : error.kind === 'server' ? 'เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่ภายหลัง'
        : error.kind === 'network' ? 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบเครือข่าย'
          : 'โหลดแบบฝึกหัดไม่สำเร็จ กรุณาลองใหม่');
  } finally {
    setLoadingList(false);
  }
};

    loadExercises();
  }, [lessonId, user?.user_id, user?.isGuest]);

  useEffect(() => {
    if (!currentEx) return;
    const savedCode = submittedCodeByExerciseId[Number(currentEx.exercise_id)];
    setCode(savedCode ?? currentEx.starter_code ?? "");
    setTerminalLines([]);
    stopLumi();
    setChatInput("");
    setChatHistory([
      {
        role: "ai",
        text: `เราพร้อมช่วยในโจทย์ "${problemTitle(lang, currentEx)}" ถ้าต้องการ hint หรือให้ดูโค้ดของคุณ ส่งข้อความมาได้เลย`,
      },
    ]);
  }, [currentExIdx, currentEx, submittedCodeByExerciseId, lang, stopLumi]);

const handleRun = async () => {
    if (!pyReady || isRunning) return;
    setTerminalLines([]);
    setIsRunning(true);

    // Every file in the exercise (main.py plus any data/helper files) goes into
    // the worker's filesystem; main.py is the entry point. input()/await input()
    // and top-level await are handled inside the worker (interactive mode), and
    // an infinite loop is interrupted there instead of freezing the tab.
    const files = Object.entries(fileContents).map(([name, content]) => ({
      name,
      type: "file",
      content: content || "",
    }));
    const mainCode = fileContents["main.py"] || "";

    const result = await runCode(mainCode, files, {
      interactive: true,
      mainFileName: "main.py",
      onStdout: (text) => {
        if (text.trim()) appendLine(text);
      },
      onStderr: (text) => appendLine(`Error: ${text}`),
      onInput: requestInputFromLearner,
    });

    // A wrong answer is left to the server on Submit; this trial run only shows
    // output. On a real error add the shared Thai explanation. Skip it when the
    // watchdog interrupted a loop (the worker already showed a clear message) or
    // on a hard timeout. No line number: the worker frames do not line up with
    // the editor, and the server's Submit feedback is the line-accurate one.
    if (!result.success && !result.interrupted && result.error && result.error !== "Timeout") {
      const explained = friendlyPyError(result.error);
      if (explained.message) appendLine(explained.message);
    }

    setIsRunning(false);
  };

const handleSubmit = async () => {
    if (!pyReady || isRunning || !currentEx) return;

    setIsRunning(true);
    setTerminalLines(["--- กำลังตรวจแบบฝึกหัดบนเซิร์ฟเวอร์ ---"]);
    const mainCode = fileContents["main.py"] || "";

    setSubmittedCodeByExerciseId((prev) => ({
      ...prev,
      [Number(currentEx.exercise_id)]: mainCode,
    }));

    try {
      const result = await requestJson(
        `/api/exercises/${currentEx.exercise_id}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user?.user_id,
            submitted_code: mainCode, // บันทึกโค้ดของไฟล์หลัก
          }),
        }
      );

      setLastFailure(null);
      setPassedExercises((prev) => ({ ...prev, [currentExIdx]: true }));

      if (result?.user) {
        localStorage.setItem("user", JSON.stringify({ ...user, ...result.user }));
        onUserRefresh?.({ ...user, ...result.user });
      }

      appendLine("✓ ผ่านทุกข้อและบันทึกแบบฝึกหัดแล้ว");
      setCelebrationQueue((prev) => [
        ...prev,
        ...(result?.xp_reward || result?.currency_reward
          ? [{
              id: `exercise-success-${Date.now()}`,
              type: "success",
              title: "ผ่านแบบฝึกหัดแล้ว!",
              subtitle: "โค้ดของคุณผ่านการตรวจทุกข้อของแบบฝึกหัดนี้",
              rewards: {
                xp: Number(result?.xp_reward || 0),
                coins: Number(result?.currency_reward || 0),
              },
            }]
          : []),
        ...(result?.celebration?.levelUp
          ? [{
              id: `exercise-level-up-${Date.now()}`,
              type: "levelup",
              title: `Level Up! LV ${result?.celebration?.newLevel}`,
              subtitle: result?.celebration?.tierChanged
                ? `คุณเลื่อนขั้นเป็น ${result?.celebration?.newTier} แล้ว`
                : "คุณเลื่อนระดับจากการทำแบบฝึกหัดสำเร็จ",
              previousLevel: Number(result?.celebration?.previousLevel || 1),
              newLevel: Number(result?.celebration?.newLevel || 1),
              rewards: {
                xp: Number(result?.xp_reward || 0),
                coins: Number(result?.currency_reward || 0),
              },
              tierLabel: result?.celebration?.tierChanged
                ? `${result?.celebration?.previousTier} → ${result?.celebration?.newTier}`
                : null,
            }]
          : []),
      ]);
    } catch (error) {
      const body = error?.body;
      appendLine(`✗ ยังไม่ผ่าน: ${body?.detail || error?.detail || error?.message || 'ส่งคำตอบไม่สำเร็จ'}`);
      if (body?.hint) appendLine(`คำแนะนำ: ${body.hint}`);
      setLastFailure(body?.hint ? { hint: body.hint, errorLine: body.errorLine } : null);
    } finally {
      setIsRunning(false);
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

  // Back to the starting files of this exercise (main.py from starter_code,
  // any other file from its own content), on the first file.
  const resetCode = () => {
    if (!currentEx) return;
    const files = currentEx.files?.length ? currentEx.files : ["main.py"];
    const fresh = {};
    files.forEach((file) => {
      const name = typeof file === "string" ? file : file.name;
      fresh[name] = name === "main.py" ? currentEx.starter_code || "" : (typeof file === "string" ? "" : file.content || "");
    });
    setFileContents(fresh);
    setActiveFile(typeof files[0] === "string" ? files[0] : files[0].name);
    setTerminalLines(["เริ่มโค้ดใหม่จากตอนต้นแล้ว"]);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(fileContents[activeFile] ?? code);
      appendLine("คัดลอกโค้ดแล้ว");
    } catch {
      appendLine("ไม่สามารถคัดลอกโค้ดได้ในเบราว์เซอร์นี้");
    }
  };

  const sendAiMessage = async (customMessage = null) => {
    const messageToSend = customMessage || chatInput;
    if (!messageToSend.trim() || isAiResponding) return;

    const nextHistory = [...chatHistory, { role: "user", text: messageToSend }];
    setChatHistory([...nextHistory, { role: "ai", text: "Lumi กำลังดูโจทย์และโค้ดของคุณ...", pending: true }]);
    setChatInput("");

    // The request is built in utils/lumiChat.js, shared with the Debug Lab /
    // Challenge workspace and the mini game, and the answer streams in.
    const result = await lumi.ask(
      buildLumiMessages({
        title: exTitle(currentEx),
        description: exDescription(currentEx),
        level: user?.level || 1,
        code,
        history: chatHistory,
        userText: messageToSend,
      }),
      (text) => setChatHistory([...nextHistory, { role: "ai", text }]),
    );

    let text = result.text;
    if (result.stopped) text = text ? `${text} …` : "หยุดคำตอบแล้ว ถามใหม่ได้เลย";
    else if (result.failed && !text) text = "ตอนนี้ระบบ AI ตอบกลับไม่ได้ชั่วคราว ลองใหม่อีกครั้งได้เลย";
    setChatHistory([...nextHistory, { role: "ai", text }]);
  };

  // The short Thai message covers the ten or so mistakes beginners actually
  // make and costs nothing. This is the way out when it is not enough - and it
  // only runs when the learner asks, so a typo does not spend tokens. It uses
  // the chatbot's model, never the code judge's.
  const askLumiAboutError = () => {
    if (!lastFailure || isAiResponding) return;
    setIsAiOpen(true);
    const parts = [
      'ช่วยอธิบายหน่อยว่าโค้ดของผมผิดตรงไหนและควรแก้ยังไง อธิบายแบบคนเพิ่งเริ่มเขียนโปรแกรม',
      lastFailure.hint ? `ระบบบอกว่า: ${lastFailure.hint}` : '',
      lastFailure.errorLine ? `ผิดที่บรรทัด ${lastFailure.errorLine}` : '',
      lastFailure.error ? `ข้อความจาก Python: ${String(lastFailure.error).slice(0, 400)}` : '',
      (lastFailure.expected !== undefined)
        ? `เทสเคสนี้คาดผลลัพธ์ ${JSON.stringify(lastFailure.expected)} แต่ได้ ${JSON.stringify(lastFailure.actual)}`
        : '',
    ].filter(Boolean);
    sendAiMessage(parts.join(String.fromCharCode(10)));
  };

  const completionCount = useMemo(
    () => Object.values(passedExercises).filter(Boolean).length,
    [passedExercises]
  );

  if (loadingList) {
    return (
      <div className="min-h-[70vh] px-4 py-8">
        <SkeletonLoading variant="workspace" label="กำลังโหลดแบบฝึกหัด..." className="mx-auto max-w-6xl" />
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

  const fileNames = (currentEx.files || [{ name: "main.py" }]).map((file) => (typeof file === "string" ? file : file.name));
  const isLastExercise = currentExIdx >= exercises.length - 1;
  const backToLesson = () => onNavigate?.("lesson", lessonId);

  const brief = (
    <div className="pb-6">
      <div className="px-5 pb-4 pt-4">
        <button
          type="button"
          onClick={backToLesson}
          className="mb-3 inline-flex min-h-target items-center gap-1.5 rounded-lg py-1 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          กลับไปบทเรียน
        </button>
        <p className="text-sm font-bold text-blue-700">แบบฝึกหัด {currentExIdx + 1} / {exercises.length}</p>
        <h1 className="mt-1 text-xl font-black leading-snug text-slate-900">{exTitle(currentEx)}</h1>
        {progressError ? (
          <p role="alert" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">{progressError}</p>
        ) : null}
      </div>

      <BriefHeading>โจทย์</BriefHeading>
      <div className="px-5 py-4">
        <p className="whitespace-pre-line text-[15px] leading-7 text-slate-800"><InlineCodeText text={exDescription(currentEx)} /></p>
        <ol className="mt-4 space-y-1.5 text-sm text-slate-600">
          <li><span className="font-bold text-slate-800">1.</span> เขียนโค้ดในช่องทางขวา</li>
          <li><span className="font-bold text-slate-800">2.</span> กด <span className="font-bold text-slate-800">ลองรัน</span> เพื่อดูผลลัพธ์ ลองได้ไม่จำกัด</li>
          <li><span className="font-bold text-slate-800">3.</span> มั่นใจแล้วกด <span className="font-bold text-slate-800">ส่งแบบฝึกหัด</span> ระบบจะตรวจและให้รางวัลถ้าถูก</li>
        </ol>
        <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-800">
          <Coins size={15} aria-hidden="true" />
          รางวัล +{currentEx.xp_reward || 0} XP · +{currentEx.currency_reward || 0} เหรียญ
        </p>
      </div>

      <BriefHeading>ช่วยเหลือ</BriefHeading>
      <div className="space-y-2 px-5 py-4">
        <button
          type="button"
          onClick={() => setIsAiOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
        >
          <img src="/data_MiNiGame/NPC_lumi/lumi_smile.png" alt="" className="h-9 w-9 shrink-0 rounded-full bg-sky-50 object-contain" />
          <span className="min-w-0">
            <span className="block text-sm font-bold text-slate-900">ถาม Lumi</span>
            <span className="block text-xs text-slate-500">ขอคำใบ้ หรือให้ช่วยดูว่าโค้ดผิดตรงไหน</span>
          </span>
        </button>
        {lastFailure ? (
          <button
            type="button"
            onClick={askLumiAboutError}
            disabled={isAiResponding}
            className="flex w-full items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-left text-sm font-bold text-red-800 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <MessageSquareCode size={18} aria-hidden="true" />
            ส่งไม่ผ่าน ให้ Lumi อธิบายว่าผิดตรงไหน
          </button>
        ) : null}
      </div>
    </div>
  );

  const lumiPanel = (
    <LumiPanel
      messages={chatHistory}
      quickActions={[
        { label: "อธิบายโจทย์ข้อนี้ให้หน่อย", prompt: "ช่วยอธิบายโจทย์ข้อนี้แบบเข้าใจง่ายหน่อย" },
        { label: "ขอคำใบ้สั้น ๆ", prompt: "ขอคำใบ้สั้น ๆ สำหรับข้อนี้ ยังไม่ต้องเฉลย" },
        { label: "ช่วยดูโค้ดของฉันหน่อย", prompt: "ช่วยดูโค้ดของฉันหน่อยว่าควรแก้ตรงไหน" },
      ]}
      responding={isAiResponding}
      onSend={(text) => sendAiMessage(text)}
      onStop={lumi.stop}
      onClear={() =>
        setChatHistory([
          { role: "ai", text: `เราพร้อมช่วยในโจทย์ "${exTitle(currentEx)}" ถ้าต้องการ hint หรือให้ดูโค้ดของคุณ ส่งข้อความมาได้เลย` },
        ])
      }
      onClose={() => setIsAiOpen(false)}
      isThai={lang === "th"}
    />
  );

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-[1600px] flex-col">
      <CodeWorkbench
        isThai={lang === "th"}
        brief={brief}
        fileTabs={fileNames.map((name) => (
          <FileTab key={name} name={name} active={activeFile === name} onSelect={() => setActiveFile(name)} />
        ))}
        editor={
          <div data-tour="exercise-editor" className="h-full">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="light"
              value={fileContents[activeFile] || ""}
              onChange={(value) => setFileContents((prev) => ({ ...prev, [activeFile]: value || "" }))}
              options={{
                fontFamily: EDITOR_FONT_FAMILY,
                minimap: { enabled: false },
                fontSize: 15,
                lineNumbersMinChars: 3,
                scrollBeyondLastLine: false,
                wordWrap: "on",
                padding: { top: 12 },
                // Re-measure when the box resizes (Lumi opening, the phone
                // switch); Monaco otherwise keeps the size it measured first.
                automaticLayout: true,
              }}
            />
          </div>
        }
        toolbarStart={
          <WorkbenchMenu
            items={[
              { id: "copy", icon: Copy, label: "คัดลอกโค้ด", onClick: copyCode },
              { id: "reset", icon: RotateCcw, label: "เริ่มโค้ดใหม่", onClick: resetCode },
              { id: "lumi", icon: MessageSquareCode, label: "ถาม Lumi", onClick: () => setIsAiOpen(true) },
            ]}
          />
        }
        toolbarEnd={
          <>
            <ToolButton icon={Play} onClick={handleRun} disabled={!pyReady || isRunning} data-tour="run-code">
              ลองรัน
            </ToolButton>
            <ToolButton icon={isRunning ? Loader2 : CheckCircle2} busy={isRunning} primary onClick={handleSubmit} disabled={!pyReady || isRunning} data-tour="submit-exercise">
              ส่งแบบฝึกหัด
            </ToolButton>
          </>
        }
        terminal={
          <OutputPanel
            ref={terminalRef}
            lines={terminalLines}
            emptyText={pyReady ? "กด “ลองรัน” เพื่อดูว่าโค้ดพิมพ์อะไรออกมา" : "กำลังเตรียม Python…"}
          >
            {inputResolverRef.current ? (
              <InputPrompt
                prompt={currentPrompt}
                value={currentInput}
                onChange={setCurrentInput}
                onEnter={() => handleInputKeyDown({ key: "Enter" })}
              />
            ) : null}
          </OutputPanel>
        }
        footer={
          <WorkbenchFooter
            title={exTitle(currentEx)}
            meta={`ข้อ ${currentExIdx + 1} / ${exercises.length} · ผ่านแล้ว ${completionCount} ข้อ`}
            done={Boolean(passedExercises[currentExIdx])}
            items={exercises.map((exercise, index) => ({
              id: exercise.exercise_id ?? index,
              label: exTitle(exercise) || `โจทย์ที่ ${index + 1}`,
              done: Boolean(passedExercises[index]),
              active: index === currentExIdx,
              onSelect: () => setCurrentExIdx(index),
            }))}
            listLabel="แบบฝึกหัดในบทนี้"
            back={currentExIdx > 0
              ? { label: "ข้อก่อน", onClick: () => setCurrentExIdx((index) => Math.max(0, index - 1)) }
              : { label: "บทเรียน", onClick: backToLesson }}
            next={isLastExercise
              ? { label: "กลับบทเรียน", onClick: backToLesson, highlight: Boolean(passedExercises[currentExIdx]) }
              : { label: "ข้อถัดไป", onClick: () => setCurrentExIdx((index) => Math.min(exercises.length - 1, index + 1)), highlight: Boolean(passedExercises[currentExIdx]) }}
          />
        }
        lumiOpen={isAiOpen}
        lumiPanel={lumiPanel}
        onLumiClose={() => setIsAiOpen(false)}
      />

      <ProgressCelebration
        event={celebrationQueue[0] || null}
        onClose={() => {
          const shouldAdvance = celebrationQueue.length === 1 && currentExIdx < exercises.length - 1;
          setCelebrationQueue((prev) => prev.slice(1));
          if (shouldAdvance) {
            setCurrentExIdx((prev) => Math.min(exercises.length - 1, prev + 1));
          }
        }}
      />

      {exerciseTutorial ? (
        <>
          <WebTutorialModal
            onOpen={openGuide}
            tutorial={exerciseTutorial}
            isOpen={showTutorial}
            onClose={() => setShowTutorial(false)}
            onComplete={() => setShowTutorial(false)}
          />
        </>
      ) : null}
    </div>
  );
}
