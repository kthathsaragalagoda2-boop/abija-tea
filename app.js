const WA_NUMBER = '94716399502';

// Google Tag Manager reads these GA4-recommended events from the data layer.
// In GTM, create a GA4 Event tag using the Event Name variable and publish it.
window.dataLayer = window.dataLayer || [];
function trackEvent(name, params = {}) {
  window.dataLayer.push({ event: name, ...params });
}

function loadAnalytics() {
  if (document.querySelector('script[src*="googletagmanager.com/gtm.js"]')) return;
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-TS7BGZVC';
  document.head.appendChild(script);
}

function loadVideo(button) {
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube-nocookie.com/embed/2QSEUZa4D40?autoplay=1&rel=0';
  iframe.title = 'Abija Tea video';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  button.replaceWith(iframe);
}

const LANGUAGE_FONT_URLS = {
  si: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;500&family=Noto+Serif+Sinhala:wght@400;500;600&display=swap',
  ta: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500&family=Noto+Serif+Tamil:wght@300;400;600&display=swap'
};
function loadLanguageFonts(lang) {
  if (!LANGUAGE_FONT_URLS[lang] || document.getElementById('language-font-' + lang)) return;
  const link = document.createElement('link');
  link.id = 'language-font-' + lang;
  link.rel = 'stylesheet';
  link.href = LANGUAGE_FONT_URLS[lang];
  document.head.appendChild(link);
}

// ── PRODUCT PRICING (LKR base, 1kg = full price) ──
// Weights: [100g, 250g, 500g, 1000g]
// Discounted prices (15% off smaller packs), 1kg = full price
const PRODUCTS = {
  'Black BOP Tea':    { group:'black', lkr:[250,625,1250,2500], avail:[true, true, true, true],  soon:false, img:'BOP-1200.webp',  note:'' },
  'Black BOPF Tea':   { group:'black', lkr:[250,625,1250,2500], avail:[false,false,false,false], soon:false, img:'BOP-1200.webp',  note:'Unavailable' },
  'Black Fannings':   { group:'black', lkr:[250,625,1250,2500], avail:[true, true, true, true],  soon:false, img:'Dust-1200.webp',  note:'' },
  'Black Dust Tea':   { group:'black', lkr:[250,625,1250,2500], avail:[true, true, true, true],  soon:false, img:'Dust-1200.webp',  note:'' },
  'Pure Green Tea':   { group:'green', lkr:[1250,3125,6250,5000],avail:[true, true, true, true],  soon:false, img:'Green-1200.webp',note:'' },
  'Leafy Green Tea':  { group:'green', lkr:[1250,3125,6250,5000],avail:[true, true, true, true],  soon:false, img:'Green-1200.webp',note:'' },
  'Silver Tips':      { group:'tips',  lkr:[2500,6250,12500,10000],avail:[false,false,false,false],soon:true,  img:'Silver-1200.webp',note:'Within a week' },
  'Golden Tips':      { group:'tips',  lkr:[2500,6250,12500,10000],avail:[false,false,false,false],soon:true,  img:'Golden-1200.webp',note:'Within a week' }
};

// Original prices before discount (per 100g, 250g, 500g, 1kg in LKR)
const ORIG_LKR = {
  black: [250, 625, 1250, 2500],
  green: [1500, 3750, 7500, 6000],
  tips:  [3000, 7500, 15000, 12000]
};

const MONTHLY_SALE_END = new Date('2026-09-30T23:59:59+05:30');
const MONTHLY_SALE_PERCENT = 30;
const DELIVERY_LKR = 450;
function monthlySaleIsActive() {
  return new Date() <= MONTHLY_SALE_END;
}
function currentLkrPrice(product, index) {
  const regular = product.lkr[index];
  if (!monthlySaleIsActive()) return regular;
  return Math.round(ORIG_LKR[product.group][index] * (1 - MONTHLY_SALE_PERCENT / 100));
}
function updateMonthlyOffer() {
  const offer = document.getElementById('monthlyOffer');
  const countdown = document.getElementById('promoCountdown');
  if (!offer || !countdown) return;
  const remaining = MONTHLY_SALE_END - new Date();
  if (remaining <= 0) {
    offer.hidden = true;
    return;
  }
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  countdown.textContent = 'Ends in ' + days + 'd ' + hours + 'h ' + minutes + 'm';
}

