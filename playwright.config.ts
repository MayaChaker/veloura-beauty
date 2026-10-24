import { defineConfig, devices } from "@playwright/test";

// End-to-end tests: a real browser drives the built site, its server and its database.
//   npm run build, then: DATABASE_URL=…/veloura_test npm run test:e2e
// They create accounts and orders, so e2e/globalSetup.ts refuses any database that is not a
// throwaway one (a name ending in _test, or CI's own).
const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  // A journey signs up, browses and checks out: longer than a unit test.
  timeout: 60_000,
  // One browser at a time: the tests share one database and one rate limit.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  globalSetup: "./e2e/globalSetup.ts",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      // Locally, the Chrome already installed; in CI, Playwright's own Chromium.
      use: { ...devices["Desktop Chrome"], channel: process.env.CI ? undefined : "chrome" },
    },
  ],
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Better Auth only accepts requests from its own address.
    env: { BETTER_AUTH_URL: baseURL },
  },
});
