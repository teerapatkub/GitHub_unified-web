// Paste this into the browser console on any Arcade screen, then call __clip().
//
// It finds elements that are HIDING their own content: overflow is hidden and
// the content is bigger than the box, so text exists on the page that nobody can
// read and no amount of scrolling will reach.
//
// This is not a theoretical check. On 2026-08-19 it located seven real instances
// in one pass, including the two the user had photographed:
//   * the lobby stats card losing 106px and the past-matches card losing 178px
//     (both were flex items in a scrolling column, so instead of the column
//     scrolling, each card was squeezed below its own content height),
//   * the shop header card losing 167px the same way,
//   * the coding column cutting 173px off the editor,
//   * the mobile top bar running 107px off-screen with the back button
//     unreachable, and the problem card cutting off the timer and coin count.
//
// The two failure shapes to know:
//   A. a flex item shrinks below its content (flex-shrink defaults to 1) while
//      also setting overflow-hidden — it clips itself instead of scrolling.
//   B. `justify-center` inside `overflow-y-auto` — centring distributes leftover
//      space, and with none left it pushes content past the container's start
//      edge, the one direction a scroll container cannot reach.
//
// Verify the checker before trusting a clean result: re-add the old classes to a
// container in the live DOM and confirm __clip() reports it. A checker that
// reports nothing because it is broken looks identical to a page with no bugs.

window.__clip = () => {
  const found = [];
  document.querySelectorAll('*').forEach((el) => {
    const cls = el.className.toString();
    // Monaco virtualises its own scrolling and always reports an enormous
    // scrollHeight on these internals — not our layout.
    if (/monaco|view-rulers|overflow-guard|view-lines|slider|decorations/.test(cls)) return;
    const cs = getComputedStyle(el);
    const hiddenY = cs.overflowY === 'hidden' || cs.overflow === 'hidden';
    const hiddenX = cs.overflowX === 'hidden' || cs.overflow === 'hidden';
    // 2px of tolerance for sub-pixel rounding.
    if (hiddenY && el.scrollHeight - el.clientHeight > 2) {
      found.push({ axis: 'Y', lost: el.scrollHeight - el.clientHeight, cls: cls.slice(0, 60),
        text: (el.innerText || '').trim().slice(0, 40) });
    } else if (hiddenX && el.scrollWidth - el.clientWidth > 2) {
      found.push({ axis: 'X', lost: el.scrollWidth - el.clientWidth, cls: cls.slice(0, 60),
        text: (el.innerText || '').trim().slice(0, 40) });
    }
  });
  return found;
};

// Content running off the right edge of the window. Absolutely-positioned
// elements are skipped: the decorative background blobs are placed outside the
// viewport on purpose.
window.__over = () => {
  const found = [];
  document.querySelectorAll('*').forEach((el) => {
    const cls = el.className.toString();
    if (/monaco|view-rulers|overflow-guard|view-lines|slider|decorations/.test(cls)) return;
    const cs = getComputedStyle(el);
    if (cs.position === 'absolute' || cs.position === 'fixed') return;
    const r = el.getBoundingClientRect();
    if (r.right > innerWidth + 2 && r.width > 20) {
      found.push({ tag: el.tagName, right: Math.round(r.right), cls: cls.slice(0, 50),
        text: (el.innerText || '').trim().slice(0, 25) });
    }
  });
  return found;
};

// A match phase can be as short as 5 seconds (the round summary), which is too
// brief to catch by hand. Arm this before starting a match, then read
// window.__clipLog afterwards.
window.__armClipRecorder = () => {
  window.__clipLog = {};
  window.__clipRecorder = setInterval(() => {
    const text = document.body.innerText;
    const phase = (text.match(/ROUND PHASE: ([^\n]*)/) || [])[1]
      || (/จบการแข่งขัน|CHAMPION/.test(text) ? 'RESULT' : 'LOBBY');
    const bad = [...window.__clip(), ...window.__over()];
    const prev = window.__clipLog[phase];
    if (!prev || bad.length > prev.count) {
      window.__clipLog[phase] = { count: bad.length, items: bad, viewport: [innerWidth, innerHeight] };
    }
  }, 700);
  return 'recording — read window.__clipLog, stop with clearInterval(window.__clipRecorder)';
};

console.log('loaded: __clip(), __over(), __armClipRecorder()');
