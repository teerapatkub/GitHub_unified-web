const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const arcadeConfig = require('../../shared/arcadeConfig.json');
const { settleDueArcadeRooms } = require('../arcade/match-ticker');
const { arcadeFixture } = require('./helpers/arcade-fixture');

const SELF_ITEMS = new Set(['shield', 'scoreMultiplier', 'aiHelper']);
const AOE_ITEMS = new Set(['timeFreeze', 'blackout']);
const NO_TARGET_ITEMS = new Set([...SELF_ITEMS, ...AOE_ITEMS, 'taxCollection']);

test('every catalog item is bought and applied once through authenticated server commands', async t => {
  const { call, db } = await arcadeFixture(t);
  const started = await call('/api/arcade/rooms/1/start', { body: {} });
  assert.equal(started.status, 200);
  const matchId = started.body.match_id;
  await db.query('UPDATE arcade_participants SET cash = 100000');

  for (const item of arcadeConfig.shopItems) {
    await db.query("UPDATE arcade_rooms SET phase = 'SHOP_1', phase_deadline = clock_timestamp() + INTERVAL '5 minutes'");
    const shop = await call(`/api/arcade/rooms/1/shop?match_id=${matchId}`);
    assert.equal(shop.status, 200);
    const offer = { ...item, offer_id: randomUUID(), purchased: false };
    await db.query(
      'UPDATE arcade_shop_states SET offers = ?, inventory = ?, self_effects = ?, attack_effects = ? WHERE match_id = ? AND user_name = ?',
      [JSON.stringify([offer]), JSON.stringify([]), JSON.stringify([]), JSON.stringify([]), matchId, 'alice']
    );
    await db.query(
      'INSERT INTO arcade_shop_states (match_id,user_name,offers,inventory,self_effects,attack_effects) VALUES (?,?,?,?,?,?) ON CONFLICT (match_id,user_name) DO UPDATE SET self_effects = EXCLUDED.self_effects, attack_effects = EXCLUDED.attack_effects',
      [matchId, 'bob', JSON.stringify([]), JSON.stringify([]), JSON.stringify([]), JSON.stringify([])]
    );

    const bought = await call('/api/arcade/rooms/1/shop', { body: {
      match_id: matchId,
      phase: 'SHOP_1',
      request_id: randomUUID(),
      action: 'buy',
      offer_id: offer.offer_id
    } });
    assert.equal(bought.status, 200, `${item.id} should be purchasable`);
    const instance = bought.body.inventory.find(entry => entry.id === item.id);
    assert.ok(instance, `${item.id} should enter the authenticated player's inventory`);

    await db.query("UPDATE arcade_rooms SET phase = 'ROUND_2', phase_deadline = clock_timestamp() + INTERVAL '5 minutes'");
    const requestId = randomUUID();
    const command = {
      match_id: matchId,
      phase: 'ROUND_2',
      request_id: requestId,
      action: 'consume',
      instance_id: instance.instance_id,
      ...(!NO_TARGET_ITEMS.has(item.id) ? { target_name: 'bob' } : {})
    };
    const used = await call('/api/arcade/rooms/1/shop', { body: command });
    assert.equal(used.status, 200, `${item.id} should be usable`);
    const replayed = await call('/api/arcade/rooms/1/shop', { body: command });
    assert.equal(replayed.status, 200, `${item.id} retry should replay its receipt`);

    const [[state]] = await db.query(
      'SELECT inventory, self_effects FROM arcade_shop_states WHERE match_id = ? AND user_name = ?',
      [matchId, 'alice']
    );
    assert.equal(state.inventory.some(entry => entry.instance_id === instance.instance_id), false);
    if (SELF_ITEMS.has(item.id)) {
      assert.equal(state.self_effects.filter(effect => effect.instance_id === instance.instance_id).length, 1);
    } else {
      assert.deepEqual(replayed.body.attackResult, used.body.attackResult);
    }
  }

  const [[receiptCount]] = await db.query(
    "SELECT COUNT(*)::int AS count FROM arcade_shop_commands WHERE match_id = ? AND user_name = ? AND command->>0 = 'consume'",
    [matchId, 'alice']
  );
  assert.equal(receiptCount.count, arcadeConfig.shopItems.length);
});

