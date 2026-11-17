// How a coin balance is shown (fix list item 11, 2026-11-17).
//
// The owner chose a display cap rather than a wallet cap: coins past 99,999
// are still the player's and still spend, but every place that shows a
// balance stops at 99,999. Use this for balances only - prices and rewards
// are shown as they are.
export const COIN_DISPLAY_CAP = 99_999;

export const displayCoins = (value, locale) =>
  Math.min(Math.max(0, Number(value) || 0), COIN_DISPLAY_CAP).toLocaleString(locale);
