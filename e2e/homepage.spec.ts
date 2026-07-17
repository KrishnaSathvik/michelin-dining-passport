import { test, expect } from "@playwright/test";

test.describe("Stitch homepage explore_feed", () => {
  test("shows Dining Passport branding and one H1", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Dining Passport" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Michelin-starred|America/,
    );
  });

  test("renders live catalog totals", async ({ page }) => {
    await page.goto("/");
    const stats = page.locator('[data-homepage-section="stats"]');
    await expect(stats.getByText("271", { exact: true })).toBeVisible();
    await expect(stats.getByText("216", { exact: true })).toBeVisible();
    await expect(stats.getByText("39", { exact: true })).toBeVisible();
    await expect(stats.getByText("16", { exact: true })).toBeVisible();
    await expect(stats.getByText("one Michelin star restaurants")).toBeAttached();
    await expect(stats.getByText("two Michelin star restaurants")).toBeAttached();
    await expect(stats.getByText("three Michelin star restaurants")).toBeAttached();
  });

  test("featured cards use configured restaurants and link to detail", async ({
    page,
  }) => {
    await page.goto("/");
    const featured = page.locator('[data-homepage-section="featured"]');
    await expect(featured.getByRole("heading", { level: 2 })).toContainText(
      /Featured/,
    );
    const cards = featured.locator('[data-restaurant-card="discovery"]');
    await expect(cards).toHaveCount(3);
    const detail = cards.first().getByRole("link", { name: /View / }).first();
    await expect(detail).toHaveAttribute("href", /\/restaurants\//);
  });

  test("View All goes to explore; header search still works", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .locator('[data-homepage-section="featured"]')
      .getByRole("link", { name: /View All/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/explore/);

    await page.goto("/");
    await page
      .getByRole("banner")
      .getByRole("link", { name: "Search restaurants" })
      .click();
    await expect(page).toHaveURL(/\/explore/);
  });

  test("reservation CTAs are external and truthful", async ({ page }) => {
    await page.goto("/");
    const reserve = page
      .locator('[data-homepage-section="featured"]')
      .getByRole("link", {
        name: /(Reserve now|Check availability|View booking options|Visit restaurant website)/,
      })
      .first();
    await expect(reserve).toHaveAttribute("target", "_blank");
    await expect(reserve).toHaveAttribute("rel", /noopener/);
  });

  test("no Google UI Kit or old homepage modules", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("gmp-place-details")).toHaveCount(0);
    await expect(page.locator("gmp-place-details-compact")).toHaveCount(0);
    await expect(page.getByText(/Browse by state/i)).toHaveCount(0);
    await expect(page.getByText(/Browse by cuisine/i)).toHaveCount(0);
    await expect(page.getByText(/Passport preview|Your passport/i)).toHaveCount(0);
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
  });

  test("mobile has no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  });
});