const WEIGHTS = ['100g','250g','500g','1kg'];

const LANGS = {
  en: { sym:'Rs',  code:'LKR', label:'LKR — Sri Lanka Rupee' },
  us: { sym:'$',   code:'USD', label:'USD — United States Dollar' },
  si: { sym:'Rs',  code:'LKR', label:'LKR — ශ්‍රී ලංකා රුපියල' },
  ta: { sym:'₹',   code:'INR', label:'INR — Indian Rupee' },
  gb: { sym:'£',   code:'GBP', label:'GBP — British Pound' }
};

const CONTENT = {
  en: {
    home:'Home', shop:'Shop', about:'About',
    heroEye:'Abija Tea · Talawakelle, Kandy · Est. 2024',
    heroTitle:'Real tea.<br><em>Nothing<br>else.</em>',
    heroSub:'Elevated through knowledge',
    heroDesc:'Abija is a premium Sri Lankan tea brand from Talawakelle, Kandy. Every product is 100% pure Ceylon tea — unblended, uncoloured, unflavoured, and free from additives. Abija tea is for people who know what real tea is supposed to be.',
    shopNow:'Shop Now', ourBelief:'Our Belief',
    shopEye:'Talawakelle, Kandy · Sri Lanka',
    shopTitle:'The Abija<br><em>Collection</em>',
    aboutEye:'Our Belief',
    aboutTitle:'<em>Real</em> tea.<br>Nothing else.',
    aboutP1:'Abija is a premium Sri Lankan tea brand built on purity, truth, and deep knowledge of real tea. Every product is sourced from Talawakelle, Kandy — 100% pure Ceylon tea, unblended, uncoloured, unflavoured, and free from chemicals or additives.',
    aboutP2:'Most tea brands today use colouring to fake strength, add flavours to hide poor quality, and blend waste tea. Abija exists to set a different standard. The estate name is printed boldly on every product.',
    stat1:'Products', stat2:'Additives', stat3:'Pure Ceylon', stat4:'Estate Origin',
    footCopy:'© 2024 Abija Tea · Pure Ceylon Tea · Sri Lanka',
    orderBtn:'Order via WhatsApp'
  },
  us: {
    home:'Home', shop:'Shop', about:'About',
    heroEye:'Abija Tea · Talawakelle, Kandy · Est. 2024',
    heroTitle:'Real tea.<br><em>Nothing<br>else.</em>',
    heroSub:'Elevated through knowledge',
    heroDesc:'Abija is a premium Sri Lankan tea brand from Talawakelle, Kandy. Every product is 100% pure Ceylon tea — unblended, uncolored, unflavored, and free from additives. Abija tea is for people who know what real tea is supposed to be.',
    shopNow:'Shop Now', ourBelief:'Our Belief',
    shopEye:'Talawakelle, Kandy · Sri Lanka',
    shopTitle:'The Abija<br><em>Collection</em>',
    aboutEye:'Our Belief',
    aboutTitle:'<em>Real</em> tea.<br>Nothing else.',
    aboutP1:'Abija is a premium Sri Lankan tea brand built on purity, truth, and deep knowledge of real tea. Every product is sourced from Talawakelle, Kandy — 100% pure Ceylon tea, unblended, uncolored, unflavored, and free from chemicals or additives.',
    aboutP2:'Most tea brands today use coloring to fake strength, add flavors to hide poor quality, and blend waste tea. Abija exists to set a different standard. The estate name is printed boldly on every product.',
    stat1:'Products', stat2:'Additives', stat3:'Pure Ceylon', stat4:'Estate Origin',
    footCopy:'© 2024 Abija Tea · Pure Ceylon Tea · Sri Lanka',
    orderBtn:'Order via WhatsApp'
  },
  si: {
    home:'මුල් පිටුව', shop:'වෙළඳසැල', about:'අප ගැන',
    heroEye:'අබිජා තේ · Talawakelle, Kandy · ආ. 2024',
    heroTitle:'සැබෑ තේ.<br><em>වෙන<br>කිසිවක් නොවේ.</em>',
    heroSub:'උසස් — දැනුමෙන් ඔසවා ඇත',
    heroDesc:'අබිජා යනු Talawakelle, Kandy හි සිට ලැබෙන, 100% පිරිසිදු Ceylon තේ — නොමිශ්‍ර, වර්ණ නොකළ, සුවඳ නොකළ. සැබෑ තේ කුමක්දැයි දන්නා අය සඳහා.',
    shopNow:'දැන් ගන්න', ourBelief:'අපේ විශ්වාසය',
    shopEye:'Talawakelle, Kandy · ශ්‍රී ලංකාව',
    shopTitle:'අබිජා<br><em>එකතුව</em>',
    aboutEye:'අපේ විශ්වාසය',
    aboutTitle:'<em>සැබෑ</em> තේ.<br>වෙන කිසිවක් නොවේ.',
    aboutP1:'අබිජා යනු පිරිසිදුකම, සත්‍යය සහ සැබෑ තේ පිළිබඳ ගැඹුරු දැනුම මත ගොඩනඟා ඇති ශ්‍රී ලාංකික ප්‍රිමියම් තේ වෙළඳ නාමයකි. සෑම නිෂ්පාදනයක්ම Talawakelle, Kandy හි සිට ලැබෙන, 100% පිරිසිදු Ceylon තේ.',
    aboutP2:'බොහෝ තේ වෙළඳ නාම ශක්තිය ව්‍යාජ කිරීමට වර්ණ, ගුණ නොමැති තේ සඟවා ගැනීමට රස සහ කසළ තේ මිශ්‍ර කරති. අබිජා වෙනස් ප්‍රමිතියක් තැබීමට පවතී.',
    stat1:'නිෂ්පාදන', stat2:'එකතු කළ ද්‍රව්‍ය', stat3:'පිරිසිදු Ceylon', stat4:'ගොවිපල ප්‍රභවය',
    footCopy:'© 2024 අබිජා තේ · Pure Ceylon Tea · ශ්‍රී ලංකාව',
    orderBtn:'WhatsApp හරහා ඇණවුම් කරන්න'
  },
  ta: {
    home:'முகப்பு', shop:'கடை', about:'எங்களைப் பற்றி',
    heroEye:'அபிஜா தே · Talawakelle, Kandy · நி. 2024',
    heroTitle:'உண்மையான தேநீர்.<br><em>வேறு<br>எதுவுமில்லை.</em>',
    heroSub:'உயர்ந்த — அறிவின் மூலம் உயர்த்தப்பட்டது',
    heroDesc:'அபிஜா Talawakelle, Kandy இலிருந்து வரும் 100% தூய Ceylon தேயிலை — கலப்படமற்றது, நிறமில்லாதது, சுவையில்லாதது. உண்மையான தேயிலை என்னவென்று தெரிந்தவர்களுக்காக.',
    shopNow:'இப்போது வாங்கவும்', ourBelief:'எங்கள் நம்பிக்கை',
    shopEye:'Talawakelle, Kandy · இலங்கை',
    shopTitle:'அபிஜா<br><em>தொகுப்பு</em>',
    aboutEye:'எங்கள் நம்பிக்கை',
    aboutTitle:'<em>உண்மையான</em> தேநீர்.<br>வேறு எதுவுமில்லை.',
    aboutP1:'அபிஜா என்பது தூய்மை, உண்மை மற்றும் உண்மையான தேயிலையின் ஆழமான அறிவின் மீது கட்டப்பட்ட இலங்கையின் பிரீமியம் தேயிலை பிராண்ட். ஒவ்வொரு பொருளும் Talawakelle, Kandy இலிருந்து — 100% தூய Ceylon தேயிலை.',
    aboutP2:'பெரும்பாலான தேயிலை பிராண்டுகள் வலிமையை போலியாக காட்ட நிறம் பயன்படுத்துகின்றன. அபிஜா வேறு தரத்தை நிறுவ உள்ளது.',
    stat1:'தயாரிப்புகள்', stat2:'சேர்க்கைகள்', stat3:'தூய Ceylon', stat4:'தோட்ட தோற்றம்',
    footCopy:'© 2024 அபிஜா தே · Pure Ceylon Tea · இலங்கை',
    orderBtn:'WhatsApp வழியாக ஆர்டர்'
  },
  gb: {
    home:'Home', shop:'Shop', about:'About',
    heroEye:'Abija Tea · Talawakelle, Kandy · Est. 2024',
    heroTitle:'Real tea.<br><em>Nothing<br>else.</em>',
    heroSub:'Elevated through knowledge',
    heroDesc:'Abija is a premium Sri Lankan tea brand from Talawakelle, Kandy. Every product is 100% pure Ceylon tea — unblended, uncolored, unflavored, and free from additives.',
    shopNow:'Shop Now', ourBelief:'Our Belief',
    shopEye:'Talawakelle, Kandy · Sri Lanka',
    shopTitle:'The Abija<br><em>Collection</em>',
    aboutEye:'Our Belief',
    aboutTitle:'<em>Real</em> tea.<br>Nothing else.',
    aboutP1:'Abija is a premium Sri Lankan tea brand built on purity, truth, and deep knowledge of real tea. Every product is sourced from Talawakelle, Kandy — 100% pure Ceylon tea, unblended, uncolored, unflavored, and free from chemicals or additives.',
    aboutP2:'Most tea brands today use coloring to fake strength, add flavors to hide poor quality, and blend waste tea. Abija exists to set a different standard.',
    stat1:'Products', stat2:'Additives', stat3:'Pure Ceylon', stat4:'Estate Origin',
    footCopy:'© 2024 Abija Tea · Pure Ceylon Tea · Sri Lanka',
    orderBtn:'Order via WhatsApp'
  }
};

