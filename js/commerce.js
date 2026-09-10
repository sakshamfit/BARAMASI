/* ═══════════════════════════════════════════════
   commerce — shared engine for the shopping pages.
   Renders the one global header + menu on every
   commerce page, then boots the page module named
   by <body data-page="…">. Listing pages (new
   arrivals · collections · colour · best sellers),
   the product experience, cart, wishlist, auth,
   checkout, orders — all reading js/products.js.
   ═══════════════════════════════════════════════ */

import { initI18n, t, getLang } from './i18n.js';
import {
  PRODUCTS, TYPES, COLOURS, COLOUR_COVERS, productById, productsByColour,
  productsByType, typeByKey, newArrivals, bestSellers, formatPrice,
  onProductsChange, loadLiveProducts,
} from './products.js';
import { waLink, openWhatsApp, WA_GREETING } from './brand.js';
import {
  getCart, addToCart, setQty, removeFromCart,
  getWishlist, inWishlist, toggleWishlist,
  signUp, logIn, logOut, currentUser,
  getAddress, saveAddress, deliverable,
  getOrders, placeOrder, orderByNumber, syncBadges,
} from './store.js';
import { initSearch } from './search.js';
import {
  trackPage, trailPush, trailSyncFromUrl, trailPrevious, trailPopForFallback,
} from './trail.js';

let langRerender = null;   /* pages register how to redraw dynamic copy */
let popRerender = null;    /* listing pages re-render from the URL on Back/Forward */
let backFallback = 'index.html';   /* hierarchy parent when there is no history */

/* ─────────────────────────────────────────────
   back — follows the visitor's real journey;
   falls back to the hierarchy parent on a
   direct entry (deep link, fresh tab)
   ───────────────────────────────────────────── */

function goBack() {
  if (trailPrevious()) {
    /* a real in-site page is behind us — retrace the journey */
    const here = location.href;
    /* belt: if history somehow has nowhere to go, step up the hierarchy */
    setTimeout(() => {
      if (location.href === here) { trailPopForFallback(); location.replace(backFallback); }
    }, 600);
    history.back();
  } else {
    /* direct entry (deep link / fresh tab) — step up the hierarchy */
    trailPopForFallback();
    location.replace(backFallback);
  }
}

function injectBackButton() {
  const main = document.querySelector('main');
  if (!main) return;
  main.insertAdjacentHTML('afterbegin', `
    <button class="go-back" type="button">
      <svg viewBox="0 0 26 12" fill="none" aria-hidden="true"><path d="M25 6H2m0 0 4.6-4.6M2 6l4.6 4.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span data-i18n="com.goBack">${t('com.goBack')}</span>
    </button>`);
  main.querySelector('.go-back').addEventListener('click', goBack);
}

/* ─────────────────────────────────────────────
   global header + menu (same system as index)
   ───────────────────────────────────────────── */

function renderHeader() {
  const host = document.getElementById('siteHeader');
  host.innerHTML = `
    <div id="logoSlot" aria-hidden="true"></div>
    <a class="hdr-logo-link" href="index.html" aria-label="BARAMASI — home">
      <img id="logo" class="is-landed in-header" src="assets/img/logo.svg" alt="BARAMASI — clothing store, Bettiah" draggable="false">
    </a>

    <nav id="mainNav" aria-label="Primary">
      <a class="nav-link" href="index.html" data-i18n="nav.home">Home</a>
      <a class="nav-link" href="new-arrivals.html" data-i18n="nav.new">New Arrivals</a>
      <a class="nav-link" href="collections.html" data-i18n="nav.categories">Categories</a>
      <a class="nav-link" href="color.html" data-i18n="nav.color">Shop By Color</a>
      <a class="nav-link" href="best-sellers.html" data-i18n="nav.best">Best Seller</a>
      <a class="nav-link" href="index.html#contact" data-i18n="nav.contact">Contact</a>
    </nav>

    <div class="header-utils">
      <div class="lang-switch" role="group" aria-label="Language">
        <button class="lang-btn is-active" data-lang="en" aria-pressed="true">English</button>
        <span class="lang-sep" aria-hidden="true"></span>
        <button class="lang-btn" data-lang="hi" lang="hi" aria-pressed="false">हिन्दी</button>
      </div>

      <span class="utils-divider" aria-hidden="true"></span>

      <button class="icon-btn search-btn" aria-label="Search" data-i18n-aria="aria.search">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.2" stroke="currentColor" stroke-width="1.4"/>
          <path d="m15.2 15.2 4.6 4.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
      </button>
      <a class="icon-btn account-btn" href="account.html" aria-label="Account" data-i18n-aria="aria.account">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8.4" r="3.6" stroke="currentColor" stroke-width="1.4"/>
          <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
      </a>
      <a class="icon-btn wish-btn" href="wishlist.html" aria-label="Wishlist" data-i18n-aria="aria.wishlist">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 20s-7-4.6-9-9c-1.2-2.8.4-6 3.4-6.4C8.4 4.3 10.6 5 12 7c1.4-2 3.6-2.7 5.6-2.4 3 .4 4.6 3.6 3.4 6.4-2 4.4-9 9-9 9Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
        </svg>
        <span class="cart-count wish-count" aria-hidden="true">0</span>
      </a>
      <a class="icon-btn cart-btn" href="cart.html" aria-label="Shopping bag" data-i18n-aria="aria.bag">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5.5 8.2h13l-.9 11.1a1.6 1.6 0 0 1-1.6 1.5H8a1.6 1.6 0 0 1-1.6-1.5L5.5 8.2Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
          <path d="M8.8 8V6.8a3.2 3.2 0 0 1 6.4 0V8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
        <span class="cart-count" aria-hidden="true">0</span>
      </a>
      <button class="icon-btn menu-btn" aria-label="Menu" data-i18n-aria="aria.menu">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3.5 7h17M3.5 12h17M3.5 17h17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <span class="header-rule" aria-hidden="true"></span>`;

  const menu = document.createElement('div');
  menu.id = 'mobileMenu';
  menu.setAttribute('aria-hidden', 'true');
  menu.style.visibility = 'hidden';
  menu.innerHTML = `
    <button class="mm-close" aria-label="Close menu">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
    </button>
    <nav class="mm-nav" aria-label="Menu">
      <a class="mm-link" href="index.html" data-i18n="nav.home">Home</a>
      <a class="mm-link" href="new-arrivals.html" data-i18n="nav.new">New Arrivals</a>
      <a class="mm-link" href="collections.html" data-i18n="nav.categories">Categories</a>
      <a class="mm-link" href="color.html" data-i18n="nav.color">Shop By Color</a>
      <a class="mm-link" href="best-sellers.html" data-i18n="nav.best">Best Seller</a>
      <a class="mm-link" href="cart.html" data-i18n="com.bag">Bag</a>
      <a class="mm-link" href="wishlist.html" data-i18n="com.wishlist">Wishlist</a>
      <a class="mm-link" href="account.html" data-i18n="com.account">Account</a>
    </nav>
    <div class="mm-rule" aria-hidden="true"></div>
    <div class="lang-switch mm-lang" role="group" aria-label="Language">
      <button class="lang-btn is-active" data-lang="en" aria-pressed="true">English</button>
      <span class="lang-sep" aria-hidden="true"></span>
      <button class="lang-btn" data-lang="hi" lang="hi" aria-pressed="false">हिन्दी</button>
    </div>
    <a class="mm-ig" href="https://www.google.com/maps/search/?api=1&query=%E0%A4%AC%E0%A4%BE%E0%A4%B0%E0%A4%BE%E0%A4%AE%E0%A4%BE%E0%A4%B8%E0%A5%80%2C%20RG57%2BWJ4%2C%20Sant%20Kabir%20Rd%2C%20Banuchhapar%2C%20Bettiah%2C%20Bihar%20845438" target="_blank" rel="noopener">बारामासी — Google listing</a>`;
  document.body.appendChild(menu);

  document.querySelector('.menu-btn').addEventListener('click', () => {
    menu.style.visibility = '';
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
  });
  const close = () => {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
    setTimeout(() => {
      if (!menu.classList.contains('is-open')) menu.style.visibility = 'hidden';
    }, 500);
  };
  menu.querySelector('.mm-close').addEventListener('click', close);
  menu.querySelectorAll('.mm-link').forEach((a) => a.addEventListener('click', close));
}

