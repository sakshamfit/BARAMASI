/* ═══════════════════════════════════════════════
   scroll — Lenis smooth scrolling wired into
   ScrollTrigger. Locked during the intro, released
   when the hero settles.
   ═══════════════════════════════════════════════ */

export let lenis = null;

export function initSmoothScroll(reducedMotion, lock = true) {
  gsap.registerPlugin(ScrollTrigger);

  /* the opening choreography always begins at the top */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  if (!reducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      autoRaf: false,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    if (lock) lenis.stop();
    window.__lenis = lenis;   /* dev handle */
  }

  if (lock) document.body.classList.add('is-locked');
}

/* ── reveal watchdog ──
   Scroll reveals normally play via rAF. Some environments freeze rAF
   (occluded windows, throttled tabs) which would strand sections
   invisible. Timers keep running, so a watchdog force-completes any
   reveal that should have played but is stuck at zero. */

const pending = [];

export function registerReveal(el, tl) {
  pending.push({
    el: typeof el === 'string' ? document.querySelector(el) : el,
    tl,
    strikes: 0,
  });
}

export function armRevealWatchdog() {
  setInterval(() => {
    for (let i = pending.length - 1; i >= 0; i--) {
      const p = pending[i];
      if (!p.tl || p.tl.progress() > 0) {
        pending.splice(i, 1);
        continue;
      }
      const inView = !p.el ||
        p.el.getBoundingClientRect().top < window.innerHeight * 0.78;
      if (inView && ++p.strikes >= 2) {
        p.tl.progress(1, false);   /* render final state + fire onComplete */
        pending.splice(i, 1);
      }
    }
  }, 900);
}

export function unlockScroll() {
  document.body.classList.remove('is-locked');
  window.scrollTo(0, 0);   /* the story always begins at the hero */
  if (lenis) {
    lenis.scrollTo(0, { immediate: true, force: true });
    lenis.start();
  }
  ScrollTrigger.refresh();
}
