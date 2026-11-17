// English or Thai for lessons, chapters, cosmetics and achievements, with
// Thai when English is missing (fix list item 16.10).
import assert from 'node:assert/strict';
import test from 'node:test';
import { contentDescription, contentName, contentTitle } from './contentText.js';

test('English mode shows English when the row has it', () => {
  assert.equal(contentTitle('en', { title: 'ตัวดำเนินการ', title_en: 'Operators' }), 'Operators');
  assert.equal(contentName('en', { name: 'ธีมอวกาศ', name_en: 'Space Theme' }), 'Space Theme');
  assert.equal(contentDescription('en-US', { description: 'ไทย', description_en: 'English' }), 'English');
});

test('Thai mode is unchanged', () => {
  assert.equal(contentTitle('th', { title: 'ตัวดำเนินการ', title_en: 'Operators' }), 'ตัวดำเนินการ');
  assert.equal(contentName(undefined, { name: 'ธีมอวกาศ', name_en: 'Space Theme' }), 'ธีมอวกาศ');
});

test('missing English falls back to Thai, never a blank', () => {
  assert.equal(contentTitle('en', { title: 'บทที่แอดมินเพิ่ม', title_en: null }), 'บทที่แอดมินเพิ่ม');
  assert.equal(contentName('en', { name: 'แมวส้ม', name_en: '  ' }), 'แมวส้ม');
  assert.equal(contentDescription('en', {}), '');
  assert.equal(contentTitle('en', null), '');
});