/* ─────────────────────────────────────────────
   small shared views
   ───────────────────────────────────────────── */

function colourName(colour) {
  return t('col.' + colour) || colour;
}

function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2400);
}

/* if a remote photo ever fails to load, show a local image instead of a
   broken-image icon — the card stays shoppable either way */
const IMG_FALLBACK = `onerror="this.onerror=null;this.src='assets/img/shade/neutrals.jpg'"`;

const arrowSvg = `<svg viewBox="0 0 26 12" fill="none" aria-hidden="true"><path d="M1 6h23m0 0-4.6-4.6M24 6l-4.6 4.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const heartPath = `<path d="M12 20s-7-4.6-9-9c-1.2-2.8.4-6 3.4-6.4C8.4 4.3 10.6 5 12 7c1.4-2 3.6-2.7 5.6-2.4 3 .4 4.6 3.6 3.4 6.4-2 4.4-9 9-9 9Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>`;
const playSvg = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="rgba(30,8,4,0.55)"/><path d="M10 8.2v7.6l6-3.8-6-3.8Z" fill="#F6ECDA"/></svg>`;
const waIcon = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

/* ── WhatsApp ordering — prefilled message builders ── */

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function waProductMsg(p) {
  return [
    WA_GREETING,
    `I'd like to order:`,
    `${p.name.en} (${cap(p.colour)}) — ${formatPrice(p.price)}`,
    '',
    'My size:',
  ].join('\n');
}

function waBagMsg(cart) {
  const lines = [WA_GREETING, `I'd like to order:`];
  let total = 0;
  for (const { id, qty } of cart) {
    const p = productById(id);
    if (!p) continue;
    lines.push(`• ${p.name.en} (${cap(p.colour)}) × ${qty} — ${formatPrice(p.price * qty)}`);
    total += p.price * qty;
  }
  lines.push(`Total: ${formatPrice(total)}`, '', 'My size:', 'Please confirm price & delivery. Thank you!');
  return lines.join('\n');
}

function waOrderMsg(items, total, addr, number) {
  return [
    WA_GREETING,
    `I'd like to place an order${number ? ' (ref ' + number + ')' : ''}:`,
    ...items.map((i) => `• ${i.name} × ${i.qty} — ${formatPrice(i.price * i.qty)}`),
    `Total: ${formatPrice(total)}`,
    '',
    'Deliver to:',
    `${addr.fullname} — ${addr.phone}`,
    `${addr.house}, ${addr.street}${addr.landmark ? ', ' + addr.landmark : ''}`,
    `${addr.city}, ${addr.state} — ${addr.pincode}`,
    '',
    'Please confirm price & delivery. Thank you!',
  ].join('\n');
}

const SWATCH = {
  red: '#8E1F1C', pink: '#D26A8C', orange: '#DB7A4E', yellow: '#E4C34F',
  green: '#5F7C4E', blue: '#33547F', purple: '#8465A5', black: '#2A2126', neutrals: '#CBB9A2',
};

