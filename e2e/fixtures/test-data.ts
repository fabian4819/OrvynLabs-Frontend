/**
 * Test data fixtures for E2E tests
 */

export const TEST_WALLET = {
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Hardhat default
  privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
} as const;

export const TEST_PROJECT = {
  title: 'E2E Test Project - AI in Medicine',
  category: 'AI/ML',
  tags: ['machine-learning', 'healthcare', 'ai'],
  milestones: [
    {
      title: 'Literature Review',
      goal: '100', // DKT
      duration: 30, // days
    },
    {
      title: 'Data Collection',
      goal: '200',
      duration: 60,
    },
  ],
} as const;

export const TEST_DONATION = {
  amount: '50', // DKT
} as const;

export const TEST_STAKE = {
  amount: '100', // DKT
} as const;

/**
 * Expected routes in the app
 */
export const ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  STAKE: '/stake',
  ANALYTICS: '/analytics',
  ANALYTICS_CHARTS: '/analytics/charts',
  LEADERBOARD: '/leaderboard',
  HISTORY: '/history',
  FAVORITES: '/favorites',
  HELP: '/help',
} as const;

/**
 * Common test timeouts (in ms)
 */
export const TIMEOUTS = {
  BLOCKCHAIN_TX: 30000, // 30s for blockchain transactions
  PAGE_LOAD: 10000, // 10s for page loads
  WALLET_INTERACTION: 5000, // 5s for wallet interactions
  ANIMATION: 1000, // 1s for UI animations
} as const;
