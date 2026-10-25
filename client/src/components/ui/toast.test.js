import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toast, subscribeToasts, friendlyError } from './toast.js';

test('every subscriber hears a toast until it unsubscribes', () => {
  const heard = [];
  const stop = subscribeToasts(entry => heard.push(entry));
  toast('ซื้อไม่สำเร็จ');
  stop();
  toast('ไม่ควรได้ยิน');
  assert.deepEqual(heard.map(e => [e.message, e.type]), [['ซื้อไม่สำเร็จ', 'error']]);
});

test('an empty message is not shown', () => {
  const heard = [];
  const stop = subscribeToasts(entry => heard.push(entry));
  assert.equal(toast('   '), null);
  stop();
  assert.equal(heard.length, 0);
});

// The shop used to alert "Unable to equip item" to a Thai page.
test('server text in the wrong language is replaced by the page message', () => {
  assert.equal(friendlyError('Unable to equip item', 'สวมใส่ไม่สำเร็จ', 'th'), 'สวมใส่ไม่สำเร็จ');
  assert.equal(friendlyError('เหรียญไม่พอ', 'ซื้อไม่สำเร็จ', 'th'), 'เหรียญไม่พอ');
  assert.equal(friendlyError('เหรียญไม่พอ', 'Purchase failed', 'en'), 'Purchase failed');
  assert.equal(friendlyError('', 'ซื้อไม่สำเร็จ', 'th'), 'ซื้อไม่สำเร็จ');
});
