import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against the PRERENDERED build with fixture projects (npm run build:e2e),
 * served like static hosting. Chromium only: desktop and a phone viewport.
 */
const PORT = 4500;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `node scripts/serve-static.mjs dist/e2e/browser ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env['CI'],
  },
});
