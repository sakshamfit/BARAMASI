/* ═══════════════════════════════════════════════
   section 2 — New Arrivals / colour collection.
   Data-driven cards, scroll-triggered editorial
   reveal (text → images rise one by one → captions
   settle), and minimal pagination.
   ═══════════════════════════════════════════════ */

import { registerReveal } from './scroll.js';

export const COLLECTIONS = [
  { key: 'pink',   img: 'assets/img/shade/pink.jpg',   alt: 'Rose-pink clothing neatly folded on a warm cream shelf' },
  { key: 'orange', img: 'assets/img/shade/orange.jpg', alt: 'Rust-orange clothing neatly folded on a warm cream shelf' },
  { key: 'purple', img: 'assets/img/shade/purple.jpg', alt: 'Plum-purple clothing neatly folded on a warm cream shelf' },
  { key: 'yellow', img: 'assets/img/shade/yellow.jpg', alt: 'Sun-yellow clothing neatly folded on a warm cream shelf' },
];

const ARROW = `<svg viewBox="0 0 26 12" fill="none" aria-hidden="true"><path d="M1 6h23m0 0-4.6-4.6M24 6l-4.6 4.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

let grid, track, cards = [];
let current = 0;            /* pagination counter position */
let hotIdx = null;          /* pointer / keyboard preview */
let activeIdx = null;       /* chosen collection */
let interactive = false;    /* armed once the entrance has settled */
let revealed = false;

export function renderSection2() {
  grid = document.getElementById('naGrid');
  grid.innerHTML = COLLECTIONS.map((c) => `
    <li class="na-card" data-key="${c.key}" tabindex="0" role="link"
        data-href="new-arrivals.html?colour=${c.key}">
      <figure>
        <div class="na-frame"><img src="${c.img}" alt="${c.alt}" draggable="false"></div>
        <figcaption>
          <h3 class="na-color" data-i18n="col.${c.key}"></h3>
          <p class="na-desc" data-i18n="col.${c.key}.desc"></p>
          <a class="na-shop" href="new-arrivals.html?colour=${c.key}"><span data-i18n="na.shop"></span>${ARROW}</a>
        </figcaption>
      </figure>
    </li>`).join('');
  track = grid;
  cards = Array.from(grid.querySelectorAll('.na-card'));
}

/* ---------- the spotlight (hover preview + active selection) ---------- */

function pad(n) { return String(n + 1).padStart(2, '0'); }

function setCounter(i) {
  current = (i + COLLECTIONS.length) % COLLECTIONS.length;
  document.getElementById('naCurrent').textContent = pad(current);
}

function paint() {
  cards.forEach((c, i) => {
    c.classList.toggle('is-active', i === activeIdx);
    c.classList.toggle('is-hot', i === hotIdx && i !== activeIdx);
  });
  grid.classList.toggle('has-spotlight', activeIdx !== null || hotIdx !== null);
  if (activeIdx !== null) setCounter(activeIdx);
  else if (hotIdx !== null) setCounter(hotIdx);
}

function setActive(i) {
  activeIdx = i;
  paint();
}

function wireSpotlight() {
  cards.forEach((card, i) => {
    /* the colour card IS the link — tap anywhere on it to enter that
       collection (its SHOP NOW keeps working too); hover previews */
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      if (card.dataset.href) { window.location.href = card.dataset.href; return; }
      if (!interactive) return;
      setActive(activeIdx === i ? null : i);   /* re-tap gently releases */
    });
    card.addEventListener('focusin', () => {
      if (!interactive) return;
      hotIdx = i; paint();
    });
    card.addEventListener('focusout', () => {
      if (hotIdx === i) { hotIdx = null; paint(); }
    });
    card.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === card) {
        e.preventDefault();
        if (card.dataset.href) { window.location.href = card.dataset.href; return; }
        if (interactive) setActive(activeIdx === i ? null : i);
      }
    });
  });

  /* hover preview only where hover truly exists */
  if (window.matchMedia('(hover: hover)').matches) {
    cards.forEach((card, i) => {
      card.addEventListener('pointerenter', () => {
        if (!interactive) return;
        hotIdx = i; paint();
      });
      card.addEventListener('pointerleave', () => {
        if (hotIdx === i) { hotIdx = null; paint(); }
      });
    });
  }
}

/* ---------- pagination ---------- */

function scrollable() {
  return track.scrollWidth > track.clientWidth + 8;
}

function go(dir) {
  if (scrollable()) {
    const card = cards[0];
    const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 12);
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  } else if (interactive) {
    setActive(((activeIdx ?? current) + dir + COLLECTIONS.length) % COLLECTIONS.length);
  }
}

function watchTrackScroll() {
  let raf = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (!cards.length || activeIdx !== null) return;
      const step = cards[0].getBoundingClientRect().width + 12;
      setCounter(Math.round(track.scrollLeft / step));
    });
  }, { passive: true });
}

/* ---------- reveal choreography ---------- */

function setInitial() {
  gsap.set(['.na-intro', '.na-ethos', '.na-statement'], { autoAlpha: 0, y: 26 });
  gsap.set('.na-frame', { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set('.na-frame img', { yPercent: 7, scale: 1.045 });
  gsap.set('.na-card figcaption', { autoAlpha: 0, y: 14 });
  gsap.set('.na-nav', { autoAlpha: 0 });
}

function buildReveal() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#newArrivals',
      start: 'top 72%',
      once: true,
    },
    onComplete: () => {
      revealed = true;
      /* hand the cards to the CSS spotlight system: the entrance ends at
         identity, so clearing its inline styles changes nothing visually */
      gsap.set(['.na-frame', '.na-frame img', '.na-card figcaption'], { clearProps: 'all' });
      interactive = true;
    },
  });

  /* phase 1 — the text settles in as one group */
  tl.to(['.na-intro', '.na-ethos', '.na-statement'], {
      autoAlpha: 1, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.07,
    }, 0)

    /* phase 2 — each image is unveiled upward, editorial mask reveal */
    .to('.na-frame', {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.05, ease: 'power2.out', stagger: 0.16,
    }, 0.3)
    .to('.na-frame img', {
      yPercent: 0, scale: 1,
      duration: 1.3, ease: 'power3.out', stagger: 0.16,
    }, 0.3)

    /* captions follow their image, quietly */
    .to('.na-card figcaption', {
      autoAlpha: 1, y: 0, duration: 0.75, ease: 'power2.out', stagger: 0.16,
    }, 0.78)

    .to('.na-nav', { autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, 1.55);

  registerReveal('#newArrivals', tl);
}

export function initSection2(reducedMotion) {
  document.getElementById('naPrev').addEventListener('click', () => go(-1));
  document.getElementById('naNext').addEventListener('click', () => go(1));
  watchTrackScroll();
  wireSpotlight();
  setCounter(0);

  if (reducedMotion) {         /* section stays statically visible */
    revealed = true;
    interactive = true;
    return;
  }
  setInitial();
  buildReveal();
}
