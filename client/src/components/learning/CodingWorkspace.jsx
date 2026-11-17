import React, { useEffect, useRef, useState } from 'react';
import usePyodide from '../../hooks/usePyodide';
import friendlyPyError from '../../utils/friendlyPyError';
import Editor from '@monaco-editor/react';
import { EDITOR_FONT_FAMILY } from '../../utils/editorFont.js';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Coins,
  Copy,
  ListChecks,
  Loader2,
  MessageSquareCode,
  Play,
  RefreshCcw,
  RotateCcw,
  Send,
} from 'lucide-react';
import CodeWorkbench, { BriefHeading, FileTab, ToolButton } from '../workbench/CodeWorkbench';
import { ACCENTS } from '../workbench/accents.js';
import WorkbenchMenu from '../workbench/WorkbenchMenu';
import WorkbenchFooter from '../workbench/WorkbenchFooter';
import LumiPanel from '../workbench/LumiPanel';
import OutputPanel, { InputPrompt } from '../workbench/OutputPanel';
import { API_BASE } from '../../config/api.js';
import useLumiChat from '../../hooks/useLumiChat';
import { buildLumiMessages } from '../../utils/lumiChat';
import { useTranslation } from 'react-i18next';
import InlineCodeText from '../ui/InlineCodeText.jsx';

// Labels for a beginner: what each button does, in their language. The
// grader's log lines start with a mark (✓ / ✗) the terminal colours by.
const WORDS = {
  th: {
    coins: 'เหรียญ', instructions: 'โจทย์', example: 'ตัวอย่าง', input: 'ถ้าป้อน', output: 'ต้องได้', reward: 'รางวัล',
    hideAi: 'ปิด Lumi', openAi: 'ถาม Lumi', run: 'ลองรัน', runTests: 'ตรวจคำตอบ', passed: 'ผ่านแล้ว',
    output_: 'ผลลัพธ์', empty: 'กด “ลองรัน” เพื่อดูว่าโค้ดพิมพ์อะไรออกมา', clear: 'ล้างแชท', ask: 'ถาม Lumi เช่น ทำไมโค้ดนี้ error',
    loading: 'กำลังเตรียม Python…', copy: 'คัดลอกโค้ด', shot: 'บันทึกภาพโค้ด',
    grading: 'กำลังตรวจกับตัวอย่าง…', pass: (n) => `✓ ผ่านตัวอย่างที่ ${n}`, fail: (n) => `✗ ไม่ผ่านตัวอย่างที่ ${n}`,
    expected: 'ควรได้', got: 'ได้จริง', allPassed: '✓ ผ่านครบ กด “ส่งคำตอบ” ได้เลย',
    rewardLine: (xp, coins) => `ได้รับ +${xp} XP และ +${coins} เหรียญ`, submitted: 'ส่งคำตอบแล้ว',
    submitError: '✗ ส่งไม่สำเร็จ', submitFallback: 'ส่งคำตอบไม่ได้', copied: 'คัดลอกโค้ดแล้ว', copyFailed: 'เบราว์เซอร์นี้คัดลอกโค้ดไม่ได้',
    submitHint: 'ต้องกด “ตรวจคำตอบ” ให้ผ่านก่อนจึงส่งได้',
    reset: 'เริ่มโค้ดใหม่จากตอนต้นแล้ว', resetLabel: 'เริ่มโค้ดใหม่', backToLearn: 'กลับไปหน้าบทเรียน', help: 'ช่วยเหลือ',
    aiHint: 'ขอคำใบ้ หรือให้ช่วยดูว่าโค้ดผิดตรงไหน', more: 'เครื่องมือเพิ่มเติม',
    step1: 'แก้หรือเขียนโค้ดในช่องทางขวา', step2: 'กด “ตรวจคำตอบ” ระบบจะลองโค้ดกับตัวอย่าง', step3: 'ผ่านแล้วกด “ส่งคำตอบ” เพื่อรับรางวัล',
    reroll: 'เปลี่ยนโจทย์', rerollsLeft: (n) => `เปลี่ยนโจทย์ได้อีก ${n} ครั้ง`, solvedMeta: 'ส่งแล้ว กำลังโหลดโจทย์ใหม่',
  },
  en: {
    coins: 'coins', instructions: 'Instructions', example: 'Example', input: 'Input', output: 'Output', reward: 'Reward',
    hideAi: 'Hide Lumi', openAi: 'Ask Lumi', run: 'Run', runTests: 'Check answer', passed: 'Passed',
    output_: 'Output', empty: 'Press “Run” to see what your code prints.', clear: 'Clear chat', ask: 'Ask Lumi, e.g. why does this error?',
    loading: 'Getting Python ready…', copy: 'Copy code', shot: 'Save a picture of the code',
    grading: 'Checking against the example…', pass: (n) => `✓ Example ${n} passed`, fail: (n) => `✗ Example ${n} failed`,
    expected: 'Expected', got: 'Got', allPassed: '✓ All passed. You can submit now.',
    rewardLine: (xp, coins) => `+${xp} XP and +${coins} coins`, submitted: 'Answer submitted.',
    submitError: '✗ Could not submit', submitFallback: 'Unable to submit.', copied: 'Code copied.', copyFailed: 'This browser cannot copy the code.',
    submitHint: 'Pass “Check answer” first to submit.',
    reset: 'Code reset to the start.', resetLabel: 'Start over', backToLearn: 'Back to lessons', help: 'Help',
    aiHint: 'Get a hint or have your code looked at', more: 'More tools',
    step1: 'Fix or write the code on the right', step2: 'Press “Check answer” to test it on the example', step3: 'Once it passes, press “Submit” for the reward',
    reroll: 'New task', rerollsLeft: (n) => `${n} new tasks left`, solvedMeta: 'Submitted, loading the next task',
  },
};


