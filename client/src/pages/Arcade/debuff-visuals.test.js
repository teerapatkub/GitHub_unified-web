import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { editorFrameDebuffClass, debuffOverlayText, SHAKE_CLASS } from './debuffVisuals.js';
import { makeTranslator } from './translations.js';

const config = JSON.parse(readFileSync(new URL('../../../../shared/arcadeConfig.json', import.meta.url)));
const css = readFileSync(new URL('./arcade-effects.css', import.meta.url), 'utf8');

// Spec 0005 ticket 05: Earthquake bounced the editor with Tailwind's
// animate-bounce and ignored prefers-reduced-motion.
test('Earthquake uses the Arcade shake, never animate-bounce', () => {
  assert.equal(editorFrameDebuffClass(id => id === 'screenShake'), SHAKE_CLASS);
  assert.equal(editorFrameDebuffClass(() => false), '');
});

test('reduced motion swaps the shake for a still blur instead of dropping the effect', () => {
  const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
  assert.match(reduced, new RegExp(`\\.${SHAKE_CLASS}\\s*{[^}]*animation:\\s*none`));
  assert.match(reduced, new RegExp(`\\.${SHAKE_CLASS}\\s*{[^}]*filter:\\s*blur`));
});

test('ink fog and blackout overlays are translated and quote the real duration', () => {
  for (const lang of ['th', 'en']) {
    const t = makeTranslator(lang);
    for (const effect of ['inkFog', 'blackout']) {
      const text = debuffOverlayText(effect, t, config.effectDurations);
      assert.ok(text.title && !text.title.endsWith('Title'), `${lang} ${effect} title missing`);
      assert.ok(text.desc.includes(String(config.effectDurations[effect] / 1000)), `${lang} ${effect} seconds`);
    }
  }
  const th = debuffOverlayText('inkFog', makeTranslator('th'), config.effectDurations);
  assert.match(th.title + th.desc, /[฀-๿]/);
});
