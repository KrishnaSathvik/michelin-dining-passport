import { expect, test } from "@playwright/test";

test.describe("Phase 5.5 reservation actions", () => {
  test("Explore reserve click stays on page and opens external destination", async ({
    page,
  }) => {
    const external: string[] = [];
    await page.route("https://**", async (route) => {
      const url = route.request().url();
      if (url.includes("localhost") || url.includes("127.0.0.1")) {
        await route.continue();
        return;
      }
      external.push(url);
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<html><body>mocked external</body></html>",
      });
    });

    await page.goto("/explore?view=grid");
    const card = page.locator("article").filter({ hasText: "Addison" }).first();
    await expect(card).toBeVisible();

    const reserve = card.getByRole("link", {
      name: /Reserve now/i,
    });
    await expect(reserve).toBeVisible();
    await expect(reserve).toHaveAttribute(
      "href",
      "https://www.addisondelmar.com/reservations/",
    );
    await expect(reserve).toHaveAttribute("target", "_blank");
    await expect(reserve).toHaveAttribute("rel", /noopener/);

    const before = page.url();
    await reserve.click();
    await expect(page).toHaveURL(before);

    // Card title / media still navigates to detail when clicked.
    await card.getByRole("link", { name: "View Addison" }).click();
    await expect(page).toHaveURL(/\/restaurants\/addison-san-diego-ca/);
  });

  test("Restaurant without verified booking shows truthful fallback", async ({
    page,
  }) => {
    // Pick a restaurant that still uses website/Michelin fallback.
    await page.goto("/explore?q=harbor+house&view=list");
    const row = page.locator("article").filter({ hasText: "Harbor House" }).first();
    await expect(row).toBeVisible();
    const action = row.getByRole("link", {
      name: /Check availability|View booking options|Visit restaurant website/i,
    });
    await expect(action).toBeVisible();
    await expect(action).not.toContainText("Reserve now");
    await expect(action).toHaveAttribute("target", "_blank");
  });

  test("Mobile map preview exposes reservation action", async ({ page }) => {
    await page.route("**/demotiles.maplibre.org/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          version: 8,
          name: "mock",
          sources: {},
          layers: [
            {
              id: "background",
              type: "background",
              paint: { "background-color": "#f5f1e8" },
            },
          ],
        }),
      });
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/map?state=california&panel=list");
    const mobileResult = page
      .getByRole("listbox", { name: "Map restaurant results" })
      .getByRole("option")
      .first();
    await expect(mobileResult).toBeVisible();
    await mobileResult.click();
    const sheet = page.getByRole("dialog", { name: "Selected restaurant preview" });
    await expect(sheet).toBeVisible();
    await expect(
      sheet.getByRole("link", {
        name: /Check availability|Reserve now|View booking options|Visit restaurant website/i,
      }),
    ).toBeVisible();
  });

  test("Plan a visit records a plan that appears on the planned list", async ({
    page,
  }) => {
    await page.goto("/restaurants/benu-san-francisco-ca");
    // "Plan a visit" opens the plan dialog; saving it puts the restaurant on /planned.
    await page.getByRole("button", { name: "Plan a visit" }).click();
    const planDialog = page.getByRole("dialog", { name: "Plan a visit" });
    await expect(planDialog).toBeVisible();
    // A plan requires a date of today or later.
    const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    await planDialog.getByLabel("Planned date").fill(future);
    await planDialog.getByRole("button", { name: "Save plan" }).click();
    await expect(planDialog).toHaveCount(0);

    await page.goto("/planned");
    await expect(
      page.getByRole("heading", { level: 1, name: "Planned meals" }),
    ).toBeVisible();
    // The Stage-10 planned card links back to the restaurant, where the
    // reservation action lives; the card itself does not ship the catalog.
    const planned = page.locator("article").filter({ hasText: "Benu" }).first();
    await expect(planned).toBeVisible();
    await expect(
      planned.getByRole("link", { name: "Open restaurant" }),
    ).toHaveAttribute("href", "/restaurants/benu-san-francisco-ca");
  });
});
