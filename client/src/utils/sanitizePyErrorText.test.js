import test from 'node:test';
import assert from 'node:assert/strict';

import { sanitizePyErrorText } from './sanitizePyErrorText.js';

test('sanitizePyErrorText keeps only the Python traceback and drops browser stack frames', () => {
  const raw = `PythonError: Traceback (most recent call last):
  File "<exec>", line 1, in <module>
    print(Hello)
NameError: name 'Hello' is not defined
    at App (src/App.jsx:42:13)
    at renderWithHooks (src/main.jsx:8:1)`;

  const result = sanitizePyErrorText(raw);

  assert.ok(result.includes('Traceback (most recent call last):'));
  assert.ok(result.includes("NameError: name 'Hello' is not defined"));
  assert.equal(result.includes('at App'), false);
  assert.equal(result.includes('renderWithHooks'), false);
});

test('sanitizePyErrorText strips Pyodide internal frames from the compile traceback', () => {
  const raw = `File "/lib/python312.zip/_pyodide/_base.py", line 149, in _parse_and_compile_gen
    mod = compile(source, filename, mode, flags | ast.PyCF_ONLY_AST)
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<exec>", line 1
    print("Hello")
NameError: name 'Hello' is not defined`;

  const result = sanitizePyErrorText(raw);

  assert.ok(result.includes("NameError: name 'Hello' is not defined"));
  assert.equal(result.includes('/lib/python312.zip/_pyodide/_base.py'), false);
  assert.equal(result.includes('File "<exec>"'), false);
  assert.equal(result.includes('mod = compile'), false);
});

test('sanitizePyErrorText strips coroutine wrapper noise without deleting the real traceback', () => {
  const raw = `Error: Traceback (most recent call last):
await CodeRunner( await coroutine File "main.py", line 1, in <module>
    print(ana)
NameError: name 'ana' is not defined`;

  const result = sanitizePyErrorText(raw);

  assert.ok(result.includes('Traceback (most recent call last):'));
  assert.ok(result.includes('File "main.py", line 1, in <module>'));
  assert.ok(result.includes("NameError: name 'ana' is not defined"));
  assert.equal(result.includes('await CodeRunner'), false);
  assert.equal(result.includes('await coroutine'), false);
});
