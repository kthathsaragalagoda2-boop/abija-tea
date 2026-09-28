import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import {
  PRODUCTS,
  ORIG_LKR,
  currentLkrPrice,
  cartTotals,
  monthlySaleIsActive,
} from "../catalog.mjs";

// Compare to the immutable pre-redesign revision, not a duplicate price fixture.
const old = execFileSync(
  "git",
  ["show", "f05f49bfd2b5d5d50806e87128723d00d647f7c2:app.js"],
  { encoding: "utf8" },
);
const pricingSource = old.slice(
  old.indexOf("const PRODUCTS ="),
  old.indexOf("function updateMonthlyOffer()"),
);
function legacyAt(iso) {
  class FixedDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : [iso]));
    }
  }
  return vm.runInNewContext(
    pricingSource +
      "; ({ PRODUCTS, ORIG_LKR, currentLkrPrice, monthlySaleIsActive });",
    { Date: FixedDate },
  );
}
test("all catalogue prices, stock flags, and images stay unchanged", () => {
  const legacy = legacyAt("2026-09-28T12:00:00Z");
  assert.deepEqual(JSON.parse(JSON.stringify(legacy.PRODUCTS)), PRODUCTS);
  assert.deepEqual(JSON.parse(JSON.stringify(legacy.ORIG_LKR)), ORIG_LKR);
});
for (const date of [
  "2026-09-28T12:00:00Z",
  "2026-09-30T18:29:59Z",
  "2026-09-30T18:30:00Z",
  "2026-10-01T12:00:00Z",
]) {
  test("every pack matches legacy pricing at " + date, () => {
    const legacy = legacyAt(date);
    for (const name of Object.keys(PRODUCTS))
      for (let i = 0; i < 4; i++)
        assert.equal(
          currentLkrPrice(PRODUCTS[name], i, new Date(date)),
          legacy.currentLkrPrice(legacy.PRODUCTS[name], i),
          name + " " + i,
        );
    assert.equal(
      monthlySaleIsActive(new Date(date)),
      legacy.monthlySaleIsActive(),
    );
  });
}
test("multi-item bag charges the existing Rs 450 delivery once", () => {
  const cart = [
    { name: "Black Dust Tea", weight: 0, qty: 2 },
    { name: "Pure Green Tea", weight: 1, qty: 1 },
  ];
  assert.deepEqual(cartTotals(cart, new Date("2026-09-28T12:00:00Z")), {
    subtotal: 2975,
    delivery: 450,
    total: 3425,
  });
  assert.deepEqual(cartTotals([], new Date("2026-09-28T12:00:00Z")), {
    subtotal: 0,
    delivery: 0,
    total: 0,
  });
});
