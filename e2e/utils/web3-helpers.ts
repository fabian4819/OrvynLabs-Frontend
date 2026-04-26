import { Page } from '@playwright/test';
import { MetaMask } from '@synthetixio/synpress';
import { DCHAIN_NETWORK } from '../fixtures/web3-fixtures';

/**
 * Connect wallet via RainbowKit
 */
export async function connectWallet(page: Page, metamask: MetaMask) {
  // Click connect button
  const connectButton = page.getByRole('button', { name: /connect wallet/i });
  await connectButton.click();

  // Wait for RainbowKit modal
  await page.waitForSelector('[data-testid="rk-wallet-option-metaMask"], button:has-text("MetaMask")', {
    timeout: 10000,
  });

  // Click MetaMask option
  await page.click('[data-testid="rk-wallet-option-metaMask"], button:has-text("MetaMask")');

  // Wait a moment for popup
  await page.waitForTimeout(1000);

  // Connect in MetaMask
  await metamask.connectToDapp();

  // Wait for connection to complete
  await page.waitForSelector('text=/0x[a-fA-F0-9]{4}/i', { timeout: 10000 });
}

/**
 * Switch to DChain network
 */
export async function switchToDChain(metamask: MetaMask) {
  try {
    await metamask.switchNetwork(DCHAIN_NETWORK.chainName);
  } catch (error) {
    // Network might not exist, try adding it first
    await metamask.addNetwork({
      name: DCHAIN_NETWORK.chainName,
      rpcUrl: DCHAIN_NETWORK.rpcUrl,
      chainId: DCHAIN_NETWORK.chainId,
      symbol: DCHAIN_NETWORK.currencySymbol,
    });
    await metamask.switchNetwork(DCHAIN_NETWORK.chainName);
  }
}

/**
 * Approve token spending
 */
export async function approveTokenSpending(
  page: Page,
  metamask: MetaMask,
  amount?: string
) {
  // Click approve button in app (if exists)
  const approveButton = page.locator('button:has-text("Approve")');
  if (await approveButton.count() > 0) {
    await approveButton.click();
    await page.waitForTimeout(1000);
  }

  // Confirm in MetaMask
  await metamask.confirmTransaction();

  // Wait for approval confirmation
  await page.waitForTimeout(2000);
}

/**
 * Wait for balance to update
 */
export async function waitForBalanceUpdate(
  page: Page,
  previousBalance: string,
  timeout = 30000
) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const currentBalance = await page.locator('[data-testid="dkt-balance"], .balance').textContent();

    if (currentBalance && currentBalance !== previousBalance) {
      return currentBalance;
    }

    await page.waitForTimeout(1000);
  }

  throw new Error('Balance did not update within timeout');
}

/**
 * Get DKT balance from navbar
 */
export async function getDKTBalance(page: Page): Promise<string> {
  const balanceElement = page.locator('[data-testid="dkt-balance"], text=/\\d+.*DKT/i').first();
  const balance = await balanceElement.textContent();
  return balance?.trim() || '0';
}

/**
 * Navigate to create project page
 */
export async function navigateToCreateProject(page: Page) {
  await page.goto('/projects');
  await page.waitForLoadState('networkidle');

  const createButton = page.getByRole('button', { name: /create project/i });
  await createButton.click();

  await page.waitForLoadState('networkidle');
}

/**
 * Fill project creation form
 */
export async function fillProjectForm(
  page: Page,
  projectData: {
    title: string;
    category: string;
    description?: string;
    tags?: string[];
    milestones: Array<{
      title: string;
      goal: string;
      duration: number;
    }>;
  }
) {
  // Fill basic info
  await page.fill('input[name="title"], input[placeholder*="title" i]', projectData.title);

  // Select category (if dropdown exists)
  const categorySelect = page.locator('select[name="category"]');
  if (await categorySelect.count() > 0) {
    await categorySelect.selectOption(projectData.category);
  }

  // Fill description if exists
  if (projectData.description) {
    const descField = page.locator('textarea[name="description"], textarea[placeholder*="description" i]');
    if (await descField.count() > 0) {
      await descField.fill(projectData.description);
    }
  }

  // Add tags if exist
  if (projectData.tags && projectData.tags.length > 0) {
    for (const tag of projectData.tags) {
      const tagInput = page.locator('input[name="tags"], input[placeholder*="tag" i]');
      if (await tagInput.count() > 0) {
        await tagInput.fill(tag);
        await page.keyboard.press('Enter');
      }
    }
  }

  // Add milestones
  for (let i = 0; i < projectData.milestones.length; i++) {
    const milestone = projectData.milestones[i];

    // Click add milestone if not first
    if (i > 0) {
      const addButton = page.getByRole('button', { name: /add milestone/i });
      await addButton.click();
      await page.waitForTimeout(500);
    }

    // Fill milestone fields
    const milestoneContainer = page.locator(`[data-milestone="${i}"], .milestone-${i}, .milestone`).nth(i);

    await milestoneContainer.locator('input[name*="title"]').fill(milestone.title);
    await milestoneContainer.locator('input[name*="goal"]').fill(milestone.goal);
    await milestoneContainer.locator('input[name*="duration"]').fill(milestone.duration.toString());
  }
}