function productCard(p) {
  const L = getLang();
  const type = typeByKey(p.type);
  const wished = inWishlist(p.id);
  return `
    <li class="pc" data-id="${p.id}">
      <a class="pc-media" href="product.html?p=${p.slug}">
        <img src="${p.cards[0]}" alt="${p.name.en}" loading="lazy" ${IMG_FALLBACK}>
        ${p.videos.length ? `<span class="pc-video" aria-hidden="true">${playSvg}</span>` : ''}
      </a>
      <button class="pc-wish ${wished ? 'is-on' : ''}" data-wish="${p.id}" aria-label="Wishlist" aria-pressed="${wished}">
        <svg viewBox="0 0 24 24" fill="${wished ? 'currentColor' : 'none'}" aria-hidden="true">${heartPath}</svg>
      </button>
      <span class="pc-type">${type ? type.name[L] : ''}</span>
      <a class="pc-name" href="product.html?p=${p.slug}">${p.name[L]}</a>
      <span class="pc-price">${formatPrice(p.price)}</span>
    </li>`;
}

function bindCardWishes(scope) {
  scope.querySelectorAll('[data-wish]').forEach((b) => b.addEventListener('click', (e) => {
    e.preventDefault();
    const on = toggleWishlist(b.dataset.wish);
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', String(on));
    b.querySelector('svg').setAttribute('fill', on ? 'currentColor' : 'none');
  }));
}

/* ── the one product-entrance system ──
   Cards rise from below into their grid position — the same
   bottom-to-top language as the landing sections. CSS-class driven
   (base state = settled) with a timer failsafe, so a throttled tab can
   never strand a card; it plays once per render and never replays on
   scroll. Reduced-motion and ?static render settled immediately. */

const MOTION_OFF = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  || new URLSearchParams(location.search).has('static');

function enterCards(host) {
  if (MOTION_OFF) return;
  const cards = [...host.querySelectorAll('.pc')];
  if (!cards.length) return;
  const mobile = window.matchMedia('(max-width: 720px)').matches;
  const step = mobile ? 35 : 45;          /* subtle stagger */
  const cap = mobile ? 420 : 540;         /* browsing never waits on the tail */
  cards.forEach((c, i) => {
    c.classList.add('pc-enter');
    c.style.transitionDelay = Math.min(i * step, cap) + 'ms';
    c.addEventListener('transitionend', (e) => {
      if (e.propertyName !== 'transform') return;
      c.classList.remove('pc-enter', 'pc-in');   /* settled = pristine base state */
      c.style.transitionDelay = '';
    }, { once: true });
  });
  /* commit the below-position frame, then release the rise */
  requestAnimationFrame(() => requestAnimationFrame(() => {
    cards.forEach((c) => c.classList.add('pc-in'));
  }));
  /* failsafes: frozen frames still get released, and nothing stays
     transition-bound long after the entrance — flushing any transition
     a throttled tab left mid-flight so cards always settle visible */
  setTimeout(() => cards.forEach((c) => c.classList.add('pc-in')), 700);
  setTimeout(() => cards.forEach((c) => {
    c.classList.remove('pc-enter', 'pc-in');
    c.style.transitionDelay = '';
    if (c.getAnimations) c.getAnimations().forEach((a) => a.cancel());
  }), cap + 1500);
}

function renderGrid(host, products) {
  if (!products.length) {
    host.innerHTML = `<p class="com-empty">${t('com.noMatches')}</p>`;
    return;
  }
  host.innerHTML = `<ul class="pc-grid">${products.map(productCard).join('')}</ul>`;
  bindCardWishes(host);
  enterCards(host);
}

/* ─────────────────────────────────────────────
   listing engine — new arrivals · colour · best sellers
   ───────────────────────────────────────────── */

function readParam(name) {
  return new URLSearchParams(location.search).get(name) || '';
}

function writeParams(entries) {
  const u = new URL(location.href);
  for (const [k, v] of Object.entries(entries)) {
    if (v) u.searchParams.set(k, v);
    else u.searchParams.delete(k);
  }
  /* each filter choice is a real step in the journey, so Back retraces it */
  if (u.href !== location.href) {
    history.pushState(null, '', u);
    trailPush();
  }
}

/* colour chips — only colours that exist within `pool` */
function colourChips(pool, active) {
  const present = COLOURS.filter((c) => pool.some((p) => p.colour === c));
  return `
    <div class="chip-row" role="group" aria-label="Colour">
      <button class="chip ${!active ? 'is-on' : ''}" data-colour="">${t('com.filter.all')}</button>
      ${present.map((c) => `
        <button class="chip ${active === c ? 'is-on' : ''}" data-colour="${c}">
          <span class="chip-swatch" style="background:${SWATCH[c]}"></span>${colourName(c)}
        </button>`).join('')}
    </div>`;
}

function typeChips(pool, active) {
  const L = getLang();
  const present = TYPES.filter((tp) => pool.some((p) => p.type === tp.key));
  if (present.length < 2) return '';
  return `
    <div class="chip-row" role="group" aria-label="Collection">
      <button class="chip ${!active ? 'is-on' : ''}" data-type="">${t('com.filter.all')}</button>
      ${present.map((tp) => `
        <button class="chip ${active === tp.key ? 'is-on' : ''}" data-type="${tp.key}">${tp.name[L]}</button>`).join('')}
    </div>`;
}

function pageNewArrivals() {
  const pool = newArrivals();
  const render = () => {
    const colour = readParam('colour');
    const type = readParam('type');
    let items = pool;
    if (colour) items = items.filter((p) => p.colour === colour);
    if (type) items = items.filter((p) => p.type === type);
    document.getElementById('listFilters').innerHTML =
      colourChips(pool, colour) + typeChips(pool, type);
    document.getElementById('listCount').textContent =
      items.length + ' ' + t(items.length === 1 ? 'com.piece' : 'com.pieces');
    renderGrid(document.getElementById('listGrid'), items);
    bindChips(render);
  };
  render();
  langRerender = render;
  popRerender = render;
}

