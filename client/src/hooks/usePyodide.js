import { useState, useRef, useCallback, useEffect, useSyncExternalStore } from 'react';
import { sanitizePyErrorText } from '../utils/sanitizePyErrorText.js';

/**
 * usePyodide — React hook สำหรับจัดการ Pyodide Web Worker
 * รัน Python code จริงในเบราว์เซอร์ผ่าน WebAssembly (ใช้ลองรันดูผลเท่านั้น
 * การตัดสินว่าถูกหรือผิดทำที่ server/problemGrader.js)
 *
 * โหลดแบบ lazy และใช้ worker ตัวเดียวทั้งแอป:
 *  - worker ถูกสร้างครั้งแรกตอนที่มีคนกดรันโค้ดจริง (หรือเรียก preload()) ไม่ใช่ตอน mount
 *    หน้าที่แค่อ่านบทเรียนจึงไม่ต้องโหลด Pyodide ~14 MB
 *  - worker อยู่ระดับ module ไม่ถูก terminate ตอน unmount ย้ายหน้าแล้วไม่ต้องบูต Python ใหม่
 *  - ก่อนบูต hook รายงาน status เป็น 'ready' (แปลว่า "กดรันได้") เพราะ caller ทุกตัว
 *    เปิดปุ่ม Run เมื่อ status === 'ready' — ตอนกดรันครั้งแรกจะเห็น 'loading' ระหว่างโหลด
 *  - การรันจากหลายหน้าถูกต่อคิวทีละงาน เพราะ worker ตัวเดียวรันได้ทีละโปรแกรม
 *
 * กันลูปค้างสองชั้น:
 *  1. interrupt — เขียน 2 (SIGINT) ลง SharedArrayBuffer ที่ worker ตั้งเป็น
 *     setInterruptBuffer ไว้ Pyodide จะ raise KeyboardInterrupt กลางลูป โค้ดหยุด
 *     เองอย่างสะอาด (worker ยังอยู่ ไม่ต้องโหลด Python ใหม่)
 *  2. terminate — ถ้าชั้นแรกไม่ได้ผล (หน้าไม่ได้ cross-origin isolated จึงไม่มี
 *     SharedArrayBuffer หรือ interrupt ไม่ทำงาน) ก็ฆ่า worker ทั้งตัวแล้วสร้างใหม่
 * watchdog เริ่มนับหลังจากโหลด Python เสร็จแล้วเท่านั้น การโหลดครั้งแรกที่ช้าจึงไม่ถูกนับเป็นลูปค้าง
 *
 * รองรับ input() แบบโต้ตอบ: ส่ง options.onInput(prompt) => Promise<string> ให้
 * runCode แล้วเมื่อโค้ดเรียก input() worker จะถาม main thread ผ่าน hook นี้
 * โดย watchdog จะถูก "พัก" ระหว่างรอผู้ใช้พิมพ์ เพื่อไม่ให้การพิมพ์ช้าถูกตัดว่าเป็นลูปค้าง
 */

const WORKER_URL = '/pyodideWorker.js';
const INTERRUPT_MS = 10000; // ขอให้ Python หยุด (raise KeyboardInterrupt)
const TERMINATE_MS = 14000; // ถ้ายังไม่หยุด ฆ่า worker ทิ้งทั้งตัว

// SharedArrayBuffer มีให้ใช้ก็ต่อเมื่อหน้าเป็น cross-origin isolated เท่านั้น
// (ตั้ง COOP/COEP แล้ว) ถ้าไม่มี ก็ยังกันลูปได้ด้วยการ terminate ในชั้นที่สอง
const makeInterruptBuffer = () => {
    try {
        if (typeof SharedArrayBuffer === 'undefined' || !globalThis.crossOriginIsolated) return null;
        return new Uint8Array(new SharedArrayBuffer(1));
    } catch {
        return null;
    }
};

// ---------------------------------------------------------------------------
// Shared runtime (one worker for the whole app)
// ---------------------------------------------------------------------------

const runtime = {
    worker: null,
    state: 'idle',          // idle | loading | ready | error
    ready: null,            // Promise<boolean> settled when the current worker loads (or fails)
    settleReady: null,
    sink: null,             // message handler of the hook instance whose run is active
    interruptBuffer: undefined,
    queue: Promise.resolve(),
    listeners: new Set(),
};

function setRuntimeState(next) {
    if (runtime.state === next) return;
    runtime.state = next;
    runtime.listeners.forEach((fn) => fn());
}

function subscribeRuntime(fn) {
    runtime.listeners.add(fn);
    return () => runtime.listeners.delete(fn);
}

function getRuntimeState() {
    return runtime.state;
}

