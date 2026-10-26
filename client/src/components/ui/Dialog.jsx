import { useEffect, useRef } from 'react';
import { motion as Motion } from 'framer-motion';
import { FOCUSABLE_SELECTOR, wrapTabIndex } from './dialogFocus.js';

// One modal for the whole app, following the Lumi tour (GuidedTour.jsx), which
// was the only popup the 2026-10-25 audit found correct: it is announced as a
// dialog with a name, focus moves in and stays in, Escape closes it, and focus
// returns to whatever opened it.
//
// The caller owns the title element and passes its id as `titleId`. Put
// `data-autofocus` on the control that should get focus first; otherwise the
// first focusable control does.
//
// Rendered conditionally, never inside AnimatePresence: an exit animation was
// found to sometimes never unmount, leaving an invisible backdrop that ate every
// click (see the Arcade modals' history).
export default function Dialog({
  open, onClose, titleId, children,
  panelClassName = '', overlayClassName = 'fixed inset-0 z-50 bg-pysim-on-surface/40 backdrop-blur-sm',
  panelMotion = { initial: { scale: 0.95 }, animate: { scale: 1 } },
}) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement;
    const panel = panelRef.current;
    const focusables = () => [...(panel?.querySelectorAll(FOCUSABLE_SELECTOR) || [])];
    const first = panel?.querySelector('[data-autofocus]') || focusables()[0] || panel;
    first?.focus({ preventScroll: true });

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      const target = wrapTabIndex(items.indexOf(document.activeElement), items.length, event.shiftKey);
      if (target !== null) {
        event.preventDefault();
        items[target].focus();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      if (opener?.isConnected && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;
  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${overlayClassName} flex items-center justify-center p-6`}
    >
      <Motion.div
        {...panelMotion}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`focus:outline-none ${panelClassName}`}
      >
        {children}
      </Motion.div>
    </Motion.div>
  );
}
