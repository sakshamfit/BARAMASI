/* ═══════════════════════════════════════════════
   section 3 — Sarees by Origin.
   Five-collection editorial wall: data-driven
   cards, the established scroll reveal (header →
   cards unfolding left to right → captions →
   statement), a quietly living background, and
   the shared spotlight interaction.
   ═══════════════════════════════════════════════ */

import { createSpotlight } from './spotlight.js';
import { registerReveal } from './scroll.js';

export const ORIGINS = [
  { key: 'hoodies', type: 'hoodies', tone: 'dark',  img: 'assets/img/origin/hoodies.jpg', alt: 'A heavyweight hoodie hanging in warm studio light' },
  { key: 'sweats',  type: 'sweats',  tone: 'light', img: 'assets/img/origin/sweats.jpg',  alt: 'A folded crewneck sweatshirt in warm studio light' },
  { key: 'tees',    type: 'tees',    tone: 'light', img: 'assets/img/origin/tees.jpg',    alt: 'Neatly folded cotton tees in warm studio light' },
  { key: 'shirts',  type: 'shirts',  tone: 'light', img: 'assets/img/origin/shirts.jpg',  alt: 'A crisp cotton shirt on a hanger in warm studio light' },
  { key: 'jackets', type: 'jackets', tone: 'dark',  img: 'assets/img/origin/jackets.jpg', alt: 'A field jacket on a hanger in moody warm light' },
];

const CIRCLE_ARROW = `<span class="or-circle" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12h13m0 0-4.2-4.2M18 12l-4.2 4.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;

let wall, cards = [], spotlight;

export function renderSection3() {
  wall = document.getElementById('originWall');
  wall.innerHTML = ORIGINS.map((o) => `
    <li class="or-card tone-${o.tone}" data-key="${o.key}" tabindex="0" role="link"
        data-href="collections.html?type=${o.type}">
      <figure>
        <div class="or-frame">
          <img src="${o.img}" alt="${o.alt}" draggable="false">
          <span class="or-scrim" aria-hidden="true"></span>
          <div class="or-text">
            <h3 data-i18n="or.${o.key}"></h3>
            <span class="or-rule" aria-hidden="true"></span>
            <p data-i18n="or.${o.key}.desc"></p>
          </div>
          <a class="or-explore" href="collections.html?type=${o.type}">
            <span data-i18n="or.explore"></span>${CIRCLE_ARROW}
          </a>
        </div>
      </figure>
    </li>`).join('');
  cards = Array.from(wall.querySelectorAll('.or-card'));
  spotlight = createSpotlight(wall, cards);
}

/* ---------- reveal ---------- */

function setInitial() {
  gsap.set(['.or-blossoms', '.or-leaves'], { autoAlpha: 0 });
  gsap.set(['.or-head > *', '.or-side'], { autoAlpha: 0, y: 24 });
  gsap.set('.or-frame', { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set('.or-frame img', { yPercent: 7, scale: 1.045 });
  gsap.set(['.or-text', '.or-explore'], { autoAlpha: 0, y: 10 });
  gsap.set('.or-foot', { autoAlpha: 0, y: 18 });
}

function startLiving() {
  gsap.to('.or-blossoms', {
    y: 7, rotation: 0.4, duration: 8.5, ease: 'sine.inOut', yoyo: true, repeat: -1,
  });
  gsap.to('.or-leaves', {
    rotation: 1.8, y: 4, transformOrigin: '80% 0%',
    duration: 9.5, ease: 'sine.inOut', yoyo: true, repeat: -1,
  });
}

function buildReveal() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#origins',
      start: 'top 72%',
      once: true,
    },
    onComplete: () => {
      gsap.set(['.or-frame', '.or-frame img', '.or-text', '.or-explore'], { clearProps: 'all' });
      spotlight.arm();
      startLiving();
    },
  });

  /* phase 1 — the environment breathes in */
  tl.to(['.or-blossoms', '.or-leaves'], {
      autoAlpha: 1, duration: 1.1, ease: 'power2.out', stagger: 0.12,
    }, 0)

    /* phase 2 — the title settles as one group */
    .to(['.or-head > *', '.or-side'], {
      autoAlpha: 1, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.07,
    }, 0.15)

    /* phase 3 — the wall unfolds, left to right */
    .to('.or-frame', {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.05, ease: 'power2.out', stagger: 0.14,
    }, 0.5)
    .to('.or-frame img', {
      yPercent: 0, scale: 1,
      duration: 1.3, ease: 'power3.out', stagger: 0.14,
    }, 0.5)

    /* captions settle into their photographs */
    .to('.or-text', {
      autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.14,
    }, 1.05)
    .to('.or-explore', {
      autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.14,
    }, 1.15)

    .to('.or-foot', { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 2.0);

  registerReveal('#origins', tl);
}

export function initSection3(reducedMotion) {
  if (reducedMotion) {
    spotlight.arm();
    return;
  }
  setInitial();
  buildReveal();
}
