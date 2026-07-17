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

    // Card title still navigates to detail when clicked.
    await card.getByRole("link", { name: "Addison", exact: true }).click();
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
    await page.goto("/map?state=california");
    await page
      .getByRole("button", { name: "Show list" })
      .or(page.getByRole("button", { name: "Show map" }))
      .first()
      .click();
    const mobileResult = page
      .getByRole("list", { name: "Map restaurant results" })
      .getByRole("button")
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

  test("Planned passport restaurant shows reservation action", async ({ page }) => {
    await page.goto("/restaurants/benu-san-francisco-ca");
    await page.getByRole("button", { name: "Planned" }).click();
    await page.goto("/passport");
    await expect(page.getByRole("heading", { name: "Planned reservations" })).toBeVisible();
    const planned = page.locator("article").filter({ hasText: "Benu" }).first();
    await expect(planned).toBeVisible();
    await expect(
      planned.getByRole("link", {
        name: /Check availability|Reserve now|View booking options|Visit restaurant website/i,
      }),
    ).toBeVisible();
  });
});