let currentLang = 'en';
let rates = { LKR: 1, INR: 107, GBP: 1, USD: 0.0033 };
let currentProduct = null;
let currentWeightIdx = 1; // default 250g
let qty = 1;

// ── GEO-BASED CURRENCY DETECTION ──
async function detectLocationCurrency() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    const country = data.country_code;
    applyRegionalExperience(country === 'US');
  } catch(e) { applyRegionalExperience(false); }
}

function applyRegionalExperience(isUs) {
  const heroImage = document.getElementById('hero-art-img');
  document.getElementById('hero-art-mobile-avif-source').srcset = isUs ? '/slUsa-hero-mobile.avif' : '/hero-art-mobile.avif';
  document.getElementById('hero-art-mobile-source').srcset = isUs ? '/slUsa-hero-mobile.webp' : '/hero-art-mobile.webp';
  document.getElementById('hero-art-avif-source').srcset = isUs ? '/slUsa-hero.avif' : '/hero-art.avif';
  heroImage.src = isUs ? '/slUsa-hero.webp' : '/hero-art.webp';
  heroImage.width = isUs ? 1696 : 800;
  heroImage.height = isUs ? 2528 : 1000;
  document.getElementById('languageSwitcher').hidden = isUs;
  setLang(isUs ? 'us' : 'en');
}

