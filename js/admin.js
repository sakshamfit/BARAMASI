/* ═══════════════════════════════════════════════
   BARAMASI — /admin dashboard.
   Add / edit / delete products and upload photos.
   Writes are authorized by Supabase Row Level Security
   (only the signed-in admin) — see supabase/init.sql.
   Photos are compressed in the browser before upload,
   and replaced / deleted photos are removed from the
   bucket so storage never grows with stale files.
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

/* a new product must never silently reuse (and overwrite) an existing id */
function uniqueId(base) {
  const taken = new Set(products.map((p) => p.id));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

function fmtPrice(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

/* ── status + helpers ── */
function setStatus(msg, ok) {
  const el = $('formStatus');
  el.textContent = msg || '';
  /* ok === true → green · ok === false (or a plain one-arg message) → red ·
     ok === null → neutral progress note (compressing / uploading …) */
  let cls = 'adm-status';
  if (ok === true) cls += ' ok';
  else if (ok === false || (ok === undefined && msg)) cls += ' err';
  el.className = cls;
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
        ${p.image_url ? `<img src="${esc(p.image_url)}" alt="${esc(p.name_en)}" loading="lazy" onerror="this.style.visibility='hidden'">` : ''}
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
    // best-effort: remove every uploaded photo for this product — the current
    // one plus any orphans left behind by earlier edits
    await removeProductPhotos(id, [p.image_url, p.card_url]);
    products = products.filter((x) => x.id !== id);
    if (editingId === id) resetForm();
    renderList();
    setStatus('Deleted.', true);
  } catch (e) {
    setStatus('Delete failed: ' + (e.message || e));
  }
}

/* ── image pipeline ──
   Every photo is stored as ONE compressed JPEG (long edge ≤ 1600px,
   quality 0.82, plain `<timestamp>.jpg` name), so that:
   · storage stays small — a 4–5 MB phone photo becomes ~200–400 KB;
   · every browser can display it — including iPhone HEIC shots, which
     <img> cannot render and were the classic “stored but not showing” case;
   · filenames never contain spaces or odd characters that break URLs. */

const MAX_EDGE = 1600;          /* px on the long edge after compression */
const JPEG_QUALITY = 0.82;
const MAX_ORIGINAL_MB = 20;     /* originals may be big — we shrink them */
const DISPLAYABLE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'heic', 'heif'];

function fmtSize(bytes) {
  if (bytes == null) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function isHeic(file) {
  const t = String(file.type || '').toLowerCase();
  const n = String(file.name || '').toLowerCase();
  return t.includes('heic') || t.includes('heif') || n.endsWith('.heic') || n.endsWith('.heif');
}

function looksLikeImage(file) {
  /* some browsers report an empty MIME type for HEIC — accept by extension too */
  if (file.type && file.type.startsWith('image/')) return true;
  const ext = String(file.name || '').split('.').pop().toLowerCase();
  return DISPLAYABLE_EXTS.includes(ext);
}

/* lazy-load the HEIC converter only when an iPhone photo actually arrives */
let heicLoader = null;
function ensureHeic2Any() {
  if (window.heic2any) return Promise.resolve();
  if (!heicLoader) {
    heicLoader = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Could not load the iPhone-photo converter — check your connection and try again.'));
      document.head.appendChild(s);
    });
  }
  return heicLoader;
}

async function decodeImage(file) {
  if (typeof createImageBitmap === 'function') {
    try { return await createImageBitmap(file); } catch { /* fall through to <img> */ }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('decode'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToJpeg(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Photo compression failed in this browser.'))),
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
}

async function compressImage(file) {
  let src = file;
  if (isHeic(file)) {
    setStatus('Converting iPhone photo (HEIC → JPG)…', null);
    await ensureHeic2Any();
    const out = await window.heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
    const first = Array.isArray(out) ? out[0] : out;
    src = new File([first], String(file.name).replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
  }
  let bmp;
  try {
    bmp = await decodeImage(src);
  } catch {
    throw new Error('Could not read that image — please try a JPG or PNG.');
  }
  const w = bmp.width || bmp.naturalWidth || 0;
  const h = bmp.height || bmp.naturalHeight || 0;
  if (!w || !h) throw new Error('Could not read that image — please try a JPG or PNG.');
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';   /* JPEG has no transparency — flatten onto white */
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  if (bmp.close) { try { bmp.close(); } catch { /* noop */ } }
  const blob = await canvasToJpeg(canvas);
  return { blob, original: file.size, compressed: blob.size };
}

/* storage path (e.g. "hoodie-01/17123456.jpg") recovered from a public URL */
function storagePathFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const marker = '/product-images/';
  const i = url.indexOf(marker);
  if (i < 0) return null;
  const raw = url.slice(i + marker.length).split('?')[0];
  if (!raw) return null;
  try { return decodeURIComponent(raw); } catch { return raw; }
}

async function publicUrlFor(path) {
  const c = await getClient();
  const { data } = c.storage.from('product-images').getPublicUrl(path);
  if (data && data.publicUrl) return data.publicUrl;
  /* unreachable in practice — a correctly-encoded manual fallback */
  return `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/product-images/` +
    path.split('/').map(encodeURIComponent).join('/');
}

/* proves the photo is publicly visible — exactly what the storefront sees */
function verifyPublicImage(url) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (ok) => { if (!done) { done = true; resolve(ok); } };
    const img = new Image();
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = url;
    setTimeout(() => finish(false), 12000);
  });
}

