import { useState, useRef, useEffect, useCallback } from 'react';
import { SHOP_ITEMS, MAX_INVENTORY, MAX_AOE_HELD } from '../constants.js';

const decorate = items => items.map(item => ({ ...SHOP_ITEMS.find(meta => meta.id === item.id), ...item }));

export default function useShopEconomy({ playerState, setPlayerState, setOpponents, currentRoom, notify, t, API_BASE }) {
  const roomId = currentRoom?.room_id;
  const matchId = currentRoom?.current_match_id;
  const phase = currentRoom?.phase;
  const scope = `${roomId}:${matchId}:${phase}:${playerState.name}`;
  const scopeRef = useRef(scope);
  scopeRef.current = scope;
  const latest = useRef({ scope: null, revision: -1, sequence: 0 });
  const sequence = useRef(0);
  const pending = useRef(null);
  const inFlight = useRef(false);
  const [syncErrorScope, setSyncErrorScope] = useState(null);
  const [busy, setBusy] = useState(false);
  const [retryScope, setRetryScope] = useState(null);
  const [shopState, setShopState] = useState({ items: [], rerollCost: 200, scope: null });
  const accept = useCallback((data, requestScope, requestSequence, startedAt) => {
    if (scopeRef.current !== requestScope || data.match_id !== matchId || data.phase !== phase) return false;
    const previous = latest.current;
    if (previous.scope === requestScope && (data.revision < previous.revision
      || (data.revision === previous.revision && requestSequence < previous.sequence))) return false;
    setSyncErrorScope(null);
    latest.current = { scope: requestScope, revision: data.revision, sequence: requestSequence };
    // Use remaining server lifetime, conservatively subtracting request time.
    // A skewed browser clock cannot skip an attack or restart its duration.
    const localNow = Date.now();
    const elapsed = performance.now() - startedAt;
    const restoreEffects = (effects, existing = []) => (effects || []).map(effect => {
      const previousEffect = existing.find(value => value.instance_id === effect.instance_id && value.type === effect.type);
      const expiresAt = localNow + Math.max(0, effect.expiresAt - data.serverNow - elapsed);
      return { ...effect, expiresAt: previousEffect ? Math.min(previousEffect.expiresAt, expiresAt) : expiresAt };
    }).filter(effect => effect.expiresAt > localNow);
    setShopState({ items: decorate(data.offers), rerollCost: data.rerollCost, scope: requestScope });
    setPlayerState(prev => ({ ...prev, cash: data.cash, inventory: decorate(data.inventory),
      activeEffects: [...prev.activeEffects.filter(effect => !effect.serverOwned && !['shield', 'scoreMultiplier', 'aiHelper'].includes(effect.type)),
        ...restoreEffects(data.selfEffects, prev.activeEffects),
        ...restoreEffects(data.attackEffects, prev.activeEffects).map(effect => ({ ...effect, serverOwned: true }))] }));
    setOpponents(prev => prev.map(opponent => {
      const status = data.opponents?.find(value => value.name === opponent.name);
      const serverEffects = restoreEffects(status?.effects, opponent.serverEffects).map(effect => ({ ...effect, serverOwned: true }));
      return { ...opponent, serverEffects, serverDebuffed: serverEffects.length > 0, isDebuffed: serverEffects.length > 0 };
    }));
    return true;
  }, [matchId, phase, setPlayerState, setOpponents]);

  const refresh = useCallback(async () => {
    if (!roomId || !matchId || !phase || phase === 'LOBBY') return;
    const requestSequence = ++sequence.current;
    const startedAt = performance.now();
    try {
      const response = await fetch(`${API_BASE}/api/arcade/rooms/${roomId}/shop?match_id=${matchId}`, { signal: AbortSignal.timeout(8000) });
      const data = await response.json();
      if (response.ok && data.success) accept(data, scope, requestSequence, startedAt);
      else if (scopeRef.current === scope) setSyncErrorScope(scope);
    } catch { if (scopeRef.current === scope) setSyncErrorScope(scope); }
  }, [roomId, matchId, phase, API_BASE, scope, accept ]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  const runCommand = async (action, target = {}, onSuccess) => {
    if (inFlight.current || !matchId) return false;
    const intent = JSON.stringify([scope, action, target]);
    if (pending.current?.scope !== scope) pending.current = null;
    if (pending.current && pending.current.intent !== intent) {
      notify(t('shopRetryPrevious'), 'error');
      return false;
    }
    const request = pending.current || { scope, intent, target, onSuccess, body: { match_id: matchId, phase, action, ...target, request_id: crypto.randomUUID() } };
    pending.current = request;
    inFlight.current = true;
    setBusy(true);
    const requestSequence = ++sequence.current;
    const startedAt = performance.now();
    try {
      const response = await fetch(`${API_BASE}/api/arcade/rooms/${roomId}/shop`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body), signal: AbortSignal.timeout(8000)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        if ([400, 401, 403, 404, 409, 410].includes(response.status)) {
          pending.current = null;
          setRetryScope(null);
        } else setRetryScope(scope);
        if (scopeRef.current === scope) notify(data.error || t('shopRequestFailed'), 'error');
        return false;
      }
      pending.current = null;
      setRetryScope(null);
      accept(data, scope, requestSequence, startedAt);
      if (scopeRef.current === scope) request.onSuccess?.(data);
      return scopeRef.current === scope;
    } catch {
      setRetryScope(scope);
      if (scopeRef.current === scope) notify(t('shopRequestFailed'), 'error');
      return false;
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const canBuyItem = item => !busy && shopState.scope === scope && !item.purchased
    && playerState.cash >= item.price && !playerState.eliminated
    && playerState.inventory.length < MAX_INVENTORY
    && (item.type !== 'aoe' || playerState.inventory.filter(i => i.type === 'aoe').length < MAX_AOE_HELD);
  const buyItem = async item => {
    if (await runCommand('buy', { offer_id: item.offer_id })) notify(`${t('bought')} ${t(item.nameKey)}!`, 'success');
  };
  const sellItem = async index => {
    const item = playerState.inventory[index];
    if (item && await runCommand('sell', { instance_id: item.instance_id })) notify(`${t('sold')} ${t(item.nameKey)}`, 'success');
  };
  const consumeItem = (item, onSuccess, targetName) => runCommand('consume', { instance_id: item.instance_id,
    ...(targetName ? { target_name: targetName } : {}) }, onSuccess);
  const rollShop = () => runCommand('reroll');
  const retryShopCommand = () => {
    const request = pending.current;
    if (request?.scope === scope) return runCommand(request.body.action, request.target, request.onSuccess);
  };
  return { retryShopSync: refresh, shopSyncError: syncErrorScope === scope, shopState: { ...shopState, busy, ready: shopState.scope === scope },
    retryShopCommand, shopRetryNeeded: retryScope === scope, rollShop, canBuyItem, buyItem, sellItem, consumeItem };
}