async function fetchRates() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/LKR');
    const data = await res.json();
    rates.INR = data.rates.INR;
    rates.GBP = data.rates.GBP;
    rates.USD = data.rates.USD;
    rates.LKR = 1;
    refreshAllPrices();
  } catch(e) { refreshAllPrices(); }
}

let rateRequest;
function ensureRates() {
  rateRequest ||= fetchRates();
  return rateRequest;
}

function convertFromLKR(lkr, code) {
  if (code === 'LKR') return Math.round(lkr).toLocaleString();
  if (code === 'INR') return Math.round(lkr * rates.INR).toLocaleString();
  if (code === 'GBP') return (lkr * rates.GBP).toFixed(2);
  if (code === 'USD') return (lkr * rates.USD).toFixed(2);
  return lkr;
}
function numericFromLKR(lkr, code) {
  if (code === 'LKR') return Math.round(lkr);
  return Number((lkr * rates[code]).toFixed(2));
}

function refreshAllPrices() {
  const lang = LANGS[currentLang];
  document.querySelectorAll('.amt[data-lkr]').forEach(el => {
    const lkr = monthlySaleIsActive() && el.dataset.saleLkr ? parseFloat(el.dataset.saleLkr) : parseFloat(el.dataset.lkr);
    el.textContent = convertFromLKR(lkr, lang.code);
  });
  document.querySelectorAll('.sym').forEach(el => el.textContent = lang.sym);
  if (currentProduct) {
    renderDrawerWeights();
    updateDrawerPrice();
  }
}

