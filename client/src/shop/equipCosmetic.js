// Putting on (or taking off) a cosmetic: the one copy of it, used by the shop
// and by the appearance page (/profile/appearance). It used to live inside
// ShopPage, and a second copy in the appearance page would drift the same way
// the two copies of the theme palette once did (see themes/shopPalette.js).
//
// The server records the choice; the rest keeps this browser in step without a
// reload: the cached user in localStorage, the active theme, and the events the
// navbar, ThemeContext and MouseEffectLayer listen for.
import { API_BASE, assetUrl } from '../config/api.js';
import { getShopThemePalette, shopThemeColors } from '../themes/shopPalette.js';

export const userThemeKey = (user) => `game_theme:user:${user.user_id}`;

export const itemSlot = (type) => {
  if (type === 'THEME') return 'THEME';
  if (type === 'MOUSE_EFFECT') return 'MOUSE_EFFECT';
  if (type === 'PROFILE_PICTURE') return 'PROFILE_PICTURE';
  return 'PROFILE_FRAME';
};

// `item`: { itemId, name, assetUrl, previewImage }.
export const createShopTheme = (item) => ({
  id: `shop-theme-${item.itemId}`,
  name: item.name,
  icon: 'Aa',
  category: 'shop',
  description: 'Theme Store',
  backgroundImage: assetUrl(item.assetUrl || item.previewImage),
  colors: shopThemeColors(getShopThemePalette(item)),
});

const DEFAULT_THEME_ID = 'cyberpunk-light';

/**
 * Equip `item` in its slot, or clear the slot when `item` is null.
 *
 * @param {object}   args
 * @param {string}   args.type          THEME | MOUSE_EFFECT | PROFILE_FRAME | PROFILE_PICTURE
 * @param {object?}  args.item          { itemId, name, assetUrl, previewImage, effectData }
 * @param {Function} args.registerTheme from useTheme()
 * @param {Function} args.setTheme      from useTheme()
 * @returns {Promise<{ok: true, user: object} | {ok: false, error: string}>}
 */
export async function applyCosmetic({ type, item, registerTheme, setTheme }) {
  let user;
  try {
    user = JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    user = null;
  }
  if (!user?.user_id || user?.isGuest) return { ok: false, error: 'signin' };

  const res = await fetch(`${API_BASE}/api/shop/equip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.user_id, itemId: item ? item.itemId : null, type }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || '' };

  const slot = itemSlot(type);
  const next = { ...user };
  if (slot === 'THEME') {
    next.equipped_theme_id = item ? item.itemId : null;
    next.theme_asset_url = item ? item.assetUrl || item.previewImage : '';
    next.theme_preview_image = item ? item.previewImage || item.assetUrl : '';
    next.theme_name = item ? item.name : '';
    if (item) {
      const theme = createShopTheme(item);
      registerTheme(theme);
      localStorage.setItem(userThemeKey(user), theme.id);
      window.setTimeout(() => setTheme(theme.id), 0);
    } else {
      localStorage.setItem(userThemeKey(user), DEFAULT_THEME_ID);
      setTheme(DEFAULT_THEME_ID);
    }
  } else if (slot === 'MOUSE_EFFECT') {
    next.equipped_mouse_effect_id = item ? item.itemId : null;
    next.mouse_effect_data = item ? item.effectData : [];
    window.dispatchEvent(new CustomEvent('pysim:mouse-effect-equipped', {
      detail: { effects: item ? item.effectData : [] },
    }));
  } else if (slot === 'PROFILE_PICTURE') {
    // The server made it the avatar (avatar_url); carry the resolved avatar so
    // the navbar shows it straight away.
    next.avatar = data.avatar || next.avatar;
  } else {
    next.equipped_profile_frame_id = item ? item.itemId : null;
    next.profile_asset_url = item ? item.assetUrl || item.previewImage : '';
  }
  localStorage.setItem('user', JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('pysim:user-cosmetic-equipped', { detail: { user: next } }));
  return { ok: true, user: next };
}
