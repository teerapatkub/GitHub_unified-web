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
        // CALLBACK: BOT ATTACKS A TARGET!

        // Scenario A: Bot attacks the Human Player
        if (targetName === playerState.name) {
          // Check if player has Shield
          const hasPlayerShield = playerState.activeEffects.some(e => e.type === 'shield' && e.expiresAt > Date.now());

          if (hasPlayerShield) {
            // Player's Shield blocks attack!
            setPlayerState(prev => ({
              ...prev,
              activeEffects: prev.activeEffects.filter(e => e.type !== 'shield')
            }));
            notify(`🛡️ เกราะของคุณป้องกันการโจมตีจาก ${attackerName} ด้วยไอเทม ${item.name || item.type}!`, "success");
          } else {
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
        } 
        // Scenario B: Bot attacks another Bot
        else if (this.botMap.has(targetName)) {
          const targetBot = this.botMap.get(targetName);
          const result = targetBot.receiveAttack(attackerName, item);
          notify(result.msg, "warning");
        }
      });
    }

    // Sync updated bot scores & states back to opponents state
    setOpponents(prevOpponents => {
      return prevOpponents.map(opp => {
        if (this.botMap.has(opp.name)) {
          const botInstance = this.botMap.get(opp.name);
          return {
            ...opp,
            score: botInstance.score,
            cash: botInstance.cash,
            eliminated: botInstance.eliminated
          };
        }
        return opp;
      });
    });
  }

  // Get active bot instances list
  getBotList() {
    return Array.from(this.botMap.values());
  }
}

export const botManager = new BotManager();
