# 📸 BARAMASI — Photo Upload Guide (for the store owner)

धन्यवाद! This is a simple, no-tech guide for getting your real photos onto the
website. You just send the photos — I slot every one of them in.

जो फ़ोटो आप भेजेंगे, उन्हें मैं वेबसाइट पर सही जगह लगा दूँगा — आपको कोई तकनीकी
काम नहीं करना है।

---

## 1. How to send the photos (फ़ोटो कैसे भेजें)

Pick **any one** of these — whichever is easiest for you:

1. **WhatsApp** — send photos to **+91 62043 93039** (the store's own number).
2. **Google Drive / Google Photos** — put everything in one folder/album and
   share the link (share → "Anyone with the link").
3. **Email / chat** — attach them anywhere you already talk to the person
   maintaining the site.

**One tip:** send each item with its name — e.g. a photo captioned
"Rust Oversized Hoodie" or "गुलाबी कुर्ता". That way I match the right photo to
the right product instantly.

---

## 1b. Or — the owner adds the photos directly (केवल मालिक खुद जोड़ सकते हैं)

If the owner wants to add photos himself (owner-only access — no developer in
between), the site supports that through GitHub's web page. It's drag-and-drop,
no code, and every photo goes live automatically after a minute or two.

1. The site maintainer shares the **BARAMASI GitHub repository link** with the
   owner, and the owner logs in with the owner's account (this is why it's
   owner-only — only that account can edit).
2. Open the folder the photo belongs to (paths below), click
   **"Add file" → "Upload files"**, and drag the photo in.
3. **Name it exactly as listed** (same filename = it replaces the old one).
4. Choose **"Commit directly to the `main` branch"** and press **Commit**.
   The live site updates itself automatically.

**Where each photo goes:**

| Photo | Drop it in this folder | Name it exactly |
|-------|------------------------|-----------------|
| Shop front | `assets/img/` | `hero-clean.jpg` |
| Logo | `assets/img/` | `logo.svg` (square, transparent) |
| A product's main photo | `assets/products/<item-id>/` | `01.jpg` |
| A product's square thumbnail | `assets/products/<item-id>/` | `01-card.jpg` |
| Collection covers | `assets/img/origin/` | `hoodies.jpg`, `sweats.jpg`, `tees.jpg`, `shirts.jpg`, `jackets.jpg` |
| Colour profile shots | `assets/img/shade/` | `red.jpg`, `pink.jpg`, `orange.jpg`, `yellow.jpg`, `green.jpg`, `blue.jpg`, `purple.jpg`, `black.jpg`, `neutrals.jpg` |

> The `<item-id>` is the code in the product list in section 4 (for example
> `hoodie-rust`, `tee-sun`, `trousers-linen`).

> If the owner only sends one photo per product (`01.jpg`), the square card
> crop (`01-card.jpg`) can be generated automatically — ask the maintainer.

---

## 2. How to take the photos (अच्छी फ़ोटो कैसे लें)

No fancy camera needed — a phone is perfect.

- **Daylight** — near a window or in soft daylight. Avoid the phone's flash.
- **Plain background** — a plain wall or a clean sheet behind the item.
- **Hold the phone straight** — not tilted, at the item's height.
- **Keep it sharp** — hold still for a second; no heavy filters.
- **Portrait (tall) photos** for clothes; **wide photos** for the shop front.

For each product, **one clear full photo is enough** (front view). Extra angles
(side, close-up of fabric) are a bonus.

---

## 3. What photos the site needs (किन-किन फ़ोटो की ज़रूरत है)

| # | What | Where it goes on the site | Size / shape |
|---|------|---------------------------|--------------|
| 1 | **Shop front** — wide, clean shot of the store | the big opening image (hero) | wide, ≥1600px |
| 2 | **Logo** — clear, square, plain/transparent | the round logo top-left | square |
| 3 | **Product photos** — one per item | each product page & card | tall/portrait, ≥900px |
| 4 | **Collection covers** — 5 mood shots (Hoodies, Sweatshirts, Tees, Shirts, Jackets) | collection headings | portrait |
| 5 | **Colour profile shots** — one per shade (Red, Pink, Orange, Yellow, Green, Blue, Purple, Black, Neutrals) | Shop-by-Colour rail | portrait |

I'll take whatever you send and resize/crop it — don't worry about exact sizes.

---

## 4. The product list (33 items)

Send a photo per item you actually stock. If an item isn't in the shop any
more, just tell me and I'll remove it.

```
hoodie-01        HOODIE / 01        (your real photo is already used ✓)
hoodie-02        HOODIE / 02        (your real photo is already used ✓)
hoodie-03        HOODIE / 03        (your real photo is already used ✓)
hoodie-rust      Rust Oversized Hoodie
hoodie-forest    Forest Hoodie
hoodie-indigo    Indigo Hoodie
hoodie-plum      Plum Hoodie
sweats-cream     Cream Crewneck
sweats-rose      Rose Crewneck
sweats-charcoal  Charcoal Zip-Up
tee-terracotta   Terracotta Tee
tee-sky          Sky Tee
tee-sun          Sun Tee
tee-white        White Heavy Tee
shirt-ivory      Ivory Shirt
shirt-sage       Sage Shirt
shirt-navy       Navy Shirt
shirt-coral      Coral Check Shirt
jacket-black     Black Bomber
jacket-olive     Olive Field Jacket
jacket-tan       Tan Overshirt
coords-blush     Blush Co-ord Set
coords-lilac     Lilac Co-ord Set
coords-camel     Camel Co-ord Set
joggers-mustard  Mustard Joggers
joggers-teal     Teal Joggers
trousers-linen   Linen Trousers
trousers-navy    Navy Trousers
trousers-olive   Olive Chinos
trousers-black   Black Trousers
shorts-beige     Beige Chino Shorts
shorts-olive     Olive Shorts
shorts-navy      Navy Shorts
```

> Most of the catalogue currently shows placeholder fashion photos. Every real
> photo you send replaces a placeholder.

---

## 5. What I do with them (फिर मैं क्या करूँगा)

Once I receive the photos I will:

1. Rename, crop and compress them for fast loading.
2. Drop them into the correct folder so the site picks them up automatically.
3. Update any names/colours/prices you tell me to change.
4. Tell you exactly what still needs a photo (a short "still missing" list).

You don't touch any code — just send photos and I handle the rest. 🙏