// ── DRAWER ──
function openDrawer(name, sub, price, img) {
  ensureRates();
  currentProduct = PRODUCTS[name] || null;
  currentWeightIdx = 1;
  qty = 1;
  document.getElementById('d-name').textContent = name;
  document.getElementById('d-sub').textContent = sub;
  document.getElementById('d-qty').textContent = 1;
  const imgEl = document.getElementById('d-img');
  if (img) {
    imgEl.classList.add('hidden');
    imgEl.src = '/' + img;
    imgEl.alt = name;
    imgEl.onload = () => imgEl.classList.remove('hidden');
    imgEl.onerror = () => { imgEl.src = '/Product.webp'; imgEl.classList.remove('hidden'); };
    document.getElementById('drawer').querySelector('.drawer-img-wrap').style.display = 'block';
  }
  renderDrawerWeights();
  updateDrawerPrice();
  document.getElementById('drawer').classList.add('open');
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  trackEvent('view_item', {
    currency: LANGS[currentLang].code,
    value: currentProduct ? numericFromLKR(currentLkrPrice(currentProduct, currentWeightIdx), LANGS[currentLang].code) : undefined,
    items: [{ item_name: name, item_category: currentProduct ? currentProduct.group : undefined }]
  });
  trackEvent('select_item', {
    item_list_name: 'Abija Tea Collection',
    items: [{ item_name: name, item_category: currentProduct ? currentProduct.group : undefined }]
  });
}

function renderDrawerWeights() {
  if (!currentProduct) return;
  const lang = LANGS[currentLang];
  const p = currentProduct;
  const origPrices = ORIG_LKR[p.group];
  WEIGHTS.forEach((w, i) => {
    const btn = document.getElementById('dwbtn-' + i);
    if (!btn) return;
    const lkr = currentLkrPrice(p, i);
    const origLkr = origPrices[i];
    const avail = p.avail[i];
    const soon = p.soon;
    const isDisc = lkr < origLkr;
    const priceStr = convertFromLKR(lkr, lang.code);
    const origStr = convertFromLKR(origLkr, lang.code);
    btn.className = 'd-wbtn' +
      (i === currentWeightIdx ? ' active' : '') +
      (!avail && !soon ? ' unavailable' : '') +
      (i === 3 ? ' best-val' : '');
    btn.innerHTML =
      (i === 3 ? '<span class="wbtn-badge">BEST VALUE</span>' : '') +
      '<span class="wbtn-size">' + w + '</span>' +
      (isDisc ? '<span class="wbtn-was">' + lang.sym + origStr + '</span>' : '') +
      '<span class="wbtn-price">' + lang.sym + priceStr + '</span>' +
      (soon ? '<span class="wbtn-avail">~1 week</span>' : '') +
      (!avail && !soon ? '<span class="wbtn-avail">Unavailable</span>' : '');
    btn.disabled = !avail && !soon;
    btn.onclick = avail || soon ? () => selWt(btn, i) : null;
  });
  // auto-select first available weight
  if (!currentProduct.avail[currentWeightIdx] && !currentProduct.soon) {
    const firstAvail = currentProduct.avail.findIndex(a => a) !== -1
      ? currentProduct.avail.findIndex(a => a) : 0;
    currentWeightIdx = firstAvail;
    renderDrawerWeights();
  }
}

function selWt(el, idx) {
  currentWeightIdx = idx;
  renderDrawerWeights();
  updateDrawerPrice();
}

function updateDrawerPrice() {
  const lang = LANGS[currentLang];
  if (!currentProduct) return;
  const lkr = currentLkrPrice(currentProduct, currentWeightIdx);
  const price = convertFromLKR(lkr, lang.code);
  document.getElementById('d-price').textContent = price;
  document.getElementById('d-curr').textContent = lang.sym;
  document.getElementById('d-currency-badge').textContent = lang.label;
  document.getElementById('d-rate-note').textContent =
    lang.code === 'INR' ? 'Converted from LKR (live rate)' :
    ['GBP', 'USD'].includes(lang.code) ? 'Converted from LKR (live rate)' : '';
  updateTotal();
}