function pageColor() {
  const picker = document.getElementById('colorPicker');
  const countEl = document.getElementById('listCount');
  const grid = document.getElementById('listGrid');

  const render = () => {
    const colour = readParam('colour');

    if (!colour) {
      /* first level: the brand's shade profile images — the catalogue
         only appears after a shade is chosen */
      picker.innerHTML = `
        <ul class="type-grid cc-grid">
          ${COLOURS.map((c) => {
            const n = productsByColour(c).length;
            const cover = COLOUR_COVERS[c];
            const inner = cover
              ? `<span class="tc-media"><img src="${cover}" alt="${colourName(c)}" loading="lazy"></span>`
              : `<span class="tc-media cc-tile"><span class="cc-dot" style="background:${SWATCH[c]}"></span></span>`;
            return `
              <li><button class="type-card cc-card" data-colour="${c}">
                ${inner}
                <span class="tc-name">${colourName(c)}</span>
                <span class="tc-count">${n} ${t(n === 1 ? 'com.piece' : 'com.pieces')}</span>
              </button></li>`;
          }).join('')}
        </ul>`;
      countEl.textContent = '';
      grid.innerHTML = '';
    } else {
      const items = productsByColour(colour);
      picker.innerHTML = `
        <h2 class="com-h2 cc-current"><span class="chip-swatch" style="background:${SWATCH[colour]}"></span>${colourName(colour)}</h2>
        <div class="chip-row" role="group" aria-label="Colour">
          <button class="chip" data-colour="">${t('com.filter.all')}</button>
          ${COLOURS.map((c) => `
            <button class="chip ${colour === c ? 'is-on' : ''}" data-colour="${c}">
              <span class="chip-swatch" style="background:${SWATCH[c]}"></span>${colourName(c)}
            </button>`).join('')}
        </div>`;
      countEl.textContent = items.length + ' ' + t(items.length === 1 ? 'com.piece' : 'com.pieces');
      renderGrid(grid, items);
    }

    picker.querySelectorAll('[data-colour]').forEach((b) =>
      b.addEventListener('click', () => { writeParams({ colour: b.dataset.colour }); render(); }));
  };
  render();
  langRerender = render;
  popRerender = render;
}

function pageBestSellers() {
  const render = () => {
    const pool = bestSellers();
    document.getElementById('listCount').textContent =
      pool.length + ' ' + t(pool.length === 1 ? 'com.piece' : 'com.pieces');
    renderGrid(document.getElementById('listGrid'), pool);
  };
  render();
  langRerender = render;
}

function bindChips(render) {
  document.querySelectorAll('#listFilters .chip').forEach((b) => {
    b.addEventListener('click', () => {
      if (b.dataset.colour !== undefined) writeParams({ colour: b.dataset.colour });
      if (b.dataset.type !== undefined) writeParams({ type: b.dataset.type });
      render();
    });
  });
}

/* ── collections ── */

function pageCollections() {
  const host = document.getElementById('collectionsHost');
  const render = () => {
    const L = getLang();
    const active = readParam('type');
    const tp = typeByKey(active);

    backFallback = tp ? 'collections.html' : 'index.html';

    if (!tp) {
      /* the seven collections */
      host.innerHTML = `
        <p class="com-eyebrow" data-i18n="com.origins.eyebrow">${t('com.origins.eyebrow')}</p>
        <h1 class="com-h1">${t('com.origins.h')}</h1>
        <p class="com-sub">${t('com.origins.sub')}</p>
        <ul class="type-grid">
          ${TYPES.map((tt) => {
            const items = productsByType(tt.key);
            /* first-level cards carry the brand's own landing image —
               never the product catalogue (fallback only until the
               missing covers arrive) */
            const cover = tt.cover || (items[0] ? items[0].cards[0] : '');
            return `
              <li><a class="type-card" href="collections.html?type=${tt.key}">
                <span class="tc-media"><img src="${cover}" alt="${tt.name.en}" loading="lazy"></span>
                <span class="tc-name">${tt.name[L]}</span>
                <span class="tc-count">${items.length} ${t(items.length === 1 ? 'com.piece' : 'com.pieces')}</span>
              </a></li>`;
          }).join('')}
        </ul>`;
      return;
    }

    /* one collection: header (+ its own film, when the brand supplied one) + products */
    const items = productsByType(tp.key);
    const colour = readParam('colour');
    const filtered = colour ? items.filter((p) => p.colour === colour) : items;
    host.innerHTML = `
      <div class="coll-head">
        <div class="coll-copy">
          <p class="com-eyebrow">${t('com.origins.eyebrow')}</p>
          <h1 class="com-h1">${tp.name[L]}</h1>
          <p class="com-sub">${tp.blurb[L]}</p>
        </div>
        ${tp.video ? `
          <div class="coll-film" id="collFilm">
            <video src="${tp.video}" poster="${tp.poster}" preload="none" playsinline controls></video>
            <button class="film-play" aria-label="${t('com.playFilm')}">${playSvg}<span>${t('com.playFilm')}</span></button>
          </div>` : ''}
      </div>
      <div id="listFilters">${colourChips(items, colour)}</div>
      <p class="list-count" id="listCount">${filtered.length} ${t(filtered.length === 1 ? 'com.piece' : 'com.pieces')}</p>
      <div id="listGrid"></div>`;
    renderGrid(document.getElementById('listGrid'), filtered);
    bindChips(render);
    const film = document.getElementById('collFilm');
    if (film) {
      const btn = film.querySelector('.film-play');
      const vid = film.querySelector('video');
      btn.addEventListener('click', () => { btn.hidden = true; vid.play(); });
    }
  };
  render();
  langRerender = render;
  popRerender = render;
}

/* ─────────────────────────────────────────────
   product detail — gallery · video · reviews
   ───────────────────────────────────────────── */

