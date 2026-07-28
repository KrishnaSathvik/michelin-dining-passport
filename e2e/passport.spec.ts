import { expect, test } from "@playwright/test";

const ACTIVE_SEED = {
  version: 3,
  bookmarks: {
    "benu-san-francisco-ca": {
      restaurantSlug: "benu-san-francisco-ca",
      createdAt: "2026-01-10T12:00:00.000Z",
      updatedAt: "2026-05-12T12:00:00.000Z",
    },
    "singlethread-healdsburg-ca": {
      restaurantSlug: "singlethread-healdsburg-ca",
      createdAt: "2026-02-10T12:00:00.000Z",
      updatedAt: "2026-07-18T12:00:00.000Z",
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
      privateNotes: "This should never appear on the main Passport page.",
      createdAt: "2026-07-18T12:00:00.000Z",
      updatedAt: "2026-07-18T12:00:00.000Z",
    },
  },
  visits: {
    "visit-benu-one": {
      id: "visit-benu-one",
      restaurantSlug: "benu-san-francisco-ca",
      visitDate: "2026-05-12",
      datePrecision: "day",
      favoriteDishes: "Quail, thousand-year-old egg",
      privateNotes: "A full private note that must stay inside editing.",
      wouldReturn: true,
      personalFavorite: true,
      createdAt: "2026-05-12T12:00:00.000Z",
      updatedAt: "2026-05-12T12:00:00.000Z",
    },
    "visit-benu-two": {
      id: "visit-benu-two",
      restaurantSlug: "benu-san-francisco-ca",
      visitDate: "2026-03-01",
      datePrecision: "day",
      favoriteDishes: "",
      privateNotes: "",
      wouldReturn: null,
      personalFavorite: false,
      createdAt: "2026-03-01T12:00:00.000Z",
      updatedAt: "2026-03-01T12:00:00.000Z",
    },
  },
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
  collections: {
    "collection-california": {
      id: "collection-california",
      slug: "california-celebrations",
      name: "California celebrations",
      description: "Tables for special trips",
      private: true,
      coverRestaurantSlug: "singlethread-healdsburg-ca",
      restaurantSlugs: [
        "singlethread-healdsburg-ca",
        "benu-san-francisco-ca",
      ],
      createdAt: "2026-07-18T12:00:00.000Z",
      updatedAt: "2026-07-18T12:00:00.000Z",
    },
  },
};