function updateTotal() {
  const lang = LANGS[currentLang];
  if (!currentProduct) return;
  const lkr = currentLkrPrice(currentProduct, currentWeightIdx);
  const teaTotalLkr = lkr * qty;
  const orderTotalLkr = teaTotalLkr + DELIVERY_LKR;
  const totalRow = document.getElementById('d-total-row');
  document.getElementById('d-delivery').textContent = convertFromLKR(DELIVERY_LKR, lang.code);
  document.getElementById('d-delivery-curr').textContent = lang.sym;
  document.getElementById('d-total').textContent = convertFromLKR(orderTotalLkr, lang.code);
  document.getElementById('d-total-curr').textContent = lang.sym;
  document.getElementById('d-cta-label').textContent = 'Confirm order on WhatsApp — ' + lang.sym + convertFromLKR(orderTotalLkr, lang.code);
  totalRow.style.display = 'block';
}

function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function openImagePreview() {
  const source = document.getElementById('d-img');
  if (!source || !source.src) return;
  const preview = document.getElementById('previewImage');
  preview.src = source.currentSrc || source.src;
  preview.alt = source.alt || 'Abija Tea product image';
  document.getElementById('imageLightbox').classList.add('open');
  trackEvent('view_item_image', { item_name: document.getElementById('d-name').textContent });
}

function closeImagePreview() {
  document.getElementById('imageLightbox').classList.remove('open');
}

function chQty(d) {
  qty = Math.max(1, qty + d);
  document.getElementById('d-qty').textContent = qty;
  updateTotal();
}

function orderWhatsApp() {
  if (!currentProduct) return;
  const name = document.getElementById('d-name').textContent;
  const weight = WEIGHTS[currentWeightIdx];
  const lang = LANGS[currentLang];
  const lkr = currentLkrPrice(currentProduct, currentWeightIdx);
  const price = convertFromLKR(lkr, lang.code);
  const teaTotalLkr = lkr * qty;
  const delivery = convertFromLKR(DELIVERY_LKR, lang.code);
  const orderTotalLkr = teaTotalLkr + DELIVERY_LKR;
  const total = convertFromLKR(orderTotalLkr, lang.code);
  const soon = currentProduct.soon ? '\n⚠️ Note: Available within 1 week.' : '';
  const msg = 'Hi Abija Tea! 🍵\n\nI would like to order:\n- ' + name + '\n- Weight: ' + weight + '\n- Qty: ' + qty + '\n- Unit: ' + lang.sym + ' ' + price + ' (' + lang.code + ')' + '\n- Tea subtotal: ' + lang.sym + ' ' + convertFromLKR(teaTotalLkr, lang.code) + '\n- Delivery: ' + lang.sym + ' ' + delivery + '\n- Order total: ' + lang.sym + ' ' + total + ' (' + lang.code + ')' + soon + '\n\nMy delivery address is: \n\nPlease confirm my delivery date. Thank you!';
  trackEvent('begin_checkout', {
    currency: lang.code,
    value: numericFromLKR(orderTotalLkr, lang.code),
    items: [{ item_name: name, item_variant: weight, quantity: qty }]
  });
  trackEvent('generate_lead', {
    method: 'WhatsApp',
    currency: lang.code,
    value: numericFromLKR(orderTotalLkr, lang.code),
    items: [{ item_name: name, item_variant: weight, quantity: qty }]
  });
  closeDrawer();
  window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
}

