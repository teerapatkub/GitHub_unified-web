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
async function botMatch(t) {
  const f = await arcadeFixture(t);
  const added = await f.call('/api/arcade/rooms/1/add-bot', { body: {} });
  const botName = added.body.bot_name;
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
  return { ...f, botName, matchId, tick, room, read, phase, give };
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
  await f.db.query("UPDATE arcade_rooms SET phase_deadline = clock_timestamp() - INTERVAL '1 second'");
  // Deterministic randomness is a system boundary: default difficulty with
  // 3 cases gives 1 pass, quality 35, time 33.33 = 102; owned multiplier makes 204.
  await settleDueArcadeRooms({db:f.db,random:()=>0,judgeCodeQuality:async()=>({score:0})});
  assert.equal((await f.room()).participants.find(p=>p.user_name===f.botName).score,204);
  await f.db.query("UPDATE arcade_rooms SET phase = 'ROUND_3', phase_deadline = clock_timestamp() - INTERVAL '1 second'");
  await f.db.query('UPDATE arcade_participants SET is_eliminated = 0');
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
  const first = (await f.read()).attackEffects;
  assert.equal(first[0].type,'timeFreeze');
  assert.deepEqual((await f.read('bob')).attackEffects,first);
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
  assert.ok(progressed>=46 && progressed<=54);
  const attack = {type:'inkFog',phase:'ROUND_2',expiresAt:Date.now()+15000,instance_id:randomUUID(),attacker:'alice'};
  await f.db.query('UPDATE arcade_shop_states SET attack_effects = ? WHERE user_name = ?',[JSON.stringify([attack]),f.botName]);
  await f.tick();
  assert.equal((await readBot()).bot_progress,progressed);
  assert.equal((await f.call('/api/arcade/rooms/1',{user:'bob'})).body.participants.find(p=>p.user_name===f.botName).bot_progress,progressed);
  assert.equal(Object.hasOwn(await readBot(),'bot_state'),false);
});