test('twenty authenticated players finish four isolated rooms, retry safely, and start a rematch', async t => {
  const { addUsers, call, db } = await arcadeFixture(t);
  const names = ['alice', 'bob', 'outsider', ...Array.from({ length: 17 }, (_, index) => `player${index + 4}`)];
  await addUsers(names.slice(3));

  const identities = await Promise.all(names.map(name => call('/api/auth/me', { user: name })));
  assert.deepEqual(identities.map(result => result.status), Array(20).fill(200));
  assert.deepEqual(identities.map(result => result.body.username), names);
  assert.equal((await call('/api/auth/me', { user: null })).status, 401);

  await db.query('TRUNCATE arcade_rooms, arcade_participants RESTART IDENTITY CASCADE');
  const groups = Array.from({ length: 4 }, (_, roomIndex) => names.slice(roomIndex * 5, roomIndex * 5 + 5));
  for (const [index, members] of groups.entries()) {
    const roomId = index + 1;
    await db.query(
      `INSERT INTO arcade_rooms (room_code,room_name,host_name,max_players,difficulty,round_duration_mode)
       VALUES (?,?,?,?,?,?)`,
      [`ARC-A${roomId}`, `Acceptance ${roomId}`, members[0], 5, 'default', 'quick']
    );
    for (const [memberIndex, name] of members.entries()) {
      await db.query(
        'INSERT INTO arcade_participants (room_id,user_name,is_host) VALUES (?,?,?)',
        [roomId, name, memberIndex === 0 ? 1 : 0]
      );
    }
  }

  const matches = [];
  for (const [index, members] of groups.entries()) {
    const started = await call(`/api/arcade/rooms/${index + 1}/start`, { user: members[0], body: {} });
    assert.equal(started.status, 200);
    matches.push(started.body.match_id);
  }
  assert.equal((await call(`/api/arcade/rooms/2/submit-round`, { user: groups[0][0], body: {
    match_id: matches[1], round_num: 1, code: '# wrong room'
  } })).status, 403);

  const settle = () => settleDueArcadeRooms({
    db,
    random: () => 0.5,
    judgeCodeQuality: async code => ({ score: Number(/score (\d+)/.exec(code)?.[1] || 20) })
  });

  for (let round = 1; round <= 4; round++) {
    for (const [index, members] of groups.entries()) {
      const [alive] = await db.query(
        'SELECT user_name FROM arcade_participants WHERE room_id = ? AND is_eliminated = 0 ORDER BY id',
        [index + 1]
      );
      const responses = await Promise.all(alive.map((participant, playerIndex) => call(
        `/api/arcade/rooms/${index + 1}/submit-round`,
        { user: participant.user_name, body: {
          match_id: matches[index],
          round_num: round,
          code: `# ${participant.user_name} score ${30 + playerIndex}`
        } }
      )));
      assert.deepEqual(responses.map(result => result.status), Array(alive.length).fill(200));
      if (index === 0) {
        const retried = await call(`/api/arcade/rooms/1/submit-round`, { user: alive[0].user_name, body: {
          match_id: matches[0], round_num: round, code: `# ${alive[0].user_name} score 30`
        } });
        assert.equal(retried.status, 200, 'a lost response may retry the exact answer');
      }
      assert.ok(members.includes(alive[0].user_name));
    }

    await db.query("UPDATE arcade_rooms SET phase_deadline = clock_timestamp() - INTERVAL '1 second' WHERE status = 'PLAYING'");
    assert.deepEqual(await settle(), []);
    if (round < 4) {
      await db.query("UPDATE arcade_rooms SET phase_deadline = clock_timestamp() - INTERVAL '1 second' WHERE phase LIKE 'SUMMARY_%'");
      assert.deepEqual(await settle(), []);
      await db.query("UPDATE arcade_rooms SET phase_deadline = clock_timestamp() - INTERVAL '1 second' WHERE phase LIKE 'SHOP_%'");
      assert.deepEqual(await settle(), []);
    }
  }

  const [rooms] = await db.query('SELECT room_id,phase FROM arcade_rooms ORDER BY room_id');
  assert.deepEqual(rooms.map(room => room.phase), Array(4).fill('RESULT'));
  const [[receiptSummary]] = await db.query(
    'SELECT COUNT(*)::int AS count, COALESCE(SUM(coins),0)::int AS coins FROM arcade_reward_receipts'
  );
  assert.deepEqual(receiptSummary, { count: 20, coins: 540 });
  const [historyRooms] = await db.query(
    'SELECT user_name, COUNT(DISTINCT room_id)::int AS rooms FROM arcade_round_history GROUP BY user_name'
  );
  assert.equal(historyRooms.length, 20);
  assert.equal(historyRooms.every(row => row.rooms === 1), true);

  const [walletsBefore] = await db.query('SELECT username,virtual_currency FROM users WHERE username = ANY(?) ORDER BY username', [names]);
  assert.deepEqual(await settle(), []);
  const [walletsAfter] = await db.query('SELECT username,virtual_currency FROM users WHERE username = ANY(?) ORDER BY username', [names]);
  assert.deepEqual(walletsAfter, walletsBefore, 'a worker retry cannot pay a completed match twice');

  for (const name of groups[0]) {
    const remained = await call('/api/arcade/rooms/1/finish-choice', { user: name, body: { choice: 'REMAIN' } });
    assert.equal(remained.status, 200);
  }
  const rematch = await call('/api/arcade/rooms/1/start', { user: groups[0][0], body: {} });
  assert.equal(rematch.status, 200);
  assert.notEqual(rematch.body.match_id, matches[0]);
  const oldHistory = await call(`/api/arcade/players/${groups[0][0]}/history`, { user: groups[0][0] });
  assert.equal(oldHistory.status, 200);
  assert.equal(oldHistory.body.matches.some(match => match.match_id === matches[0]), true);
  assert.equal(oldHistory.body.matches.some(match => match.match_id === rematch.body.match_id), false);
});
