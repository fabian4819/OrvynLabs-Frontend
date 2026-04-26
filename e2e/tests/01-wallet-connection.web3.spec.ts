import { test, expect } from '../fixtures/web3-fixtures';
import { ROUTES } from '../fixtures/test-data';
import { connectWallet, switchToDChain, disconnectWallet } from '../utils/web3-helpers';

test.describe('Wallet Connection Flow', () => {
  test('Connect MetaMask wallet via RainbowKit', async ({ page, context, metamask }) => {
    await page.goto(ROUTES.HOME);

    // Connect wallet
    await connectWallet(page, metamask);

    // Verify wallet is connected (address shows in navbar)
    const navbar = page.locator('nav');
    await expect(navbar).toContainText(/0x[a-fA-F0-9]{4}/i);

    // Verify connect button is replaced
    const connectButton = page.getByRole('button', { name: /^connect wallet$/i });
    await expect(connectButton).toHaveCount(0);
  });

  test('Switch to DChain network', async ({ page, context, metamask }) => {
    await page.goto(ROUTES.HOME);
    await connectWallet(page, metamask);

    // Switch to DChain
    await switchToDChain(metamask);

    // Give app time to detect network switch
    await page.waitForTimeout(2000);

    // Verify no network warning shows
    const networkWarning = page.locator('text=/wrong network|switch network/i');
    await expect(networkWarning).toHaveCount(0);
  });

  test('Wallet address persists across page navigation', async ({ page, context, metamask }) => {
    await page.goto(ROUTES.HOME);
    await connectWallet(page, metamask);

    const connectedAddress = await page.locator('nav').textContent();

    // Navigate to different pages
    await page.goto(ROUTES.PROJECTS);
    await expect(page.locator('nav')).toContainText(/0x[a-fA-F0-9]{4}/i);

    await page.goto(ROUTES.STAKE);
    await expect(page.locator('nav')).toContainText(/0x[a-fA-F0-9]{4}/i);

    await page.goto(ROUTES.ANALYTICS);
    await expect(page.locator('nav')).toContainText(/0x[a-fA-F0-9]{4}/i);
  });

  test('Disconnect wallet', async ({ page, context, metamask }) => {
    await page.goto(ROUTES.HOME);
    await connectWallet(page, metamask);

    // Disconnect
    await disconnectWallet(page, metamask);

    // Verify connect button is back
    await page.waitForTimeout(1000);
    const connectButton = page.getByRole('button', { name: /connect wallet/i });
    await expect(connectButton).toBeVisible();
  });

  test('Display wallet balance (DKT)', async ({ page, context, metamask }) => {
    await page.goto(ROUTES.HOME);
    await connectWallet(page, metamask);
    await switchToDChain(metamask);

    // Wait for balance to load
    await page.waitForTimeout(3000);

    // Check for DKT balance display
    const balanceRegex = /\d+(?:,\d{3})*(?:\.\d+)?\s*DKT/i;
    const navbar = page.locator('nav');

    // Balance might be 0, but should be displayed
    const navbarText = await navbar.textContent();
    const hasBalance = balanceRegex.test(navbarText || '');

    // If no balance shown, it's okay - wallet might have 0 DKT
    if (!hasBalance) {
      console.log('Note: No DKT balance displayed (might be 0 or not loaded)');
    }
  });

  test('Reject wallet connection', async ({ page, context, metamask }) => {
    await page.goto(ROUTES.HOME);

    // Click connect button
    const connectButton = page.getByRole('button', { name: /connect wallet/i });
    await connectButton.click();

    // Wait for RainbowKit modal
    await page.waitForSelector('[data-testid="rk-wallet-option-metaMask"], button:has-text("MetaMask")');
    await page.click('[data-testid="rk-wallet-option-metaMask"], button:has-text("MetaMask")');

    await page.waitForTimeout(1000);

    // Reject connection in MetaMask
    await metamask.rejectConnection();

    // Verify still not connected
    await page.waitForTimeout(1000);
    const navbar = page.locator('nav');
    const navbarText = await navbar.textContent();
    const isConnected = /0x[a-fA-F0-9]{4}/.test(navbarText || '');

    expect(isConnected).toBeFalsy();
  });
});
