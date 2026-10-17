// Server-owned item commands and rendering of the returned effect snapshot.
import { useState, useRef, useEffect, useCallback } from 'react';
import { applyTypingDebuffs, blocksKey } from '../typing-debuffs.js';

export default function useCombat({ playerState, setPlayerState, opponents, currentRoom, notify, t, consumeItem }) {
  const scope = `${currentRoom?.room_id}:${currentRoom?.current_match_id}:${currentRoom?.phase}`;
  const [targeting, setTargeting] = useState(null);
  const targetingItem = targeting?.scope === scope ? targeting.item : null;
  const setTargetingItem = useCallback(item => setTargeting(item ? { item, scope } : null), [scope]);
  const seenEffects = useRef(new Set());
  const checkEffectActive = effectId => playerState.activeEffects.some(effect => effect.type === effectId && effect.expiresAt > Date.now());
  const activeEffectTypes = () => playerState.activeEffects.filter(effect => effect.expiresAt > Date.now()).map(effect => effect.type);

  useEffect(() => {
    seenEffects.current = new Set();
  }, [currentRoom?.room_id, currentRoom?.current_match_id, currentRoom?.phase]);

  useEffect(() => {
    for (const effect of playerState.activeEffects) {
      if (!effect.serverOwned || seenEffects.current.has(effect.instance_id)) continue;
      seenEffects.current.add(effect.instance_id);
      notify(`🚨 ${effect.attacker} ${t('hitYouWith')} ${t(`${effect.type}Name`)}!`, 'error');
    }
  }, [playerState.activeEffects, notify, t]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerState(prev => {
        const active = prev.activeEffects.filter(effect => effect.expiresAt > Date.now());
        return active.length === prev.activeEffects.length ? prev : { ...prev, activeEffects: active };
      });
    }, 500);
    return () => clearInterval(interval);
  }, [setPlayerState]);

  const executeItem = (item, targetIndex) => {
    const target = item.type === 'attack' ? opponents[targetIndex]?.name : undefined;
    if (item.type === 'attack' && !target) return;
    return consumeItem(item, data => {
      if (data.attackResult) {
        const results = data.attackResult.targets;
        const stolen = results.reduce((sum, result) => sum + result.stolen, 0);
        if (results.every(result => result.blocked)) notify(t('blockedAttack'), 'warning');
        else if (stolen) notify(`${t('stole')} 🪙 ${stolen}`, 'success');
        else notify(`${t('deployed')} ${t(item.nameKey)}!`, 'success');
      } else if (item.id === 'aiHelper') notify(t('aiActivated'), 'success');
      else if (item.id === 'shield') notify(t('shieldActivated'), 'success');
      else notify(`⚡ ${t('scoreMultiplierName')}`, 'success');
      setTargetingItem(null);
    }, target);
  };

  const initiateItemUse = item => {
    if (item.type === 'attack') {
      setTargetingItem(item);
      notify(`${t('selectTarget')} [${t(item.nameKey)}] ${t('fromLobby')}`, 'info');
    } else executeItem(item, null);
  };

  const handleTargetClick = index => {
    const target = opponents[index];
    if (targetingItem && target && !target.eliminated && !target.isDebuffed) executeItem(targetingItem, index);
  };

  // Keyboard debuffs. Called from Monaco's own key handler (see the editor's
  // onMount): a listener on any other element never sees the player's keys.
  const handleEditorKeyDown = (e) => {
    if (checkEffectActive('timeFreeze') || checkEffectActive('blackout')) {
      e.preventDefault();
      return;
    }

    if (blocksKey(e.key, activeEffectTypes())) {
      e.preventDefault();
      notify(t('backspaceLocked'), "error");
    }
  };

  const handleCodeChange = (value) => {
    if (playerState.codeScope !== `${scope}:${playerState.name}` || playerState.hasSubmittedThisRound || playerState.eliminated) return;
    if (checkEffectActive('timeFreeze') || checkEffectActive('blackout')) {
      return;
    }

    // Scrambler, typo glitch and caps lock change only what is typed now.
    const nextValue = applyTypingDebuffs(playerState.code || '', value || '', activeEffectTypes());
    setPlayerState(prev => ({ ...prev, code: nextValue }));
  };

  return {
    targetingItem,
    setTargetingItem,
    checkEffectActive,
    executeItem,
    initiateItemUse,
    handleTargetClick,
    handleEditorKeyDown,
    handleCodeChange
  };
}
