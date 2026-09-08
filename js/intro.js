/* ═══════════════════════════════════════════════
   intro — the opening choreography (autoplay).
   One continuous movement:
   cream → logo materializes → florals → the circle
   expands on its own → silk sweeps the screen →
   the hero forms behind it → the silk falls away,
   revealing header, headline, and copy in the
   wake of the hem → the same logo rolls into the
   header.
   ═══════════════════════════════════════════════ */

import { createFabric } from './fabric.js';
import { unlockScroll } from './scroll.js';

const logo = document.getElementById('logo');
const intro = document.getElementById('intro');
const hero = document.getElementById('hero');
const heroImg = document.getElementById('heroImg');
const rings = document.getElementById('rings');
const canvas = document.getElementById('fabric');
const logoSlot = document.getElementById('logoSlot');
const florals = Array.from(document.querySelectorAll('.floral'));
const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
const swashLines = Array.from(document.querySelectorAll('.swash-line'));

const LOGO_CY = 0.46;              /* intro logo center, fraction of viewport height */
const BASE_D = 270;                /* floral sizes were tuned against this */
const HOLD = 0.55;                 /* breath between arrival and the reveal */

let fab = null;
let fabricOn = false;
let state = 'boot';                /* boot → arriving → transition → done */
let D = 0;
let LC = { x: 0, y: 0 };
const idleTweens = [];
let arrivalTl = null;
let revealTl = null;

/* ---------- helpers ---------- */

function center() {
  return { x: window.innerWidth / 2, y: window.innerHeight * LOGO_CY };
}

function logoTarget() {
  const r = logoSlot.getBoundingClientRect();
  /* the header may still carry its pre-entrance offset; the logo must land
     where the slot RESTS, not where it currently sits */
  const hy = parseFloat(gsap.getProperty('#siteHeader', 'y')) || 0;
  return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 - hy, d: r.width };
}

function layoutIntro() {
  D = logo.offsetWidth;
  LC = center();

  gsap.set(logo, { x: LC.x - D / 2, y: LC.y - D / 2 });

  rings.style.left = LC.x + 'px';
  rings.style.top = LC.y + 'px';
  rings.style.width = rings.style.height = D * 3.4 + 'px';
  rings.style.transform = 'translate(-50%, -50%)';

  for (const f of florals) {
    const a = (parseFloat(f.dataset.a) * Math.PI) / 180;
    const r = parseFloat(f.dataset.r) * (D / 2);
    const s = parseFloat(f.dataset.s) * (D / BASE_D);
    f.style.width = s + 'px';
    gsap.set(f, {
      x: LC.x + Math.cos(a) * r - s / 2,
      y: LC.y - Math.sin(a) * r - s / 2,
    });
  }
}

/* ---------- arrival (auto) ---------- */

