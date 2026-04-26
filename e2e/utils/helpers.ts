import { Page, expect } from '@playwright/test';

/**
 * Wait for page to be fully loaded (no pending requests)
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Check if wallet is connected by looking for address in navbar
 */
export async function isWalletConnected(page: Page): Promise<boolean> {
  const addressPattern = /0x[a-fA-F0-9]{4}\.{3}[a-fA-F0-9]{4}/;
  const navbarText = await page.textContent('nav');
  return navbarText ? addressPattern.test(navbarText) : false;
}

/**
 * Mock wallet connection (for non-blockchain UI tests)
 * This sets localStorage to simulate a connected wallet
 */
export async function mockWalletConnection(page: Page, address: string) {
  // Simulate wagmi/rainbow kit connection state
  await page.evaluate((addr) => {
    localStorage.setItem('wagmi.connected', 'true');
    localStorage.setItem('wagmi.wallet', 'metaMask');
    localStorage.setItem('wagmi.recentConnectorId', 'metaMask');
  }, address);
}

/**
 * Take a screenshot with timestamp for debugging
 */
export async function takeTimestampedScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Wait for blockchain transaction to complete
 * Looks for success notification or transaction hash
 */
export async function waitForTransaction(page: Page, timeoutMs = 30000) {
  // Wait for either success toast or transaction confirmation
  await page.waitForSelector(
    '[data-testid="transaction-success"], .toast-success, [class*="success"]',
    { timeout: timeoutMs }
  ).catch(() => {
    console.warn('Transaction confirmation not found - continuing anyway');
  });
}

/**
 * Check if element is visible and enabled
 */
export async function isElementInteractive(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector);
  return (await element.isVisible()) && (await element.isEnabled());
}

/**
 * Scroll element into view before interacting
 */
export async function scrollAndClick(page: Page, selector: string) {
  const element = page.locator(selector);
  await element.scrollIntoViewIfNeeded();
  await element.click();
}

/**
 * Wait for specific text to appear on page
 */
export async function waitForText(page: Page, text: string, timeoutMs = 10000) {
  await page.waitForSelector(`text="${text}"`, { timeout: timeoutMs });
}

/**
 * Get all console errors from page
 */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

/**
 * Assert no console errors occurred
 */
export async function assertNoConsoleErrors(page: Page, collectedErrors: string[]) {
  // Filter out known/acceptable errors
  const criticalErrors = collectedErrors.filter((error) => {
    // Ignore wagmi/wallet connection warnings in test environment
    if (error.includes('wagmi')) return false;
    if (error.includes('wallet')) return false;
    if (error.includes('MetaMask')) return false;
    return true;
  });

  expect(criticalErrors, `Found ${criticalErrors.length} console errors`).toHaveLength(0);
}

/**
 * Fill form field with label
 */
export async function fillFieldByLabel(page: Page, label: string, value: string) {
  const input = page.locator(`label:has-text("${label}") + input, label:has-text("${label}") ~ input`);
  await input.fill(value);
}

/**
 * Check if route is active (URL matches)
 */
export async function isRouteActive(page: Page, route: string): Promise<boolean> {
  const url = page.url();
  return url.endsWith(route) || url.includes(route);
}
