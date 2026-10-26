// Readability and touch-target audit for the page that is open in a browser.
//
// Paste into the devtools console (or run through a browser tool) on any page.
// It returns one object; the numbers that must be 0 for Spec 0005 Track H are
// tinyText (text under 12px), lowContrastCount (text under 4.5:1, or 3:1 when
// large) and smallCount (controls under 32x32px).
//
// Set window.AUDIT_SCOPE = 'main' first to audit only the page content and not
// the shared header; leave it unset to audit everything under <body>.
//
// It measures what the browser actually painted, so run it at the size you care
// about (375px wide for phones) and after the page has finished loading. Text
// over a background image is skipped because its contrast cannot be computed.
(() => {
  const scope = document.querySelector(window.AUDIT_SCOPE || 'body') || document.body;
  const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const name = (e) => (e.getAttribute('aria-label') || e.getAttribute('title') || e.innerText || e.value || e.getAttribute('alt') || e.querySelector('img')?.alt || '').trim();
  const lum = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r, g, b] = m.slice(0, 3).map(Number).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  // The colour behind e: translucent layers (a dark overlay at 60%, say) are
  // blended down onto the first opaque ancestor, white if there is none.
  const bgOf = (e) => {
    const layers = [];
    for (let n = e; n; n = n.parentElement) {
      if (getComputedStyle(n).backgroundImage !== 'none' && !layers.length) return null;
      const a = getComputedStyle(n).backgroundColor.match(/[\d.]+/g);
      if (!a) continue;
      const alpha = a.length < 4 ? 1 : Number(a[3]);
      if (alpha === 0) continue;
      layers.push([...a.slice(0, 3).map(Number), alpha]);
      if (alpha >= 0.99) break;
    }
    let rgb = [255, 255, 255];
    for (const [r, g, b, alpha] of layers.reverse()) rgb = [r, g, b].map((v, i) => v * alpha + rgb[i] * (1 - alpha));
    return `rgb(${rgb.map(Math.round).join(',')})`;
  };
  const hasText = (e) => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  const inEditor = (e) => e.closest('.monaco-editor');
  const out = { path: location.pathname, width: innerWidth, scope: window.AUDIT_SCOPE || 'body' };
  out.hScroll = document.documentElement.scrollWidth - innerWidth;

  const ctrls = [...scope.querySelectorAll('a[href], button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])')].filter(vis).filter(e => !inEditor(e));
  const small = ctrls.filter(e => { const r = e.getBoundingClientRect(); return (r.width < 32 || r.height < 32) && e.tagName !== 'INPUT' && !e.closest('p'); });
  out.controls = ctrls.length;
  out.smallCount = small.length;
  out.smallTargets = small.map(e => `${name(e).slice(0, 18) || e.tagName}(${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)})`).slice(0, 12);
  out.unnamed = ctrls.filter(e => !name(e) && !(e.id && document.querySelector(`label[for="${e.id}"]`))).map(e => e.outerHTML.slice(0, 90)).slice(0, 6);

  const lows = [];
  for (const e of [...scope.querySelectorAll('p,span,a,button,h1,h2,h3,h4,li,label,div,pre,code,td,th,strong')].filter(vis)) {
    if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1)) continue;
    if (inEditor(e)) continue;
    const s = getComputedStyle(e); const bg = bgOf(e); if (!bg) continue;
    if (Number(s.opacity) < 1) continue;
    const a = lum(s.color), b = lum(bg); if (a == null || b == null) continue;
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const big = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.6 && Number(s.fontWeight) >= 700);
    if (ratio < (big ? 3 : 4.5)) lows.push(`${ratio.toFixed(1)}:${e.innerText.trim().slice(0, 22)}`);
  }
  out.lowContrastCount = lows.length;
  out.lowContrast = [...new Set(lows)].slice(0, 10);

  const texts = [...scope.querySelectorAll('*')].filter(vis).filter(hasText).filter(e => !inEditor(e));
  out.minFont = Math.min(...texts.map(e => parseFloat(getComputedStyle(e).fontSize)));
  const tiny = texts.filter(e => parseFloat(getComputedStyle(e).fontSize) < 12);
  out.tinyText = tiny.length;
  out.tinySamples = tiny.map(e => `${getComputedStyle(e).fontSize}:${e.innerText.trim().slice(0, 18)}`).slice(0, 8);
  return out;
})()
