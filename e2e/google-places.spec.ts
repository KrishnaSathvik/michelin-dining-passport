/**
 * Playwright smoke for Google Places enrichment surfaces (mocked / flag-off).
 * Does not require a live Google key.
 */
import { expect, test } from "@playwright/test";

test.describe("google places enrichment (flag off)", () => {
  test("restaurant detail shows Google section fallback", async ({ page }) => {
    await page.goto("/restaurants/alinea-chicago-il");
    await page.locator("#google-places-heading").scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: /Photos and live place information from Google/i })).toBeVisible();
    await expect(
      page.getByText("Live Google place information is currently unavailable."),
    ).toBeVisible();
  });

  test("map selected panel mounts compact google slot only after selection", async ({
    page,
  }) => {
    await page.goto("/map");
    await expect(page.getByText("Live place information from Google")).toHaveCount(0);
    await page.goto("/map?selected=alinea-chicago-il");
    await expect(page.getByText("Live place information from Google")).toBeVisible();
  });

  test("obsolete Google spike route is removed", async ({ page }) => {
    const response = await page.goto("/dev/google-places-spike");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "This table could not be found.",
      }),
    ).toBeVisible();
  });
});
