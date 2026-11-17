import { loader } from '@monaco-editor/react';

// The code face for every Monaco editor (fix list item 10). Monaco draws text
// on its own and does not read CSS, so it gets the same face by name. The Thai
// face is listed second for Thai in comments and strings.
export const EDITOR_FONT_FAMILY = "'IBM Plex Mono', 'IBM Plex Sans Thai Looped', ui-monospace, monospace";

// Monaco measures character widths once, when the first editor opens. If the
// web font arrives after that, the cursor and selection drift from the text.
// Ask for the font up front, and re-measure whenever web fonts finish loading
// - only if Monaco is already loaded; this never pulls Monaco in by itself.
export function installEditorFontRemeasure() {
  if (typeof document === 'undefined' || !document.fonts) return;
  const remeasure = () => {
    const monaco = loader.__getMonacoInstance?.();
    monaco?.editor?.remeasureFonts();
  };
  document.fonts.load("400 15px 'IBM Plex Mono'").then(remeasure).catch(() => {});
  document.fonts.addEventListener?.('loadingdone', remeasure);
}