export default function CodingWorkspace({
  taskId,
  sectionLabel,
  title,
  accent = 'blue',
  instructions,
  example,
  initialCode,
  starterMessage,
  testCases,
  submitLabel,
  quickActions = [],
  rewardXp = 0,
  rewardCoins = 0,
  rerollsRemaining = 0,
  onReroll,
  rerolling = false,
  onSubmitTask,
  onTaskSubmitted,
  workspaceNotice = '',
}) {
  const { i18n } = useTranslation();
  const w = String(i18n.language || 'th').startsWith('en') ? WORDS.en : WORDS.th;
  const [code, setCode] = useState(initialCode);
  const [terminalLines, setTerminalLines] = useState([]);
  // Python runs in the shared Web Worker (usePyodide) so an infinite loop in a
  // learner's code is interrupted instead of freezing the tab.
  const { status: pyStatus, runCode } = usePyodide();
  const isLoading = pyStatus !== 'ready';
  const [isRunning, setIsRunning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasPassedTests, setHasPassedTests] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([{ role: 'ai', text: starterMessage }]);
  const [chatInput, setChatInput] = useState('');
  const lumi = useLumiChat();
  const isAiResponding = lumi.isResponding;
  const stopLumi = lumi.stop;

  const inputResolverRef = useRef(null);
  const terminalRef = useRef(null);
  const chatEndRef = useRef(null);

  const tone = ACCENTS[accent === 'rose' ? 'rose' : 'blue'];

  const appendLine = (text) => setTerminalLines((prev) => [...prev, text]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  useEffect(() => {
    setCode(initialCode);
    setTerminalLines([]);
    setIsSuccess(false);
    setHasPassedTests(false);
    setChatHistory([{ role: 'ai', text: starterMessage }]);
    stopLumi();
  }, [initialCode, starterMessage, taskId, stopLumi]);

  // Interactive input() for the worker: show the prompt and resolve when the
  // learner presses Enter (see handleInputKeyDown).
  const requestInputFromLearner = (promptText = '') => {
    setCurrentPrompt(promptText);
    return new Promise((resolve) => {
      inputResolverRef.current = resolve;
    });
  };

  const normalizeText = (text) => {
    if (!text) return '';
    return text
      .trim()
      .replace(/\r/g, '')
      .replace(/(\d+\.\d{5,})/g, (match) => parseFloat(parseFloat(match).toFixed(2)).toString())
      .replace(/\s+/g, ' ');
  };

  const handleRun = async () => {
    if (pyStatus !== 'ready' || isRunning) return;
    setTerminalLines([]);
    setIsRunning(true);
    setIsSuccess(false);
    setHasPassedTests(false);

    const result = await runCode(code, [], {
      interactive: true,
      mainFileName: 'main.py',
      onInput: requestInputFromLearner,
      onStdout: (text) => { if (text.trim()) appendLine(text); },
      onStderr: (text) => appendLine(`Error: ${text}`),
    });

    if (!result.success && !result.interrupted && result.error && result.error !== 'Timeout') {
      const explained = friendlyPyError(result.error);
      if (explained.message) appendLine(explained.message);
    }
    setIsRunning(false);
  };

  const handleRunTests = async () => {
    if (pyStatus !== 'ready' || isRunning) return;
    setIsRunning(true);
    setTerminalLines([w.grading]);
    let allPassed = true;
    setIsSuccess(false);
    setHasPassedTests(false);

    for (let index = 0; index < testCases.length; index += 1) {
      const test = testCases[index];
      const encodedCode = btoa(unescape(encodeURIComponent(code)));
      // Feed the case's input via StringIO, capture what the code prints, then
      // print it back so it reaches the worker's stdout. Runs in the worker, so a
      // learner whose code loops forever is interrupted, not left freezing the tab.
      const gradingScript = [
        'import sys, builtins, base64',
        'from io import StringIO',
        'def sync_input(prompt=""):',
        "    return sys.stdin.readline().rstrip('\\n')",
        'builtins.input = sync_input',
        '_real_stdout = sys.stdout',
        'sys.stdin = StringIO(' + JSON.stringify(String(test.input ?? '')) + ')',
        'sys.stdout = StringIO()',
        'try:',
        '    exec(base64.b64decode("' + encodedCode + '").decode("utf-8"), {"input": sync_input, "__builtins__": builtins}, {})',
        '    _out = sys.stdout.getvalue()',
        'except Exception as e:',
        '    _out = str(e)',
        'sys.stdout = _real_stdout',
        'print(_out, end="")',
      ].join('\n');

      let captured = '';
      const runResult = await runCode(gradingScript, [], {
        interactive: false,
        onStdout: (t) => { captured += t; },
        onStderr: (t) => { captured += t; },
      });

      if (!runResult.success && runResult.error && runResult.error !== 'Timeout') {
        // Interrupted loop or worker error: report and stop.
        appendLine(runResult.error);
        allPassed = false;
        break;
      }

      const actual = normalizeText(captured);
      const expected = normalizeText(test.expected);
      if (actual.includes(expected)) {
        appendLine(w.pass(index + 1));
      } else {
        appendLine(w.fail(index + 1));
        appendLine(`${w.expected}: ${expected}`);
        appendLine(`${w.got}: ${actual}`);
        allPassed = false;
        break;
      }
    }

    setIsRunning(false);

    if (allPassed) {
      setIsSuccess(true);
      setHasPassedTests(true);
      appendLine(w.allPassed);
    }
  };

  const handleSubmit = async () => {
    if (!hasPassedTests || isSubmitting || !onSubmitTask) return;
    setIsSubmitting(true);
    try {
      const result = await onSubmitTask({ taskId, code });
      appendLine(w.rewardLine(result?.reward?.xp || rewardXp, result?.reward?.coins || rewardCoins));
      appendLine(result?.message || w.submitted);
      setIsSuccess(true);
      setHasPassedTests(false);
      onTaskSubmitted?.(result);
    } catch (error) {
      const failure = error?.response?.data;
      appendLine(`${w.submitError}: ${failure?.detail || failure?.error || error.message || w.submitFallback}`);
      if (failure?.hint) appendLine(`คำแนะนำ: ${failure.hint}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter' && inputResolverRef.current) {
      appendLine(`${currentPrompt}${currentInput}`);
      inputResolverRef.current(currentInput);
      inputResolverRef.current = null;
      setCurrentInput('');
      setCurrentPrompt('');
    }
  };

  const sendAiMessage = async (customMessage = null) => {
    const messageToSend = customMessage || chatInput;
    if (!messageToSend.trim() || isAiResponding) return;

    let storedUser = {};
    try {
      storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      storedUser = {};
    }
    const userLevel = storedUser?.level || storedUser?.user?.level || 1;
    const newHistory = [...chatHistory, { role: 'user', text: messageToSend }];

    setChatHistory([...newHistory, { role: 'ai', text: 'Lumi กำลังอ่านโจทย์และโค้ดของคุณ...', pending: true }]);
    setChatInput('');

    // Sends the problem, the code and the chat so far. This used to send only
    // `message`, which the server never reads: Lumi saw no question at all.
    const result = await lumi.ask(
      buildLumiMessages({
        title,
        description: instructions,
        level: userLevel,
        code,
        history: chatHistory,
        userText: messageToSend,
      }),
      (text) => setChatHistory([...newHistory, { role: 'ai', text }]),
    );

    let text = result.text;
    if (result.stopped) text = text ? `${text} …` : 'หยุดคำตอบแล้ว ถามใหม่ได้เลยนะคะ';
    else if (result.failed && !text) text = 'ตอนนี้ Lumi ตอบไม่ได้ชั่วคราว ลองถามใหม่อีกครั้งนะคะ';
    setChatHistory([...newHistory, { role: 'ai', text }]);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      appendLine(w.copied);
    } catch {
      appendLine(w.copyFailed);
    }
  };

  const resetCode = () => {
    setCode(initialCode);
    setHasPassedTests(false);
    setIsSuccess(false);
    setTerminalLines([w.reset]);
  };

  const hasInput = String(example?.input ?? '').trim() !== '';
  const brief = (
    <div className="pb-6">
      <div className="px-5 pb-4 pt-4">
        <Link
          to="/learn"
          className="mb-3 inline-flex min-h-target items-center gap-1.5 rounded-lg py-1 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {w.backToLearn}
        </Link>
        <p className={`text-sm font-bold ${tone.text}`}>{sectionLabel}</p>
        <h1 className="mt-1 text-xl font-black leading-snug text-slate-900">{title}</h1>
      </div>

      <BriefHeading>{w.instructions}</BriefHeading>
      <div className="space-y-3 px-5 py-4 text-[15px] leading-7 text-slate-800">
        {instructions.map((instruction) => (
          <p key={instruction}><InlineCodeText text={instruction} /></p>
        ))}
        {example && String(example.output ?? '').trim() ? (
          <div className="rounded-xl border border-slate-200 bg-white p-3 font-mono text-[13px] leading-6">
            <p className="mb-1 font-sans text-xs font-bold text-slate-500">{w.example}</p>
            {hasInput ? <p className="whitespace-pre-wrap text-slate-600">{w.input}: {example.input}</p> : null}
            <p className="whitespace-pre-wrap font-bold text-slate-900">{w.output}: {example.output}</p>
          </div>
        ) : null}
        <ol className="space-y-1.5 text-sm text-slate-600">
          <li><span className="font-bold text-slate-800">1.</span> {w.step1}</li>
          <li><span className="font-bold text-slate-800">2.</span> {w.step2}</li>
          <li><span className="font-bold text-slate-800">3.</span> {w.step3}</li>
        </ol>
        {(rewardXp > 0 || rewardCoins > 0) ? (
          <p className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-800">
            <Coins size={15} aria-hidden="true" />
            {w.reward} +{rewardXp} XP · +{rewardCoins} {w.coins}
          </p>
        ) : null}
        {workspaceNotice ? <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">{workspaceNotice}</p> : null}
      </div>

      <BriefHeading>{w.help}</BriefHeading>
      <div className="px-5 py-4">
        <button
          type="button"
          onClick={() => setIsAiOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
        >
          <img src="/data_MiNiGame/NPC_lumi/lumi_smile.png" alt="" className="h-9 w-9 shrink-0 rounded-full bg-sky-50 object-contain" />
          <span className="min-w-0">
            <span className="block text-sm font-bold text-slate-900">{w.openAi}</span>
            <span className="block text-xs text-slate-500">{w.aiHint}</span>
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-[1600px] flex-col">
      <CodeWorkbench
        accent={accent === 'rose' ? 'rose' : 'blue'}
        isThai={w === WORDS.th}
        brief={brief}
        fileTabs={<FileTab name="main.py" active onSelect={() => {}} />}
        editor={
          <div data-tour="ai-task-editor" className="h-full">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="light"
              value={code}
              onChange={(value) => {
                setCode(value || '');
                setHasPassedTests(false);
                setIsSuccess(false);
              }}
              options={{
                fontSize: 15,
                fontFamily: EDITOR_FONT_FAMILY,
                minimap: { enabled: false },
                padding: { top: 12 },
                scrollBeyondLastLine: false,
                lineNumbersMinChars: 3,
                tabSize: 4,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>
        }
        toolbarStart={
          <WorkbenchMenu
            label={w.more}
            items={[
              { id: 'copy', icon: Copy, label: w.copy, onClick: copyCode },
              { id: 'reset', icon: RotateCcw, label: w.resetLabel, onClick: resetCode },
              { id: 'lumi', icon: MessageSquareCode, label: w.openAi, onClick: () => setIsAiOpen(true) },
            ]}
          />
        }
        toolbarEnd={
          <>
            <ToolButton icon={Play} onClick={handleRun} disabled={isRunning || isLoading}>
              {w.run}
            </ToolButton>
            {/* One filled button at a time: "check" until the answer passes,
                then "send". Send stays visible but disabled before that, with
                the reason on hover. */}
            {hasPassedTests ? (
              <ToolButton
                icon={isSubmitting ? Loader2 : CheckCircle2}
                busy={isSubmitting}
                primary
                accent={accent === 'rose' ? 'rose' : 'blue'}
                onClick={handleSubmit}
                disabled={isRunning || isLoading || isSubmitting}
                data-tour="ai-task-submit"
              >
                {submitLabel}
              </ToolButton>
            ) : (
              <>
                <ToolButton
                  icon={isRunning ? Loader2 : ListChecks}
                  busy={isRunning}
                  primary
                  accent={accent === 'rose' ? 'rose' : 'blue'}
                  onClick={handleRunTests}
                  disabled={isRunning || isLoading}
                  data-tour="ai-task-tests"
                >
                  {w.runTests}
                </ToolButton>
                <span title={w.submitHint} className="hidden sm:inline-flex">
                  <ToolButton icon={Send} disabled data-tour="ai-task-submit">{submitLabel}</ToolButton>
                </span>
              </>
            )}
          </>
        }
        terminal={
          <OutputPanel
            ref={terminalRef}
            title={w.output_}
            lines={terminalLines}
            emptyText={isLoading ? w.loading : w.empty}
          >
            {inputResolverRef.current ? (
              <InputPrompt
                prompt={currentPrompt}
                value={currentInput}
                onChange={setCurrentInput}
                onEnter={() => handleInputKeyDown({ key: 'Enter' })}
              />
            ) : null}
          </OutputPanel>
        }
        footer={
          <WorkbenchFooter
            title={title}
            meta={isSuccess && !hasPassedTests ? w.solvedMeta : `${sectionLabel} · ${w.rerollsLeft(rerollsRemaining)}`}
            extra={
              <button
                type="button"
                onClick={onReroll}
                disabled={!onReroll || rerollsRemaining <= 0 || rerolling}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RefreshCcw size={15} className={rerolling ? 'animate-spin' : ''} aria-hidden="true" />
                {w.reroll}
              </button>
            }
          />
        }
        lumiOpen={isAiOpen}
        lumiPanel={
          <LumiPanel
            messages={chatHistory}
            quickActions={quickActions}
            responding={isAiResponding}
            onSend={(text) => sendAiMessage(text)}
            onStop={lumi.stop}
            onClear={() => setChatHistory([{ role: 'ai', text: starterMessage }])}
            onClose={() => setIsAiOpen(false)}
            isThai={w === WORDS.th}
          />
        }
        onLumiClose={() => setIsAiOpen(false)}
      />
    </div>
  );
}
