/**
 * Capture Phase 8 passport baselines into
 * docs/stitch-redesign/baselines/passport/
 * Requires a running app on localhost:3000 (dev or start).
 */
import { chromium } from "@playwright/test";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs/stitch-redesign/baselines/passport");
const refs = join(outDir, "references");
const active = join(outDir, "active");
const empty = join(outDir, "empty");
const saved = join(outDir, "saved");
const planned = join(outDir, "planned");
const visited = join(outDir, "visited");

for (const dir of [refs, active, empty, saved, planned, visited]) {
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
      planned: true,
      visited: true,
      favorite: true,
      visitDate: "2026-05-12",
      personalRating: 5,
      notes: "Extraordinary tasting progression — private note.",
      favoriteDishes: ["Xiao Long Bao", "Lobster coral"],
      reservationPlannedFor: "2026-09-18",
      reservationProvider: "Tock",
      reservationConfirmationNote: "Conf #A1",
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
    "col-sf": {
      id: "col-sf",
      slug: "san-francisco-favorites",
      name: "San Francisco favorites",
      description: "Tables to revisit in the city.",
      private: true,
      coverRestaurantSlug: "benu-san-francisco-ca",
      restaurantSlugs: [
        "benu-san-francisco-ca",
        "atelier-crenn-san-francisco-ca",
      ],
      createdAt: "2026-01-01T12:00:00.000Z",
      updatedAt: "2026-01-01T12:00:00.000Z",
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

async function clearPassport(page) {
  await page.addInitScript(() => {
    window.localStorage.removeItem("mdp-passport");
  });
}

async function main() {
  copyFileSync(
    join(root, "docs/designs/personal_passport/screen.png"),
    join(refs, "personal-passport-reference.png"),
  );
  copyFileSync(
    join(root, "docs/designs/personal_passport_new_user_state/screen.png"),
    join(refs, "passport-empty-reference.png"),
  );
  copyFileSync(
    join(root, "docs/designs/saved_restaurants/screen.png"),
    join(refs, "saved-reference.png"),
  );
  copyFileSync(
    join(root, "docs/designs/planned_restaurants/screen.png"),
    join(refs, "planned-reference.png"),
  );
  copyFileSync(
    join(root, "docs/designs/visited_restaurants/screen.png"),
    join(refs, "visited-reference.png"),
  );
  console.log("copied stitch references");

  const browser = await chromium.launch();

  // Empty passport
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await clearPassport(page);
    for (const [name, width] of [
      ["empty-1440.png", 1440],
      ["empty-390.png", 390],
    ]) {
      await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
      await page.goto(`${base}/passport?proof=empty`, { waitUntil: "networkidle" });
      await shot(page, empty, name);
    }
    await context.close();
  }

  // Active + lists with seeded data
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await seedPassport(page);

    for (const [name, width] of [
      ["active-1440.png", 1440],
      ["active-1280.png", 1280],
      ["active-1024.png", 1024],
      ["active-768.png", 768],
      ["active-390.png", 390],
    ]) {
      await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
      await page.goto(`${base}/passport`, { waitUntil: "networkidle" });
      await shot(page, active, name);
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${base}/passport`, { waitUntil: "networkidle" });
    await page.locator("[data-passport-section='journey-summary']").screenshot({
      path: join(active, "journey-summary.png"),
    });
    await page.locator("[data-passport-section='stars-collected']").screenshot({
      path: join(active, "stars-collected.png"),
    });
    await page.locator("[data-passport-section='states-explored']").screenshot({
      path: join(active, "states-explored.png"),
    });
    await page.locator("[data-passport-section='collections-preview']").screenshot({
      path: join(active, "collections-preview.png"),
    });
    await page.locator("[data-sync-mode='local']").screenshot({
      path: join(active, "device-only-notice.png"),
    });
    console.log("wrote active section crops");

    await page.goto(`${base}/passport?proof=loading`, { waitUntil: "networkidle" });
    await shot(page, active, "loading-passport.png");

    // Saved
    await page.goto(`${base}/saved`, { waitUntil: "networkidle" });
    await shot(page, saved, "saved-1440.png");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "networkidle" });
    await shot(page, saved, "saved-390.png");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${base}/saved?proof=empty`, { waitUntil: "networkidle" });
    await shot(page, saved, "saved-empty.png");
    await page.goto(`${base}/saved`, { waitUntil: "networkidle" });
    const moveBtn = page.getByRole("button", { name: "Move to Planned" }).first();
    if (await moveBtn.isVisible()) {
      await moveBtn.click();
      await page.waitForTimeout(300);
      await shot(page, saved, "move-to-planned.png");
      await page.keyboard.press("Escape");
    }
    await page.goto(`${base}/saved?proof=loading`, { waitUntil: "networkidle" });
    await shot(page, saved, "loading-list.png");

    // Planned
    await page.goto(`${base}/planned`, { waitUntil: "networkidle" });
    await shot(page, planned, "planned-1440.png");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "networkidle" });
    await shot(page, planned, "planned-390.png");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${base}/planned?proof=empty`, { waitUntil: "networkidle" });
    await shot(page, planned, "planned-empty.png");
    await page.goto(`${base}/planned`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Edit plan" }).first().click();
    await page.waitForTimeout(300);
    await shot(page, planned, "edit-plan.png");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Mark visited" }).first().click();
    await page.waitForTimeout(300);
    await shot(page, planned, "mark-visited.png");
    await page.keyboard.press("Escape");
    await shot(page, planned, "truthful-reservation-labels.png");

    // Visited
    await page.goto(`${base}/visited`, { waitUntil: "networkidle" });
    await shot(page, visited, "visited-1440.png");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "networkidle" });
    await shot(page, visited, "visited-390.png");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${base}/visited?proof=empty`, { waitUntil: "networkidle" });
    await shot(page, visited, "visited-empty.png");
    await page.goto(`${base}/visited`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Edit visit" }).first().click();
    await page.waitForTimeout(300);
    await shot(page, visited, "edit-visit.png");
    await page.keyboard.press("Escape");
    const dishes = page.locator("[data-passport-card='visited']").filter({
      hasText: "Xiao Long Bao",
    });
    if (await dishes.count()) {
      await dishes.first().screenshot({
        path: join(visited, "favorite-dishes-notes.png"),
      });
    }

    // Shared edge states
    await page.goto(`${base}/visited`, { waitUntil: "networkidle" });
    await shot(page, active, "long-restaurant-name.png");
    await shot(page, active, "missing-image-fallback.png");
    await shot(page, active, "stale-record-state.png");
    // cloud-state: local notice only without auth — capture device notice already
    copyFileSync(
      join(active, "device-only-notice.png"),
      join(active, "cloud-state.png"),
    );

    await context.close();
  }

  await browser.close();
  console.log("passport baselines complete");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
