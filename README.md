# Abija Tea

A responsive static storefront based on the Abija Tea Figma design. No build step or runtime framework is required. Serve this directory with the existing static hosting configuration.

## Local preview

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. Product links use hash routes, so no server rewrite rules are needed.

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
- `styles.css`: responsive Figma-inspired cream, sage, and gold presentation.
- `assets/`: locally saved SVG icons from the Figma design. Product imagery is supplied by the existing catalogue.
- Google Tag Manager: `GTM-TS7BGZVC`, with the original noscript fallback and ecommerce events. The existing published GTM/GA4 configuration remains responsible for collecting events.

Customers send an order request through WhatsApp; this website does not charge payments or claim a completed purchase. Prices are recomputed at checkout, including after the offer expires. Currency conversions are estimates; if the rate service is unavailable, the last successfully selected currency is retained.

Merging to `main` updates the source for the existing host. Deployment is controlled by that host, not by this repository's application code.
