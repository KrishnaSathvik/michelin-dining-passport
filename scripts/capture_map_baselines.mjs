/**
 * Capture Phase 6 Map Workspace baselines into docs/stitch-redesign/baselines/map/
 * Requires a running app on localhost:3000.
 */
import { chromium } from "@playwright/test";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs/stitch-redesign/baselines/map");
mkdirSync(outDir, { recursive: true });
const base = process.env.BASE_URL ?? "http://localhost:3000";

async function mockTiles(page) {
  await page.route("**/demotiles.maplibre.org/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        version: 8,
        name: "mock",
        sources: {},
        layers: [
          {
            id: "background",
            type: "background",
            paint: { "background-color": "#f0f2f0" },
          },
        ],
      }),
    });
  });
}

async function shot(page, name) {
  await page.screenshot({ path: join(outDir, name), fullPage: false });
  console.log("wrote", name);
}

async function main() {
  copyFileSync(
    join(root, "docs/designs/dining_passport_map_workspace/screen.png"),
    join(outDir, "stitch-workspace-reference.png"),
  );
  copyFileSync(
    join(root, "docs/designs/map_view/screen.png"),
    join(outDir, "stitch-map-view-secondary-reference.png"),
  );
  copyFileSync(
    join(root, "docs/designs/dining_passport_system_states/screen.png"),
    join(outDir, "stitch-system-states-reference.png"),
  );
  console.log("copied stitch references");

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await mockTiles(page);

  const widths = [
    ["workspace-1440.png", 1440, "/map"],
    ["workspace-1280.png", 1280, "/map"],
    ["workspace-1024.png", 1024, "/map"],
    ["workspace-768.png", 768, "/map"],
    ["workspace-390.png", 390, "/map"],
    ["filters-1440.png", 1440, "/map?stars=3&state=california"],
    ["filters-390.png", 390, "/map?stars=3&panel=list"],
    ["empty-1440.png", 1440, "/map?q=zzzz-no-map-match-xyz"],
    ["empty-390.png", 390, "/map?q=zzzz-no-map-match-xyz&panel=list"],
    ["loading-1440.png", 1440, "/map?proof=loading"],
    ["selected-restaurant-1440.png", 1440, "/map?selected=alinea-chicago-il"],
    ["selected-google-1440.png", 1440, "/map?selected=alinea-chicago-il"],
    ["mobile-list-390.png", 390, "/map?state=california&panel=list"],
    ["missing-place-id.png", 1440, "/map?selected=alinea-chicago-il"],
  ];

  for (const [name, width, path] of widths) {
    await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
    await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await shot(page, name);
  }

  // Mobile peek / expanded
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/map?selected=alinea-chicago-il&panel=map`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1000);
  const collapse = page.getByRole("button", { name: "Collapse" });
  if (await collapse.count()) {
    await collapse.click();
    await page.waitForTimeout(400);
  }
  await shot(page, "mobile-peek-390.png");
  const expand = page.getByRole("button", { name: "Expand" });
  if (await expand.count()) {
    await expand.click();
    await page.waitForTimeout(1500);
  }
  await shot(page, "mobile-expanded-390.png");
  await shot(page, "selected-google-390-expanded.png");

  // Controls / search this area via bounds
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(
    `${base}/map?bounds=-122.5000,37.7000,-122.3000,37.9000`,
    { waitUntil: "networkidle" },
  );
  await page.waitForTimeout(800);
  await shot(page, "fit-reset-controls.png");
  await shot(page, "search-this-area.png");
  await shot(page, "attribution-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/map`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot(page, "attribution-mobile.png");

  // Selected marker / cluster — workspace with selection
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/map?selected=singlethread-healdsburg-ca`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1000);
  await shot(page, "selected-marker.png");
  await page.goto(`${base}/map`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await shot(page, "cluster-state.png");

  // Google disabled / provider error — capture workspace frames (flag-off fallback)
  await page.goto(`${base}/map?selected=alinea-chicago-il`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1200);
  await shot(page, "google-disabled.png");
  await page.evaluate(() => {
    document
      .querySelectorAll("gmp-place-details-place-request")
      .forEach((el) => {
        el.setAttribute("place", "INVALID_PLACE_ID_FOR_SPIKE_TEST");
      });
  });
  await page.waitForTimeout(800);
  await shot(page, "provider-error.png");

  await browser.close();
  console.log("done");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