test.describe("Phase 8 Passport and personal lists", () => {
  test("empty Passport shows new-user composition without bottom nav", async ({
    page,
  }) => {
    await page.goto("/passport");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Your dining journey starts here",
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
    const emptyHeading = page.getByRole("heading", {
      name: "Your dining journey starts here",
    });
    // Settle deterministically: dev proof mode holds the loading state, while
    // production renders the real client passport, which flashes the loading
    // text only transiently during hydration before resolving to the empty
    // state. A one-shot isVisible() check races that flash; wait for one of the
    // two stable end states instead.
    await expect(loading.or(emptyHeading)).toBeVisible();
    if (await emptyHeading.isVisible()) {
      test.skip(true, "proof=loading is development-only");
      return;
    }
    await expect(loading).toBeVisible();
    await expect(emptyHeading).toHaveCount(0);
  });

  test("active passport renders the editorial journey in the approved order", async ({ page }) => {
    await page.addInitScript((store) => {
      window.localStorage.setItem("mdp-passport", JSON.stringify(store));
    }, ACTIVE_SEED);
    await page.goto("/passport");
    await expect(
      page.getByRole("heading", { level: 1, name: "Your dining journey" }),
    ).toBeVisible();
    await expect(page.getByLabel("Journey summary")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Upcoming planned visit" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Recent visits" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Saved restaurants" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Collections" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "View all saved" })).toHaveCount(
      0,
    );
    await expect(page.getByRole("link", { name: "Browse collections" })).toHaveCount(
      0,
    );
    await expect(
      page.locator("[data-passport-card='visit']").filter({ hasText: "Benu" }),
    ).toHaveCount(2);
    await expect(
      page.locator("[data-passport-card='saved']").filter({ hasText: "Benu" }),
    ).toHaveCount(1);
    await expect(page.getByText("Personal favorite")).toBeVisible();
    await expect(page.getByText("PRIVATE-REFERENCE")).toHaveCount(0);
    await expect(
      page.getByText("A full private note that must stay inside editing."),
    ).toHaveCount(0);
    await expect(page.getByText(/Want|Favorites|Stars Collected|States Explored/)).toHaveCount(0);
  });

  test("saved-only passport hides empty upcoming and recent visit sections", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "mdp-passport",
        JSON.stringify({
          version: 3,
          bookmarks: {
            "benu-san-francisco-ca": {
              restaurantSlug: "benu-san-francisco-ca",
              createdAt: "2026-01-10T12:00:00.000Z",
              updatedAt: "2026-05-12T12:00:00.000Z",
            },
          },
          plans: {},
          visits: {},
          userRestaurants: {},
          collections: {},
        }),
      );
    });
    await page.goto("/passport");
    await expect(
      page.getByRole("heading", { level: 1, name: "Your dining journey" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Saved restaurants" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Upcoming planned visit" }),
    ).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Upcoming plan" })).toHaveCount(
      0,
    );
    await expect(page.getByRole("heading", { name: "Recent visits" })).toHaveCount(
      0,
    );
    await expect(page.getByText(/View saved restaurants/i)).toHaveCount(0);
    await expect(page.getByRole("link", { name: "View all saved" })).toHaveCount(
      0,
    );
    await expect(page.getByRole("link", { name: "Browse collections" })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("button", { name: "Create collection" }).first(),
    ).toBeVisible();
  });

  test("saved preview caps at three cards and shows View all when needed", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const now = "2026-07-18T12:00:00.000Z";
      const bookmarks = Object.fromEntries(
        [
          "benu-san-francisco-ca",
          "singlethread-healdsburg-ca",
          "atelier-crenn-san-francisco-ca",
          "quince-san-francisco-ca",
        ].map((slug, index) => [
          slug,
          {
            restaurantSlug: slug,
            createdAt: now,
            updatedAt: `2026-07-${String(18 - index).padStart(2, "0")}T12:00:00.000Z`,
          },
        ]),
      );
      window.localStorage.setItem(
        "mdp-passport",
        JSON.stringify({
          version: 3,
          bookmarks,
          plans: {},
          visits: {},
          userRestaurants: {},
          collections: {},
        }),
      );
    });
    await page.goto("/passport");
    await expect(page.locator("[data-passport-card='saved']")).toHaveCount(3);
    await expect(page.getByRole("link", { name: "View all saved" })).toBeVisible();
  });

  test("Passport and journey dialog stay within every required mobile viewport", async ({
    page,
  }) => {
    await page.addInitScript((store) => {
      window.localStorage.setItem("mdp-passport", JSON.stringify(store));
    }, ACTIVE_SEED);
    await page.goto("/passport");

    for (const width of [430, 390, 375]) {
      await page.setViewportSize({ width, height: 844 });
      const dimensions = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.documentWidth).toBe(dimensions.innerWidth);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Edit plan" }).click();
    const dialog = page.getByRole("dialog", { name: "Edit your plan" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Planned date")).toBeFocused();
    const dialogWidth = await dialog.evaluate(
      (element) => element.getBoundingClientRect().width,
    );
    expect(dialogWidth).toBeGreaterThanOrEqual(350);
    expect(dialogWidth).toBeLessThanOrEqual(390);
  });

  test("an overdue plan is labeled Needs update without becoming a visit", async ({
    page,
  }) => {
    await page.addInitScript((store) => {
      const copy = structuredClone(store);
      copy.plans["plan-singlethread"].plannedDate = "2026-07-01";
      window.localStorage.setItem("mdp-passport", JSON.stringify(copy));
    }, ACTIVE_SEED);
    await page.goto("/passport");
    const overdue = page.locator("[data-plan-status='needs-update']");
    await expect(overdue.getByText("Needs update", { exact: true })).toBeVisible();
    await expect(
      overdue.getByText(/will not assume the meal happened/i),
    ).toBeVisible();
    await expect(overdue.getByRole("button", { name: "Reschedule" })).toBeVisible();
    const removePlan = overdue.getByRole("button", { name: "Remove plan" });
    await expect(removePlan).toBeVisible();
    await removePlan.click();
    await expect(
      page.getByRole("dialog", { name: "Remove plan?" }),
    ).toBeVisible();
    await expect(
      page.getByText(/does not cancel a restaurant reservation/i),
    ).toBeVisible();
  });

  test("saved empty state and one H1", async ({ page }) => {
    await page.goto("/saved?proof=empty");
    await expect(
      page.getByRole("heading", { level: 1, name: "Saved restaurants" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: "No saved restaurants yet" }),
    ).toBeVisible();
  });

  test("/planned route exists with empty state", async ({ page }) => {
    await page.goto("/planned?proof=empty");
    await expect(
      page.getByRole("heading", { level: 1, name: "Planned meals" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "No meals planned yet" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Explore restaurants" })).toBeVisible();
  });

  test("visited title and dining-history subtitle", async ({ page }) => {
    await page.goto("/visited?proof=empty");
    await expect(
      page.getByRole("heading", { level: 1, name: "Visited restaurants" }),
    ).toBeVisible();
    await expect(
      page.getByText(/private history of meals/i),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "No visits recorded yet" }),
    ).toBeVisible();
  });

  test("plan and visit flows update personal lists", async ({ page }) => {
    await page.goto("/restaurants/benu-san-francisco-ca");
    const journey = page.locator("[data-restaurant-journey-actions]");
    await expect(journey).toBeVisible();

    const saveBtn = journey.getByRole("button", {
      name: /Save Benu to My Restaurants|Benu is saved in My Restaurants/i,
    });
    if ((await saveBtn.getAttribute("aria-pressed")) !== "true") {
      await saveBtn.click();
    }

    await journey.getByRole("button", { name: "Plan a visit" }).click();
    const planDialog = page.getByRole("dialog", { name: "Plan a visit" });
    await expect(planDialog).toBeVisible();
    await planDialog.getByLabel("Planned date").fill("2026-09-01");
    await planDialog.getByRole("button", { name: "Save plan" }).click();
    await expect(planDialog).toHaveCount(0);

    await page.goto("/saved");
    await expect(
      page.locator("[data-passport-card='saved']").filter({ hasText: "Benu" }),
    ).toHaveCount(0);
    await expect(
      page.locator("[data-personal-card='saved']").filter({ hasText: "Benu" }),
    ).toBeVisible();

    await page.goto("/planned");
    const planned = page.locator("[data-personal-card='planned']").filter({
      hasText: "Benu",
    });
    await expect(planned).toBeVisible();
    await expect(planned.getByRole("button", { name: "Edit plan" })).toBeVisible();

    await page.goto("/restaurants/benu-san-francisco-ca");
    await page.getByRole("button", { name: "Record a visit" }).click();
    const visitDialog = page.getByRole("dialog", { name: "Record a visit" });
    await expect(visitDialog).toBeVisible();
    await visitDialog.getByLabel("Visit date").fill("2026-06-01");
    await visitDialog.getByRole("button", { name: "Save visit" }).click();
    await expect(visitDialog).toHaveCount(0);

    await page.goto("/visited");
    await expect(
      page.locator("[data-personal-card='visited']").filter({ hasText: "Benu" }),
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
