// How screen debuffs look, kept out of the gameplay view so it can be tested.
// The motion itself lives in arcade-effects.css, which swaps the shake for a
// blur under prefers-reduced-motion; the class and the effect's lifetime are
// the same for every player.
export const SHAKE_CLASS = 'arcade-shake';

export function editorFrameDebuffClass(isActive) {
  return isActive('screenShake') ? SHAKE_CLASS : '';
}

const OVERLAY_KEYS = {
  inkFog: ['inkFogOverlayTitle', 'inkFogOverlayDesc'],
  blackout: ['blackoutOverlayTitle', 'blackoutOverlayDesc'],
};

// Title and body for the full-editor overlays. Pass effectDurations from
// shared/arcadeConfig.json, the same table the server and the effect timer
// use, so the seconds in the text cannot drift from the real effect.
export function debuffOverlayText(effectId, t, effectDurations) {
  const keys = OVERLAY_KEYS[effectId];
  if (!keys) return null;
  const seconds = Math.round((effectDurations?.[effectId] || 0) / 1000);
  return { title: t(keys[0]), desc: t(keys[1]).replace('{{s}}', String(seconds)) };
}
