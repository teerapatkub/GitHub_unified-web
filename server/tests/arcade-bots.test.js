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
const { randomUUID } = require('node:crypto');
async function botMatch(t, { bots = 1 } = {}) {
  const f = await arcadeFixture(t);
  const botNames = [];
  for (let i = 0; i < bots; i++) botNames.push((await f.call('/api/arcade/rooms/1/add-bot', { body: {} })).body.bot_name);
  const botName = botNames[0];
  const matchId = (await f.call('/api/arcade/rooms/1/start', { body: {} })).body.match_id;
  await f.db.query("UPDATE arcade_participants SET cash = 5000, bot_profile = CASE WHEN participant_kind = 'bot' THEN 'bot_pyninja' END");
  const tick = () => settleDueArcadeRooms({ db: f.db, random: () => 0, judgeCodeQuality: async () => ({ score: 0 }) });
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
  assert.equal(bot.cash, 4600); // PyNinja selects the first affordable favorite: 400-coin ink.
  await f.give('cashSteal');
  await f.phase('ROUND_2');
  assert.deepEqual(await Promise.all([f.tick(), f.tick()]), [[], []]);
  assert.equal((await f.read()).cash, 4700);
  assert.equal((await f.room()).participants.find(p => p.user_name === f.botName).cash, 4900);
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
  await settleDueArcadeRooms({ db, judgeCodeQuality: async () => ({ score: 17 }) });
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
  await settleDueArcadeRooms({db:f.db,random:()=>0,judgeCodeQuality:async()=>({score:0})});
  assert.equal((await f.room()).participants.find(p=>p.user_name===f.botName).score,204);
  await f.db.query("UPDATE arcade_rooms SET phase = 'ROUND_3', phase_deadline = clock_timestamp() - INTERVAL '1 second'");
  await f.db.query('UPDATE arcade_participants SET is_eliminated = 0');
  await f.finishBot(f.botName, 0);
  await settleDueArcadeRooms({db:f.db,random:()=>0,judgeCodeQuality:async()=>({score:0})});
  assert.equal((await f.room()).participants.find(p=>p.user_name===f.botName).score,339);
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
const settleRound = f => settleDueArcadeRooms({ db: f.db, random: () => 0, judgeCodeQuality: async () => ({ score: 0 }) });

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
  await settleDueArcadeRooms({ db: f.db, random: () => 0.99, judgeCodeQuality: async () => ({ score: 0 }) });
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
