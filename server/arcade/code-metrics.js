// Arcade code quality from measurements, not a model (ADR 0007).
//
// quality-probe.py runs the answer on the round's tests and reads its source;
// this file turns that into three scores, 0-100 each, compared with the
// reference answer measured the same way:
//
//   time        lines of code actually executed, as a multiple of the
//               reference's (machine speed and server load do not change it)
//   efficiency  loops nested deeper than the reference, whole-list passes
//               (sorted, .count, .index ...) repeated inside a loop, and an
//               answer far longer than the reference
//   standard    a light PEP 8 check of the lines the player wrote
//
// Quality is their average. The same code always gets the same score, it is
// ready well under a second, and every point lost names the line that lost it.
// How fast the player submitted is scored separately (the round's timeScore).
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { runPythonScript } = require('../pythonRunner');
const { targetFunctionName } = require('../problemGrader');

const PROBE_SOURCE = fs.readFileSync(path.join(__dirname, 'quality-probe.py'), 'utf8');

const RULES = {
  // time: within 25% of the reference is full marks, then 40 points per doubling.
  timeFreeRatio: 1.25,
  timePerDoubling: 40,
  // A run that raised on some test cases did not do the whole job.
  timeCapWhenRaised: 50,
  efficiencyPerExtraLoopLevel: 30,
  efficiencyPerRepeatedCall: 10,
  efficiencyRepeatedCap: 40,
  efficiencyLongAnswerRatio: 2.5,
  efficiencyLongAnswer: 10,
  standardPerFinding: 8,
};

const CRITERIA = ['time', 'efficiency', 'standard'];
const clamp100 = value => Math.max(0, Math.min(100, Math.round(value)));

const asCases = value => {
  if (Array.isArray(value)) return value;
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
};

async function probe({ problem, code, timeoutMs = 5000 }) {
  const marker = `__PYARENA_PROBE_${crypto.randomBytes(12).toString('hex')}__`;
  const payload = {
    code: String(code || ''),
    starter: String(problem?.starter_code || ''),
    kind: problem?.test_kind === 'function' ? 'function' : 'stdio',
    function: targetFunctionName(problem?.solution_code || problem?.starter_code || ''),
    cases: asCases(problem?.test_cases),
    marker,
  };
  const b64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
  const run = await runPythonScript({ code: `__PAYLOAD = "${b64}"\n${PROBE_SOURCE}`, timeoutMs });
  const line = String(run.stdout || '').split('\n').filter(l => l.startsWith(marker)).pop();
  if (!line) return { ok: false, error: run.error || 'probe did not finish', timedOut: true };
  return JSON.parse(line.slice(marker.length));
}

const STYLE_TEXT = {
  'line-too-long': (d) => [`ยาว ${d} ตัวอักษร เกิน 79 ตาม PEP 8`, `${d} characters, over PEP 8's 79`],
  'trailing-whitespace': () => ['มีช่องว่างท้ายบรรทัด', 'trailing whitespace'],
  indentation: () => ['เยื้องไม่ใช่ 4 ช่องว่าง', 'indent is not 4 spaces'],
  semicolon: () => ['ใช้ ; เขียนหลายคำสั่งในบรรทัดเดียว', 'several statements joined with ;'],
  'operator-spacing': (d) => [`ควรเว้นวรรครอบ ${d}`, `put spaces around ${d}`],
  naming: (d) => [`ชื่อ ${d} ควรเป็น snake_case`, `name ${d} should be snake_case`],
  'unused-variable': (d) => [`ตัวแปร ${d} ถูกกำหนดค่าแต่ไม่ได้ใช้`, `${d} is assigned but never used`],
  'compare-singleton': (d) => [`เทียบกับ ${d} ควรใช้ is หรือเขียนเงื่อนไขตรงๆ`, `compare with ${d} using is, or test the value directly`],
  'bare-except': () => ['except: เปล่าจับทุก error ควรระบุชนิด', 'bare except: catches everything; name the error'],
};

// The repeated-call names a reference answer also uses are its own approach,
// not wasted work.
function extraRepeated(answer, reference) {
  const allowance = {};
  for (const call of reference?.repeated || []) allowance[call.name] = (allowance[call.name] || 0) + 1;
  return (answer.repeated || []).filter(call => {
    if (allowance[call.name] > 0) { allowance[call.name] -= 1; return false; }
    return true;
  });
}

/**
 * @param {object} answer    quality-probe output for the player's code
 * @param {object} reference quality-probe output for the reference answer
 * @returns {{score:number, rubric:object, reason:string, feedback:string}}
 *   rubric: { time, efficiency, standard, stepRatio, findings: [{criterion, line, th, en}] }
 */
