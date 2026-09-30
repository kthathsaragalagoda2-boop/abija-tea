import { PRODUCTS, DETAILS, FEATURED, WEIGHTS, DELIVERY_LKR } from "./catalog.mjs";
import { REVIEWS_URL } from "./reviews-config.mjs";
export const slug = (name) => name.toLowerCase().replaceAll(" ", "-");
export const productUrl = (name) => "/tea/" + slug(name) + "/";
// Keep original catalogue images for zoom; deliver appropriately sized previews.
export function imageAttributes(name, sizes = "(max-width: 620px) calc(100vw - 36px), 320px") {
  const stem = PRODUCTS[name].img.replace("-1200.webp", "");
  const srcset = [320, 640, 960].map(width => `/assets/products/${stem}-${width}.webp ${width}w`).join(", ");
  return `src="/assets/products/${stem}-640.webp" srcset="${srcset}" sizes="${sizes}"`;
}
export function productCardMarkup(name, { money, price, t }) {
  const p = PRODUCTS[name],
    d = DETAILS[name];
  return `<article class="product-card"><a class="product-image" href="${productUrl(name)}" aria-label="View ${name}"><img ${imageAttributes(name)} alt="${name} from Abija Tea" width="400" height="400" loading="lazy"></a><h3><a href="${productUrl(name)}">${name}</a></h3><p>${d.notes[0]} · ${WEIGHTS[0]}–1kg</p><div class="price">${money(price(name))} <small>/ ${WEIGHTS[0]}</small></div><a class="button wide" href="${productUrl(name)}">${t("details")}</a></article>`;
}

export function productMarkup(name, { money, price, t, weightIndex = 1, quantity = 1, currency = "LKR" }) {
  const p = PRODUCTS[name], d = DETAILS[name];
  const markup = `<a class="breadcrumb" href="/#shop">← ${t("back")}</a><div class="product-shell"><div class="product-overview">
    <div class="desktop-gallery"><button class="main-photo" data-zoom aria-label="Enlarge ${name} photo"><img id="main-photo" ${imageAttributes(name, "(max-width: 760px) 320px, 500px")} fetchpriority="high" alt="${name}" width="500" height="500"></button><div class="thumbnails" aria-label="Product photo views"><button class="thumbnail" data-photo="0" aria-pressed="true" aria-label="Full product photo"><img ${imageAttributes(name, "64px")} alt="" width="64" height="64"></button><button class="thumbnail detail" data-photo="1" aria-pressed="false" aria-label="Close-up product photo"><img ${imageAttributes(name, "64px")} alt="" width="64" height="64"></button></div></div>
    <div class="mobile-carousel"><div class="carousel-track" id="carousel-track">${[0, 1].map((i) => `<button class="carousel-slide ${i ? "detail" : ""}" data-zoom aria-label="Enlarge ${name} ${i ? "detail" : "photo"}"><img ${imageAttributes(name, "(max-width: 540px) calc(100vw - 110px), 400px")} ${i ? 'loading="lazy"' : 'fetchpriority="high"'} alt="${name}${i ? " close-up" : ""}" width="400" height="400"></button>`).join("")}</div><button class="carousel-arrow prev" data-slide="prev" aria-label="Previous photo"><img src="/assets/chevron-left.svg" width="24" height="24" alt=""></button><button class="carousel-arrow next" data-slide="next" aria-label="Next photo"><img src="/assets/chevron-right.svg" width="24" height="24" alt=""></button><div class="carousel-dots" aria-label="Choose photo"><button data-slide="0" aria-label="Photo 1" aria-current="true"></button><button data-slide="1" aria-label="Photo 2" aria-current="false"></button></div></div>
    <div class="product-info"><p class="origin">PURE CEYLON · TALAWAKELLE, SRI LANKA</p><h1 id="product-title" tabindex="-1">${name}</h1><p class="description">${d.description}</p><div id="product-price" class="product-price" aria-live="polite"></div><fieldset class="weight-options"><legend>${t("size")}</legend>${WEIGHTS.map((w, i) => `<button class="weight-option" data-weight="${i}" aria-pressed="${i === weightIndex}" ${!p.avail[i] && !p.soon ? "disabled" : ""}>${w}</button>`).join("")}</fieldset><div class="product-facts"><span id="selected-weight">Weight: ${WEIGHTS[weightIndex]}</span><span>${d.notes[1]}</span></div><div class="purchase-row"><div class="quantity" aria-label="Quantity"><button id="quantity-minus" data-quantity="-1" aria-label="Decrease quantity">−</button><output id="product-quantity" aria-live="polite">${quantity}</output><button data-quantity="1" aria-label="Increase quantity">+</button></div><button class="button" id="add-to-bag">${p.soon ? t("preorder") : t("add")}</button></div><div class="badges"><span>CEYLON TEA</span><span>NO ADDED FLAVOURS</span></div><p class="delivery-note">${money(DELIVERY_LKR)} delivery · Kandy–Colombo / A1 area.<br>Usually 3–7 days. ${p.soon ? "Pre-order: availability within a week, subject to confirmation." : "Your order is confirmed on WhatsApp."}</p><p class="currency-note" ${currency === "LKR" ? "hidden" : ""}>Estimated conversion from LKR. Final amount confirmed on WhatsApp.</p><details class="brew"><summary>Make your perfect cup</summary><p>${d.brew}</p></details></div>
    </div><section class="recommendations"><h2>${t("related")}</h2><div class="product-grid">${FEATURED.filter(
      (n) => n !== name,
    )
      .map((n) => productCardMarkup(n, { money, price, t }))
      .join("")}</div></section></div>`;
  const reviewLink = `<a class="review-link" href="#customer-reviews"><span aria-hidden="true">☆ ☆ ☆ ☆ ☆</span> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M21 11a8 8 0 0 1-8 8H7l-4 3V11a9 9 0 0 1 18 0Z"/></svg> Rate &amp; comment</a>`;
  const reviewSection = `<section id="customer-reviews" class="customer-reviews" aria-label="Customer ratings and comments">${REVIEWS_URL ? `<iframe title="Customer ratings and comments for ${name}" src="${REVIEWS_URL}?product=${slug(name)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe><p><a href="${REVIEWS_URL}?product=${slug(name)}" target="_blank" rel="noopener">Open reviews in a new tab</a></p>` : '<h2>Customer reviews</h2><p>Reviews will be available soon.</p>'}</section>`;
  return markup.replace('</h1>', '</h1>' + reviewLink).replace('<section class="recommendations">', reviewSection + '<section class="recommendations">');
}
