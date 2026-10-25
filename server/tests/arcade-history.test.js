const { test } = require('node:test');
const assert = require('node:assert/strict');
const { arcadeFixture } = require('./helpers/arcade-fixture');

// Spec 0005 ticket 10: the history endpoint loaded every round a player ever
// played and sliced it in JavaScript, and offered no way past the newest page.

async function withMatches(t, count) {
  const fixture = await arcadeFixture(t);
  const { db } = fixture;
  for (let i = 1; i <= count; i += 1) {
    const difficulty = i % 2 ? 'easy' : 'hard';
    const mode = i % 3 ? 'standard' : 'quick';
    await db.query(
      `INSERT INTO arcade_matches (room_id, room_code, room_name, difficulty, round_duration_mode, ended_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [1000 + i, `ARC-${String(i).padStart(4, '0')}`, `Room ${i}`, difficulty, mode]
    );
    const [[match]] = await db.query('SELECT match_id FROM arcade_matches WHERE room_id = ?', [1000 + i]);
    for (const round of [1, 2]) {
      await db.query(
        `INSERT INTO arcade_round_history (room_id, match_id, user_name, round_num, code, round_score, difficulty, round_duration_mode, match_ended_at)
         VALUES (?, ?, 'alice', ?, 'pass', ?, ?, ?, CURRENT_TIMESTAMP)`,
        [1000 + i, match.match_id, round, 10 * i + round, difficulty, mode]
      );
    }
  }
  return fixture;
}

const page = (call, query = '') => call(`/api/arcade/players/alice/history${query}`);

test('pages walk every finished match newest first, without repeats or gaps', async t => {
  const { call } = await withMatches(t, 25);
  const seen = [];
  let before = null;
  const sizes = [];
  do {
    const res = await page(call, `?limit=10${before ? `&before=${before}` : ''}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.total_matches, 25);
    sizes.push(res.body.matches.length);
    seen.push(...res.body.matches.map(m => m.match_id));
    before = res.body.next_before;
  } while (before);
  assert.deepEqual(sizes, [10, 10, 5]);
  assert.equal(new Set(seen).size, 25);
  assert.deepEqual(seen, [...seen].sort((a, b) => b - a));
});

test('each match still carries all of its rounds and its total', async t => {
  const { call } = await withMatches(t, 3);
  const [newest] = (await page(call, '?limit=1')).body.matches;
  assert.deepEqual(newest.rounds.map(r => r.round_num), [1, 2]);
  assert.equal(newest.total_score, 31 + 32);
});

test('filters by difficulty and pacing, and the total follows the filter', async t => {
  const { call } = await withMatches(t, 12);
  const easy = (await page(call, '?limit=50&difficulty=easy')).body;
  assert.equal(easy.total_matches, 6);
  assert.ok(easy.matches.every(m => m.difficulty === 'easy'));
  const quickHard = (await page(call, '?limit=50&difficulty=hard&round_duration_mode=quick')).body;
  assert.ok(quickHard.matches.length > 0);
  assert.ok(quickHard.matches.every(m => m.difficulty === 'hard' && m.round_duration_mode === 'quick'));
  assert.equal(quickHard.total_matches, quickHard.matches.length);
});

test('an unknown filter value is ignored rather than passed to SQL', async t => {
  const { call } = await withMatches(t, 2);
  const res = await page(call, "?difficulty=x'%20OR%201=1--");
  assert.equal(res.status, 200);
  assert.equal(res.body.total_matches, 2);
});

test('the old call without paging still answers the newest ten, and others stay private', async t => {
  const { call } = await withMatches(t, 12);
  const res = await page(call);
  assert.equal(res.body.matches.length, 10);
  assert.equal(res.body.next_before, res.body.matches[9].match_id);
  assert.equal((await call('/api/arcade/players/alice/history', { user: 'bob' })).status, 403);
});
