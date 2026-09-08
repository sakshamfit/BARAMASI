/* ═══════════════════════════════════════════════
   contact — the closing section of the main
   experience. Brand config (real Google-listing
   facts for BARAMASI, Bettiah), links out to the
   store's Google listing, and the established
   scroll-reveal grammar. No phone, email or
   socials are invented — the listing is the single
   verified contact point.
   ═══════════════════════════════════════════════ */

import { registerReveal } from './scroll.js';

/* every piece of contact data lives here — update once, applies everywhere.
   Source: the store's Google listing (kept in the BARAMASI project's
   store-data). Listing-supplied, verify before publishing changes. */
export const BRAND = {
  name: 'बारामासी',
  category: 'Clothing store',
  rating: 4.3,
  reviewCount: 6,
  hours: 'Open · Closes 9:30 PM',
  address: ['RG57+WJ4, Sant Kabir Rd,', 'Naveen Colony, Banuchhapar,', 'Bettiah, Bihar 845438'],
  addressQuery: 'बारामासी, RG57+WJ4, Sant Kabir Rd, Banuchhapar, Bettiah, Bihar 845438',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('RG57+WJ4, Sant Kabir Rd, Naveen Colony, Banuchhapar, Bettiah, Bihar 845438'),
  listingUrl: 'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('बारामासी, RG57+WJ4, Sant Kabir Rd, Banuchhapar, Bettiah, Bihar 845438'),
};

function applyBrand() {
  const directions = document.getElementById('ctDirections');
  if (directions) directions.href = BRAND.mapsUrl;
  const openMaps = document.getElementById('ctOpenMaps');
  if (openMaps) openMaps.href = BRAND.mapsUrl;
  const listing = document.getElementById('ctGoogle');
  if (listing) listing.href = BRAND.listingUrl;
  const menuLink = document.querySelector('.mm-ig');
  if (menuLink) menuLink.href = BRAND.listingUrl;
}

/* ---------- reveals (scroll-triggered, same grammar) ---------- */

function buildReveals() {
  gsap.set(['#contact .ch-shadow', '#contact .ch-florals'], { autoAlpha: 0 });
  gsap.set('#contact .ch-copy > *', { autoAlpha: 0, y: 24 });
  gsap.set('#contact .ch-media', { clipPath: 'inset(0% 0% 0% 100%)' });
  gsap.set('#contact .ch-media img', { scale: 1.06, xPercent: 3 });

  const chTl = gsap.timeline({
    scrollTrigger: { trigger: '#contact .ch', start: 'top 72%', once: true },
    onComplete: () => {
      gsap.to('#contact .ch-shadow', { x: 9, duration: 12, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to('#contact .ch-florals', { y: -5, rotation: 1, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    },
  })
    .to(['#contact .ch-shadow', '#contact .ch-florals'], {
      autoAlpha: 1, duration: 1.1, ease: 'power2.out', stagger: 0.1,
    }, 0)
    .to('#contact .ch-copy > *', {
      autoAlpha: 1, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.09,
    }, 0.15)
    .to('#contact .ch-media', {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.35, ease: 'power2.inOut',
    }, 0.3)
    .to('#contact .ch-media img', {
      scale: 1, xPercent: 0, duration: 1.7, ease: 'power3.out',
    }, 0.3);
  registerReveal('#contact .ch', chTl);

  gsap.set(['.ci-block', '.ci-info .ct-btn', '.ci-social'], { autoAlpha: 0, y: 20 });
  gsap.set('.ci-form', { autoAlpha: 0, y: 24 });
  gsap.set('.ci-quote > *', { autoAlpha: 0, y: 18 });
  const ciTl = gsap.timeline({
    scrollTrigger: { trigger: '.ci', start: 'top 74%', once: true },
  })
    .to(['.ci-block', '.ci-info .ct-btn', '.ci-social'], {
      autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.09,
    }, 0)
    .to('.ci-form', { autoAlpha: 1, y: 0, duration: 0.95, ease: 'power3.out' }, 0.25)
    .to('.ci-quote > *', {
      autoAlpha: 1, y: 0, duration: 0.9, ease: 'power2.out', stagger: 0.12,
    }, 0.45);
  registerReveal('.ci', ciTl);

  gsap.set('.cl-photo', { clipPath: 'inset(0% 100% 0% 0%)' });
  gsap.set('.cl-center > *', { autoAlpha: 0, y: 18 });
  gsap.set('.cl-map', { autoAlpha: 0, y: 20 });
  const clTl = gsap.timeline({
    scrollTrigger: { trigger: '.cl', start: 'top 78%', once: true },
  })
    .to('.cl-photo', {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power2.inOut',
    }, 0)
    .to('.cl-center > *', {
      autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.08,
    }, 0.3)
    .to('.cl-map', { autoAlpha: 1, y: 0, duration: 0.95, ease: 'power3.out' }, 0.45);
  registerReveal('.cl', clTl);
}

/* ---------- init (called from the main boot) ---------- */

export function initContactSection(reducedMotion) {
  applyBrand();
  if (reducedMotion) return;
  buildReveals();
}
