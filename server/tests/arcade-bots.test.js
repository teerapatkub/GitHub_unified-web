const { test } = require('node:test');
const assert = require('node:assert/strict');
const { arcadeFixture } = require('./helpers/arcade-fixture');

test('host adds explicitly typed bots while a human named Bot_alice stays human', async t => {
  const { db, call } = await arcadeFixture(t);
  await db.query("UPDATE users SET username = 'Bot_alice' WHERE username = 'alice'");
  await db.query("UPDATE arcade_participants SET user_name = 'Bot_alice' WHERE user_name = 'alice'");
  await db.query("UPDATE arcade_rooms SET host_name = 'Bot_alice'");
  assert.equal((await call('/api/arcade/rooms/1/add-bot', { user: 'bob', body: {} })).status, 403);
  const added = await call('/api/arcade/rooms/1/add-bot', { body: {} });
  assert.equal(added.status, 200);
  assert.equal(added.body.participants.find(p => p.user_name === 'Bot_alice').participant_kind, 'human');
  assert.equal(added.body.participants.find(p => p.user_name === added.body.bot_name).participant_kind, 'bot');
  assert.equal((await call('/api/arcade/rooms/1/code/Bot_alice')).body.is_bot, false);
});

const { settleDueArcadeRooms } = require('../arcade/match-ticker');
const { choiceOptions } = require('../arcade/round-kinds');
const { randomUUID } = require('node:crypto');
async function botMatch(t, { bots = 1 } = {}) {
  const f = await arcadeFixture(t);
  const botNames = [];
  for (let i = 0; i < bots; i++) botNames.push((await f.call('/api/arcade/rooms/1/add-bot', { body: {} })).body.bot_name);
  const botName = botNames[0];
  const matchId = (await f.call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  await f.db.query("UPDATE arcade_participants SET cash = 5000, bot_profile = CASE WHEN participant_kind = 'bot' THEN 'bot_pyninja' END");
  const tick = () => settleDueArcadeRooms({ db: f.db, random: () => 0, judgeArcadeCode: async () => ({ score: 0 }) });
  const room = async () => (await f.call('/api/arcade/rooms/1')).body;
  const read = async (user = 'alice') => (await f.call(`/api/arcade/rooms/1/shop?match_id=${matchId}`, { user })).body;
  const phase = name => f.db.query('UPDATE arcade_rooms SET phase = ?, phase_deadline = clock_timestamp() + INTERVAL \'5 minutes\'', [name]);
  const give = async id => {
    const item = require('../../shared/arcadeConfig.json').shopItems.find(i => i.id === id);
    await f.db.query('INSERT INTO arcade_shop_states (match_id,user_name,inventory) VALUES (?,?,?) ON CONFLICT (match_id,user_name) DO UPDATE SET inventory = EXCLUDED.inventory', [matchId,botName,JSON.stringify([{...item,instance_id:randomUUID()}])]);
    await f.db.query("UPDATE arcade_participants SET bot_state = '{}' WHERE participant_kind = 'bot'");
  };
  // Open a round that began `secondsIn` seconds ago on the database clock.
  const roundAt = (name, secondsIn, roundSeconds = 60) => f.db.query(
    'UPDATE arcade_rooms SET phase = ?, phase_deadline = clock_timestamp() + make_interval(secs => ?)',
    [name, roundSeconds - secondsIn]);
  const setBot = (name, state) => f.db.query('UPDATE arcade_participants SET bot_state = ? WHERE user_name = ?', [JSON.stringify(state), name]);
  const attackBot = (name, type, ms) => f.db.query(
    'INSERT INTO arcade_shop_states (match_id,user_name,attack_effects) VALUES (?,?,?) ON CONFLICT (match_id,user_name) DO UPDATE SET attack_effects = EXCLUDED.attack_effects',
    [matchId, name, JSON.stringify(type ? [{ type, phase: 'ROUND_2', expiresAt: Date.now() + ms, instance_id: randomUUID(), attacker: 'alice' }] : [])]);
  // Move the whole round `ms` into the past instead of waiting for it: the
  // deadline and every stored bot timestamp shift together, so elapsed round
  // time advances by `ms` for the ticker and the finalizer alike.
  const elapse = async ms => {
    await f.db.query('UPDATE arcade_rooms SET phase_deadline = phase_deadline - make_interval(secs => ?)', [ms / 1000]);
    await f.db.query('UPDATE arcade_participants SET submitted_at = submitted_at - make_interval(secs => ?) WHERE submitted_at IS NOT NULL', [ms / 1000]);
    const [bots] = await f.db.query("SELECT user_name, bot_state FROM arcade_participants WHERE participant_kind = 'bot'");
    for (const { user_name, bot_state: s } of bots) {
      for (const key of ['lastProgress', 'finishedAt', 'lastUse']) if (typeof s[key] === 'number') s[key] -= ms;
      await setBot(user_name, s);
    }
  };
  // Run the round out to one second past its deadline.
  const expire = async () => {
    const [[{ ms }]] = await f.db.query('SELECT EXTRACT(EPOCH FROM (phase_deadline - clock_timestamp()::timestamp)) * 1000 AS ms FROM arcade_rooms');
    await elapse(Number(ms) + 1000);
  };
  // Record that a bot's bar reached 100% `secondsIn` seconds into the room's
  // current round, measured on the same clock readPhaseClock() uses.
  const finishBot = (name, secondsIn, roundSeconds = 60) => f.db.query(
    `UPDATE arcade_participants p SET bot_state = p.bot_state || jsonb_build_object('phase', r.phase, 'progress', 100,
      'finishedAt', EXTRACT(EPOCH FROM clock_timestamp()) * 1000
        + EXTRACT(EPOCH FROM (r.phase_deadline - clock_timestamp()::timestamp)) * 1000 - (?::numeric - ?::numeric) * 1000)
     FROM arcade_rooms r WHERE r.room_id = p.room_id AND p.user_name = ?`, [roundSeconds, secondsIn, name]);
  const scoreOf = async name => (await room()).participants.find(p => p.user_name === name).score;
  return { ...f, botName, botNames, matchId, tick, room, read, phase, give, roundAt, setBot, attackBot, elapse, expire, finishBot, scoreOf };
}

test('server bots buy with real cash and concurrent ticks apply one shared attack', async t => {
  const f = await botMatch(t);
  await f.phase('SHOP_1');
  await f.tick();
  const bot = (await f.room()).participants.find(p => p.user_name === f.botName);
  assert.equal(bot.cash, 4350); // Greedy PyNinja, neck and neck with everyone, buys the 650-coin Score Booster.
  await f.give('cashSteal');
  await f.phase('ROUND_2');
  assert.deepEqual(await Promise.all([f.tick(), f.tick()]), [[], []]);
  assert.equal((await f.read()).cash, 4700);
  assert.equal((await f.room()).participants.find(p => p.user_name === f.botName).cash, 4650);
  await f.tick();
  assert.equal((await f.read()).cash, 4700);
});

test('a client cannot act through a bot row even if an account later takes that name', async t => {
  const f = await botMatch(t);
  await f.phase('ROUND_2');
  await f.give('cashSteal');
  await f.db.query('UPDATE users SET username = ? WHERE username = ?', [f.botName, 'outsider']);
  const used = await f.call('/api/arcade/rooms/1/shop', { user: 'outsider', body: { match_id: f.matchId, phase: 'ROUND_2', request_id: randomUUID(), action: 'reroll' } });
  assert.equal(used.status, 403);
  const submitted = await f.call('/api/arcade/rooms/1/submit-round', { user: 'outsider', body: { match_id: f.matchId, round_num: 2, code: 'print(1)' } });
  assert.equal(submitted.status, 403);
  assert.equal((await f.call(`/api/arcade/rooms/1/shop?match_id=${f.matchId}`, {user:'outsider'})).status,403);
});

test('Bot_ human answers are graded and receive normal wallet rewards', async t => {
  const { db, call } = await arcadeFixture(t);
  await db.query("UPDATE users SET username = 'Bot_alice' WHERE username = 'alice'");
  await db.query("UPDATE arcade_participants SET user_name = 'Bot_alice' WHERE user_name = 'alice'");
  await db.query("UPDATE arcade_rooms SET host_name = 'Bot_alice'");
  const matchId = (await call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  await db.query("UPDATE arcade_rooms SET phase = 'ROUND_2'");
  await call('/api/arcade/rooms/1/submit-round', { body: { match_id: matchId, round_num: 2, code: '# human answer' } });
  await db.query("UPDATE arcade_rooms SET phase_deadline = clock_timestamp() - INTERVAL '1 second'");
  // No test ran, so quality is half the judge's 34 (ADR 0006).
  await settleDueArcadeRooms({ db, judgeArcadeCode: async () => ({ score: 34 }) });
  assert.equal((await call('/api/arcade/rooms/1')).body.participants.find(p => p.user_name === 'Bot_alice').score, 17);
  assert.equal((await call('/api/auth/me')).body.virtual_currency, 50);
  assert.equal((await call('/api/arcade/players/Bot_alice/history')).body.matches[0].rounds[0].code, '# human answer');
});

test('bot shields block one hit and a saved revenge target outranks the score leader', async t => {
  const f = await botMatch(t);
  await f.phase('ROUND_2');
  await f.give('shield');
  await f.tick();
  await f.db.query("UPDATE arcade_participants SET bot_profile = 'bot_nullpointer' WHERE participant_kind = 'bot'");
  await f.db.query("UPDATE arcade_participants SET score = 999 WHERE user_name = 'alice'");
  const attack = async () => {
    const item = { id:'cashSteal', type:'attack', price:600, instance_id:randomUUID() };
    await f.db.query('INSERT INTO arcade_shop_states (match_id,user_name,inventory) VALUES (?,\'bob\',?) ON CONFLICT (match_id,user_name) DO UPDATE SET inventory = EXCLUDED.inventory', [f.matchId,JSON.stringify([item])]);
    return f.call('/api/arcade/rooms/1/shop', {user:'bob',body:{match_id:f.matchId,phase:'ROUND_2',action:'consume',instance_id:item.instance_id,target_name:f.botName,request_id:randomUUID()}});
  };
  assert.equal((await attack()).body.attackResult.targets[0].blocked,true);
  assert.equal((await attack()).body.attackResult.targets[0].stolen,300);
  const ink={id:'inkFog',type:'attack',price:400,instance_id:randomUUID()};
  await f.db.query('UPDATE arcade_shop_states SET inventory = ? WHERE user_name = ?', [JSON.stringify([ink]),f.botName]);
  await f.db.query("UPDATE arcade_participants SET bot_state = bot_state || '{\"lastUse\":0}' WHERE participant_kind = 'bot'");
  await f.tick();
  assert.equal((await f.read('bob')).attackEffects[0]?.attacker,f.botName);
  assert.deepEqual((await f.read()).attackEffects,[]);
});

test('bot multiplier is consumed server-side and doubles only its activation round score', async t => {
  const f = await botMatch(t);
  await f.phase('ROUND_2');
  await f.give('scoreMultiplier');
  await f.tick();
  await f.expire();
  // Deterministic randomness is a system boundary: default difficulty with
  // 3 cases gives 1 pass, quality 35, and a bar that filled the instant the
  // round opened earns time 33.33 = 102; owned multiplier makes 204.
  await f.finishBot(f.botName, 0);
  await settleDueArcadeRooms({db:f.db,random:()=>0,judgeArcadeCode:async()=>({score:0})});
  assert.equal((await f.room()).participants.find(p=>p.user_name===f.botName).score,204);
  await f.db.query("UPDATE arcade_rooms SET phase = 'ROUND_3', phase_deadline = clock_timestamp() - INTERVAL '1 second'");
  await f.db.query('UPDATE arcade_participants SET is_eliminated = 0');
  await f.finishBot(f.botName, 0);
  await settleDueArcadeRooms({db:f.db,random:()=>0,judgeArcadeCode:async()=>({score:0})});
  // Round 3's problem has 2 cases; the default band now starts at 20%, which
  // rounds to no passes, so only quality 35 is added - and no multiplier.
  assert.equal((await f.room()).participants.find(p=>p.user_name===f.botName).score,239);
});

test('bot AOE is shared by both players and retry after a database fault has no partial effects', async t => {
  const f = await botMatch(t);
  await f.phase('ROUND_2');
  await f.give('timeFreeze');
  await f.db.query("CREATE FUNCTION reject_bot_save() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.participant_kind = 'bot' THEN RAISE EXCEPTION 'bot save failed'; END IF; RETURN NEW; END $$");
  await f.db.query('CREATE TRIGGER fail_bot_save BEFORE UPDATE ON arcade_participants FOR EACH ROW EXECUTE FUNCTION reject_bot_save()');
  assert.equal((await f.tick()).length,1);
  assert.deepEqual((await f.read()).attackEffects,[]);
  assert.deepEqual((await f.read('bob')).attackEffects,[]);
  await f.db.query('DROP TRIGGER fail_bot_save ON arcade_participants');
  assert.deepEqual(await f.tick(),[]);
  // Keep this rollback/idempotency check independent of hosted-database
  // latency. The public read intentionally filters an effect after its real
  // five-second lifetime, while the committed rows retain the activation.
  const [targetStates] = await f.db.query(`SELECT user_name, attack_effects
    FROM arcade_shop_states WHERE match_id = ? AND user_name IN ('alice', 'bob')
    ORDER BY user_name`, [f.matchId]);
  const first = targetStates[0].attack_effects;
  assert.equal(first[0].type,'timeFreeze');
  assert.deepEqual(targetStates[1].attack_effects,first);
  await f.tick();
  // A hosted database can take longer than this item's five-second visible
  // duration to complete another full bot tick. Verify the retry did not add
  // or replace the persisted effect; the public snapshot is allowed to filter
  // it once its real wall-clock lifetime has elapsed.
  const [[saved]] = await f.db.query('SELECT attack_effects FROM arcade_shop_states WHERE match_id = ? AND user_name = ?', [f.matchId, 'alice']);
  assert.deepEqual(saved.attack_effects, first);
});

test('eliminated bots and summary screens cannot buy or attack', async t => {
  const f = await botMatch(t);
  await f.give('cashSteal');
  await f.phase('SUMMARY_1');
  await f.tick();
  assert.equal((await f.read()).cash,5000);
  await f.phase('ROUND_2');
  await f.db.query("UPDATE arcade_participants SET is_eliminated = 1 WHERE participant_kind = 'bot'");
  await f.tick();
  assert.equal((await f.read()).cash,5000);
  await f.phase('SHOP_1');
  await f.tick();
  assert.equal((await f.room()).participants.find(p=>p.user_name===f.botName).cash,5000);
});

test('bot progress survives worker restart and freezes while a real attack is active', async t => {
  const f = await botMatch(t);
  await f.phase('ROUND_2');
  await f.db.query("UPDATE arcade_participants SET bot_state = ? WHERE participant_kind = 'bot'",[JSON.stringify({phase:'ROUND_2',progress:30,stepsToFinish:25,lastProgress:Date.now()-6000,lastUse:Date.now()})]);
  await f.tick();
  const readBot = async () => (await f.room()).participants.find(p=>p.user_name===f.botName);
  const progressed = (await readBot()).bot_progress;
  // Hosted database latency legitimately adds typing steps between the saved
  // timestamp and the worker lock. The contract here is forward progress that
  // persists across reads; the exact percentage belongs to the worker clock.
  assert.ok(progressed>30 && progressed<=100);
  const attack = {type:'inkFog',phase:'ROUND_2',expiresAt:Date.now()+15000,instance_id:randomUUID(),attacker:'alice'};
  await f.db.query('UPDATE arcade_shop_states SET attack_effects = ? WHERE user_name = ?',[JSON.stringify([attack]),f.botName]);
  await f.tick();
  assert.equal((await readBot()).bot_progress,progressed);
  assert.equal((await f.call('/api/arcade/rooms/1',{user:'bob'})).body.participants.find(p=>p.user_name===f.botName).bot_progress,progressed);
  assert.equal(Object.hasOwn(await readBot(),'bot_state'),false);
});

// Fog and Freeze pause a bot's bar. Its round score is read from that bar:
// speed points come from the moment it reached 100%, and a bar that never got
// there passes only its share of the cases and earns no speed points.
const settleRound = f => settleDueArcadeRooms({ db: f.db, random: () => 0, judgeArcadeCode: async () => ({ score: 0 }) });

test('an ink-fogged bot finishes later and scores less than an identical unattacked bot', async t => {
  const f = await botMatch(t, { bots: 2 });
  const [clear, fogged] = f.botNames;
  await f.roundAt('ROUND_2', 30);
  const start = { phase: 'ROUND_2', progress: 0, stepsToFinish: 20, lastProgress: Date.now() - 30000, lastUse: Date.now() };
  await f.setBot(clear, start);
  await f.setBot(fogged, start);
  await f.attackBot(fogged, 'inkFog', 15000);
  await f.tick();
  const progressOf = async name => (await f.room()).participants.find(p => p.user_name === name).bot_progress;
  // PyNinja types a step every 1.2 s: 20 steps fill the bar 24 s into the round.
  assert.equal(await progressOf(clear), 100);
  assert.equal(await progressOf(fogged), 0);
  // The fog lifts and 26 more seconds pass: the fogged twin fills its bar at 54 s.
  await f.attackBot(fogged, null);
  await f.elapse(26000);
  await f.tick();
  assert.equal(await progressOf(fogged), 100);
  await f.expire();
  await settleRound(f);
  // Same skill roll for both: 1 of 3 cases (33.33) and quality 35. Only the
  // speed leg differs - 1/3 x 36/60 = 20 for the clear bot, 1/3 x 6/60 = 3.33
  // for the fogged one.
  assert.equal(await f.scoreOf(clear), 88);
  assert.equal(await f.scoreOf(fogged), 72);
});

test('a bot frozen until the deadline is scored on the share of its bar it filled', async t => {
  const f = await botMatch(t, { bots: 2 });
  const [finished, frozen] = f.botNames;
  await f.roundAt('ROUND_2', 30);
  await f.finishBot(finished, 30);
  await f.setBot(frozen, { phase: 'ROUND_2', progress: 50, stepsToFinish: 20, lastProgress: Date.now() - 10000, lastUse: Date.now() });
  await f.attackBot(frozen, 'timeFreeze', 40000);
  await f.tick();
  assert.equal((await f.room()).participants.find(p => p.user_name === frozen).bot_progress, 50);
  await f.expire();
  await settleDueArcadeRooms({ db: f.db, random: () => 0.99, judgeArcadeCode: async () => ({ score: 0 }) });
  // Skill roll 0.99 on default: 79% of 3 cases and quality 79. Finished at the
  // halfway mark: 2 cases (66.67) + 79 + 2/3 x 1/2 = 33.33 -> 179. Half a bar:
  // round(3 x 0.79 x 0.5) = 1 case (33.33) + 79 + no speed points -> 112.
  assert.equal(await f.scoreOf(finished), 179);
  assert.equal(await f.scoreOf(frozen), 112);
});

test('a bot that never worked this round earns only its quality score', async t => {
  const f = await botMatch(t);
  await f.roundAt('ROUND_2', 30);
  // Progress saved from last round belongs to last round.
  await f.setBot(f.botName, { phase: 'ROUND_1', progress: 100, finishedAt: Date.now() - 60000 });
  await f.expire();
  await settleRound(f);
  assert.equal(await f.scoreOf(f.botName), 35);
});

test('a Quick Mode bot fills its bar in the same share of the round as in a standard round', async t => {
  const f = await botMatch(t);
  await f.db.query("UPDATE arcade_rooms SET round_duration_mode = 'quick'");
  await f.roundAt('ROUND_2', 15, 30);
  await f.setBot(f.botName, { phase: 'ROUND_2', progress: 0, stepsToFinish: 20, lastProgress: Date.now() - 15000, lastUse: Date.now() });
  await f.tick();
  // A 30 s round paces a 1.2 s typist at 0.6 s a step: 20 steps end 12 s in,
  // 40% of the round - the same share as 24 s of a 60 s round.
  assert.equal((await f.room()).participants.find(p => p.user_name === f.botName).bot_progress, 100);
  await f.expire();
  await settleRound(f);
  assert.equal(await f.scoreOf(f.botName), 88);
});

// Playtest 2026-10-17: bots spent their attacks on the score leader even after
// that player had submitted. A submitted player's editor is already locked, so
// the debuff did nothing and the opponent still typing went untouched.
test('bot attacks skip a player who has already submitted this round', async t => {
  const f = await botMatch(t);
  await f.phase('ROUND_2');
  await f.db.query("UPDATE arcade_participants SET bot_profile = 'bot_bughunter' WHERE participant_kind = 'bot'");
  await f.db.query("UPDATE arcade_participants SET score = 999 WHERE user_name = 'alice'");
  assert.equal((await f.call('/api/arcade/rooms/1/submit-round', { body: { match_id: f.matchId, round_num: 2, code: 'print(1)' } })).status, 200);
  const ink = { id: 'inkFog', type: 'attack', price: 400, instance_id: randomUUID() };
  await f.db.query('INSERT INTO arcade_shop_states (match_id,user_name,inventory) VALUES (?,?,?) ON CONFLICT (match_id,user_name) DO UPDATE SET inventory = EXCLUDED.inventory', [f.matchId, f.botName, JSON.stringify([ink])]);
  await f.db.query("UPDATE arcade_participants SET bot_state = '{}' WHERE participant_kind = 'bot'");
  await f.tick();
  assert.equal((await f.read('bob')).attackEffects[0]?.attacker, f.botName);
  assert.deepEqual((await f.read()).attackEffects, []);
});

// Picking a persona with replacement put three Bot_SyntaxPro in one room.
test('added bots use a different persona until every persona is in the room', async t => {
  const { db, call } = await arcadeFixture(t);
  await db.query('UPDATE arcade_rooms SET max_players = 7');
  const profiles = require('../../shared/arcadeBotProfiles.json');
  const added = [];
  for (let i = 0; i < profiles.length; i++) {
    const response = await call('/api/arcade/rooms/1/add-bot', { body: {} });
    assert.equal(response.status, 200);
    added.push(response.body.bot_name);
  }
  const [rows] = await db.query("SELECT bot_profile FROM arcade_participants WHERE participant_kind = 'bot'");
  assert.equal(new Set(rows.map(r => r.bot_profile)).size, profiles.length);
});

// ---- Bots that write real answers (ADR 0005) -------------------------------
const { warmRoundAnswers } = require('../arcade/bot-ticker');
const SUM_TO_N = {
  test_kind: 'function',
  test_cases: [{ args: [3], expected: 6 }, { args: [1], expected: 1 }, { args: [0], expected: 0 }, { args: [4], expected: 10 }],
  starter_code: 'def sum_to_n(n):\n    total = 0\n    for i in range(1, n + 1):\n        # TODO: add i\n        pass\n    return total',
  solution_code: 'def sum_to_n(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total',
};
let nextTaskId = 9100;

async function codingBotMatch(t, options) {
  const f = await botMatch(t, options);
  const taskId = nextTaskId++; // the answer-bank cache is per process, keyed by task id
  await f.db.query('INSERT INTO problems (problem_id, test_kind, test_cases, solution_code, starter_code) VALUES (1, ?, ?, ?, ?)', [SUM_TO_N.test_kind, JSON.stringify(SUM_TO_N.test_cases), SUM_TO_N.solution_code, SUM_TO_N.starter_code]);
  await f.db.query("INSERT INTO problem_modes (problem_id, mode, entry_id) VALUES (1, 'arcade', ?)", [taskId]);
  await f.db.query("UPDATE arcade_rooms SET difficulty = 'hard', round_task_ids = ?", [JSON.stringify([taskId, taskId, taskId, taskId])]);
  await warmRoundAnswers(f.db, [taskId]);
  const bot = async name => (await f.db.query('SELECT * FROM arcade_participants WHERE user_name = ?', [name]))[0][0];
  return { ...f, taskId, bot };
}

test('a bot types a real answer, submits it itself and is scored by the real grader', async t => {
  const f = await codingBotMatch(t);
  await f.roundAt('ROUND_2', 0);
  await f.setBot(f.botName, {});
  await f.tick();
  assert.equal((await f.bot(f.botName)).has_submitted, 0);
  // Mid-way the draft is a real, partly typed answer that a submitted player may watch.
  await f.elapse(4000);
  await f.tick();
  const draft = (await f.bot(f.botName)).draft_code;
  assert.ok(draft.startsWith('def sum_to_n(n):') && draft !== SUM_TO_N.starter_code, draft);
  await f.call('/api/arcade/rooms/1/submit-round', { body: { match_id: f.matchId, round_num: 2, code: 'print(1)' } });
  const watched = (await f.call(`/api/arcade/rooms/1/code/${f.botName}`)).body;
  assert.equal(watched.is_bot, true);
  assert.equal(typeof watched.code, 'string');
  await f.elapse(40000);
  await f.tick();
  const sent = await f.bot(f.botName);
  assert.equal(sent.has_submitted, 1);
  // Hard band at random()=0 aims for 45%: the bank's 2-of-4 mistake, "total = i".
  assert.equal(sent.submitted_code, SUM_TO_N.solution_code.replace('total += i', 'total = i'));
  await f.expire();
  await f.tick();
  // 2/4 cases = 50 test points; quality is the answer measured against the
  // reference (ADR 0007), scaled by 0.5 + 0.5 x 2/4; plus time earned by those cases.
  const score = await f.scoreOf(f.botName);
  assert.ok(score > 100 && score < 200, `score ${score}`);
});

test('in a fix round a bot starts from the AI answer and sends a real fix the grader passes', async t => {
  const f = await codingBotMatch(t);
  const aiAnswer = SUM_TO_N.solution_code.replace('total += i', 'total = i');
  await f.db.query("UPDATE problem_modes SET round_kinds = '[\"write\",\"fix\"]', round_data = ? WHERE entry_id = ?",
    [JSON.stringify({ fix: { code: aiAnswer, passed: 2, total: 4 } }), f.taskId]);
  await f.db.query(`UPDATE arcade_rooms SET round_kinds = '["write","fix","write","write"]'`);
  await warmRoundAnswers(f.db, [f.taskId, f.taskId], ['write', 'fix']);
  await f.roundAt('ROUND_2', 0);
  await f.setBot(f.botName, {});
  await f.tick();
  const reading = await f.bot(f.botName);
  assert.equal(reading.bot_state.bankKey, `${f.taskId}:fix`);
  // Hard band at random()=0: the write round would send the 2-of-4 answer, so
  // the bot finds the bug half the time - and random()=0 always finds it.
  for (let i = 0; i < 20 && !(await f.bot(f.botName)).has_submitted; i++) { await f.elapse(3000); await f.tick(); }
  const sent = await f.bot(f.botName);
  assert.equal(sent.has_submitted, 1);
  assert.equal(sent.submitted_code, SUM_TO_N.solution_code);
  await f.expire();
  await f.tick();
  // Both broken tests fixed: 100 test points plus time, at quality 0 (the test judge).
  assert.ok(await f.scoreOf(f.botName) > 100);
});

test('in a predict round a bot reads for a while, then taps an option and is scored on it', async t => {
  const f = await codingBotMatch(t);
  const predict = { code: SUM_TO_N.solution_code, call: 'print(sum_to_n(3))', answer: '6',
    options: [{ id: 'a', text: '3' }, { id: 'b', text: '6' }, { id: 'c', text: '0' }] };
  await f.db.query("UPDATE problem_modes SET round_kinds = '[\"write\",\"predict\"]', round_data = ? WHERE entry_id = ?",
    [JSON.stringify({ predict }), f.taskId]);
  await f.db.query(`UPDATE arcade_rooms SET round_kinds = '["write","predict","write","write"]'`);
  await f.roundAt('ROUND_2', 0, 20);
  await f.setBot(f.botName, {});
  await f.tick();
  await f.tick();
  assert.equal((await f.bot(f.botName)).has_submitted, 0);
  // random()=0: it reads for a quarter of the 20-second round and knows the answer.
  for (let i = 0; i < 4 && !(await f.bot(f.botName)).has_submitted; i++) { await f.elapse(2000); await f.tick(); }
  const sent = await f.bot(f.botName);
  assert.equal(sent.has_submitted, 1);
  assert.equal(sent.submitted_code, 'b');
  await f.expire();
  await f.tick();
  assert.ok(await f.scoreOf(f.botName) >= 200);
});

test('in a review round a bot picks the answer that passes every test and is scored on it', async t => {
  const f = await codingBotMatch(t);
  const review = { options: [
    { id: 'a', code: SUM_TO_N.solution_code.replace('total += i', 'total = i') },
    { id: 'b', code: SUM_TO_N.solution_code },
    { id: 'c', code: SUM_TO_N.solution_code.replace('total += i', 'total += 1') },
  ] };
  await f.db.query("UPDATE problem_modes SET round_kinds = '[\"write\",\"review\"]', round_data = ? WHERE entry_id = ?",
    [JSON.stringify({ review }), f.taskId]);
  await f.db.query(`UPDATE arcade_rooms SET round_kinds = '["write","review","write","write"]'`);
  await f.roundAt('ROUND_2', 0);
  await f.setBot(f.botName, {});
  await f.tick();
  await f.tick();
  // random()=0: it knows the answer and reads for a quarter of the 60-second round.
  for (let i = 0; i < 10 && !(await f.bot(f.botName)).has_submitted; i++) { await f.elapse(3000); await f.tick(); }
  const sent = await f.bot(f.botName);
  assert.equal(sent.has_submitted, 1);
  const right = choiceOptions('review', { round_data: { review } }).find(option => option.code === SUM_TO_N.solution_code);
  assert.equal(sent.submitted_code, right.id);
  await f.expire();
  await f.tick();
  assert.ok(await f.scoreOf(f.botName) >= 200);
});

test('an ink-fogged bot sends the same real answer later and scores less than its twin', async t => {
  const f = await codingBotMatch(t, { bots: 2 });
  const [fogged, clear] = f.botNames;
  await f.roundAt('ROUND_2', 0);
  await f.db.query("UPDATE arcade_participants SET bot_state = '{}' WHERE participant_kind = 'bot'");
  await f.tick();
  // elapse() moves the round, not wall-clock expiries: lift the fog by hand
  // after fifteen simulated seconds.
  await f.attackBot(fogged, 'inkFog', 600000);
  for (let i = 0; i < 5; i++) { await f.elapse(3000); await f.tick(); }
  await f.attackBot(fogged, null);
  for (let i = 0; i < 12; i++) { await f.elapse(3000); await f.tick(); }
  const [a, b] = [await f.bot(fogged), await f.bot(clear)];
  assert.equal(a.submitted_code, b.submitted_code);
  assert.ok(new Date(a.submitted_at) > new Date(b.submitted_at));
  await f.expire();
  await f.tick();
  assert.ok(await f.scoreOf(fogged) < await f.scoreOf(clear));
});

test('under Glitch and Backspace Lock a bot cannot clean its draft and is graded on what it typed', async t => {
  const f = await codingBotMatch(t);
  await f.roundAt('ROUND_2', 0);
  await f.setBot(f.botName, {});
  await f.tick();
  const effects = ['typoGenerator', 'backspaceLock'].map(type => ({ type, phase: 'ROUND_2', expiresAt: Date.now() + 600000, instance_id: randomUUID(), attacker: 'alice' }));
  await f.db.query('UPDATE arcade_shop_states SET attack_effects = ? WHERE user_name = ?', [JSON.stringify(effects), f.botName]);
  for (let i = 0; i < 6; i++) { await f.elapse(5000); await f.tick(); }
  const sent = await f.bot(f.botName);
  assert.equal(sent.has_submitted, 1);
  assert.match(sent.submitted_code, /x/);
  await f.expire();
  await f.tick();
  // The glitched answer does not compile, so only quality counts, and only
  // half of it: the answer it set out to type measures 100 against the
  // reference (ADR 0007) and becomes 50.
  assert.equal(await f.scoreOf(f.botName), 50);
});

// ---- Shopping and attacking with a plan ------------------------------------
test('a cautious leader buys a shield and no bot ever buys AI Helper', async t => {
  const f = await botMatch(t);
  await f.db.query("UPDATE arcade_participants SET bot_profile = 'bot_codemaster', score = 900, cash = 1000 WHERE participant_kind = 'bot'");
  await f.db.query("UPDATE arcade_participants SET score = 300 WHERE participant_kind = 'human'");
  await f.phase('SHOP_2');
  await f.tick();
  const inventory = (await f.db.query('SELECT inventory FROM arcade_shop_states WHERE user_name = ?', [f.botName]))[0][0].inventory;
  assert.deepEqual(inventory.map(i => i.id), ['shield']);
  for (const profile of require('../../shared/arcadeBotProfiles.json')) {
    await f.db.query("UPDATE arcade_participants SET bot_profile = ?, bot_state = '{}', cash = 5000 WHERE participant_kind = 'bot'", [profile.id]);
    await f.db.query("UPDATE arcade_shop_states SET inventory = '[]' WHERE user_name = ?", [f.botName]);
    for (let i = 0; i < 3; i++) { await f.db.query("UPDATE arcade_participants SET bot_state = '{}' WHERE participant_kind = 'bot'"); await f.tick(); }
    const bought = (await f.db.query('SELECT inventory FROM arcade_shop_states WHERE user_name = ?', [f.botName]))[0][0].inventory;
    assert.equal(bought.some(i => i.id === 'aiHelper'), false, profile.id);
  }
});

test('a bot aims at the rival fighting it for survival, not the runaway leader', async t => {
  const f = await botMatch(t);
  await f.phase('ROUND_2');
  await f.db.query("UPDATE arcade_participants SET bot_profile = 'bot_bughunter', score = 300 WHERE participant_kind = 'bot'");
  await f.db.query("UPDATE arcade_participants SET score = CASE user_name WHEN 'alice' THEN 999 ELSE 290 END WHERE participant_kind = 'human'");
  await f.give('inkFog');
  await f.tick();
  assert.equal((await f.read('bob')).attackEffects[0]?.attacker, f.botName);
  assert.deepEqual((await f.read()).attackEffects, []);
});

test('a bot writing a real answer saves its Score Booster and presses it as it submits', async t => {
  const f = await codingBotMatch(t);
  await f.roundAt('ROUND_2', 0);
  await f.give('scoreMultiplier');
  await f.tick();
  await f.elapse(3000);
  await f.tick();
  const early = (await f.db.query('SELECT self_effects, inventory FROM arcade_shop_states WHERE user_name = ?', [f.botName]))[0][0];
  assert.deepEqual(early.self_effects, []);
  assert.equal(early.inventory[0].id, 'scoreMultiplier');
  for (let i = 0; i < 10; i++) { await f.elapse(5000); await f.tick(); }
  const sent = await f.bot(f.botName);
  assert.equal(sent.has_submitted, 1);
  assert.equal(sent.score_multiplier_active, 1);
});

test('a bot reacts in chat once per shop break and never while a round is running', async t => {
  const f = await botMatch(t);
  const summary = { roundNum: 1, entries: [{ name: f.botName, rank: 1 }, { name: 'alice', rank: 2 }, { name: 'bob', rank: 3 }] };
  await f.db.query('UPDATE arcade_rooms SET last_round_summary = ?', [JSON.stringify(summary)]);
  await f.phase('ROUND_2');
  await f.tick();
  const said = async () => (await f.db.query('SELECT kind, message, emoji FROM arcade_chat_messages WHERE user_name = ?', [f.botName]))[0];
  assert.deepEqual(await said(), []);
  await f.phase('SHOP_2');
  await f.tick();
  await f.db.query("UPDATE arcade_participants SET bot_state = bot_state - 'lastBuy' WHERE participant_kind = 'bot'");
  await f.tick();
  const lines = await said();
  assert.equal(lines.length, 1);
  assert.ok(['😎', '🔥', '👏'].includes(lines[0].emoji) || lines[0].message);
});

// Playtest 2026-10-18: a bot whose roll landed on "send the scaffold" sent it
// the second the round opened, earning speed points for doing nothing.
test('a bot that gives up keeps the scaffold until the deadline instead of sending it at once', async t => {
  const f = await codingBotMatch(t);
  await f.roundAt('ROUND_2', 0);
  const [[{ now }]] = await f.db.query('SELECT (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::bigint AS now');
  await f.setBot(f.botName, { phase: 'ROUND_2', progress: 0, stepsToFinish: 14, lastProgress: Number(now), taskId: f.taskId, answerId: 'starter', charMs: 100,
    plan: { prefix: SUM_TO_N.starter_code, insert: '', suffix: '', text: '', next: 0 } });
  for (let i = 0; i < 6; i++) { await f.elapse(5000); await f.tick(); }
  assert.equal((await f.bot(f.botName)).has_submitted, 0);
  await f.expire();
  await f.tick();
  // The scaffold passes 1 of 4 cases: 25 test points, and an unchanged
  // scaffold earns no quality and no speed points.
  assert.equal(await f.scoreOf(f.botName), 25);
});

// ---- Bots are measured like players (ADR 0007) ------------------------------
test('a bot answer bank is measured like player answers, with no model call, and the scaffold is worth nothing', async t => {
  const judgeModule = require('../arcade/code-judge');
  const { readyBank, answerQuality } = require('../arcade/bot-coder');
  const previous = judgeModule.arcadeCodeJudge();
  const calls = [];
  judgeModule.installArcadeCodeJudge(judgeModule.createArcadeCodeJudge({
    model: 'fake', generate: async args => { calls.push(args); return 'advice'; },
  }));
  t.after(() => judgeModule.installArcadeCodeJudge(previous));
  const f = await codingBotMatch(t);
  const bank = readyBank(f.taskId);
  await bank.qualityReady;
  const solution = bank.find(answer => answer.id === 'solution');
  assert.deepEqual([solution.quality.score, solution.quality.source], [100, 'metrics']);
  assert.ok(bank.filter(a => a.id.startsWith('mistake-')).every(a => a.quality.source === 'metrics'));
  assert.equal(bank.find(a => a.id === 'starter').quality.source, 'starter');
  assert.equal(calls.length, 0, 'scoring never asks the model');
  assert.equal((await answerQuality(f.taskId, 'solution')).score, 100);
});
