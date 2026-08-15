// client/src/bot/botManager.js
// Manager for real-time Arcade Battle Royale Bot AI Engines

import { BotAIEngine } from './botAI.js';

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

  // Main update loop called every tick during gameplay
  update(phase, playerState, setPlayerState, setOpponents, notify) {
    if (this.botMap.size === 0) return;

    const allOpponentsArray = Array.from(this.botMap.values());

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

          // Economic effects transfer cash directly instead of pushing a
          // timed visual debuff — they have no duration. The 20%/flat amount
          // is computed here (fresh, live playerState.cash) rather than
          // trusting a value pre-computed inside botAI.js, so a blocked
          // shield above never causes a mismatched credit to the attacker.
          if (item.id === 'cashSteal' || item.id === 'taxCollection') {
            const stolen = item.id === 'taxCollection'
              ? Math.floor(playerState.cash * 0.20)
              : Math.min(300, playerState.cash);
            setPlayerState(prev => ({ ...prev, cash: Math.max(0, prev.cash - stolen) }));
            const attackerBot = this.botMap.get(attackerName);
            if (attackerBot) attackerBot.cash += stolen;
            notify(`💸 ${attackerName} ขโมยเงิน 🪙 ${stolen} จากคุณด้วยไอเทม ${item.name || item.type}!`, "error");
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
              ? Math.floor(targetBot.cash * 0.20)
              : Math.min(300, targetBot.cash);
            targetBot.cash -= stolen;
            if (attackerBot) attackerBot.cash += stolen;
            notify(`💸 ${attackerName} ขโมยเงิน 🪙 ${stolen} จาก ${targetName}!`, "warning");
            return;
          }
          const targetBot = this.botMap.get(targetName);
          const result = targetBot.receiveAttack(attackerName, item);
          notify(result.msg, "warning");
        }
      });
    }

    // Sync updated bot scores & states back to opponents state — including
    // whether each bot currently has an active debuff, so the player's
    // target-selection UI can gray out anyone who's already been hit.
    setOpponents(prevOpponents => {
      return prevOpponents.map(opp => {
        if (this.botMap.has(opp.name)) {
          const botInstance = this.botMap.get(opp.name);
          return {
            ...opp,
            score: botInstance.score,
            cash: botInstance.cash,
            eliminated: botInstance.eliminated,
            isDebuffed: botInstance.isDebuffed()
          };
        }
        return opp;
      });
    });
  }
}

export const botManager = new BotManager();
