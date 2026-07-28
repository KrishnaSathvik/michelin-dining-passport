import { test, expect } from "@playwright/test";

async function expectNotFound(
  page: import("@playwright/test").Page,
  response: import("@playwright/test").Response | null,
) {
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle(/not found/i);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "This table could not be found.",
    }),
  ).toBeVisible();
}

test.describe("Phase 11 taxonomy routes", () => {
  test("valid state route renders with glance metrics", async ({ page }) => {
    await page.goto("/usa/california");
    await expect(
      page.getByRole("heading", { level: 1, name: "California" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /California at a Glance/i }),
    ).toBeVisible();
    await expect(page.locator("text=Bib Gourmand").first()).toBeVisible();
    await expect(page.getByText(/Tokyo|Kyoto|Paris/)).toHaveCount(0);
    await expect(page.locator("gmp-place-details")).toHaveCount(0);
  });

  test("invalid state route fails safely", async ({ page }) => {
    const response = await page.goto("/usa/not-a-real-state-zzz");
    await expectNotFound(page, response);
    await expect(
      page.getByRole("heading", { level: 1, name: "California" }),
    ).toHaveCount(0);
  });

  test("valid city route renders distinction bento", async ({ page }) => {
    await page.goto("/cities/new-york");
    await expect(
      page.getByRole("heading", { level: 1, name: /New York/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Culinary Distinction" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Dominant Cuisines" }),
    ).toBeVisible();
  });

  test("invalid city route fails safely", async ({ page }) => {
    const response = await page.goto("/cities/not-a-real-city-zzz");
    await expectNotFound(page, response);
  });

  test("cuisine hubs are U.S. only and omit global cities", async ({
    page,
  }) => {
    await page.goto("/cuisines/japanese");
    await expect(
      page.getByRole("heading", { level: 1, name: /Japanese/i }),
    ).toBeVisible();
    const hubs = page.locator('[data-taxonomy-section="us-hubs"]');
    if ((await hubs.count()) > 0) {
      await expect(hubs.getByText(/Tokyo|Kyoto|Paris|London/i)).toHaveCount(0);
    }
    await expect(page.locator("gmp-place-details")).toHaveCount(0);
  });

  test("invalid cuisine route fails safely", async ({ page }) => {
    const response = await page.goto("/cuisines/not-a-real-cuisine-zzz");
    await expectNotFound(page, response);
  });

  test("star routes render and invalid fails", async ({ page }) => {
    for (const stars of [1, 2, 3]) {
      await page.goto(`/stars/${stars}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Other distinctions" }),
      ).toBeVisible();
    }
    const response = await page.goto("/stars/4");
    await expectNotFound(page, response);
  });
});
