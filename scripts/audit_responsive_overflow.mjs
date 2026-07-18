/**
 * Phase 12 overflow spot-check at acceptance widths.
 * Requires BASE_URL (default http://127.0.0.1:3112).
 */
import { chromium } from "@playwright/test";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3112";
const widths = [1440, 1280, 1024, 768, 390];
const routes = [
  "/",
  "/explore",
  "/map",
  "/restaurants/benu-san-francisco-ca",
  "/passport",
  "/collections",
  "/login",
  "/usa/california",
  "/cities/new-york",
  "/cuisines/japanese",
  "/stars/1",
  "/about-michelin-stars",
  "/this-route-does-not-exist-phase12",
];

const browser = await chromium.launch();
const page = await browser.newPage();
const failures = [];

try {
  for (const width of widths) {
    const height = width === 390 ? 844 : 900;
    await page.setViewportSize({ width, height });
    for (const route of routes) {
      await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded" });
      const title = await page.title();
      if (!/Dining Passport/i.test(title)) {
        failures.push(`${width} ${route}: wrong app title ${title}`);
        continue;
      }
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
        };
      });
      if (overflow.scrollWidth > overflow.clientWidth + 1) {
        failures.push(
          `${width} ${route}: horizontal overflow ${overflow.scrollWidth}>${overflow.clientWidth}`,
        );
      }
    }
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error("OVERFLOW FAILURES");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log(`PASS responsive overflow (${routes.length} routes × ${widths.length} widths)`);
