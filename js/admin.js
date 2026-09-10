/* ═══════════════════════════════════════════════
   BARAMASI — /admin dashboard.
   Add / edit / delete products and upload photos.
   Writes are authorized by Supabase Row Level Security
   (only the signed-in admin) — see supabase/init.sql.
   ═══════════════════════════════════════════════ */

import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_CONFIGURED } from './config.js';

/* ── constants mirroring js/products.js ── */
const CATEGORIES = [
  ['hoodies', 'Hoodies'], ['sweats', 'Sweatshirts'], ['tees', 'Tees'],
  ['shirts', 'Shirts'], ['jackets', 'Jackets'], ['coords', 'Co-ord Sets'],
  ['joggers', 'Joggers'], ['trousers', 'Trousers'], ['shorts', 'Shorts'],
];
const COLOURS = [
  ['red', 'Red', '#8E1F1C'], ['pink', 'Pink', '#D26A8C'], ['orange', 'Orange', '#DB7A4E'],
  ['yellow', 'Yellow', '#E4C34F'], ['green', 'Green', '#5F7C4E'], ['blue', 'Blue', '#33547F'],
  ['purple', 'Purple', '#8465A5'], ['black', 'Black', '#2A2126'], ['neutrals', 'Neutrals', '#CBB9A2'],
];

let supabase = null;
let products = [];
let editingId = null;

const $ = (id) => document.getElementById(id);

async function getClient() {
  if (supabase) return supabase;
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  return supabase;
}

