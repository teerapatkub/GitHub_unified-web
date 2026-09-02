/* Pyodide Web Worker — runs Python code in a separate thread */

let pyodide = null;
let isLoading = false;
// A Uint8Array over a SharedArrayBuffer, handed in by the main thread. Pyodide
// checks it while running Python; when the main-thread watchdog writes 2 (SIGINT)
// into it, a KeyboardInterrupt is raised at the next bytecode check - which is
// how a `while True:` gets stopped instead of freezing forever. Needs the page
// to be cross-origin isolated (COOP/COEP) for SharedArrayBuffer to exist.
let interruptBuffer = null;

// Interactive input(): the worker cannot show a prompt, so it asks the main
// thread and awaits the answer. No Atomics needed - the code runs under
// runPythonAsync, so input() (rewritten to `await input()`) simply awaits a JS
// promise that resolves when the page posts 'input_response' back. This is the
// same bridge the pages used on the main thread, just moved in here.
let pendingInputResolve = null;
self.requestInputFromJS = (prompt) => new Promise((resolve) => {
    pendingInputResolve = resolve;
    self.postMessage({ type: 'input_request', prompt: prompt || '' });
});

// Wrap the learner's code so that input() works and top-level await is allowed.
// input( -> await input( makes the (async) bridge callable inline, and compiling
// with PyCF_ALLOW_TOP_LEVEL_AWAIT lets that await sit at module level. The user
// code is compiled under its own filename, so a traceback's line numbers still
// match the editor.
function buildInteractiveWrapper(code, mainFileName) {
    const processed = String(code == null ? '' : code).replace(/\binput\(/g, 'await input(');
    return [
        'import asyncio, sys, builtins, ast',
        'from js import requestInputFromJS',
        'async def custom_input(prompt=""):',
        '    return await requestInputFromJS(prompt)',
        'builtins.input = custom_input',
        'async def __user_main__():',
        '    local_vars = {}',
        '    compiled = compile(' + JSON.stringify(processed) + ', ' + JSON.stringify(mainFileName || 'main.py') + ', "exec", flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)',
        '    if compiled.co_flags & 0x80:',
        '        await eval(compiled, globals(), local_vars)',
        '    else:',
        '        exec(compiled, globals(), local_vars)',
        'await __user_main__()',
    ].join('\n');
}

self.onmessage = async function (e) {
    const { type, payload } = e.data;

    if (type === 'input_response') {
        // The page collected the learner's typed line; hand it to the awaiting
        // input() call. The main thread also restarts the run watchdog around
        // this, so typing slowly is never mistaken for an infinite loop.
        if (pendingInputResolve) {
            pendingInputResolve(e.data.value == null ? '' : String(e.data.value));
            pendingInputResolve = null;
        }
        return;
    }

    if (type === 'init') {
        if (pyodide || isLoading) return;
        isLoading = true;
        if (payload && payload.interruptBuffer) interruptBuffer = payload.interruptBuffer;
        self.postMessage({ type: 'status', status: 'loading' });
        try {
            // Self-hosted (see client/scripts/sync-pyodide.mjs). A CDN <script> cannot
            // be embedded once the page is cross-origin isolated, and self-hosting is
            // what makes SharedArrayBuffer - and thus killing an infinite loop - possible.
            importScripts('/pyodide/pyodide.js');
            pyodide = await loadPyodide({
                indexURL: '/pyodide/',
                stdout: (text) => self.postMessage({ type: 'stdout', text }),
                stderr: (text) => self.postMessage({ type: 'stderr', text }),
            });
            if (interruptBuffer) {
                try { pyodide.setInterruptBuffer(interruptBuffer); } catch { /* no SAB: falls back to hard terminate */ }
            }
            self.postMessage({ type: 'status', status: 'ready' });
        } catch (err) {
            self.postMessage({ type: 'error', error: 'Failed to load Pyodide: ' + err.message });
        } finally {
            isLoading = false;
        }
    }

    if (type === 'run') {
        if (!pyodide) {
            self.postMessage({ type: 'error', error: 'Python runtime not loaded yet' });
            return;
        }

        const { code, files, workDir, interactive, mainFileName } = payload;
        // Clear a leftover interrupt from a previous run so this one is not
        // killed the instant it starts.
        if (interruptBuffer) interruptBuffer[0] = 0;
        pendingInputResolve = null;

        try {
            // Setup virtual filesystem — create working directory
            const wd = workDir || '/home/user';
            try { pyodide.FS.mkdirTree(wd); } catch { }

            // Write game files into Pyodide FS
            if (files && files.length > 0) {
                for (const f of files) {
                    if (f.type === 'folder') {
                        try { pyodide.FS.mkdirTree(wd + '/' + f.name); } catch { }
                    } else {
                        try {
                            pyodide.FS.writeFile(wd + '/' + f.name, f.content || '');
                        } catch { }
                    }
                }
            }

            // Get list of files BEFORE execution
            let filesBefore = new Set();
            try {
                filesBefore = new Set(pyodide.FS.readdir(wd).filter(n => n !== '.' && n !== '..'));
            } catch { }

            // Change to working directory and run code. Put the cwd on sys.path
            // too, so an exercise whose main.py does `import helper` finds the
            // helper.py written alongside it.
            pyodide.runPython(`
import os, sys
os.chdir("${wd}")
if "" not in sys.path:
    sys.path.insert(0, "")
`);

            self.postMessage({ type: 'run_start' });

            if (interactive) {
                await pyodide.runPythonAsync(buildInteractiveWrapper(code, mainFileName));
            } else {
                await pyodide.runPythonAsync(code);
            }

            // Check for file changes AFTER execution
            let filesAfter = [];
            try {
                const allNames = pyodide.FS.readdir(wd).filter(n => n !== '.' && n !== '..');
                for (const name of allNames) {
                    try {
                        const stat = pyodide.FS.stat(wd + '/' + name);
                        const isDir = pyodide.FS.isDir(stat.mode);
                        if (isDir) {
                            filesAfter.push({ name, type: 'folder', content: undefined });
                        } else {
                            const content = pyodide.FS.readFile(wd + '/' + name, { encoding: 'utf8' });
                            filesAfter.push({ name, type: 'file', content });
                        }
                    } catch { }
                }
            } catch { }

            // Determine changes
            const created = filesAfter.filter(f => !filesBefore.has(f.name));
            const deleted = [...filesBefore].filter(n => !filesAfter.find(f => f.name === n));
            const modified = filesAfter.filter(f => filesBefore.has(f.name));

            self.postMessage({
                type: 'result',
                success: true,
                fsChanges: { created, deleted, modified }
            });

        } catch (err) {
            const errMsg = err.message || String(err);
            // A KeyboardInterrupt here is the watchdog stopping a runaway loop,
            // not a mistake in the learner's logic - say so in plain Thai.
            if (errMsg.includes('KeyboardInterrupt')) {
                const msg = 'โค้ดรันนานเกินไป อาจมีลูปที่วนไม่รู้จบ ระบบจึงหยุดให้ — ลองตรวจเงื่อนไขที่ทำให้ลูปไม่จบ';
                self.postMessage({ type: 'stderr', text: msg });
                self.postMessage({ type: 'result', success: false, error: msg, interrupted: true });
                return;
            }
            // Extract just the Python traceback if available
            const pyErr = errMsg.includes('PythonError')
                ? errMsg.split('\n').filter(l => !l.includes('PythonError')).join('\n')
                : errMsg;
            self.postMessage({ type: 'stderr', text: pyErr });
            self.postMessage({ type: 'result', success: false, error: pyErr });
        }
    }
};
