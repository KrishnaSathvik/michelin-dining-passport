import { defineConfig, devices } from "@playwright/test";

/**
 * Phase 12 dedicated e2e port — never reuse whatever happens to own :3000.
 * A foreign Next app on localhost:3000 previously caused shell search
 * tests to miss the Dining Passport header entirely.
 *
 * Override with E2E_PORT when needed. Default: 3112.
 */
const E2E_PORT = process.env.E2E_PORT ?? "3112";
const E2E_ORIGIN = `http://127.0.0.1:${E2E_PORT}`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: E2E_ORIGIN,
    trace: "on-first-retry",
  },
  webServer: {
    // Prefer a production build when available; fall back is handled by callers.
    command: `npm run start -- --hostname 127.0.0.1 --port ${E2E_PORT}`,
    url: E2E_ORIGIN,
    // Prefer an already-running owned Phase 12 server on E2E_PORT; otherwise start one.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
