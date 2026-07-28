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

  test("login keeps device-only saves available", async ({ page }) => {
    await page.goto("/login");
    await page
      .getByRole("link", { name: "Continue with device-only saves" })
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
    await expect(
      page.getByRole("button", { name: "Continue with Magic Link" }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Email me a magic link instead" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Sign in with email" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Email me a link" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Use password instead" }),
    ).toBeVisible();
  });

  test("signup page renders supported fields only", async ({ page }) => {
    await page.goto("/signup");
    await expect(
      page.getByRole("heading", { name: "Create account" }),
    ).toBeVisible();
    await expect(page.getByLabel("Display name")).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirm password")).toHaveCount(0);
    await expect(page.getByText("At least 8 characters.")).toBeVisible();
    await expect(
      page.getByText("Sync saves and visits across your devices."),
    ).toBeVisible();
  });

  test("signup links to the real Privacy and Terms pages", async ({ page }) => {
    await page.goto("/signup");
    await expect(
      page.getByRole("link", { name: "Terms", exact: true }).first(),
    ).toHaveAttribute("href", "/terms");
    await expect(
      page.getByRole("link", { name: "Privacy", exact: true }).first(),
    ).toHaveAttribute("href", "/privacy");

    await page.getByRole("link", { name: "Terms", exact: true }).first().click();
    await expect(page).toHaveURL(/\/terms/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Terms" }),
    ).toBeVisible();
  });

  test("signup surfaces field-level validation without browser bubbles", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.getByLabel("Email address").fill("not-an-email");
    await page.getByLabel("Password", { exact: true }).fill("short");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    await expect(page.getByText("Use at least 8 characters.")).toBeVisible();
    await expect(page.getByLabel("Email address")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("login surfaces field-level validation on empty submit", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Enter your email address.")).toBeVisible();
    await expect(page.getByText("Enter your password.")).toBeVisible();
  });

  test("signup keeps device-only saves available", async ({ page }) => {
    await page.goto("/signup");
    await page
      .getByRole("link", { name: "Continue with device-only saves" })
      .click();
    await expect(page).toHaveURL(/\/passport/);
  });

  test("forgot password page renders", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(
      page.getByRole("heading", { name: "Forgot password" }),
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
    await expect(page.locator("[data-auth-mobile-brand]")).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBeFalsy();
  });
});
