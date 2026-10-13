const { gradeSubmission } = require('./problemGrader');

// MiNi Game stores story phrases rather than a whole expected stdout string.
// Adapt that case format; the shared server grader still owns the verdict.
async function gradeMiniGameSubmission(code, cases, files = {}) {
  const testCases = Array.isArray(cases)
    ? cases.map((testCase) => ({ ...testCase, match_mode: 'contains' }))
    : [];
  const result = await gradeSubmission({
    problem: { test_kind: 'stdio', test_cases: testCases },
    code,
    files,
  });
  const failure = result.results?.find((item) => !item.passed);
  return {
    accepted: result.allPassed,
    passed: result.passed,
    total: result.total,
    hint: failure?.hint || '',
    errorLine: failure?.errorLine || null,
  };
}

module.exports = { gradeMiniGameSubmission };
