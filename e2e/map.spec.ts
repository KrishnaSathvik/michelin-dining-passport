import { expect, test } from "@playwright/test";

async function mockMapTiles(page: import("@playwright/test").Page) {
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
            paint: { "background-color": "#f5f6f4" },
          },
        ],
      }),
    });
  });
}

test.describe("Phase 6 map workspace", () => {
  test("desktop panel, filters, selection, area search, mobile sheet", async ({
    page,
  }) => {
    await mockMapTiles(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/map");

    await expect(page.getByRole("heading", { name: "Map" })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toHaveCount(0);

    const panel = page.locator("[data-map-results-panel]");
    await expect(panel).toBeVisible();
    const box = await panel.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThanOrEqual(400);
    expect(box!.width).toBeLessThanOrEqual(440);

    await page.getByLabel("State").selectOption("california");
    await expect(page.locator("[data-map-result-count]")).toContainText(
      /restaurant/,
    );

    const firstResult = page
      .getByRole("listbox", { name: "Map restaurant results" })
      .getByRole("option")
      .first();
    await expect(firstResult).toBeVisible();
    const selectedName = (
      await firstResult.locator("h3").textContent()
    )?.trim();
    await firstResult.click();

    await expect(page.getByRole("link", { name: "Details" }).first()).toBeVisible();
    if (selectedName) {
      await expect(page.getByText(selectedName).first()).toBeVisible();
    }

    await page.goto(
      "/map?state=california&bounds=-122.5000,37.7000,-122.3000,37.9000",
    );
    await expect(page.getByRole("button", { name: "Clear area" })).toBeVisible();
    await page.getByRole("button", { name: "Clear area" }).click();
    await expect(page.getByRole("button", { name: "Clear area" })).toHaveCount(0);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/map?state=california&panel=list");
    await expect(page.getByLabel("Michelin stars")).toBeVisible();

    const mobileResult = page
      .getByRole("listbox", { name: "Map restaurant results" })
      .getByRole("option")
      .first();
    await expect(mobileResult).toBeVisible();
    await mobileResult.click();

    await expect(
      page.getByRole("dialog", { name: "Selected restaurant preview" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Collapse" }).click();
    await expect(page.getByRole("button", { name: "Expand" })).toBeVisible();
    await page.getByRole("button", { name: "Expand" }).click();
    await expect(page.getByRole("button", { name: "Collapse" })).toBeVisible();
  });

  test("Fit and Reset controls remain available", async ({ page }) => {
    await mockMapTiles(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/map");
    await expect(page.getByRole("button", { name: "Fit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
  });

  test("no horizontal overflow at reference widths", async ({ page }) => {
    test.setTimeout(60_000);
    await mockMapTiles(page);
    for (const width of [1440, 1280, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/map", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: "Map" })).toBeAttached();
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
    }
  });
});
