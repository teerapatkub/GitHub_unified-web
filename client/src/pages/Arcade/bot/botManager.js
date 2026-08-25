// client/src/pages/Arcade/bot/botManager.js
// Manager for real-time Arcade Battle Royale Bot AI Engines

import { BotAIEngine } from './botAI.js';
import arcadeConfig from '../../../../../shared/arcadeConfig.json';

class BotManager {
  constructor() {
    this.botMap = new Map(); // botName -> BotAIEngine instance
  }

  // Synchronize active bot instances with room participants
  syncBots(roomParticipants = [], humanPlayerName = '') {
    const currentBotNames = new Set();

    roomParticipants.forEach(p => {
      if (p.user_name !== humanPlayerName && p.user_name.startsWith('Bot_')) {
        currentBotNames.add(p.user_name);
        if (!this.botMap.has(p.user_name)) {
          this.botMap.set(p.user_name, new BotAIEngine(p.user_name));
        }
      }
    });

    // Remove bots no longer in room
    for (const [botName] of this.botMap.entries()) {
      if (!currentBotNames.has(botName)) {
        this.botMap.delete(botName);
      }
    }
  }

  // Reset all bots for a new match
  resetAllBots() {
    for (const bot of this.botMap.values()) {
      bot.resetState();
    }
  }

  // Called every time a new coding round starts so each bot's progress bar
  // begins at 0% instead of carrying over last round's value (their real
  // score/cash/inventory persist across rounds within the same match).
  resetRoundProgress() {
    for (const bot of this.botMap.values()) {
      bot.resetRoundProgress();
    }
  }

  // Main update loop called every tick during gameplay. `opponents` is the
  // React state mirrored from the DB poll (ArcadeBattleRoyale.jsx) — the
  // server is what actually decides elimination now, so this pulls that
  // authoritative status DOWN into each bot's own instance (the reverse of
  // what this function used to do) purely so an eliminated bot's AI stops
  // ticking — buying items, attacking, "coding" — instead of only the UI
  // showing it as out. dispatchBotAttackOnPlayer lets an economic effect
  // (cashSteal/taxCollection) aimed at the real human go through the same
  // server endpoint a real player's own attacks use, since the human's cash
  // is now DB-authoritative (synced back on every room-state poll) — a bot
  // mutating it only client-side would just get overwritten on the next poll.
  update(phase, playerState, opponents, setPlayerState, setOpponents, notify, dispatchBotAttackOnPlayer) {
    if (this.botMap.size === 0) return;

    for (const opp of opponents) {
      const bot = this.botMap.get(opp.name);
      if (bot && opp.eliminated) bot.eliminated = true;
    }

    const allOpponentsArray = Array.from(this.botMap.values());

    // The one scoreboard every bot decides "who is winning" from. `opponents`
    // is mirrored straight off the server's arcade_participants rows and
    // playerState.score is the same row for the human, so every name in here
    // is measured on the same scale. Without it each bot compared its own
    // locally-invented score against the human's real one and concluded
    // another bot was always ahead — see pickAttackTarget in botAI.js.
    const scoreboard = { [playerState.name]: Number(playerState.score) || 0 };
    for (const opp of opponents) {
      scoreboard[opp.name] = Number(opp.score) || 0;
    }

    for (const bot of this.botMap.values()) {
      bot.update(phase, playerState, allOpponentsArray, (attackerName, targetName, item) => {
        // CALLBACK: BOT ATTACKS/AFFECTS A TARGET!

        // Scenario A: affects the Human Player
        if (targetName === playerState.name) {
          const hasPlayerShield = playerState.activeEffects.some(e => e.type === 'shield' && e.expiresAt > Date.now());

          if (hasPlayerShield) {
            // Player's Shield blocks the incoming item entirely — including
            // economic ones like cashSteal/taxCollection, not just debuffs.
            setPlayerState(prev => ({
              ...prev,
              activeEffects: prev.activeEffects.filter(e => e.type !== 'shield')
            }));
            notify(`🛡️ เกราะของคุณป้องกันการโจมตีจาก ${attackerName} ด้วยไอเทม ${item.name || item.type}!`, "success");
            return;
          }

          // Economic effects transfer real cash, and the human's cash is now
          // DB-authoritative (the room-state poll overwrites playerState.cash
          // from the server every ~2s) — so this has to go through the same
          // /attack endpoint a real player's own attacks use instead of
          // mutating playerState locally, or the transfer would just get
          // reverted by the very next poll. The server credits the attacking
          // bot's own DB row too (bots are real arcade_participants rows),
          // and the delivery queue it writes is what makes pollEffects show
          // the notification + apply the local deduction on this client.
          if (item.id === 'cashSteal' || item.id === 'taxCollection') {
            dispatchBotAttackOnPlayer(attackerName, item);
            return;
          }

          // Apply visual & gameplay debuff directly onto Human Player!
          // item.id is the effect identifier (shared with SHOP_ITEMS ids in
          // ArcadeBattleRoyale.jsx's checkEffectActive) — item.type is only
          // the shop category and must not be used here.
          const durationMs = 7000;
          const newEffect = {
            type: item.id,
            expiresAt: Date.now() + durationMs
          };

          setPlayerState(prev => ({
            ...prev,
            activeEffects: [...prev.activeEffects.filter(e => e.type !== newEffect.type), newEffect]
          }));

          notify(`🚨 ${attackerName} ใช้ไอเทม ${item.name || item.type} โจมตีใส่คุณ!`, "error");
        }
        // Scenario B: Bot affects another Bot
        else if (this.botMap.has(targetName)) {
          if (item.id === 'cashSteal' || item.id === 'taxCollection') {
            const targetBot = this.botMap.get(targetName);
            const attackerBot = this.botMap.get(attackerName);
            const stolen = item.id === 'taxCollection'
              ? Math.floor(targetBot.cash * arcadeConfig.cashSteal.taxPercent)
              : Math.min(arcadeConfig.cashSteal.flatAmount, targetBot.cash);
            targetBot.cash -= stolen;
            if (attackerBot) attackerBot.cash += stolen;
            notify(`💸 ${attackerName} ขโมยเงิน 🪙 ${stolen} จาก ${targetName}!`, "warning");
            return;
          }
          const targetBot = this.botMap.get(targetName);
          const result = targetBot.receiveAttack(attackerName, item);
          notify(result.msg, "warning");
        }
      }, scoreboard);
    }

    // Sync ONLY cosmetic display fields back onto opponents — progress (the
    // "Round Progress" bar) and isDebuffed (used to grey out an already-hit
    // target in the targeting UI). score/cash/eliminated are NOT synced here
    // anymore: the server's tickArcadeMatches()/finalizeArcadePhase() is now
    // the sole source of truth for those (it writes real score/cash/
    // is_eliminated to arcade_participants, which the room-state poll in
    // ArcadeBattleRoyale.jsx reads back into `opponents` directly) — a bot's
    // own internal score/cash only ever drives its own targeting heuristic
    // and shop-affordability checks now, never what's shown as its real
    // standing.
    setOpponents(prevOpponents => {
      return prevOpponents.map(opp => {
        if (this.botMap.has(opp.name)) {
          const botInstance = this.botMap.get(opp.name);
          return {
            ...opp,
            progress: botInstance.progress,
            isDebuffed: botInstance.isDebuffed()
          };
        }
        return opp;
      });
    });
  }
}

export const botManager = new BotManager();
