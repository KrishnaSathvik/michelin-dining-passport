import { expect, test } from "@playwright/test";

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
      notes: "Private note stays after remove.",
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
  },
  collections: {
    "col-ca": {
      id: "col-ca",
      slug: "california-celebration-trip",
      name: "California Celebration Trip",
      description: "Coastal anniversary dining.",
      private: true,
      coverRestaurantSlug: "benu-san-francisco-ca",
      restaurantSlugs: ["benu-san-francisco-ca", "addison-san-diego-ca"],
      createdAt: "2026-01-01T12:00:00.000Z",
      updatedAt: "2026-06-01T12:00:00.000Z",
    },
  },
};

async function seedPassport(page: import("@playwright/test").Page) {
  await page.addInitScript((store) => {
    window.localStorage.setItem("mdp-passport", JSON.stringify(store));
  }, SEED_STORE);
}

test.describe("Phase 9 Collections", () => {
  test("loading proof does not flash empty state", async ({ page }) => {
    await page.goto("/collections?proof=loading");
    await expect(page.getByText("Loading collections…")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "No collections yet" }),
    ).toHaveCount(0);
  });

  test("empty index state and one H1", async ({ page }) => {
    await page.goto("/collections?proof=empty");
    await expect(
      page.getByRole("heading", { level: 1, name: "Collections" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: "No collections yet" }),
    ).toBeVisible();
    await expect(page.getByText(/Make collection public/i)).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Share/i })).toHaveCount(0);
  });

  test("seeded index renders featured and grid without public controls", async ({
    page,
  }) => {
    await seedPassport(page);
    await page.goto("/collections");
    await expect(
      page.getByRole("heading", { level: 1, name: "Collections" }),
    ).toBeVisible();
    await expect(page.getByText("Featured")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "California Celebration Trip" }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Search collections")).toBeVisible();
    await expect(page.getByText(/Make collection public/i)).toHaveCount(0);
    await expect(page.locator("gmpx-place-overview")).toHaveCount(0);
  });

  test("create dialog validates name and omits public toggle", async ({
    page,
  }) => {
    await page.goto("/collections?proof=empty");
    await page.getByRole("button", { name: "Create collection" }).first().click();
    await expect(
      page.getByRole("heading", { name: "Create new collection" }),
    ).toBeVisible();
    await expect(page.getByText(/Make collection public/i)).toHaveCount(0);
    await page.getByRole("button", { name: "Create collection" }).last().click();
    await expect(page.getByText("Collection name is required.")).toBeVisible();
  });

  test("create persists and navigates to detail", async ({ page }) => {
    await page.goto("/collections?proof=empty");
    await page.getByRole("button", { name: "Create collection" }).first().click();
    await page.getByLabel("Collection name").fill("Phase 9 Test List");
    await page
      .getByLabel(/Description/i)
      .fill("Created by Playwright.");
    await page.getByRole("button", { name: "Create collection" }).last().click();
    await expect(page).toHaveURL(/\/collections\/phase-9-test-list/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Phase 9 Test List" }),
    ).toBeVisible();
  });

  test("detail renders breadcrumbs, progress, and member rows", async ({
    page,
  }) => {
    await seedPassport(page);
    await page.goto("/collections/california-celebration-trip");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "California Celebration Trip",
      }),
    ).toBeVisible();
    await expect(page.getByLabel("Breadcrumb")).toBeVisible();
    await expect(page.getByText("Collection Progress")).toBeVisible();
    await expect(page.getByRole("button", { name: /Share/i })).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Benu", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Addison", exact: true }),
    ).toBeVisible();
  });

  test("unknown collection fails safely", async ({ page }) => {
    await page.goto("/collections/does-not-exist");
    await expect(
      page.getByRole("heading", { name: "Collection not found" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to collections" }),
    ).toBeVisible();
  });

  test("remove from collection preserves Passport visited/saved state", async ({
    page,
  }) => {
    await seedPassport(page);
    await page.goto("/collections/california-celebration-trip");
    await page
      .getByRole("button", { name: "Remove from collection" })
      .first()
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Remove from collection" })
      .click();
    await page.goto("/visited");
    await expect(
      page.getByRole("link", { name: "Benu", exact: true }),
    ).toBeVisible();
    await page.goto("/saved");
    await expect(
      page.getByRole("link", { name: "Benu", exact: true }),
    ).toBeVisible();
  });

  test("delete collection redirects and keeps restaurant records", async ({
    page,
  }) => {
    await seedPassport(page);
    await page.goto("/collections/california-celebration-trip");
    await page.getByLabel("More collection actions").click();
    await page.getByRole("menuitem", { name: "Delete collection" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Delete collection" })
      .click();
    await expect(page).toHaveURL(/\/collections$/);
    await page.goto("/visited");
    await expect(
      page.getByRole("link", { name: "Benu", exact: true }),
    ).toBeVisible();
  });

  test("no Google UI kit on collections routes", async ({ page }) => {
    await seedPassport(page);
    await page.goto("/collections");
    await expect(page.locator("gmpx-place-overview")).toHaveCount(0);
    await page.goto("/collections/california-celebration-trip");
    await expect(page.locator("gmpx-place-overview")).toHaveCount(0);
  });
});
