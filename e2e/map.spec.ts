import { expect, test } from "@playwright/test";

test.describe("Phase 5 map flow", () => {
  test("filters, selects, search-this-area, and mobile preview", async ({
    page,
  }) => {
    // Avoid flaky tile/network dependency: demotiles may still load, but the
    // accessible list is the primary assertion surface.
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

    await page.goto("/map");
    await expect(page.getByRole("heading", { name: "Map" })).toBeVisible();

    await page.getByLabel("State").selectOption("california");
    await expect(page.getByText(/restaurant/i).first()).toBeVisible();

    const firstResult = page
      .getByRole("list", { name: "Map restaurant results" })
      .getByRole("button")
      .first();
    await expect(firstResult).toBeVisible();
    const selectedName = (
      await firstResult.locator(".font-display").textContent()
    )?.trim();
    await firstResult.click();

    await expect(page.getByRole("link", { name: "Open page" }).first()).toBeVisible();
    if (selectedName) {
      await expect(page.getByText(selectedName).first()).toBeVisible();
    }

    // Drive search-this-area via URL bounds restoration (deterministic).
    await page.goto(
      "/map?state=california&bounds=-122.5000,37.7000,-122.3000,37.9000",
    );
    await expect(page.getByRole("button", { name: "Clear area" })).toBeVisible();
    await page.getByRole("button", { name: "Clear area" }).click();
    await expect(page.getByRole("button", { name: "Clear area" })).toHaveCount(0);

    // Mobile: full-screen map with List toggle + bottom sheet preview
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/map?state=california&panel=list");
    await expect(page.getByLabel("Michelin stars")).toBeVisible();

    const mobileResult = page
      .getByRole("list", { name: "Map restaurant results" })
      .getByRole("button")
      .first();
    await expect(mobileResult).toBeVisible();
    await mobileResult.click();

    await expect(
      page.getByRole("dialog", { name: "Selected restaurant preview" }),
    ).toBeVisible();
    // Selection opens the sheet expanded; collapse then expand again.
    await page.getByRole("button", { name: "Collapse" }).click();
    await expect(page.getByRole("button", { name: "Expand" })).toBeVisible();
    await page.getByRole("button", { name: "Expand" }).click();
    await expect(page.getByRole("button", { name: "Collapse" })).toBeVisible();
  });
});