function bootWorker() {
    if (runtime.interruptBuffer === undefined) runtime.interruptBuffer = makeInterruptBuffer();
    const worker = new Worker(WORKER_URL);
    runtime.worker = worker;
    runtime.ready = new Promise((resolve) => { runtime.settleReady = resolve; });
    worker.onmessage = (e) => {
        if (runtime.worker !== worker) return; // a worker we already replaced
        const { type, status } = e.data || {};
        if (type === 'status') {
            setRuntimeState(status);
            if (status === 'ready') runtime.settleReady?.(true);
        } else if (type === 'error' && runtime.state === 'loading') {
            setRuntimeState('error');
            runtime.settleReady?.(false);
        }
        runtime.sink?.(e);
    };
    setRuntimeState('loading');
    worker.postMessage({ type: 'init', payload: { interruptBuffer: runtime.interruptBuffer } });
}

function discardWorker() {
    runtime.worker?.terminate();
    runtime.worker = null;
    runtime.settleReady?.(false);
    runtime.settleReady = null;
    runtime.ready = null;
}

// Kill a stuck worker and stand a fresh one up straight away, so the next run
// (the learner is clearly running code right now) does not wait on a cold boot.
function restartWorker() {
    discardWorker();
    bootWorker();
}

// Boot the worker if needed and wait until Python is loaded. Resolves false if
// loading failed.
async function ensureRuntime() {
    for (;;) {
        if (!runtime.worker || runtime.state === 'error') {
            discardWorker();
            bootWorker();
        }
        const worker = runtime.worker;
        const ok = await runtime.ready;
        if (runtime.worker === worker) return ok;
        // The worker was replaced while we waited (stop / timeout): wait on the new one.
    }
}

