import { test, expect } from "@playwright/test";

test.describe("Stitch application shell", () => {
  test("wordmark links home and desktop nav routes are correct", async ({
    page,
  }) => {
    await page.goto("/explore");
    const banner = page.getByRole("banner");
    await expect(banner.getByRole("link", { name: "Dining Passport" })).toHaveAttribute(
      "href",
      "/",
    );

    const nav = banner.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Explore" })).toHaveAttribute(
      "href",
      "/explore",
    );
    await expect(nav.getByRole("link", { name: "Map" })).toHaveAttribute(
      "href",
      "/map",
    );
    await expect(
      nav.getByRole("link", { name: "Michelin Stars" }),
    ).toHaveAttribute("href", "/about-michelin-stars");
    await expect(nav.getByRole("link", { name: "Passport" })).toHaveAttribute(
      "href",
      "/passport",
    );
  });

  test("active route sets aria-current on Explore", async ({ page }) => {
    await page.goto("/explore");
    await expect(
      page
        .getByRole("banner")
        .getByRole("navigation", { name: "Primary" })
        .getByRole("link", { name: "Explore" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("signed-out header shows Sign in", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Sign in" }),
    ).toBeVisible();
  });

  test("search affordance goes to explore", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("banner")
      .getByRole("link", { name: "Search restaurants" })
      .click();
    await expect(page).toHaveURL(/\/explore/);
  });

  test("mobile menu opens, Escape closes, focus returns", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Open menu" });
    await trigger.click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Menu" })).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("map has no footer; home has one footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("contentinfo")).toHaveCount(1);

    await page.goto("/map");
    await expect(page.getByRole("contentinfo")).toHaveCount(0);
    await expect(page.getByRole("banner")).toBeVisible();

    await page.goto("/explore");
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
  });

  test("auth routes do not render duplicate chrome", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/login");
    await expect(page.getByRole("banner")).toHaveCount(0);
    await expect(page.getByRole("contentinfo")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
  });

  test("skip link targets main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });

  test("foundation route is excluded from production", async ({ page }) => {
    const response = await page.goto("/dev/stitch-foundation");
    if (!process.env.CI && response?.status() === 200) {
      test.skip(true, "Running against next dev — production gate checked in CI");
    }
    expect(response?.status()).toBe(404);
  });

  test("restaurant components gallery is excluded from production", async ({
    page,
  }) => {
    const response = await page.goto("/dev/stitch-restaurant-components");
    if (!process.env.CI && response?.status() === 200) {
      test.skip(true, "Running against next dev — production gate checked in CI");
    }
    expect(response?.status()).toBe(404);
  });

  test("account preview is excluded from production", async ({ page }) => {
    const response = await page.goto("/dev/stitch-account-preview");
    if (!process.env.CI && response?.status() === 200) {
      test.skip(true, "Running against next dev — production gate checked in CI");
    }
    expect(response?.status()).toBe(404);
  });
});
