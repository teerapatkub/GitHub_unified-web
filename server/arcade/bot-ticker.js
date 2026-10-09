const { randomUUID } = require('node:crypto');
const config = require('../../shared/arcadeConfig.json');
const profiles = require('../../shared/arcadeBotProfiles.json');
const { activeSelfEffects } = require('./self-effects');
const { activeAttackEffects } = require('./attacks');
const { useOwnedItem } = require('./use-item');
const { readPhaseClock } = require('./phase-clock');

function buyForBot(player, state, profile, random) {
  if (state.inventory.length >= config.maxInventory || random() >= profile.attackChance) return;
  const affordable = config.shopItems.filter(item => item.price <= player.cash
    && (item.type !== 'aoe' || state.inventory.filter(i => i.type === 'aoe').length < config.maxAoeHeld));
  const favorites = affordable.filter(item => profile.favoriteItems.includes(item.id));
  const choices = favorites.length ? favorites : affordable;
  if (!choices.length) return;
  const item = choices[Math.floor(random() * choices.length)];
  player.cash -= item.price;
  state.inventory.push({ ...item, instance_id: randomUUID() });
}

async function useForBot(db, room, player, state, memory, now, phaseDeadlineMs, random) {
  if (random() >= 0.6) return;
  const [opponents] = await db.query(`SELECT p.*, s.attack_effects FROM arcade_participants p
    LEFT JOIN arcade_shop_states s ON s.match_id = p.match_id AND s.user_name = p.user_name
    WHERE p.room_id = ? AND p.match_id = ? AND p.id <> ? AND p.is_eliminated = 0 ORDER BY p.score DESC, p.id`,
  [room.room_id, room.current_match_id, player.id]);
  for (const item of state.inventory) {
    if (activeSelfEffects(state.self_effects, room.phase, now).some(e => e.type === item.id)) continue;
    let targetName;
    if (item.type === 'attack') {
      const eligible = opponents.filter(p => !activeAttackEffects(p.attack_effects, room.phase, now).length);
      const revenge = memory.revengeTarget && random() < 0.8
        ? eligible.find(p => p.user_name === memory.revengeTarget) : null;
      targetName = (revenge || eligible[0])?.user_name;
      if (!targetName) continue;
    } else if ((item.type === 'aoe' || item.id === 'taxCollection') && !opponents.length) continue;
    await useOwnedItem({ db, room, player, state, instanceId: item.instance_id, targetName, now, phaseDeadlineMs });
    break;
  }
}

// Persist decision clocks under the same room lock as settlement and human
// commands. Extra workers, restarts and disconnected browsers cannot replay a turn.
async function tickArcadeBots(db, roomId, random = Math.random) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [[room]] = await connection.query('SELECT * FROM arcade_rooms WHERE room_id = ? FOR UPDATE', [roomId]);
    const clock = await readPhaseClock(connection, roomId);
    if (!room || room.status !== 'PLAYING' || !clock?.isOpen || !/^(ROUND_[1-4]|SHOP_[1-3])$/.test(room.phase)) {
      await connection.rollback();
      return;
    }
    const [participants] = await connection.query('SELECT * FROM arcade_participants WHERE room_id = ? AND match_id = ? ORDER BY id FOR UPDATE', [roomId, room.current_match_id]);
    const now = clock.nowMs;
    for (const initial of participants.filter(p => p.participant_kind === 'bot' && !p.is_eliminated)) {
      // Earlier bots in this transaction may have stolen this bot's money or
      // removed its shield. Read each actor fresh before deciding its turn.
      const [[player]] = await connection.query('SELECT * FROM arcade_participants WHERE id = ?', [initial.id]);
      const profile = profiles.find(p => p.id === player.bot_profile);
      if (!profile) throw new Error('Unknown Arcade bot profile');
      await connection.query('INSERT INTO arcade_shop_states (match_id,user_name) VALUES (?,?) ON CONFLICT DO NOTHING', [room.current_match_id, player.user_name]);
      const [[state]] = await connection.query('SELECT * FROM arcade_shop_states WHERE match_id = ? AND user_name = ? FOR UPDATE', [room.current_match_id, player.user_name]);
      const memory = player.bot_state;
      if (memory.phase !== room.phase) {
        memory.phase = room.phase;
        memory.progress = 0;
        memory.stepsToFinish = 22 + Math.floor(random() * 13);
        memory.lastProgress = now;
      }
      const effects = activeAttackEffects(state.attack_effects, room.phase, now);
      const frozen = effects.some(e => e.type === 'timeFreeze' || e.type === 'inkFog');
      if (frozen) memory.lastProgress = now;
      else {
        if (room.phase.startsWith('ROUND_')) {
          const steps = Math.floor((now - memory.lastProgress) / profile.typingSpeedMs);
          memory.lastProgress += steps * profile.typingSpeedMs;
          memory.progress = Math.min(100, (memory.progress || 0) + steps * 100 / memory.stepsToFinish);
        }
        if (room.phase.startsWith('SHOP_') && now - (memory.lastBuy || 0) >= config.botBuyAttemptIntervalMs) {
          memory.lastBuy = now;
          buyForBot(player, state, profile, random);
        }
        if (/^ROUND_[2-4]$/.test(room.phase) && now - (memory.lastUse || 0) >= config.botItemUseIntervalMs) {
          memory.lastUse = now;
          await useForBot(connection, room, player, state, memory, now, clock.deadlineMs, random);
        }
      }
      await connection.query('UPDATE arcade_shop_states SET inventory = ?, self_effects = ?, revision = revision + 1 WHERE match_id = ? AND user_name = ?',
        [JSON.stringify(state.inventory), JSON.stringify(state.self_effects), room.current_match_id, player.user_name]);
      await connection.query('UPDATE arcade_participants SET cash = ?, bot_state = ? WHERE id = ?', [player.cash, JSON.stringify(memory), player.id]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
module.exports = { tickArcadeBots };
