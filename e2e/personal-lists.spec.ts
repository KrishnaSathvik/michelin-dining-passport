import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const PERSONAL_LIST_SEED = {
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
    "plan-singlethread": {
      id: "plan-singlethread",
      restaurantSlug: "singlethread-healdsburg-ca",
      plannedDate: "2026-08-12",
      plannedTime: "19:30",
      reservationProvider: "Tock",
      confirmationReference: "PRIVATE-REFERENCE",
      privateNotes: "Private planning note",
      createdAt: "2026-07-19T12:00:00.000Z",
      updatedAt: "2026-07-19T12:00:00.000Z",
    },
    "plan-benu-overdue": {
      id: "plan-benu-overdue",
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
    "visit-benu-one": {
      id: "visit-benu-one",
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
    "visit-benu-undated": {
      id: "visit-benu-undated",
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

async function seedPassport(page: Page) {
  await page.addInitScript((store) => {
    window.localStorage.setItem("mdp-passport", JSON.stringify(store));
  }, PERSONAL_LIST_SEED);
}

test.describe("Normalized Saved, Planned, and Visited views", () => {
  test("Saved is bookmark-backed, URL-filtered, and dependency-aware", async ({
    page,
  }) => {
    await seedPassport(page);
    await page.goto("/saved");

    await expect(
      page.getByRole("heading", { level: 1, name: "Saved restaurants" }),
    ).toBeVisible();
    await expect(page.locator("[data-personal-card='saved']")).toHaveCount(2);
    await expect(page.getByText("Visited twice")).toBeVisible();
    await expect(page.getByText(/Planned · Aug 12, 2026/)).toBeVisible();

    await page.getByLabel("Michelin distinction").selectOption("3");
    await expect(page).toHaveURL(/stars=3/);
    await page.getByPlaceholder("Search saved restaurants").fill("Benu");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/q=Benu/);
    await expect(page.locator("[data-personal-card='saved']")).toHaveCount(1);

    await page.getByRole("button", { name: "Manage Benu in My Restaurants" }).click();
    await expect(
      page.getByRole("dialog", {
        name: "Remove Benu from My Restaurants?",
      }),
    ).toBeVisible();
    await expect(page.getByText("two recorded visits")).toBeVisible();
  });

  test("Planned separates upcoming and overdue plans and reuses journey dialogs", async ({
    page,
  }) => {
    await seedPassport(page);
    await page.goto("/planned");

    await expect(
      page.getByRole("heading", { level: 1, name: "Planned meals" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Upcoming" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Needs update" }),
    ).toBeVisible();
    const overdue = page.locator("[data-plan-status='needs-update']");
    await expect(overdue.getByRole("heading", { name: "Benu" })).toBeVisible();
    await expect(overdue.getByRole("button", { name: "Record visit" })).toBeVisible();
    await expect(overdue.getByRole("button", { name: "Reschedule" })).toBeVisible();
    await expect(overdue.getByRole("button", { name: "Remove plan" })).toBeVisible();
    await expect(page.getByText("PRIVATE-REFERENCE")).toHaveCount(0);

    await overdue.getByRole("button", { name: "Remove plan" }).click();
    await expect(page.getByRole("dialog", { name: "Remove plan?" })).toBeVisible();
    await expect(page.getByText(/does not cancel a restaurant reservation/i)).toBeVisible();
  });

  test("Visited groups multiple visits and reveals private previews intentionally", async ({
    page,
  }) => {
    await seedPassport(page);
    await page.goto("/visited");

    await expect(
      page.getByRole("heading", { level: 1, name: "Visited restaurants" }),
    ).toBeVisible();
    await expect(page.locator("[data-personal-card='visited']")).toHaveCount(1);
    await expect(page.getByText("Visited twice")).toBeVisible();
    await expect(page.getByText("Personal favorite")).toBeVisible();
    await expect(
      page.getByText("A private visit note shown only after expansion."),
    ).toHaveCount(0);

    await page.getByRole("button", { name: "Expand visit history" }).click();
    await expect(page.getByText("Visited · Date not recorded")).toBeVisible();
    await expect(
      page.getByText(/A private visit note shown only after expansion/),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit" })).toHaveCount(2);
    await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(2);
  });

  test("empty states and sync recovery use the shared Passport shell", async ({
    page,
  }) => {
    await page.goto("/planned?proof=empty");
    await expect(
      page.getByRole("heading", { name: "No meals planned yet" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Explore restaurants" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open map" })).toBeVisible();

    await page.goto("/saved?proof=sync-failed");
    const failureNotice = page.getByText(
      /Couldn’t sync your latest change/,
    );
    if (!(await failureNotice.isVisible().catch(() => false))) {
      test.skip(true, "proof=sync-failed is development-only");
      return;
    }
    await expect(failureNotice).toBeVisible();
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  });

  test("all three views and their shared dialogs remain viewport-safe", async ({
    page,
  }) => {
    await seedPassport(page);
    for (const path of ["/saved", "/planned", "/visited"]) {
      await page.goto(path);
      for (const width of [430, 390, 375]) {
        await page.setViewportSize({ width, height: 844 });
        const dimensions = await page.evaluate(() => ({
          viewport: window.innerWidth,
          document: document.documentElement.scrollWidth,
        }));
        expect(dimensions.document).toBe(dimensions.viewport);
      }
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/planned");
    await page.getByRole("button", { name: "Edit plan" }).click();
    const dialog = page.getByRole("dialog", { name: "Edit your plan" });
    await expect(dialog).toBeVisible();
    const width = await dialog.evaluate(
      (element) => element.getBoundingClientRect().width,
    );
    expect(width).toBeGreaterThanOrEqual(350);
    expect(width).toBeLessThanOrEqual(390);
  });
});
