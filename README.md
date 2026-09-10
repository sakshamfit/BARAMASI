# BARAMASI — बारामासी (was: SIAARA — By S&A)

**BARAMASI-branded reskin of the SIAARA template.** The complete original
SIAARA design, animations, layout and commerce flow are kept as-is; all
*brand data* was swapped to BARAMASI — the real clothing store at
**RG57+WJ4, Sant Kabir Rd, Naveen Colony, Banuchhapar, Bettiah, Bihar 845438**
(name, address, hours "Open · Closes 9:30 PM", Google rating 4.3 ★ from 6
reviews, and the three supplied hoodie photographs `HOODIE / 01–03`).
Second site language is now **Hindi** (हिन्दी) instead of Telugu.

Data sources / files you will edit when real stock arrives:

- `js/products.js` — the 33-piece photographed catalogue (9 categories — hoodies, sweats, tees, shirts, jackets, co-ord sets, joggers, trousers, shorts).
  This is now the **offline fallback snapshot**; the live catalogue is the
  Supabase `products` table (see “Admin & live catalogue” below).
  Prices are placeholders (`priceConfirmed:false`) — the product page shows
  an "indicative price, confirmed at the store" note. Three HOODIE records
  use the store's real supplied photography; all other product photos are
  generic AI-generated fashion imagery to be swapped for the shop's own
  photos when they exist (keep the `assets/products/<id>/01.jpg` +
  `01-card.jpg` naming).
- `js/i18n.js` — every visible string, English + Hindi.
- `js/contact.js` + `index.html` contact section — real listing facts.
- `js/store.js` — client-side cart/orders prototype (delivery area: Bettiah,
  `845xxx` pincodes; orders prefixed `BRS-`). No payment is collected.

