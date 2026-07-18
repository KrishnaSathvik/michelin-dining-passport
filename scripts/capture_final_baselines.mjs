/**
 * Phase 12 final visual baselines.
 * Owns a dedicated port via BASE_URL (default http://127.0.0.1:3112).
 * Verifies Dining Passport identity before capture.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs/stitch-redesign/baselines/final");
mkdirSync(outDir, { recursive: true });

const base = process.env.BASE_URL ?? "http://127.0.0.1:3112";

async function assertApp(page) {
  const title = await page.title();
  if (!/Dining Passport/i.test(title)) {
    throw new Error(`Wrong app title at ${page.url()}: ${title}`);
  }
  const mark = page.getByText("Dining Passport").first();
  if (!(await mark.count())) {
    throw new Error(`Dining Passport wordmark missing at ${page.url()}`);
  }
}

async function shot(page, name, fullPage = true) {
  const path = join(outDir, name);
  await page.screenshot({ path, fullPage });
  console.log("wrote", path);
}

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  // Identity smoke
  await page.goto(base, { waitUntil: "networkidle" });
  await assertApp(page);

  const captures = [
    { path: "/", width: 1440, file: "home-1440.png" },
    { path: "/", width: 390, file: "home-390.png", height: 844 },
    { path: "/explore", width: 1440, file: "explore-grid-1440.png" },
    { path: "/explore", width: 390, file: "explore-grid-390.png", height: 844 },
    { path: "/explore?view=list", width: 1440, file: "explore-list-1440.png" },
    {
      path: "/map",
      width: 1440,
      file: "map-selected-1440.png",
      after: async (p) => {
        const first = p.locator('[data-map-row]').first();
        if (await first.count()) await first.click({ timeout: 5000 }).catch(() => {});
        await p.waitForTimeout(800);
      },
    },
    {
      path: "/map",
      width: 390,
      file: "map-mobile-expanded-390.png",
      height: 844,
      after: async (p) => {
        const expand = p.getByRole("button", { name: /expand|list|results/i }).first();
        if (await expand.count()) await expand.click({ timeout: 3000 }).catch(() => {});
        await p.waitForTimeout(500);
      },
    },
    { path: "/passport", width: 1440, file: "passport-active-1440.png" },
    {
      path: "/passport",
      width: 390,
      file: "passport-empty-390.png",
      height: 844,
      before: async (p) => {
        await p.addInitScript(() => {
          localStorage.removeItem("dining-passport-v1");
        });
      },
    },
    { path: "/saved", width: 1440, file: "saved-1440.png" },
    { path: "/planned", width: 390, file: "planned-390.png", height: 844 },
    { path: "/visited", width: 1440, file: "visited-1440.png" },
    { path: "/collections", width: 1440, file: "collections-index-1440.png" },
    { path: "/login", width: 1440, file: "login-1440.png" },
    { path: "/login", width: 390, file: "login-390.png", height: 844 },
    { path: "/usa/california", width: 1440, file: "state-1440.png" },
    { path: "/cities/new-york", width: 390, file: "city-390.png", height: 844 },
    { path: "/cuisines/japanese", width: 1440, file: "cuisine-1440.png" },
    { path: "/stars/1", width: 390, file: "stars-1-390.png", height: 844 },
    { path: "/stars/2", width: 1440, file: "stars-2-1440.png" },
    { path: "/stars/3", width: 1440, file: "stars-3-1440.png" },
    {
      path: "/about-michelin-stars",
      width: 390,
      file: "education-390.png",
      height: 844,
    },
    {
      path: "/this-route-does-not-exist-phase12",
      width: 1440,
      file: "not-found-1440.png",
    },
    {
      path: "/this-route-does-not-exist-phase12",
      width: 390,
      file: "not-found-390.png",
      height: 844,
    },
  ];

  // Pick a real restaurant slug from explore for detail shots
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/explore`, { waitUntil: "networkidle" });
  await assertApp(page);
  const detailHref = await page
    .locator('a[href^="/restaurants/"]')
    .first()
    .getAttribute("href");
  if (!detailHref) throw new Error("No restaurant link found on /explore");

  captures.splice(6, 0,
    { path: detailHref, width: 1440, file: "restaurant-detail-1440.png" },
    {
      path: detailHref,
      width: 390,
      file: "restaurant-detail-390.png",
      height: 844,
    },
  );

  // Collection detail if any
  await page.goto(`${base}/collections`, { waitUntil: "networkidle" });
  const collectionHref = await page
    .locator('a[href^="/collections/"]')
    .first()
    .getAttribute("href")
    .catch(() => null);

  for (const item of captures) {
    const height = item.height ?? 900;
    await page.setViewportSize({ width: item.width, height });
    if (item.before) await item.before(page);
    await page.goto(`${base}${item.path}`, { waitUntil: "networkidle" });
    await assertApp(page);
    if (item.after) await item.after(page);
    await shot(page, item.file);
  }

  if (collectionHref) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}${collectionHref}`, { waitUntil: "networkidle" });
    await assertApp(page);
    await shot(page, "collection-detail-390.png");
  } else {
    console.warn("skip collection-detail-390.png — no collection link");
  }

  // Explore drawer at 390
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/explore`, { waitUntil: "networkidle" });
  const filters = page.getByRole("button", { name: /filter|all filters/i }).first();
  if (await filters.count()) {
    await filters.click();
    await page.waitForTimeout(400);
    await shot(page, "explore-drawer-390.png");
  } else {
    console.warn("skip explore-drawer-390.png — filter control not found");
  }

  // Account: may redirect when unauthenticated — capture whatever lands
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/account`, { waitUntil: "networkidle" });
  await shot(page, "account-1440.png");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/account`, { waitUntil: "networkidle" });
  await shot(page, "account-390.png");

  // Provider unavailable — restaurant detail without kit content marker
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}${detailHref}`, { waitUntil: "networkidle" });
  const unavailable = page.locator("[data-google-places-fallback]").first();
  if (await unavailable.count()) {
    await unavailable.screenshot({
      path: join(outDir, "provider-unavailable.png"),
    });
    console.log("wrote", join(outDir, "provider-unavailable.png"));
  } else {
    // Still capture the Google section frame as fallback evidence
    const section = page.locator("[data-google-places-section]").first();
    if (await section.count()) {
      await section.screenshot({
        path: join(outDir, "provider-unavailable.png"),
      });
      console.log("wrote section fallback", join(outDir, "provider-unavailable.png"));
    } else {
      console.warn("skip provider-unavailable.png — no Google fallback visible");
    }
  }

  // Route error: identical RouteErrorState as error.tsx — available on the
  // dev foundation gallery (404 in production builds).
  await page.setViewportSize({ width: 1440, height: 900 });
  const foundation = await page.goto(`${base}/dev/stitch-foundation`, {
    waitUntil: "domcontentloaded",
  });
  if (foundation && foundation.status() === 200) {
    await assertApp(page);
    const err = page.locator('[data-foundation-system-state="route-error"]');
    await err.scrollIntoViewIfNeeded();
    await err.screenshot({ path: join(outDir, "route-error-1440.png") });
    console.log("wrote", join(outDir, "route-error-1440.png"));
  } else {
    console.warn(
      "skip route-error-1440.png — foundation gallery unavailable on this server (expected under next start). Capture with next dev or document identical RouteErrorState from error.tsx.",
    );
  }
} finally {
  await browser.close();
}
