/**
 * Capture Phase 9 collections baselines into
 * docs/stitch-redesign/baselines/collections/
 * Requires a running app on localhost:3000 (dev or start).
 */
import { chromium } from "@playwright/test";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs/stitch-redesign/baselines/collections");
const refs = join(outDir, "references");
const indexDir = join(outDir, "index");
const detailDir = join(outDir, "detail");
const dialogs = join(outDir, "dialogs");
const states = join(outDir, "states");

for (const dir of [refs, indexDir, detailDir, dialogs, states]) {
  mkdirSync(dir, { recursive: true });
}

const base = process.env.BASE_URL ?? "http://localhost:3000";

const SEED_STORE = {
  version: 2,
  userRestaurants: {
    "benu-san-francisco-ca": {
      restaurantSlug: "benu-san-francisco-ca",
      saved: true,
      wantToVisit: true,
      planned: false,
      visited: true,
      favorite: true,
      visitDate: "2026-05-12",
      personalRating: 5,
      notes: "Private note.",
      favoriteDishes: ["Xiao Long Bao"],
      reservationPlannedFor: null,
      reservationProvider: null,
      reservationConfirmationNote: null,
      createdAt: "2026-01-10T12:00:00.000Z",
      updatedAt: "2026-05-12T12:00:00.000Z",
    },
    "addison-san-diego-ca": {
      restaurantSlug: "addison-san-diego-ca",
      saved: true,
      wantToVisit: true,
      planned: true,
      visited: false,
      favorite: false,
      visitDate: null,
      personalRating: null,
      notes: "",
      favoriteDishes: [],
      reservationPlannedFor: "2026-08-02",
      reservationProvider: "Resy",
      reservationConfirmationNote: null,
      createdAt: "2026-02-01T12:00:00.000Z",
      updatedAt: "2026-02-01T12:00:00.000Z",
    },
    "atelier-crenn-san-francisco-ca": {
      restaurantSlug: "atelier-crenn-san-francisco-ca",
      saved: true,
      wantToVisit: false,
      planned: false,
      visited: false,
      favorite: false,
      visitDate: null,
      personalRating: null,
      notes: "",
      favoriteDishes: [],
      reservationPlannedFor: null,
      reservationProvider: null,
      reservationConfirmationNote: null,
      createdAt: "2026-03-01T12:00:00.000Z",
      updatedAt: "2026-03-01T12:00:00.000Z",
    },
  },
  collections: {
    "col-ca": {
      id: "col-ca",
      slug: "california-celebration-trip",
      name: "California Celebration Trip",
      description:
        "A curated list of destination restaurants for our upcoming coastal anniversary journey.",
      private: true,
      coverRestaurantSlug: "benu-san-francisco-ca",
      restaurantSlugs: [
        "benu-san-francisco-ca",
        "addison-san-diego-ca",
        "atelier-crenn-san-francisco-ca",
        "missing-stale-slug",
      ],
      createdAt: "2026-01-01T12:00:00.000Z",
      updatedAt: "2026-06-01T12:00:00.000Z",
    },
    "col-empty": {
      id: "col-empty",
      slug: "empty-collection",
      name: "Empty Collection",
      description: "",
      private: true,
      coverRestaurantSlug: null,
      restaurantSlugs: [],
      createdAt: "2026-02-01T12:00:00.000Z",
      updatedAt: "2026-02-01T12:00:00.000Z",
    },
    "col-long": {
      id: "col-long",
      slug: "an-extraordinarily-long-collection-name-for-wrapping",
      name: "An Extraordinarily Long Collection Name For Safe Wrapping Across Viewports",
      description: "Tests long title wrapping.",
      private: true,
      coverRestaurantSlug: null,
      restaurantSlugs: ["benu-san-francisco-ca"],
      createdAt: "2026-01-15T12:00:00.000Z",
      updatedAt: "2026-01-20T12:00:00.000Z",
    },
  },
};

async function shot(page, dir, name, options = {}) {
  const path = join(dir, name);
  await page.screenshot({ path, fullPage: options.fullPage !== false, ...options });
  console.log("wrote", name);
}

async function seedPassport(page) {
  await page.addInitScript((store) => {
    window.localStorage.setItem("mdp-passport", JSON.stringify(store));
  }, SEED_STORE);
}

