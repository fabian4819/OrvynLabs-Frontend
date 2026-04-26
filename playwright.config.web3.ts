import { defineConfig, devices } from '@playwright/test';
import { defineWalletSetup } from '@synthetixio/synpress';
import 'dotenv/config';

// Define MetaMask wallet setup
const SEED_PHRASE = process.env.TEST_WALLET_SEED ||
  'test test test test test test test test test test test junk';
const PASSWORD = 'Test123456!';

export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.web3\.spec\.ts/,

  /* Run tests sequentially for blockchain state consistency */
  fullyParallel: false,
  workers: 1,

  /* Retries */
  retries: process.env.CI ? 2 : 0,

  /* Timeout for Web3 operations */
  timeout: 120000, // 2 minutes per test

  /* Reporter */
  reporter: [
    ['html', { outputFolder: 'playwright-report-web3' }],
    ['list'],
    ['json', { outputFile: 'test-results/web3-results.json' }],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Extended timeout for blockchain transactions */
    actionTimeout: 60000, // 1 minute
    navigationTimeout: 30000,

    /* Viewport for Web3 modals */
    viewport: { width: 1400, height: 900 },
  },

  projects: [
    {
      name: 'web3-tests',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  /* Run dev server */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  expect: {
    timeout: 15000, // 15s for assertions
  },
});

// Export wallet setup for Synpress
export const walletSetup = defineWalletSetup(PASSWORD, async (context, walletPage) => {
  // This function sets up the MetaMask wallet
  // Synpress will handle the actual setup
  await context.clearCookies();
});
