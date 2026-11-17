import test from 'node:test';
import assert from 'node:assert/strict';
import { splitInlineCode } from './inlineCode.js';

// Problem text marks code with backticks; it showed them as literal characters
// (UI review 2026-11-18, P3).
test('backtick spans become code parts, the rest stays text', () => {
  assert.deepEqual(splitInlineCode('ให้ import โมดูล `math` แล้วพิมพ์ `math.pi`'), [
    { code: false, text: 'ให้ import โมดูล ' },
    { code: true, text: 'math' },
    { code: false, text: ' แล้วพิมพ์ ' },
    { code: true, text: 'math.pi' },
  ]);
});

test('text without a closed pair is left exactly as it is', () => {
  assert.deepEqual(splitInlineCode('ราคา 5` บาท'), [{ code: false, text: 'ราคา 5` บาท' }]);
  assert.deepEqual(splitInlineCode('``'), [{ code: false, text: '``' }]);
  assert.deepEqual(splitInlineCode(null), []);
});

test('a span never crosses a line break', () => {
  assert.deepEqual(splitInlineCode('a `b\nc` d'), [{ code: false, text: 'a `b\nc` d' }]);
});
