// Printing the expected output instead of computing it (fix list item 1,
// 2026-11-12). Most lesson problems read no input, so every test case expects
// the same output and `print("<answer>")` used to pass. problemGrader.js now
// changes the problem's data and checks the answer changes with it.
const assert = require('node:assert/strict');
const test = require('node:test');
const { gradeSubmission, HARDCODED_MESSAGE } = require('../problemGrader');

const stdio = (solution, input, expected) => ({
  test_kind: 'stdio',
  solution_code: solution,
  test_cases: [{ input, expected }],
});

const SPLIT = stdio('import re\ntext = "apple,banana;orange-grape"\nprint(re.split(r"[,;-]", text))', '', "['apple', 'banana', 'orange', 'grape']");
const ADD = stdio('print(15 + 25)', '', '40');
const HELLO = stdio('print("Hello, Python!")', '', 'Hello, Python!');
const GREET = stdio('name = input()\nprint("สวัสดี", name)', 'Lumi', 'สวัสดี Lumi');
const COUNT = stdio('for i in range(1, 6):\n    print(i)', '', '1\n2\n3\n4\n5');
const GRADE = stdio('score = int(input())\nif score >= 50:\n    print("Pass")\nelse:\n    print("Fail")', '45', 'Fail');
const RED = stdio('colors = ["red", "blue", "red", "green", "red"]\nprint(colors.count("red"))', '', '3');

const rejects = async (problem, code) => {
  const verdict = await gradeSubmission({ problem, code });
  assert.equal(verdict.allPassed, false, code);
  assert.equal(verdict.hardcoded, true, code);
  assert.equal(verdict.results[0].hint, HARDCODED_MESSAGE);
};
const accepts = async (problem, code) => {
  const verdict = await gradeSubmission({ problem, code });
  assert.equal(verdict.allPassed, true, `${code}\n${JSON.stringify(verdict.results)}`);
};

test('printing the answer of a no-input problem does not pass', { timeout: 120_000 }, async () => {
  // The case found on the live site, in Debug Lab.
  await rejects(SPLIT, `print("['apple', 'banana', 'orange', 'grape']")`);
  await rejects(SPLIT, "print(['apple', 'banana', 'orange', 'grape'])");
  await rejects(SPLIT, `text = "apple,banana;orange-grape"\nprint("['apple', 'banana', 'orange', 'grape']")`);
  await rejects(ADD, 'print(40)');
  await rejects(COUNT, 'print(1)\nprint(2)\nprint(3)\nprint(4)\nprint(5)');
  await rejects(RED, 'print(3)');
});

test('printing the answer of a one-case input problem does not pass', { timeout: 120_000 }, async () => {
  await rejects(GREET, 'print("สวัสดี Lumi")');
  await rejects(GRADE, 'print("Fail")');
});

test('answers that compute it another way still pass', { timeout: 120_000 }, async () => {
  await accepts(SPLIT, 'import re\ntext = "apple,banana;orange-grape"\nparts = re.split("[,;-]", text)\nprint(parts)');
  await accepts(SPLIT, 'text = "apple,banana;orange-grape"\nprint(text.replace(";", ",").replace("-", ",").split(","))');
  await accepts(ADD, 'a = 15\nb = 25\nprint(a + b)');
  await accepts(GREET, 'n = input("ชื่อ: ")\nprint("สวัสดี", n)');
  await accepts(COUNT, 'for i in range(5):\n    print(i + 1)');
  await accepts(COUNT, 'i = 1\nwhile i <= 5:\n    print(i)\n    i += 1');
  await accepts(GRADE, 'score = int(input())\nprint("Pass" if score >= 50 else "Fail")');
  await accepts(RED, 'colors = ["red", "blue", "red", "green", "red"]\nn = 0\nfor c in colors:\n    if c == "red":\n        n += 1\nprint(n)');
});

test('a problem whose answer is the text itself still passes when printed', { timeout: 60_000 }, async () => {
  await accepts(HELLO, "print('Hello, Python!')");
});

test('without a reference solution nothing changes', { timeout: 60_000 }, async () => {
  await accepts({ test_kind: 'stdio', test_cases: [{ input: '', expected: '40' }] }, 'print(40)');
});
