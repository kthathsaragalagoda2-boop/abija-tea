// Regression checks for the initial HTML and delayed JavaScript on mobile.
// Run with the same Playwright / CHROME_EXECUTABLE setup as browser.cjs.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const { readFileSync, statSync } = require("node:fs");
const path = require("node:path");

(async () => {
  const root = path.resolve(__dirname, "..");
  for (const name of ["Dust", "Green", "BOP", "Silver", "Golden"]) {
    assert(statSync(path.join(root, `assets/products/${name}-320.webp`)).size < 35000);
  }
  const html = readFileSync(path.join(root, "index.html"), "utf8");
  assert(!html.includes("fonts.googleapis.com"));
  assert(html.includes("GTM-TS7BGZVC"));
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_EXECUTABLE || undefined,
    args: ["--no-sandbox"],
  });
  try {
    for (const width of [320, 390, 540, 760, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 844 } });
      await context.route(/googletagmanager\.com|google-analytics\.com/, r => r.fulfill({body: ""}));
      let release;
      const gate = new Promise(resolve => { release = resolve; });
      await context.route("**/app.js", async r => { await gate; await r.continue(); });
      const page = await context.newPage();
      await page.goto("http://127.0.0.1:4173/", { waitUntil: "commit" });
      await page.locator(".experience img").first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      const before = await page.locator("#experiences").boundingBox();
      assert.equal(await page.locator(".experience").count(), 3);
      const originalHero = await page.locator(".experience img").first().elementHandle();
      release();
      await page.waitForFunction(() => window.dataLayer?.some(e => e.event === "view_item_list"));
      const after = await page.locator("#experiences").boundingBox();
      assert(Math.abs(before.y - after.y) < 1, `Hero moved after JS at ${width}px`);
      assert(await originalHero.evaluate(el => el === document.querySelector(".experience img")));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      for (const img of await page.locator("#home-view img").all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(el => el.decode());
      }
      await page.evaluate(() => scrollTo({top: 0, behavior: "instant"}));
      if (width === 390) await page.screenshot({ path: "/tmp/abija-performance-mobile.png", fullPage: true });
      await context.close();
    }
    console.log("PASS: responsive asset budgets, initial HTML hero, retained hero node, stable delayed-JS layout and no overflow at five widths.");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
