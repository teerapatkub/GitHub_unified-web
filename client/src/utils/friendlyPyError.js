// One place the browser turns a raw Python error into a Thai sentence a beginner
// can act on - the SAME sentence the server grader shows, because both import
// the one translator (server/pythonErrorMessages.js, reached here through the
// `@shared` Vite alias). Before this, every client-side Pyodide surface printed
// Python's own English traceback, which names the fault precisely and tells a
// first-time learner nothing about what to do.
//
// `raw` is usually a Pyodide PythonError.message (a full traceback) but may be
// any string. Returns { kind, message, line, raw }; callers show `message` and
// keep `raw` for a "details" affordance if they have one.
import { explainPythonError } from '@shared/pythonErrorMessages';

export function friendlyPyError(raw) {
  return explainPythonError(String(raw ?? ''));
}

export default friendlyPyError;
