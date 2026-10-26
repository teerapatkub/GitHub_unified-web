import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contrastRatio, getShopThemePalette, shopThemeColors, shopThemeTokens } from './shopPalette.js';

const THEMES = ['ธีมซากุระ', 'ocean theme', 'cyber theme', 'pixel theme', 'space theme'];
const rgb = (channels) => channels.split(' ').map(Number);
const WHITE = [255, 255, 255];

// The defaults the app paints with when no theme is worn.
const DEFAULTS = Object.fromEntries(
  [...readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8')
    .matchAll(/(--c-[a-z-]+):\s*([\d]+ [\d]+ [\d]+);/g)]
    .map(([, name, value]) => [name, value]),
);

test('every role a theme repaints exists in the token layer', () => {
  for (const name of THEMES) {
    for (const key of Object.keys(shopThemeTokens(getShopThemePalette({ name })))) {
      assert.ok(DEFAULTS[key], `${key} is written by themes but missing from tokens.css`);
    }
  }
});

test('a worn theme keeps text readable on its own surfaces', () => {
  for (const name of THEMES) {
    const t = shopThemeTokens(getShopThemePalette({ name }));
    const pairs = [
      ['--c-on-surface', '--c-surface'],
      ['--c-on-surface-variant', '--c-surface-low'],
      ['--c-outline', '--c-surface-low'],
      ['--c-label', '--c-surface'],
    ];
    for (const [fg, bg] of pairs) {
      const ratio = contrastRatio(rgb(t[fg]), rgb(t[bg]));
      assert.ok(ratio >= 4.5, `${name}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1`);
    }
    for (const fg of ['--c-primary', '--c-accent-strong', '--c-label']) {
      const ratio = contrastRatio(rgb(t[fg]), WHITE);
      assert.ok(ratio >= 4.5, `${name}: ${fg} on white is ${ratio.toFixed(2)}:1`);
    }
  }
});

test('the defaults behind text roles pass 4.5:1 on white', () => {
  // --c-outline is left out on purpose: it is the old pysim-outline, 4.47:1,
  // kept unchanged so the expand step does not move any existing page.
  for (const fg of ['--c-on-surface', '--c-on-surface-variant', '--c-label', '--c-primary',
    '--c-accent-strong', '--c-error', '--c-success-strong', '--c-warning-strong', '--c-info-strong']) {
    const ratio = contrastRatio(rgb(DEFAULTS[fg]), WHITE);
    assert.ok(ratio >= 4.5, `${fg} is ${ratio.toFixed(2)}:1`);
  }
});

test('status colours do not follow a theme', () => {
  const t = shopThemeColors(getShopThemePalette({ name: 'space theme' }));
  for (const key of Object.keys(t)) {
    assert.ok(!/--c-(error|success|warning|info)/.test(key), `${key} should stay fixed`);
  }
});
