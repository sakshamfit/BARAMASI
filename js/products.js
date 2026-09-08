/* ═══════════════════════════════════════════════
   products — the single source of product truth.
   BARAMASI (बारामासी) — clothing store, Bettiah.
   Every surface — listings, product pages, search,
   cart, checkout — reads from this file.

   PENDING REAL DATA (clearly marked, not invented):
   · price      — every price is a placeholder with
     priceConfirmed:false; final price is confirmed
     at the store (see com.priceTbc)
   · imagery    — three HOODIE photos are the store's
     own supplied photography; the rest of the
     catalogue is generic editorial placeholders the
     owner replaces with real stock photos
   · bestSeller — a provisional selection; adjust
   · reviews    — structure ready, no fake reviews
   ═══════════════════════════════════════════════ */

const P = 'assets/products/';

/* helper: expand image stems into {full, card} pairs */
function media(id, stems, videos = []) {
  return {
    images: stems.map((s) => `${P}${id}/${s}.jpg`),
    cards: stems.map((s) => `${P}${id}/${s}-card.jpg`),
    videos: videos.map((v) => ({
      src: `${P}${id}/${v}.mp4`,
      poster: `${P}${id}/${v}-poster.jpg`,
    })),
  };
}

/* ── the seven collections (categories in the store) ── */

/* Collection covers fall back to a product card until the store supplies
   a dedicated landing image for the category. */

export const TYPES = [
  {
    key: 'hoodies',
    name: { en: 'Hoodies', hi: 'हुडीज़' },
    cover: null,
    blurb: {
      en: 'The Baramasi signature — easy layers for every month of the year.',
      hi: 'बारामासी की पहचान — साल के हर महीने के लिए आरामदायक हुडीज़।',
    },
  },
  {
    key: 'sweats',
    name: { en: 'Sweatshirts', hi: 'स्वेटशर्ट्स' },
    cover: null,
    blurb: {
      en: 'Crewneck comfort — plain, soft and made for daily wear.',
      hi: 'क्रूनेक आराम — सादा, मुलायम और रोज़ पहनने के लिए।',
    },
  },
  {
    key: 'tees',
    name: { en: 'Tees', hi: 'टी-शर्ट्स' },
    cover: null,
    blurb: {
      en: 'Your everyday rotation — good fits, honest colours.',
      hi: 'आपकी रोज़ की पसंद — अच्छी फिट, सच्चे रंग।',
    },
  },
  {
    key: 'shirts',
    name: { en: 'Shirts', hi: 'शर्ट्स' },
    cover: null,
    blurb: {
      en: 'From work to weekend — sharp when it counts, easy after.',
      hi: 'ऑफिस से वीकेंड तक — जब ज़रूरत हो तो स्मार्ट, वरना आसान।',
    },
  },
  {
    key: 'jackets',
    name: { en: 'Jackets', hi: 'जैकेट्स' },
    cover: null,
    blurb: {
      en: 'For the evenings that turn sharp — Bettiah knows them well.',
      hi: 'उन शामों के लिए जो ठंडी हो जाती हैं — बेतिया इन्हें अच्छी तरह जानता है।',
    },
  },
  {
    key: 'coords',
    name: { en: 'Co-ord Sets', hi: 'को-ऑर्ड सेट' },
    cover: null,
    blurb: {
      en: 'A matching set — zero effort, always put together.',
      hi: 'मैचिंग सेट — कोई मेहनत नहीं, हमेशा तैयार।',
    },
  },
  {
    key: 'joggers',
    name: { en: 'Joggers', hi: 'जॉगर्स' },
    cover: null,
    blurb: {
      en: 'Easy bottoms for easy days — at home or out.',
      hi: 'आरामदायक दिनों के लिए आरामदायक पैंट — घर या बाहर।',
    },
  },
  {
    key: 'trousers',
    name: { en: 'Trousers', hi: 'ट्राउज़र्स' },
    cover: null,
    blurb: {
      en: 'Linen, chinos and clean cuts — sharp without trying too hard.',
      hi: 'लिनन, चिनोज़ और साफ़-सुथरे कट — बिना मेहनत के स्मार्ट।',
    },
  },
  {
    key: 'shorts',
    name: { en: 'Shorts', hi: 'शॉर्ट्स' },
    cover: null,
    blurb: {
      en: 'For the long, warm Bettiah afternoons.',
      hi: 'बेतिया की लंबी, गर्म दोपहरों के लिए।',
    },
  },
];

