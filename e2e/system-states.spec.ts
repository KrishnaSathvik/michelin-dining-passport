import { test, expect, type Page, type Response } from "@playwright/test";

async function assertDiningPassport(page: Page) {
  await expect(page).toHaveTitle(/Dining Passport/i);
  await expect(page.getByText("Dining Passport").first()).toBeVisible();
}

async function expectHttpNotFound(response: Response | null) {
  expect(response, "navigation response missing").not.toBeNull();
  expect(response!.status()).toBe(404);
}

test.describe("Phase 12 system states", () => {
  test.beforeEach(async ({ page }) => {
    // Fail fast if Playwright lands on a foreign app.
    page.on("response", async (res) => {
      if (res.request().resourceType() !== "document") return;
      if (res.url().includes("127.0.0.1") || res.url().includes("localhost")) {
        // Identity is asserted per test after navigation.
      }
    });
  });

  test("global unknown path returns 404 UI", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist-phase12");
    await expectHttpNotFound(response);
    await assertDiningPassport(page);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "This table could not be found.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Explore restaurants" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Return home" })).toBeVisible();
  });

  test("invalid restaurant slug returns 404", async ({ page }) => {
    const response = await page.goto("/restaurants/not-a-real-slug-zzz");
    await expectHttpNotFound(response);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "This table could not be found.",
      }),
    ).toBeVisible();
  });

  test("invalid taxonomy slugs return 404", async ({ page }) => {
    for (const path of [
      "/usa/not-a-real-state-zzz",
      "/cities/not-a-real-city-zzz",
      "/cuisines/not-a-real-cuisine-zzz",
      "/stars/4",
    ]) {
      const response = await page.goto(path);
      await expectHttpNotFound(response);
      await expect(
        page.getByRole("heading", {
          level: 1,
          name: "This table could not be found.",
        }),
      ).toBeVisible();
    }
  });

  test("valid routes do not show not-found UI", async ({ page }) => {
    await page.goto("/");
    await assertDiningPassport(page);
    await expect(
      page.getByRole("heading", {
        name: "This table could not be found.",
      }),
    ).toHaveCount(0);

    await page.goto("/explore");
    await assertDiningPassport(page);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("not-found recovery links navigate", async ({ page }) => {
    await page.goto("/missing-phase12-path");
    await page.getByRole("link", { name: "Explore restaurants" }).click();
    await expect(page).toHaveURL(/\/explore/);
    await assertDiningPassport(page);
  });
});
