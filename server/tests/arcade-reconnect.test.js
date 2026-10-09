const { test } = require('node:test');
const assert = require('node:assert/strict');
const { arcadeFixture } = require('./helpers/arcade-fixture');

test('reconnect returns the saved empty draft and the immutable submitted answer with round identity', async t => {
  const { call } = await arcadeFixture(t);
  const matchId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  const read = async () => (await call('/api/arcade/rooms/1/code/alice')).body;
  assert.equal((await read()).has_saved_code, false);
  await call('/api/arcade/rooms/1/code-draft', { body: { match_id: matchId, round_num: 1, code: '' } });
  const saved = await read();
  assert.equal(saved.has_saved_code, true);
  assert.equal(saved.code, '');
  assert.equal(saved.match_id, matchId);
  assert.equal(saved.phase, 'ROUND_1');
  await call('/api/arcade/rooms/1/submit-round', { body: { match_id: matchId, round_num: 1, code: '# accepted' } });
  assert.equal((await read()).has_submitted, true);
  assert.equal((await read()).code, '# accepted');
  await call('/api/arcade/rooms/1/code-draft', { body: { match_id: matchId, round_num: 1, code: '# late draft' } });
  assert.equal((await read()).code, '# accepted');
});

test('a new round returns its own identity and cannot recover an earlier round draft', async t => {
  const { call, db } = await arcadeFixture(t);
  const matchId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  await call('/api/arcade/rooms/1/code-draft', { body: { match_id: matchId, round_num: 1, code: '# round one' } });
  await db.query("UPDATE arcade_rooms SET phase_deadline = clock_timestamp() - INTERVAL '1 second'");
  await require('../arcade/match-ticker').settleDueArcadeRooms({ db, judgeCodeQuality: async () => ({ score: 0 }) });
  const code = (await call('/api/arcade/rooms/1/code/alice')).body;
  assert.equal(code.phase, 'SUMMARY_1');
  assert.equal(code.has_saved_code, false);
  assert.equal((await call('/api/arcade/rooms/1/code-draft', {body:{match_id:matchId,round_num:1,code:'# stale'}})).status,409);
  assert.ok(Number.isFinite((await call('/api/arcade/rooms/1')).body.serverNow));
});

test('late draft retries cannot overwrite a newer confirmed revision', async t => {
  const { call } = await arcadeFixture(t);
  const matchId = (await call('/api/arcade/rooms/1/start', {body:{}})).body.match_id;
  const save = (code, draft_revision) => call('/api/arcade/rooms/1/code-draft', {body:{match_id:matchId,round_num:1,code,draft_revision}});
  assert.equal((await save('# first',0)).body.draft_revision,1);
  assert.equal((await save('# first',0)).status,200);
  assert.equal((await save('# second',1)).body.draft_revision,2);
  assert.equal((await save('# first',0)).status,409);
  const restored = (await call('/api/arcade/rooms/1/code/alice')).body;
  assert.equal(restored.code,'# second');
  assert.equal(restored.draft_revision,2);
});

test('an oversized draft rejection does not prevent saving a corrected draft', async t => {
  const { call } = await arcadeFixture(t);
  const matchId = (await call('/api/arcade/rooms/1/start', {body:{}})).body.match_id;
  const save = code => call('/api/arcade/rooms/1/code-draft', {body:{match_id:matchId,round_num:1,code,draft_revision:0}});
  assert.equal((await save('x'.repeat(20001))).status,400);
  assert.equal((await save('# corrected')).status,200);
  assert.equal((await call('/api/arcade/rooms/1/code/alice')).body.code,'# corrected');
});
