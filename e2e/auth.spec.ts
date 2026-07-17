import { expect, test } from "@playwright/test";

test.describe("Phase 10 authentication and account surfaces", () => {
  test("login page renders without global chrome", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
    await expect(page.getByRole("banner")).toHaveCount(0);
    await expect(page.getByRole("contentinfo")).toHaveCount(0);
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  });

  test("login keeps device-only Passport available", async ({ page }) => {
    await page.goto("/login");
    await page
      .getByRole("link", { name: "Continue with device-only Passport" })
      .click();
    await expect(page).toHaveURL(/\/passport/);
  });

  test("login links to create account and forgot password", async ({
    page,
  }) => {
    await page.goto("/login?next=/passport");
    await expect(
      page.getByRole("link", { name: "Create account" }),
    ).toHaveAttribute("href", "/signup?next=%2Fpassport");
    await expect(
      page.getByRole("link", { name: "Forgot password?" }),
    ).toHaveAttribute("href", "/forgot-password?next=%2Fpassport");
  });

  test("password visibility toggle is labeled", async ({ page }) => {
    await page.goto("/login");
    const toggle = page.getByRole("button", { name: "Show password" });
    await expect(toggle).toBeVisible();
    await page.getByLabel("Password", { exact: true }).fill("secret-pass");
    await toggle.click();
    await expect(
      page.getByRole("button", { name: "Hide password" }),
    ).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
      "type",
      "text",
    );
  });

  test("magic link alternative is available and secondary", async ({
    page,
  }) => {
    await page.goto("/login");
    await page
      .getByRole("button", { name: "Continue with Magic Link" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Magic link" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Email me a link" })).toBeVisible();
  });

  test("signup page renders supported fields only", async ({ page }) => {
    await page.goto("/signup");
    await expect(
      page.getByRole("heading", { name: "Create an Account" }),
    ).toBeVisible();
    await expect(page.getByLabel("Display name")).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirm password")).toHaveCount(0);
    await expect(page.getByText("At least 8 characters.")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /privacy|terms/i }),
    ).toHaveCount(0);
  });

  test("forgot password page renders", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(
      page.getByRole("heading", { name: "Forgot Password" }),
    ).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Send reset link" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Return to sign in" }),
    ).toBeVisible();
  });

  test("reset password without recovery session shows invalid state", async ({
    page,
  }) => {
    await page.goto("/reset-password");
    await expect(
      page.getByRole("heading", { name: "Reset link unavailable" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Update password" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Request a new link" }),
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
    const nextValue = await page
      .locator('input[name="next"]')
      .first()
      .inputValue();
    expect(nextValue.startsWith("/")).toBeTruthy();
    expect(nextValue.includes("evil.example")).toBeFalsy();
  });

  test("Google OAuth control is omitted when not enabled by default", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toHaveCount(0);
  });

  test("homepage still loads for guests", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("banner")).toBeVisible();
  });

  test("auth mobile viewport is form-first without horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBeFalsy();
  });
});