To revert to the original SIAARA build: `git checkout -- .` (the SIAARA
commit is the repo's first commit `32a276e`).

Premium clothing store website (static: HTML/CSS/JS, no build step).

## Admin & live catalogue (Supabase)

The storefront can now read its product catalogue **live from Supabase**, so
the owner can add / edit / delete products — photos, names, prices,
descriptions and stock — from a private `/admin` page, no code or redeploy.

**How it works:** the site still ships with the bundled 33-product snapshot
(`js/products.js`) as an offline fallback. On every page it quietly fetches
the live `products` table; when that succeeds, the live data becomes the
single source of truth. Writes are guarded by Supabase **Row Level Security**
(only the signed-in admin can change rows or upload photos) — there is no
server, so no secret keys ever reach the browser.

### One-time setup

1. **Create a free Supabase project** at https://supabase.com.
2. **Create the schema** — Dashboard → SQL editor → New query → paste
   `supabase/init.sql` → Run. This makes the `products` table, the
   `product-images` storage bucket, and the read/write security policies.
3. **Seed the catalogue** — paste `supabase/seed.sql` → Run (33 products,
   matching the bundled snapshot). Or, if you prefer a script:
   `SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node tools/seed.mjs`.
4. **Add the two public values** to `js/config.js` (find them under
   Dashboard → Settings → API):
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_ANON_KEY` = `anon` / public key
   Never put the `service_role` key in `js/config.js`.
5. **Create the admin login** — open `/admin/login.html` and use
   *“Create the admin account”* (confirm via the email Supabase sends), or
   add the user in Dashboard → Authentication → Users → Add user (tick
   *Auto Confirm User*). Then sign in.
6. **Recommended** — turn off self sign-up so only you can register:
   Authentication → Providers → Email → *Allow new users to sign up* → OFF.

That's it. `/admin` now lists, edits and deletes products and uploads photos
straight to the `product-images` bucket; every change reflects on the public
storefront immediately (no redeploy).

### Photo uploads — compression & cleanup

Every photo is processed in the browser **before** upload:

- **Compressed** to a single JPEG (long edge ≤ 1600px, quality 0.82), so a
  4–5 MB phone photo is stored as ~200–400 KB.
- **Converted** automatically — iPhone HEIC shots become JPGs, because
  browsers can't display HEIC (this was the classic “stored but not showing”
  case).
- **Verified** — after upload, the dashboard checks the public URL actually
  loads, exactly as the storefront sees it.
- **Old photos deleted** — every edit removes the previous photo (plus any
  orphans from earlier edits), and deleting a product removes all of its
  photos. Storage never grows with stale files.

### Troubleshooting — photos upload but don't show on the store

1. Re-run `supabase/init.sql` (or just `supabase/fix-images.sql`) in the
   Supabase SQL editor — this forces the `product-images` bucket back to
   **public** and recreates the read policies. A private bucket is the most
   common cause: uploads succeed (you're signed in) but visitors can't read
   the files.
2. If the dashboard itself reports *“NOT publicly visible”* right after an
   upload, it's the same bucket issue — step 1 fixes it.
3. Hard-refresh the store page once (`Ctrl+Shift+R`) to drop any cached page
   data.

For the variable names used by a server-based deploy (e.g. if you later move
to Next.js on Vercel), see `.env.local.example`.

## Run locally

```sh
python tools/serve.py
```

then open http://localhost:4174.
The dev server sends `Cache-Control: no-store` so edited modules always reach the browser.


## Deploy

The site is fully static (no build step, no server code) — any static
host serves it as-is. For **GitHub Pages**: repo → Settings → Pages →
"Deploy from a branch" → branch `main`, folder `/ (root)` → Save.
The site then lives at `https://<user>.github.io/siaara/`. Every asset
and link is relative, so the subpath just works. `tools/serve.py` is
only for local development. (The original SIAARA-era photography still
sits in its old folders inside the repo — nothing references it in the
BARAMASI build; delete it when you want the tree lean.)

## Structure

```
index.html            page shell — live hero + intro
css/
  base.css            brand color tokens (sampled from references), reset
  intro.css           opening experience styles
  hero.css            live hero: header, nav, copy, CTA, features, side text,
                      script, scroll cue — positions derived from the 1600×900
                      reference measurements
js/
  main.js             entry point (renders section 2, boots i18n, scroll, intro)
  intro.js            autoplay choreography (GSAP): arrival → silk → staggered
                      hero reveal → soft header emergence → logo docks into the
                      live header (then scrolls with the hero)
  fabric.js           raw WebGL silk drape (vertex ripples + sheen shading,
                      premultiplied compositing)
  i18n.js             हिन्दी/English dictionary + crossfade switching
                      (persisted in localStorage; brand marks stay English)
  scroll.js           Lenis smooth scroll + ScrollTrigger wiring; locked during
                      the intro, released when the hero settles
  section2.js         New Arrivals data (COLLECTIONS), card rendering, the
                      scroll-triggered editorial reveal, pagination
  vendor/             gsap.min.js · ScrollTrigger.min.js · lenis.min.js
assets/img/
  hero-clean.jpg      BARAMASI store-film still, 1600×900, clean of baked-in UI
  logo.svg            round बारामासी / BARAMASI / Bettiah emblem
  fabric-tex.png      tall silk texture, gold hems at both ends (design motif)
  florals/            chroma-keyed sprites for the intro (design motif)
tools/
  serve.py            no-cache dev server
  rebuild-fabric-texture.py   regenerates fabric-tex from a fabric photo
```

## Build diary (original SIAARA template)

Everything below this line is the unedited build diary of the original
SIAARA template — it documents how the design was constructed, its saree-era
assets and its Hyderabad/Telugu data. The BARAMASI data layer at the top of
this file supersedes every brand/product/contact reference the diary makes.

## Stage 1+2 — Intro & Hero (complete)

Fully automatic sequence: cream screen → circular logo materializes (blur +
ring draw) → florals drift in → the circle expands on its own → silk sweeps in
from the top right (WebGL cloth) → the hero forms behind it → the silk falls
away and the live header, headline, copy, CTA, features, and floor elements
rise in the wake of the hem → the same logo rolls continuously into the header.

- Hero is fully live HTML: real typography (Cormorant / Jost / Great Vibes /
  Noto Serif Telugu), SVG swash under the display word, CTA with hover motion.
- Stage-3 header: single couture tier — logo on the left rail, tracked
  small-caps nav centered, right utility cluster (language switch · search ·
  account · bag · count), and a fading hairline that ties it to the scene.
  It emerges softly (opacity + minimal y) after the hero copy begins.
- "The Siaara Signature" block: overline + fading rule + three left-aligned
  grid columns (no borders, no cards) — the collection statement.
- తెలుగు/English switch in the header: crossfades all copy in place with no
  layout jump (the display box height is language-invariant); choice persists;
  brand marks (logo, tagline, script signature) intentionally stay English.
- Copy was rewritten premium while preserving the reference's meaning,
  hierarchy and length (see js/i18n.js for both languages).
- Replays on every load; `prefers-reduced-motion` gets a quiet, complete hero.
- Measured locked 60 fps through the whole sequence.

## Stage 4 — Section 2: New Arrivals / colour collection (complete)

Full-viewport editorial spread after the hero, rebuilt live from
`section 2 refrence.jpg`: left introduction (eyebrow, heading, supporting
copy, maroon CTA, stacked ethos), four flush image columns
(Pink → Orange → Purple → Yellow) with colour labels, descriptions and
SHOP NOW links, gold line-art florals, leaf-shadow dapples, maroon corner
arcs with gold trim, top-right brand statement, and a working 01—04
pagination (desktop: focus cycling; narrow screens: snap carousel).
Scroll-triggered reveal: text settles first, then each image is unveiled
upward through a clip mask with a small stagger, captions follow, the
section becomes still. Fully translated (తెలుగు/English).

Card spotlight (stage 5): hover previews a collection (gentle lift, image
forward, hairline passe-partout, label + SHOP NOW respond); click/tap
selects it (`.is-active` — stronger lift, full accent, siblings quiet,
pagination follows); re-tap releases. The spotlight crossfades smoothly
between cards on one shared easing. Keyboard: cards are focusable,
Enter/Space selects. The system is CSS-class-driven and armed only after
the entrance settles, so the scroll choreography stays untouched.

## Stage 6 — Section 3: Sarees by Origin (complete)

Five-collection editorial wall from `section 3 refrence image.jpg`:
centered header (ornament, ruled eyebrow, heading, support line), top-right
statement, five full-height cards (Tulip Hand-Painted / Kota Doria /
Mangalagiri / Lotus Embroidery / Partywear) with captions integrated on the
photography (maroon on light cards, cream on dark, tone-aware scrims),
EXPLORE with circled arrows, blossom + gold-leaf decor, bottom legacy
statement. Same scroll reveal grammar (background breathes in → title
settles → wall unfolds left to right through clip masks → captions →
statement), then the scene stays quietly alive (slow blossom/leaf drift).
The shared spotlight interaction (js/spotlight.js) carries over: hover
preview, tap/click select, siblings quiet, keyboard support. Fully
translated (తెలుగు/English).

## Stage 7 — Section 4: Shop by Color (complete)

Seven colour capsules (Red → Green → Yellow → Blue → Pink → Purple →
Neutrals, bleeding off the right edge as composed) on an organic height
rhythm, rebuilt live from the 1536×864 reference: left editorial block
(eyebrow, SHOP BY COLOR with its swash tail, divider, support line,
Explore CTA with solid maroon circle), "Shades of Heritage" statement,
lotus/leaf-shadow living decor, per-capsule names + emotional descriptors +
circled arrows, and a working bottom bar (1/7 progress fill, statement,
prev/next). Same reveal grammar; shared spotlight; progress follows the
selection. Fully translated. `?static` URL flag renders the whole site
settled (reuses the reduced-motion paths) — useful for review.

## Stage 8 — Global saree transitions (built, then removed on request)

A scroll-bound WebGL silk once swept each section seam (different colour
per seam). Removed at the brand's request on 2026-09-07 — sections now
flow into each other with plain scrolling. The dyed silk textures
(`fabric-{pink,orange,green,violet}.png`) and fabric.js multi-texture
support remain in the repo should the idea return.

## Stage 9 — Section 5: Best Sellers (complete)

Five arch-topped cards descending an editorial staircase (labels — number,
colour, italic descriptor — above each arch on the cream; all arch bottoms
on one line), rebuilt live from the 1600×900 reference. Left editorial:
"Our Most Loved" → serif "Best Sellers" → ornament divider → support copy →
Explore All CTA → the heirloom statement. "Loved by Generations" top-right,
brass-bowls and leaf-shadow living decor, SHOP NOW + rotating plus circle
on every card, ‹ 01 / 05 › counter pagination wired to the shared
spotlight. Same reveal grammar (each card rises into its own stepped
position). The section 4 → 5 seam sweeps a violet silk diagonally
(fabric-violet.png). Fully translated.

## Stage 13 — Mobile-first pass + global header

The header is now one fixed global system: transparent cream-on-dark over
the hero, flipping to maroon-on-light with a soft cream veil once the hero
scrolls away. On phones (≤1024px) it slims to logo · search · bag · menu,
and the menu opens a full-screen overlay (nav, language switch, Instagram)
with a CSS-driven staggered entrance. One navigation system: every nav
item and CTA scrolls to a real section (`data-goto`), with hash history
and a stall-proof fallback. Mobile composition tuned per section
(safe-area clearances under the fixed header, phone heading scales,
swipe rails with next-card peek for all 21 cards, ≥16px form inputs).
CTA destinations are interim (collections → nearest matching section)
until real product pages exist — re-point them via the `data-goto`
attributes. Verified at 430×932: no overflow, every card reachable,
Section-5 regression protocol passed, Telugu stable.

## Stage 12 — Section-5 stability fix + Contact integration

Root-caused and fixed the Best Sellers blank-out: the reveal's cleanup
(`clearProps:'all'`) was erasing the cards' inline `--step`/`--arch-h`
variables, collapsing the arches after the entrance. Cleanup now clears
only animated properties. Contact is integrated into `index.html` as the
final section (`#contact`) — no duplicate header or logo; the global hero
header remains the single navigation; nav "Contact" smooth-scrolls there;
`contact.html` is a redirect stub to `index.html#contact`. A violet silk
seam (js/transitions.js) bridges Best Sellers → Contact, scroll-bound and
reversible, per the brand's request.

## Stage 11 — Contact page (superseded by stage 12 integration)

Originally `contact.html` — its own document sharing the header (light-ground
variant with a cream veil for legibility), i18n, Lenis and the reveal grammar.
Hero (editorial copy + masked photo reveal of the two women) → info band
(circular-icon blocks: real email `siaarabysa@gmail.com` as a mailto link,
honest phone placeholder until a number exists, Jubilee Hills studio +
appointment note, Get Directions, Follow Us · @siaarabysa) → premium form
(labels, custom select, inline validation with elegant errors, submit =
prefilled email handoff — honest, no fake success; swap in a real handler
later in js/contact.js) → burgundy quote panel with the jasmine-bowl
imagery → Hyderabad location strip (Charminar photo, editorial center, map
panel with live pin + Open in Maps via a real Google Maps query). All
contact data lives in one BRAND config object. Fully translated, including
placeholders. The nav links index ↔ contact both ways.

## Stage 14 — Commerce foundation (shopping flow)

The brand site is now a usable shop. New architecture (all no-build ES
modules):

- `js/products.js` — the single product source of truth: 21 bilingual
  sarees (the four New-Arrival colours, five origins, seven Banarasi
  shades, five best sellers) with prices (placeholders awaiting real
  data), fabric/craft notes, search helpers and `formatPrice`.
- `js/store.js` — localStorage commerce state: cart, wishlist, prototype
  auth (SHA-256 hashed, structured to swap for a real backend), saved
  address, orders, and the configurable `DELIVERY` area (Hyderabad /
  Secunderabad, `50[01]xxx` pincodes) with `deliverable()`.
- `js/commerce.js` — shared engine: renders the same global header/menu
  on every commerce page, then boots the page named by
  `<body data-page>`; re-renders dynamic copy on a language switch.
- `js/search.js` — full-screen search overlay (index + commerce pages).
- `css/commerce.css` — commerce page styles + overlay/toast (linked by
  index too).
- Pages: `product.html?id=…` (gallery, meta, Add to Bag, wishlist,
  Buy Now, more-in-shade), `cart.html` (qty steppers, totals,
  Hyderabad note), `wishlist.html` (guest-allowed), `login.html` /
  `signup.html` (email + password only, `?next=` return flow),
  `checkout.html` (login-gated; address → review; rejects
  non-Hyderabad addresses with a clear message), `order.html?n=…`
  (confirmation), `account.html` (orders, saved address, logout).

Flow rules honoured: browsing/cart/wishlist need no login; checkout
redirects to login and returns with the cart intact; orders are stored
as `placed-test` and the review + confirmation say plainly that no
payment is collected (payment gateway pending). Landing wiring: header
bag/wishlist/account icons link to the real pages with live count
badges, the menu gained Bag/Wishlist/Account, and every card CTA
(SHOP NOW / EXPLORE / colour arrows) opens its saree's product page.
Verified end-to-end on desktop and 430×932, English and తెలుగు, plus
the Section-5 regression on both.

## Stage 15 — Real catalog from the brand's asset folders

The placeholder catalog is gone. The seven supplied folders (kota doria ·
lotus embroider · lotus sequin · mangalagiri sarees · partywear sarees ·
sunflower mul cotton · tulip mul cotton) were inspected file by file
(HEIC decoded, video frames sampled, the kota nine-colour range grid
mapped cell by cell) and classified into **25 real products**:

- Kota Doria — 9 colourways (rani pink, peach, lavender, pistachio,
  salmon, crimson, black, lemon-peacock, forest green). The 9s montage
  video (rani → pistachio → salmon → "DM to order" endcard) is used as
  the **collection film**, not attached to any single product; the 26s
  forest-green hanger video belongs to that product. Flat-lays were
  paired by border details (8458 no-zari → peach, 8459 → salmon,
  8460 gold-zari → crimson).
- Lotus Embroidery — 1 (pistachio, worn + flat + video)
- Lotus Sequin — 2 (navy w/ video + worn shot; teal)
- Tulip Mul Cotton — 2 (sky blue; sage w/ studio-arch video)
- Sunflower Mul Cotton — 3 (scarlet w/ 2 videos; sky; rose — the trio
  flat-lay is shared, as shot)
- Partywear — 5 (lime w/ video; navy; rose; sage; lilac)
- Mangalagiri — 3 (blush w/ mannequin + video; rose & fern; sky &
  sunshine). **₹3,400 comes from the brand's own video overlay** —
  the only confirmed price; every other price is a placeholder with
  `priceConfirmed:false` and an "indicative price" note on the page.

Pipeline (`assets/products/`): originals (257 MB) → web set (50 MB) —
JPEG 1600px + 700px card per image (EXIF-rotated, HEIC converted),
H.264 720p faststart videos (1.3–4.7 MB) with poster frames, kota grid
cell crops. Originals untouched.

New pages, all reading the one product system: `new-arrivals.html`
(colour + collection chips), `collections.html` (seven-type picker →
per-collection listing with blurb, colour chips, and the collection
film where one exists), `color.html` (swatch board — only colours that
truly exist, counts shown, cross-collection results), `best-sellers.html`
(provisional `bestSeller` flags — one flagship per collection; adjust in
js/products.js). Product page: full gallery (every image + video slides
with poster/tap-to-play, `preload=none`, no autoplay), swipe + dots +
thumbs, collection link, rating/review structure with an honest
"no reviews yet" empty state (no fabricated reviews), Buy Now →
checkout directly. Landing CTAs now open the real pages (colour cards →
filtered New Arrivals, origin cards → their collection, shade arrows →
colour results, best-seller cards → best sellers). Search covers name,
colour, type, and description in both languages. Verified end-to-end on
desktop and 430×932, English + తెలుగు; Section-5 regression intact.

**Still needed from the brand:** confirmed prices (all except
Mangalagiri), the real best-seller list, product names if the
descriptive ones should change, stock/availability policy, and review
data once orders begin.

## Stage 16 — Journey navigation + intro gating

Two behaviours now hold everywhere:

**The intro belongs to the entry, not to navigation.** A session flag
(`siaara-intro-seen`) plus the browser's navigation type decide the
landing page's boot: first visit and full refreshes play the cinematic;
any internal navigation (Home links, the Back button, browser
back/forward) lands on the settled hero instantly — sections rendered
complete, logo already docked. Returning via browser Back also restores
the exact scroll position the visitor left (saved on pagehide), so
Section 4 → product → Back puts them back on Section 4.

**A journey-aware ← Back button on every internal page** (all listings,
product, bag, wishlist, login/signup, checkout, account — the order
confirmation keeps its own Continue Shopping / View Orders instead).
A sessionStorage trail (js/trail.js) records the real in-site journey;
Back retraces it through true browser history — so filter choices are
history steps too (chips/swatches pushState): Shop by Color → Pink →
Back lands on unfiltered Shop by Color, and Product → Back lands on the
exact filtered list. On a direct entry (deep link, fresh tab) with no
journey behind it, Back steps up the hierarchy instead — Product →
its collection → Sarees by Origin → Landing — using location.replace so
no loops or dead ends. Back never clears the bag, and checkout's Back
returns to the bag. Verified journeys: A–G from the brief, including
the fresh-tab deep-link walk and refresh-replays-intro.

## Stage 17 — Landing covers vs product galleries

The data layer now separates the two image systems explicitly:

- **Landing/cover images** (`TYPES[].cover`, `COLOUR_COVERS` in
  js/products.js) — the brand's own curated entry visuals
  (`assets/img/origin/*`, `assets/img/shade/*`). They appear ONLY on
  first-level cards: the landing sections (unchanged), the Sarees-by-
  Origin picker, and the Shop-by-Colour picker. Never in product
  galleries.
- **Product galleries** (`images/cards/videos` per product) — from the
  uploaded folders, shown only after entering a collection.

Shop by Colour is now progressive: the page opens on the brand's shade
profile cards (with live counts); the cross-collection product grid
appears only after a shade is chosen, and Back steps from products →
shade → shade board → landing. Orange and Black have sarees but no
supplied profile image yet, so they render as elegant swatch tiles;
Lotus Sequin and Sunflower Mul Cotton likewise await their collection
cover images (currently falling back to a product photo). Neutrals has
a profile image but no products yet, so its card is held back.

Also fixed in passing: the desktop header collided with the utility
cluster at 1281–1600px once the wishlist icon joined it — the cluster
gap tightened at base and a ≤1460 nav-tracking step was added; the
header now clears at every width (probed 1285/1354/1465/1600/1920).

## Stage 18 — Product entrance animation (all listings)

One shared entrance for every product grid — New Arrivals, Sarees by
Origin collections, Shop by Colour, Best Sellers, and the "More from
This Collection" strip: cards begin slightly below their position at
zero opacity and rise into place on the site's signature curve
(cubic-bezier(0.22,1,0.36,1), 0.7s desktop / 0.55s + shorter travel on
phones), with a 45ms stagger (35ms mobile) capped so late cards never
make browsing feel slow. It plays once per render (page entry or a
filter change), never replays on scroll, and every product stays
visible permanently. Implementation is CSS-class-driven through the
one `renderGrid`/`enterCards` pair in js/commerce.js — base state is
the settled card, with timer failsafes that release and then flush the
transition (Web Animations cancel) so even a frozen/throttled tab can
never strand a card invisible. `prefers-reduced-motion` and `?static`
render settled immediately.

## Stage 19 — Whole cards are links

Every landing card that represents a collection is now itself the link
— "I see it → I tap it → I enter it":

- New Arrivals colour cards → that colour's New Arrivals
- Origin cards → their collection (Kota Doria card → Kota Doria page)
- Shade capsules → that colour's cross-collection page (Neutrals → the
  shade board until neutral sarees exist)
