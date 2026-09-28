# Abija Tea

A responsive static storefront based on the Abija Tea Figma design. No build step or runtime framework is required. Serve this directory with the existing static hosting configuration.

## Local preview

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. Products use real `/tea/<product>/` URLs backed by
committed `index.html` files. The static host must serve directory index files;
no application server or SPA rewrite is required. Old `#tea/…` links redirect
in the browser to their matching product page.

## Verification

```sh
node --test tests/pricing.test.mjs
npm install --prefix /tmp/abija-browser-tests playwright@1.63.0
/tmp/abija-browser-tests/node_modules/.bin/playwright install chromium
NODE_PATH=/tmp/abija-browser-tests/node_modules node tests/browser.cjs
```

Keep the preview server running while running the browser checks. To use an existing Chrome installation, set `CHROME_EXECUTABLE=/usr/bin/google-chrome`. Test dependencies stay outside the repository so the existing static host does not detect a new Node build requirement. Browser checks intercept Google Analytics and WhatsApp requests: no test order or analytics visit is sent to those services. Screenshots are saved under `/tmp/abija-*.png`.

The pricing tests compare all products and weights to pre-redesign commit `f05f49b`, including the exact September offer expiry. Use a full Git checkout to run them.

## Store settings

- `catalog.mjs`: existing prices, pack sizes, availability, Rs 450 delivery, offer deadline, and WhatsApp number. The unusual green/tips pack-price ratios intentionally match the old site.
- `app.js`: product routes, search, persistent bag, currency conversion, translations for core navigation and purchase controls, and checkout. Descriptions remain in English.
- `product-view.mjs`: shared product markup for the browser and static generator.
- `scripts/build-seo.mjs`: run `node scripts/build-seo.mjs` after changing the
  catalogue, shared product markup, or homepage shell. Commit the generated
  `tea/*/index.html` files and `sitemap.xml` with the change. No packages required.
- `styles.css`: responsive Figma-inspired cream, sage, and gold presentation.
- `assets/`: locally saved SVG icons from the Figma design. Product imagery is supplied by the existing catalogue.
- Google Tag Manager: `GTM-TS7BGZVC`, with the original noscript fallback and ecommerce events. The existing published GTM/GA4 configuration remains responsible for collecting events.

Customers send an order request through WhatsApp; this website does not charge payments or claim a completed purchase. Prices are recomputed at checkout, including after the offer expires. Currency conversions are estimates; if the rate service is unavailable, the last successfully selected currency is retained.

## Product SEO checks

`tests/seo.cjs` uses the same Playwright setup as `tests/browser.cjs`. It checks
all five product pages with JavaScript disabled, distinct page metadata,
self-referencing canonicals, sitemap coverage, legacy URLs, and runtime Offer
prices before/after the September offer expires. The static HTML contains
descriptions, images, pack sizes, brewing, delivery information, Product and
BreadcrumbList markup. Actual prices and Offer markup are computed in the
browser from the catalogue so static cached HTML cannot advertise an expired
discount. No ratings or reviews are invented. Google may render JavaScript to
read the offer, and rich-result eligibility is not a ranking guarantee.

After deployment, submit `https://abijatea.me/sitemap.xml` in Search Console,
inspect a product URL, and validate its rendered Product markup with Google's
Rich Results Test. Search Console access and indexing submissions are separate
from a code deployment; this repository does not perform them automatically.

Merging to `main` updates the source for the existing host. Deployment is controlled by that host, not by this repository's application code.
# Mobile performance maintenance

Product previews use `assets/products/*-{320,640,960}.webp` with responsive
`srcset`. The original catalogue photos remain available for full-size zoom.
The three initial experience cards are present in HTML; keep their copy and
image attributes aligned with `catalog.mjs` and `renderHome()` when editing.
Prices are populated at runtime so cached HTML cannot retain an expired sale.
Fonts are locally hosted Latin variable subsets (licenses in `assets/fonts`),
with optional font display to avoid a late layout shift. Sinhala and Tamil
continue to use system fallback fonts.

Run `tests/performance.cjs` with the same Playwright setup as `tests/browser.cjs`.
It deliberately delays JavaScript to check the initial layout independently.

Hosting cache headers require configuration in the active hosting/CDN service;
this patch does not change Cloudflare or DigitalOcean settings. For these
unversioned assets use a short cache lifetime with revalidation, or introduce
content-hashed filenames before setting a year-long immutable cache. Keep HTML
revalidated so deployments and sale logic updates are picked up promptly.
