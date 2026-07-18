import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
}

test.describe("Phase 5 Explore Stitch rebuild", () => {
  test("default Explore loads Stitch composition with one H1", async ({
    page,
  }) => {
    await page.goto("/explore");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Explore Michelin-starred restaurants",
    );
    await expect(page.locator('[data-explore="stitch-directory"]')).toBeVisible();
    await expect(page.locator('[data-explore-results="grid"]')).toBeVisible();
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    // No permanent left filter sidebar
    await expect(page.locator("aside[aria-label*='ilter']")).toHaveCount(0);
  });

  test("search query updates URL and preserves filters", async ({ page }) => {
    await page.goto("/explore?stars=3&state=california");
    await page.getByRole("search").getByRole("searchbox").fill("benu");
    await page.getByRole("search").getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/q=benu/);
    await expect(page).toHaveURL(/stars=3/);
    await expect(page).toHaveURL(/state=california/);
    await expect(page).not.toHaveURL(/page=/);
  });

  test("star / state / cuisine / price filters work via URL", async ({
    page,
  }) => {
    await page.goto("/explore?stars=1");
    await expect(page.locator("[data-explore-result-count]")).toContainText(
      /restaurant/,
    );
    await page.goto("/explore?stars=2");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/explore?stars=3");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/explore?state=new-york");
    await expect(page).toHaveURL(/state=new-york/);
    await page.goto("/explore?cuisine=japanese");
    await expect(page).toHaveURL(/cuisine=japanese/);
    await page.goto("/explore?price=%24%24%24%24");
    await expect(page).toHaveURL(/price=/);
  });

  test("multiple filters, active chip removal, and clear all", async ({
    page,
  }) => {
    await page.goto("/explore?stars=3&state=california&cuisine=contemporary");
    await expect(page.locator('[data-explore="loading"]')).toHaveCount(0);
    const active = () =>
      page
        .locator('[data-explore="stitch-directory"]')
        .getByLabel("Active filters");
    await expect(active().getByRole("link").first()).toBeVisible();
    await active()
      .getByRole("link")
      .filter({ hasText: "3 Michelin Stars" })
      .click();
    await expect(page).not.toHaveURL(/stars=/);
    await expect(page).toHaveURL(/state=california/);
    await expect(page.locator('[data-explore="loading"]')).toHaveCount(0);
    // "Clear all" sits beside the chip row, not inside the Active filters label.
    await page
      .locator('[data-explore="stitch-directory"]')
      .getByRole("link", { name: "Clear all", exact: true })
      .click();
    await expect(page).toHaveURL(/\/explore(\?view=|\/?$|\?sort=)/);
    await expect(page).not.toHaveURL(/stars=/);
    await expect(page).not.toHaveURL(/state=/);
  });

  test("sort and view toggle preserve filters", async ({ page }) => {
    await page.goto("/explore?stars=2&state=california");
    await page.locator("#explore-sort").selectOption("name-asc");
    await expect(page).toHaveURL(/sort=name-asc/);
    await expect(page).toHaveURL(/stars=2/);
    await expect(page).toHaveURL(/state=california/);

    await page.getByRole("link", { name: "List view" }).click();
    await expect(page).toHaveURL(/view=list/);
    await expect(page).toHaveURL(/stars=2/);
    await expect(page.locator('[data-explore-results="list"]')).toBeVisible();

    await page.getByRole("link", { name: "Grid view" }).click();
    await expect(page).toHaveURL(/view=grid|\/explore\?/);
    await expect(page.locator('[data-explore-results="grid"]')).toBeVisible();
  });

  test("pagination preserves filters", async ({ page }) => {
    await page.goto("/explore?sort=name-asc");
    const next = page.getByRole("link", { name: "Next page" });
    await expect(next).toBeVisible();
    await next.click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page).toHaveURL(/sort=name-asc/);
  });

  test("browser back restores explore state", async ({ page }) => {
    await page.goto("/explore");
    await page.goto("/explore?stars=3");
    await page.goto("/explore?stars=3&view=list");
    await page.goBack();
    await expect(page).toHaveURL(/stars=3/);
    await expect(page).not.toHaveURL(/view=list/);
  });

  test("invalid query values fail gracefully", async ({ page }) => {
    await page.goto("/explore?stars=9&sort=popularity&view=map&page=0");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator('[data-explore-results="grid"]')).toBeVisible();
  });

  test("empty result state", async ({ page }) => {
    await page.goto("/explore?q=zzzz-no-such-restaurant-xyz");
    // Wait for Suspense loading shell to swap out (streamed HTML keeps a hidden twin).
    await expect(page.locator('[data-explore="loading"]')).toHaveCount(0);
    await expect(
      page.locator('[data-explore="stitch-directory"] [data-explore-empty]'),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "No restaurants match these filters" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Clear all filters" }),
    ).toBeVisible();
  });

  test("filter drawer opens, Escape closes, focus returns", async ({
    page,
  }) => {
    await page.goto("/explore");
    const trigger = page.getByRole("button", { name: /All Filters/i });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "All filters" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("mobile drawer is full-width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explore");
    await page.getByRole("button", { name: /All Filters/i }).click();
    const dialog = page.getByRole("dialog", { name: "All filters" });
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThan(350);
  });

  test("discovery card opens detail; Save and reservation stay put", async ({
    page,
  }) => {
    await page.goto("/explore?view=grid");
    await expect(page.locator('[data-explore="loading"]')).toHaveCount(0);
    const card = page
      .locator('[data-explore="stitch-directory"] article')
      .filter({ hasText: "Addison" })
      .first();
    await expect(card).toBeVisible();

    const reserve = card.getByRole("link", { name: /Reserve now/i });
    await expect(reserve).toHaveAttribute("target", "_blank");
    const before = page.url();
    await reserve.click({ modifiers: [] });
    await expect(page).toHaveURL(before);

    const save = card
      .getByRole("button", { name: /Save to passport|Remove from saved/i })
      .first();
    await save.click();
    await expect(page).toHaveURL(before);

    await Promise.all([
      page.waitForURL(/\/restaurants\/addison-san-diego-ca/),
      card.getByRole("link", { name: "View Addison" }).click(),
    ]);
  });

  test("list view truthful reservation labels", async ({ page }) => {
    await page.goto("/explore?q=harbor+house&view=list");
    const row = page.locator("article").filter({ hasText: "Harbor House" }).first();
    await expect(row).toBeVisible();
    const action = row.getByRole("link", {
      name: /Check availability|View booking options|Visit restaurant website/i,
    });
    await expect(action).toBeVisible();
    await expect(action).not.toContainText("Reserve now");
  });

  test("no Google UI Kit and no ratings on Explore", async ({ page }) => {
    await page.goto("/explore");
    await expect(page.locator("gmp-place-details")).toHaveCount(0);
    await expect(page.locator("gmp-place-details-compact")).toHaveCount(0);
    await expect(page.getByText(/Google rating/i)).toHaveCount(0);
    await expect(page.getByText(/\b\d+\s+Google reviews?\b/i)).toHaveCount(0);
  });

  test("no horizontal overflow at key widths", async ({ page }) => {
    for (const width of [1440, 1280, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/explore");
      await expectNoHorizontalOverflow(page);
    }
  });

  test("touch targets are at least 44px on mobile controls", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explore");
    const searchBtn = page.getByRole("search").getByRole("button", {
      name: "Search",
    });
    const box = await searchBtn.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    const allFilters = page.getByRole("button", { name: /All Filters/i });
    const filtersBox = await allFilters.boundingBox();
    expect(filtersBox!.height).toBeGreaterThanOrEqual(44);
  });
});
