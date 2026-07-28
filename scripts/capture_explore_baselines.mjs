/**
 * Capture Phase 5 Explore visual baselines into docs/stitch-redesign/baselines/explore/
 * Requires a running app on localhost:3000 (dev or start).
 */
import { chromium } from "@playwright/test";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs/stitch-redesign/baselines/explore");
mkdirSync(outDir, { recursive: true });

const base = process.env.BASE_URL ?? "http://localhost:3000";

async function shot(page, name, options = {}) {
  const path = join(outDir, name);
  await page.screenshot({ path, fullPage: true, ...options });
  console.log("wrote", name);
}

async function main() {
  // Stitch references
  copyFileSync(
    join(root, "docs/designs/explore_michelin_starred_restaurants/screen.png"),
    join(outDir, "stitch-grid-reference.png"),
  );
  copyFileSync(
    join(root, "docs/designs/explore_list_view_filters_drawer/screen.png"),
    join(outDir, "stitch-list-drawer-reference.png"),
  );
  copyFileSync(
    join(root, "docs/designs/dining_passport_system_states/screen.png"),
    join(outDir, "stitch-system-states-reference.png"),
  );
  console.log("copied stitch references");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const widths = [
    ["grid-1440.png", 1440, "/explore"],
    ["grid-1280.png", 1280, "/explore"],
    ["grid-1024.png", 1024, "/explore"],
    ["grid-768.png", 768, "/explore"],
    ["grid-390.png", 390, "/explore"],
    ["list-1440.png", 1440, "/explore?view=list"],
    ["list-390.png", 390, "/explore?view=list"],
    ["active-filters.png", 1440, "/explore?stars=3&state=california"],
    ["empty-1440.png", 1440, "/explore?proof=empty"],
    ["empty-390.png", 390, "/explore?proof=empty"],
    ["loading-grid.png", 1440, "/explore?proof=loading"],
    ["loading-list.png", 1440, "/explore?proof=loading&view=list"],
    ["pagination.png", 1440, "/explore?page=2&sort=name-asc"],
    ["truthful-reservation-labels.png", 1440, "/explore?q=harbor+house&view=list"],
    ["long-name-mobile.png", 390, "/explore?q=restaurant&view=list"],
  ];

  for (const [name, width, path] of widths) {
    await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
    await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    await shot(page, name);
  }

  // Drawer open states
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/explore`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /All Filters/i }).click();
  await page.getByRole("dialog", { name: "All filters" }).waitFor();
  await shot(page, "drawer-open-1440.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/explore`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /All Filters/i }).click();
  await page.getByRole("dialog", { name: "All filters" }).waitFor();
  await shot(page, "drawer-open-390.png");

  // Save states — click save on first card
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/explore`, { waitUntil: "networkidle" });
  const save = page
    .locator('[data-explore-results="grid"] article')
    .first()
    .getByRole("button", { name: /Save|Saved|Unsave/i });
  await save.click();
  await shot(page, "save-states.png");

  await browser.close();
  console.log("done");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
