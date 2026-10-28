const crypto = require('node:crypto');
const { gradeSubmission } = require('./problemGrader');
const { runPythonScript } = require('./pythonRunner');

const asList = (value) => Array.isArray(value) ? value : [];

const inputText = (value) => Array.isArray(value)
  ? value.map((item) => String(item ?? '')).join('\n')
  : String(value ?? '');

const expectedText = (value) => Array.isArray(value)
  ? value.map((item) => String(item ?? '')).join('\n')
  : String(value ?? '');

const codeCheckSnippets = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (typeof item === 'string') return [item];
      if (item && typeof item === 'object') {
        return Object.entries(item).flatMap(([key, snippet]) => [key, ...(typeof snippet === 'string' ? [snippet] : [])]);
      }
      return [];
    }).map((item) => item.trim()).filter(Boolean);
  }
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .flatMap(([key, snippet]) => [key, ...(typeof snippet === 'string' ? [snippet] : [])])
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return typeof value === 'string' && value.trim() ? [value.trim()] : [];
};

const isinstanceChecks = (value) => {
  const rows = Array.isArray(value) ? value : [value];
  return rows.flatMap((row) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return [];
    if (row.variable && row.type) return [[String(row.variable), String(row.type).trim()]];
    return Object.entries(row).map(([name, type]) => [String(name), String(type ?? '').trim()]);
  }).filter(([name, type]) => /^[_a-zA-Z]\w*$/.test(name) && type);
};

const isInstanceOfExpectedType = async ({ code, checks, input, files }) => {
  if (!checks.length) return true;

  const marker = `__MINI_GAME_TYPES_${crypto.randomBytes(12).toString('hex')}__`;
  const specs = Buffer.from(JSON.stringify(checks), 'utf8').toString('base64');
  const probe = `import base64, json, runpy
namespace = runpy.run_path("solution.py", run_name="__main__")
checks = json.loads(base64.b64decode("${specs}").decode("utf-8"))
types = {"int": int, "integer": int, "str": str, "string": str, "float": float, "bool": bool, "list": list, "dict": dict, "tuple": tuple, "set": set, "NoneType": type(None)}
result = {name: name in namespace and expected in types and isinstance(namespace[name], types[expected]) for name, expected in checks}
print("${marker}" + json.dumps(result))
`;
  const run = await runPythonScript({
    code: probe,
    input,
    files: { ...files, 'solution.py': String(code || '') },
    mainFileName: '__mini_game_type_probe__.py',
    timeoutMs: 6000,
  });
  if (run.timedOut || run.exitCode !== 0) return false;
  const resultLine = String(run.stdout || '').split(/\r?\n/).find((line) => line.startsWith(marker));
  if (!resultLine) return false;
  try {
    const results = JSON.parse(resultLine.slice(marker.length));
    return checks.every(([name]) => results[name] === true);
  } catch {
    return false;
  }
};

// Accept both the legacy bare correctness array and the current JSONB object:
// { correctness, code_checks, isinstance }. Array input represents consecutive
// calls to input(); array expected represents consecutive print() lines.
async function gradeMiniGameSubmission(code, payload, files = {}) {
  const config = Array.isArray(payload) ? { correctness: payload } : (payload || {});
  const correctness = asList(config.correctness).map((testCase) => ({
    ...testCase,
    input: inputText(testCase?.input),
    expected: expectedText(testCase?.expected ?? testCase?.expected_output),
    match_mode: testCase?.match_mode || 'contains',
  }));
  const snippets = codeCheckSnippets(config.code_checks);
  const typeChecks = isinstanceChecks(config.isinstance);
  const checkVerdict = snippets.every((snippet) => String(code || '').includes(snippet));

  const correctnessResult = correctness.length
    ? await gradeSubmission({ problem: { test_kind: 'stdio', test_cases: correctness }, code, files })
    : { allPassed: true, passed: 0, total: 0, results: [] };

  let typesPassed = 0;
  if (typeChecks.length) {
    const inputs = correctness.length ? correctness.map((testCase) => testCase.input) : [''];
    const typeResults = [];
    for (const input of inputs) {
      typeResults.push(await isInstanceOfExpectedType({ code, checks: typeChecks, input, files }));
    }
    if (typeResults.every(Boolean)) typesPassed = typeChecks.length;
  }

  const passed = correctnessResult.passed
    + (checkVerdict ? snippets.length : 0)
    + typesPassed;
  const total = correctness.length + snippets.length + typeChecks.length;
  const failedCorrectness = correctnessResult.results?.find((item) => !item.passed);
  const hint = failedCorrectness?.hint
    || (!checkVerdict ? 'ตรวจดูว่ามีคำสั่งหรือชื่อตัวแปรตามที่โจทย์กำหนดครบหรือไม่' : '')
    || (typesPassed < typeChecks.length ? 'ตรวจชนิดข้อมูลของตัวแปรตามที่โจทย์กำหนด' : '');

  return {
    accepted: total > 0 && passed === total,
    passed,
    total,
    hint,
    errorLine: failedCorrectness?.errorLine || null,
  };
}

module.exports = { gradeMiniGameSubmission };
