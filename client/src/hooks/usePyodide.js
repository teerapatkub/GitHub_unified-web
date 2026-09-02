import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * usePyodide — React hook สำหรับจัดการ Pyodide Web Worker
 * รัน Python code จริงในเบราว์เซอร์ผ่าน WebAssembly
 *
 * กันลูปค้างสองชั้น:
 *  1. interrupt — เขียน 2 (SIGINT) ลง SharedArrayBuffer ที่ worker ตั้งเป็น
 *     setInterruptBuffer ไว้ Pyodide จะ raise KeyboardInterrupt กลางลูป โค้ดหยุด
 *     เองอย่างสะอาด (worker ยังอยู่ ไม่ต้องโหลด Python ใหม่)
 *  2. terminate — ถ้าชั้นแรกไม่ได้ผล (หน้าไม่ได้ cross-origin isolated จึงไม่มี
 *     SharedArrayBuffer หรือ interrupt ไม่ทำงาน) ก็ฆ่า worker ทั้งตัวแล้วสร้างใหม่
 */

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

export default function usePyodide() {
    const [status, setStatus] = useState('idle'); // idle | loading | ready | running | error
    const workerRef = useRef(null);
    const resolveRef = useRef(null);
    const outputRef = useRef([]);
    const onOutputRef = useRef(null);
    const interruptRef = useRef(null);
    const messageHandlerRef = useRef(null);
    const runTimersRef = useRef([]);

    // Initialize worker
    useEffect(() => {
        interruptRef.current = makeInterruptBuffer();

        const onMessage = (e) => {
            const { type, text, status: s, error, success, fsChanges } = e.data;

            switch (type) {
                case 'status':
                    setStatus(s);
                    if (s === 'loading') {
                        outputRef.current.push({ type: 'system', text: '⏳ Loading Python runtime (first time may take a few seconds)...' });
                        onOutputRef.current?.([...outputRef.current]);
                    }
                    if (s === 'ready') {
                        outputRef.current.push({ type: 'system', text: '✅ Python 3.12 ready!' });
                        onOutputRef.current?.([...outputRef.current]);
                    }
                    break;

                case 'stdout':
                    outputRef.current.push({ type: 'stdout', text });
                    onOutputRef.current?.([...outputRef.current]);
                    break;

                case 'stderr':
                    outputRef.current.push({ type: 'stderr', text });
                    onOutputRef.current?.([...outputRef.current]);
                    break;

                case 'run_start':
                    setStatus('running');
                    break;

                case 'result':
                    setStatus('ready');
                    if (resolveRef.current) {
                        resolveRef.current({ success, fsChanges: fsChanges || null, error });
                    }
                    resolveRef.current = null;
                    break;

                case 'error':
                    setStatus('error');
                    outputRef.current.push({ type: 'stderr', text: error });
                    onOutputRef.current?.([...outputRef.current]);
                    break;
            }
        };
        messageHandlerRef.current = onMessage;

        const worker = new Worker('/pyodideWorker.js');
        worker.onmessage = onMessage;
        workerRef.current = worker;
        worker.postMessage({ type: 'init', payload: { interruptBuffer: interruptRef.current } });
        setStatus('loading');

        return () => {
            worker.terminate();
            workerRef.current = null;
        };
    }, []);

    /**
     * รัน Python code
     * @param {string} code — Python code to execute
     * @param {Array} files — game files in the current folder [{name, type, content}]
     * @returns {Promise<{success, fsChanges, error}>}
     */
    const runCode = useCallback((code, files = []) => {
        return new Promise((resolve) => {
            if (!workerRef.current) {
                resolve({ success: false, error: 'Worker not ready' });
                return;
            }

            // Add run header to output
            outputRef.current.push({ type: 'command', text: `>>> Running...` });
            onOutputRef.current?.([...outputRef.current]);

            runTimersRef.current.forEach(clearTimeout);
            runTimersRef.current = [];

            // resolve that also tears down this run's watchdog timers.
            resolveRef.current = (result) => {
                runTimersRef.current.forEach(clearTimeout);
                runTimersRef.current = [];
                resolve(result);
            };

            // Stage 1: ask Python to stop. Only possible with a SharedArrayBuffer;
            // the worker raises KeyboardInterrupt and posts a normal 'result'.
            if (interruptRef.current) {
                runTimersRef.current.push(setTimeout(() => {
                    if (resolveRef.current && interruptRef.current) interruptRef.current[0] = 2;
                }, INTERRUPT_MS));
            }

            // Stage 2: hard fallback. If nothing came back - no SAB, or the
            // interrupt did not land - kill the worker and stand a fresh one up so
            // the whole app is not wedged behind a frozen runtime.
            runTimersRef.current.push(setTimeout(() => {
                if (resolveRef.current) {
                    outputRef.current.push({ type: 'stderr', text: '⏰ โค้ดรันนานเกินไป จึงถูกหยุด (อาจมีลูปที่วนไม่รู้จบ)' });
                    onOutputRef.current?.([...outputRef.current]);
                    const done = resolveRef.current;
                    resolveRef.current = null;
                    setStatus('ready');
                    workerRef.current?.terminate();
                    const nextWorker = new Worker('/pyodideWorker.js');
                    nextWorker.onmessage = messageHandlerRef.current;
                    workerRef.current = nextWorker;
                    nextWorker.postMessage({ type: 'init', payload: { interruptBuffer: interruptRef.current } });
                    done({ success: false, error: 'Timeout' });
                }
            }, TERMINATE_MS));

            workerRef.current.postMessage({
                type: 'run',
                payload: { code, files }
            });
        });
    }, []);

    const clearOutput = useCallback(() => {
        outputRef.current = [{ type: 'system', text: 'Python 3.12 (Pyodide WebAssembly)' }];
        onOutputRef.current?.([...outputRef.current]);
    }, []);

    const setOnOutput = useCallback((fn) => {
        onOutputRef.current = fn;
    }, []);

    return {
        status,
        runCode,
        clearOutput,
        setOnOutput,
        output: outputRef.current
    };
}