- Best Sellers arches → Best Sellers

All 21 cards carry `data-href` + `role="link"` + pointer cursor;
clicking anywhere on the card (image, text, arch) navigates, inner
CTAs keep working, and Enter/Space navigates from the keyboard. On
desktop the spotlight hover preview is unchanged; the old tap-to-select
gave way to tap-to-enter (pagination arrows still drive the visual
selection). On touch, cards give a quiet 0.985 press-scale (transition
scoped to :active only, so it can never fight the gsap entrance
transforms), tap-highlight silenced; a swipe on the mobile rails never
misfires as a tap (native click suppression). Back behaviour is
untouched: card-entry → Back returns to the landing context with no
intro replay. Section-5 arch geometry re-verified on both layouts.

## Stage 20 — Refresh always begins at the Hero

Root cause of the "refresh starts on Contact" bug: Contact is the final
section of index.html, and section navigation rewrote the URL to
`index.html#contact`; on reload, the hash-on-load handler scrolled
there after the intro. Fixed at the routing layer — no redirects:

- A **reload** strips any section hash before anything else runs, so a
  refresh always initializes Hero → Section 2 → 3 → 4 → 5 → Contact,
  with the intro playing per the established gate. Real navigations
  that carry a hash (the contact.html stub, Contact links from
  commerce pages, Back into a `#contact` history entry) still scroll
  to their section.
