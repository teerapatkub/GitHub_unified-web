import React, { useEffect, useRef, useState } from 'react';
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

const PYODIDE_SCRIPT_ID = 'pyodide-runtime-loader';
const PYODIDE_SCRIPT_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';

async function ensurePyodideLoader() {
  if (typeof window.loadPyodide === 'function') {
    return window.loadPyodide;
  }

  let script = document.getElementById(PYODIDE_SCRIPT_ID);
  if (!script) {
    script = document.createElement('script');
    script.id = PYODIDE_SCRIPT_ID;
    script.src = PYODIDE_SCRIPT_URL;
    script.async = true;
    document.head.appendChild(script);
  }

  await new Promise((resolve, reject) => {
    if (typeof window.loadPyodide === 'function') {
      resolve();
      return;
    }

    const handleLoad = () => resolve();
    const handleError = () => reject(new Error('Unable to load Pyodide runtime.'));

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
  });

  await new Promise((resolve, reject) => {
    let attempts = 0;
    const poll = () => {
      if (typeof window.loadPyodide === 'function') {
        resolve();
        return;
      }
      attempts += 1;
      if (attempts > 50) {
        reject(new Error('Pyodide loader is not available.'));
        return;
      }
      setTimeout(poll, 100);
    };
    poll();
  });

  return window.loadPyodide;
}

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
  const [pyodide, setPyodide] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    let isMounted = true;

    const initPyodide = async () => {
      setIsLoading(true);
      try {
        const loadPyodide = await ensurePyodideLoader();
        const instance = await loadPyodide();
        if (!isMounted) return;

        instance.setStdout({
          batched: (text) => {
            if (text.trim()) appendLine(text);
          },
        });
        instance.setStderr({
          batched: (text) => appendLine(`Error: ${text}`),
        });

        const restoreBridge = `
import builtins
from js import requestInputFromJS
async def custom_input(prompt=""):
    return await requestInputFromJS(prompt)
builtins.input = custom_input
`;
        await instance.runPythonAsync(restoreBridge);

        if (!isMounted) return;
        setPyodide(instance);
        setIsLoading(false);
        appendLine('Python runtime ready.');
      } catch (error) {
        if (!isMounted) return;
        setIsLoading(false);
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
      isMounted = false;
      if (window.requestInputFromJS) {
        delete window.requestInputFromJS;
      }
    };
  }, []);

  const normalizeText = (text) => {
    if (!text) return '';
    return text
      .trim()
      .replace(/\r/g, '')
      .replace(/(\d+\.\d{5,})/g, (match) => parseFloat(parseFloat(match).toFixed(2)).toString())
      .replace(/\s+/g, ' ');
  };

  const handleRun = async () => {
    if (!pyodide || isRunning) return;
    setTerminalLines([]);
    setIsRunning(true);
    setIsSuccess(false);
    setHasPassedTests(false);

    try {
      const processedCode = code.replace(/input\(/g, 'await input(');
      const wrappedCode = `import asyncio\nimport sys, builtins\nfrom js import requestInputFromJS\nsys.stdout = sys.__stdout__\nsys.stdin = sys.__stdin__\nasync def custom_input(prompt=""):\n    return await requestInputFromJS(prompt)\nbuiltins.input = custom_input\nasync def __user_code__():\n${processedCode
        .split('\n')
        .map((line) => `    ${line}`)
        .join('\n')}\nawait __user_code__()`;
      await pyodide.runPythonAsync(wrappedCode);
    } catch (error) {
      appendLine(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunTests = async () => {
    if (!pyodide || isRunning) return;
    setIsRunning(true);
    setTerminalLines(['--- Starting auto-grading ---']);
    let allPassed = true;
    setIsSuccess(false);
    setHasPassedTests(false);

    try {
      for (let index = 0; index < testCases.length; index += 1) {
        const test = testCases[index];
        const encodedCode = btoa(unescape(encodeURIComponent(code)));
        const gradingScript = `
import sys, builtins, base64
from io import StringIO
def sync_input(prompt=""):
    return sys.stdin.readline().rstrip('\\n')
builtins.input = sync_input
sys.stdin = StringIO("${test.input}")
sys.stdout = StringIO()
try:
    exec(base64.b64decode("${encodedCode}").decode("utf-8"), {"input": sync_input, "__builtins__": builtins}, {})
    output = sys.stdout.getvalue()
except Exception as e:
    output = str(e)
output.strip()
`;

        const rawResult = await pyodide.runPythonAsync(gradingScript);
        const actual = normalizeText(rawResult);
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
    } catch (error) {
      appendLine(`System Error: ${error.message}`);
      allPassed = false;
    } finally {
      try {
        await pyodide.runPythonAsync(`import builtins\nfrom js import requestInputFromJS\nasync def custom_input(prompt=""):\n    return await requestInputFromJS(prompt)\nbuiltins.input = custom_input`);
      } catch {
        // Ignore bridge restore errors.
      }
      setIsRunning(false);
    }

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
      const response = await axios.post('http://localhost:3001/api/ai/chat', {
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
        <aside className="hidden w-[290px] shrink-0 border-r border-slate-200 bg-slate-50/90 xl:flex xl:flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <p className={`mb-4 text-sm font-black uppercase tracking-[0.24em] ${accentStyles.text}`}>{sectionLabel}</p>
            <h1 className="mb-6 text-3xl font-black tracking-tight text-slate-900 2xl:text-4xl">{title}</h1>

            <h2 className={`mb-4 inline-block border-b-4 pb-1 text-xl font-black ${accentStyles.text} ${accentStyles.border}`}>
              Instructions
            </h2>

            <div className="space-y-4 text-base leading-7 text-slate-700">
              {instructions.map((instruction) => (
                <p key={instruction}>{instruction}</p>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-900 px-5 py-4 font-mono text-sm text-slate-100 shadow-inner">
              <p className="mb-3 text-xs font-bold text-emerald-400">// Example output</p>
              <p className="mb-2 text-slate-300">Input: {example.input}</p>
              <p className="text-base font-bold text-white">Output: {example.output}</p>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white/80 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-base font-black text-slate-900">{progressLabel}</p>
                <p className="mt-1 text-sm text-slate-500">{progressMeta}</p>
              </div>
              <div className="flex items-center gap-3">
                {(rewardXp > 0 || rewardCoins > 0) ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right text-xs font-semibold text-slate-600">
                    <div>Reward</div>
                    <div className="mt-1 font-black text-slate-900">+{rewardXp} XP • +{rewardCoins} Coins</div>
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
          <div className="border-b border-slate-200 bg-white/90 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={`text-sm font-black uppercase tracking-[0.22em] ${accentStyles.text}`}>{sectionLabel}</p>
                <div className="mt-1 flex items-center gap-3">
                  <h2 className="text-2xl font-black text-slate-900">{title}</h2>
                  {subtitle ? (
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${accentStyles.tag}`}>{subtitle}</span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiOpen((value) => !value)}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold shadow-sm transition-colors ${isAiOpen ? `${accentStyles.button} text-white` : `border border-slate-200 bg-white ${accentStyles.buttonSoft}`}`}
              >
                <MessageSquareCode size={18} />
                {isAiOpen ? 'Hide AI' : 'Open AI Helper'}
              </button>
            </div>
          </div>

          <div className={`relative flex-1 min-h-0 transition-[padding] duration-300 ${isAiOpen ? 'pr-0 lg:pr-[336px]' : ''}`}>
            <div className="flex h-full min-h-0 flex-col p-3">
              <div className="rounded-t-2xl border border-slate-200 bg-slate-100/80 px-4 py-2.5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm font-bold text-slate-700">main.py</span>
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

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-2xl border border-t-0 border-slate-200 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
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

                  <div className="absolute bottom-5 left-5 flex gap-2.5">
                    <button
                      type="button"
                      onClick={copyCode}
                      className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-800"
                      title="Copy code"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-800"
                      title="Screenshot"
                    >
                      <Camera size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAiOpen((value) => !value)}
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm transition-colors ${isAiOpen ? `${accentStyles.button} text-white` : `border border-slate-200 bg-white ${accentStyles.buttonSoft}`}`}
                      title="Open AI helper"
                    >
                      <MessageSquareCode size={16} />
                    </button>
                  </div>

                  <div className="absolute bottom-5 right-5 flex gap-2.5">
                    <button
                      type="button"
                      onClick={handleRun}
                      disabled={isRunning || isLoading}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Play size={16} fill="currentColor" />
                      Run
                    </button>
                    <button
                      type="button"
                      onClick={handleRunTests}
                      disabled={isRunning || isLoading}
                      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${isSuccess ? 'bg-emerald-500 hover:bg-emerald-600' : accentStyles.button}`}
                    >
                      {isSuccess ? <CheckCircle2 size={18} /> : null}
                      {isSuccess ? 'Tests Passed' : 'Run Tests'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isRunning || isLoading || isSubmitting || !hasPassedTests}
                      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${accentStyles.button}`}
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                      {submitLabel}
                    </button>
                  </div>
                </div>

                <div className="h-48 shrink-0 border-t border-slate-200 bg-slate-950 text-slate-100">
                  <div className="border-b border-slate-800 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Terminal
                  </div>
                  <div ref={terminalRef} className="h-[calc(100%-43px)] overflow-y-auto p-5 font-mono text-[12px]">
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