function slugify(s) {
  return String(s || '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
    || 'item-' + Date.now().toString(36);
}

function fmtPrice(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

/* ── status + helpers ── */
function setStatus(msg, ok) {
  const el = $('formStatus');
  el.textContent = msg;
  el.className = 'adm-status ' + (ok ? 'ok' : 'err');
}

function resetForm() {
  editingId = null;
  $('productForm').reset();
  $('photoPreview').innerHTML = '';
  $('photoPreview').textContent = 'No photo';
  $('photo').value = '';
  $('formTitle').textContent = 'Add a product';
  $('formSub').textContent = 'Fill in the details, then save.';
  $('cancelBtn').hidden = true;
  $('saveBtn').textContent = 'Save product';
  $('priceConfirmed').checked = true;
  $('newArrival').checked = true;
  $('bestSeller').checked = false;
  $('type').value = 'hoodies';
  $('colour').value = 'neutrals';
  setStatus('');
}

/* ── photo preview ── */
function initPhotoPreview() {
  $('photo').addEventListener('change', () => {
    const file = $('photo').files[0];
    const thumb = $('photoPreview');
    if (!file) { thumb.innerHTML = ''; thumb.textContent = 'No photo'; return; }
    const url = URL.createObjectURL(file);
    thumb.innerHTML = `<img src="${url}" alt="preview">`;
  });
}

/* ── list rendering ── */
function renderList() {
  const host = $('productList');
  $('countLabel').textContent = products.length + ' item' + (products.length === 1 ? '' : 's');
  if (!products.length) {
    host.innerHTML = '<p class="adm-empty">No products yet — add your first one on the left.</p>';
    return;
  }
  host.innerHTML = products.map((p) => `
    <article class="adm-item" data-id="${p.id}">
      <div class="media">
        ${p.image_url ? `<img src="${p.image_url}" alt="${esc(p.name_en)}" loading="lazy">` : ''}
        <span class="badge">${esc(CATEGORIES.find((c) => c[0] === p.type)?.[1] || p.type)}</span>
      </div>
      <div class="body">
        <div class="name">${esc(p.name_en)}</div>
        <div class="price">${fmtPrice(p.price)}
          ${p.price_confirmed ? '' : '<s>indicative</s>'}
        </div>
        <div class="meta">Stock: ${p.stock == null ? 'unknown' : p.stock} · ${esc(p.colour)}</div>
        <div class="actions">
          <button class="adm-btn small" data-action="edit">Edit</button>
          <button class="adm-btn small danger" data-action="delete">Delete</button>
        </div>
      </div>
    </article>`).join('');

  host.querySelectorAll('[data-action="edit"]').forEach((b) =>
    b.addEventListener('click', () => editProduct(b.closest('.adm-item').dataset.id)));
  host.querySelectorAll('[data-action="delete"]').forEach((b) =>
    b.addEventListener('click', () => deleteProduct(b.closest('.adm-item').dataset.id)));
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ── data ── */
async function loadProducts() {
  const c = await getClient();
  const { data, error } = await c.from('products').select('*').order('created_at');
  if (error) throw error;
  products = data || [];
  renderList();
}

/* ── edit ── */
function editProduct(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  editingId = id;
  $('nameEn').value = p.name_en || '';
  $('nameHi').value = p.name_hi || '';
  $('descEn').value = p.desc_en || '';
  $('descHi').value = p.desc_hi || '';
  $('price').value = p.price;
  $('stock').value = p.stock == null ? '' : p.stock;
  $('type').value = p.type || 'hoodies';
  $('colour').value = p.colour || 'neutrals';
  $('priceConfirmed').checked = !!p.price_confirmed;
  $('newArrival').checked = p.new_arrival == null ? true : !!p.new_arrival;
  $('bestSeller').checked = !!p.best_seller;
  $('photo').value = '';
  $('photoPreview').innerHTML = p.image_url ? `<img src="${esc(p.image_url)}" alt="">` : '';
  $('formTitle').textContent = 'Edit product';
  $('formSub').textContent = 'Editing “' + (p.name_en || id) + '”.';
  $('cancelBtn').hidden = false;
  $('saveBtn').textContent = 'Save changes';
  setStatus('');
  $('productForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── delete ── */
async function deleteProduct(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  const ok = confirm(`Delete “${p.name_en}”? This cannot be undone.`);
  if (!ok) return;
  try {
    const c = await getClient();
    const { error } = await c.from('products').delete().eq('id', id);
    if (error) throw error;
    // best-effort: also remove the uploaded photo from the bucket
    if (p.image_url && p.image_url.includes('/product-images/')) {
      const path = p.image_url.split('/product-images/')[1];
      await c.storage.from('product-images').remove([path]);
    }
    products = products.filter((x) => x.id !== id);
    if (editingId === id) resetForm();
    renderList();
    setStatus('Deleted.', true);
  } catch (e) {
    setStatus('Delete failed: ' + (e.message || e));
  }
}

/* ── upload ── */
async function uploadPhoto(file, id) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${id}/${Date.now()}-${safe || 'photo.' + ext}`;
  const c = await getClient();
  const { error } = await c.storage.from('product-images').upload(path, file, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  });
  if (error) throw error;
  return `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/product-images/${path}`;
}

/* ── save ── */
async function saveProduct(e) {
  e.preventDefault();
  const nameEn = $('nameEn').value.trim();
  const price = Number($('price').value);

  if (!nameEn) return setStatus('Please enter a product name.');
  if (!Number.isFinite(price) || price <= 0) return setStatus('Price must be a positive number.');

  const file = $('photo').files[0];
  if (file) {
    if (!file.type.startsWith('image/')) return setStatus('Please choose an image file (JPG / PNG).');
    if (file.size > 5 * 1024 * 1024) return setStatus('Image must be under 5 MB.');
  }
  if (!editingId && !file) return setStatus('Please add a photo for the new product.');

  const btn = $('saveBtn');
  btn.disabled = true;
  btn.textContent = 'Saving…';
  setStatus('');

  try {
    const c = await getClient();
    const id = editingId || slugify(nameEn);
    let image_url = editingId ? (products.find((p) => p.id === editingId)?.image_url || null) : null;

    if (file) {
      image_url = await uploadPhoto(file, id);
    }

    const row = {
      id,
      type: $('type').value,
      colour: $('colour').value,
      name_en: nameEn,
      name_hi: $('nameHi').value.trim() || nameEn,
      desc_en: $('descEn').value.trim(),
      desc_hi: $('descHi').value.trim() || $('descEn').value.trim(),
      price,
      price_confirmed: $('priceConfirmed').checked,
      stock: $('stock').value === '' ? null : Number($('stock').value),
      image_url,
      card_url: image_url,
      best_seller: $('bestSeller').checked,
      new_arrival: $('newArrival').checked,
      availability: 'in-store',
    };

    const { error } = await c.from('products').upsert(row);
    if (error) throw error;

    await loadProducts();
    resetForm();
    setStatus('Saved — live on the storefront now.', true);
  } catch (err) {
    setStatus('Save failed: ' + (err.message || err));
  } finally {
    btn.disabled = false;
    btn.textContent = editingId ? 'Save changes' : 'Save product';
  }
}

/* ── boot ── */
function populateSelects() {
  $('type').innerHTML = CATEGORIES.map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
  $('colour').innerHTML = COLOURS.map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
}

async function boot() {
  populateSelects();
  initPhotoPreview();

  $('cancelBtn').addEventListener('click', resetForm);
  $('productForm').addEventListener('submit', saveProduct);

  $('logoutBtn').addEventListener('click', async () => {
    const c = await getClient();
    await c.auth.signOut();
    location.replace('login.html');
  });

  if (!SUPABASE_CONFIGURED) {
    $('productList').innerHTML =
      '<p class="adm-empty">Supabase is not configured yet — set js/config.js first (see README), then reload.</p>';
    $('saveBtn').disabled = true;
    return;
  }

  try {
    const c = await getClient();
    const { data: { session } } = await c.auth.getSession();
    if (!session) { location.replace('login.html'); return; }
    await loadProducts();
  } catch (e) {
    $('productList').innerHTML =
      '<p class="adm-empty">Could not reach Supabase: ' + esc(e.message || e) + '</p>';
    $('saveBtn').disabled = true;
  }
}

boot();