function starRow(value) {
  let out = '<span class="stars" aria-hidden="true">';
  for (let i = 1; i <= 5; i++) {
    out += `<svg viewBox="0 0 20 20" class="${value >= i - 0.25 ? 'is-full' : ''}"><path d="M10 1.8 12.4 7l5.6.5-4.2 3.8 1.2 5.6L10 14l-5 2.9 1.2-5.6L2 7.5 7.6 7 10 1.8Z" fill="currentColor" opacity="${value >= i - 0.25 ? 1 : 0.25}"/></svg>`;
  }
  return out + '</span>';
}

function pageProduct() {
  const key = readParam('p') || readParam('id');
  const p = productById(key);
  const host = document.getElementById('productHost');
  const moreHost = document.getElementById('pdMore');
  if (!p) {
    host.innerHTML = `<div class="com-solo"><p class="com-empty">${t('com.notFound')}</p>
      <a class="ct-btn com-center" href="new-arrivals.html"><span>${t('com.continue')}</span>${arrowSvg}</a></div>`;
    if (moreHost) moreHost.innerHTML = '';
    return;
  }
  document.title = p.name.en + ' — BARAMASI';
  backFallback = 'collections.html?type=' + p.type;
  const L = getLang();
  const type = typeByKey(p.type);
  const wished = inWishlist(p.id);

  /* gallery slides: every image, then every video */
  const slides = [
    ...p.images.map((src, i) => `
      <figure class="pd-slide"><img src="${src}" alt="${p.name.en} — view ${i + 1}" ${i ? 'loading="lazy"' : ''} ${IMG_FALLBACK}></figure>`),
    ...p.videos.map((v) => `
      <figure class="pd-slide pd-slide-video">
        <video src="${v.src}" poster="${v.poster}" preload="none" playsinline controls></video>
        <button class="pd-play" aria-label="${t('com.playVideo')}">${playSvg}</button>
      </figure>`),
  ];
  const thumbs = [
    ...p.images.map((src, i) => `<button data-slide="${i}" aria-label="Image ${i + 1}"><img src="${p.cards[i]}" alt=""></button>`),
    ...p.videos.map((v, i) => `<button data-slide="${p.images.length + i}" class="pd-thumb-video" aria-label="${t('com.playVideo')}"><img src="${v.poster}" alt="">${playSvg}</button>`),
  ];

  const reviewCount = p.reviews.length;
  host.innerHTML = `
    <div class="pd-gallery">
      <div class="pd-track" id="pdTrack">${slides.join('')}</div>
      ${slides.length > 1 ? `
        <div class="pd-dots" id="pdDots">${slides.map((_, i) => `<span class="${i ? '' : 'is-on'}"></span>`).join('')}</div>
        <div class="pd-thumbs">${thumbs.join('')}</div>` : ''}
    </div>
    <div class="pd-info">
      <p class="com-eyebrow"><a class="pd-typelink" href="collections.html?type=${p.type}">${type ? type.name[L] : ''}</a></p>
      <h1 class="pd-name">${p.name[L]}</h1>
      <div class="pd-rating">
        ${p.rating ? `${starRow(p.rating)}<span>${p.rating.toFixed(1)}</span><a href="#pdReviews">${reviewCount} ${t('com.reviews')}</a>`
          : `<a class="pd-noreviews" href="#pdReviews">${t('com.noReviewsShort')}</a>`}
      </div>
      <p class="pd-price">${formatPrice(p.price)}</p>
      ${p.priceConfirmed ? '' : `<p class="pd-price-note">${t('com.priceTbc')}</p>`}
      <p class="pd-desc">${p.desc[L]}</p>
      <dl class="pd-meta">
        <div><dt>${t('com.colour')}</dt><dd>${colourName(p.colour)}</dd></div>
        <div><dt>${t('com.fabric')}</dt><dd>${p.fabric[L]}</dd></div>
        <div><dt>${t('com.craft')}</dt><dd>${p.craft[L]}</dd></div>
        <div><dt>${t('com.availability')}</dt><dd>${t('com.toOrder')}</dd></div>
      </dl>
      <a class="ct-btn pd-wa" id="pdWa" href="${waLink(waProductMsg(p))}" target="_blank" rel="noopener">
        ${waIcon}<span>${t('com.wa.order')}</span>
      </a>
      <div class="pd-actions">
        <button class="ct-btn pd-add" id="pdAdd"><span>${t('com.addToCart')}</span>${arrowSvg}</button>
        <button class="pd-wishbtn ${wished ? 'is-on' : ''}" id="pdWish" aria-pressed="${wished}">
          <svg viewBox="0 0 24 24" fill="${wished ? 'currentColor' : 'none'}" aria-hidden="true">${heartPath}</svg>
          <span>${wished ? t('com.inWishlist') : t('com.addWishlist')}</span>
        </button>
      </div>
      <button class="pd-buy" id="pdBuy">${t('com.buyNow')}</button>
      <p class="pd-note">${t('com.wa.note')}</p>

      <section class="pd-reviews" id="pdReviews" aria-label="${t('com.reviews')}">
        <h2 class="com-h2">${t('com.reviews')}</h2>
        ${reviewCount ? `
          <p class="rv-summary">${starRow(p.rating || 0)} ${p.rating ? p.rating.toFixed(1) : ''} · ${reviewCount} ${t('com.reviews')}</p>
          <ul class="rv-list">
            ${p.reviews.map((r) => `
              <li>
                <div class="rv-head">${starRow(r.stars)}<strong>${r.author}</strong><time>${r.date}</time></div>
                <p>${r.text}</p>
              </li>`).join('')}
          </ul>`
        : `<p class="rv-empty">${t('com.noReviews')}</p>`}
      </section>
    </div>`;

  /* actions */
  document.getElementById('pdAdd').addEventListener('click', () => {
    addToCart(p.id);
    toast(t('com.added'));
  });
  /* buy now: straight to checkout (which handles login + return) —
     if the piece is already in the bag, proceed without adding more */
  document.getElementById('pdBuy').addEventListener('click', () => {
    if (!getCart().some((i) => i.id === p.id)) addToCart(p.id);
    location.href = 'checkout.html';
  });
  document.getElementById('pdWish').addEventListener('click', (e) => {
    const on = toggleWishlist(p.id);
    const btn = e.currentTarget;
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.querySelector('svg').setAttribute('fill', on ? 'currentColor' : 'none');
    btn.querySelector('span').textContent = on ? t('com.inWishlist') : t('com.addWishlist');
  });

  /* gallery wiring: swipe (native scroll-snap) + dots + thumbs + video play */
  const track = document.getElementById('pdTrack');
  const dots = document.getElementById('pdDots');
  const setDot = (i) => {
    if (!dots) return;
    [...dots.children].forEach((d, n) => d.classList.toggle('is-on', n === i));
  };
  track.addEventListener('scroll', () => {
    const i = Math.round(track.scrollLeft / track.clientWidth);
    setDot(i);
    /* pause any playing video when swiped away */
    track.querySelectorAll('video').forEach((v) => {
      const slide = v.closest('.pd-slide');
      const idx = [...track.children].indexOf(slide);
      if (idx !== i && !v.paused) v.pause();
    });
  }, { passive: true });
  host.querySelectorAll('[data-slide]').forEach((b) => b.addEventListener('click', () => {
    track.scrollTo({ left: Number(b.dataset.slide) * track.clientWidth, behavior: 'smooth' });
  }));
  host.querySelectorAll('.pd-play').forEach((btn) => btn.addEventListener('click', () => {
    const vid = btn.parentElement.querySelector('video');
    btn.hidden = true;
    vid.play();
  }));

  /* more from this collection */
  const more = PRODUCTS.filter((x) => x.type === p.type && x.id !== p.id).slice(0, 4);
  moreHost.innerHTML = more.length
    ? `<h2 class="com-h2">${t('com.moreType')}</h2><ul class="pc-grid">${more.map(productCard).join('')}</ul>`
    : '';
  bindCardWishes(moreHost);
  enterCards(moreHost);   /* same entrance language as the collection grids */
}