function scoreQuality(answer, reference) {
  const findings = [];
  const note = (criterion, line, th, en) => findings.push({ criterion, line: line || null, th, en });

  const nothing = () => ({ score: 0, rubric: { time: 0, efficiency: 0, standard: 0, stepRatio: null, findings }, ...summarise(findings) });
  if (answer?.tampered?.length) {
    // Reaching into the probe is how a time score would be faked; it scores
    // nothing rather than whatever the tampering produced.
    const first = answer.tampered[0];
    note('time', first.line || null, `พบโค้ดที่พยายามแก้ไขตัววัด (${first.name}) จึงไม่ให้คะแนนคุณภาพ`,
      `code that tampers with the measurement (${first.name}); no quality points`);
    return nothing();
  }
  if (answer?.timedOut) {
    note('time', null, 'ทำงานนานเกินกำหนด จึงวัดไม่ได้', 'ran too long to be measured');
    return nothing();
  }
  if (!answer?.ok || answer.error?.startsWith('SyntaxError')) {
    note('time', null, 'โค้ดรันไม่ได้ จึงวัดไม่ได้', 'the code does not run, so nothing could be measured');
    return nothing();
  }

  // time
  const referenceSteps = Math.max(1, Number(reference?.steps) || 1);
  const stepRatio = answer.capped ? Infinity : Math.max(0, Number(answer.steps) || 0) / referenceSteps;
  let time = stepRatio <= RULES.timeFreeRatio ? 100
    : 100 - RULES.timePerDoubling * Math.log2(stepRatio / RULES.timeFreeRatio);
  if (answer.capped) {
    time = 0;
    note('time', null, 'ทำงานนานเกินกำหนด (อาจวนลูปไม่รู้จบ)', 'ran far too long (possibly an endless loop)');
  } else if (stepRatio > RULES.timeFreeRatio) {
    note('time', null, `ทำงาน ${stepRatio.toFixed(1)} เท่าของเฉลย`, `did ${stepRatio.toFixed(1)}x the reference's work`);
  }
  if (answer.raised > 0) {
    time = Math.min(time, RULES.timeCapWhenRaised);
    note('time', null, `เกิด error ใน ${answer.raised} เทสเคส`, `raised an error on ${answer.raised} test case(s)`);
  }

  // efficiency
  let efficiency = 100;
  const extraDepth = Math.max(0, (answer.loop_depth || 0) - (reference?.loop_depth || 0));
  if (extraDepth > 0) {
    efficiency -= extraDepth * RULES.efficiencyPerExtraLoopLevel;
    note('efficiency', null, `ลูปซ้อน ${answer.loop_depth} ชั้น เฉลยใช้ ${reference?.loop_depth || 0} ชั้น`,
      `loops nested ${answer.loop_depth} deep; the reference needs ${reference?.loop_depth || 0}`);
  }
  const repeated = extraRepeated(answer, reference);
  efficiency -= Math.min(RULES.efficiencyRepeatedCap, repeated.length * RULES.efficiencyPerRepeatedCall);
  for (const call of repeated.slice(0, 3)) {
    note('efficiency', call.line, `เรียก ${call.name}() ซ้ำในลูป ทำให้ต้องวนข้อมูลทั้งหมดทุกรอบ`,
      `${call.name}() inside a loop goes over the whole data every time`);
  }
  const referenceLines = Math.max(1, Number(reference?.answer_lines) || 1);
  if ((answer.answer_lines || 0) > referenceLines * RULES.efficiencyLongAnswerRatio) {
    efficiency -= RULES.efficiencyLongAnswer;
    note('efficiency', null, `เขียน ${answer.answer_lines} บรรทัด เฉลยใช้ ${referenceLines}`,
      `${answer.answer_lines} lines; the reference uses ${referenceLines}`);
  }

  // standard
  const style = answer.style || [];
  const standard = 100 - style.length * RULES.standardPerFinding;
  for (const finding of style) {
    const [th, en] = (STYLE_TEXT[finding.rule] || (() => [finding.rule, finding.rule]))(finding.detail);
    note('standard', finding.line, th, en);
  }

  const rubric = {
    time: clamp100(time), efficiency: clamp100(efficiency), standard: clamp100(standard),
    stepRatio: Number.isFinite(stepRatio) ? Math.round(stepRatio * 100) / 100 : null,
    findings,
  };
  const score = Math.round(CRITERIA.reduce((sum, key) => sum + rubric[key], 0) / CRITERIA.length);
  return { score, rubric, ...summarise(findings) };
}

const located = f => (f.line ? `บรรทัด ${f.line}: ${f.th}` : f.th);

function summarise(findings) {
  if (!findings.length) return { reason: 'ทำงานได้ใกล้เคียงเฉลย และเขียนตามมาตรฐาน', feedback: '' };
  const byCriterion = CRITERIA.map(c => findings.filter(f => f.criterion === c).length);
  const names = ['เวลา', 'ประสิทธิภาพ', 'มาตรฐาน'].filter((_, i) => byCriterion[i]);
  return {
    reason: `เสียคะแนนด้าน${names.join(' ')}`,
    feedback: findings.slice(0, 4).map(located).join(' · '),
  };
}

module.exports = { RULES, CRITERIA, probe, scoreQuality, summarise };