/* ── upload ── */
async function uploadPhoto(file, id) {
  setStatus('Compressing photo…', null);
  const { blob, original, compressed } = await compressImage(file);
  const path = `${id}/${Date.now()}.jpg`;
  setStatus(`Uploading photo (${fmtSize(original)} → ${fmtSize(compressed)})…`, null);
  const c = await getClient();
  const { error } = await c.storage.from('product-images').upload(path, blob, {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
    upsert: true,
  });
  if (error) throw error;
  const url = await publicUrlFor(path);
  setStatus('Checking the photo shows on the store…', null);
  if (!(await verifyPublicImage(url))) {
    /* don't leave an invisible orphan behind */
    try { await c.storage.from('product-images').remove([path]); } catch { /* noop */ }
    throw new Error('Photo uploaded but is NOT publicly visible — the “product-images” bucket is probably private. Run supabase/fix-images.sql in the Supabase SQL editor, then try again.');
  }
  return { url, path, original, compressed };
}

/* delete every stored photo for a product except `keepPath`
   (the previous photo + orphans from earlier edits) — best-effort */
async function cleanupOldPhotos(id, keepPath, oldUrls = []) {
  try {
    const c = await getClient();
    const stale = new Set();
    for (const u of oldUrls) {
      const p = storagePathFromUrl(u);
      if (p && p !== keepPath) stale.add(p);
    }
    const { data: listed } = await c.storage.from('product-images').list(id, { limit: 100 });
    if (Array.isArray(listed)) {
      for (const f of listed) {
        const p = `${id}/${f.name}`;
        if (p !== keepPath) stale.add(p);
      }
    }
    if (stale.size) await c.storage.from('product-images').remove([...stale]);
  } catch (e) {
    console.warn('BARAMASI: old-photo cleanup skipped:', e);
  }
}

/* delete ALL stored photos for a product (used when the product is deleted) */
async function removeProductPhotos(id, urls = []) {
  try {
    const c = await getClient();
    const paths = new Set();
    for (const u of urls) {
      const p = storagePathFromUrl(u);
      if (p) paths.add(p);
    }
    const { data: listed } = await c.storage.from('product-images').list(id, { limit: 100 });
    if (Array.isArray(listed)) for (const f of listed) paths.add(`${id}/${f.name}`);
    if (paths.size) await c.storage.from('product-images').remove([...paths]);
  } catch (e) {
    console.warn('BARAMASI: photo removal skipped:', e);
  }
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
    if (!looksLikeImage(file)) return setStatus('Please choose an image file (JPG / PNG / HEIC).');
    if (file.size > MAX_ORIGINAL_MB * 1024 * 1024) return setStatus(`That photo is over ${MAX_ORIGINAL_MB} MB — please pick a smaller one.`);
  }
  if (!editingId && !file) return setStatus('Please add a photo for the new product.');

  const btn = $('saveBtn');
  btn.disabled = true;
  btn.textContent = 'Saving…';
  setStatus('');

  try {
    const c = await getClient();
    const id = editingId || uniqueId(slugify(nameEn));
    const prev = editingId ? products.find((p) => p.id === editingId) : null;
    const oldUrls = prev ? [prev.image_url, prev.card_url] : [];
    let image_url = prev?.image_url || null;
    let newPath = null;
    let savings = '';

    if (file) {
      const up = await uploadPhoto(file, id);
      image_url = up.url;
      newPath = up.path;
      savings = ` Photo ${fmtSize(up.original)} → ${fmtSize(up.compressed)}.`;
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

    /* the new photo is live — now delete the old one(s) so storage never grows */
    if (newPath) await cleanupOldPhotos(id, newPath, oldUrls);

    await loadProducts();
    resetForm();
    setStatus('Saved — live on the storefront now.' + savings, true);
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
