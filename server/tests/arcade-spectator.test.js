// Can a player read someone else's code before they have committed to an answer?
//
// Watching other players is only safe because of one rule: a viewer who can
// still change their own answer is refused. Get that rule wrong and the feature
// turns into a copy button - open the match, click the strongest player, paste.
// So the refusals are what this file mostly tests; the happy path is one case
// out of several.
//
// Everything goes through the HTTP endpoints, not the database, because the
// permission check lives in the endpoint and that is what a browser would reach.
//
// Replaces scripts/arcade-tests/spectator-test.js, which sent no auth token and
// so, after the move to Supabase Auth, got a 401 on every request. The viewer is
// now whoever is signed in, so the two players and the outsider are three real
// signed-in accounts on a server booted against a disposable database.
const assert = require('node:assert/strict');
const test = require('node:test');
const { Pool } = require('pg');
const { createTestDatabase, startServer } = require('./helpers/start-server');

const B = 'spec_b';
const OUTSIDER = 'spec_outsider';
const A_DRAFT = '# A is still thinking\n';
const B_DRAFT = '# B is halfway there\ndef solve():\n    pass\n';
const A_ANSWER = 'def solve():\n    return 42\n';

test('a player sees other players\' code only once their own answer is in', { timeout: 600_000 }, async t => {
  const url = await createTestDatabase(t, 'pyarena_spectator');
  const server = await startServer(t, { url, players: [B, OUTSIDER], env: { LLM_BASE_URL: '', LLM_CHAT_MODEL: '' } });
  const db = new Pool({ connectionString: url, ssl: false });
  // The database is dropped WITH (FORCE) at teardown, which ends idle clients.
  db.on('error', () => {});
  t.after(() => db.end());
  // Arcade unlocks at level 10; the seeded players start below it.
  await db.query('UPDATE users SET level = 10');

  const A = server.username;
  const asA = server.call;
  const asB = server.players[B].call;
  const asOutsider = server.players[OUTSIDER].call;

  const created = await asA('/api/arcade/rooms/create', { body: { room_name: 'Spectator Test', host_name: A, max_players: 5 } });
  assert.equal(created.status, 200, JSON.stringify(created.body));
  const { room_id: roomId, room_code: roomCode } = created.body.room;
  const joined = await asB('/api/arcade/rooms/join', { body: { room_code_or_id: roomCode, user_name: B } });
  assert.equal(joined.status, 200, JSON.stringify(joined.body));
  const started = await asA(`/api/arcade/rooms/${roomId}/start`, { body: {} });
  assert.equal(started.status, 200, JSON.stringify(started.body));
  const round = { match_id: started.body.match_id, round_num: 1 };

  const watch = (call, target) => call(`/api/arcade/rooms/${roomId}/code/${encodeURIComponent(target)}`, { method: 'GET' });
  const draft = (call, code) => call(`/api/arcade/rooms/${roomId}/code-draft`, { body: { ...round, code } });

  // Both players type for a while.
  assert.equal((await draft(asA, A_DRAFT)).status, 200);
  assert.equal((await draft(asB, B_DRAFT)).status, 200);

  await t.test('THE RULE: before submitting, nobody may look at anyone else', async () => {
    const peekAtB = await watch(asA, B);
    assert.equal(peekAtB.status, 403);
    assert.ok(!JSON.stringify(peekAtB.body).includes('halfway'), 'the refusal carries no code');
  });

  // Reading your own row back is always allowed - that is what lets a player
  // who lost their connection pick up where they left off.
  await t.test('a player can always read their own draft back', async () => {
    const ownRow = await watch(asA, A);
    assert.equal(ownRow.status, 200);
    assert.equal(ownRow.body.code, A_DRAFT);
  });

  // Once the answer is in, the round is no longer editable for A, so watching
  // costs nothing.
  const submitted = await asA(`/api/arcade/rooms/${roomId}/submit-round`, { body: { ...round, code: A_ANSWER } });
  assert.equal(submitted.status, 200, JSON.stringify(submitted.body));

  await t.test('after submitting, a player can watch what another is still writing', async () => {
    const watched = await watch(asA, B);
    assert.equal(watched.status, 200);
    assert.equal(watched.body.code, B_DRAFT);
    assert.equal(watched.body.has_submitted, false, 'it says the watched player has not submitted yet');
  });

  await t.test('...and it is one-directional: the player still writing stays refused', async () => {
    assert.equal((await watch(asB, A)).status, 403);
  });

  // A submitted answer is final. A draft arriving afterwards must not change
  // what a spectator sees, or the answer being graded.
  await t.test('a draft sent after submitting has no effect', async () => {
    const late = await draft(asA, 'CHANGED AFTER SUBMITTING');
    assert.equal(late.status, 409, JSON.stringify(late.body));
    assert.equal((await watch(asA, A)).body.code, A_ANSWER);
    assert.equal((await watch(asB, A)).status, 403);
  });

  await t.test('someone who is not in the room cannot watch', async () => {
    assert.equal((await watch(asOutsider, B)).status, 404);
  });
  await t.test('nobody can watch a name that is not in the room', async () => {
    assert.equal((await watch(asA, OUTSIDER)).status, 404);
  });

  // Asking without saying who is asking is refused rather than defaulting to
  // "allowed". The viewer is the signed-in player now, so that means no token.
  await t.test('asking without signing in is refused', async () => {
    const noViewer = await watch(server.anonymous, B);
    assert.equal(noViewer.status, 401);
    assert.ok(!JSON.stringify(noViewer.body).includes('halfway'));
  });
});
