import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { padRect, placeBubble, stepRect, visibleSteps } from '../../utils/tourLayout.js';

// Lumi walks the player through the real page: the screen dims except for a
// lit hole around the element being explained, and her speech bubble sits
// beside it. Steps come from data/appTour.js through TourHost.
//
// While it is open nothing behind it can be clicked, so a new player cannot
// wander off half-way through by accident; Esc or "skip" always gets out.

const PHONE_WIDTH = 640;

const measure = (selector) => {
  const element = document.querySelector(selector);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
};

const viewportSize = () => ({ width: window.innerWidth, height: window.innerHeight });

// Mounted only while the tour is open (TourHost), so every opening starts at
// step one.
export default function GuidedTour({ steps, onClose, isThai }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [spot, setSpot] = useState(null);
  const [viewport, setViewport] = useState(viewportSize);
  const [bubbleSize, setBubbleSize] = useState({ width: 360, height: 220 });
  const bubbleRef = useRef(null);
  const nextRef = useRef(null);

  // Which steps can be shown is decided when the tour opens: a button hidden
  // on this screen size is left out instead of lighting up empty space.
  const shown = useMemo(() => visibleSteps(steps, measure), [steps]);
  const step = shown[Math.min(index, shown.length - 1)];
  const isLast = index >= shown.length - 1;

  const remeasure = useCallback(() => {
    setViewport(viewportSize());
    setSpot(step ? padRect(stepRect(step, measure)) : null);
  }, [step]);

  // Bring the element into view, then light it up.
  useLayoutEffect(() => {
    if (!step) return undefined;
    const first = [step.target].flat().filter(Boolean)[0];
    const element = first && document.querySelector(first);
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        element.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }
    const frame = requestAnimationFrame(remeasure);
    nextRef.current?.focus({ preventScroll: true });
    return () => cancelAnimationFrame(frame);
  }, [step, remeasure, reduceMotion]);

  // Follow the element through resizes, scrolling and late layout shifts.
  useEffect(() => {
    let frame = 0;
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(remeasure); };
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    const settle = setTimeout(schedule, 350); // after a smooth scroll lands
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
      observer.disconnect();
    };
  }, [remeasure]);

  // The bubble's own size decides where it fits; text length differs per step.
  useEffect(() => {
    const node = bubbleRef.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.target.getBoundingClientRect();
      setBubbleSize((size) => (Math.abs(width - size.width) > 1 || Math.abs(height - size.height) > 1 ? { width, height } : size));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [step]);

  const next = useCallback(() => (isLast ? onClose('done') : setIndex((i) => i + 1)), [isLast, onClose]);
  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose('skip'); }
      if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); back(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, back, onClose]);

  if (!step) return null;

  const phone = viewport.width < PHONE_WIDTH;
  const place = phone
    ? { side: 'phone', left: 12, top: viewport.height - bubbleSize.height - 12 }
    : placeBubble(spot, bubbleSize, viewport);
  const words = isThai
    ? { skip: 'ข้าม', back: 'ย้อนกลับ', next: 'ถัดไป', done: 'เริ่มเลย!', close: 'ปิดบทแนะนำ', label: 'บทแนะนำ' }
    : { skip: 'Skip', back: 'Back', next: 'Next', done: "Let's go!", close: 'Close the tour', label: 'Guided tour' };

  return createPortal(
    <div className="fixed inset-0 z-[300]" role="presentation" onClick={(event) => event.stopPropagation()}>
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <mask id="pyarena-tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {spot && <rect x={spot.left} y={spot.top} width={spot.width} height={spot.height} rx="14" fill="black" />}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(2, 6, 23, 0.62)" mask="url(#pyarena-tour-mask)" />
      </svg>

      {spot && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute rounded-[14px] ring-4 ring-amber-300/90 ${reduceMotion ? '' : 'animate-pulse'}`}
          style={{ left: spot.left, top: spot.top, width: spot.width, height: spot.height, transition: reduceMotion ? 'none' : 'all 220ms ease' }}
        />
      )}

      <Motion.section
        key={step.id}
        ref={bubbleRef}
        role="dialog"
        aria-modal="true"
        aria-label={words.label}
        initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18 }}
        className="absolute flex gap-3 rounded-3xl border border-white/70 bg-white p-4 text-left text-slate-800 shadow-2xl sm:p-5"
        style={{ left: place.left, top: place.top, width: phone ? viewport.width - 24 : 380 }}
      >
        <img
          src={`/data_MiNiGame/NPC_lumi/lumi_${step.lumi}.png`}
          alt="Lumi"
          className="h-16 w-16 shrink-0 self-start rounded-2xl bg-sky-50 object-contain sm:h-20 sm:w-20"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-600">
              Lumi · {index + 1} / {shown.length}
            </p>
            <button type="button" onClick={() => onClose('skip')} aria-label={words.close}
              className="-mr-1 -mt-1 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <h2 className="mt-1 text-lg font-black leading-snug text-slate-900">{step.title}</h2>
          <p aria-live="polite" className="mt-1.5 text-sm leading-6 text-slate-600">{step.body}</p>
          <div className="mt-4 flex items-center justify-between gap-2">
            <button type="button" onClick={() => onClose('skip')}
              className="text-xs font-bold text-slate-400 transition-colors hover:text-slate-700">
              {words.skip}
            </button>
            <div className="flex items-center gap-2">
              {index > 0 && (
                <button type="button" onClick={back} aria-label={words.back}
                  className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50">
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              <button ref={nextRef} type="button" onClick={next}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300">
                {isLast ? words.done : words.next}
                {!isLast && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </Motion.section>
    </div>,
    document.body,
  );
}
