import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
}

/**
 * Navigate to an Explore URL and wait for the streamed composition to settle.
 *
 * The App Router streams the resolved directory inside a hidden Suspense buffer
 * that a client script reveals on load. Until that swap completes, strict-mode
 * locators transiently match both the live directory and its hidden twin
 * (the `#S:0` buffer). Waiting on these two counts is a deterministic settle
 * signal — no arbitrary timeouts — so assertions see a single, stable page.
 */
async function gotoExplore(page: Page, url: string) {
  await page.goto(url);
  await expect(page.locator('[data-explore="loading"]')).toHaveCount(0);
  await expect(page.locator('[data-explore="stitch-directory"]')).toHaveCount(1);
}

test.describe("Phase 5 Explore Stitch rebuild", () => {
  test("default Explore loads Stitch composition with one H1", async ({
    page,
  }) => {
    await gotoExplore(page, "/explore");
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
    await gotoExplore(page, "/explore?stars=1");
    await expect(page.locator("[data-explore-result-count]")).toContainText(
      /restaurant/,
    );
    await gotoExplore(page, "/explore?stars=2");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await gotoExplore(page, "/explore?stars=3");
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
    await gotoExplore(page, "/explore?stars=2&state=california");
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
    await gotoExplore(page, "/explore?stars=9&sort=popularity&view=map&page=0");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator('[data-explore-results="grid"]')).toBeVisible();
  });

  test("empty result state", async ({ page }) => {
    await gotoExplore(page, "/explore?q=zzzz-no-such-restaurant-xyz");
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
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explore");
    const trigger = page.getByRole("button", { name: /^Filters/ });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Filters" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Sort")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("mobile drawer is full-width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explore");
    await page.getByRole("button", { name: /^Filters/ }).click();
    const dialog = page.getByRole("dialog", { name: "Filters" });
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThan(350);
  });

  test("desktop keeps inline quick filters instead of the drawer trigger", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/explore");
    await expect(page.getByRole("button", { name: /^Filters/ })).toHaveCount(0);
    await expect(page.getByRole("group", { name: "Quick filters" })).toBeVisible();
    await expect(page.locator("#quick-stars")).toBeVisible();
    await expect(page.locator("#explore-sort")).toBeVisible();
    await expect(page.getByRole("group", { name: "Result view" })).toBeVisible();
  });

  test("mobile control row keeps Filters, Sort, and view together", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explore");
    const toolbar = page.locator("[data-explore-toolbar]");
    await expect(
      toolbar.getByRole("button", { name: /^Filters/ }),
    ).toBeVisible();
    await expect(toolbar.locator("#explore-sort")).toBeVisible();
    await expect(
      toolbar.getByRole("group", { name: "Result view" }),
    ).toBeVisible();
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
    await expect(
      card.locator('[data-restaurant-action="view-detail"]'),
    ).toHaveText("View details");

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
      card.locator('[data-restaurant-action="view-detail"]').click(),
    ]);
  });

  test("sticky filters stay compact and pinned under the header", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoExplore(page, "/explore");
    const toolbar = page.locator("[data-explore-toolbar]");
    await expect(toolbar).toBeVisible();

    const atTopHeight = await toolbar.evaluate(
      (el) => el.getBoundingClientRect().height,
    );
    expect(atTopHeight).toBeLessThanOrEqual(132);

    // Scroll past the intro until the toolbar sticks under the shared header.
    await page.evaluate(() => {
      const toolbarEl = document.querySelector("[data-explore-toolbar]");
      if (!toolbarEl) return;
      const target =
        window.scrollY + toolbarEl.getBoundingClientRect().top - 72 + 40;
      window.scrollTo(0, Math.max(0, target));
    });
    await expect
      .poll(async () =>
        toolbar.evaluate((el) => Math.round(el.getBoundingClientRect().top)),
      )
      .toBe(72);

    const metrics = await page.evaluate(() => {
      const toolbarEl = document.querySelector("[data-explore-toolbar]");
      if (!toolbarEl) return null;
      const tb = toolbarEl.getBoundingClientRect();
      return {
        toolbarTop: Math.round(tb.top),
        toolbarHeight: Math.round(tb.height),
        visibleBelowToolbar: Math.round(window.innerHeight - tb.bottom),
      };
    });
    expect(metrics).not.toBeNull();
    expect(metrics!.toolbarHeight).toBeLessThanOrEqual(132);
    // Leave most of the viewport for restaurant cards while filters stay visible.
    expect(metrics!.visibleBelowToolbar).toBeGreaterThanOrEqual(500);
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
    const allFilters = page.getByRole("button", { name: /^Filters/ });
    const filtersBox = await allFilters.boundingBox();
    expect(filtersBox!.height).toBeGreaterThanOrEqual(44);
  });
});