/* the store's Shop-by-Colour profile images (landing section 4 and the
   colour page). A profile image exists for every colour in the range. */
export const COLOUR_COVERS = {
  red: 'assets/img/shade/red.jpg',
  green: 'assets/img/shade/green.jpg',
  yellow: 'assets/img/shade/yellow.jpg',
  blue: 'assets/img/shade/blue.jpg',
  pink: 'assets/img/shade/pink.jpg',
  purple: 'assets/img/shade/purple.jpg',
  orange: 'assets/img/shade/orange.jpg',
  black: 'assets/img/shade/black.jpg',
  neutrals: 'assets/img/shade/neutrals.jpg',
};

/* ── the products ──
   HOODIE / 01–03 use the store's own supplied photography
   (public/products/p1,p2,p4 in the BARAMASI project). */

const HOODIE_FABRIC = { en: 'Cotton-rich fleece', hi: 'कॉटन-रिच फ़्लीस' };
const CREW_FABRIC = { en: 'Brushed cotton fleece', hi: 'ब्रश्ड कॉटन फ़्लीस' };
const TEE_FABRIC = { en: 'Combed cotton jersey', hi: 'कॉम्ब्ड कॉटन जर्सी' };
const SHIRT_FABRIC = { en: 'Cotton twill', hi: 'कॉटन ट्विल' };
const JACKET_FABRIC = { en: 'Cotton shell', hi: 'कॉटन शेल' };
const TROUSER_FABRIC = { en: 'Cotton twill', hi: 'कॉटन ट्विल' };
const LINEN_FABRIC = { en: 'Cotton-linen blend', hi: 'कॉटन-लिनन मिश्रण' };

