import { slug, productUrl, imageAttributes, productCardMarkup, productMarkup } from "./product-view.mjs";
import {
  PRODUCTS,
  DETAILS,
  FEATURED,
  WEIGHTS,
  ORIG_LKR,
  DELIVERY_LKR,
  MONTHLY_SALE_PERCENT,
  monthlySaleIsActive,
  currentLkrPrice,
  cartTotals,
  WA_NUMBER,
} from "./catalog.mjs";

// Preserve the existing GTM container and GA4 ecommerce data-layer events.
window.dataLayer = window.dataLayer || [];
function trackEvent(event, params = {}) {
  window.dataLayer.push({ event, ...params });
}
function loadAnalytics() {
  if (document.querySelector('script[src*="googletagmanager.com/gtm.js"]'))
    return;
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtm.js?id=GTM-TS7BGZVC";
  document.head.appendChild(script);
}
const $ = (id) => document.getElementById(id);
const names = Object.keys(DETAILS);

const stored = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Shopping works without browser storage. */
  }
};
let cart = stored("abija-bag-v1", []);
cart = Array.isArray(cart)
  ? cart
      .filter(
        (i) =>
          i &&
          names.includes(i.name) &&
          Number.isInteger(i.weight) &&
          i.weight >= 0 &&
          i.weight < WEIGHTS.length &&
          Number.isInteger(i.qty) &&
          i.qty > 0 &&
          i.qty <= 99 &&
          (PRODUCTS[i.name].avail[i.weight] || PRODUCTS[i.name].soon),
      )
      .slice(0, 20)
  : [];
let language = stored("abija-language", "en");
if (!["en", "si", "ta"].includes(language)) language = "en";
let currency = "LKR",
  rates = { LKR: 1 },
  currentName = null,
  weightIndex = 1,
  quantity = 1,
  slideIndex = 0;
let currencyRequest = 0,
  ratePromise,
  toastTimer;
const COPY = {
  en: {
    shop: "Shop All",
    title: "A tea for every moment.",
    intro: "Three simple rituals. One honest cup of Ceylon tea.",
    collection: "The Abija collection",
    about: "Our story",
    bag: "Your shopping bag",
    choose: "CHOOSE YOUR TEA",
    add: "ADD TO BAG",
    added: "Added to your shopping bag",
    size: "Pack size",
    checkout: "ORDER ON WHATSAPP",
    back: "Back to all teas",
    related: "You might also like",
    details: "VIEW TEA",
    preorder: "PRE-ORDER",
    from: "From",
  },
  si: {
    shop: "තේ එකතුව",
    title: "සෑම මොහොතකටම තේ.",
    intro: "ඔබේ දවසට පිරිසිදු ලංකා තේ කෝප්පයක්.",
    collection: "අබිජා තේ එකතුව",
    about: "අපේ කතාව",
    bag: "ඔබේ ඇණවුම",
    choose: "තේ තෝරන්න",
    add: "ඇණවුමට එක් කරන්න",
    added: "ඇණවුමට එක් කරන ලදී",
    size: "පැකට් ප්‍රමාණය",
    checkout: "WhatsApp හරහා ඇණවුම් කරන්න",
    back: "තේ එකතුවට ආපසු",
    related: "ඔබ කැමති විය හැකි තේ",
    details: "තේ බලන්න",
    preorder: "පෙර ඇණවුම් කරන්න",
    from: "සිට",
  },
  ta: {
    shop: "அனைத்து தேயிலைகள்",
    title: "ஒவ்வொரு தருணத்திற்கும் தேநீர்.",
    intro: "உங்கள் நாளுக்கு ஒரு கோப்பை தூய இலங்கை தேநீர்.",
    collection: "அபிஜா தேயிலைத் தொகுப்பு",
    about: "எங்கள் கதை",
    bag: "உங்கள் பை",
    choose: "தேயிலையைத் தேர்ந்தெடுக்கவும்",
    add: "பையில் சேர்க்கவும்",
    added: "உங்கள் பையில் சேர்க்கப்பட்டது",
    size: "பொதி அளவு",
    checkout: "WhatsApp வழியாக ஆர்டர்",
    back: "தேயிலைகளுக்குத் திரும்பு",
    related: "நீங்கள் விரும்பக்கூடியவை",
    details: "தேயிலையைப் பார்க்க",
    preorder: "முன்பதிவு",
    from: "முதல்",
  },
};
const t = (key) => COPY[language][key] || COPY.en[key];
const numeric = (lkr) =>
  currency === "LKR"
    ? Math.round(lkr)
    : Number((lkr * rates[currency]).toFixed(2));