/* ─────────────────────────────────────────────
   cart / bag
   ───────────────────────────────────────────── */

function pageCart() {
  const host = document.getElementById('cartHost');

  const changeQty = (id, delta) => {
    const item = getCart().find((i) => i.id === id);
    if (!item) return;
    if (item.qty + delta < 1) removeFromCart(id);
    else setQty(id, item.qty + delta);
    render();
  };

  function render() {
    const cart = getCart();
    if (!cart.length) {
      host.innerHTML = `<div class="com-solo"><p class="com-empty">${t('com.cartEmpty')}</p>
        <a class="ct-btn com-center" href="new-arrivals.html"><span>${t('com.continue')}</span>${arrowSvg}</a></div>`;
      return;
    }
    const L = getLang();
    let total = 0;
    const rows = cart.map(({ id, qty }) => {
      const p = productById(id);
      if (!p) return '';
      const line = p.price * qty;
      total += line;
      return `
        <li class="cr" data-id="${id}">
          <a class="cr-media" href="product.html?p=${p.slug}"><img src="${p.cards[0]}" alt="${p.name.en}" ${IMG_FALLBACK}></a>
          <div class="cr-info">
            <a class="cr-name" href="product.html?p=${p.slug}">${p.name[L]}</a>
            <span class="cr-colour">${colourName(p.colour)}</span>
            <span class="cr-price">${formatPrice(p.price)}</span>
            <div class="cr-qty">
              <button data-dec="${id}" aria-label="Decrease quantity">−</button>
              <span>${qty}</span>
              <button data-inc="${id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div class="cr-side">
            <span class="cr-line">${formatPrice(line)}</span>
            <button class="cr-remove" data-remove="${id}">${t('com.remove')}</button>
          </div>
        </li>`;
    }).join('');
    host.innerHTML = `
      <ul class="cr-list">${rows}</ul>
      <div class="cart-summary">
        <div class="cs-row"><span>${t('com.subtotal')}</span><strong>${formatPrice(total)}</strong></div>
        <p class="cs-note">${t('com.deliveryNote')}</p>
        <a class="ct-btn cs-checkout" href="checkout.html"><span>${t('com.checkout')}</span>${arrowSvg}</a>
        <a class="ct-btn cs-wa" href="${waLink(waBagMsg(cart))}" target="_blank" rel="noopener">${waIcon}<span>${t('com.wa.bag')}</span></a>
      </div>`;
    host.querySelectorAll('[data-inc]').forEach((b) => b.addEventListener('click', () => changeQty(b.dataset.inc, +1)));
    host.querySelectorAll('[data-dec]').forEach((b) => b.addEventListener('click', () => changeQty(b.dataset.dec, -1)));
    host.querySelectorAll('[data-remove]').forEach((b) => b.addEventListener('click', () => { removeFromCart(b.dataset.remove); render(); }));
  }
  render();
  langRerender = render;
}

/* ─────────────────────────────────────────────
   wishlist
   ───────────────────────────────────────────── */

