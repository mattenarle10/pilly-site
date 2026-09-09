import { defineConfig, devices } from '@playwright/test';

const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = externalBaseURL ?? 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  reporter: 'line',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'iphone', use: { ...devices['iPhone 13'] } },
    {
      name: 'small-phone',
      use: {
        viewport: { width: 320, height: 568 },
        deviceScaleFactor: 2,
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: 'bun run preview',
        url: baseURL,
        reuseExistingServer: false,
      },
});
