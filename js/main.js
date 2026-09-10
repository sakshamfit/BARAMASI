/* ═══════════════════════════════════════════════
   BARAMASI — entry point
   ═══════════════════════════════════════════════ */

import { startIntro } from './intro.js';
import { initI18n } from './i18n.js';
import { initHeroFit } from './herofit.js';
import { renderSection2, initSection2 } from './section2.js';
import { renderSection3, initSection3 } from './section3.js';
import { renderSection4, initSection4 } from './section4.js';
import { renderSection5, initSection5 } from './section5.js';
import { initContactSection } from './contact.js';
import { initSmoothScroll, armRevealWatchdog } from './scroll.js';
import { syncBadges } from './store.js';
import { initSearch } from './search.js';
import { trackPage } from './trail.js';
import { initLandingLive } from './landing-live.js';

/* session flags (private-mode safe) */
function ssGet(key) { try { return sessionStorage.getItem(key); } catch { return null; } }
function ssSet(key, value) { try { sessionStorage.setItem(key, value); } catch { /* private mode */ } }

function navigationType() {
  const e = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  return e ? e.type : 'navigate';
}

function boot() {
  /* `?static` renders every section settled — a review aid that reuses the
     reduced-motion paths */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || new URLSearchParams(location.search).has('static');

  /* the cinematic intro belongs to the initial entry (or a full refresh) —
     coming back from an internal page or via the Back button lands on the
     settled site immediately, exactly where the visitor left it */
  const navType = navigationType();
  const returning = ssGet('baramasi-intro-seen') === '1' && navType !== 'reload';
  ssSet('baramasi-intro-seen', '1');

  /* a refresh always initializes the HOMEPAGE: strip any section hash
     (e.g. #contact left by earlier navigation) so the site opens on the
     hero, not mid-page. Real navigations that carry a hash — the
     contact.html stub, nav links from commerce pages, Back into a
     #contact history entry — keep their hash and still scroll there. */
  if (navType === 'reload' && location.hash) {
    history.replaceState(null, '', location.pathname + location.search);
  }
  trackPage();

  const settled = reduced || returning;   /* sections render complete, no re-entrances */

  renderSection2();
  renderSection3();
  renderSection4();
  renderSection5();
  initI18n();      /* stored language applies before the reveal */
  initHeroFit();   /* the hero display never wraps into the subline */
  initSmoothScroll(reduced, !returning);
  initSection2(settled);
  initSection3(settled);
  initSection4(settled);
  initSection5(settled);
  initContactSection(settled);
  startIntro(returning && !reduced);
  if (!settled) armRevealWatchdog();

  /* browser Back into the landing page: restore where the visitor was */
  if (returning && navType === 'back_forward' && !location.hash) {
    const y = parseFloat(ssGet('baramasi-index-scroll') || '0');
    if (y > 0) {
      const jump = () => {
        if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo(0, y);
      };
      jump();
      setTimeout(jump, 80);   /* after ScrollTrigger's refresh settles layout */
    }
  }
  window.addEventListener('pagehide', () => {
    ssSet('baramasi-index-scroll', String(Math.round(window.scrollY)));
  });

  initNavigation();
  initMobileMenu();
  initHeaderState();
  initSearch();
  initLandingLive();   /* live catalogue → landing photos + search (static art stays offline) */
  syncBadges();

  /* returning via the browser back button restores this page from the
     back-forward cache — refresh the bag/wishlist badges and close overlays */
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) closeMenu();
    syncBadges();
  });
}

/* ── one navigation system: every in-page destination scrolls smoothly ── */

function scrollToTarget(sel, immediate = false) {
  const target = document.querySelector(sel);
  if (!target) return;
  if (window.__lenis) {
    window.__lenis.scrollTo(target, immediate
      ? { immediate: true, force: true }
      : { duration: 1.5 });
  } else {
    target.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
  }
  /* if smooth scrolling ever stalls (throttled frames), land instantly */
  setTimeout(() => {
    const r = target.getBoundingClientRect();
    if (Math.abs(r.top) > window.innerHeight) target.scrollIntoView();
  }, 1700);
}

function initNavigation() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-goto], .nav-link[href^="#"], .mm-link[href^="#"]');
    if (!link) return;
    const sel = link.dataset.goto || link.getAttribute('href');
    if (!sel || !sel.startsWith('#') || !document.querySelector(sel)) return;
    e.preventDefault();
    closeMenu();
    /* each section visit is a real history step, so browser Back walks
       Contact → Homepage naturally (Home itself records a clean URL) */
    const nextHash = sel === '#hero' ? '' : sel;
    if (nextHash !== location.hash) {
      history.pushState(null, '', nextHash || location.pathname + location.search);
    }
    scrollToTarget(sel);
  });

  /* browser Back/Forward between section entries scrolls to the right place */
  window.addEventListener('popstate', () => {
    if (!(window.__introState && window.__introState() === 'done')) return;
    const sel = location.hash && document.querySelector(location.hash) ? location.hash : '#hero';
    scrollToTarget(sel);
  });

  /* arriving with a hash (e.g. the old contact.html redirect) */
  if (location.hash && document.querySelector(location.hash)) {
    const toHash = setInterval(() => {
      if (window.__introState && window.__introState() === 'done') {
        clearInterval(toHash);
        scrollToTarget(location.hash, true);
      }
    }, 400);
  }
}

/* ── mobile menu ── */

let menuOpen = false;

function openMenu() {
  if (menuOpen) return;
  menuOpen = true;
  const menu = document.getElementById('mobileMenu');
  document.body.classList.add('menu-open');
  if (window.__lenis) window.__lenis.stop();
  menu.style.visibility = '';
  menu.classList.add('is-open');          /* CSS drives the choreography */
  menu.setAttribute('aria-hidden', 'false');
}

function closeMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  const menu = document.getElementById('mobileMenu');
  document.body.classList.remove('menu-open');
  if (window.__lenis && window.__introState && window.__introState() === 'done') {
    window.__lenis.start();
  }
  menu.classList.remove('is-open');
  menu.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    if (!menuOpen) menu.style.visibility = 'hidden';
  }, 500);
}

function initMobileMenu() {
  document.querySelectorAll('.menu-btn').forEach((b) =>
    b.addEventListener('click', openMenu));
  document.querySelector('.mm-close').addEventListener('click', closeMenu);
  /* menu links that leave the page (Bag / Wishlist / Account) */
  document.querySelectorAll('.mm-link:not([href^="#"])').forEach((a) =>
    a.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ── header: light state once the dark hero scrolls away ── */

function initHeaderState() {
  const check = () => {
    document.body.classList.toggle('past-hero',
      window.scrollY > window.innerHeight * 0.82);
  };
  window.addEventListener('scroll', check, { passive: true });
  setInterval(check, 600);   /* belt for programmatic jumps */
  check();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
