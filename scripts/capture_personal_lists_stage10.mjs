import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const origin = process.env.PERSONAL_LISTS_ORIGIN ?? "http://127.0.0.1:3124";
const output = "output/playwright/stage10-personal-lists";
const widths = [1440, 1280, 1024, 768, 430, 390, 375];
const seed = {
  version: 3,
  bookmarks: {
    "benu-san-francisco-ca": {
      restaurantSlug: "benu-san-francisco-ca",
      createdAt: "2026-01-10T12:00:00.000Z",
      updatedAt: "2026-07-19T12:00:00.000Z",
    },
    "singlethread-healdsburg-ca": {
      restaurantSlug: "singlethread-healdsburg-ca",
      createdAt: "2026-02-10T12:00:00.000Z",
      updatedAt: "2026-07-19T12:00:00.000Z",
    },
  },
  plans: {
    upcoming: {
      id: "upcoming",
      restaurantSlug: "singlethread-healdsburg-ca",
      plannedDate: "2026-08-12",
      plannedTime: "19:30",
      reservationProvider: "Tock",
      confirmationReference: "PRIVATE-REFERENCE",
      privateNotes: "Private planning note",
      createdAt: "2026-07-19T12:00:00.000Z",
      updatedAt: "2026-07-19T12:00:00.000Z",
    },
    overdue: {
      id: "overdue",
      restaurantSlug: "benu-san-francisco-ca",
      plannedDate: "2026-07-10",
      plannedTime: null,
      reservationProvider: null,
      confirmationReference: null,
      privateNotes: "",
      createdAt: "2026-07-01T12:00:00.000Z",
      updatedAt: "2026-07-01T12:00:00.000Z",
    },
  },
  visits: {
    dated: {
      id: "dated",
      restaurantSlug: "benu-san-francisco-ca",
      visitDate: "2026-05-12",
      datePrecision: "day",
      favoriteDishes: "Quail, thousand-year-old egg",
      privateNotes: "A private visit note shown only after expansion.",
      wouldReturn: true,
      personalFavorite: true,
      createdAt: "2026-05-12T12:00:00.000Z",
      updatedAt: "2026-05-12T12:00:00.000Z",
    },
    undated: {
      id: "undated",
      restaurantSlug: "benu-san-francisco-ca",
      visitDate: null,
      datePrecision: "unknown",
      favoriteDishes: "",
      privateNotes: "",
      wouldReturn: null,
      personalFavorite: false,
      createdAt: "2025-01-01T12:00:00.000Z",
      updatedAt: "2025-01-01T12:00:00.000Z",
      migrationSource: "legacy-v2",
    },
  },
  userRestaurants: {},
  collections: {},
};

await mkdir(output, { recursive: true });
const browser = await chromium.launch();

async function capture(path, name, width, options = {}) {
  const context = await browser.newContext({
    viewport: { width, height: width <= 430 ? 844 : 900 },
  });
  if (options.seed !== false) {
    await context.addInitScript((store) => {
      window.localStorage.setItem("mdp-passport", JSON.stringify(store));
    }, seed);
  }
  const page = await context.newPage();
  await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
  if (options.expandVisits) {
    await page.getByRole("button", { name: "Expand visit history" }).click();
  }
  await page.screenshot({
    path: `${output}/${name}-${width}.png`,
    fullPage: true,
  });
  await context.close();
}

for (const width of widths) {
  await capture("/saved", "saved-populated", width);
  await capture("/planned", "planned-upcoming-overdue", width);
  await capture("/visited", "visited-multiple-expanded", width, {
    expandVisits: true,
  });
}

await capture("/saved?proof=empty", "saved-empty", 1440, { seed: false });
await capture("/planned?proof=empty", "planned-empty", 1440, { seed: false });
await capture("/visited?proof=empty", "visited-empty", 1440, { seed: false });
await capture("/saved?proof=sync-pending", "saved-sync-pending", 390);
await capture("/saved?proof=sync-failed", "saved-sync-failed", 390);

await browser.close();