async function main() {
  copyFileSync(
    join(root, "docs/designs/collections_overview_create_dialog/screen.png"),
    join(refs, "collections-overview-reference.png"),
  );
  copyFileSync(
    join(
      root,
      "docs/designs/collection_detail_california_celebration_trip/screen.png",
    ),
    join(refs, "collection-detail-reference.png"),
  );
  console.log("copied stitch references");

  const browser = await chromium.launch();

  // Index + detail with seeded passport
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await seedPassport(page);

    for (const [name, width] of [
      ["index-1440.png", 1440],
      ["index-1280.png", 1280],
      ["index-1024.png", 1024],
      ["index-768.png", 768],
      ["index-390.png", 390],
    ]) {
      await page.setViewportSize({ width, height: width <= 390 ? 844 : 1100 });
      await page.goto(`${base}/collections`, { waitUntil: "networkidle" });
      await shot(page, indexDir, name);
    }

    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto(`${base}/collections`, { waitUntil: "networkidle" });
    await page.locator("[data-collections-section='featured']").screenshot({
      path: join(indexDir, "featured-collection.png"),
    });
    await page.locator("[data-collections-section='grid']").screenshot({
      path: join(indexDir, "collection-grid.png"),
    });
    await page.locator("[data-collections-section='toolbar']").screenshot({
      path: join(indexDir, "search-sort.png"),
    });
    console.log("wrote index section crops");

    for (const [name, width] of [
      ["detail-1440.png", 1440],
      ["detail-1280.png", 1280],
      ["detail-1024.png", 1024],
      ["detail-768.png", 768],
      ["detail-390.png", 390],
    ]) {
      await page.setViewportSize({ width, height: width <= 390 ? 844 : 1100 });
      await page.goto(`${base}/collections/california-celebration-trip`, {
        waitUntil: "networkidle",
      });
      await shot(page, detailDir, name);
    }

    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto(`${base}/collections/california-celebration-trip`, {
      waitUntil: "networkidle",
    });
    await page.locator("[data-collections-section='hero']").screenshot({
      path: join(detailDir, "detail-hero.png"),
    });
    await page.locator("[data-collections-section='progress']").screenshot({
      path: join(detailDir, "collection-progress.png"),
    });
    await page.locator("[data-collections-section='members']").screenshot({
      path: join(detailDir, "member-rows.png"),
    });
    await shot(page, detailDir, "stale-member-state.png");
    await shot(page, detailDir, "truthful-reservation-labels.png");
    console.log("wrote detail section crops");

    await page.getByRole("button", { name: "Edit" }).click();
    await page.waitForTimeout(300);
    await shot(page, dialogs, "edit-dialog-1440.png", { fullPage: false });
    await page.getByRole("button", { name: "Close" }).click();

    await page.getByRole("button", { name: /Add restaurants/i }).first().click();
    await page.waitForTimeout(300);
    await shot(page, detailDir, "add-restaurants.png", { fullPage: false });
    await page.getByRole("button", { name: "Done" }).click();

    await page.getByRole("button", { name: "Remove from collection" }).first().click();
    await page.waitForTimeout(300);
    await shot(page, detailDir, "remove-restaurant.png", { fullPage: false });
    await page.getByRole("button", { name: "Cancel" }).click();

    await page.getByLabel("More collection actions").click();
    await page.getByRole("menuitem", { name: "Delete collection" }).click();
    await page.waitForTimeout(300);
    await shot(page, dialogs, "delete-dialog-1440.png", { fullPage: false });
    await page.getByRole("button", { name: "Cancel" }).click();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/collections/california-celebration-trip`, {
      waitUntil: "networkidle",
    });
    await page.getByRole("button", { name: "Edit" }).click();
    await page.waitForTimeout(300);
    await shot(page, dialogs, "edit-dialog-390.png", { fullPage: false });
    await page.getByRole("button", { name: "Close" }).click();
    await page.getByLabel("More collection actions").click();
    await page.getByRole("menuitem", { name: "Delete collection" }).click();
    await page.waitForTimeout(300);
    await shot(page, dialogs, "delete-dialog-390.png", { fullPage: false });
    await page.getByRole("button", { name: "Cancel" }).click();

    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto(`${base}/collections/empty-collection`, {
      waitUntil: "networkidle",
    });
    await shot(page, detailDir, "detail-empty.png");
    await shot(page, detailDir, "fallback-cover.png");

    await page.goto(
      `${base}/collections/an-extraordinarily-long-collection-name-for-wrapping`,
      { waitUntil: "networkidle" },
    );
    await shot(page, detailDir, "long-collection-name.png");

    await page.goto(
      `${base}/collections/california-celebration-trip?proof=loading`,
      { waitUntil: "networkidle" },
    );
    await shot(page, detailDir, "detail-loading.png");

    await context.close();
  }

  // Empty / loading index + create dialogs
  {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto(`${base}/collections?proof=empty`, {
      waitUntil: "networkidle",
    });
    await shot(page, indexDir, "index-empty.png");

    await page.goto(`${base}/collections?proof=loading`, {
      waitUntil: "networkidle",
    });
    await shot(page, indexDir, "index-loading.png");

    await page.goto(`${base}/collections?proof=empty`, {
      waitUntil: "networkidle",
    });
    await page.getByRole("button", { name: "Create collection" }).first().click();
    await page.waitForTimeout(300);
    await shot(page, dialogs, "create-dialog-1440.png", { fullPage: false });
    await page.getByRole("button", { name: "Create collection" }).last().click();
    await page.waitForTimeout(300);
    await shot(page, dialogs, "create-validation.png", { fullPage: false });
    await page.getByRole("button", { name: "Close" }).click();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/collections?proof=empty`, {
      waitUntil: "networkidle",
    });
    await page.getByRole("button", { name: "Create collection" }).first().click();
    await page.waitForTimeout(300);
    await shot(page, dialogs, "create-dialog-390.png", { fullPage: false });

    await context.close();
  }

  await browser.close();
  console.log("collections baselines complete");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
