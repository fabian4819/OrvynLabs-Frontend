import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Orvyn-Labs DApp
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* Run tests in files in parallel */
  fullyParallel: false, // Sequential for blockchain state consistency

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : 1, // Sequential for blockchain interactions

  /* Reporter to use */
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshots on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',

    /* Extended timeout for blockchain transactions */
    actionTimeout: 30000, // 30s for MetaMask interactions
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Larger viewport for Web3 modals
        viewport: { width: 1400, height: 900 },
      },
    },

    // Uncomment for cross-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Mobile testing */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes to start Next.js
    stdout: 'ignore',
    stderr: 'pipe',
  },

  /* Global setup/teardown */
  // globalSetup: require.resolve('./e2e/setup/global-setup'),
  // globalTeardown: require.resolve('./e2e/setup/global-teardown'),

  /* Timeout for each test */
  timeout: 60000, // 60s per test (blockchain transactions can be slow)

  /* Expect timeout */
  expect: {
    timeout: 10000, // 10s for assertions
  },
});
