const { useOwnedItem } = require('./use-item');
const { randomInt, randomUUID } = require('node:crypto');
const config = require('../../shared/arcadeConfig.json');
const { activeSelfEffects } = require('./self-effects');
const { activeAttackEffects } = require('./attacks');
const { readPhaseClock } = require('./phase-clock');
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function drawOffers() {
  const pool = [...config.shopItems];
  const offers = [];
  while (offers.length < 4 && pool.length) {
    const item = pool.splice(randomInt(pool.length), 1)[0];
    offers.push({ ...item, offer_id: randomUUID(), purchased: false });
  }
  return offers;
}

function installArcadeShop(app, db) {
  for (const [method, path] of [['post', 'attack'], ['get', 'effects']]) {
    app[method](`/api/arcade/rooms/:id/${path}`, (req, res) => {
      res.status(410).json({ error: 'กรุณารีเฟรชเพื่อใช้ระบบไอเทมปัจจุบัน' });
    });
  }
  app.post('/api/arcade/rooms/:id/shop-cash-delta', (req, res) => {
    res.status(410).json({ error: 'กรุณารีเฟรชเพื่อใช้ร้านค้าปัจจุบัน' });
  });
  const handler = async (req, res) => {
    const writing = req.method === 'POST';
    const body = req.body || {};
    const matchId = writing ? body.match_id : Number(req.query.match_id);
    if (!Number.isSafeInteger(matchId) || matchId <= 0
      || (writing && (!uuid.test(body.request_id || '') || !['buy', 'sell', 'reroll', 'consume', 'release-shield'].includes(body.action)))) {
      return res.status(400).json({ error: 'ข้อมูลคำสั่งร้านค้าไม่ถูกต้อง' });
    }
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
      const reject = async (status, error) => {
        await connection.rollback();
        return res.status(status).json({ error });
      };
      // A shop snapshot is polled every two seconds. It must not queue behind
      // the bot ticker, which holds the room row while updating every bot. On a
      // hosted database that queue could outlive most of the short shop phase,
      // leaving the client with no offers even though they were created. Only
      // commands need the room/player write locks; GET still locks this
      // player's shop-state row below when initializing a new set of offers.
      const writeLock = writing ? ' FOR UPDATE' : '';
      const [[room]] = await connection.query(`SELECT * FROM arcade_rooms WHERE room_id = ?${writeLock}`, [req.params.id]);
      if (!room) return await reject(404, 'ไม่พบห้อง');
      const [[player]] = await connection.query(`SELECT * FROM arcade_participants WHERE room_id = ? AND user_name = ?${writeLock}`, [room.room_id, req.player.username]);
      if (!player || player.participant_kind !== 'human') return await reject(403, 'เฉพาะผู้เล่นในห้องเท่านั้น');
      if (room.current_match_id !== matchId || player.match_id !== matchId || room.status !== 'PLAYING') {
        return await reject(409, 'แมตช์เปลี่ยนแล้ว กรุณารอข้อมูลล่าสุด');
      }
      // Compatibility until A08/A09 move attack resolution to the server: a
      // receiver may relinquish its own exact shield, never create an effect.
      const releasingShield = body.action === 'release-shield';
      const validPhase = releasingShield ? /^(ROUND_[1-4]|SUMMARY_[1-3]|SHOP_[1-3])$/
        : body.action === 'consume' ? /^ROUND_[2-4]$/ : /^SHOP_[1-3]$/;
      if (writing && ((!releasingShield && body.phase !== room.phase) || !validPhase.test(room.phase))) {
        return await reject(409, 'ทำรายการไม่ได้ในช่วงนี้');
      }
      if (writing && !releasingShield && player.is_eliminated) return await reject(403, 'คุณตกรอบไปแล้ว');
      const clock = await readPhaseClock(connection, room.room_id);
      const now = clock.nowMs;
      await connection.query('INSERT INTO arcade_shop_states (match_id, user_name) VALUES (?, ?) ON CONFLICT DO NOTHING', [matchId, player.user_name]);
      const [[state]] = await connection.query('SELECT * FROM arcade_shop_states WHERE match_id = ? AND user_name = ? FOR UPDATE', [matchId, player.user_name]);
      const command = [body.action, releasingShield ? null : body.phase, body.action === 'buy' ? body.offer_id : ['sell', 'consume', 'release-shield'].includes(body.action) ? body.instance_id : null];
      if (body.action === 'consume') command.push(body.target_name ?? null);
      let replayed = false;
      let attackResult = null;
      if (writing) {
        const [[previous]] = await connection.query('SELECT command, result FROM arcade_shop_commands WHERE match_id = ? AND user_name = ? AND request_id = ?', [matchId, player.user_name, body.request_id]);
        if (previous && JSON.stringify(previous.command) !== JSON.stringify(command)) return await reject(409, 'หมายเลขคำสั่งนี้ถูกใช้แล้ว');
        replayed = Boolean(previous);
        attackResult = previous?.result || null;
        if (!replayed && !releasingShield && !clock.isOpen) return await reject(409, 'หมดเวลาของช่วงนี้แล้ว');
        if (!replayed && body.action === 'consume' && player.has_submitted) return await reject(409, 'ส่งคำตอบไปแล้วสำหรับรอบนี้');
      }
      if (/^SHOP_[1-3]$/.test(room.phase) && clock.isOpen && !player.is_eliminated && state.shop_phase !== room.phase) {
        state.shop_phase = room.phase;
        state.offers = drawOffers();
        state.reroll_cost = 200;
        state.revision += 1;
      }
      if (writing && !replayed) {
        if (releasingShield) {
          const index = state.self_effects.findIndex(effect => effect.type === 'shield' && effect.instance_id === body.instance_id);
          if (index < 0) return await reject(409, 'ไม่พบเกราะชิ้นนี้');
          state.self_effects.splice(index, 1);
        } else if (body.action === 'buy') {
          const offer = state.offers.find(item => item.offer_id === body.offer_id);
          if (!offer || offer.purchased) return await reject(409, 'ไอเทมนี้ไม่อยู่ในร้านหรือถูกซื้อแล้ว');
          if (player.cash < offer.price) return await reject(409, 'เงินไม่พอ');
          if (state.inventory.length >= config.maxInventory) return await reject(409, 'กระเป๋าเต็ม');
          if (offer.type === 'aoe' && state.inventory.filter(item => item.type === 'aoe').length >= config.maxAoeHeld) return await reject(409, 'ถือไอเทมวงกว้างได้หนึ่งชิ้น');
          player.cash -= offer.price;
          offer.purchased = true;
          state.inventory.push({ id: offer.id, type: offer.type, price: offer.price, instance_id: randomUUID() });
        } else if (body.action === 'sell' || body.action === 'consume') {
          const index = state.inventory.findIndex(item => item.instance_id === body.instance_id);
          if (index < 0) return await reject(409, 'คุณไม่มีไอเทมชิ้นนี้');
          const item = state.inventory[index];
          if (body.action === 'consume') {
            attackResult = await useOwnedItem({ db: connection, room, player, state,
            instanceId: item.instance_id, targetName: body.target_name, now, phaseDeadlineMs: clock.deadlineMs });
          } else {
            player.cash += Math.floor(item.price / 2);
            state.inventory.splice(index, 1);
          }
        } else {
          if (player.cash < state.reroll_cost) return await reject(409, 'เงินไม่พอสุ่มร้าน');
          player.cash -= state.reroll_cost;
          state.reroll_cost = Math.min(state.reroll_cost * 2, 2147483647);
          state.offers = drawOffers();
        }
        state.revision += 1;
        await connection.query('UPDATE arcade_participants SET cash = ? WHERE id = ?', [player.cash, player.id]);
        await connection.query('INSERT INTO arcade_shop_commands (match_id, user_name, request_id, command, result) VALUES (?, ?, ?, ?, ?)', [matchId, player.user_name, body.request_id, JSON.stringify(command), attackResult ? JSON.stringify(attackResult) : null]);
      }
      await connection.query(`UPDATE arcade_shop_states SET shop_phase = ?, revision = ?, reroll_cost = ?, offers = ?, inventory = ?, self_effects = ?
        WHERE match_id = ? AND user_name = ?`,
      [state.shop_phase, state.revision, state.reroll_cost, JSON.stringify(state.offers), JSON.stringify(state.inventory), JSON.stringify(state.self_effects), matchId, player.user_name]);
      const [opponentStates] = await connection.query(`SELECT p.user_name, s.attack_effects FROM arcade_participants p
        LEFT JOIN arcade_shop_states s ON s.match_id = p.match_id AND s.user_name = p.user_name
        WHERE p.room_id = ? AND p.match_id = ? AND p.user_name <> ?`, [room.room_id, matchId, player.user_name]);
      await connection.commit();
      res.json({ success: true, replayed, match_id: matchId, phase: room.phase, revision: state.revision,
        offers: state.offers, inventory: state.inventory, rerollCost: state.reroll_cost, cash: player.cash,
        selfEffects: activeSelfEffects(state.self_effects, room.phase, now), serverNow: now, attackResult,
        attackEffects: activeAttackEffects(state.attack_effects, room.phase, now),
        opponents: opponentStates.map(opponent => ({ name: opponent.user_name,
          effects: activeAttackEffects(opponent.attack_effects, room.phase, now),
          isDebuffed: activeAttackEffects(opponent.attack_effects, room.phase, now).length > 0 })) });
    } catch (error) {
      if (connection) await connection.rollback();
      if (error.status === 409) return res.status(409).json({ error: error.message });
      console.error('Arcade shop command failed:', error.message);
      res.status(500).json({ error: 'บันทึกร้านค้าไม่สำเร็จ กรุณาลองอีกครั้ง' });
    } finally {
      if (connection) connection.release();
    }
  };
  app.get('/api/arcade/rooms/:id/shop', handler);
  app.post('/api/arcade/rooms/:id/shop', handler);
}
module.exports = { installArcadeShop };
