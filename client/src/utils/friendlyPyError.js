// One place the browser turns a raw Python error into a Thai sentence a beginner
// can act on - the SAME sentence the server grader shows, because both import
// the one translator (server/pythonErrorMessages.mjs, reached here through the
// `@shared` Vite alias). Before this, every client-side Pyodide surface printed
// Python's own English traceback, which names the fault precisely and tells a
// first-time learner nothing about what to do.
//
// `raw` is usually a Pyodide PythonError.message (a full traceback) but may be
// any string. Returns { kind, message, line, raw }; callers show `message` and
// keep `raw` for a "details" affordance if they have one.
// A plain named ESM import. The shared file is authored as ESM (.mjs), so both
// the dev server and the production build resolve this the same way, with no
// CommonJS interop in the middle. The server loads the very same file through
// Node's require(ESM).
import { explainPythonError } from '@shared/pythonErrorMessages.mjs';

export function friendlyPyError(raw) {
  return explainPythonError(String(raw ?? ''));
}

export default friendlyPyError;
