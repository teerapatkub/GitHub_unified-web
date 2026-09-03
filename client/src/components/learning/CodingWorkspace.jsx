import React, { useEffect, useRef, useState } from 'react';
import usePyodide from '../../hooks/usePyodide';
import friendlyPyError from '../../utils/friendlyPyError';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import {
  Play,
  CheckCircle2,
  Copy,
  Camera,
  Send,
  X,
  ChevronsRight,
  MessageSquareCode,
  Loader2,
  RefreshCcw,
} from 'lucide-react';
import { API_BASE } from '../../config/api.js';


export default function CodingWorkspace({
  user,
  taskId,
  sectionLabel,
  title,
  accent = 'blue',
  subtitle,
  instructions,
  example,
  initialCode,
  starterMessage,
  testCases,
  submitLabel,
  progressLabel,
  progressMeta,
  nextLabel,
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
  const [isAiResponding, setIsAiResponding] = useState(false);

  const inputResolverRef = useRef(null);
  const terminalRef = useRef(null);
  const chatEndRef = useRef(null);

  const accentStyles =
    accent === 'rose'
      ? {
          text: 'text-rose-600',
          border: 'border-rose-500',
          softBg: 'bg-rose-50',
          button: 'bg-rose-600 hover:bg-rose-700',
          buttonSoft: 'text-rose-600 hover:text-rose-700',
          panelRing: 'focus:border-rose-500',
          tag: 'bg-rose-100 text-rose-700',
        }
      : {
          text: 'text-blue-600',
          border: 'border-blue-500',
          softBg: 'bg-blue-50',
          button: 'bg-blue-600 hover:bg-blue-700',
          buttonSoft: 'text-blue-600 hover:text-blue-700',
          panelRing: 'focus:border-blue-500',
          tag: 'bg-blue-100 text-blue-700',
        };

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
    setIsAiResponding(false);
  }, [initialCode, starterMessage, taskId]);

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
    setTerminalLines(['--- Starting auto-grading ---']);
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
        appendLine(`PASS Test Case ${index + 1}`);
      } else {
        appendLine(`FAIL Test Case ${index + 1}`);
        appendLine(`Expected: ${expected}`);
        appendLine(`Got: ${actual}`);
        allPassed = false;
        break;
      }
    }

    setIsRunning(false);

    if (allPassed) {
      setIsSuccess(true);
      setHasPassedTests(true);
      appendLine('All test cases passed.');
    }
  };

  const handleSubmit = async () => {
    if (!hasPassedTests || isSubmitting || !onSubmitTask) return;
    setIsSubmitting(true);
    try {
      const result = await onSubmitTask({ taskId, code });
      appendLine(`Reward: +${result?.reward?.xp || rewardXp} XP, +${result?.reward?.coins || rewardCoins} coins`);
      appendLine(result?.message || 'Task submitted successfully.');
      setIsSuccess(true);
      setHasPassedTests(false);
      onTaskSubmitted?.(result);
    } catch (error) {
      appendLine(`Submit Error: ${error?.response?.data?.error || error.message || 'Unable to submit task.'}`);
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

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userLevel = user?.level || user?.user?.level || 'Beginner';
    const newHistory = [...chatHistory, { role: 'user', text: messageToSend }];

    setChatHistory([...newHistory, { role: 'ai', text: 'Lumi is reviewing your code...' }]);
    setChatInput('');
    setIsAiResponding(true);

    try {
      const response = await axios.post(`${API_BASE}/api/ai/chat`, {
        message: messageToSend,
        code,
        level: userLevel,
      });

      setChatHistory([
        ...newHistory,
        { role: 'ai', text: response.data.reply || 'Lumi did not receive a full answer. Please try again.' },
      ]);
    } catch (error) {
      setChatHistory([
        ...newHistory,
        { role: 'ai', text: error?.response?.data?.reply || 'The AI connection is unavailable right now. Please try again.' },
      ]);
    } finally {
      setIsAiResponding(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      appendLine('Code copied to clipboard.');
    } catch {
      appendLine('Unable to copy code from this browser.');
    }
  };

  return (
    <div className="h-full min-h-0 overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1560px] overflow-hidden rounded-[24px] border border-white/70 bg-white/88 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        {/* The brief. Everything here was a size or two too large for the
            space it had: a 3xl-to-4xl title in a 290px column turned a short
            problem name into three stacked lines, and 16px instructions at
            28px line height pushed the worked example below the fold. */}
        <aside className="hidden w-[300px] shrink-0 border-r border-slate-200 bg-slate-50/90 xl:flex xl:flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <p className={`mb-2 text-[11px] font-black uppercase tracking-[0.22em] ${accentStyles.text}`}>{sectionLabel}</p>
            <h1 className="mb-5 text-xl font-black leading-tight tracking-tight text-slate-900 2xl:text-2xl">{title}</h1>

            <h2 className={`mb-3 inline-block border-b-2 pb-0.5 text-sm font-black ${accentStyles.text} ${accentStyles.border}`}>
              Instructions
            </h2>

            <div className="space-y-3 text-[13px] leading-6 text-slate-700">
              {instructions.map((instruction) => (
                <p key={instruction}>{instruction}</p>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 font-mono text-[12px] text-slate-100 shadow-inner">
              <p className="mb-2 text-[11px] font-bold text-emerald-400">// Example output</p>
              <p className="mb-1.5 whitespace-pre-wrap text-slate-300">Input: {example.input}</p>
              <p className="whitespace-pre-wrap font-bold text-white">Output: {example.output}</p>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-black text-slate-900">{progressLabel}</p>
                <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{progressMeta}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {(rewardXp > 0 || rewardCoins > 0) ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-right text-[10px] font-semibold text-slate-600">
                    <div>Reward</div>
                    <div className="mt-0.5 whitespace-nowrap font-black text-slate-900">+{rewardXp} XP • +{rewardCoins}</div>
                  </div>
                ) : null}
                {nextLabel ? (
                  <button className={`rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-colors ${accentStyles.button}`}>
                    {nextLabel}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-white">
          {/* On a wide screen the sidebar beside this already carries the
              section label and the title, so repeating both here cost a whole
              band of vertical space to say the same thing twice. Below xl the
              sidebar is hidden and this is the only place the learner can read
              what they are being asked to do, so it stays. */}
          <div className="border-b border-slate-200 bg-white/90 px-4 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 xl:hidden">
                <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${accentStyles.text}`}>{sectionLabel}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <h2 className="truncate text-base font-black text-slate-900">{title}</h2>
                  {subtitle ? (
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${accentStyles.tag}`}>{subtitle}</span>
                  ) : null}
                </div>
              </div>
              <div className="hidden min-w-0 items-center gap-2 xl:flex">
                {subtitle ? (
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${accentStyles.tag}`}>{subtitle}</span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setIsAiOpen((value) => !value)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold shadow-sm transition-colors ${isAiOpen ? `${accentStyles.button} text-white` : `border border-slate-200 bg-white ${accentStyles.buttonSoft}`}`}
              >
                <MessageSquareCode size={16} />
                {isAiOpen ? 'Hide AI' : 'Open AI Helper'}
              </button>
            </div>
          </div>

          {/* The problem statement, for every screen narrower than xl.
              The sidebar that carries it is hidden below that width, which left
              the learner looking at a code editor and a title with no way to
              read what they had been asked to do - the instructions existed in
              exactly one place and that place was not on screen. A <details>
              rather than a state flag: it opens and closes on its own, and it
              is keyboard-reachable without any extra work. */}
          <details open className="shrink-0 border-b border-slate-200 bg-slate-50/80 xl:hidden">
            <summary className="cursor-pointer px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-700">
              โจทย์
            </summary>
            <div className="space-y-2 px-4 pb-3 text-[13px] leading-6 text-slate-700">
              {instructions.map((instruction) => (
                <p key={instruction}>{instruction}</p>
              ))}

              <div className="rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 font-mono text-[11px] text-slate-100">
                <p className="mb-1 font-bold text-emerald-400">// Example output</p>
                <p className="whitespace-pre-wrap text-slate-300">Input: {example.input}</p>
                <p className="whitespace-pre-wrap font-bold text-white">Output: {example.output}</p>
              </div>

              {(rewardXp > 0 || rewardCoins > 0) ? (
                <p className="text-[11px] font-bold text-slate-500">
                  {progressLabel}: +{rewardXp} XP • +{rewardCoins} Coins
                </p>
              ) : null}
            </div>
          </details>

          <div className={`relative flex-1 min-h-0 transition-[padding] duration-300 ${isAiOpen ? 'pr-0 lg:pr-[336px]' : ''}`}>
            <div className="flex h-full min-h-0 flex-col p-2.5">
              <div className="rounded-t-xl border border-slate-200 bg-slate-100/80 px-3 py-1.5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs font-bold text-slate-700">main.py</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onReroll}
                      disabled={!onReroll || rerollsRemaining <= 0 || rerolling}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                      title="สุ่มโจทย์ใหม่"
                    >
                      <RefreshCcw size={14} className={rerolling ? 'animate-spin' : ''} />
                      รีโจทย์ ({rerollsRemaining})
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-xl border border-t-0 border-slate-200 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
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
                      minimap: { enabled: false },
                      padding: { top: 20, bottom: 84 },
                      scrollBeyondLastLine: false,
                      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                      renderLineHighlight: 'line',
                      lineNumbersMinChars: 3,
                      tabSize: 4,
                      scrollbar: {
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10,
                      },
                    }}
                  />

                  {isLoading ? (
                    <div className={`absolute right-5 top-4 flex items-center gap-2 text-xs font-bold ${accentStyles.text}`}>
                      <Loader2 size={14} className="animate-spin" />
                      Python engine loading...
                    </div>
                  ) : null}

                </div>

                {/* The action bar used to float ON TOP of the editor, pinned to
                    its bottom corners. On anything shorter than a desktop
                    monitor that put Run / Run Tests / Submit directly over the
                    learner's own code - seen on screen sitting across lines 8
                    to 10 of a ten-line answer. It is a real row in the layout
                    now, so it can never cover the code again. */}
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/80 px-3 py-2">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={copyCode}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-800"
                      title="Copy code"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-800"
                      title="Screenshot"
                    >
                      <Camera size={14} />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleRun}
                      disabled={isRunning || isLoading}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Play size={14} fill="currentColor" />
                      Run
                    </button>
                    <button
                      type="button"
                      onClick={handleRunTests}
                      disabled={isRunning || isLoading}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${isSuccess ? 'bg-emerald-500 hover:bg-emerald-600' : accentStyles.button}`}
                    >
                      {isSuccess ? <CheckCircle2 size={14} /> : null}
                      {isSuccess ? 'Tests Passed' : 'Run Tests'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isRunning || isLoading || isSubmitting || !hasPassedTests}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${accentStyles.button}`}
                    >
                      {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
                      {submitLabel}
                    </button>
                  </div>
                </div>

                <div className="h-36 shrink-0 border-t border-slate-200 bg-slate-950 text-slate-100">
                  <div className="border-b border-slate-800 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Terminal
                  </div>
                  <div ref={terminalRef} className="h-[calc(100%-29px)] overflow-y-auto p-4 font-mono text-[12px]">
                    {terminalLines.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center space-y-3 text-slate-500">
                        <ChevronsRight size={24} />
                        <p>Run your code to see output here.</p>
                        {workspaceNotice ? <p className="text-center text-xs text-amber-300">{workspaceNotice}</p> : null}
                      </div>
                    ) : null}
                    {terminalLines.map((line, index) => (
                      <div
                        key={`${line}-${index}`}
                        className={`mb-1 ${
                          line.startsWith('PASS')
                            ? 'font-bold text-emerald-400'
                            : line.startsWith('FAIL') || line.startsWith('Error') || line.startsWith('System Error')
                              ? 'font-bold text-red-400'
                              : 'text-slate-200'
                        }`}
                      >
                        {line}
                      </div>
                    ))}
                    {inputResolverRef.current ? (
                      <div className="mt-2 flex items-center font-bold text-emerald-400">
                        <span>{currentPrompt} &gt; </span>
                        <input
                          autoFocus
                          className="ml-2 flex-1 bg-transparent text-white outline-none"
                          value={currentInput}
                          onChange={(event) => setCurrentInput(event.target.value)}
                          onKeyDown={handleInputKeyDown}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {isAiOpen ? (
              <aside className="absolute inset-y-3 right-3 z-20 flex w-[min(312px,calc(100%-1.5rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setIsAiOpen(false)} className="text-slate-400 transition-colors hover:text-slate-700">
                      <X size={18} />
                    </button>
                      <span className="font-bold text-slate-900">Lumi AI Assistant</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChatHistory([{ role: 'ai', text: starterMessage }])}
                    className={`text-xs font-bold ${accentStyles.buttonSoft}`}
                  >
                    Clear chat
                  </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  {chatHistory.map((message, index) => (
                    <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === 'ai' ? '' : 'flex-row-reverse'}`}>
                      {message.role === 'ai' ? (
                        <div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${accentStyles.softBg} ${accentStyles.text}`}>
                          <MessageSquareCode size={16} />
                        </div>
                      ) : null}
                      <div
                          className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-7 whitespace-pre-wrap ${
                          message.role === 'ai'
                            ? 'rounded-tl-sm bg-slate-100 text-slate-700'
                            : `${accentStyles.button} rounded-tr-sm text-white`
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}

                  {chatHistory.length === 1 ? (
                    <div className="ml-12 space-y-2">
                      <p className="mb-2 text-xs font-medium text-slate-400">Quick actions</p>
                      {quickActions.map((action) => (
                        <button
                          key={action.prompt}
                          type="button"
                          onClick={() => sendAiMessage(action.prompt)}
                          disabled={isAiResponding}
                          className={`w-full rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors ${accent === 'rose' ? 'hover:bg-rose-50' : 'hover:bg-blue-50'}`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  ) : null}

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
                      placeholder="Ask Lumi for hints or bug ideas..."
                      disabled={isAiResponding}
                      className={`w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-11 text-sm text-slate-900 outline-none transition-colors ${accentStyles.panelRing}`}
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isAiResponding}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 disabled:opacity-40 ${accentStyles.buttonSoft}`}
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </aside>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
