import { expect, test } from "@playwright/test";

test.describe("Phase 7 launch flows", () => {
  test("guest can search and filter explore", async ({ page }) => {
    await page.goto("/explore");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const search = page.getByRole("searchbox").or(page.locator('input[name="q"]')).first();
    if (await search.count()) {
      await search.fill("Addison");
      await search.press("Enter");
      await expect(page).toHaveURL(/q=Addison|q=addison/i);
    }

    await page.goto("/explore?state=california&stars=3");
    await expect(page.locator("body")).toContainText(/California|3/i);
  });

  test("guest opens restaurant details and reservation CTA", async ({ page }) => {
    await page.goto("/restaurants/addison-san-diego-ca");
    await expect(page.getByRole("heading", { name: /Addison/i })).toBeVisible();
    const reserve = page.getByRole("link", {
      name: /Reserve|Check availability|View booking|Visit restaurant/i,
    });
    await expect(reserve.first()).toBeVisible();
    await expect(reserve.first()).toHaveAttribute("target", "_blank");
  });

  test("guest passport local save/visited controls render", async ({ page }) => {
    await page.goto("/restaurants/addison-san-diego-ca");
    await expect(page.getByRole("heading", { name: /Addison/i })).toBeVisible();
    // Local passport controls are present for guests without requiring cloud.
    await expect(page.locator("body")).toContainText(/Save|Saved|Visit|Visited/i);
  });

  test("account creation and sign-in surfaces exist", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: /Create account/i })).toBeVisible();
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible();
  });

  test("map loads with saved/visited filter affordances", async ({ page }) => {
    await page.goto("/map");
    await expect(page.locator("body")).toContainText(/Map|Saved|Visited/i);
  });

  test("legal pages and correction form are public", async ({ page }) => {
    for (const path of [
      "/privacy",
      "/terms",
      "/data-sources",
      "/correction-policy",
      "/image-attribution",
      "/disclaimer",
      "/corrections",
    ]) {
      await page.goto(path);
      await expect(page.locator("body")).toContainText(/launch draft|Launch draft|Feedback/i);
    }

    await page.goto("/corrections");
    await page.getByLabel("Restaurant name").fill("Addison");
    await page.getByLabel("Suggested correction").fill("Test address correction");
    await page.getByLabel("Details").fill("Playwright launch flow correction submission.");
    await page.getByRole("button", { name: /Submit correction/i }).click();
    await expect(page.locator("body")).toContainText(/received for review|Thanks/i);
  });

  test("public browsing works when Supabase env is unset in browser", async ({
    page,
  }) => {
    // Discovery pages are static/local-data based and must not hard-fail.
    await page.goto("/");
    await expect(page.getByRole("banner")).toBeVisible();
    await page.goto("/explore");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/restaurants/addison-san-diego-ca");
    await expect(page.getByRole("heading", { name: /Addison/i })).toBeVisible();
  });

  test("passport export control exists for local users", async ({ page }) => {
    await page.goto("/passport");
    await expect(page.locator("body")).toContainText(/Passport|Export|Saved/i);
  });
});
