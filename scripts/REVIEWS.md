# Google Sheets reviews

Source: `reviews.gs`. Bound Apps Script project: Abija Tea Reviews.
The Google editor currently contains a compact equivalent of this source.

Deploy as a web app, execute as the sheet owner, access Anyone. Authorize access
to the bound spreadsheet. Paste the final `/exec` URL into `reviews-config.mjs`,
then run `node scripts/build-seo.mjs` to regenerate product pages.

The public widget exposes product ratings, display names, comments and dates.
No customer emails or purchase information are collected. Keep the sheet's
general access Restricted, with the two existing accounts retaining access.

Reviews publish immediately. To remove spam from the widget, change its status
from `published` to `hidden` in Reviews. Do not hide legitimate negative reviews.
The average includes every published valid rating, while the list shows the latest 50.
No rating structured data is emitted because the widget is embedded separately.

Basic protections include server validation, one-use expiring submission tokens,
a honeypot, link rejection, exact duplicate checks, a global 30-per-hour write cap,
spreadsheet formula escaping, text-only rendering, and a write lock. These do not
verify purchases or prevent determined attackers; Google quotas also apply.

Run `node --test tests/reviews.cjs` for isolated storage/validation checks. Do not
publish test reviews into the production aggregate. End-to-end storage verification
and anonymous widget access must be completed after Google authorization.
