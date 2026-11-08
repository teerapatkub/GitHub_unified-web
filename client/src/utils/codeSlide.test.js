import test from 'node:test';
import assert from 'node:assert/strict';

import { splitCodeSlide } from './codeSlide.js';

test('plain code stays as code with no explanation', () => {
  const content = '# comment\r\nx = 10  # set x\r\nprint(x)';
  assert.deepEqual(splitCodeSlide(content), {
    intro: '',
    code: '# comment\nx = 10  # set x\nprint(x)',
    output: '',
  });
});

test('explanation, example label and expected output are split apart', () => {
  const content = [
    'ลองมาดูคำสั่งแรกที่เรานิยมเขียนกัน นั่นคือคำสั่งแสดงข้อความออกทางหน้าจอค่ะ',
    '',
    'ตัวอย่างโค้ด:',
    'print("Hello, Python!")',
    '',
    'ผลลัพธ์ที่ได้:',
    'Hello, Python!',
  ].join('\r\n');
  assert.deepEqual(splitCodeSlide(content), {
    intro: 'ลองมาดูคำสั่งแรกที่เรานิยมเขียนกัน นั่นคือคำสั่งแสดงข้อความออกทางหน้าจอค่ะ',
    code: 'print("Hello, Python!")',
    output: 'Hello, Python!',
  });
});

test('fenced python blocks are the code and the rest is explanation', () => {
  const content = [
    'หากต้องการเขียนเงื่อนไขอย่างง่าย สามารถใช้โครงสร้าง:',
    '`ค่าเมื่อ True if เงื่อนไข else ค่าเมื่อ False`',
    '',
    'ตัวอย่าง:',
    '```python',
    'age = 20',
    'status = "Adult" if age >= 18 else "Minor"',
    'print(status)  # ผลลัพธ์: Adult',
    '```',
  ].join('\n');
  const parts = splitCodeSlide(content);
  assert.equal(parts.code, 'age = 20\nstatus = "Adult" if age >= 18 else "Minor"\nprint(status)  # ผลลัพธ์: Adult');
  assert.equal(parts.intro, 'หากต้องการเขียนเงื่อนไขอย่างง่าย สามารถใช้โครงสร้าง:\n`ค่าเมื่อ True if เงื่อนไข else ค่าเมื่อ False`\n\nตัวอย่าง:');
  assert.equal(parts.output, '');
});

test('a Thai explanation line before unlabelled code is moved out of the code', () => {
  const content = [
    'Python มี built-in methods สำหรับจัดการ String มากมาย:',
    '',
    'text = "  python  "',
    'print(text.upper())       # แปลงเป็นตัวพิมพ์ใหญ่',
  ].join('\n');
  assert.deepEqual(splitCodeSlide(content), {
    intro: 'Python มี built-in methods สำหรับจัดการ String มากมาย:',
    code: 'text = "  python  "\nprint(text.upper())       # แปลงเป็นตัวพิมพ์ใหญ่',
    output: '',
  });
});

test('a Thai label between two code parts becomes a comment', () => {
  const content = [
    'ตัวอย่างที่ถูกต้อง:',
    'my_score = 100',
    '',
    'ตัวอย่างที่ผิด (รันแล้ว Error):',
    '2total = 50       # ผิด',
  ].join('\n');
  assert.deepEqual(splitCodeSlide(content), {
    intro: 'ตัวอย่างที่ถูกต้อง:',
    code: 'my_score = 100\n\n# ตัวอย่างที่ผิด (รันแล้ว Error):\n2total = 50       # ผิด',
    output: '',
  });
});

test('Thai text inside a string literal is still code', () => {
  const content = 'name = input("กรุณากรอกชื่อของคุณ: ")\nprint("สวัสดีคุณ", name)';
  assert.equal(splitCodeSlide(content).code, content);
  assert.equal(splitCodeSlide(content).intro, '');
});

test('empty content gives empty parts', () => {
  assert.deepEqual(splitCodeSlide(null), { intro: '', code: '', output: '' });
});
