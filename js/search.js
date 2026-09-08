/* ═══════════════════════════════════════════════
   search — full-screen product search overlay.
   Injected on every page; opens from any
   .search-btn; results link to product pages.
   ═══════════════════════════════════════════════ */

import { t, getLang } from './i18n.js';
import { searchProducts, formatPrice, typeByKey } from './products.js';

export function initSearch() {
  const overlay = document.createElement('div');
  overlay.id = 'searchOverlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.style.visibility = 'hidden';
  overlay.innerHTML = `
    <button class="mm-close" aria-label="Close search">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
    </button>
    <div class="so-inner">
      <label class="so-field">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.2" stroke="currentColor" stroke-width="1.4"/><path d="m15.2 15.2 4.6 4.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        <input id="soInput" type="search" autocomplete="off" data-i18n-ph="com.searchPh" placeholder="Search hoodies, tees, colours, collections…" aria-label="Search">
      </label>
      <ul id="soResults"></ul>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#soInput');
  const list = overlay.querySelector('#soResults');

  const open = () => {
    overlay.style.visibility = '';
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
    setTimeout(() => input.focus(), 140);
  };
  const close = () => {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
    setTimeout(() => {
      if (!overlay.classList.contains('is-open')) overlay.style.visibility = 'hidden';
    }, 500);
  };

  overlay.querySelector('.mm-close').addEventListener('click', close);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });
  document.querySelectorAll('.search-btn').forEach((b) => b.addEventListener('click', open));

  const render = () => {
    const L = getLang();
    const q = input.value;
    const results = searchProducts(q).slice(0, 8);
    if (results.length) {
      list.innerHTML = results.map((p) => {
        const type = typeByKey(p.type);
        return `
        <li><a href="product.html?p=${p.slug}">
          <img src="${p.cards[0]}" alt="" loading="lazy">
          <span class="so-main">
            <span class="so-name">${p.name[L]}</span>
            <span class="so-type">${type ? type.name[L] : ''}</span>
          </span>
          <span class="so-price">${formatPrice(p.price)}</span>
        </a></li>`;
      }).join('');
    } else if (q.trim().length >= 2) {
      list.innerHTML = `<li class="so-none">${t('com.noResults')}</li>`;
    } else {
      list.innerHTML = '';
    }
  };
  input.addEventListener('input', render);
  /* refresh open results when the language flips */
  document.querySelectorAll('.lang-btn').forEach((b) => b.addEventListener('click', () => {
    if (overlay.classList.contains('is-open')) render();
  }));
}
