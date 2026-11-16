// The cosmetic effects the shop sells (fix list item 8): one canvas for what a
// click makes, one for the moving scene of an equipped theme.
//
// Click effects sit above everything, like the emoji bursts before them. The
// scene sits under the navbar (z-index 40) and every dialog, so falling
// leaves never cover a menu someone is trying to use.
//
// Which scene plays, in order of precedence:
//   1. a shop preview (previewThemeScene), for a few seconds;
//   2. the theme of a profile being looked at (showProfileScene), while it is
//      on screen - so a visitor sees the owner's snow or fireworks;
//   3. the viewer's own equipped theme (setThemeScene).
import { createFxLayer, reducedMotion } from './fxLayer.js';
import { CLICK_FX } from './clickBursts.js';
import { sceneForTheme } from './ambientScenes.js';

let clickLayer = null;
let sceneLayer = null;
let equippedScene = { key: '', factory: null };
let profileScene = null; // { factory } while a profile is showing its owner's theme
let previewTimer = 0;

const getClickLayer = () => (clickLayer ||= createFxLayer({ zIndex: 9999, label: 'click' }));
const getSceneLayer = () => (sceneLayer ||= createFxLayer({ zIndex: 30, label: 'scene' }));

const factoryFor = (themeText) => (reducedMotion() ? null : sceneForTheme(themeText));

// Put on whichever of 2 and 3 applies now.
const playBase = () => {
  const factory = profileScene ? profileScene.factory : equippedScene.factory;
  if (factory) getSceneLayer().setScene(factory());
  else sceneLayer?.setScene(null);
};

export const isCanvasClickFx = (name) => Object.prototype.hasOwnProperty.call(CLICK_FX, name);

export function playClickFx(name, x, y) {
  const burst = CLICK_FX[name];
  if (!burst) return false;
  burst(getClickLayer(), x, y, { reduced: reducedMotion() });
  return true;
}

// The scene of the theme that is on. A reduced-motion setting turns scenes off
// entirely: unlike a click, nobody asked for them in that moment.
export function setThemeScene(themeText) {
  const factory = factoryFor(themeText);
  const key = factory ? String(themeText) : '';
  if (key === equippedScene.key) return;
  equippedScene = { key, factory };
  // A preview or a profile on screen takes precedence; it hands back to this
  // when it ends.
  if (previewTimer || profileScene) return;
  playBase();
}

export const themeHasScene = (themeText) => Boolean(sceneForTheme(themeText));

/**
 * Play the scene of the theme shown on a profile page while that page is open.
 * Returns the function that hands the screen back to the viewer's own theme.
 * A profile whose theme has no scene shows none, rather than the viewer's.
 */
export function showProfileScene(themeText) {
  const token = { factory: factoryFor(themeText) };
  profileScene = token;
  if (!previewTimer) playBase();
  return () => {
    if (profileScene !== token) return; // another profile has taken over since
    profileScene = null;
    if (!previewTimer) playBase();
  };
}

// Let a shopper see a theme's scene for a few seconds without buying it.
export function previewThemeScene(themeText, ms = 12000) {
  const factory = sceneForTheme(themeText);
  if (!factory || reducedMotion()) return false;
  clearTimeout(previewTimer);
  getSceneLayer().setScene(factory({ preview: true }));
  previewTimer = window.setTimeout(() => {
    previewTimer = 0;
    playBase();
  }, ms);
  return true;
}
