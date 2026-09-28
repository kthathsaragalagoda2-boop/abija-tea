// Run with Playwright available in NODE_PATH. Uses an isolated, headless Chrome.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_EXECUTABLE || undefined,
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.clock.install({ time: new Date("2026-09-28T12:00:00Z") });
  // Never send test visits or orders to the live analytics / messaging services.
  await context.route("**/*googletagmanager.com/**", (r) =>
    r.fulfill({ status: 200, body: "" }),
  );
  await context.route("**/*google-analytics.com/**", (r) =>
    r.fulfill({ status: 204, body: "" }),
  );
  await context.route("https://wa.me/**", (r) =>
    r.fulfill({
      status: 200,
      contentType: "text/html",
      body: "Test order preview — not sent.",
    }),
  );
  await context.route("https://open.er-api.com/**", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ rates: { USD: 0.0033, GBP: 0.0025, INR: 0.28 } }),
    }),
  );
  await page.goto("http://127.0.0.1:4173");
  await page.locator(".experience").first().waitFor();
  assert.equal(await page.locator(".experience").count(), 3);
  await page.screenshot({ path: "/tmp/abija-desktop.png", fullPage: true });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.locator(".experience.sand .button").click();
  await page.locator("#product-title").waitFor();
  assert.equal(
    await page.locator("#product-title").innerText(),
    "Black Dust Tea",
  );
  assert.match(await page.locator("#product-price").innerText(), /Rs 438/);
  await page.locator('[data-weight="0"]').click();
  assert.match(await page.locator("#product-price").innerText(), /Rs 175/);
  await page.locator('[data-quantity="1"]').click();
  await page.locator("#add-to-bag").click();
  assert.match(
    await page.locator("#cart-summary .total").innerText(),
    /Rs 800/,
  );
  const message = new URL(
    await page.locator("#checkout").getAttribute("href"),
  ).searchParams.get("text");
  assert.match(message, /100g × 2/);
  assert.match(message, /Order total: Rs 800/);
  await page.locator('[data-close="cart-dialog"]').click();
  await page.locator("#search-open").click();
  await page.locator("#search-input").fill("green");
  assert.equal(await page.locator(".search-result").count(), 1);
  await page.locator(".search-result").click();
  await page
    .locator("#product-title")
    .filter({ hasText: "Pure Green Tea" })
    .waitFor();
  await page.locator("#add-to-bag").click();
  assert.match(
    await page.locator("#cart-summary .total").innerText(),
    /Rs 3,425/,
  );
  await page.keyboard.press("Escape");
  const beforeReloadEvents = await page.evaluate(() => window.dataLayer.map(e => e.event));
  assert(beforeReloadEvents.includes('add_to_cart'));
  assert(beforeReloadEvents.includes('select_item'));
  await page.reload();
  await page.locator("#cart-open").click();
  assert.equal(await page.locator(".cart-item").count(), 2);
  const popupPromise = page.waitForEvent("popup");
  await page.locator("#checkout").click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  assert.match(popup.url(), /wa.me\/94775670480/);
  await popup.close();
  const events = await page.evaluate(() =>
    window.dataLayer.map((e) => e.event),
  );
  for (const event of [
    "view_item_list",
    "view_item",
    "select_item",
    "add_to_cart",
    "view_cart",
    "begin_checkout",
    "generate_lead",
  ]) {
    // Item events occurred before reload; validate post-reload ones separately below.
    if (["select_item", "add_to_cart"].includes(event)) continue;
    assert(events.includes(event), event);
  }
  await page.keyboard.press("Escape");
  await page.locator("#currency").selectOption("USD");
  await page.waitForFunction(() =>
    document.querySelector("#product-price").textContent.includes("$8.66"),
  );
  await page.locator("#currency").selectOption("LKR");
  await page.screenshot({
    path: "/tmp/abija-product-desktop.png",
    fullPage: true,
  });
  await page.locator('[data-photo="1"]').click();
  assert.equal(
    await page.locator("#main-photo").evaluate((e) => e.style.transform),
    "scale(1.8)",
  );
  await page.locator("[data-zoom]").first().click();
  await page.keyboard.press("Escape");
  for (const width of [390, 320, 768]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "overflow " + width,
    );
    if (width === 390) {
      await page.screenshot({ path: "/tmp/abija-mobile.png", fullPage: true });
      await page.locator('[data-slide="next"]').click();
      await page.waitForFunction(
        () =>
          document
            .querySelector('.carousel-dots [data-slide="1"]')
            .getAttribute("aria-current") === "true",
      );
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("a.breadcrumb").click();
  await page.screenshot({ path: "/tmp/abija-home-mobile.png", fullPage: true });
  await page.locator("#language").selectOption("si");
  assert.equal(await page.locator("html").getAttribute("lang"), "si");
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
    "Sinhala overflow",
  );
  await page.locator("#language").selectOption("ta");
  assert.equal(await page.locator("html").getAttribute("lang"), "ta");
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
    "Tamil overflow",
  );
  await page.locator("#language").selectOption("en");
  await page.locator("#search-open").click();
  await page.locator("#search-input").fill("<script>");
  assert.match(
    await page.locator("#search-results").innerText(),
    /No teas found/,
  );
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    localStorage.setItem(
      "abija-bag-v1",
      '[{"name":"__proto__","weight":0,"qty":2}]',
    );
  });
  await page.reload();
  await page.locator("#cart-open").click();
  assert.equal(await page.locator(".cart-item").count(), 0);
  assert.deepEqual(errors, []);
  const broken = await page
    .locator("img")
    .evaluateAll((imgs) =>
      imgs
        .filter((i) => i.offsetParent && i.complete && !i.naturalWidth)
        .map((i) => i.src),
    );
  assert.deepEqual(broken, []);
  console.log(
    "PASS: desktop/mobile layouts, pack pricing, quantities, persistent multi-item cart, WhatsApp total, search, currency, languages, image gallery, invalid storage and analytics events.",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
