/**
 * Shared shell + authentication visual baselines.
 * Owns a dedicated port via BASE_URL (default http://127.0.0.1:3112).
 * Verifies Orellin identity before capture.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs/stitch-redesign/baselines/shell-auth");
mkdirSync(outDir, { recursive: true });

const base = process.env.BASE_URL ?? "http://127.0.0.1:3112";

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };
const NARROW = { width: 375, height: 667 };

async function assertApp(page) {
  const title = await page.title();
  if (!/Orellin/i.test(title)) {
    throw new Error(`Wrong app title at ${page.url()}: ${title}`);
  }
}

async function shot(page, name, fullPage = true) {
  const path = join(outDir, name);
  await page.screenshot({ path, fullPage });
  console.log("wrote", name);
}

async function openSearch(page) {
  await page
    .getByRole("banner")
    .getByRole("link", { name: "Search restaurants" })
    .click();
  await page
    .getByRole("dialog", { name: "Search restaurants" })
    .waitFor({ state: "visible" });
}

const browser = await chromium.launch();

try {
  // ---- Shared header across major routes (desktop) ----
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    await page.goto(base, { waitUntil: "networkidle" });
    await assertApp(page);

    const routes = [
      ["home", "/"],
      ["explore", "/explore"],
      ["map", "/map"],
      ["michelin-stars", "/about-michelin-stars"],
      ["passport", "/passport"],
      ["about", "/about"],
      ["sources", "/sources"],
    ];
    for (const [name, route] of routes) {
      await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
      // Header-only crop keeps the comparison about the shell, not the page.
      const header = page.getByRole("banner");
      await header.screenshot({ path: join(outDir, `header-${name}-desktop.png`) });
      console.log("wrote", `header-${name}-desktop.png`);
    }
    await page.close();
  }

  // ---- Footer ----
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    await page.goto(`${base}/about`, { waitUntil: "networkidle" });
    const footer = page.getByRole("contentinfo");
    await footer.scrollIntoViewIfNeeded();
    await footer.screenshot({ path: join(outDir, "footer-desktop.png") });
    console.log("wrote", "footer-desktop.png");
    await page.close();

    const mobile = await browser.newPage({ viewport: NARROW });
    await mobile.goto(`${base}/about`, { waitUntil: "networkidle" });
    const mFooter = mobile.getByRole("contentinfo");
    await mFooter.scrollIntoViewIfNeeded();
    await mFooter.screenshot({ path: join(outDir, "footer-mobile-375.png") });
    console.log("wrote", "footer-mobile-375.png");
    await mobile.close();
  }

  // ---- Supporting content pages ----
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    for (const route of ["about", "privacy", "terms", "contact", "sources"]) {
      await page.goto(`${base}/${route}`, { waitUntil: "networkidle" });
      await shot(page, `content-${route}-desktop.png`);
    }
    await page.close();
  }

  // ---- Mobile navigation drawer ----
  {
    const page = await browser.newPage({ viewport: MOBILE });
    await page.goto(base, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("dialog", { name: "Menu" }).waitFor({ state: "visible" });
    await shot(page, "mobile-navigation-390.png", false);
    await page.close();
  }

  // ---- Global search ----
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    await page.goto(base, { waitUntil: "networkidle" });
    await openSearch(page);
    await shot(page, "global-search-empty-desktop.png", false);

    await page
      .getByPlaceholder("Restaurants, cities, states, cuisines")
      .fill("Chicago");
    await page.getByRole("option").first().waitFor({ state: "visible" });
    await shot(page, "global-search-results-desktop.png", false);

    await page
      .getByPlaceholder("Restaurants, cities, states, cuisines")
      .fill("zzzzqqqxx");
    await page.getByText(/No matches for/).waitFor({ state: "visible" });
    await shot(page, "global-search-empty-state-desktop.png", false);
    await page.close();

    const mobile = await browser.newPage({ viewport: MOBILE });
    await mobile.goto(base, { waitUntil: "networkidle" });
    await openSearch(mobile);
    await mobile
      .getByPlaceholder("Restaurants, cities, states, cuisines")
      .fill("Chicago");
    await mobile.getByRole("option").first().waitFor({ state: "visible" });
    await shot(mobile, "global-search-results-mobile-390.png", false);
    await mobile.close();
  }

  // ---- Auth pages ----
  {
    const desktop = await browser.newPage({ viewport: DESKTOP });
    for (const [name, route] of [
      ["login", "/login"],
      ["signup", "/signup"],
      ["forgot-password", "/forgot-password"],
      ["reset-password", "/reset-password"],
    ]) {
      await desktop.goto(`${base}${route}`, { waitUntil: "networkidle" });
      await shot(desktop, `auth-${name}-desktop.png`);
    }

    // Magic link alternative
    await desktop.goto(`${base}/login`, { waitUntil: "networkidle" });
    await desktop
      .getByRole("button", { name: "Email me a magic link instead" })
      .click();
    await desktop
      .getByRole("heading", { name: "Sign in with email" })
      .waitFor({ state: "visible" });
    await shot(desktop, "auth-magic-link-desktop.png");

    // Forgot-password confirmation state (dev preview flag)
    await desktop.goto(`${base}/forgot-password?preview=success`, {
      waitUntil: "networkidle",
    });
    await shot(desktop, "auth-forgot-password-sent-desktop.png");
    await desktop.close();

    const mobile = await browser.newPage({ viewport: MOBILE });
    for (const [name, route] of [
      ["login", "/login"],
      ["signup", "/signup"],
      ["forgot-password", "/forgot-password"],
    ]) {
      await mobile.goto(`${base}${route}`, { waitUntil: "networkidle" });
      await shot(mobile, `auth-${name}-mobile-390.png`);
    }
    await mobile.close();
  }

  // ---- Field-level validation errors ----
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    await page.goto(`${base}/signup`, { waitUntil: "networkidle" });
    await page.getByLabel("Email address").fill("not-an-email");
    await page.getByLabel("Password", { exact: true }).fill("short");
    await page.getByRole("button", { name: "Create account" }).click();
    await page
      .getByText("Enter a valid email address.")
      .waitFor({ state: "visible" });
    await shot(page, "auth-signup-validation-errors-desktop.png");

    await page.goto(`${base}/login`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Sign in" }).click();
    await page
      .getByText("Enter your email address.")
      .waitFor({ state: "visible" });
    await shot(page, "auth-login-validation-errors-desktop.png");
    await page.close();
  }

  // ---- Device-only Passport continuation ----
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    await page.goto(`${base}/login`, { waitUntil: "networkidle" });
    const link = page.getByRole("link", {
      name: "Continue with device-only saves",
    });
    await link.scrollIntoViewIfNeeded();
    await link.focus();
    await shot(page, "auth-device-only-focus-desktop.png");
    await link.click();
    await page.waitForURL(/\/passport/);
    await page.waitForLoadState("networkidle");
    await shot(page, "auth-device-only-passport-desktop.png");
    await page.close();
  }

  console.log("\nBaselines written to docs/stitch-redesign/baselines/shell-auth");
} finally {
  await browser.close();
}