/** Start loading Python in the background without running anything. */
export function preloadPyodide() {
    ensureRuntime();
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export default function usePyodide() {
    const runtimeState = useSyncExternalStore(subscribeRuntime, getRuntimeState);
    const [activeRun, setActiveRun] = useState(false);
    const runRef = useRef(null);       // { resolve, sink, started } for this instance's active run
    const mountedRef = useRef(false);
    const outputRef = useRef([]);
    const onOutputRef = useRef(null);
    const runTimersRef = useRef([]);
    const onInputRef = useRef(null);   // onInput(prompt) => Promise<string> for the active run
    const onStdoutRef = useRef(null);  // per-run stdout(text) callback, for pages with their own terminal
    const onStderrRef = useRef(null);  // per-run stderr(text) callback
    const watchdogRef = useRef(null);  // { start, clear } for the active run

    const pushOutput = useCallback((line) => {
        outputRef.current.push(line);
        onOutputRef.current?.([...outputRef.current]);
    }, []);

    // End this instance's active run: tear down its watchdog, release the
    // shared worker's message stream, and resolve the caller's promise.
    const finishRun = useCallback((result) => {
        const run = runRef.current;
        if (!run) return;
        runRef.current = null;
        runTimersRef.current.forEach(clearTimeout);
        runTimersRef.current = [];
        watchdogRef.current = null;
        onInputRef.current = null;
        onStdoutRef.current = null;
        onStderrRef.current = null;
        if (runtime.sink === run.sink) runtime.sink = null;
        setActiveRun(false);
        run.resolve(result);
    }, []);

    const handleMessage = useCallback((e) => {
        const { type, text, status: s, error, success, fsChanges } = e.data;

        switch (type) {
            case 'status':
                if (s === 'loading') pushOutput({ type: 'system', text: '⏳ Loading Python runtime (first time may take a few seconds)...' });
                if (s === 'ready') pushOutput({ type: 'system', text: '✅ Python 3.12 ready!' });
                break;

            case 'stdout':
                if (onStdoutRef.current) onStdoutRef.current(text);
                pushOutput({ type: 'stdout', text });
                break;

            case 'stderr': {
                const cleanedText = sanitizePyErrorText(text);
                const finalText = cleanedText || text;
                if (onStderrRef.current) onStderrRef.current(finalText);
                pushOutput({ type: 'stderr', text: finalText });
                break;
            }

            case 'output_limit':
                // The worker hit its output cap but has no interrupt buffer
                // (page not cross-origin isolated) to stop Python with, so
                // stop it here the same way the watchdog's last stage does.
                if (!runRef.current) break;
                restartWorker();
                finishRun({ success: false, error: 'Output limit', interrupted: true });
                break;

            case 'input_request': {
                // The worker's input() is waiting. Pause the watchdog (typing
                // is not running code), ask the page for a line, hand it back,
                // then restart the watchdog for the rest of the run.
                watchdogRef.current?.clear();
                const answer = onInputRef.current ? onInputRef.current(e.data.prompt) : Promise.resolve('');
                Promise.resolve(answer).then((value) => {
                    if (runtime.worker) runtime.worker.postMessage({ type: 'input_response', value });
                    watchdogRef.current?.start();
                });
                break;
            }

            case 'result':
                // `interrupted` marks a loop the watchdog stopped: the worker
                // already put a clear Thai message on stderr, so callers can
                // skip translating `error` again.
                finishRun({ success, fsChanges: fsChanges || null, error, interrupted: Boolean(e.data.interrupted) });
                break;

            case 'error': {
                const cleanedError = sanitizePyErrorText(error);
                pushOutput({ type: 'stderr', text: cleanedError || error });
                break;
            }
        }
    }, [pushOutput, finishRun]);

    const runOnce = useCallback((code, files, options) => {
        const { interactive = false, onInput = null, mainFileName = 'main.py', onStdout = null, onStderr = null } = options;
        return new Promise((resolve) => {
            if (!mountedRef.current) {
                // Queued by a page the learner has already left.
                resolve({ success: false, error: 'Stopped', interrupted: true });
                return;
            }

            onInputRef.current = onInput;
            onStdoutRef.current = onStdout;
            onStderrRef.current = onStderr;

            // Add run header to output
            pushOutput({ type: 'command', text: `>>> Running...` });

            const sink = (e) => handleMessage(e);
            const run = { resolve, sink, started: false };
            runRef.current = run;
            runtime.sink = sink;
            setActiveRun(true);

            ensureRuntime().then((ok) => {
                if (runRef.current !== run) return; // stopped while Python was loading
                if (!ok || !runtime.worker) {
                    finishRun({ success: false, error: 'Worker not ready' });
                    return;
                }

                const clearWatchdog = () => {
                    runTimersRef.current.forEach(clearTimeout);
                    runTimersRef.current = [];
                };
                const startWatchdog = () => {
                    clearWatchdog();
                    // Stage 1: ask Python to stop (needs a SharedArrayBuffer). The
                    // worker raises KeyboardInterrupt and posts a normal 'result'.
                    if (runtime.interruptBuffer) {
                        runTimersRef.current.push(setTimeout(() => {
                            if (runRef.current === run && runtime.interruptBuffer) runtime.interruptBuffer[0] = 2;
                        }, INTERRUPT_MS));
                    }
                    // Stage 2: hard fallback - kill the worker and stand a fresh one up
                    // so the whole app is not wedged behind a frozen runtime.
                    runTimersRef.current.push(setTimeout(() => {
                        if (runRef.current !== run) return;
                        pushOutput({ type: 'stderr', text: '⏰ โค้ดรันนานเกินไป จึงถูกหยุด (อาจมีลูปที่วนไม่รู้จบ)' });
                        finishRun({ success: false, error: 'Timeout' });
                        restartWorker();
                    }, TERMINATE_MS));
                };

                run.started = true;
                watchdogRef.current = { start: startWatchdog, clear: clearWatchdog };
                startWatchdog();

                runtime.worker.postMessage({
                    type: 'run',
                    payload: { code, files, interactive, mainFileName }
                });
            });
        });
    }, [pushOutput, handleMessage, finishRun]);

    /**
     * รัน Python code (โหลด Python ให้ก่อนถ้ายังไม่ได้โหลด)
     * @param {string} code — Python code to execute
     * @param {Array} files — game files in the current folder [{name, type, content}]
     * @param {Object} [options] — { interactive, onInput, mainFileName, onStdout, onStderr }
     * @returns {Promise<{success, fsChanges, error}>}
     */
    const runCode = useCallback((code, files = [], options = {}) => {
        const job = runtime.queue.then(() => runOnce(code, files, options));
        runtime.queue = job.then(() => {}, () => {});
        return job;
    }, [runOnce]);

    const stopRun = useCallback(() => {
        const run = runRef.current;
        if (!run) return false;
        finishRun({ success: false, error: 'Stopped', interrupted: true });
        // Still loading: nothing is running yet, so keep the download going.
        if (run.started) restartWorker();
        return true;
    }, [finishRun]);

    useEffect(() => {
        mountedRef.current = true;
        // A load that failed earlier gets a fresh try when a page mounts again.
        if (runtime.state === 'error' && !runtime.sink) {
            discardWorker();
            setRuntimeState('idle');
        }
        return () => {
            mountedRef.current = false;
            // The worker is shared and stays alive, but a run this page started
            // (e.g. waiting on input()) must not hold the queue for other pages.
            stopRun();
        };
    }, [stopRun]);

    const clearOutput = useCallback(() => {
        outputRef.current = [{ type: 'system', text: 'Python 3.12 (Pyodide WebAssembly)' }];
        onOutputRef.current?.([...outputRef.current]);
    }, []);

    const setOnOutput = useCallback((fn) => {
        onOutputRef.current = fn;
    }, []);

    // 'ready' means "runCode may be called" - it boots Python itself if needed.
    let status;
    if (runtimeState === 'error' && !activeRun) status = 'error';
    else if (runtimeState === 'loading') status = 'loading';
    else if (activeRun) status = 'running';
    else status = 'ready';

    return {
        status,
        runCode,
        stopRun,
        clearOutput,
        setOnOutput,
        preload: preloadPyodide,
    };
}
