import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatMatchDate, mergeMatchPages, historyQuery } from './matchHistory.js';

// Bug A7: the lobby printed "10/25/2026, 10:02:40 PM" while the rest of the
// site writes Thai dates.
test('Thai dates use the Buddhist year and a Thai month', () => {
  const text = formatMatchDate('2026-10-25 15:02:40', 'th');
  assert.match(text, /2569/);
  assert.match(text, /ต\.ค\./);
  assert.doesNotMatch(text, /2026|PM/);
});

test('server timestamps without a zone are read as UTC', () => {
  assert.equal(formatMatchDate('2026-10-25 15:02:40', 'en'), formatMatchDate('2026-10-25T15:02:40Z', 'en'));
});

test('missing or broken dates render as nothing rather than "Invalid Date"', () => {
  assert.equal(formatMatchDate(null, 'th'), '');
  assert.equal(formatMatchDate('not a date', 'en'), '');
});

test('loading more keeps each match once, newest first', () => {
  const merged = mergeMatchPages([{ match_id: 9 }, { match_id: 8 }], [{ match_id: 8 }, { match_id: 7 }]);
  assert.deepEqual(merged.map(m => m.match_id), [9, 8, 7]);
});

test('the query sends only the filters that narrow anything', () => {
  assert.equal(historyQuery({ limit: 20 }), 'limit=20');
  assert.equal(historyQuery({ limit: 20, before: 41, difficulty: 'all', roundDurationMode: 'quick' }), 'limit=20&before=41&round_duration_mode=quick');
});
