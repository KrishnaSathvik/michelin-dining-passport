import { expect, test } from "@playwright/test";

test.describe("Phase 6 authentication surfaces", () => {
  test("login page renders and keeps guest passport available", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await page.getByRole("link", { name: "Continue to Passport" }).click();
    await expect(page).toHaveURL(/\/passport/);
  });

  test("signup page renders", async ({ page }) => {
    await page.goto("/signup");
    await expect(
      page.getByRole("heading", { name: "Create account" }),
    ).toBeVisible();
  });

  test("account redirects unauthenticated users to login with safe next", async ({
    page,
  }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login\?next=%2Faccount/);
  });

  test("login preserves internal next and rejects external next", async ({
    page,
  }) => {
    await page.goto("/login?next=/passport");
    await expect(page.locator('input[name="next"]').first()).toHaveValue(
      "/passport",
    );

    await page.goto("/login?next=https://evil.example");
    // Hidden field should contain sanitized fallback from server render.
    const nextValue = await page
      .locator('input[name="next"]')
      .first()
      .inputValue();
    expect(nextValue.startsWith("/")).toBeTruthy();
    expect(nextValue.includes("evil.example")).toBeFalsy();
  });

  test("homepage still loads for guests", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("banner")).toBeVisible();
  });
});