export const PRODUCTS = [
  /* ── Hoodies — the store's own three supplied studies first ── */
  {
    id: 'hoodie-01', type: 'hoodies', colour: 'neutrals',
    price: 2499, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: true, rating: null, reviews: [],
    ...media('hoodie-01', ['01']),
    name: { en: 'HOODIE / 01', hi: 'हुडी / 01' },
    desc: {
      en: 'Our hoodie, straight on. Come try it on and see how it sits.',
      hi: 'हमारी हुडी, सीधे सामने से। आकर पहन कर देखें — फिट खुद बताएगी।',
    },
    fabric: HOODIE_FABRIC,
    craft: { en: 'Relaxed fit, kangaroo pocket', hi: 'रिलैक्स्ड फिट, कंगारू पॉकेट' },
  },
  {
    id: 'hoodie-02', type: 'hoodies', colour: 'black',
    price: 2499, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('hoodie-02', ['01']),
    name: { en: 'HOODIE / 02', hi: 'हुडी / 02' },
    desc: {
      en: 'The same hoodie from the side, in softer light.',
      hi: 'वही हुडी बगल से, हल्की रोशनी में।',
    },
    fabric: HOODIE_FABRIC,
    craft: { en: 'Relaxed fit, kangaroo pocket', hi: 'रिलैक्स्ड फिट, कंगारू पॉकेट' },
  },
  {
    id: 'hoodie-03', type: 'hoodies', colour: 'black',
    price: 2499, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('hoodie-03', ['01']),
    name: { en: 'HOODIE / 03', hi: 'हुडी / 03' },
    desc: {
      en: 'The hoodie after dark — same piece, different mood.',
      hi: 'रात ढलने के बाद की हुडी — वही पीस, अलग अंदाज़।',
    },
    fabric: HOODIE_FABRIC,
    craft: { en: 'Relaxed fit, kangaroo pocket', hi: 'रिलैक्स्ड फिट, कंगारू पॉकेट' },
  },
  {
    id: 'hoodie-rust', type: 'hoodies', colour: 'orange',
    price: 2899, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: true, rating: null, reviews: [],
    ...media('hoodie-rust', ['01']),
    name: { en: 'Rust Oversized Hoodie', hi: 'रस्ट ओवरसाइज़्ड हुडी' },
    desc: {
      en: 'A warm rust oversized hoodie — the shade of a Bettiah winter evening.',
      hi: 'गर्म रस्ट रंग की ओवरसाइज़्ड हुडी — बेतिया की सर्द शामों का रंग।',
    },
    fabric: HOODIE_FABRIC,
    craft: { en: 'Oversized fit, dropped shoulder', hi: 'ओवरसाइज़्ड फिट, ड्रॉप्ड शोल्डर' },
  },
  {
    id: 'hoodie-forest', type: 'hoodies', colour: 'green',
    price: 2899, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('hoodie-forest', ['01']),
    name: { en: 'Forest Hoodie', hi: 'फ़ॉरेस्ट हुडी' },
    desc: {
      en: 'Deep forest green, cut easy — one of the colours people come back for.',
      hi: 'गहरा फ़ॉरेस्ट ग्रीन, आरामदायक कट — उन रंगों में से एक जिसके लिए लोग बार-बार आते हैं।',
    },
    fabric: HOODIE_FABRIC,
    craft: { en: 'Relaxed fit, ribbed cuffs', hi: 'रिलैक्स्ड फिट, रिब्ड कफ़्स' },
  },
  {
    id: 'hoodie-indigo', type: 'hoodies', colour: 'blue',
    price: 2899, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('hoodie-indigo', ['01']),
    name: { en: 'Indigo Hoodie', hi: 'इंडिगो हुडी' },
    desc: {
      en: 'Indigo like a deep night sky — fades gently, wears honestly.',
      hi: 'गहरे रात के आसमान जैसा इंडिगो — धीरे-धीरे फीका, ईमानदार पहनावा।',
    },
    fabric: HOODIE_FABRIC,
    craft: { en: 'Relaxed fit, kangaroo pocket', hi: 'रिलैक्स्ड फिट, कंगारू पॉकेट' },
  },
  {
    id: 'hoodie-plum', type: 'hoodies', colour: 'purple',
    price: 2899, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('hoodie-plum', ['01']),
    name: { en: 'Plum Hoodie', hi: 'प्लम हुडी' },
    desc: {
      en: 'A quiet plum purple — soft enough for every day, deep enough to notice.',
      hi: 'हल्का प्लम पर्पल — रोज़ के लिए मुलायम, और नज़र में रहने के लिए गहरा।',
    },
    fabric: HOODIE_FABRIC,
    craft: { en: 'Relaxed fit, kangaroo pocket', hi: 'रिलैक्स्ड फिट, कंगारू पॉकेट' },
  },

  /* ── Sweatshirts ── */
  {
    id: 'sweats-cream', type: 'sweats', colour: 'neutrals',
    price: 2199, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('sweats-cream', ['01']),
    name: { en: 'Cream Crewneck', hi: 'क्रीम क्रूनेक' },
    desc: {
      en: 'A plain cream crewneck — the piece that goes with absolutely everything.',
      hi: 'सादा क्रीम क्रूनेक — वह पीस जो हर चीज़ के साथ चल जाता है।',
    },
    fabric: CREW_FABRIC,
    craft: { en: 'Classic crewneck, ribbed hem', hi: 'क्लासिक क्रूनेक, रिब्ड हेम' },
  },
  {
    id: 'sweats-rose', type: 'sweats', colour: 'pink',
    price: 2199, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: true, rating: null, reviews: [],
    ...media('sweats-rose', ['01']),
    name: { en: 'Rose Crewneck', hi: 'रोज़ क्रूनेक' },
    desc: {
      en: 'Rose pink, brushed soft — easy to wear, hard to put down.',
      hi: 'रोज़ पिंक, मुलायम ब्रश्ड — पहनना आसान, उतारना मुश्किल।',
    },
    fabric: CREW_FABRIC,
    craft: { en: 'Classic crewneck, ribbed hem', hi: 'क्लासिक क्रूनेक, रिब्ड हेम' },
  },
  {
    id: 'sweats-charcoal', type: 'sweats', colour: 'black',
    price: 2499, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('sweats-charcoal', ['01']),
    name: { en: 'Charcoal Zip-Up', hi: 'चारकोल ज़िप-अप' },
    desc: {
      en: 'A charcoal zip-up sweatshirt — the easy layer between seasons.',
      hi: 'चारकोल ज़िप-अप स्वेटशर्ट — मौसमों के बीच का आसान लेयर।',
    },
    fabric: CREW_FABRIC,
    craft: { en: 'Full zip, two side pockets', hi: 'फुल ज़िप, दो साइड पॉकेट' },
  },

  /* ── Tees ── */
  {
    id: 'tee-terracotta', type: 'tees', colour: 'red',
    price: 1299, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('tee-terracotta', ['01']),
    name: { en: 'Terracotta Tee', hi: 'टेराकोटा टी' },
    desc: {
      en: 'A deep terracotta tee — earth tones that suit every skin.',
      hi: 'गहरी टेराकोटा टी — मिट्टी के रंग जो हर रंगत पर जचते हैं।',
    },
    fabric: TEE_FABRIC,
    craft: { en: 'Regular fit, ribbed collar', hi: 'रेगुलर फिट, रिब्ड कॉलर' },
  },
  {
    id: 'tee-sky', type: 'tees', colour: 'blue',
    price: 1299, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('tee-sky', ['01']),
    name: { en: 'Sky Tee', hi: 'स्काई टी' },
    desc: {
      en: 'Sky blue cotton — light, bright and built for long days.',
      hi: 'स्काई ब्लू कॉटन — हल्का, चमकीला और लंबे दिनों के लिए बना।',
    },
    fabric: TEE_FABRIC,
    craft: { en: 'Regular fit, ribbed collar', hi: 'रेगुलर फिट, रिब्ड कॉलर' },
  },
  {
    id: 'tee-sun', type: 'tees', colour: 'yellow',
    price: 1299, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: true, rating: null, reviews: [],
    ...media('tee-sun', ['01']),
    name: { en: 'Sun Tee', hi: 'सन टी' },
    desc: {
      en: 'Sunshine yellow — the tee that starts the day right.',
      hi: 'धूप जैसा पीला — वह टी जो दिन की शुरुआत सही करती है।',
    },
    fabric: TEE_FABRIC,
    craft: { en: 'Regular fit, ribbed collar', hi: 'रेगुलर फिट, रिब्ड कॉलर' },
  },
  {
    id: 'tee-white', type: 'tees', colour: 'neutrals',
    price: 1499, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('tee-white', ['01']),
    name: { en: 'White Heavy Tee', hi: 'व्हाइट हैवी टी' },
    desc: {
      en: 'A heavyweight white tee — substantial cotton that keeps its shape.',
      hi: 'हैवीवेट व्हाइट टी — मज़बूत कॉटन जो अपनी शेप बनाए रखती है।',
    },
    fabric: TEE_FABRIC,
    craft: { en: 'Regular fit, taped shoulder seam', hi: 'रेगुलर फिट, टेप्ड शोल्डर सीम' },
  },

  /* ── Shirts ── */
  {
    id: 'shirt-ivory', type: 'shirts', colour: 'neutrals',
    price: 1799, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('shirt-ivory', ['01']),
    name: { en: 'Ivory Shirt', hi: 'आइवरी शर्ट' },
    desc: {
      en: 'An ivory cotton shirt — as happy at work as it is on a Sunday.',
      hi: 'आइवरी कॉटन शर्ट — ऑफिस में भी उतनी ही अच्छी, जितनी रविवार को।',
    },
    fabric: SHIRT_FABRIC,
    craft: { en: 'Button-down collar, regular fit', hi: 'बटन-डाउन कॉलर, रेगुलर फिट' },
  },
  {
    id: 'shirt-sage', type: 'shirts', colour: 'green',
    price: 1799, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: true, rating: null, reviews: [],
    ...media('shirt-sage', ['01']),
    name: { en: 'Sage Shirt', hi: 'सेज शर्ट' },
    desc: {
      en: 'Sage green with an easy drape — quiet, but people will ask.',
      hi: 'सेज ग्रीन, हल्का ढीला — चुपचाप, पर लोग पूछेंगे ज़रूर।',
    },
    fabric: SHIRT_FABRIC,
    craft: { en: 'Button-down collar, regular fit', hi: 'बटन-डाउन कॉलर, रेगुलर फिट' },
  },
  {
    id: 'shirt-navy', type: 'shirts', colour: 'blue',
    price: 1899, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('shirt-navy', ['01']),
    name: { en: 'Navy Shirt', hi: 'नेवी शर्ट' },
    desc: {
      en: 'Navy that means business — and knows how to relax too.',
      hi: 'नेवी जो बिज़नेस के लिए है — और आराम करना भी जानती है।',
    },
    fabric: SHIRT_FABRIC,
    craft: { en: 'Button-down collar, regular fit', hi: 'बटन-डाउन कॉलर, रेगुलर फिट' },
  },
  {
    id: 'shirt-coral', type: 'shirts', colour: 'pink',
    price: 1899, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('shirt-coral', ['01']),
    name: { en: 'Coral Check Shirt', hi: 'कोरल चेक शर्ट' },
    desc: {
      en: 'A coral check that keeps the festival season going all year.',
      hi: 'कोरल चेक जो त्योहारों का मौसम साल भर बनाए रखे।',
    },
    fabric: SHIRT_FABRIC,
    craft: { en: 'Cuban collar, relaxed fit', hi: 'क्यूबन कॉलर, रिलैक्स्ड फिट' },
  },

  /* ── Jackets ── */
  {
    id: 'jacket-black', type: 'jackets', colour: 'black',
    price: 3999, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: true, rating: null, reviews: [],
    ...media('jacket-black', ['01']),
    name: { en: 'Black Bomber', hi: 'ब्लैक बॉम्बर' },
    desc: {
      en: 'The black bomber — the answer to “what do I wear over this?”',
      hi: 'ब्लैक बॉम्बर — “इसके ऊपर क्या पहनूँ?” का जवाब।',
    },
    fabric: JACKET_FABRIC,
    craft: { en: 'Ribbed collar, cuffs and hem', hi: 'रिब्ड कॉलर, कफ़्स और हेम' },
  },
  {
    id: 'jacket-olive', type: 'jackets', colour: 'green',
    price: 4299, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('jacket-olive', ['01']),
    name: { en: 'Olive Field Jacket', hi: 'ऑलिव फ़ील्ड जैकेट' },
    desc: {
      en: 'An olive field jacket with pockets for real life.',
      hi: 'ऑलिव फ़ील्ड जैकेट — असली ज़िंदगी के लिए जेबों के साथ।',
    },
    fabric: JACKET_FABRIC,
    craft: { en: 'Four pockets, snap front', hi: 'चार पॉकेट, स्नैप फ्रंट' },
  },
  {
    id: 'jacket-tan', type: 'jackets', colour: 'neutrals',
    price: 3499, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('jacket-tan', ['01']),
    name: { en: 'Tan Overshirt', hi: 'टैन ओवरशर्ट' },
    desc: {
      en: 'A tan overshirt — shirt when you want, jacket when you need.',
      hi: 'टैन ओवरशर्ट — चाहें तो शर्ट, ज़रूरत हो तो जैकेट।',
    },
    fabric: SHIRT_FABRIC,
    craft: { en: 'Shirt collar, two chest pockets', hi: 'शर्ट कॉलर, दो चेस्ट पॉकेट' },
  },

  /* ── Co-ord sets ── */
  {
    id: 'coords-blush', type: 'coords', colour: 'pink',
    price: 3299, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('coords-blush', ['01']),
    name: { en: 'Blush Co-ord Set', hi: 'ब्लश को-ऑर्ड सेट' },
    desc: {
      en: 'A blush hoodie-and-jogger set — ready in one decision.',
      hi: 'ब्लश हुडी-और-जॉगर सेट — एक ही फ़ैसले में तैयार।',
    },
    fabric: HOODIE_FABRIC,
    craft: { en: 'Hoodie + jogger, matching set', hi: 'हुडी + जॉगर, मैचिंग सेट' },
  },
  {
    id: 'coords-lilac', type: 'coords', colour: 'purple',
    price: 3299, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('coords-lilac', ['01']),
    name: { en: 'Lilac Co-ord Set', hi: 'लाइलैक को-ऑर्ड सेट' },
    desc: {
      en: 'Lilac, head to toe — one set, zero confusion.',
      hi: 'सिर से पाँव तक लाइलैक — एक सेट, कोई उलझन नहीं।',
    },
    fabric: HOODIE_FABRIC,
    craft: { en: 'Hoodie + jogger, matching set', hi: 'हुडी + जॉगर, मैचिंग सेट' },
  },
  {
    id: 'coords-camel', type: 'coords', colour: 'neutrals',
    price: 3299, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('coords-camel', ['01']),
    name: { en: 'Camel Co-ord Set', hi: 'कैमल को-ऑर्ड सेट' },
    desc: {
      en: 'Camel tones that dress up and down without trying.',
      hi: 'कैमल टोन — बिना मेहनत के कभी ऊपर, कभी नीचे।',
    },
    fabric: HOODIE_FABRIC,
    craft: { en: 'Hoodie + jogger, matching set', hi: 'हुडी + जॉगर, मैचिंग सेट' },
  },

  /* ── Joggers ── */
  {
    id: 'joggers-mustard', type: 'joggers', colour: 'yellow',
    price: 1799, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('joggers-mustard', ['01']),
    name: { en: 'Mustard Joggers', hi: 'मस्टर्ड जॉगर्स' },
    desc: {
      en: 'Mustard yellow joggers — the easy bottom that finishes a fit.',
      hi: 'मस्टर्ड पीले जॉगर्स — वह आसान पैंट जो लुक पूरा करे।',
    },
    fabric: CREW_FABRIC,
    craft: { en: 'Elastic waist, tapered leg', hi: 'इलास्टिक कमर, टेपर्ड लेग' },
  },
  {
    id: 'joggers-teal', type: 'joggers', colour: 'green',
    price: 1799, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('joggers-teal', ['01']),
    name: { en: 'Teal Joggers', hi: 'टील जॉगर्स' },
    desc: {
      en: 'Teal joggers — deep, easy and made for long lounges.',
      hi: 'टील जॉगर्स — गहरे, आरामदेह और लंबे आराम के लिए।',
    },
    fabric: CREW_FABRIC,
    craft: { en: 'Elastic waist, tapered leg', hi: 'इलास्टिक कमर, टेपर्ड लेग' },
  },

  /* ── Trousers ── */
  {
    id: 'trousers-linen', type: 'trousers', colour: 'neutrals',
    price: 2199, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: true, rating: null, reviews: [],
    ...media('trousers-linen', ['01']),
    name: { en: 'Linen Trousers', hi: 'लिनन ट्राउज़र्स' },
    desc: {
      en: 'Light, breathable linen trousers — made for warm days that run long.',
      hi: 'हल्के, हवादार लिनन ट्राउज़र्स — लंबे गर्म दिनों के लिए बने।',
    },
    fabric: LINEN_FABRIC,
    craft: { en: 'Relaxed straight leg, zip fly', hi: 'रिलैक्स्ड स्ट्रेट लेग, ज़िप फ्लाई' },
  },
  {
    id: 'trousers-navy', type: 'trousers', colour: 'blue',
    price: 1999, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('trousers-navy', ['01']),
    name: { en: 'Navy Trousers', hi: 'नेवी ट्राउज़र्स' },
    desc: {
      en: 'Plain navy trousers — the dependable pair in every wardrobe.',
      hi: 'सादे नेवी ट्राउज़र्स — हर अलमारी की भरोसेमंद पैंट।',
    },
    fabric: TROUSER_FABRIC,
    craft: { en: 'Straight leg, zip fly', hi: 'स्ट्रेट लेग, ज़िप फ्लाई' },
  },
  {
    id: 'trousers-olive', type: 'trousers', colour: 'green',
    price: 1999, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('trousers-olive', ['01']),
    name: { en: 'Olive Chinos', hi: 'ऑलिव चिनोज़' },
    desc: {
      en: 'Olive chinos — easy from morning tea to evening out.',
      hi: 'ऑलिव चिनोज़ — सुबह की चाय से शाम की सैर तक आसान।',
    },
    fabric: TROUSER_FABRIC,
    craft: { en: 'Straight leg, zip fly', hi: 'स्ट्रेट लेग, ज़िप फ्लाई' },
  },
  {
    id: 'trousers-black', type: 'trousers', colour: 'black',
    price: 1999, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('trousers-black', ['01']),
    name: { en: 'Black Trousers', hi: 'ब्लैक ट्राउज़र्स' },
    desc: {
      en: 'Black trousers that move from work to occasion without a pause.',
      hi: 'ब्लैक ट्राउज़र्स — बिना रुके ऑफिस से फ़ंक्शन तक।',
    },
    fabric: TROUSER_FABRIC,
    craft: { en: 'Straight leg, zip fly', hi: 'स्ट्रेट लेग, ज़िप फ्लाई' },
  },

  /* ── Shorts ── */
  {
    id: 'shorts-beige', type: 'shorts', colour: 'neutrals',
    price: 1299, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('shorts-beige', ['01']),
    name: { en: 'Beige Chino Shorts', hi: 'बेज चिनो शॉर्ट्स' },
    desc: {
      en: 'Beige chino shorts — the warm-weather essential.',
      hi: 'बेज चिनो शॉर्ट्स — गर्मी की ज़रूरी चीज़।',
    },
    fabric: TROUSER_FABRIC,
    craft: { en: 'Mid length, zip fly', hi: 'मिड लेंथ, ज़िप फ्लाई' },
  },
  {
    id: 'shorts-olive', type: 'shorts', colour: 'green',
    price: 1299, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('shorts-olive', ['01']),
    name: { en: 'Olive Shorts', hi: 'ऑलिव शॉर्ट्स' },
    desc: {
      en: 'Olive shorts — rugged enough for anything the day brings.',
      hi: 'ऑलिव शॉर्ट्स — दिन की हर चुनौती के लिए तैयार।',
    },
    fabric: TROUSER_FABRIC,
    craft: { en: 'Mid length, zip fly', hi: 'मिड लेंथ, ज़िप फ्लाई' },
  },
  {
    id: 'shorts-navy', type: 'shorts', colour: 'blue',
    price: 1299, priceConfirmed: false, availability: 'in-store',
    newArrival: true, bestSeller: false, rating: null, reviews: [],
    ...media('shorts-navy', ['01']),
    name: { en: 'Navy Shorts', hi: 'नेवी शॉर्ट्स' },
    desc: {
      en: 'Navy shorts — plain, neat, always right.',
      hi: 'नेवी शॉर्ट्स — सादे, साफ़-सुथरे, हमेशा सही।',
    },
    fabric: TROUSER_FABRIC,
    craft: { en: 'Mid length, zip fly', hi: 'मिड लेंथ, ज़िप फ्लाई' },
  },
];