const money = (lkr) =>
  currency === "LKR"
    ? "Rs " + Math.round(lkr).toLocaleString("en-US")
    : new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
        numeric(lkr),
      );
const price = (name, index = 0) => currentLkrPrice(PRODUCTS[name], index);
function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("visible"), 2600);
}
function productCard(name) {
  return productCardMarkup(name, { money, price, t });
}
let homeHydrated = false;
function renderHome() {
  if (!$("experiences")) return;
  if (!homeHydrated && language === "en") {
    // Retain the already-loading hero image and update only dynamic prices.
    document.querySelectorAll(".experience-price").forEach((el, i) => {
      el.innerHTML = `${money(price(FEATURED[i]))} <small>/ ${WEIGHTS[0]}</small>`;
    });
  } else $("experiences").innerHTML = FEATURED.map((name, i) => {
    const p = PRODUCTS[name],
      d = DETAILS[name];
    return `<article class="experience ${d.tone}"><a class="experience-photo" href="${productUrl(name)}" aria-label="Explore ${name}"><img ${imageAttributes(name, "(max-width: 620px) calc((100vw - 60px) / 2), (max-width: 1120px) 42vw, 488px")} alt="${name} with its Abija packaging" width="500" height="400" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}></a><div class="experience-copy"><h2>${d.ritual}</h2><p>${d.intro}</p><div class="experience-price">${money(price(name))} <small>/ ${WEIGHTS[0]}</small></div><a class="button" href="${productUrl(name)}">${t("choose")}</a></div></article>`;
  }).join("");
  homeHydrated = true;
  $("product-grid").innerHTML = FEATURED.map(productCard).join("");
  $("limited-grid").innerHTML = ["Silver Tips", "Golden Tips"]
    .map(
      (name) =>
        `<article class="limited-card"><img ${imageAttributes(name, "180px")} alt="${name}" width="125" height="180" loading="lazy"><div><h3>${name}</h3><p>${DETAILS[name].intro}<br>Available within a week · please confirm.</p><a class="text-link" href="${productUrl(name)}">${t("details")} →</a></div></article>`,
    )
    .join("");
}
function renderProduct() {
  const name = currentName,
    p = PRODUCTS[name],
    d = DETAILS[name];
  $("product-view").innerHTML =
    productMarkup(name, { money, price, t, weightIndex, quantity, currency });
  updateProductPrice();
  slideIndex = 0;
  const track = $("carousel-track");
  track.addEventListener(
    "scroll",
    () => {
      const step = track.firstElementChild.getBoundingClientRect().width + 12;
      slideIndex = Math.min(
        1,
        Math.max(0, Math.round(track.scrollLeft / step)),
      );
      document
        .querySelectorAll(".carousel-dots button")
        .forEach((b, i) =>
          b.setAttribute("aria-current", String(i === slideIndex)),
        );
    },
    { passive: true },
  );
}
function updateProductPrice() {
  if (!currentName) return;
  const amount = price(currentName, weightIndex),
    original = ORIG_LKR[PRODUCTS[currentName].group][weightIndex];
  $("product-price").innerHTML =
    `<span>${money(amount)}</span>${amount < original ? `<del>${money(original)}</del>` : ""}${monthlySaleIsActive() ? `<span class="sale-label">${MONTHLY_SALE_PERCENT}% SEPTEMBER OFFER</span>` : ""}<button class="icon-button" data-info aria-label="Tea brewing information"><img src="/assets/info.svg" width="26" height="26" alt=""></button>`;
  $("selected-weight").textContent = "Weight: " + WEIGHTS[weightIndex];
  $("product-quantity").textContent = quantity;
  $("quantity-minus").disabled = quantity === 1;
  updateStructuredData();
  document
    .querySelectorAll("[data-weight]")
    .forEach((b) =>
      b.setAttribute(
        "aria-pressed",
        String(Number(b.dataset.weight) === weightIndex),
      ),
    );
}
function renderCart() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  $("cart-count").textContent = count;
  $("cart-count").hidden = !count;
  $("cart-open").setAttribute(
    "aria-label",
    `Open shopping bag, ${count} ${count === 1 ? "item" : "items"}`,
  );
  if (!cart.length) {
    $("cart-items").innerHTML =
      '<div class="empty-cart"><h3>A good cup is waiting.</h3><p>Your bag is empty. Find your everyday tea.</p><a class="button" href="#shop" data-close="cart-dialog">Explore the teas</a></div>';
    $("cart-summary").innerHTML = "";
    return;
  }
  $("cart-items").innerHTML = cart
    .map(
      (item, i) =>
        `<article class="cart-item"><img ${imageAttributes(item.name, "76px")} alt="${item.name}" width="76" height="94"><div><h3>${item.name}</h3><p>${WEIGHTS[item.weight]} · ${money(price(item.name, item.weight))} each${PRODUCTS[item.name].soon ? " · Pre-order" : ""}</p><div class="cart-item-controls"><div class="quantity"><button data-cart-change="${i}" data-delta="-1" aria-label="Decrease ${item.name} quantity" ${item.qty === 1 ? "disabled" : ""}>−</button><output>${item.qty}</output><button data-cart-change="${i}" data-delta="1" aria-label="Increase ${item.name} quantity">+</button></div><button class="text-link" data-remove="${i}">Remove</button></div><p>${money(price(item.name, item.weight) * item.qty)}</p></div></article>`,
    )
    .join("");
  const totals = cartTotals(cart);
  $("cart-summary").innerHTML =
    `<div class="summary-row"><span>Tea subtotal</span><span>${money(totals.subtotal)}</span></div><div class="summary-row"><span>Delivery</span><span>${money(totals.delivery)}</span></div><div class="summary-row total"><span>Total</span><span>${money(totals.total)}</span></div><a class="button wide" id="checkout" href="${checkoutUrl()}" target="_blank" rel="noopener">${t("checkout")} ↗</a><p>Delivery: Kandy–Colombo / A1 area, usually 3–7 days. We confirm your address, availability, and final total on WhatsApp. No payment is taken here.</p>${currency !== "LKR" ? "<p>Converted estimate. The LKR total is also included in your order.</p>" : ""}`;
}
function checkoutUrl() {
  const totals = cartTotals(cart);
  const lines = cart.map(
    (i) =>
      `- ${i.name} · ${WEIGHTS[i.weight]} × ${i.qty}\n  Unit: ${money(price(i.name, i.weight))} | Subtotal: ${money(price(i.name, i.weight) * i.qty)}${PRODUCTS[i.name].soon ? "\n  Pre-order: please confirm availability within a week." : ""}`,
  );
  const msg = `Hi Abija Tea! 🍵\n\nI would like to order:\n${lines.join("\n\n")}\n\nTea subtotal: ${money(totals.subtotal)}\nDelivery: ${money(totals.delivery)}\nOrder total: ${money(totals.total)} (${currency})${currency !== "LKR" ? "\nLKR total: Rs " + totals.total.toLocaleString("en-US") : ""}\n\nMy delivery address is: \n\nPlease confirm availability and my delivery date. Thank you!`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}
