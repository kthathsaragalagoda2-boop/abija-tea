// Regenerate static product HTML after changes to the catalogue or shared layout.
// No third-party packages or hosting build step required: commit the generated files.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { PRODUCTS, DETAILS } from "../catalog.mjs";
import { productUrl, productMarkup } from "../product-view.mjs";

const root = new URL("../", import.meta.url);
const template = await readFile(new URL("index.html", root), "utf8");
const origin = "https://abijatea.me";
const escape = value => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const json = value => JSON.stringify(value).replaceAll("<", "\\u003c");
const copy = { back: "Back to all teas", size: "Pack size", add: "ADD TO BAG", preorder: "PRE-ORDER", related: "You might also like", details: "VIEW TEA" };
const urls = [origin + "/"];

for (const name of Object.keys(DETAILS)) {
  const url = origin + productUrl(name);
  const title = `${name} | Pure Ceylon Tea | Abija Tea`;
  const description = DETAILS[name].description;
  const photo = origin + "/" + PRODUCTS[name].img;
  const product = {
    "@context": "https://schema.org", "@type": "Product", "@id": url + "#product",
    name: "Abija " + name, url, image: photo, description,
    brand: { "@type": "Brand", name: "Abija Tea" },
  };
  const breadcrumbs = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Abija Tea", item: origin + "/" },
      { "@type": "ListItem", position: 2, name, item: url },
    ],
  };
  // Static content includes the product, sizes, brewing and delivery information.
  // Runtime fills prices and Offer markup directly from the unchanged catalogue.
  const markup = productMarkup(name, {
    price: () => 0,
    money: amount => amount === 0 ? "—" : "Rs " + amount,
    t: key => copy[key] || key,
  });
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/>)/, `$1${escape(description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${escape(title)}`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*/, `$1${escape(description)}`)
    .replace(/(<meta property="og:image" content=")[^"]*/, `$1${photo}`)
    .replace(/(<meta property="og:image:alt" content=")[^"]*/, `$1${escape(name)}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${escape(title)}`)
    .replace(/(<meta name="twitter:image" content=")[^"]*/, `$1${photo}`)
    .replace(/<main\b[^>]*>[\s\S]*?<\/main>/, `<main id="main" tabindex="-1" class="wrap"><div id="home-view" hidden></div><section id="product-view" aria-labelledby="product-title">${markup}</section></main>`)
    .replaceAll('href="#home"', 'href="/#home"')
    .replaceAll('href="#shop"', 'href="/#shop"')
    .replaceAll('href="#about"', 'href="/#about"')
    .replace('</head>', `<script type="application/ld+json" id="catalog-schema">${json(product)}</script>\n<script type="application/ld+json">${json(breadcrumbs)}</script>\n</head>`);
  const directory = new URL(productUrl(name).slice(1), root);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL("index.html", directory), html);
  urls.push(url);
  console.log("Generated " + fileURLToPath(directory));
}
await writeFile(new URL("sitemap.xml", root), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${url}</loc></url>`).join("\n")}\n</urlset>\n`);
