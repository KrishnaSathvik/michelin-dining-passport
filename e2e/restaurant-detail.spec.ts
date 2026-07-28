import { expect, test } from "@playwright/test";

const DETAIL_SEED = {
  version: 3,
  bookmarks: {
    "benu-san-francisco-ca": {
      restaurantSlug: "benu-san-francisco-ca",
      createdAt: "2026-01-10T12:00:00.000Z",
      updatedAt: "2026-07-18T12:00:00.000Z",
    },
  },
  plans: {
    "plan-benu": {
      id: "plan-benu",
      restaurantSlug: "benu-san-francisco-ca",
      plannedDate: "2026-08-12",
      plannedTime: "19:30",
      reservationProvider: "Tock",
      confirmationReference: "PRIVATE-REFERENCE",
      privateNotes: "Private plan note that must not render on the page.",
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
      privateNotes: "Private visit note that must not render on the page.",
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
  userRestaurants: {},
  collections: {
    "collection-california": {
      id: "collection-california",
      slug: "california-celebrations",
      name: "California celebrations",
      description: "Tables for special trips",
      private: true,
      coverRestaurantSlug: "benu-san-francisco-ca",
      restaurantSlugs: ["benu-san-francisco-ca"],
      createdAt: "2026-07-18T12:00:00.000Z",
      updatedAt: "2026-07-18T12:00:00.000Z",
    },
  },
};

test.describe("Restaurant detail redesign", () => {
  test("known restaurant renders the editorial identity and shared actions", async ({
    page,
  }) => {
    await page.goto("/restaurants/benu-san-francisco-ca");
    await expect(page.getByRole("heading", { level: 1, name: "Benu" })).toBeVisible();
    await expect(page.locator('[data-restaurant-detail="stitch"]')).toBeVisible();
    // The App Router streams the resolved detail inside a hidden Suspense buffer
    // that a client script reveals; wait for the swap to settle so the locator
    // does not transiently match both the live gallery and its hidden twin.
    await expect(page.locator("[data-restaurant-gallery]")).toHaveCount(1);
    await expect(page.locator("[data-restaurant-gallery]")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Save Benu to My Restaurants/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Plan a visit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Record a visit" })).toBeVisible();
    await expect(page.getByText(/Want|Top-level Favorite|Add planning details/)).toHaveCount(0);
  });

  test("unknown slug returns not found", async ({ page }) => {
    const response = await page.goto("/restaurants/this-slug-does-not-exist-xyz");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "This table could not be found.",
      }),
    ).toBeVisible();
    await expect(
      page.locator('[data-restaurant-detail="stitch"]'),
    ).toHaveCount(0);
  });

  test("one H1 and bounded Google section present", async ({ page }) => {
    await page.goto("/restaurants/benu-san-francisco-ca");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const provider = page.locator("[data-google-places-section='detail']");
    await expect(
      provider.getByRole("heading", {
        name: "Current place information from Google",
      }),
    ).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
    const width = await provider.evaluate(
      (element) => element.getBoundingClientRect().width,
    );
    expect(width).toBeGreaterThan(700);
  });

  test("planning and recording visits use the shared interactions", async ({
    page,
  }) => {
    await page.goto("/restaurants/benu-san-francisco-ca");
    await page.getByRole("button", { name: "Plan a visit" }).click();
    const dialog = page.getByRole("dialog", { name: "Plan a visit" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Planned date")).toBeFocused();
    await dialog.getByRole("button", { name: "Close" }).first().click();
    await expect(dialog).toHaveCount(0);
    await page.getByRole("button", { name: "Record a visit" }).click();
    const visitDialog = page.getByRole("dialog", { name: "Record a visit" });
    await expect(visitDialog).toBeVisible();
    await visitDialog.getByRole("button", { name: "Close" }).first().click();
    await expect(visitDialog).toHaveCount(0);
  });

  test("multiple visits and plan render in one private list summary", async ({
    page,
  }) => {
    await page.addInitScript((store) => {
      window.localStorage.setItem("mdp-passport", JSON.stringify(store));
    }, DETAIL_SEED);
    await page.goto("/restaurants/benu-san-francisco-ca");
    const passport = page.locator("[data-restaurant-passport-summary]");
    await expect(passport.getByRole("heading", { name: "My Restaurants" })).toBeVisible();
    await expect(passport.getByText(/Planned.*Aug 12, 2026/i)).toBeVisible();
    await expect(passport.getByText(/Visited twice/i)).toBeVisible();
    await expect(passport.getByText("Quail, thousand-year-old egg")).toBeVisible();
    await expect(passport.getByText("Personal favorite")).toBeVisible();
    await expect(page.getByText("PRIVATE-REFERENCE")).toHaveCount(0);
    await expect(
      page.getByText("Private visit note that must not render on the page."),
    ).toHaveCount(0);
  });

  test("Saved with dependents opens explicit Remove from Passport flow", async ({
    page,
  }) => {
    await page.addInitScript((store) => {
      window.localStorage.setItem("mdp-passport", JSON.stringify(store));
    }, DETAIL_SEED);
    await page.goto("/restaurants/benu-san-francisco-ca");
    await page.getByRole("button", { name: /Benu is saved in My Restaurants/i }).click();
    const dialog = page.getByRole("dialog", {
      name: "Remove Benu from My Restaurants?",
    });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/one upcoming plan/i)).toBeVisible();
    await expect(dialog.getByText(/two recorded visits/i)).toBeVisible();
    await expect(dialog.getByText(/one collection/i)).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Remove everything" }),
    ).toBeVisible();
  });

  test("related discovery has Save and details but no reservation actions", async ({
    page,
  }) => {
    await page.goto("/restaurants/benu-san-francisco-ca");
    await expect(page.locator("[data-related-section]").first()).toBeVisible();
    await expect(
      page.locator(
        "[data-related-section] a, [data-destination-section] a",
      ).filter({ hasText: /Reserve|availability|booking/i }),
    ).toHaveCount(0);
  });

  test("approved coordinates render a substantial location map", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/restaurants/benu-san-francisco-ca");
    const map = page.locator("[data-restaurant-detail-map]");
    await expect(map).toBeVisible();
    const height = await map.evaluate(
      (element) => element.getBoundingClientRect().height,
    );
    expect(height).toBeGreaterThanOrEqual(420);
  });

  test("missing coordinates use the address-first fallback without an empty map", async ({
    page,
  }) => {
    await page.goto("/restaurants/addison-san-diego-ca");
    await expect(page.locator("[data-restaurant-detail-map]")).toHaveCount(0);
    const location = page.getByLabel("Location");
    await expect(location.getByRole("heading", { name: "Location" })).toBeVisible();
    await expect(location.getByRole("link", { name: /Get directions/i })).toBeVisible();
  });

  test("gallery proof opens the keyboard-accessible full-screen viewer", async ({
    page,
  }) => {
    await page.goto("/restaurants/benu-san-francisco-ca?proof=gallery");
    await page.getByRole("button", { name: /View all 3 photos/i }).click();
    const viewer = page.getByRole("dialog", { name: "Benu photo gallery" });
    await expect(viewer).toBeVisible();
    await expect(viewer.getByRole("status")).toHaveText("Image 1 of 3");
    await page.keyboard.press("ArrowRight");
    await expect(viewer.getByRole("status")).toHaveText("Image 2 of 3");
  });

  test("one-image, representative, and initials media states remain deliberate", async ({
    page,
  }) => {
    await page.goto("/restaurants/benu-san-francisco-ca?proof=one-image");
    await expect(page.locator("[data-gallery-state='verified-1']").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "View photo" })).toBeVisible();

    await page.goto("/restaurants/benu-san-francisco-ca?proof=representative");
    await expect(
      page.locator("[data-gallery-state='representative']").first(),
    ).toBeVisible();
    await expect(page.getByText("Representative image").first()).toBeVisible();

    await page.goto("/restaurants/benu-san-francisco-ca");
    await expect(page.locator("[data-gallery-state='initials']").first()).toBeVisible();
  });

  test("reservation-unavailable profiles remain coherent", async ({ page }) => {
    await page.goto("/restaurants/hayato-los-angeles-ca");
    await expect(
      page.getByRole("heading", { level: 1, name: "Hayato" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Reserve a table/i }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /Save Hayato to My Restaurants/i }),
    ).toBeVisible();
  });

  test("all required widths avoid horizontal overflow", async ({ page }) => {
    await page.goto("/restaurants/benu-san-francisco-ca");
    for (const [width, height] of [
      [1440, 900],
      [1280, 900],
      [1024, 900],
      [768, 1024],
      [430, 932],
      [390, 844],
      [375, 812],
    ] as const) {
      await page.setViewportSize({ width, height });
      const dimensions = await page.evaluate(() => ({
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
      }));
      expect(dimensions.document).toBe(dimensions.viewport);
    }
  });

  test("mobile sticky actions do not duplicate the visible primary actions", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/restaurants/benu-san-francisco-ca");
    await expect(page.locator("[data-restaurant-sticky-bar]")).toHaveCount(0);

    await page.getByRole("heading", { name: "Location" }).scrollIntoViewIfNeeded();
    await expect(page.locator("[data-restaurant-sticky-bar]")).toBeVisible();

    await page
      .locator("[data-restaurant-journey-actions]")
      .scrollIntoViewIfNeeded();
    await expect(page.locator("[data-restaurant-sticky-bar]")).toHaveCount(0);
  });

  test("mobile journey dialogs use the available viewport width", async ({
    page,
  }) => {
    await page.addInitScript((store) => {
      window.localStorage.setItem("mdp-passport", JSON.stringify(store));
    }, DETAIL_SEED);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/restaurants/benu-san-francisco-ca");

    await page.getByRole("button", { name: "Edit plan" }).click();
    const planDialog = page.getByRole("dialog", { name: "Edit your plan" });
    const planWidth = await planDialog.evaluate(
      (element) => element.getBoundingClientRect().width,
    );
    expect(planWidth).toBeGreaterThan(340);
    expect(planWidth).toBeLessThanOrEqual(390);
    await planDialog.getByRole("button", { name: "Close" }).first().click();

    await page
      .getByRole("button", { name: /Benu is saved in My Restaurants/i })
      .click();
    const removeDialog = page.getByRole("dialog", {
      name: "Remove Benu from My Restaurants?",
    });
    const removeWidth = await removeDialog.evaluate(
      (element) => element.getBoundingClientRect().width,
    );
    expect(removeWidth).toBeGreaterThan(340);
    expect(removeWidth).toBeLessThanOrEqual(390);

    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(dimensions.document).toBe(dimensions.viewport);
  });
});
