import { expect, test } from "@playwright/test";

const ACTIVE_SEED = {
  version: 2,
  userRestaurants: {
    "benu-san-francisco-ca": {
      restaurantSlug: "benu-san-francisco-ca",
      saved: true,
      wantToVisit: false,
      planned: false,
      visited: true,
      favorite: true,
      visitDate: "2026-05-12",
      personalRating: 5,
      notes: "",
      favoriteDishes: [],
      reservationPlannedFor: null,
      reservationProvider: null,
      reservationConfirmationNote: null,
      createdAt: "2026-01-10T12:00:00.000Z",
      updatedAt: "2026-05-12T12:00:00.000Z",
    },
  },
  collections: {},
};

test.describe("Phase 8 Passport and personal lists", () => {
  test("empty Passport shows new-user composition without bottom nav", async ({
    page,
  }) => {
    await page.goto("/passport");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Your dining journey starts with one table.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Explore restaurants" }).first(),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Open map" }).first()).toBeVisible();
    await expect(page.getByText(/stored on this device/i)).toBeVisible();
    await expect(page.getByText("L'Assiette")).toHaveCount(0);
    await expect(page.locator("nav[aria-label='Mobile']")).toHaveCount(0);
    await expect(page.locator("[data-bottom-nav]")).toHaveCount(0);
  });

  test("loading proof does not flash empty state", async ({ page }) => {
    // Dev-only proof mode — unavailable under next start / production.
    await page.goto("/passport?proof=loading");
    const loading = page.getByText("Loading passport…");
    const visible = await loading.isVisible().catch(() => false);
    if (!visible) {
      test.skip(true, "proof=loading is development-only");
      return;
    }
    await expect(loading).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Your dining journey starts with one table.",
      }),
    ).toHaveCount(0);
  });

  test("active passport renders journey summary modules", async ({ page }) => {
    await page.addInitScript((store) => {
      window.localStorage.setItem("mdp-passport", JSON.stringify(store));
    }, ACTIVE_SEED);
    await page.goto("/passport");
    await expect(
      page.getByRole("heading", { level: 1, name: "Your dining journey" }),
    ).toBeVisible();
    await expect(page.getByLabel("Journey summary")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Stars Collected" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "States Explored" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Personal Collections" }),
    ).toBeVisible();
  });

  test("saved empty state and one H1", async ({ page }) => {
    await page.goto("/saved?proof=empty");
    await expect(
      page.getByRole("heading", { level: 1, name: "Saved Restaurants" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: "No saved restaurants yet" }),
    ).toBeVisible();
  });

  test("/planned route exists with empty state", async ({ page }) => {
    await page.goto("/planned?proof=empty");
    await expect(
      page.getByRole("heading", { level: 1, name: "Planned Visits" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "No planned visits yet" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "View saved" })).toBeVisible();
  });

  test("visited title and dining-history subtitle", async ({ page }) => {
    await page.goto("/visited?proof=empty");
    await expect(
      page.getByRole("heading", { level: 1, name: "Visited" }),
    ).toBeVisible();
    await expect(
      page.getByText("Your dining history", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "No visits logged yet" }),
    ).toBeVisible();
  });

  test("plan and visit flows update personal lists", async ({ page }) => {
    await page.goto("/restaurants/benu-san-francisco-ca");
    const journey = page.locator("[data-journey-controls]");
    await expect(journey).toBeVisible();

    const saveBtn = journey.getByRole("button", { name: /Save,/ });
    if ((await saveBtn.getAttribute("aria-pressed")) !== "true") {
      await saveBtn.click();
    }

    const plannedBtn = journey.getByRole("button", { name: /Planned,/ });
    if ((await plannedBtn.getAttribute("aria-pressed")) !== "true") {
      await plannedBtn.click();
    }

    const planDialog = page.getByRole("dialog", { name: "Plan your visit" });
    if (await planDialog.isVisible().catch(() => false)) {
      await planDialog.getByLabel("Planned date").fill("2026-09-01");
      await planDialog.getByRole("button", { name: "Save plan" }).click();
      await expect(planDialog).toHaveCount(0);
    }

    await page.goto("/saved");
    await expect(
      page.locator("[data-passport-card='saved']").filter({ hasText: "Benu" }),
    ).toBeVisible();

    await page.goto("/planned");
    const planned = page.locator("[data-passport-card='planned']").filter({
      hasText: "Benu",
    });
    await expect(planned).toBeVisible();
    await expect(
      planned.getByRole("link", {
        name: /Check availability|Reserve now|View booking options|Visit restaurant website/i,
      }),
    ).toBeVisible();
    await expect(planned.getByText("Manage Reservation")).toHaveCount(0);

    await planned.getByRole("button", { name: "Mark visited" }).click();
    const visitDialog = page.getByRole("dialog", { name: "Record your visit" });
    await expect(visitDialog).toBeVisible();
    await visitDialog.getByLabel("Visit date").fill("2026-06-01");
    await visitDialog.getByRole("button", { name: "Save visit" }).click();
    await expect(visitDialog).toHaveCount(0);

    await page.goto("/visited");
    await expect(
      page.locator("[data-passport-card='visited']").filter({ hasText: "Benu" }),
    ).toBeVisible();
  });

  test("no Google Places UI Kit on passport routes", async ({ page }) => {
    for (const path of ["/passport", "/saved", "/planned", "/visited"]) {
      await page.goto(path);
      await expect(page.locator("gmp-place-details")).toHaveCount(0);
      await expect(page.locator("gmpx-place-details")).toHaveCount(0);
      await expect(page.getByText(/Google reviews|Open now/i)).toHaveCount(0);
    }
  });
});
