/* ═══════════════════════════════════════════════
   Hero fit — the display word owns one line
   ───────────────────────────────────────────────
   The hero display is sized in vh, the copy column in vw, so on wide-but-short
   (or narrow-but-tall) windows the word used to wrap and spill out of its
   reserved box — landing on top of the subline. Here the word is measured
   against the column and scaled down by --display-fit until it fits, so the
   headline always sits on one line with the swash tucked underneath it.
   ═══════════════════════════════════════════════ */

const MIN_FIT = 0.55;    /* never shrink past this — layout, not a magnifier */

let display = null;
let word = null;
let queued = false;

function measure() {
  /* wrapping is allowed on mobile — nothing to fit there */
  if (getComputedStyle(word).whiteSpace !== 'nowrap') {
    display.style.setProperty('--display-fit', '1');
    return;
  }

  const current = parseFloat(display.style.getPropertyValue('--display-fit')) || 1;
  const avail = display.clientWidth;
  const shown = word.getBoundingClientRect().width;
  if (!avail || !shown) return;

  /* type scales linearly, so the untouched width is the shown one un-scaled */
  const natural = shown / current;
  const next = Math.max(MIN_FIT, Math.min(1, (avail - 1) / natural));

  /* only write when it actually moves — keeps the ResizeObserver quiet */
  if (Math.abs(next - current) > 0.002) {
    display.style.setProperty('--display-fit', next.toFixed(4));
  }
}

function fit() {
  if (!display || !word || queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    if (document.body.contains(word)) measure();
  });
}

export function initHeroFit() {
  display = document.querySelector('.hero-copy .display');
  word = display && display.querySelector('.display-word');
  if (!display || !word) return;

  fit();

  /* the real metrics only exist once the serif has landed */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit).catch(() => {});

  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  document.addEventListener('baramasi:lang', fit);   /* हर महीना is a different width */

  /* belt and braces: any layout change to the copy column re-fits */
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(fit);
    ro.observe(display);
  }
}
