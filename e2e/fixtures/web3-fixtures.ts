import { test as base, type BrowserContext } from '@playwright/test';
import { MetaMask, testWithSynpress } from '@synthetixio/synpress';

/**
 * Web3 test fixtures with MetaMask
 */
export const test = testWithSynpress(base);

export { expect } from '@playwright/test';

/**
 * Test wallet configuration
 */
export const TEST_WALLET_CONFIG = {
  // Hardhat default test wallet
  seedPhrase: process.env.TEST_WALLET_SEED ||
    'test test test test test test test test test test test junk',
  password: 'Test123456!',
  // This address corresponds to the seed phrase above
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
} as const;

/**
 * DChain network configuration
 */
export const DCHAIN_NETWORK = {
  chainId: 2713017997578000, // DChain testnet
  chainName: 'DChain Testnet',
  rpcUrl: 'https://dchaintestnet.rpc.caldera.xyz/http',
  currencySymbol: 'ETH',
  blockExplorer: 'https://dchaintestnet.explorer.caldera.xyz',
} as const;

/**
 * Base Sepolia network configuration (for comparison/fallback)
 */
export const BASE_SEPOLIA_NETWORK = {
  chainId: 84532,
  chainName: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  currencySymbol: 'ETH',
  blockExplorer: 'https://sepolia-explorer.base.org',
} as const;

/**
 * Contract addresses (update these with your deployed contracts)
 */
export const CONTRACTS = {
  // TODO: Update these with actual deployed addresses
  DIKTI_TOKEN: process.env.NEXT_PUBLIC_DIKTI_TOKEN_ADDRESS || '0x...',
  PROJECT_FACTORY: process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0x...',
  STAKING: process.env.NEXT_PUBLIC_STAKING_ADDRESS || '0x...',
} as const;

/**
 * Helper to wait for transaction confirmation
 */
export async function waitForTransactionConfirmation(page: any, timeout = 60000) {
  await page.waitForSelector(
    'text=/transaction (confirmed|successful|complete)/i',
    { timeout }
  ).catch(() => {
    console.warn('Transaction confirmation message not found - may still be pending');
  });
}

/**
 * Helper to get current block number from page
 */
export async function getCurrentBlock(page: any): Promise<number | null> {
  return await page.evaluate(() => {
    // Try to get block number from window.ethereum
    if (window.ethereum) {
      return window.ethereum.request({
        method: 'eth_blockNumber'
      }).then((block: string) => parseInt(block, 16));
    }
    return null;
  });
}
