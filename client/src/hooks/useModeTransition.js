import { useLayoutEffect, useRef } from 'react';

const modePaths = ['/learn', '/online', '/matchmaking'];
const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';

// Animate committed navigation only: cancelled Arcade exits never move the tab.
export default function useModeTransition(pathname) {
  const previousPath = useRef(pathname);

  useLayoutEffect(() => {
    const normalize = (path) => path === '/competitive-arena' ? '/online' : path;
    const from = modePaths.indexOf(normalize(previousPath.current));
    const to = modePaths.indexOf(normalize(pathname));
    previousPath.current = pathname;
    if (from < 0 || to < 0 || from === to) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionPreference.matches) return;
    const activeTab = document.querySelector('.mode-entry-nav a[aria-current="page"]');
    const previousTab = document.querySelector(`.mode-entry-nav a[href="${modePaths[from]}"]`);
    // A route guard may render a locked page instead of the requested mode.
    if (!activeTab || activeTab.getAttribute('href') !== modePaths[to]) return;
    const animations = [];
    const animate = (element, frames, duration) => {
      if (element?.animate) animations.push(element.animate(frames, { duration, easing }));
    };
    const indicator = activeTab.querySelector('.mode-entry-nav__indicator');
    if (indicator && previousTab) {
      const start = previousTab.getBoundingClientRect();
      const end = activeTab.getBoundingClientRect();
      animate(indicator, [
        { transform: `translateX(${start.left - end.left}px) scaleX(${start.width / end.width})` },
        { transform: 'translateX(0) scaleX(1)' },
      ], 360);
    }
    animate(activeTab.querySelector('svg'), [
      { transform: 'scale(0.8)', opacity: 0.5 },
      { transform: 'scale(1)', opacity: 1 },
    ], 300);
    // Opacity preserves fixed dialogs and sticky editors inside these surfaces.
    document.querySelectorAll('[data-mode-transition-content]').forEach((element) => {
      animate(element, [{ opacity: 0.25 }, { opacity: 1 }], 320);
    });
    const cancel = () => animations.forEach((animation) => animation.cancel());
    motionPreference.addEventListener('change', cancel);
    return () => {
      cancel();
      motionPreference.removeEventListener('change', cancel);
    };
  }, [pathname]);
}
