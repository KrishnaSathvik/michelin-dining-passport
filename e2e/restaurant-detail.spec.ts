import { expect, test } from "@playwright/test";

test.describe("Phase 7 restaurant detail", () => {
  test("known restaurant renders Stitch identity hero", async ({ page }) => {
    await page.goto("/restaurants/benu-san-francisco-ca");
    await expect(page.getByRole("heading", { level: 1, name: "Benu" })).toBeVisible();
    await expect(page.locator('[data-restaurant-detail="stitch"]')).toBeVisible();
    await expect(page.locator('[data-restaurant-hero="identity"]')).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    await expect(page.getByText("Your Journey")).toBeVisible();
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

  test("one H1 and Google section present", async ({ page }) => {
    await page.goto("/restaurants/benu-san-francisco-ca");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole("heading", {
        name: /Photos and live place information from Google/i,
      }),
    ).toBeVisible();
  });

  test("truthful reservation action and journey controls", async ({ page }) => {
    await page.goto("/restaurants/benu-san-francisco-ca");
    await expect(
      page.getByRole("link", {
        name: /Reserve now|Check availability|View booking options|Visit restaurant website/i,
      }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Save/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Want to visit/i }),
    ).toBeVisible();
  });

  test("planning dialog opens and cancel does not require save", async ({
    page,
  }) => {
    await page.goto("/restaurants/benu-san-francisco-ca");
    await page.getByRole("button", { name: /Add planning details|Edit plan/i }).click();
    const dialog = page.getByRole("dialog", { name: "Plan your visit" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toHaveCount(0);
  });

  test("visit dialog opens", async ({ page }) => {
    await page.goto("/restaurants/benu-san-francisco-ca");
    await page.getByRole("button", { name: /Record visit|Edit visit/i }).click();
    const dialog = page.getByRole("dialog", { name: "Record your visit" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toHaveCount(0);
  });

  test("related and nearby exclude current restaurant Google mounts", async ({
    page,
  }) => {
    await page.goto("/restaurants/benu-san-francisco-ca", {
      waitUntil: "networkidle",
    });
    await expect(page.locator("[data-restaurant-detail='stitch']")).toHaveCount(1);
    await expect(page.locator("[data-related-section]").first()).toBeVisible();
    await expect(page.locator("[data-nearby-section]").first()).toBeVisible();
    await expect(
      page.locator("[data-related-section] [data-google-places-section]"),
    ).toHaveCount(0);
    await expect(
      page.locator("[data-nearby-section] [data-google-places-section]"),
    ).toHaveCount(0);
    await expect(
      page.locator("[data-google-places-section='detail']"),
    ).toHaveCount(1);
  });

  test("mobile sticky action bar appears at 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/restaurants/benu-san-francisco-ca", {
      waitUntil: "networkidle",
    });
    const sticky = page.locator("[data-restaurant-sticky-bar]").first();
    await expect(sticky).toBeVisible();
  });

  test("no horizontal overflow at 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/restaurants/benu-san-francisco-ca");
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 1;
    });
    expect(overflow).toBe(false);
  });
});
