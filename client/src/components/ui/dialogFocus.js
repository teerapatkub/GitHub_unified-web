// Pure focus-trap arithmetic for Dialog.jsx, kept apart so it can be tested
// without a DOM. Given where focus is among a dialog's focusable elements,
// returns the index Tab should move to, or null to let the browser handle it.
export const FOCUSABLE_SELECTOR = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',');

export function wrapTabIndex(currentIndex, count, shiftKey) {
  if (count === 0) return null;
  // Focus is outside the dialog (or on the panel itself): pull it in.
  if (currentIndex < 0) return shiftKey ? count - 1 : 0;
  if (shiftKey && currentIndex === 0) return count - 1;
  if (!shiftKey && currentIndex === count - 1) return 0;
  return null;
}
