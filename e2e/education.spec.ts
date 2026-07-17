import { test, expect } from "@playwright/test";

test.describe("Phase 11 Michelin education", () => {
  test("education page renders with canonical chrome and independence", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about-michelin-stars");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "How Michelin Stars Work",
      }),
    ).toBeVisible();
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: "Independent platform" }),
    ).toBeVisible();
    await expect(page.getByText(/not affiliated/i).first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Beyond the Stars" }),
    ).toBeVisible();
    await expect(page.getByText(/Bib Gourmand/i).first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Browse .* one-star/i }),
    ).toHaveAttribute("href", "/stars/1");
    await expect(
      page.getByRole("link", { name: /Browse .* two-star/i }),
    ).toHaveAttribute("href", "/stars/2");
    await expect(
      page.getByRole("link", { name: /Browse .* three-star/i }),
    ).toHaveAttribute("href", "/stars/3");
    await expect(page.locator("gmp-place-details")).toHaveCount(0);
    // Discard alternate Stitch nav labels
    await expect(
      page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
        name: "Explore",
      }),
    ).toBeVisible();
  });
});
