/* ═══════════════════════════════════════════════
   section 5 — Best Sellers.
   Five arch-topped cards descending a staircase
   (labels above each arch, bottoms aligned), the
   established reveal grammar, shared spotlight,
   and a minimal counter pagination.
   ═══════════════════════════════════════════════ */

import { createSpotlight } from './spotlight.js';
import { registerReveal } from './scroll.js';

/* step = label-block top (vh); archH = arch height (vh); w = flex ratio */
export const BESTSELLERS = [
  { key: 'yellow', n: '01', step: 5.4,  archH: 76.2, w: 295, img: 'assets/img/best/yellow.jpg', alt: 'Sunny yellow hoodie hanging in warm light' },
  { key: 'purple', n: '02', step: 17.7, archH: 63.9, w: 241, img: 'assets/img/best/purple.jpg', alt: 'Plum purple crewneck hanging in warm light' },
  { key: 'pink',   n: '03', step: 24.4, archH: 57.2, w: 225, img: 'assets/img/best/pink.jpg',   alt: 'Rose pink co-ord set hanging in warm light' },
  { key: 'green',  n: '04', step: 29.2, archH: 52.4, w: 229, img: 'assets/img/best/green.jpg',  alt: 'Olive green jacket hanging in warm light' },
  { key: 'black',  n: '05', step: 34.1, archH: 47.5, w: 207, img: 'assets/img/best/black.jpg',  alt: 'Black bomber jacket hanging in moody light' },
];

const PLUS = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`;

let rail, cards = [], spotlight, current = 0;

export function renderSection5() {
  rail = document.getElementById('bestRail');
  rail.innerHTML = BESTSELLERS.map((c) => `
    <li class="bs-item" data-key="${c.key}" tabindex="0" role="link"
        data-href="best-sellers.html"
        style="--step:${c.step}vh; --arch-h:${c.archH}vh; flex-grow:${c.w}">
      <div class="bs-label">
        <span class="bs-num">${c.n}</span>
        <h3 class="bs-color" data-i18n="col.${c.key}"></h3>
        <p class="bs-desc" data-i18n="bs.${c.key}.desc"></p>
      </div>
      <div class="bs-arch">
        <img src="${c.img}" alt="${c.alt}" draggable="false">
        <span class="bs-scrim" aria-hidden="true"></span>
        <a class="bs-shop" href="best-sellers.html">
          <span class="bs-plus" aria-hidden="true">${PLUS}</span>
          <span data-i18n="na.shop"></span>
        </a>
      </div>
    </li>`).join('');
  cards = Array.from(rail.querySelectorAll('.bs-item'));
  spotlight = createSpotlight(rail, cards, ({ hot, active }) => {
    const i = active !== null ? active : (hot !== null ? hot : current);
    setCounter(i);
  });
}

/* ---------- pagination ---------- */

function setCounter(i) {
  current = (i + BESTSELLERS.length) % BESTSELLERS.length;
  document.getElementById('bsCurrent').textContent =
    String(current + 1).padStart(2, '0');
}

function scrollable() {
  return rail.scrollWidth > rail.clientWidth + 8;
}

function go(dir) {
  if (scrollable()) {
    const step = cards[0].getBoundingClientRect().width + 14;
    rail.scrollBy({ left: dir * step, behavior: 'smooth' });
  } else {
    spotlight.setActive((current + dir + BESTSELLERS.length) % BESTSELLERS.length);
  }
}

function watchRailScroll() {
  let raf = 0;
  rail.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (spotlight.active !== null) return;
      const step = cards[0].getBoundingClientRect().width + 14;
      setCounter(Math.round(rail.scrollLeft / step));
    });
  }, { passive: true });
}

/* ---------- reveal ---------- */

function setInitial() {
  gsap.set(['.bs-shadow', '.bs-bowls'], { autoAlpha: 0 });
  gsap.set(['.bs-intro > *', '.bs-side'], { autoAlpha: 0, y: 24 });
  gsap.set('.bs-item', { y: 26 });
  gsap.set('.bs-arch', { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set('.bs-arch img', { yPercent: 7, scale: 1.045 });
  gsap.set('.bs-label', { autoAlpha: 0, y: 12 });
  gsap.set(['.bs-shop'], { autoAlpha: 0 });
  gsap.set('.bs-nav', { autoAlpha: 0 });
}

function startLiving() {
  gsap.to('.bs-shadow', {
    x: 8, duration: 12, ease: 'sine.inOut', yoyo: true, repeat: -1,
  });
  gsap.to('.bs-bowls', {
    y: 4, rotation: 0.35, transformOrigin: '30% 100%',
    duration: 9.5, ease: 'sine.inOut', yoyo: true, repeat: -1,
  });
}

function buildReveal() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#bestSellers',
      start: 'top 72%',
      once: true,
    },
    onComplete: () => {
      /* hand animated props to the CSS spotlight — but NEVER wipe the
         items' inline style: it carries --step/--arch-h/flex-grow,
         and clearProps:'all' erasing them collapsed the arches */
      gsap.set(['.bs-arch', '.bs-arch img', '.bs-label', '.bs-shop'],
        { clearProps: 'all' });
      gsap.set('.bs-item',
        { clearProps: 'transform,translate,rotate,scale,opacity,visibility' });
      spotlight.arm();
      startLiving();
    },
  });

  tl.to(['.bs-shadow', '.bs-bowls'], {
      autoAlpha: 1, duration: 1.1, ease: 'power2.out', stagger: 0.12,
    }, 0)

    .to(['.bs-intro > *', '.bs-side'], {
      autoAlpha: 1, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.07,
    }, 0.15)

    /* each card rises into its own stepped position */
    .to('.bs-item', {
      y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.13,
    }, 0.5)
    .to('.bs-arch', {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.05, ease: 'power2.out', stagger: 0.13,
    }, 0.5)
    .to('.bs-arch img', {
      yPercent: 0, scale: 1,
      duration: 1.3, ease: 'power3.out', stagger: 0.13,
    }, 0.5)
    .to('.bs-label', {
      autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.13,
    }, 0.85)
    .to('.bs-shop', {
      autoAlpha: 1, duration: 0.7, ease: 'power2.out', stagger: 0.13,
    }, 1.1)

    .to('.bs-nav', { autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, 2.0);

  registerReveal('#bestSellers', tl);
}

export function initSection5(reducedMotion) {
  document.getElementById('bsPrev').addEventListener('click', () => go(-1));
  document.getElementById('bsNext').addEventListener('click', () => go(1));
  watchRailScroll();
  setCounter(0);

  if (reducedMotion) {
    spotlight.arm();
    return;
  }
  setInitial();
  buildReveal();
}
