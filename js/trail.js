/* ═══════════════════════════════════════════════
   trail — the visitor's in-site journey, kept in
   sessionStorage so the Back button knows whether
   real history leads to another BARAMASI page or
   whether it should step up the hierarchy instead
   (deep links, fresh tabs).
   ═══════════════════════════════════════════════ */

const KEY = 'baramasi-trail';

const here = () => location.pathname.replace(/^\//, '') + location.search;

function read() {
  try { return JSON.parse(sessionStorage.getItem(KEY)) || []; } catch { return []; }
}

function write(t) {
  try { sessionStorage.setItem(KEY, JSON.stringify(t.slice(-40))); } catch { /* private mode */ }
}

/* call once per page load — reconciles the trail with how we arrived */
export function trackPage() {
  const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  const type = nav ? nav.type : 'navigate';
  let t = read();
  const cur = here();
  if (type === 'back_forward') {
    const i = t.lastIndexOf(cur);
    if (i >= 0) t = t.slice(0, i + 1);     /* we walked back along the journey */
    else t.push(cur);
  } else if (t[t.length - 1] !== cur) {
    t.push(cur);
  }
  write(t);
}

/* a pushState filter step is part of the journey too */
export function trailPush() {
  const t = read();
  const cur = here();
  if (t[t.length - 1] !== cur) { t.push(cur); write(t); }
}

/* popstate: the URL moved back within the page */
export function trailSyncFromUrl() {
  const t = read();
  const i = t.lastIndexOf(here());
  if (i >= 0) write(t.slice(0, i + 1));
}

/* is there a real in-site page behind this one? */
export function trailPrevious() {
  const t = read();
  return t.length >= 2 ? t[t.length - 2] : null;
}

/* leaving via a hierarchy fallback replaces this entry */
export function trailPopForFallback() {
  const t = read();
  t.pop();
  write(t);
}
