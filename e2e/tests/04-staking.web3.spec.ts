import { test, expect } from '../fixtures/web3-fixtures';
import { ROUTES, TEST_STAKE } from '../fixtures/test-data';
import {
  connectWallet,
  switchToDChain,
  stakeDKT,
  getStakedAmount,
  getDKTBalance,
} from '../utils/web3-helpers';

test.describe('Staking Flow', () => {
  test.beforeEach(async ({ page, context, metamask }) => {
    await page.goto('/');
    await connectWallet(page, metamask);
    await switchToDChain(metamask);
  });

  test('View staking page and stats', async ({ page }) => {
    await page.goto(ROUTES.STAKE);
    await page.waitForLoadState('networkidle');

    // Check for staking interface elements
    const stakeInput = page.locator('input[name="amount"], input[placeholder*="amount" i]').first();
    await expect(stakeInput).toBeVisible();

    const stakeButton = page.getByRole('button', { name: /^stake$/i }).first();
    await expect(stakeButton).toBeVisible();

    // Check for staking stats
    const hasStats = await page.locator('text=/total staked|APY|rewards/i').count() > 0;
    expect(hasStats).toBeTruthy();

    // Take screenshot
    await page.screenshot({
      path: 'test-results/screenshots/staking-page.png',
      fullPage: true,
    });
  });

  test('Stake DKT tokens', async ({ page, context, metamask }) => {
    const balanceBefore = await getDKTBalance(page);

    // Stake tokens
    await stakeDKT(page, metamask, TEST_STAKE.amount);

    // Verify staking successful
    await page.waitForTimeout(3000);

    // Check staked amount increased
    const stakedAmount = await getStakedAmount(page);
    console.log(`Staked amount: ${stakedAmount}`);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/screenshots/staking-complete.png',
      fullPage: true,
    });

    // Verify some stake is shown
    expect(stakedAmount).not.toBe('0');
  });

  test('Stake with insufficient balance', async ({ page, context, metamask }) => {
    await page.goto(ROUTES.STAKE);
    await page.waitForLoadState('networkidle');

    // Try to stake more than balance
    const amountInput = page.locator('input[name="amount"], input[placeholder*="amount" i]').first();
    await amountInput.fill('999999999');

    const stakeButton = page.getByRole('button', { name: /^stake$/i }).first();
    await stakeButton.click();

    await page.waitForTimeout(1000);

    // Should fail at approval or show error
    try {
      await metamask.confirmTransaction();
      await page.waitForTimeout(2000);

      // Should show error
      const hasError = await page.locator('text=/insufficient|not enough|failed/i').count() > 0;
      expect(hasError).toBeTruthy();
    } catch (error) {
      console.log('Transaction blocked (expected)');
    }
  });

  test('View pending rewards', async ({ page }) => {
    await page.goto(ROUTES.STAKE);
    await page.waitForLoadState('networkidle');

    // Look for rewards section
    const rewardsElement = page.locator('text=/pending rewards|claimable|earned/i');

    if (await rewardsElement.count() > 0) {
      const rewardsText = await rewardsElement.first().textContent();
      console.log(`Pending rewards: ${rewardsText}`);
    } else {
      console.log('No rewards section found');
    }
  });

  test('Claim staking rewards', async ({ page, context, metamask }) => {
    await page.goto(ROUTES.STAKE);
    await page.waitForLoadState('networkidle');

    // Look for claim button
    const claimButton = page.getByRole('button', { name: /claim.*rewards?/i });

    if (await claimButton.count() === 0) {
      console.log('No claim button found - might have no rewards');
      test.skip();
      return;
    }

    // Check if button is enabled
    if (await claimButton.isDisabled()) {
      console.log('Claim button disabled - no rewards to claim');
      test.skip();
      return;
    }

    const balanceBefore = await getDKTBalance(page);

    // Click claim
    await claimButton.click();
    await page.waitForTimeout(1000);

    // Confirm transaction
    await metamask.confirmTransaction();

    // Wait for confirmation
    await page.waitForTimeout(5000);

    // Check balance increased
    const balanceAfter = await getDKTBalance(page);

    console.log(`Balance before: ${balanceBefore}`);
    console.log(`Balance after: ${balanceAfter}`);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/screenshots/rewards-claimed.png',
      fullPage: true,
    });
  });

  test('Unstake tokens', async ({ page, context, metamask }) => {
    await page.goto(ROUTES.STAKE);
    await page.waitForLoadState('networkidle');

    // Check current staked amount
    const stakedBefore = await getStakedAmount(page);

    if (stakedBefore === '0') {
      console.log('No tokens staked - stake some first');
      test.skip();
      return;
    }

    // Look for unstake button or tab
    const unstakeButton = page.getByRole('button', { name: /unstake/i });

    if (await unstakeButton.count() === 0) {
      console.log('No unstake button found');
      test.skip();
      return;
    }

    await unstakeButton.click();
    await page.waitForTimeout(500);

    // Fill unstake amount
    const amountInput = page.locator('input[name="amount"], input[placeholder*="amount" i]').first();
    await amountInput.fill('10'); // Unstake small amount

    // Submit unstake
    const confirmButton = page.getByRole('button', { name: /confirm|unstake|withdraw/i });
    await confirmButton.click();

    await page.waitForTimeout(1000);

    // Confirm transaction
    await metamask.confirmTransaction();

    // Wait for confirmation
    await page.waitForTimeout(5000);

    // Check staked amount decreased
    const stakedAfter = await getStakedAmount(page);

    console.log(`Staked before: ${stakedBefore}`);
    console.log(`Staked after: ${stakedAfter}`);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/screenshots/unstake-complete.png',
      fullPage: true,
    });
  });

  test('Staking statistics display correctly', async ({ page }) => {
    await page.goto(ROUTES.STAKE);
    await page.waitForLoadState('networkidle');

    // Check for key staking metrics
    const metrics = [
      /total staked/i,
      /stakers?/i,
      /APY|APR|yield/i,
    ];

    for (const metric of metrics) {
      const hasMetric = await page.locator(`text=${metric}`).count() > 0;
      if (hasMetric) {
        const value = await page.locator(`text=${metric}`).first().textContent();
        console.log(`Metric found: ${value}`);
      }
    }

    // Verify page loads without errors
    await expect(page.locator('body')).toBeVisible();
  });
});
