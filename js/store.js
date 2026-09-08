/* ═══════════════════════════════════════════════
   store — client-side commerce state (prototype).
   Cart, wishlist, session, saved address, orders —
   all persisted in localStorage so nothing is lost
   across pages or login. Structured so a real
   backend can replace each call later.
   ═══════════════════════════════════════════════ */

const K = {
  cart: 'baramasi-cart',
  wishlist: 'baramasi-wishlist',
  users: 'baramasi-users',
  session: 'baramasi-session',
  address: 'baramasi-address',
  orders: 'baramasi-orders',
};

function read(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v == null ? fallback : v;
  } catch { return fallback; }
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
  document.dispatchEvent(new CustomEvent('store:change'));
}

/* ── cart ── */

export function getCart() { return read(K.cart, []); }

export function cartCount() {
  return getCart().reduce((n, i) => n + i.qty, 0);
}

export function addToCart(id, qty = 1) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (item) item.qty = Math.min(item.qty + qty, 10);
  else cart.push({ id, qty });
  write(K.cart, cart);
}

export function setQty(id, qty) {
  let cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, Math.min(qty, 10));
  write(K.cart, cart);
}

export function removeFromCart(id) {
  write(K.cart, getCart().filter((i) => i.id !== id));
}

export function clearCart() { write(K.cart, []); }

/* ── wishlist ── */

export function getWishlist() { return read(K.wishlist, []); }

export function inWishlist(id) { return getWishlist().includes(id); }

export function toggleWishlist(id) {
  const list = getWishlist();
  const i = list.indexOf(id);
  if (i >= 0) list.splice(i, 1);
  else list.push(id);
  write(K.wishlist, list);
  return i < 0;
}

/* ── accounts (simple prototype auth — swap for a real service later) ── */

async function hash(text) {
  const data = new TextEncoder().encode('baramasi·' + text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function signUp(email, password) {
  const users = read(K.users, {});
  const key = email.trim().toLowerCase();
  if (users[key]) return { ok: false, reason: 'exists' };
  users[key] = { hash: await hash(password), created: Date.now() };
  write(K.users, users);
  write(K.session, { email: key });
  return { ok: true };
}

export async function logIn(email, password) {
  const users = read(K.users, {});
  const key = email.trim().toLowerCase();
  const user = users[key];
  if (!user || user.hash !== await hash(password)) return { ok: false };
  write(K.session, { email: key });
  return { ok: true };
}

export function logOut() { write(K.session, null); }

export function currentUser() {
  const s = read(K.session, null);
  return s && s.email ? s.email : null;
}

/* ── saved address ── */

export function getAddress() { return read(K.address, null); }
export function saveAddress(addr) { write(K.address, addr); }

/* ── delivery area (configurable — add cities here later) ── */

export const DELIVERY = {
  state: 'bihar',
  cities: ['bettiah'],
  pinPattern: /^845\d{3}$/,
};

export function deliverable(addr) {
  const city = (addr.city || '').trim().toLowerCase();
  const state = (addr.state || '').trim().toLowerCase();
  const pin = (addr.pincode || '').trim();
  return DELIVERY.cities.some((c) => city.includes(c)) &&
    state.includes(DELIVERY.state) &&
    DELIVERY.pinPattern.test(pin);
}

/* ── orders (test orders — no payment is collected) ── */

export function getOrders() { return read(K.orders, []); }

export function placeOrder(items, total, address) {
  const number = 'BRS-' + Date.now().toString(36).toUpperCase();
  const orders = getOrders();
  orders.unshift({
    number, items, total, address,
    email: currentUser(),
    date: new Date().toISOString(),
    status: 'placed-test',        /* payment integration pending */
  });
  write(K.orders, orders);
  clearCart();
  return number;
}

export function orderByNumber(n) {
  return getOrders().find((o) => o.number === n) || null;
}

/* ── header badge sync ── */

export function syncBadges() {
  document.querySelectorAll('.cart-count').forEach((el) => {
    el.textContent = String(cartCount());
  });
  document.querySelectorAll('.wish-count').forEach((el) => {
    const n = getWishlist().length;
    el.textContent = String(n);
    el.style.display = n ? '' : 'none';
  });
}

document.addEventListener('store:change', syncBadges);
