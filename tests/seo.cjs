const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { readFileSync } = require("node:fs");
const path = require("node:path");

(async () => {
  const { DETAILS, PRODUCTS, currentLkrPrice } = await import("../catalog.mjs");
  const { productUrl, slug } = await import("../product-view.mjs");
  const base = "http://127.0.0.1:4173";
  const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE, args: ["--no-sandbox"] });
  const blockAnalytics = async context => context.route(/googletagmanager\.com|google-analytics\.com/, r => r.fulfill({ body: "" }));
  try {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    await blockAnalytics(context);
    const page = await context.newPage();
    const sitemap = readFileSync(path.join(__dirname, "../sitemap.xml"), "utf8");
    const titles = new Set();
    for (const [name, details] of Object.entries(DETAILS)) {
      const response = await page.goto(base + productUrl(name));
      assert.equal(response.status(), 200);
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await page.locator("h1").innerText(), name);
      assert.equal(await page.locator(".description").innerText(), details.description);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), "https://abijatea.me" + productUrl(name));
      assert.equal(await page.locator('meta[name="description"]').getAttribute("content"), details.description);
      assert.match(await page.locator('meta[name="robots"]').getAttribute("content"), /index, follow/);
      assert(sitemap.includes("https://abijatea.me" + productUrl(name)));
      titles.add(await page.title());
      const schema = JSON.parse(await page.locator("#catalog-schema").textContent());
      assert.equal(schema.name, "Abija " + name);
      assert(!schema.offers, "No stale build-time sale price in HTML");
      assert.equal(await page.locator(".breadcrumb").getAttribute("href"), "/#shop");
      assert(await page.locator(".brew").textContent().then(t => t.includes(details.brew)));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    assert.equal(titles.size, Object.keys(DETAILS).length);
    await context.close();

    for (const date of ["2026-09-29T12:00:00Z", "2026-10-01T12:00:00Z"]) {
      const c = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
      await blockAnalytics(c);
      const p = await c.newPage();
      const errors = [];
      p.on("pageerror", error => errors.push(error.message));
      await p.clock.install({ time: new Date(date) });
      for (const name of Object.keys(DETAILS)) {
        await p.goto(base + productUrl(name));
        await p.waitForFunction(() => JSON.parse(document.querySelector("#catalog-schema").textContent).offers);
        let schema = JSON.parse(await p.locator("#catalog-schema").textContent());
        assert.equal(schema.offers.price, currentLkrPrice(PRODUCTS[name], 1, new Date(date)));
        assert.equal(schema.offers.url, "https://abijatea.me" + productUrl(name));
        assert.equal(schema.offers.priceCurrency, "LKR");
        assert.equal(schema.offers.availability, PRODUCTS[name].soon ? "https://schema.org/PreOrder" : "https://schema.org/InStock");
        assert.equal(Boolean(schema.offers.priceValidUntil), date.startsWith("2026-09"));
        await p.locator('[data-weight="0"]').click();
        schema = JSON.parse(await p.locator("#catalog-schema").textContent());
        assert.equal(schema.offers.price, currentLkrPrice(PRODUCTS[name], 0, new Date(date)));
        await p.goto(base + "/#tea/" + slug(name));
        await p.waitForURL(base + productUrl(name));
        assert.equal(await p.locator("h1").innerText(), name);
      }
      await p.goto(base + productUrl("Pure Green Tea"));
      await p.waitForFunction(() => document.querySelector("#product-price").textContent.includes("Rs"));
      if (date.startsWith("2026-09")) await p.screenshot({ path: "/tmp/abija-seo-product-mobile.png", fullPage: true });
      await p.locator(".breadcrumb").click();
      await p.waitForURL(base + "/#shop");
      assert.equal(await p.locator(".experience").count(), 3);
      assert.deepEqual(errors, []);
      await c.close();
    }
    console.log("PASS: five indexable no-JS product pages, unique metadata, sitemap, real links, legacy URLs, offer prices before/after sale, stock and pack changes.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
