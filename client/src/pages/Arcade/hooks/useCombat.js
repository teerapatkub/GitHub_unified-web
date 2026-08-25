// client/src/pages/Arcade/hooks/useCombat.js
// Combat/items concern: active-effect tracking, sabotage item dispatch (bot
// and real-opponent targets), incoming-effects polling, and the Monaco
// editor debuff handlers (key scrambler, typo injector, caps lock trap,
// backspace lock). Extracted as-is from ArcadeBattleRoyale.jsx — no behavior
// change, only relocated.
import { useState, useRef, useEffect, useCallback } from 'react';
import { botManager } from '../bot/botManager.js';
import arcadeConfig from '../../../../../shared/arcadeConfig.json';
import { PHASES, EFFECT_DURATIONS, DEFAULT_EFFECT_DURATION } from '../constants.js';

export default function useCombat({ playerState, setPlayerState, opponents, setOpponents, currentRoom, phase, notify, t, API_BASE, activeRoundHintRef }) {
  const [targetingItem, setTargetingItem] = useState(null);

  // Mirrors playerState for the incoming-effects poller below, so its interval
  // doesn't need `playerState` (which changes on every keystroke) in its deps.
  const playerStateRef = useRef(playerState);
  useEffect(() => { playerStateRef.current = playerState; }, [playerState]);

  const checkEffectActive = (effectId) => {
    const effect = playerState.activeEffects.find(e => e.type === effectId);
    return effect && effect.expiresAt > Date.now();
  };

  // Housekeeping for expired effects
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerState(prev => {
        const active = prev.activeEffects.filter(e => e.expiresAt > Date.now());
        if (active.length !== prev.activeEffects.length) {
          return { ...prev, activeEffects: active };
        }
        return prev;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [setPlayerState]);

  // Poll for incoming sabotage effects from real human opponents — bots apply
  // their debuffs directly via botManager.update() instead, entirely client-local.
  // Keyed on the room id rather than the `currentRoom` object: the parent's
  // room-state poll replaces that object every 2s, so depending on it made
  // this effect tear down and immediately re-poll on someone else's fetch
  // result instead of running on its own 2s interval.
  const roomId = currentRoom?.room_id ?? null;
  useEffect(() => {
    if (!roomId || phase === PHASES.LOBBY) return;

    const pollEffects = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/arcade/rooms/${roomId}/effects?user_name=${encodeURIComponent(playerStateRef.current.name)}`
        );
        const data = await res.json();
        if (!data.success || !data.effects || data.effects.length === 0) return;

        data.effects.forEach(effect => {
          if (effect.effect_type === 'cashSteal' || effect.effect_type === 'taxCollection') {
            setPlayerState(prev => ({ ...prev, cash: Math.max(0, prev.cash - (effect.amount || 0)) }));
            notify(`💸 ${effect.attacker_name} ${t('andStole')} 🪙 ${effect.amount}!`, "error");
            return;
          }

          const hasShield = playerStateRef.current.activeEffects.some(e => e.type === 'shield' && e.expiresAt > Date.now());
          if (hasShield) {
            setPlayerState(prev => ({ ...prev, activeEffects: prev.activeEffects.filter(e => e.type !== 'shield') }));
            notify(t('blockedAttack'), "success");
            return;
          }

          const duration = EFFECT_DURATIONS[effect.effect_type] || DEFAULT_EFFECT_DURATION;
          setPlayerState(prev => ({
            ...prev,
            activeEffects: [...prev.activeEffects.filter(e => e.type !== effect.effect_type), { type: effect.effect_type, expiresAt: Date.now() + duration }]
          }));
          notify(`🚨 ${effect.attacker_name} ${t('hitYouWith')} ${effect.item_name}!`, "error");
        });
      } catch (err) {
        console.error('Error polling incoming effects:', err);
      }
    };

    pollEffects();
    const effectsInterval = setInterval(pollEffects, 2000);
    return () => clearInterval(effectsInterval);
  }, [roomId, phase, API_BASE, notify, t, setPlayerState]);

  // Lets a bot's economic attack (cashSteal/taxCollection) against the real
  // human go through the same server endpoint a real player's own attacks
  // use — the human's cash is DB-authoritative now (see the room-state
  // poller in the main component), so a bot mutating it only client-side
  // would just get reverted by the next poll. See botManager.js's update()
  // for why this is passed in rather than done locally.
  const dispatchBotAttackOnPlayer = useCallback(async (attackerBotName, item) => {
    if (!currentRoom) return;
    try {
      await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attacker_name: attackerBotName, target_name: playerState.name, effect_type: item.id, item_name: item.name || item.id })
      });
    } catch (err) {
      console.error('Bot attack dispatch error:', err);
    }
  }, [currentRoom, playerState.name, API_BASE]);

  // Delivers one attack item's effect onto a single target — a bot (applied
  // instantly via botManager, entirely client-local) or a real human
  // participant (synced through the server's arcade_effects delivery queue so
  // it actually lands on that player's own screen, not just the attacker's).
  const dispatchAttack = useCallback(async (target, item) => {
    if (item.id === 'cashSteal' || item.id === 'taxCollection') {
      if (botManager.botMap.has(target.name)) {
        const bot = botManager.botMap.get(target.name);
        const stolen = item.id === 'taxCollection'
          ? Math.floor(bot.cash * arcadeConfig.cashSteal.taxPercent)
          : Math.min(arcadeConfig.cashSteal.flatAmount, bot.cash);
        bot.cash -= stolen;
        setPlayerState(prev => ({ ...prev, cash: prev.cash + stolen }));
        notify(`${t('stole')} 🪙 ${stolen} ${t('from')} ${target.name}!`, "success");
        return;
      }
      if (!currentRoom) return;
      try {
        const res = await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/attack`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attacker_name: playerState.name, target_name: target.name, effect_type: item.id, item_name: item.name || item.id })
        });
        const data = await res.json();
        if (data.success) {
          setPlayerState(prev => ({ ...prev, cash: prev.cash + data.stolen }));
          notify(`${t('stole')} 🪙 ${data.stolen} ${t('from')} ${target.name}!`, "success");
        } else {
          notify(data.error || 'Attack failed', "error");
        }
      } catch (err) {
        console.error('Attack dispatch error:', err);
      }
      return;
    }

    if (botManager.botMap.has(target.name)) {
      const result = botManager.botMap.get(target.name).receiveAttack(playerState.name, item);
      if (result.blocked) {
        notify(result.msg, "warning");
      } else {
        notify(`${t('fired')} ${t(item.nameKey || item.id)} ${t('at')} ${target.name}!`, "success");
      }
      return;
    }

    if (!currentRoom) return;
    try {
      const res = await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attacker_name: playerState.name, target_name: target.name, effect_type: item.id, item_name: t(item.nameKey || item.id) })
      });
      const data = await res.json();
      if (data.success) {
        notify(`${t('fired')} ${t(item.nameKey || item.id)} ${t('at')} ${target.name}!`, "success");
      } else {
        notify(data.error || 'Attack failed', "error");
      }
    } catch (err) {
      console.error('Attack dispatch error:', err);
    }
  }, [playerState.name, currentRoom, API_BASE, notify, t, setPlayerState]);

  const executeItem = (item, targetIndex) => {
    setPlayerState(prev => {
      const newInv = [...prev.inventory];
      const index = newInv.findIndex(i => i.id === item.id);
      if (index > -1) newInv.splice(index, 1);
      return { ...prev, inventory: newInv };
    });

    if (item.type === 'buff') {
      if (item.id === 'aiHelper') {
        // The hint for the problem actually on screen. This used to be
        // t('aiHint') — one fixed sentence ("try a loop or a dictionary") shown
        // for all 40 problems regardless of which one you were solving, which
        // made a 600-cash item worthless. `activeRoundHint` comes from the same
        // shaped task the editor and the examples come from, so it cannot
        // describe a different problem than the one being played. The generic
        // line stays as the fallback for a task row with no hint stored.
        const hint = activeRoundHintRef?.current || t('aiHint');
        setPlayerState(prev => ({ ...prev, hint }));
        notify(t('aiActivated'), "success");
      } else if (item.id === 'shield') {
        setPlayerState(prev => ({
          ...prev,
          activeEffects: [...prev.activeEffects, { type: 'shield', expiresAt: Date.now() + 99999999 }]
        }));
        notify(t('shieldActivated'), "success");
      } else if (item.id === 'scoreMultiplier') {
        setPlayerState(prev => ({
          ...prev,
          activeEffects: [...prev.activeEffects, { type: 'scoreMultiplier', expiresAt: Date.now() + 99999999 }]
        }));
        notify("⚡ Score Multiplier activated! 2x round points will be awarded.", "success");
      } else if (item.id === 'taxCollection') {
        // Targets whoever is richest among all live opponents — bot or real
        // human. A bot target stays purely local/cosmetic (its cash is only
        // ever a display approximation, converged for real at each round's
        // server-side finalize); a real human's cash is DB-authoritative
        // now, so that case has to go through the same server endpoint the
        // player's own outgoing attacks already use, or it would just get
        // reverted by the next room-state poll.
        const activeTargets = opponents.filter(o => !o.eliminated);
        if (activeTargets.length > 0) {
          const richTarget = activeTargets.reduce((max, o) => o.cash > max.cash ? o : max, activeTargets[0]);
          if (richTarget.isBot) {
            const botIdx = opponents.findIndex(b => b.name === richTarget.name);
            const tax = Math.floor(richTarget.cash * arcadeConfig.cashSteal.taxPercent);
            setOpponents(prev => {
              const newOpp = [...prev];
              newOpp[botIdx] = { ...newOpp[botIdx], cash: newOpp[botIdx].cash - tax };
              return newOpp;
            });
            setPlayerState(prev => ({ ...prev, cash: prev.cash + tax }));
            notify(`💸 Tax collected! Stole 20% (🪙 ${tax}) from wealthy player ${richTarget.name}!`, "success");
          } else {
            dispatchAttack(richTarget, item);
          }
        } else {
          notify("No active wealthy targets to collect taxes from!", "warning");
        }
      }
    }
    else if (item.type === 'aoe') {
      const activeTargets = opponents.filter(o => !o.eliminated);
      activeTargets.forEach(target => dispatchAttack(target, item));
      notify(`${t('deployed')} ${t(item.nameKey)}! ${t('allEnemiesAffected')}`, "success");
    }
    else if (item.type === 'attack' && targetIndex !== null) {
      const target = opponents[targetIndex];
      dispatchAttack(target, item);
    }

    setTargetingItem(null);
  };

  const initiateItemUse = (item) => {
    if (item.type === 'attack') {
      setTargetingItem(item);
      notify(`${t('selectTarget')} [${t(item.nameKey)}] ${t('fromLobby')}`, "info");
    } else {
      executeItem(item, null);
    }
  };

  // Attack-type items can't be aimed at someone who already has a debuff
  // active — they're not selectable as a target at all, forcing the
  // attacker to pick someone else. Once that target's current effect
  // expires they become selectable again. AOE items never go through this
  // picker (they execute immediately on every live opponent), so this only
  // ever gates single-target `attack` items.
  const handleTargetClick = (botIndex) => {
    const target = opponents[botIndex];
    if (targetingItem && !target.eliminated && !target.isDebuffed) {
      executeItem(targetingItem, botIndex);
    }
  };

  // Keyboard and Input Debuffs for Monaco
  const handleEditorKeyDown = (e) => {
    if (checkEffectActive('timeFreeze') || checkEffectActive('blackout')) {
      e.preventDefault();
      return;
    }

    if (checkEffectActive('backspaceLock') && (e.key === 'Backspace' || e.key === 'Delete')) {
      e.preventDefault();
      notify(t('backspaceLocked'), "error");
    }
  };

  const handleCodeChange = (value) => {
    if (checkEffectActive('timeFreeze') || checkEffectActive('blackout')) {
      return;
    }

    let nextValue = value || "";

    // Scramble Keys active
    if (checkEffectActive('keyScrambler')) {
      const scrambleMap = { 'a': 'q', 'e': 'w', 'i': 'r', 'o': 't', 'u': 'y', 's': 'd', 't': 'f' };
      const lastChar = nextValue.slice(-1).toLowerCase();
      if (scrambleMap[lastChar]) {
        nextValue = nextValue.slice(0, -1) + scrambleMap[lastChar];
      }
    }

    // Typo Glitch active
    if (checkEffectActive('typoGenerator') && Math.random() < 0.15) {
      const randomChars = "xyz1!#";
      nextValue += randomChars[Math.floor(Math.random() * randomChars.length)];
    }

    // Caps Lock Lock active
    if (checkEffectActive('capsLockLock')) {
      nextValue = nextValue.toUpperCase();
    }

    setPlayerState(prev => ({ ...prev, code: nextValue }));
  };

  return {
    targetingItem,
    setTargetingItem,
    checkEffectActive,
    dispatchBotAttackOnPlayer,
    dispatchAttack,
    executeItem,
    initiateItemUse,
    handleTargetClick,
    handleEditorKeyDown,
    handleCodeChange
  };
}