/**
 * Submit project creation and confirm transaction
 */
export async function submitProjectCreation(
  page: Page,
  metamask: MetaMask
) {
  // Click deploy/create button
  const submitButton = page.getByRole('button', {
    name: /deploy project|create project|submit/i
  });
  await submitButton.click();

  // Wait for MetaMask
  await page.waitForTimeout(2000);

  // Confirm transaction
  await metamask.confirmTransaction();

  // Wait for confirmation (project creation can be slow)
  await page.waitForSelector(
    'text=/project created|successfully created|creation successful/i',
    { timeout: 90000 }
  ).catch(() => {
    console.warn('Project creation confirmation not found');
  });
}

/**
 * Donate to a project
 */
export async function donateToProject(
  page: Page,
  metamask: MetaMask,
  amount: string
) {
  // Fill donation amount
  const amountInput = page.locator('input[name="amount"], input[placeholder*="amount" i]');
  await amountInput.fill(amount);

  // Click donate button
  const donateButton = page.getByRole('button', { name: /donate|contribute/i });
  await donateButton.click();

  await page.waitForTimeout(1000);

  // Approve token spending if needed
  // (first donation requires approval)
  try {
    await metamask.confirmTransaction();
  } catch (error) {
    console.log('No approval needed or already approved');
  }

  // Wait a moment
  await page.waitForTimeout(2000);

  // Confirm donation transaction
  await metamask.confirmTransaction();

  // Wait for success
  await page.waitForSelector(
    'text=/donation successful|thank you|confirmed/i',
    { timeout: 60000 }
  ).catch(() => {
    console.warn('Donation confirmation not found');
  });
}

/**
 * Stake DKT tokens
 */
export async function stakeDKT(
  page: Page,
  metamask: MetaMask,
  amount: string
) {
  await page.goto('/stake');
  await page.waitForLoadState('networkidle');

  // Fill stake amount
  const amountInput = page.locator('input[name="amount"], input[placeholder*="amount" i]').first();
  await amountInput.fill(amount);

  // Click stake button
  const stakeButton = page.getByRole('button', { name: /^stake$/i }).first();
  await stakeButton.click();

  await page.waitForTimeout(1000);

  // Approve tokens if needed
  try {
    await metamask.confirmTransaction();
    await page.waitForTimeout(2000);
  } catch (error) {
    console.log('No approval needed');
  }

  // Confirm stake transaction
  await metamask.confirmTransaction();

  // Wait for confirmation
  await page.waitForSelector(
    'text=/staking successful|staked|confirmed/i',
    { timeout: 60000 }
  ).catch(() => {
    console.warn('Staking confirmation not found');
  });
}

/**
 * Get staked amount from page
 */
export async function getStakedAmount(page: Page): Promise<string> {
  const stakedElement = page.locator('[data-testid="staked-amount"], text=/staked.*\\d+/i').first();
  const text = await stakedElement.textContent();
  return text?.trim() || '0';
}

/**
 * Disconnect wallet
 */
export async function disconnectWallet(page: Page, metamask: MetaMask) {
  // Click on connected address
  const addressButton = page.locator('button:has-text(/0x[a-fA-F0-9]{4}/)');
  await addressButton.click();

  await page.waitForTimeout(500);

  // Look for disconnect button
  const disconnectButton = page.getByRole('button', { name: /disconnect/i });
  if (await disconnectButton.count() > 0) {
    await disconnectButton.click();
  }

  // Disconnect in MetaMask
  await metamask.disconnectWalletFromDapp();
}
