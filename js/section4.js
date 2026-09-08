/* ═══════════════════════════════════════════════
   section 4 — Shop by Color.
   Seven capsule colour cards on an organic height
   rhythm, the established scroll reveal, the
   shared spotlight, and a working progress
   pagination.
   ═══════════════════════════════════════════════ */

import { createSpotlight } from './spotlight.js';
import { registerReveal } from './scroll.js';

export const SHADES = [
  { key: 'red',      h: 64.1, img: 'assets/img/shade/red.jpg',      alt: 'Deep red clothing stacked in warm studio light' },
  { key: 'green',    h: 63.2, img: 'assets/img/shade/green.jpg',    alt: 'Forest green clothing stacked in warm studio light' },
  { key: 'yellow',   h: 62.4, img: 'assets/img/shade/yellow.jpg',   alt: 'Sun yellow clothing stacked in warm studio light' },
  { key: 'blue',     h: 60.5, img: 'assets/img/shade/blue.jpg',     alt: 'Indigo blue clothing stacked in warm studio light' },
  { key: 'pink',     h: 60.1, img: 'assets/img/shade/pink.jpg',     alt: 'Rose pink clothing stacked in warm studio light' },
  { key: 'purple',   h: 61.2, img: 'assets/img/shade/purple.jpg',   alt: 'Plum purple clothing stacked in warm studio light' },
  { key: 'neutrals', h: 59.5, img: 'assets/img/shade/neutrals.jpg', alt: 'Cream and tan clothing stacked in warm studio light' },
];

const ARROW = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13m0 0-4.2-4.2M18 12l-4.2 4.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

let rail, cards = [], spotlight, current = 0;

export function renderSection4() {
  rail = document.getElementById('shadeRail');
  rail.innerHTML = SHADES.map((s) => `
    <li class="sc-card" data-key="${s.key}" style="--card-h: ${s.h}vh" tabindex="0" role="link"
        data-href="color.html${s.key === 'neutrals' ? '' : '?colour=' + s.key}">
      <div class="sc-pill">
        <img src="${s.img}" alt="${s.alt}" draggable="false">
        <span class="sc-scrim" aria-hidden="true"></span>
        <div class="sc-text">
          <h3 data-i18n="shade.${s.key}"></h3>
          <p data-i18n="shade.${s.key}.desc"></p>
          <a class="sc-arrow" href="color.html${s.key === 'neutrals' ? '' : '?colour=' + s.key}" data-i18n-aria="shade.${s.key}" aria-label="${s.key}">${ARROW}</a>
        </div>
      </div>
    </li>`).join('');
  cards = Array.from(rail.querySelectorAll('.sc-card'));
  spotlight = createSpotlight(rail, cards, ({ hot, active }) => {
    if (active !== null) setProgress(active);
    else if (hot !== null) setProgress(hot);
  });
}

/* ---------- pagination ---------- */

function setProgress(i) {
  current = (i + SHADES.length) % SHADES.length;
  const fill = document.getElementById('scFill');
  if (fill) fill.style.transform = `translateX(${current * 100}%)`;
}

function scrollable() {
  return rail.scrollWidth > rail.clientWidth + 8;
}

function go(dir) {
  if (scrollable()) {
    const step = cards[0].getBoundingClientRect().width + 8;
    rail.scrollBy({ left: dir * step, behavior: 'smooth' });
  } else {
    spotlight.setActive((current + dir + SHADES.length) % SHADES.length);
  }
}

function watchRailScroll() {
  let raf = 0;
  rail.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (spotlight.active !== null) return;
      const step = cards[0].getBoundingClientRect().width + 8;
      setProgress(Math.round(rail.scrollLeft / step));
    });
  }, { passive: true });
}

/* ---------- reveal ---------- */

function setInitial() {
  gsap.set(['.sc-shadow', '.sc-lotus'], { autoAlpha: 0 });
  gsap.set(['.sc-intro > *', '.sc-side'], { autoAlpha: 0, y: 24 });
  gsap.set('.sc-swash path', { strokeDasharray: 420, strokeDashoffset: 420 });
  gsap.set('.sc-pill', { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set('.sc-pill img', { yPercent: 7, scale: 1.045 });
  gsap.set('.sc-text', { autoAlpha: 0, y: 10 });
  gsap.set('.sc-nav', { autoAlpha: 0 });
}

function startLiving() {
  gsap.to('.sc-lotus', {
    y: 5, rotation: 0.5, transformOrigin: '20% 100%',
    duration: 10, ease: 'sine.inOut', yoyo: true, repeat: -1,
  });
  gsap.to('.sc-shadow', {
    x: 9, duration: 13, ease: 'sine.inOut', yoyo: true, repeat: -1,
  });
}

function buildReveal() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#shopByColor',
      start: 'top 72%',
      once: true,
    },
    onComplete: () => {
      gsap.set(['.sc-pill', '.sc-pill img', '.sc-text'], { clearProps: 'all' });
      spotlight.arm();
      startLiving();
    },
  });

  /* the environment breathes in */
  tl.to(['.sc-shadow', '.sc-lotus'], {
      autoAlpha: 1, duration: 1.1, ease: 'power2.out', stagger: 0.12,
    }, 0)

    /* the editorial block settles as one */
    .to(['.sc-intro > *', '.sc-side'], {
      autoAlpha: 1, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.07,
    }, 0.15)
    .to('.sc-swash path', {
      strokeDashoffset: 0, duration: 1.0, ease: 'power2.inOut',
    }, 0.75)

    /* seven shades rise from the floor, left to right */
    .to('.sc-pill', {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.05, ease: 'power2.out', stagger: 0.12,
    }, 0.5)
    .to('.sc-pill img', {
      yPercent: 0, scale: 1,
      duration: 1.3, ease: 'power3.out', stagger: 0.12,
    }, 0.5)

    /* names and arrows settle into the silk */
    .to('.sc-text', {
      autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.12,
    }, 1.05)

    .to('.sc-nav', { autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, 2.05);

  registerReveal('#shopByColor', tl);
}

export function initSection4(reducedMotion) {
  document.getElementById('scPrev').addEventListener('click', () => go(-1));
  document.getElementById('scNext').addEventListener('click', () => go(1));
  watchRailScroll();
  setProgress(0);

  if (reducedMotion) {
    spotlight.arm();
    return;
  }
  setInitial();
  buildReveal();
}
