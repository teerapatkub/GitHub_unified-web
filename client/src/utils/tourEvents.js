// Ask whichever tour belongs to the page on screen to open (TourHost.jsx).
// Page tours answer the first event; the menu-bar tour only the fallback.
export function requestTour() {
  const ask = new CustomEvent('pyarena:tour-request', { detail: { handled: false } });
  window.dispatchEvent(ask);
  if (!ask.detail.handled) window.dispatchEvent(new CustomEvent('pyarena:tour-request-fallback'));
}