function addToCart() {
  const p = PRODUCTS[currentName];
  if (!p || (!p.avail[weightIndex] && !p.soon)) return;
  const item = cart.find(
    (i) => i.name === currentName && i.weight === weightIndex,
  );
  if ((item?.qty || 0) + quantity > 99) {
    toast("For more than 99 packs, please contact us on WhatsApp.");
    return;
  }
  if (item) item.qty += quantity;
  else cart.push({ name: currentName, weight: weightIndex, qty: quantity });
  save("abija-bag-v1", cart);
  renderCart();
  trackEvent("add_to_cart", {
    currency,
    value: numeric(price(currentName, weightIndex) * quantity),
    items: [
      {
        item_name: currentName,
        item_variant: WEIGHTS[weightIndex],
        quantity,
        price: numeric(price(currentName, weightIndex)),
      },
    ],
  });
  toast(t("added"));
  $("cart-dialog").showModal();
}
function renderSearch() {
  const query = $("search-input").value.trim().toLowerCase();
  const found = names.filter((name) =>
    (name + " " + DETAILS[name].description).toLowerCase().includes(query),
  );
  $("search-results").innerHTML = found.length
    ? found
        .map(
          (name) =>
            `<a class="search-result" href="${productUrl(name)}" data-close="search-dialog"><img ${imageAttributes(name, "180px")} alt="" width="64" height="64"><div><strong>${name}</strong><p>${money(price(name))} / ${WEIGHTS[0]}${PRODUCTS[name].soon ? " · Pre-order" : ""}</p></div></a>`,
        )
        .join("")
    : "<p>No teas found. Try “black”, “green”, or “tips”.</p>";
}
function updateSale() {
  const active = monthlySaleIsActive();
  $("sale-banner").style.visibility = active ? "visible" : "hidden";
  if (active)
    $("sale-banner").textContent =
      "September offer · 30% off original prices · Ends 30 Sep";
}
function setLanguage() {
  document.documentElement.lang = language;
  document.body.className = "lang-" + language;
  $("language").value = language;
  document
    .querySelectorAll("[data-i18n]")
    .forEach((el) => (el.textContent = t(el.dataset.i18n)));
}
function refresh() {
  renderHome();
  if (currentName) renderProduct();
  renderCart();
  renderSearch();
  updateSale();
  setLanguage();
}
function route({ focus = false } = {}) {
  const hash = location.hash.slice(1);
  // Preserve old shared/bookmarked hash links, but send visitors to real pages.
  const legacyName = hash.startsWith("tea/")
    ? names.find((n) => slug(n) === hash.slice(4)) : null;
  if (legacyName) {
    location.replace(productUrl(legacyName));
    return;
  }
  const name = names.find((n) => location.pathname === productUrl(n)) || null;
  currentName = name || null;
  $("home-view").hidden = !!name;
  $("product-view").hidden = !name;
  if (name) {
    weightIndex = 1;
    quantity = 1;
    renderProduct();
    document.title = `${name} | Pure Ceylon Tea | Abija Tea`;
    window.scrollTo({ top: 0, behavior: "instant" });
    if (focus) $("product-title").focus({ preventScroll: true });
    trackEvent("view_item", {
      currency,
      value: numeric(price(name, weightIndex)),
      items: [{ item_name: name, item_category: PRODUCTS[name].group }],
    });
    trackEvent("select_item", {
      item_list_name: "Abija Tea Collection",
      items: [{ item_name: name, item_category: PRODUCTS[name].group }],
    });
  } else {
    document.title = "Abija Tea | Pure Ceylon Tea, Talawakelle Estate";
    if (["shop", "about", "hero", "faq"].includes(hash))
      requestAnimationFrame(() =>
        document.getElementById(hash)?.scrollIntoView(),
      );
    else if (focus) window.scrollTo({ top: 0, behavior: "instant" });
  }
}
async function fetchRates() {
  if (rates.USD && rates.GBP && rates.INR) return;
  ratePromise ||= fetch("https://open.er-api.com/v6/latest/LKR", {
    signal: AbortSignal.timeout(7000),
  })
    .then((r) => {
      if (!r.ok) throw new Error("Rate request failed");
      return r.json();
    })
    .then((data) => {
      for (const code of ["USD", "GBP", "INR"])
        if (!Number.isFinite(data.rates?.[code]) || data.rates[code] <= 0)
          throw new Error("Invalid rate");
      rates = { ...data.rates, LKR: 1 };
    })
    .catch((error) => {
      ratePromise = null;
      throw error;
    });
  return ratePromise;
}
document.addEventListener("click", (event) => {
  if (event.target.closest('[data-info]')) {
    const brew = document.querySelector('.brew');
    brew.open = true;
    brew.querySelector('summary').focus();
  }
  const reviewOpen = event.target.closest("[data-open-reviews]");
  if (reviewOpen) {
    const dialog = $("review-dialog");
    const frame = dialog.querySelector("iframe");
    if (!frame.src) frame.src = frame.dataset.reviewSrc;
    dialog.showModal();
    dialog.querySelector("[data-close]").focus();
  }
  const close = event.target.closest("[data-close]");
  if (close) $(close.dataset.close).close();
  const weight = event.target.closest("[data-weight]");
  if (weight && !weight.disabled) {
    weightIndex = Number(weight.dataset.weight);
    updateProductPrice();
  }
  const qty = event.target.closest("[data-quantity]");
  if (qty) {
    quantity = Math.min(
      99,
      Math.max(1, quantity + Number(qty.dataset.quantity)),
    );
    updateProductPrice();
  }
  if (event.target.closest("#add-to-bag")) addToCart();
  const change = event.target.closest("[data-cart-change]"),
    remove = event.target.closest("[data-remove]");
  if (change || remove) {
    if (change) {
      const i = cart[Number(change.dataset.cartChange)];
      if (i)
        i.qty = Math.min(99, Math.max(1, i.qty + Number(change.dataset.delta)));
    }
    if (remove) {
      const [item] = cart.splice(Number(remove.dataset.remove), 1);
      if (item)
        trackEvent("remove_from_cart", {
          currency,
          value: numeric(price(item.name, item.weight) * item.qty),
          items: [
            {
              item_name: item.name,
              item_variant: WEIGHTS[item.weight],
              quantity: item.qty,
            },
          ],
        });
    }
    save("abija-bag-v1", cart);
    renderCart();
  }
  const photo = event.target.closest("[data-photo]");
  if (photo) {
    $("main-photo").style.transform =
      photo.dataset.photo === "1" ? "scale(1.8)" : "";
    document
      .querySelectorAll("[data-photo]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === photo)));
  }
  if (event.target.closest("[data-zoom]") && currentName) {
    $("zoom-image").src = "/" + PRODUCTS[currentName].img;
    $("zoom-image").alt = currentName;
    $("image-dialog").showModal();
    trackEvent("view_item_image", { item_name: currentName });
  }
  const slide = event.target.closest("[data-slide]");
  if (slide) {
    const value = slide.dataset.slide;
    const next =
      value === "next"
        ? (slideIndex + 1) % 2
        : value === "prev"
          ? (slideIndex + 1) % 2
          : Number(value);
    const track = $("carousel-track");
    track.scrollTo({
      left: next * (track.firstElementChild.getBoundingClientRect().width + 12),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  const checkout = event.target.closest("#checkout");
  if (checkout) {
    if (!cart.length) {
      event.preventDefault();
      return;
    }
    checkout.href = checkoutUrl();
    const totals = cartTotals(cart);
    const params = {
      currency,
      value: numeric(totals.total),
      items: cart.map((i) => ({
        item_name: i.name,
        item_variant: WEIGHTS[i.weight],
        quantity: i.qty,
        price: numeric(price(i.name, i.weight)),
      })),
    };
    trackEvent("begin_checkout", params);
    trackEvent("generate_lead", { method: "WhatsApp", ...params });
  }
});
$("search-open").addEventListener("click", () => {
  renderSearch();
  $("search-dialog").showModal();
  $("search-input").focus();
});
$("search-input").addEventListener("input", renderSearch);
$("cart-open").addEventListener("click", () => {
  renderCart();
  $("cart-dialog").showModal();
  trackEvent("view_cart", {
    currency,
    value: numeric(cartTotals(cart).subtotal),
    items: cart.map((i) => ({
      item_name: i.name,
      item_variant: WEIGHTS[i.weight],
      quantity: i.qty,
    })),
  });
});
document.querySelectorAll("dialog").forEach((dialog) =>
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      dialog.close();
  }),
);
$("language").addEventListener("change", () => {
  language = $("language").value;
  save("abija-language", language);
  refresh();
});
$("currency").addEventListener("change", async () => {
  const next = $("currency").value,
    request = ++currencyRequest;
  if (next === "LKR") {
    currency = "LKR";
    save("abija-currency", currency);
    refresh();
    return;
  }
  try {
    await fetchRates();
    if (request !== currencyRequest) return;
    currency = next;
    save("abija-currency", currency);
    refresh();
  } catch {
    if (request !== currencyRequest) return;
    $("currency").value = currency;
    toast(
      "Live exchange rates are unavailable. Prices stay in " + currency + ".",
    );
  }
});
window.addEventListener("hashchange", () => route({ focus: true }));
$("year").textContent = new Date().getFullYear();
refresh();
route();
trackEvent("view_item_list", {
  item_list_name: "Abija Tea Collection",
  items: names.map((item_name) => ({ item_name })),
});
let lastSaleState = monthlySaleIsActive();
setInterval(() => {
  const active = monthlySaleIsActive();
  if (active !== lastSaleState) {
    lastSaleState = active;
    refresh();
    updateStructuredData();
  }
}, 30000);
function updateStructuredData() {
  let script = $("catalog-schema");
  if (!script) {
    script = document.createElement("script");
    script.id = "catalog-schema";
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  // A product offer belongs to its dedicated page and currently selected pack.
  // Compute it at runtime so a cached page cannot advertise an expired sale.
  const name = currentName;
  script.textContent = JSON.stringify(name ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": "https://abijatea.me" + productUrl(name) + "#product",
    name: "Abija " + name,
    url: "https://abijatea.me" + productUrl(name),
    image: "https://abijatea.me/" + PRODUCTS[name].img,
    description: DETAILS[name].description,
    brand: { "@type": "Brand", name: "Abija Tea" },
    offers: {
      "@type": "Offer",
      url: "https://abijatea.me" + productUrl(name),
      name: name + " — " + WEIGHTS[weightIndex],
      price: price(name, weightIndex),
      priceCurrency: "LKR",
      availability: PRODUCTS[name].soon ? "https://schema.org/PreOrder"
        : PRODUCTS[name].avail[weightIndex] ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      ...(monthlySaleIsActive() ? { priceValidUntil: "2026-09-30" } : {}),
    },
  } : {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: names.map((n, i) => ({
      "@type": "ListItem", position: i + 1, name: n,
      url: "https://abijatea.me" + productUrl(n),
    })),
  });
}
updateStructuredData();
const preferredCurrency = stored("abija-currency", "LKR");
if (["USD", "GBP", "INR"].includes(preferredCurrency)) {
  $("currency").value = preferredCurrency;
  $("currency").dispatchEvent(new Event("change"));
}
if ("requestIdleCallback" in window)
  window.requestIdleCallback(loadAnalytics, { timeout: 5000 });
else setTimeout(loadAnalytics, 3000);
