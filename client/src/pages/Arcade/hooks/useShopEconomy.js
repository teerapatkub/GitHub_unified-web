// client/src/pages/Arcade/hooks/useShopEconomy.js
// Shop/economy concern: cash spend/refund, item purchase/sell, reroll.
// Extracted as-is from ArcadeBattleRoyale.jsx — no behavior change, only
// relocated so the shop logic can be found without scrolling the whole page.
import { useState } from 'react';
import { SHOP_ITEMS, MAX_INVENTORY, MAX_AOE_HELD } from '../constants.js';

export default function useShopEconomy({ playerState, setPlayerState, currentRoom, notify, t, API_BASE }) {
  const [shopState, setShopState] = useState({ items: [], rerollCost: 200 });

  // Applies a cash delta authoritatively via the server (negative to spend —
  // buy/reroll, positive to refund — sell) instead of a local-only
  // setPlayerState. That old version let every shop action get silently
  // reverted within ~2s by the room-state poller's unconditional
  // `cash: myRow.cash` merge, since nothing ever told the server a purchase
  // happened — items stayed in the inventory but were effectively free.
  // Mirrors the same read-then-write pattern the /attack endpoint's
  // cashSteal/taxCollection branch already uses server-side. Returns the new
  // authoritative cash on success, or null if the server rejected it
  // (insufficient funds, wrong phase, network error).
  const applyCashDelta = async (delta) => {
    try {
      const res = await fetch(`${API_BASE}/api/arcade/rooms/${currentRoom.room_id}/shop-cash-delta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: playerState.name, delta })
      });
      const data = await res.json();
      if (!data.success) {
        notify(data.error || t('notEnoughCash'), "error");
        return null;
      }
      setPlayerState(prev => ({ ...prev, cash: data.cash }));
      return data.cash;
    } catch {
      notify("เกิดข้อผิดพลาดในการติดต่อเซิร์ฟเวอร์", "error");
      return null;
    }
  };

  const rollShop = async (isInitial = false) => {
    if (!isInitial) {
      if (playerState.cash < shopState.rerollCost) {
        notify(t('notEnoughCashReroll'), "error");
        return;
      }
      if ((await applyCashDelta(-shopState.rerollCost)) === null) return;
      setShopState(prev => ({ ...prev, rerollCost: prev.rerollCost * 2 }));
    } else {
      setShopState(prev => ({ ...prev, rerollCost: 200 }));
    }

    const shuffled = [...SHOP_ITEMS].sort(() => 0.5 - Math.random());
    setShopState(prev => ({ ...prev, items: shuffled.slice(0, 4).map(item => ({ ...item, purchased: false })) }));
  };

  // Whether `item` can still be bought right now: enough cash, bag not full
  // (max 3), and — if it's an `aoe` item — not already holding one (max 1,
  // counted inside the same 3-slot cap, not a separate quota).
  const canBuyItem = (item) => {
    if (playerState.cash < item.price) return false;
    if (playerState.inventory.length >= MAX_INVENTORY) return false;
    if (item.type === 'aoe' && playerState.inventory.filter(i => i.type === 'aoe').length >= MAX_AOE_HELD) return false;
    return true;
  };

  // Buys `item` (shop-rolled index `index`) — shop phase only, human player
  // only. Cash is spent server-side first (applyCashDelta); the inventory
  // add and "sold out" marker only apply once that's confirmed.
  const buyItem = async (item, index) => {
    if (item.purchased) return;
    if (!canBuyItem(item)) {
      if (playerState.cash < item.price) notify(t('notEnoughCash'), "error");
      else if (playerState.inventory.length >= MAX_INVENTORY) notify(t('inventoryFull'), "error");
      else notify(t('aoeLimitReached'), "error");
      return;
    }
    if ((await applyCashDelta(-item.price)) === null) return;
    setPlayerState(prev => ({ ...prev, inventory: [...prev.inventory, item] }));
    setShopState(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], purchased: true };
      return { ...prev, items: newItems };
    });
    notify(`${t('bought')} ${t(item.nameKey)}!`, "success");
  };

  // Sell an item back from the inventory for half its purchase price — shop
  // phase only, human player only (bots never sell). Refund is credited
  // server-side first; the item only leaves local inventory once confirmed.
  const sellItem = async (inventoryIndex) => {
    const item = playerState.inventory[inventoryIndex];
    if (!item) return;
    const refund = Math.floor(item.price * 0.5);
    if ((await applyCashDelta(refund)) === null) return;
    setPlayerState(prev => ({
      ...prev,
      inventory: prev.inventory.filter((_, idx) => idx !== inventoryIndex)
    }));
    notify(`${t('sold')} ${t(item.nameKey)} (+🪙 ${refund})`, "success");
  };

  return { shopState, setShopState, applyCashDelta, rollShop, canBuyItem, buyItem, sellItem };
}