function pageWishlist() {
  const host = document.getElementById('wishHost');
  function render() {
    const ids = getWishlist();
    if (!ids.length) {
      host.innerHTML = `<div class="com-solo"><p class="com-empty">${t('com.wishEmpty')}</p>
        <a class="ct-btn com-center" href="new-arrivals.html"><span>${t('com.continue')}</span>${arrowSvg}</a></div>`;
      return;
    }
    const L = getLang();
    host.innerHTML = `<ul class="pc-grid">${ids.map((id) => {
      const p = productById(id);
      return p ? `
        <li class="pc" data-id="${id}">
          <a class="pc-media" href="product.html?p=${p.slug}"><img src="${p.cards[0]}" alt="${p.name.en}" ${IMG_FALLBACK}></a>
          <a class="pc-name" href="product.html?p=${p.slug}">${p.name[L]}</a>
          <span class="pc-colour">${colourName(p.colour)}</span>
          <span class="pc-price">${formatPrice(p.price)}</span>
          <span class="pc-avail">${t('com.toOrder')}</span>
          <div class="pc-actions">
            <button class="ct-btn pc-add" data-add="${id}"><span>${t('com.addToCart')}</span></button>
            <button class="pc-removewish" data-unwish="${id}">${t('com.remove')}</button>
          </div>
        </li>` : '';
    }).join('')}</ul>`;
    host.querySelectorAll('[data-add]').forEach((b) => b.addEventListener('click', () => { addToCart(b.dataset.add); toast(t('com.added')); }));
    host.querySelectorAll('[data-unwish]').forEach((b) => b.addEventListener('click', () => { toggleWishlist(b.dataset.unwish); render(); }));
  }
  render();
  langRerender = render;
}

/* ─────────────────────────────────────────────
   auth — email + password only, by design
   ───────────────────────────────────────────── */

function pageAuth(mode) {
  const form = document.getElementById('authForm');
  const err = document.getElementById('authErr');
  const next = new URLSearchParams(location.search).get('next');

  if (next) {
    const alt = document.querySelector('.auth-alt a');
    if (alt) alt.href = alt.getAttribute('href').split('?')[0] + '?next=' + encodeURIComponent(next);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.textContent = '';
    const email = form.email.value.trim();
    const password = form.password.value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.textContent = t('com.badEmail'); return; }
    if (password.length < 6) { err.textContent = t('com.shortPass'); return; }
    if (mode === 'signup') {
      if (password !== form.confirm.value) { err.textContent = t('com.passMismatch'); return; }
      const r = await signUp(email, password);
      if (!r.ok) { err.textContent = t('com.accountExists'); return; }
    } else {
      const r = await logIn(email, password);
      if (!r.ok) { err.textContent = t('com.badLogin'); return; }
    }
    location.href = next || 'account.html';
  });
}

/* ─────────────────────────────────────────────
   checkout — login-gated; Bettiah-area delivery (prototype)
   ───────────────────────────────────────────── */

function pageCheckout() {
  if (!currentUser()) { location.replace('login.html?next=checkout.html'); return; }
  if (!getCart().length) { location.replace('cart.html'); return; }
  backFallback = 'cart.html';

  const addrForm = document.getElementById('addrForm');
  const addrErr = document.getElementById('addrErr');
  const review = document.getElementById('reviewStep');
  const addrStep = document.getElementById('addrStep');
  const saved = getAddress();
  if (saved) {
    for (const [k, v] of Object.entries(saved)) if (addrForm[k]) addrForm[k].value = v;
  }

  let pendingAddr = null;

  function renderReview(addr) {
    const L = getLang();
    const cart = getCart();
    let total = 0;
    document.getElementById('reviewItems').innerHTML = cart.map(({ id, qty }) => {
      const p = productById(id);
      if (!p) return '';
      const line = p.price * qty;
      total += line;
      return `<li><img src="${p.cards[0]}" alt="" ${IMG_FALLBACK}><span>${p.name[L]} × ${qty}</span><strong>${formatPrice(line)}</strong></li>`;
    }).join('');
    document.getElementById('reviewTotal').textContent = formatPrice(total);
    document.getElementById('reviewAddr').textContent =
      `${addr.fullname} · ${addr.house}, ${addr.street}${addr.landmark ? ', ' + addr.landmark : ''}, ${addr.city} – ${addr.pincode}`;
    return total;
  }

  langRerender = () => { if (pendingAddr && !review.hidden) renderReview(pendingAddr); };

  addrForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addrErr.textContent = '';
    const addr = Object.fromEntries(new FormData(addrForm).entries());
    for (const k of Object.keys(addr)) addr[k] = String(addr[k]).trim();
    for (const k of ['fullname', 'phone', 'house', 'street', 'city', 'state', 'pincode']) {
      if (!addr[k]) { addrErr.textContent = t('com.fillAll'); return; }
    }
    if (!/^\d{10}$/.test(addr.phone.replace(/\s+/g, ''))) { addrErr.textContent = t('com.badPhone'); return; }
    if (!deliverable(addr)) { addrErr.textContent = t('com.onlyHyd'); return; }
    saveAddress(addr);
    pendingAddr = addr;

    const total = renderReview(addr);
    addrStep.hidden = true;
    review.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.getElementById('placeOrder').onclick = () => {
      const items = getCart().map(({ id, qty }) => {
        const p = productById(id);
        return { id, qty, price: p.price, name: p.name.en };
      });
      const number = placeOrder(items, total, addr);
      /* record the order locally, then hand it to WhatsApp to confirm
         with the store (same-gesture open, so it isn't popup-blocked) */
      openWhatsApp(waOrderMsg(items, total, addr, number));
      location.href = 'order.html?n=' + encodeURIComponent(number);
    };
    document.getElementById('backToAddr').onclick = () => {
      review.hidden = true;
      addrStep.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  });
}

/* ─────────────────────────────────────────────
   order confirmation
   ───────────────────────────────────────────── */

