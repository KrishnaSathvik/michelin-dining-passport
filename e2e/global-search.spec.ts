import { expect, test } from "@playwright/test";

const DIALOG = { name: "Search restaurants" };

async function openSearch(page: import("@playwright/test").Page) {
  await page
    .getByRole("banner")
    .getByRole("link", { name: "Search restaurants" })
    .click();
  const dialog = page.getByRole("dialog", DIALOG);
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe("global search", () => {
  test("opens focused with a prompt and no results yet", async ({ page }) => {
    await page.goto("/");
    const dialog = await openSearch(page);
    await expect(
      dialog.getByPlaceholder("Restaurants, cities, states, cuisines"),
    ).toBeFocused();
    await expect(
      dialog.getByText("Search by restaurant, city, state, or cuisine."),
    ).toBeVisible();
  });

  test("Cmd/Ctrl+K and / open search", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("ControlOrMeta+k");
    await expect(page.getByRole("dialog", DIALOG)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", DIALOG)).toHaveCount(0);

    await page.keyboard.press("/");
    await expect(page.getByRole("dialog", DIALOG)).toBeVisible();
  });

  test("matches a restaurant by name and navigates to it", async ({ page }) => {
    await page.goto("/");
    const dialog = await openSearch(page);
    await dialog
      .getByPlaceholder("Restaurants, cities, states, cuisines")
      .fill("Alinea");

    const option = dialog.getByRole("option", { name: /Alinea/ }).first();
    await expect(option).toBeVisible();
    await option.click();
    await expect(page).toHaveURL(/\/restaurants\/alinea-chicago-il/);
  });

  test("matches a city and jumps to the Explore filter", async ({ page }) => {
    await page.goto("/");
    const dialog = await openSearch(page);
    await dialog
      .getByPlaceholder("Restaurants, cities, states, cuisines")
      .fill("Chicago");

    const cityOption = dialog
      .getByRole("option")
      .filter({ hasText: "City" })
      .first();
    await expect(cityOption).toBeVisible();
    await cityOption.click();
    await expect(page).toHaveURL(/\/explore\?city=/);
  });

  test("keyboard arrow selection and Enter open a result", async ({ page }) => {
    await page.goto("/");
    const dialog = await openSearch(page);
    const input = dialog.getByPlaceholder(
      "Restaurants, cities, states, cuisines",
    );
    await input.fill("Alinea");
    await expect(dialog.getByRole("option").first()).toBeVisible();

    await input.press("ArrowDown");
    await expect(dialog.getByRole("option").first()).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await input.press("Enter");
    await expect(page).toHaveURL(/\/restaurants\//);
  });

  test("Enter without a selection opens full Explore results", async ({
    page,
  }) => {
    await page.goto("/");
    const dialog = await openSearch(page);
    await dialog
      .getByPlaceholder("Restaurants, cities, states, cuisines")
      .fill("sushi");
    await expect(dialog.getByRole("option").first()).toBeVisible();
    await dialog
      .getByPlaceholder("Restaurants, cities, states, cuisines")
      .press("Enter");
    await expect(page).toHaveURL(/\/explore\?q=sushi/);
  });

  test("see-all link carries the query into Explore", async ({ page }) => {
    await page.goto("/");
    const dialog = await openSearch(page);
    await dialog
      .getByPlaceholder("Restaurants, cities, states, cuisines")
      .fill("Chicago");
    await expect(dialog.getByRole("option").first()).toBeVisible();
    await dialog.locator("[data-global-search-see-all]").click();
    await expect(page).toHaveURL(/\/explore\?q=Chicago/);
  });

  test("clear resets the query and results", async ({ page }) => {
    await page.goto("/");
    const dialog = await openSearch(page);
    const input = dialog.getByPlaceholder(
      "Restaurants, cities, states, cuisines",
    );
    await input.fill("Alinea");
    await expect(dialog.getByRole("option").first()).toBeVisible();

    await dialog.getByRole("button", { name: "Clear" }).click();
    await expect(input).toHaveValue("");
    await expect(dialog.getByRole("option")).toHaveCount(0);
    await expect(
      dialog.getByText("Search by restaurant, city, state, or cuisine."),
    ).toBeVisible();
  });

  test("unmatched query reports an empty state", async ({ page }) => {
    await page.goto("/");
    const dialog = await openSearch(page);
    await dialog
      .getByPlaceholder("Restaurants, cities, states, cuisines")
      .fill("zzzzqqqxx");
    await expect(dialog.getByText(/No matches for/)).toBeVisible();
  });

  test("Escape closes and returns focus to the trigger", async ({ page }) => {
    await page.goto("/");
    const trigger = page
      .getByRole("banner")
      .getByRole("link", { name: "Search restaurants" });
    await trigger.click();
    await expect(page.getByRole("dialog", DIALOG)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", DIALOG)).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("api returns a bounded preview", async ({ request }) => {
    const response = await request.get("/api/search?q=chicago");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.restaurants.length).toBeLessThanOrEqual(6);
    expect(body.refinements.length).toBeLessThanOrEqual(4);
    expect(body.totalRestaurants).toBeGreaterThan(0);
    expect(body.exploreHref).toContain("/explore?q=");
  });

  test("api rejects a too-short query without searching", async ({
    request,
  }) => {
    const response = await request.get("/api/search?q=a");
    const body = await response.json();
    expect(body.tooShort).toBe(true);
    expect(body.restaurants).toEqual([]);
    expect(body.totalRestaurants).toBe(0);
  });

  test("mobile search dialog fits the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const dialog = await openSearch(page);
    await dialog
      .getByPlaceholder("Restaurants, cities, states, cuisines")
      .fill("Chicago");
    await expect(dialog.getByRole("option").first()).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBeFalsy();
  });
});
