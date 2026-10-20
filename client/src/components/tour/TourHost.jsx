import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../../config/api.js';
import { resolveTour, shouldAutoStartTour } from '../../data/appTour.js';
import GuidedTour from './GuidedTour.jsx';

// One tour on one page. It opens by itself the first time a player could see
// it (data/appTour.js decides who), and again whenever the header's "?"
// button asks for it.
//
// The "?" button calls requestTour() (utils/tourEvents.js), which fires
// `pyarena:tour-request`. A page tour (Arcade lobby,
// Competitive feed) answers it while its page is showing; the menu-bar tour
// in App.jsx only answers the follow-up `pyarena:tour-request-fallback`, so
// "?" always explains the page the player is looking at.

const LOCAL_KEY = 'pyarena:tours-seen';
// Only one tour may be on screen. Two stacked overlays would both close on a
// single Esc and both be recorded as seen.
let openTourId = null;

const readLocal = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); } catch { return []; }
};
const writeLocal = (tourId) => {
  try {
    const seen = readLocal();
    if (!seen.includes(tourId)) localStorage.setItem(LOCAL_KEY, JSON.stringify([...seen, tourId]));
  } catch { /* private window: the account record still holds it */ }
};

async function rememberOnAccount(tourId, user) {
  if (!user || user.isGuest) return;
  try {
    const response = await fetch(`${API_BASE}/api/user/tutorials/${tourId}/seen`, { method: 'POST' });
    if (!response.ok) return;
    const { tutorials_seen: tutorialsSeen } = await response.json();
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    if (!stored || Number(stored.user_id) !== Number(user.user_id)) return;
    const next = { ...stored, tutorials_seen: tutorialsSeen };
    localStorage.setItem('user', JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('pysim:user-updated', { detail: { user: next } }));
  } catch { /* offline: this browser still remembers it */ }
}

export default function TourHost({ tourId, user, autoStart, fallback = false }) {
  const { i18n } = useTranslation();
  const isThai = i18n.language.startsWith('th');
  const [open, setOpen] = useState(false);
  const started = useRef(false);
  const level = user?.level;
  const role = user?.role;
  const isGuest = user?.isGuest;
  // Rebuilt only when what the player sees changes, so the spotlight does not
  // re-measure on every render.
  const steps = useMemo(() => resolveTour(tourId, { level, role, isGuest }, isThai),
    [tourId, level, role, isGuest, isThai]);

  const forced = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('tour') === tourId;
  const due = autoStart && (forced || shouldAutoStartTour({ tourId, user, seenLocally: readLocal() }));

  useEffect(() => {
    if (!due || started.current) return undefined;
    // Let the page finish laying out before measuring what to light up.
    const timer = setTimeout(() => {
      if (openTourId) return;
      started.current = true;
      openTourId = tourId;
      setOpen(true);
    }, 700);
    return () => clearTimeout(timer);
  }, [due, tourId]);

  // Leaving the page mid-tour stops it without counting it as seen.
  useEffect(() => () => { if (openTourId === tourId) openTourId = null; }, [tourId]);

  useEffect(() => {
    const onRequest = (event) => {
      if (!fallback) {
        if (!autoStart) return;
        event.detail.handled = true;
      }
      if (openTourId && openTourId !== tourId) return;
      openTourId = tourId;
      setOpen(true);
    };
    const name = fallback ? 'pyarena:tour-request-fallback' : 'pyarena:tour-request';
    window.addEventListener(name, onRequest);
    return () => window.removeEventListener(name, onRequest);
  }, [autoStart, fallback, tourId]);

  const close = useCallback(() => {
    setOpen(false);
    started.current = true;
    if (openTourId === tourId) openTourId = null;
    // Skipping counts as seen: a player who said no should not be asked again.
    writeLocal(tourId);
    if (!user?.tutorials_seen?.includes(tourId)) rememberOnAccount(tourId, user);
  }, [tourId, user]);

  return open ? <GuidedTour steps={steps} onClose={close} isThai={isThai} /> : null;
}
