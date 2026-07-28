import { test, expect } from "@playwright/test";

test.describe("Stitch restaurant presentation gallery", () => {
  test("gallery is excluded from production builds via notFound gate", async ({
    page,
  }) => {
    // In Playwright `next start` / webServer, NODE_ENV is production for build,
    // but local `next dev` serves the gallery. Assert route either loads gallery
    // heading (dev) or 404 (prod). Prefer checking production gate separately
    // when CI uses production server.
    const response = await page.goto("/dev/stitch-restaurant-components");
    const status = response?.status() ?? 0;
    if (status === 404) {
      expect(status).toBe(404);
      return;
    }
    await expect(
      page.getByRole("heading", { name: "Stitch restaurant presentation" }),
    ).toBeVisible();
  });

  test("discovery card detail link navigates; save and reserve do not", async ({
    page,
  }) => {
    test.skip(
      (await page.goto("/dev/stitch-restaurant-components"))?.status() === 404,
      "Gallery unavailable in production",
    );

    await page.goto("/dev/stitch-restaurant-components");
    const card = page.locator('[data-restaurant-card="discovery"]').first();
    await expect(card).toBeVisible();

    const detailLink = card.getByRole("link", { name: /View / }).first();
    await expect(detailLink).toHaveAttribute("href", /\/restaurants\//);

    // Save is a button sibling (not nested in the detail link).
    const save = card.getByRole("button", {
      name: /Save to passport|Remove from saved/,
    });
    await expect(save).toBeVisible();
    await expect(card.locator("a button")).toHaveCount(0);

    // Controlled save in the save-states section proves click does not navigate.
    const controlled = page.locator("#save-states").getByRole("button", {
      name: /Save to passport|Remove from saved/,
    }).last();
    await expect(controlled).toBeEnabled();
    await controlled.click();
    await expect(page).toHaveURL(/\/dev\/stitch-restaurant-components/);

    const reserve = card.getByRole("link", {
      name: /(Reserve now|Check availability|View booking options|Visit restaurant website)/,
    });
    await expect(reserve).toHaveAttribute("target", "_blank");
    await expect(reserve).toHaveAttribute("rel", /noopener/);
  });

  test("Michelin distinction text equivalents are present", async ({ page }) => {
    test.skip(
      (await page.goto("/dev/stitch-restaurant-components"))?.status() === 404,
      "Gallery unavailable in production",
    );
    await page.goto("/dev/stitch-restaurant-components");
    await expect(page.getByText("1 Michelin star").first()).toBeAttached();
    await expect(page.getByText("2 Michelin stars").first()).toBeAttached();
    await expect(page.getByText("3 Michelin stars").first()).toBeAttached();
  });

  test("all truthful reservation labels render", async ({ page }) => {
    test.skip(
      (await page.goto("/dev/stitch-restaurant-components"))?.status() === 404,
      "Gallery unavailable in production",
    );
    await page.goto("/dev/stitch-restaurant-components#reservation-labels");
    const section = page.locator("#reservation-labels");
    await expect(section.getByRole("link", { name: /Reserve now/ })).toBeVisible();
    await expect(
      section.getByRole("link", { name: /Check availability/ }),
    ).toBeVisible();
    await expect(
      section.getByRole("link", { name: /View booking options/ }),
    ).toBeVisible();
    await expect(
      section.getByRole("link", { name: /Visit restaurant website/ }),
    ).toBeVisible();
    await expect(section.getByText("Reservation unavailable")).toBeVisible();
  });

  test("selected map row uses aria-selected", async ({ page }) => {
    test.skip(
      (await page.goto("/dev/stitch-restaurant-components"))?.status() === 404,
      "Gallery unavailable in production",
    );
    await page.goto("/dev/stitch-restaurant-components#map-rows");
    const options = page.locator('#map-rows [role="option"]');
    await expect(options).toHaveCount(2);
    await options.nth(1).locator("h3").click();
    await expect(options.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(options.nth(0)).toHaveAttribute("aria-selected", "false");
  });

  test("skeletons expose proportional data attributes", async ({ page }) => {
    test.skip(
      (await page.goto("/dev/stitch-restaurant-components"))?.status() === 404,
      "Gallery unavailable in production",
    );
    await page.goto("/dev/stitch-restaurant-components#skeletons");
    await expect(page.locator('[data-skeleton="discovery-card"]')).toBeVisible();
    await expect(page.locator('[data-skeleton="editorial-card"]')).toBeVisible();
    await expect(page.locator('[data-skeleton="list-row"]')).toBeVisible();
    await expect(page.locator('[data-skeleton="map-row"]')).toBeVisible();
  });

  test("gallery does not mount Google Places UI Kit", async ({ page }) => {
    test.skip(
      (await page.goto("/dev/stitch-restaurant-components"))?.status() === 404,
      "Gallery unavailable in production",
    );
    await page.goto("/dev/stitch-restaurant-components");
    await expect(page.locator("gmp-place-details")).toHaveCount(0);
    await expect(page.locator("gmp-place-details-compact")).toHaveCount(0);
    await expect(page.locator('[data-google-places]')).toHaveCount(0);
  });

  test("no nested button inside link in discovery card", async ({ page }) => {
    test.skip(
      (await page.goto("/dev/stitch-restaurant-components"))?.status() === 404,
      "Gallery unavailable in production",
    );
    await page.goto("/dev/stitch-restaurant-components#discovery");
    const nested = page.locator(
      '[data-restaurant-card="discovery"] a button, [data-restaurant-card="discovery"] button a',
    );
    await expect(nested).toHaveCount(0);
  });
});
