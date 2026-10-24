import { defineConfig, devices } from '@playwright/test';

const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = externalBaseURL ?? 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: process.env.CI ? undefined : 4,
  reporter: [['line'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: 'viewports.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
    {
      name: 'desktop-firefox',
      testIgnore: 'viewports.spec.ts',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 900 } },
    },
    {
      name: 'desktop-webkit',
      testIgnore: 'viewports.spec.ts',
      use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 900 } },
    },
    { name: 'iphone', testIgnore: 'viewports.spec.ts', use: { ...devices['iPhone 13'] } },
    { name: 'ipad', testIgnore: 'viewports.spec.ts', use: { ...devices['iPad Pro 11'] } },
    { name: 'android', testIgnore: 'viewports.spec.ts', use: { ...devices['Pixel 7'] } },
    {
      name: 'small-phone',
      testIgnore: 'viewports.spec.ts',
      use: {
        viewport: { width: 320, height: 568 },
        deviceScaleFactor: 2,
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'viewport-webkit',
      testMatch: 'viewports.spec.ts',
      use: { ...devices['iPhone 13'] },
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
