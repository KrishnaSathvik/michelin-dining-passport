/**
 * Footer content pages visual baselines (calm reading redesign).
 * Owns a dedicated port via BASE_URL (default http://127.0.0.1:3112).
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs/stitch-redesign/baselines/content-pages");
mkdirSync(outDir, { recursive: true });

const base = process.env.BASE_URL ?? "http://127.0.0.1:3112";
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };
const ROUTES = ["about", "privacy", "terms", "contact", "sources"];

async function assertApp(page) {
  const title = await page.title();
  if (!/Dining Passport/i.test(title)) {
    throw new Error(`Wrong app title at ${page.url()}: ${title}`);
  }
}

const browser = await chromium.launch();
try {
  for (const viewport of [
    { name: "desktop", size: DESKTOP },
    { name: "mobile-390", size: MOBILE },
  ]) {
    const page = await browser.newPage({ viewport: viewport.size });
    for (const route of ROUTES) {
      await page.goto(`${base}/${route}`, { waitUntil: "networkidle" });
      await assertApp(page);
      const file = `content-${route}-${viewport.name}.png`;
      await page.screenshot({ path: join(outDir, file), fullPage: true });
      console.log("wrote", file);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