function pageOrder() {
  const n = new URLSearchParams(location.search).get('n');
  const o = orderByNumber(n);
  const host = document.getElementById('orderHost');
  if (!o) {
    host.innerHTML = `<div class="com-solo"><p class="com-empty">${t('com.notFound')}</p>
      <a class="ct-btn com-center" href="index.html"><span>${t('com.continue')}</span>${arrowSvg}</a></div>`;
    return;
  }
  host.innerHTML = `
    <div class="ok-badge" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10.5" stroke="currentColor" stroke-width="1"/><path d="m7.5 12.5 3 3 6-6.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <h1 class="com-h1">${t('com.orderPlaced')}</h1>
    <p class="ok-number">${o.number}</p>
    <p class="ok-note">${t('com.wa.afterNote')}</p>
    <ul class="ok-items">${o.items.map((i) => `<li><span>${i.name} × ${i.qty}</span><strong>${formatPrice(i.price * i.qty)}</strong></li>`).join('')}</ul>
    <div class="cs-row ok-total"><span>${t('com.total')}</span><strong>${formatPrice(o.total)}</strong></div>
    <p class="ok-addr">${t('com.deliveringTo')}: ${o.address.fullname} · ${o.address.house}, ${o.address.street}, ${o.address.city} – ${o.address.pincode}</p>
    <div class="ok-actions">
      <a class="ct-btn ok-wa" href="${waLink(waOrderMsg(o.items, o.total, o.address, o.number))}" target="_blank" rel="noopener">${waIcon}<span>${t('com.wa.confirm')}</span></a>
      <a class="ct-btn" href="new-arrivals.html"><span>${t('com.continue')}</span>${arrowSvg}</a>
      <a class="ok-view" href="account.html">${t('com.viewOrders')}</a>
    </div>`;
}

/* ─────────────────────────────────────────────
   account
   ───────────────────────────────────────────── */

function pageAccount() {
  const user = currentUser();
  if (!user) { location.replace('login.html?next=account.html'); return; }
  const host = document.getElementById('accountHost');
  const orders = getOrders().filter((o) => o.email === user);
  const addr = getAddress();
  host.innerHTML = `
    <p class="com-eyebrow">${t('com.signedInAs')}</p>
    <h1 class="com-h1 acc-email">${user}</h1>
    <div class="acc-links">
      <a href="wishlist.html">${t('com.wishlist')}</a>
      <span aria-hidden="true">·</span>
      <a href="cart.html">${t('com.bag')}</a>
    </div>
    <h2 class="com-h2">${t('com.orders')}</h2>
    ${orders.length ? `<ul class="acc-orders">${orders.map((o) => `
      <li><a href="order.html?n=${encodeURIComponent(o.number)}">
        <span class="ao-num">${o.number}</span>
        <span class="ao-date">${new Date(o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        <strong>${formatPrice(o.total)}</strong>
      </a></li>`).join('')}</ul>`
      : `<p class="com-empty">${t('com.noOrders')}</p>`}
    ${addr ? `<h2 class="com-h2">${t('com.savedAddress')}</h2>
      <p class="acc-addr">${addr.fullname} · ${addr.house}, ${addr.street}, ${addr.city} – ${addr.pincode}</p>` : ''}
    <button class="acc-logout" id="logoutBtn">${t('com.logout')}</button>`;
  document.getElementById('logoutBtn').addEventListener('click', () => {
    logOut();
    location.href = 'index.html';
  });
}

/* ─────────────────────────────────────────────
   boot
   ───────────────────────────────────────────── */

const PAGES = {
  'new-arrivals': pageNewArrivals,
  'collections': pageCollections,
  'color': pageColor,
  'best-sellers': pageBestSellers,
  product: pageProduct,
  cart: pageCart,
  wishlist: pageWishlist,
  login: () => pageAuth('login'),
  signup: () => pageAuth('signup'),
  checkout: pageCheckout,
  order: pageOrder,
  account: pageAccount,
};

/* pages whose dynamic copy is simply re-rendered on a language switch —
   listing pages register their own langRerender */
const RERENDER = ['product', 'order', 'account'];

/* pages that display product data and should re-render when the live
   catalogue (re)loads */
const DATA_PAGES = ['new-arrivals', 'collections', 'color', 'best-sellers', 'product', 'cart', 'wishlist'];

function boot() {
  const page = document.body.dataset.page;
  if (!page) return;                       /* the landing page runs main.js */

  /* entering the site anywhere counts as the entry — Home never replays
     the cinematic intro after this (a full refresh of the landing page
     still can, by design) */
  try { sessionStorage.setItem('baramasi-intro-seen', '1'); } catch { /* private mode */ }
  trackPage();

  renderHeader();
  initI18n();
  initSearch();
  syncBadges();

  /* highlight the active nav item */
  document.querySelectorAll('#mainNav .nav-link').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === location.pathname.replace(/^\//, '')) a.classList.add('is-active');
  });

  const run = PAGES[page];

  if (DATA_PAGES.includes(page)) {
    /* live catalogue: when Supabase data lands (or the admin edits
       something and we reload), re-render every product-data surface
       so changes show without a manual refresh */
    onProductsChange(run);
    /* first paint waits (briefly) for the live catalogue, so a product
       edited in /admin never flashes its stale bundled snapshot first —
       e.g. a seed row turned into a shirt must not appear as a hoodie.
       The wait is bounded: if Supabase is slow or unreachable, the
       snapshot paints and the live data re-renders whenever it lands. */
    Promise.race([
      loadLiveProducts().catch(() => { /* keep the bundled snapshot */ }),
      new Promise((resolve) => setTimeout(resolve, 900)),
    ]).then(() => { if (run) run(); });
  } else {
    if (run) run();
    loadLiveProducts();
  }

  /* every internal page carries the journey Back button (the order
     confirmation instead offers Continue Shopping / View Orders) */
  if (page !== 'order') injectBackButton();

  /* browser Back/Forward across filter states re-renders from the URL */
  window.addEventListener('popstate', () => {
    trailSyncFromUrl();
    if (typeof popRerender === 'function') popRerender();
  });

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (RERENDER.includes(page)) run();
      else if (typeof langRerender === 'function') langRerender();
    });
  });

  /* back-forward cache restore: state may have changed on another page */
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    syncBadges();
    if ((RERENDER.includes(page) || ['cart', 'wishlist'].includes(page)) && run) run();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