// ── LANGUAGE SWITCHING ──
function setLang(lang) {
  currentLang = lang;
  loadLanguageFonts(lang);
  const c = CONTENT[lang];
  document.querySelectorAll('.lang-bar-btn').forEach(b => b.classList.remove('active'));
  const langButton = document.getElementById('btn-' + lang);
  if (langButton) langButton.classList.add('active');
  document.body.className = 'lang-' + lang;
  document.getElementById('nav-home').textContent = c.home;
  document.getElementById('nav-shop').textContent = c.shop;
  document.getElementById('nav-about').textContent = c.about;
  document.getElementById('mob-home').textContent = c.home;
  document.getElementById('mob-shop').textContent = c.shop;
  document.getElementById('mob-about').textContent = c.about;
  document.getElementById('hero-eyebrow').textContent = c.heroEye;
  document.getElementById('hero-title').innerHTML = c.heroTitle;
  document.getElementById('hero-sub').textContent = c.heroSub;
  document.getElementById('hero-desc').textContent = c.heroDesc;
  document.getElementById('btn-shop-now').textContent = c.shopNow;
  document.getElementById('btn-our-belief').textContent = c.ourBelief;
  document.getElementById('shop-eyebrow').textContent = c.shopEye;
  document.getElementById('shop-title').innerHTML = c.shopTitle;
  document.querySelectorAll('[data-' + lang + ']').forEach(el => {
    el.innerHTML = el.getAttribute('data-' + lang);
  });
  document.getElementById('about-eyebrow').textContent = c.aboutEye;
  document.getElementById('about-title').innerHTML = c.aboutTitle;
  document.getElementById('about-p1').textContent = c.aboutP1;
  document.getElementById('about-p2').textContent = c.aboutP2;
  document.getElementById('sl-stat1').textContent = c.stat1;
  document.getElementById('sl-stat2').textContent = c.stat2;
  document.getElementById('sl-stat3').textContent = c.stat3;
  document.getElementById('sl-stat4').textContent = c.stat4;
  document.getElementById('foot-home').textContent = c.home;
  document.getElementById('foot-shop').textContent = c.shop;
  document.getElementById('foot-about').textContent = c.about;
  document.getElementById('footer-copy').firstChild.textContent = c.footCopy + ' · ';
  document.getElementById('d-cta-label').textContent = c.orderBtn;
  refreshAllPrices();
}

// ── MOBILE MENU ──
let menuOpen = false;
function toggleMenu() {
  menuOpen = !menuOpen;
  document.getElementById('mobileMenu').classList.toggle('open', menuOpen);
  document.body.style.overflow = menuOpen ? 'hidden' : '';
  const btn = document.getElementById('burgerBtn');
  btn.setAttribute('aria-expanded', menuOpen);
  btn.setAttribute('aria-label', menuOpen ? 'Close navigation menu' : 'Open navigation menu');
  document.getElementById('b1').style.transform = menuOpen ? 'rotate(45deg) translate(4px,4px)' : '';
  document.getElementById('b2').style.opacity = menuOpen ? '0' : '1';
  document.getElementById('b3').style.transform = menuOpen ? 'rotate(-45deg) translate(4px,-4px)' : '';
}
function closeMenu() {
  menuOpen = false;
  document.getElementById('mobileMenu').classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('burgerBtn').setAttribute('aria-expanded', 'false');
  document.getElementById('burgerBtn').setAttribute('aria-label', 'Open navigation menu');
  document.getElementById('b1').style.transform = '';
  document.getElementById('b2').style.opacity = '1';
  document.getElementById('b3').style.transform = '';
}

// ── SCROLL NAV ──
window.addEventListener('scroll', () => {
  const links = [document.getElementById('nav-home'), document.getElementById('nav-shop'), document.getElementById('nav-about')];
  ['hero','shop','about'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.top <= 100 && r.bottom > 100) {
        links.forEach(l => l && l.classList.remove('active'));
        links[i] && links[i].classList.add('active');
      }
    }
  });
}, { passive: true });

window.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.getElementById('imageLightbox').classList.contains('open')) {
    closeImagePreview();
  }
});

// ── INIT ──
updateMonthlyOffer();
refreshAllPrices();
trackEvent('view_item_list', {
  item_list_name: 'Abija Tea Collection',
  items: ['Black BOP Tea', 'Black Dust Tea', 'Pure Green Tea', 'Silver Tips', 'Golden Tips'].map(item_name => ({ item_name }))
});
window.setInterval(updateMonthlyOffer, 60000);
window.addEventListener('load', () => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(detectLocationCurrency, { timeout: 2000 });
  } else {
    window.setTimeout(detectLocationCurrency, 500);
  }
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadAnalytics, { timeout: 5000 });
  } else {
    window.setTimeout(loadAnalytics, 3000);
  }
});
