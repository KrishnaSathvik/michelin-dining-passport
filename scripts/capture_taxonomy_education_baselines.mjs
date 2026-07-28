/**
 * Capture Phase 11 taxonomy/education baselines.
 * Requires a running app (BASE_URL, default http://localhost:3000).
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs/stitch-redesign/baselines/taxonomy-education");
const dirs = {
  state: join(outDir, "state"),
  city: join(outDir, "city"),
  cuisine: join(outDir, "cuisine"),
  stars: join(outDir, "stars"),
  education: join(outDir, "education"),
};
for (const dir of Object.values(dirs)) mkdirSync(dir, { recursive: true });

const base = process.env.BASE_URL ?? "http://localhost:3000";

async function shot(page, path, fullPage = true) {
  await page.screenshot({ path, fullPage });
  console.log("wrote", path);
}

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  for (const width of [1440, 1280, 1024, 768, 390]) {
    const height = width === 390 ? 844 : 900;
    await page.setViewportSize({ width, height });

    await page.goto(`${base}/usa/california`, { waitUntil: "networkidle" });
    await shot(page, join(dirs.state, `state-${width}.png`));

    await page.goto(`${base}/cities/new-york`, { waitUntil: "networkidle" });
    await shot(page, join(dirs.city, `city-${width}.png`));

    await page.goto(`${base}/cuisines/japanese`, { waitUntil: "networkidle" });
    await shot(page, join(dirs.cuisine, `cuisine-${width}.png`));

    await page.goto(`${base}/about-michelin-stars`, { waitUntil: "networkidle" });
    await shot(page, join(dirs.education, `education-${width}.png`));
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  for (const stars of [1, 2, 3]) {
    await page.goto(`${base}/stars/${stars}`, { waitUntil: "networkidle" });
    await shot(page, join(dirs.stars, `stars-${stars}-1440.png`));
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const stars of [1, 2, 3]) {
    await page.goto(`${base}/stars/${stars}`, { waitUntil: "networkidle" });
    await shot(page, join(dirs.stars, `stars-${stars}-390.png`));
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/usa/california`, { waitUntil: "networkidle" });
  const glance = page.locator('[data-taxonomy-section="at-a-glance"]');
  if (await glance.count()) {
    await glance.screenshot({ path: join(dirs.state, "state-at-a-glance.png") });
  }
  const cities = page.locator('[data-taxonomy-section="city-overview"]');
  if (await cities.count()) {
    await cities.screenshot({
      path: join(dirs.state, "state-city-overview.png"),
    });
  }

  await page.goto(`${base}/cities/new-york`, { waitUntil: "networkidle" });
  const dist = page.locator('[data-taxonomy-section="distinction-bento"]');
  if (await dist.count()) {
    await dist.screenshot({
      path: join(dirs.city, "city-distinction-bento.png"),
    });
  }
  const cuisineBento = page.locator('[data-taxonomy-section="cuisine-bento"]');
  if (await cuisineBento.count()) {
    await cuisineBento.screenshot({
      path: join(dirs.city, "city-cuisine-bento.png"),
    });
  }

  await page.goto(`${base}/cuisines/japanese`, { waitUntil: "networkidle" });
  const hubs = page.locator('[data-taxonomy-section="us-hubs"]');
  if (await hubs.count()) {
    await hubs.screenshot({ path: join(dirs.cuisine, "cuisine-us-hubs.png") });
  }

  await page.goto(`${base}/about-michelin-stars`, { waitUntil: "networkidle" });
  const indep = page.locator('[data-education-section="independence"]');
  if (await indep.count()) {
    await indep.screenshot({
      path: join(dirs.education, "education-independence.png"),
    });
  }
  const cards = page.locator('[data-education-section="star-cards"]');
  if (await cards.count()) {
    await cards.screenshot({
      path: join(dirs.education, "education-star-cards.png"),
    });
  }

  console.log("taxonomy/education baselines complete");
} finally {
  await browser.close();
}
