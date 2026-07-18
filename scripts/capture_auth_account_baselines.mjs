/**
 * Capture Phase 10 auth/account baselines into
 * docs/stitch-redesign/baselines/auth-account/
 * Requires a running app on localhost:3000 (dev preferred for account preview).
 */
import { chromium } from "@playwright/test";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs/stitch-redesign/baselines/auth-account");
const refs = join(outDir, "references");
const loginDir = join(outDir, "login");
const signupDir = join(outDir, "signup");
const forgotDir = join(outDir, "forgot");
const resetDir = join(outDir, "reset");
const accountDir = join(outDir, "account");
const statesDir = join(outDir, "states");

for (const dir of [
  refs,
  loginDir,
  signupDir,
  forgotDir,
  resetDir,
  accountDir,
  statesDir,
]) {
  mkdirSync(dir, { recursive: true });
}

const base = process.env.BASE_URL ?? "http://localhost:3000";

const designRefs = [
  ["sign_in_dining_passport/screen.png", "sign-in-reference.png"],
  ["create_account_dining_passport/screen.png", "signup-reference.png"],
  ["forgot_password_dining_passport/screen.png", "forgot-reference.png"],
  ["reset_password_dining_passport/screen.png", "reset-reference.png"],
  ["account_settings_profile/screen.png", "account-reference.png"],
];

for (const [srcRel, destName] of designRefs) {
  const src = join(root, "docs/designs", srcRel);
  if (existsSync(src)) {
    copyFileSync(src, join(refs, destName));
  }
}

async function shot(page, path, opts = {}) {
  await page.screenshot({ path, fullPage: opts.fullPage ?? true });
  console.log("wrote", path);
}

async function setViewport(page, width, height = 900) {
  await page.setViewportSize({ width, height });
}

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  await setViewport(page, 1440);
  await page.goto(`${base}/login`, { waitUntil: "networkidle" });
  await shot(page, join(loginDir, "login-1440.png"));

  await setViewport(page, 1024);
  await page.goto(`${base}/login`, { waitUntil: "networkidle" });
  await shot(page, join(loginDir, "login-1024.png"));

  await setViewport(page, 768);
  await page.goto(`${base}/login`, { waitUntil: "networkidle" });
  await shot(page, join(loginDir, "login-768.png"));

  await setViewport(page, 390, 844);
  await page.goto(`${base}/login`, { waitUntil: "networkidle" });
  await shot(page, join(loginDir, "login-390.png"));
  await shot(page, join(loginDir, "login-device-passport.png"));

  await setViewport(page, 1440);
  await page.goto(`${base}/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Email address").fill("not-an-email");
  await page.getByLabel("Password", { exact: true }).fill("x");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForTimeout(500);
  await shot(page, join(loginDir, "login-error.png"));

  await page.goto(`${base}/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Email address").fill("diner@example.com");
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "Sign in" }).evaluate((button) => {
    button.setAttribute("disabled", "true");
    button.textContent = "Signing in…";
    button.dataset.authPending = "true";
  });
  await shot(page, join(loginDir, "login-pending.png"));

  await page.goto(`${base}/login`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Continue with Magic Link" }).click();
  await page.waitForSelector('[data-auth-form="magic-link"]');
  await shot(page, join(loginDir, "login-magic-link.png"));

  await setViewport(page, 1440);
  await page.goto(`${base}/signup`, { waitUntil: "networkidle" });
  await shot(page, join(signupDir, "signup-1440.png"));

  await setViewport(page, 390, 844);
  await page.goto(`${base}/signup`, { waitUntil: "networkidle" });
  await shot(page, join(signupDir, "signup-390.png"));

  await setViewport(page, 1440);
  await page.goto(`${base}/signup`, { waitUntil: "networkidle" });
  await page.getByLabel("Password", { exact: true }).fill("short");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForTimeout(500);
  await shot(page, join(signupDir, "signup-validation.png"));

  await page.goto(`${base}/login?verify=1`, { waitUntil: "networkidle" });
  await shot(page, join(signupDir, "signup-confirmation.png"));

  await setViewport(page, 1440);
  await page.goto(`${base}/forgot-password`, { waitUntil: "networkidle" });
  await shot(page, join(forgotDir, "forgot-1440.png"));

  await setViewport(page, 390, 844);
  await page.goto(`${base}/forgot-password`, { waitUntil: "networkidle" });
  await shot(page, join(forgotDir, "forgot-390.png"));

  await setViewport(page, 1440);
  await page.goto(`${base}/forgot-password?preview=success`, {
    waitUntil: "networkidle",
  });
  await shot(page, join(forgotDir, "forgot-success.png"));

  await setViewport(page, 1440);
  await page.goto(`${base}/reset-password`, { waitUntil: "networkidle" });
  await shot(page, join(resetDir, "reset-invalid-link.png"));
  await shot(page, join(resetDir, "reset-1440.png"));

  await setViewport(page, 390, 844);
  await page.goto(`${base}/reset-password`, { waitUntil: "networkidle" });
  await shot(page, join(resetDir, "reset-390.png"));

  await setViewport(page, 1440);
  await page.goto(`${base}/reset-password?preview=success`, {
    waitUntil: "networkidle",
  });
  await shot(page, join(resetDir, "reset-success.png"));

  // Phase 12: /dev/stitch-account-preview removed. Capture authenticated account
  // only when a session exists; otherwise record the unauthenticated redirect.
  await setViewport(page, 1440);
  await page.goto(`${base}/account`, { waitUntil: "networkidle" });
  await shot(page, join(accountDir, "account-1440.png"));

  await setViewport(page, 390, 844);
  await page.goto(`${base}/account`, { waitUntil: "networkidle" });
  await shot(page, join(accountDir, "account-390.png"));

  console.log(
    "Phase 10/12 auth/account baselines captured (account preview route removed).",
  );
} finally {
  await browser.close();
}