function arrive() {
  state = 'arriving';
  const tl = gsap.timeline();

  tl.set(logo, { autoAlpha: 0, scale: 1.12, filter: 'blur(10px)', rotation: 0.001 })
    .to(logo, {
      autoAlpha: 1, scale: 1, filter: 'blur(0px)',
      duration: 1.25, ease: 'expo.out',
    }, 0.3)

    /* a fine terracotta line draws the circle around the logo */
    .to('.ring-draw', { opacity: 0.9, duration: 0.25 }, 0.45)
    .to('.ring-draw', { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, 0.45)
    .to('.ring-draw', { opacity: 0, duration: 0.8, ease: 'power2.out' }, 1.9)
    .to('.ring-rest-1', { opacity: 0.55, duration: 1.0, ease: 'sine.out' }, 1.75)
    .to('.ring-rest-2', { opacity: 0.4, duration: 1.0, ease: 'sine.out' }, 1.9)

    /* florals settle in around the mark */
    .fromTo(florals,
      { autoAlpha: 0, scale: 0.55, rotation: () => gsap.utils.random(-22, 22) },
      {
        autoAlpha: 0.95, scale: 1, rotation: () => gsap.utils.random(-6, 6),
        duration: 1.05, ease: 'back.out(1.4)',
        stagger: { each: 0.08, from: 'random' },
      }, 0.85)

    .add(startBreath, 1.95);

  return tl;
}

function startBreath() {
  if (state !== 'arriving') return;
  idleTweens.push(gsap.to(logo, {
    scale: 1.014, duration: 3.6, ease: 'sine.inOut', yoyo: true, repeat: -1,
  }));
  for (const f of florals) {
    idleTweens.push(gsap.to(f, {
      x: `+=${gsap.utils.random(-12, 12)}`,
      y: `+=${gsap.utils.random(-14, 9)}`,
      rotation: `+=${gsap.utils.random(-9, 9)}`,
      duration: gsap.utils.random(4.5, 8),
      ease: 'sine.inOut', yoyo: true, repeat: -1,
    }));
  }
}

/* ---------- reveal: silk → hero → logo lands ---------- */

function reveal() {
  if (state !== 'arriving') return;
  state = 'transition';

  idleTweens.forEach((t) => t.kill());

  const target = logoTarget();
  heroImg.style.transformOrigin = `${target.cx}px ${target.cy}px`;
  const landScale = target.d / D;

  const tl = gsap.timeline();
  revealTl = tl;

  /* the circle expands — graceful ripples from the rim */
  tl.fromTo('.ripple', { scale: 1, opacity: 0 },
      { opacity: 0.5, duration: 0.2, stagger: 0.16, ease: 'sine.out' }, 0.05)
    .to('.ripple',
      { scale: 3.4, opacity: 0, duration: 1.5, stagger: 0.16, ease: 'power2.out' }, 0.2)
    .to('.ring-rest-1, .ring-rest-2',
      { scale: 1.6, opacity: 0, duration: 1.0, ease: 'power2.out' }, 0.1);

  /* florals drift outward and dissolve */
  florals.forEach((f, i) => {
    const a = (parseFloat(f.dataset.a) * Math.PI) / 180;
    const r = parseFloat(f.dataset.r) * (D / 2) * 1.75;
    const s = parseFloat(f.style.width);
    tl.to(f, {
      x: LC.x + Math.cos(a) * r - s / 2,
      y: LC.y - Math.sin(a) * r - s / 2,
      rotation: `+=${gsap.utils.random(-24, 24)}`,
      autoAlpha: 0,
      duration: 1.0, ease: 'power2.in',
    }, 0.08 + i * 0.045);
  });

  /* silk sweeps in from the top right, swinging level as it settles */
  tl.add(() => { fabricOn = true; gsap.set(canvas, { autoAlpha: 1 }); }, 0.3)
    .to(fab.state, { ty: 1.45, duration: 1.6, ease: 'power2.inOut' }, 0.32)
    .to(fab.state, { tx: 0, duration: 1.6, ease: 'power1.inOut' }, 0.32)
    .to(fab.state, { rot: 0.03, duration: 1.6, ease: 'power1.inOut' }, 0.32)
    .to(fab.state, { amp: 0.1, duration: 0.75, ease: 'power1.in' }, 0.32)
    .to(fab.state, { amp: 0.04, duration: 1.0, ease: 'sine.out' }, 1.15)

    /* hero forms behind the silk while the screen is covered */
    .set(hero, { autoAlpha: 1 }, 1.6)
    .to(intro, { autoAlpha: 0, duration: 0.35 }, 1.7)

    /* the same logo rolls toward its header position */
    .to(logo, { scale: landScale, duration: 1.65, ease: 'power3.inOut' }, 0.55)
    .to(logo, { x: target.cx - D / 2, duration: 1.65, ease: 'power2.inOut' }, 0.55)
    .to(logo, { y: target.cy - D / 2, duration: 1.65, ease: 'power3.inOut' }, 0.55)
    .to(logo, { rotation: -360, duration: 1.65, ease: 'power2.inOut' }, 0.55)
    .add(() => logo.classList.add('is-landed'), 2.2)
    .to(logo, { scale: landScale * 0.96, duration: 0.16, ease: 'power2.out' }, 2.2)
    .to(logo, { scale: landScale, duration: 0.55, ease: 'back.out(2.4)' }, 2.36)

    /* the silk keeps falling — its far hem reveals the hero */
    .to(fab.state, { ty: -4.3, duration: 1.75, ease: 'power3.inOut' }, 1.9)
    .to(fab.state, { tx: -0.45, rot: 0.08, duration: 1.75, ease: 'power2.inOut' }, 1.9)
    .to(fab.state, { amp: 0.055, duration: 0.9, ease: 'sine.inOut' }, 1.95)

    /* cinematic settle of the revealed scene */
    .fromTo(heroImg, { scale: 1.055 }, { scale: 1, duration: 2.5, ease: 'expo.out' }, 1.95)

    .add(finish, 3.9);

  buildTextReveal(tl, 2.0);
}

/* live elements surface in the wake of the falling hem: header first,
   copy next, floor elements last */
function buildTextReveal(tl, t0) {
  const rise = (targets, at, opts = {}) => {
    tl.fromTo(targets,
      { autoAlpha: 0, y: opts.y ?? 26, clipPath: 'inset(0% 0% 100% 0%)' },
      {
        autoAlpha: 1, y: 0, clipPath: 'inset(0% 0% -12% 0%)',
        duration: opts.dur ?? 0.9, ease: opts.ease ?? 'power3.out',
        stagger: opts.stagger ?? 0,
        clearProps: 'clipPath',
      }, at);
  };

  rise('.eyebrow', t0 + 0.3, { y: 18 });
  rise('.display', t0 + 0.4, { y: 44, dur: 1.15, ease: 'expo.out' });

  /* the header softly emerges once the scene is alive — minimal motion */
  tl.to('#siteHeader', {
      autoAlpha: 1, y: 0, duration: 1.05, ease: 'power2.out',
    }, t0 + 0.72)
    .fromTo('#mainNav .nav-link',
      { autoAlpha: 0, y: -9 },
      { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.045, clearProps: 'opacity,visibility,transform' },
      t0 + 0.78)
    .fromTo('.header-utils > *',
      { autoAlpha: 0, y: -7 },
      { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power2.out', stagger: 0.055, clearProps: 'opacity,visibility,transform' },
      t0 + 0.92)
    .fromTo('.header-rule',
      { scaleX: 0 },
      { scaleX: 1, duration: 1.25, ease: 'power2.inOut' },
      t0 + 0.85);

  /* the swash draws itself after the word settles */
  tl.set(swashLines, { strokeDasharray: 640, strokeDashoffset: 640, opacity: 1 }, 0)
    .to(swashLines, {
      strokeDashoffset: 0, duration: 1.05, ease: 'power2.inOut', stagger: 0.18,
    }, t0 + 0.95);

  rise('.subline', t0 + 0.58, { y: 20 });
  rise('.cta', t0 + 0.72, { y: 22 });

  /* the signature statement assembles on its grid */
  tl.set('.signature', { autoAlpha: 1 }, t0 + 0.88)
    .fromTo('.signature-overline',
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, t0 + 0.88)
    .fromTo('.signature-rule',
      { scaleX: 0 },
      { scaleX: 1, duration: 1.0, ease: 'power2.inOut' }, t0 + 0.95)
    .fromTo('.signature-grid li',
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.09 }, t0 + 1.0);

  rise('.hero-side', t0 + 1.08, { y: 18 });

  tl.fromTo('.hero-script',
    { autoAlpha: 0, rotation: -2, y: 12 },
    { autoAlpha: 1, rotation: 0, y: 0, duration: 1.0, ease: 'power2.out' }, t0 + 1.15);

  rise('.hero-scroll', t0 + 1.28, { y: 14 });

  /* gentle perpetual cue on the scroll arrow */
  tl.add(() => {
    gsap.fromTo('.scroll-arrow',
      { y: -2, opacity: 0.5 },
      { y: 3, opacity: 1, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }, t0 + 1.6);
}

/* the traveled logo becomes part of the header, so it scrolls with the hero */
function dockLogo() {
  const header = document.getElementById('siteHeader');
  gsap.set(logo, { clearProps: 'all' });
  logo.classList.add('is-landed', 'in-header');
  if (logo.parentElement !== header) header.appendChild(logo);
}

function finish() {
  fabricOn = false;
  gsap.set(canvas, { autoAlpha: 0 });
  intro.style.display = 'none';
  dockLogo();
  unlockScroll();
  state = 'done';
}

/* ---------- reduced motion ---------- */

function skipToHero() {
  state = 'done';
  fabricOn = false;
  gsap.set(canvas, { autoAlpha: 0 });
  gsap.set(hero, { autoAlpha: 1 });
  gsap.set(intro, { autoAlpha: 0, display: 'none' });
  gsap.set('#heroImg', { scale: 1 });
  dockLogo();
  gsap.set(revealEls, { autoAlpha: 1, y: 0, clipPath: 'none' });
  gsap.set('#siteHeader', { autoAlpha: 1, y: 0 });
  gsap.set(swashLines, { strokeDashoffset: 0, opacity: 1 });
  unlockScroll();
}

/* failsafe: if frozen animation frames ever strand the intro,
   a real-time timer completes it so the site is never blocked */
function armIntroWatchdog() {
  setTimeout(() => {
    if (state === 'done') return;
    if (arrivalTl) arrivalTl.kill();
    if (revealTl) revealTl.kill();
    idleTweens.forEach((t) => t.kill());
    gsap.killTweensOf([logo, '.floral', '#rings circle', fab && fab.state].filter(Boolean));
    skipToHero();
  }, 15000);
}

/* ---------- boot ---------- */

export function getFabric() { return fab; }
export function isIntroDone() { return state === 'done'; }

export function startIntro(skip = false) {
  fab = createFabric(canvas, 'assets/img/fabric-tex.png');

  /* silk resting state: hanging above the top-right, out of frame,
     right corner dipping lowest so it leads the sweep */
  Object.assign(fab.state, { tx: 0.9, ty: 4.35, rot: -0.26, amp: 0.05 });

  /* dev handle (harmless in production) */
  window.__fab = fab;
  window.__fabShow = () => { fabricOn = true; gsap.set(canvas, { autoAlpha: 1 }); };
  window.__introState = () => state;

  gsap.ticker.add(() => {
    if (!fab) return;
    fab.state.time += gsap.ticker.deltaRatio(60) / 60;
    if (fabricOn) fab.render();
  });

  /* live elements stay hidden until the silk uncovers them */
  gsap.set(revealEls, { autoAlpha: 0 });
  gsap.set('#siteHeader', { autoAlpha: 0, y: -14 });
  gsap.set(swashLines, { strokeDashoffset: 640, strokeDasharray: 640 });

  layoutIntro();

  /* the cinematic belongs to the initial entry (and full refresh) only —
     internal navigation and Back arrive on the settled hero directly */
  if (skip
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || new URLSearchParams(location.search).has('static')) {
    skipToHero();
    return;
  }

  const arrival = arrive();
  arrivalTl = arrival;
  armIntroWatchdog();

  /* autoplay: continue once arrival has landed AND the heavy assets
     are truly ready (never later than the timeout — no hangs) */
  const heroReady = heroImg.decode ? heroImg.decode().catch(() => {}) : Promise.resolve();
  const fontsReady = document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve();
  const fabricReady = fab ? fab.ready : Promise.resolve();
  const timeout = new Promise((res) => setTimeout(res, 4500));

  Promise.race([Promise.all([heroReady, fontsReady, fabricReady]), timeout]).then(() => {
    const wait = Math.max(0, arrival.duration() - arrival.time()) + HOLD;
    gsap.delayedCall(wait, reveal);
  });

  window.addEventListener('resize', onResize);
}

function onResize() {
  if (fab) fab.resize();
  if (state === 'boot' || state === 'arriving') {
    layoutIntro();
  }
  /* once docked, the logo is CSS-positioned inside the header */
}
