// Geometry for the guided tour (components/tour/GuidedTour.jsx). Pure so the
// placement rules can be tested without a browser.

export const TOUR_MARGIN = 12;
export const TOUR_GAP = 14;
export const TOUR_SPOT_PADDING = 8;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// One rectangle around every element a step points at, so a step can light up
// two neighbouring buttons together (Competitive + Arcade).
export function unionRect(rects) {
  const visible = rects.filter((r) => r && r.width > 0 && r.height > 0);
  if (!visible.length) return null;
  const left = Math.min(...visible.map((r) => r.left));
  const top = Math.min(...visible.map((r) => r.top));
  const right = Math.max(...visible.map((r) => r.left + r.width));
  const bottom = Math.max(...visible.map((r) => r.top + r.height));
  return { left, top, width: right - left, height: bottom - top };
}

export function padRect(rect, padding = TOUR_SPOT_PADDING) {
  return rect && {
    left: rect.left - padding, top: rect.top - padding,
    width: rect.width + padding * 2, height: rect.height + padding * 2,
  };
}

// Where the speech bubble goes: below the spot, else above, else beside it,
// always kept inside the viewport. No target means the middle of the screen.
export function placeBubble(target, bubble, viewport) {
  const maxLeft = Math.max(TOUR_MARGIN, viewport.width - bubble.width - TOUR_MARGIN);
  const maxTop = Math.max(TOUR_MARGIN, viewport.height - bubble.height - TOUR_MARGIN);
  if (!target) {
    return {
      side: 'center',
      left: clamp((viewport.width - bubble.width) / 2, TOUR_MARGIN, maxLeft),
      top: clamp((viewport.height - bubble.height) / 2, TOUR_MARGIN, maxTop),
    };
  }
  const centredLeft = clamp(target.left + target.width / 2 - bubble.width / 2, TOUR_MARGIN, maxLeft);
  const below = target.top + target.height + TOUR_GAP;
  if (below + bubble.height <= viewport.height - TOUR_MARGIN) return { side: 'bottom', left: centredLeft, top: below };
  const above = target.top - TOUR_GAP - bubble.height;
  if (above >= TOUR_MARGIN) return { side: 'top', left: centredLeft, top: above };
  const middleTop = clamp(target.top + target.height / 2 - bubble.height / 2, TOUR_MARGIN, maxTop);
  const right = target.left + target.width + TOUR_GAP;
  if (right + bubble.width <= viewport.width - TOUR_MARGIN) return { side: 'right', left: right, top: middleTop };
  const left = target.left - TOUR_GAP - bubble.width;
  if (left >= TOUR_MARGIN) return { side: 'left', left, top: middleTop };
  // Nothing fits beside a target this large: lay the bubble over its lower edge.
  return { side: 'over', left: centredLeft, top: maxTop };
}

const targetsOf = (step) => (Array.isArray(step.target) ? step.target : step.target ? [step.target] : []);

// A step whose element is not on screen (a label hidden on a phone, a button
// this account does not get) is skipped rather than lighting up nothing.
// `measure(selector)` returns the element's rect, or null if there is none.
export function visibleSteps(steps, measure) {
  return steps.filter((step) => {
    const selectors = targetsOf(step);
    return !selectors.length || Boolean(unionRect(selectors.map(measure)));
  });
}

export function stepRect(step, measure) {
  return unionRect(targetsOf(step).map(measure));
}
