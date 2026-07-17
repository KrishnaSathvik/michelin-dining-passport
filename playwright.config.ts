import { defineConfig, devices } from "@playwright/test";

/**
 * Dedicated e2e port — never reuse whatever happens to own :3000.
 * A foreign Next app on localhost:3000 previously caused shell search
 * tests to miss the Dining Passport header entirely.
 */
const E2E_PORT = process.env.E2E_PORT ?? "3100";
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
    command: `npm run start -- --port ${E2E_PORT}`,
    url: E2E_ORIGIN,
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
