/* ═══════════════════════════════════════════════
   landing-live — the main page, connected to /admin.

   The landing sections (New Arrivals · Collections · Shop by Color ·
   Best Sellers) ship as static editorial art so the page paints instantly
   and still looks complete offline. Once the live Supabase catalogue loads,
   this module swaps each card's photograph for the matching LIVE product
   photo — so anything changed in /admin (replacement photos, new arrivals,
   best sellers) appears on the main page too, with zero layout shift (same
   frames, object-fit: cover) and zero interference with the GSAP reveals
   (only img src/alt and Best-Seller links are touched).

   Safety rules:
   · nothing swaps until the live catalogue has actually loaded (isLive())
     — the static art stays as the offline / unconfigured fallback;
   · every card keeps its static photo as a one-shot onerror fallback, so
     a broken live URL can never leave a hole on the homepage;
   · slots with no live match keep their static art and links.
   ═══════════════════════════════════════════════ */

import { PRODUCTS, onProductsChange, loadLiveProducts, isLive } from './products.js';

/* ── pure slot pickers (exported for testing) ── */

export function pickForColour(products, colour) {
  return (products || []).find((p) => p.colour === colour) || null;
}

export function pickNewArrivalForColour(products, colour) {
  return (products || []).find((p) => p.colour === colour && p.newArrival)
    || pickForColour(products, colour);
}

export function pickBestSellerForColour(products, colour) {
  return (products || []).find((p) => p.colour === colour && p.bestSeller) || null;
}

export function pickForType(products, type) {
  return (products || []).find((p) => p.type === type) || null;
}

/* ── DOM binding ── */

function livePhoto(p) {
  return p && Array.isArray(p.cards) && p.cards[0] ? p.cards[0] : '';
}

/* stash the static art once, and arm a one-shot restore if a live photo
   ever fails to load (e.g. a private bucket) — the homepage must never
   show a broken image */
function ensureFallback(img) {
  if (!img || img.dataset.liveBound) return;
  img.dataset.liveBound = '1';
  if (img.dataset.staticSrc == null) img.dataset.staticSrc = img.getAttribute('src') || '';
  if (img.dataset.staticAlt == null) img.dataset.staticAlt = img.getAttribute('alt') || '';
  img.addEventListener('error', () => {
    if (img.dataset.liveSrc && img.getAttribute('src') === img.dataset.liveSrc) {
      img.removeAttribute('data-live-src');
      if (img.dataset.staticSrc) img.setAttribute('src', img.dataset.staticSrc);
      if (img.dataset.staticAlt != null) img.setAttribute('alt', img.dataset.staticAlt);
    }
  });
}

function applySlot(li, product, { deepLink = false } = {}) {
  const img = li.querySelector('img');
  if (!img) return;
  ensureFallback(img);
  const src = livePhoto(product);

  if (deepLink && li.dataset.staticHref == null) {
    li.dataset.staticHref = li.dataset.href || '';
    li.querySelectorAll('a[href]').forEach((a) => {
      if (a.dataset.staticHref == null) a.dataset.staticHref = a.getAttribute('href') || '';
    });
  }

  if (product && src) {
    if (img.getAttribute('src') !== src) {
      img.dataset.liveSrc = src;
      img.setAttribute('src', src);
    }
    if (product.name && product.name.en) img.setAttribute('alt', product.name.en);
    if (deepLink) {
      const href = 'product.html?p=' + encodeURIComponent(product.slug || product.id);
      li.dataset.href = href;
      li.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', href));
    }
  } else {
    /* no live match — restore the static art and links */
    img.removeAttribute('data-live-src');
    if (img.dataset.staticSrc && img.getAttribute('src') !== img.dataset.staticSrc) {
      img.setAttribute('src', img.dataset.staticSrc);
    }
    if (img.dataset.staticAlt != null) img.setAttribute('alt', img.dataset.staticAlt);
    if (deepLink && li.dataset.staticHref != null) {
      li.dataset.href = li.dataset.staticHref;
      li.querySelectorAll('a[href]').forEach((a) => {
        if (a.dataset.staticHref != null) a.setAttribute('href', a.dataset.staticHref);
      });
    }
  }
}

function bindRail(hostSelector, itemSelector, pick, opts) {
  const host = document.querySelector(hostSelector);
  if (!host) return;
  host.querySelectorAll(itemSelector).forEach((li) => {
    const key = li.dataset.key;
    if (!key) return;
    applySlot(li, pick(key), opts);
  });
}

export function refreshLandingLive() {
  /* static art stays until the live catalogue has genuinely loaded */
  if (!isLive()) return false;
  /* section 2 — New Arrivals: the live new arrival in each colour */
  bindRail('#naGrid', '.na-card', (colour) => pickNewArrivalForColour(PRODUCTS, colour));
  /* section 3 — Collections: the first live piece of each category */
  bindRail('#originWall', '.or-card', (type) => pickForType(PRODUCTS, type));
  /* section 4 — Shop by Color: the first live piece in each shade */
  bindRail('#shadeRail', '.sc-card', (colour) => pickForColour(PRODUCTS, colour));
  /* section 5 — Best Sellers: the live best seller in each colour, linked
     straight to its product page */
  bindRail('#bestRail', '.bs-item', (colour) => pickBestSellerForColour(PRODUCTS, colour), { deepLink: true });
  return true;
}

export function initLandingLive() {
  /* re-apply whenever the live catalogue (re)loads */
  onProductsChange(() => refreshLandingLive());
  /* apply immediately if live data is already in (and fetch it if not) */
  refreshLandingLive();
  loadLiveProducts().catch(() => { /* offline — the static art stays */ });
}