/* slugs mirror ids (clean, stable product routes: product.html?p=<slug>) */
for (const p of PRODUCTS) p.slug = p.id;

/* colours actually present in the catalog, in display order */
const COLOUR_ORDER = ['red', 'pink', 'orange', 'yellow', 'green', 'blue', 'purple', 'black', 'neutrals'];
export const COLOURS = COLOUR_ORDER.filter((c) => PRODUCTS.some((p) => p.colour === c));

export function productById(id) {
  return PRODUCTS.find((p) => p.id === id || p.slug === id) || null;
}

export function productsByColour(colour) {
  return PRODUCTS.filter((p) => p.colour === colour);
}

export function productsByType(type) {
  return PRODUCTS.filter((p) => p.type === type);
}

export function typeByKey(key) {
  return TYPES.find((t) => t.key === key) || null;
}

export function newArrivals() { return PRODUCTS.filter((p) => p.newArrival); }
export function bestSellers() { return PRODUCTS.filter((p) => p.bestSeller); }

export function searchProducts(query) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return PRODUCTS.filter((p) => {
    const type = typeByKey(p.type);
    return p.name.en.toLowerCase().includes(q) ||
      p.name.hi.includes(q) ||
      p.colour.includes(q) ||
      p.type.replace(/-/g, ' ').includes(q) ||
      (type && (type.name.en.toLowerCase().includes(q) || type.name.hi.includes(q))) ||
      p.desc.en.toLowerCase().includes(q);
  });
}

export function formatPrice(n) {
  return '₹' + n.toLocaleString('en-IN');
}
