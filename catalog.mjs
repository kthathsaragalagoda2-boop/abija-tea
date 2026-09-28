// Existing September 2026 catalogue and pricing, retained from the previous site.
export const WA_NUMBER = "94775670480";
export const WEIGHTS = ["100g", "250g", "500g", "1kg"];
export const DELIVERY_LKR = 450;
export const MONTHLY_SALE_END = new Date("2026-09-30T23:59:59+05:30");
export const MONTHLY_SALE_PERCENT = 30;
export const PRODUCTS = {
  "Black Fannings Tea": {
    group: "black",
    lkr: [250, 625, 1250, 2500],
    avail: [true, true, true, true],
    soon: false,
    img: "BOP-1200.webp",
    note: "",
  },
  "Black BOPF Tea": {
    group: "black",
    lkr: [250, 625, 1250, 2500],
    avail: [false, false, false, false],
    soon: false,
    img: "BOP-1200.webp",
    note: "Unavailable",
  },
  "Black Dust Tea": {
    group: "black",
    lkr: [250, 625, 1250, 2500],
    avail: [true, true, true, true],
    soon: false,
    img: "Dust-1200.webp",
    note: "",
  },
  "Pure Green Tea": {
    group: "green",
    lkr: [1250, 3125, 6250, 5000],
    avail: [true, true, true, true],
    soon: false,
    img: "Green-1200.webp",
    note: "",
  },
  "Leafy Green Tea": {
    group: "green",
    lkr: [1250, 3125, 6250, 5000],
    avail: [true, true, true, true],
    soon: false,
    img: "Green-1200.webp",
    note: "",
  },
  "Silver Tips": {
    group: "tips",
    lkr: [2500, 6250, 12500, 10000],
    avail: [false, false, false, false],
    soon: true,
    img: "Silver-1200.webp",
    note: "Within a week",
  },
  "Golden Tips": {
    group: "tips",
    lkr: [2500, 6250, 12500, 10000],
    avail: [false, false, false, false],
    soon: true,
    img: "Golden-1200.webp",
    note: "Within a week",
  },
};
export const ORIG_LKR = {
  black: [250, 625, 1250, 2500],
  green: [1500, 3750, 7500, 6000],
  tips: [3000, 7500, 15000, 12000],
};
export function monthlySaleIsActive(now = new Date()) {
  return now <= MONTHLY_SALE_END;
}
export function currentLkrPrice(product, index, now = new Date()) {
  return monthlySaleIsActive(now)
    ? Math.round(
        ORIG_LKR[product.group][index] * (1 - MONTHLY_SALE_PERCENT / 100),
      )
    : product.lkr[index];
}
export const FEATURED = [
  "Black Dust Tea",
  "Pure Green Tea",
  "Black Fannings Tea",
];
export const DETAILS = {
  "Black Dust Tea": {
    ritual: "The Morning Ritual",
    intro: "A rich, strong start to your day.",
    description:
      "A fine Ceylon black tea with a bold, full-bodied character. Your everyday cup, made for a little milk or enjoyed just as it is.",
    notes: ["Bold & full-bodied", "Fine black tea", "Lovely with milk"],
    tone: "sand",
    brew: "Use freshly boiled water. Steep for 3–5 minutes, then strain.",
  },
  "Pure Green Tea": {
    ritual: "The Zen Blend",
    intro: "Pure Ceylon green tea for a quiet moment.",
    description:
      "Unflavoured Ceylon green tea with a smooth, refreshing character. A simple, unhurried cup that lets the tea speak for itself.",
    notes: [
      "Smooth & refreshing",
      "Loose-leaf green tea",
      "Enjoy without milk",
    ],
    tone: "sage",
    brew: "Allow boiled water to cool slightly. Steep for 2–3 minutes, then strain.",
  },
  "Black Fannings Tea": {
    ritual: "The Refined Evening",
    intro: "A bright, full-bodied Ceylon black tea.",
    description:
      "Fine-grade Ceylon black tea that brews into a bright, satisfying cup. Pure tea, with no added colouring or flavouring.",
    notes: [
      "Bright & full-bodied",
      "Fine-grade black tea",
      "Pure Ceylon character",
    ],
    tone: "dark",
    brew: "Use freshly boiled water. Steep for 3–5 minutes, then strain.",
  },
  "Silver Tips": {
    ritual: "A Rare Quiet Moment",
    intro: "Delicate white tea, from a limited harvest.",
    description:
      "Handpicked Ceylon white tea buds. Contact us to confirm availability before ordering.",
    notes: ["Delicate white tea", "Limited harvest"],
    tone: "sage",
    brew: "Use water just below boiling. Steep gently for 3–5 minutes.",
  },
  "Golden Tips": {
    ritual: "Something Special",
    intro: "Deep aroma. A beautifully smooth cup.",
    description:
      "A limited-harvest Ceylon tea with a smooth body. Contact us to confirm availability before ordering.",
    notes: ["Smooth character", "Limited harvest"],
    tone: "sand",
    brew: "Use water just below boiling. Steep for 3–5 minutes.",
  },
};
export function cartTotals(cart, now = new Date()) {
  const subtotal = cart.reduce(
    (sum, item) =>
      sum + currentLkrPrice(PRODUCTS[item.name], item.weight, now) * item.qty,
    0,
  );
  const delivery = cart.length ? DELIVERY_LKR : 0;
  return { subtotal, delivery, total: subtotal + delivery };
}