- Section navigation now uses **pushState** (each section visit is a
  real history entry; Home records a clean URL) with a popstate
  handler that scrolls to the current entry's section — so browser
  Back walks Contact → Homepage on the same document, and Forward
  returns.

All seven flow tests pass, plus a clean-load reveal walk on desktop
and mobile (every section's entrance completes in order, Contact
last), plus a full logged-out shopping run: landing card → collection
→ product → wishlist + bag → Buy Now → login gate (cart preserved) →
non-Hyderabad address rejected → Hyderabad accepted → review → test
order placed → account shows it.

## Asset provenance / pending upgrades

- `hero-clean.jpg` is the provided 1600×900 reference with baked text
  inpainted out — the resolution ceiling until the original high-res
  photograph is provided. Drop a larger plate in at the same path (any size,
  same composition) and everything adapts.
- `logo.png` is a 190px crop from the storyboard; swap in the real logo
  export (square, transparent) at the same path.
- `collection/{pink,orange,purple,yellow}.jpg` are 222–253×495 crops from
  the section-2 reference — placeholders only. They display at roughly 2×
  upscale on desktop and are NOT truly HD; replace with the original
  photographs (≥900px wide each, portrait) at the same paths.
- `origin/{tulip,kota,mangalagiri,lotus,partywear}.jpg` are ~315×629 crops
  from the section-3 reference (baked text inpainted out) — same status:
  placeholders awaiting the original photographs (≥900px wide, portrait)
  at the same paths.
- `shade/{red,green,yellow,blue,pink,purple,neutrals}.jpg` are ~111–161×
  514–554 crops from the section-4 reference (baked text inpainted out) —
  the lowest-resolution placeholders yet; original photographs (≥700px
  wide, portrait) drop in at the same paths.
- `best/{yellow,purple,pink,green,black}.jpg` are 207–295px-wide crops
  from the section-5 reference (clean — its labels sat on the cream) —
  placeholders awaiting originals (≥800px wide, portrait) at the same
  paths.
- `fabric-tex.png` rebuilds from a real silk photo via
  `tools/rebuild-fabric-texture.py`.

## Stage notes

- Desktop composition is calibrated against the reference at 16:9 (verified
  by DOM-geometry probes to within a few pixels).
- The mobile layout is a sane interim (stacked copy, nav hidden, icons kept)
  until the mobile hero reference arrives.
- Next stages per the brand's plan: sections below the hero, product cards,
  menu overlay, dedicated views.
