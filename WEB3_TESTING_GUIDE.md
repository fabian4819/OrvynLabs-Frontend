# Web3 Testing Guide with Synpress

Complete guide for running automated Web3 tests with MetaMask integration.

## 🎯 What Can Be Tested

### ✅ Fully Automated with Synpress

- **Wallet Connection**
  - Connect/disconnect MetaMask
  - Switch networks
  - Reject connection requests

- **Project Creation**
  - Fill and submit project forms
  - Add milestones
  - Approve/reject transactions
  - Verify project on blockchain

- **Donations**
  - Donate to projects
  - Token approval flow
  - Transaction confirmations
  - Balance updates

- **Staking**
  - Stake/unstake DKT
  - Claim rewards
  - View staking stats

## 📋 Prerequisites

### 1. Install Dependencies

Already done! Synpress is installed.

### 2. Setup Test Wallet

**⚠️ CRITICAL: Never use a wallet with real funds for testing!**

```bash
# Copy environment template
cp .env.test.example .env.test

# Edit .env.test with your test wallet seed phrase
# Default Hardhat wallet (for local testing):
# test test test test test test test test test test test junk
```

### 3. Fund Test Wallet

Your test wallet needs:
- **Native tokens** (ETH/DChain) for gas fees
- **DKT tokens** for testing donations/staking

**For DChain Testnet:**
1. Get testnet ETH from DChain faucet
2. Mint test DKT tokens (if you have a faucet contract)

**For Local Testing:**
```bash
# Run local Hardhat node
cd ../contracts
npx hardhat node

# In another terminal, deploy contracts
npx hardhat run scripts/deploy.ts --network localhost

# Fund test wallet with tokens
npx hardhat run scripts/fund-test-wallet.ts --network localhost
```

### 4. Update Contract Addresses

After deploying contracts, update `.env.test`:

```bash
NEXT_PUBLIC_DIKTI_TOKEN_ADDRESS="0x..." # Your DiktiToken address
NEXT_PUBLIC_FACTORY_ADDRESS="0x..."     # Your ProjectFactory address
NEXT_PUBLIC_STAKING_ADDRESS="0x..."     # Your Staking contract address
```

## 🚀 Running Web3 Tests

### Run All Web3 Tests

```bash
# Headless mode (default)
pnpm test:web3

# UI mode (interactive, recommended)
pnpm test:web3:ui

# Headed mode (see browser)
pnpm test:web3:headed

# Debug mode
pnpm test:web3:debug
```

### Run Specific Test Suites

```bash
# Only wallet connection tests
pnpm test:web3 01-wallet-connection

# Only project creation tests
pnpm test:web3 02-project-creation

# Only donation tests
pnpm test:web3 03-donations

# Only staking tests
pnpm test:web3 04-staking
```

### Run Specific Tests

```bash
# Run tests matching a pattern
pnpm test:web3 -g "Connect MetaMask"

# Run single test file
pnpm test:web3 e2e/tests/01-wallet-connection.web3.spec.ts
```

## 📊 View Test Results

```bash
# Open HTML report
pnpm test:web3:report
```

Report includes:
- ✅ Passed/failed tests
- 📸 Screenshots of failures
- 🎥 Videos of test runs
- 📝 Transaction hashes
- ⏱️ Execution times

## 🧪 Test Suites Breakdown

### 1. Wallet Connection (`01-wallet-connection.web3.spec.ts`)

Tests wallet connectivity and network switching:

- ✅ Connect MetaMask via RainbowKit
- ✅ Switch to DChain network
- ✅ Wallet persists across navigation
- ✅ Disconnect wallet
- ✅ Display DKT balance
- ✅ Reject connection

**Duration:** ~2-3 minutes

### 2. Project Creation (`02-project-creation.web3.spec.ts`)

Tests full project creation flow:

- ✅ Access create project page
- ✅ Fill project form with milestones
- ✅ Submit and confirm transaction
- ✅ Verify project created on-chain
- ✅ Form validation
- ✅ Cancel creation
- ✅ Reject transaction

**Duration:** ~5-7 minutes
**Gas Required:** High (~800k gas per project)

### 3. Donations (`03-donations.web3.spec.ts`)

Tests donation workflow:

- ✅ Donate to project
- ✅ Token approval flow
- ✅ Amount validation
- ✅ Insufficient balance handling
- ✅ View donation history
- ✅ Cancel donation

**Duration:** ~3-5 minutes
**Requires:** At least one active project

### 4. Staking (`04-staking.web3.spec.ts`)

Tests staking functionality:

- ✅ View staking stats
- ✅ Stake DKT tokens
- ✅ Insufficient balance handling
- ✅ View pending rewards
- ✅ Claim rewards
- ✅ Unstake tokens

**Duration:** ~4-6 minutes
**Requires:** DKT tokens in wallet

## 🔧 Configuration

### Playwright Web3 Config

Located at: `playwright.config.web3.ts`

Key settings:
```typescript
{
  timeout: 120000,        // 2 minutes per test
  workers: 1,             // Sequential (blockchain state)
  actionTimeout: 60000,   // 1 minute for MetaMask
  retries: 2,             // Retry failed tests
}
```

### Test Data

Located at: `e2e/fixtures/test-data.ts`

Customize test values:
```typescript
export const TEST_PROJECT = {
  title: 'E2E Test Project',
  category: 'AI/ML',
  milestones: [...],
};

export const TEST_DONATION = {
  amount: '50', // DKT
};
```

### Network Configuration

Located at: `e2e/fixtures/web3-fixtures.ts`

```typescript
export const DCHAIN_NETWORK = {
  chainId: 2713017997578000,
  chainName: 'DChain Testnet',
  rpcUrl: 'https://dchaintestnet.rpc.caldera.xyz/http',
};
```

## 🐛 Troubleshooting

### MetaMask Not Connecting

**Issue:** Tests fail at wallet connection

**Solutions:**
```bash
# 1. Clear browser cache
rm -rf ~/.cache/ms-playwright

# 2. Reinstall Playwright browsers
npx playwright install --with-deps chromium

# 3. Run in headed mode to see what's happening
pnpm test:web3:headed
```

### Transactions Failing

**Issue:** Transactions reject or timeout

**Checklist:**
- [ ] Wallet has sufficient ETH for gas
- [ ] Wallet has sufficient DKT tokens
- [ ] Contracts are deployed
- [ ] Network RPC is responsive
- [ ] Contract addresses are correct in `.env.test`

**Debug:**
```bash
# Run with debug logs
DEBUG="pw:api" pnpm test:web3:headed

# Check transaction in explorer
# Look for transaction hash in test output
```

### Tests Timeout

**Issue:** Tests take too long and timeout

**Solutions:**
```bash
# 1. Increase timeout in playwright.config.web3.ts
timeout: 180000, // 3 minutes

# 2. Run tests one at a time
pnpm test:web3 -g "specific test name"

# 3. Use faster RPC
# Update NEXT_PUBLIC_RPC_URL in .env.test
```

### Network Issues

**Issue:** Wrong network or can't switch networks

**Solutions:**
1. Manually add DChain to MetaMask first
2. Check `DCHAIN_NETWORK` config matches exactly
3. Ensure chain ID is correct number (not string)

### State Conflicts

**Issue:** Tests fail because of previous test state

**Solution:**
```bash
# Tests run sequentially by default
# If issues persist, add cleanup in afterEach:

test.afterEach(async ({ page }) => {
  // Clean up any leftover state
  await page.evaluate(() => localStorage.clear());
});
```

## 📝 Writing Custom Tests

### Example: Test Custom Feature

```typescript
import { test, expect } from '../fixtures/web3-fixtures';
import { connectWallet, switchToDChain } from '../utils/web3-helpers';

test.describe('My Custom Feature', () => {
  test.beforeEach(async ({ page, context, metamask }) => {
    await page.goto('/');
    await connectWallet(page, metamask);
    await switchToDChain(metamask);
  });

  test('should do something', async ({ page, metamask }) => {
    // Your test logic
    await page.click('button:has-text("My Button")');

    // Confirm transaction
    await metamask.confirmTransaction();

    // Wait for result
    await page.waitForSelector('text=/success/i');

    // Assert
    const result = await page.textContent('.result');
    expect(result).toContain('Expected Value');
  });
});
```

### Helper Functions

Located at: `e2e/utils/web3-helpers.ts`

Available helpers:
- `connectWallet(page, metamask)` - Connect MetaMask
- `switchToDChain(metamask)` - Switch to DChain
- `approveTokenSpending(page, metamask)` - Approve ERC20
- `getDKTBalance(page)` - Get displayed balance
- `navigateToCreateProject(page)` - Navigate to create page
- `fillProjectForm(page, data)` - Fill project form
- `submitProjectCreation(page, metamask)` - Submit project
- `donateToProject(page, metamask, amount)` - Donate
- `stakeDKT(page, metamask, amount)` - Stake tokens

## 🎬 Recording Tests

### Take Screenshots

```typescript
await page.screenshot({
  path: 'test-results/my-screenshot.png',
  fullPage: true,
});
```

### Record Video

Videos are automatically recorded on failure.

To always record:
```typescript
// In playwright.config.web3.ts
use: {
  video: 'on', // or 'retain-on-failure'
}
```

### Trace Files

Enable tracing for detailed debugging:
```typescript
use: {
  trace: 'on', // or 'on-first-retry'
}
```

Then view with:
```bash
npx playwright show-trace trace.zip
```

## 🚦 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Web3 Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd frontend
          pnpm install

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Run Web3 tests
        env:
          TEST_WALLET_SEED: ${{ secrets.TEST_WALLET_SEED }}
          NEXT_PUBLIC_DIKTI_TOKEN_ADDRESS: ${{ secrets.DIKTI_TOKEN_ADDRESS }}
          NEXT_PUBLIC_FACTORY_ADDRESS: ${{ secrets.FACTORY_ADDRESS }}
        run: pnpm test:web3

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-web3
          path: playwright-report-web3/
```

## 📚 Resources

- [Synpress Documentation](https://github.com/Synthetixio/synpress)
- [Playwright Documentation](https://playwright.dev)
- [MetaMask Test Dapp](https://metamask.github.io/test-dapp/)
- [Hardhat Network](https://hardhat.org/hardhat-network/)

## 🎯 Best Practices

1. **Use Test Wallets Only** - Never use real funds
2. **Run Sequentially** - Web3 tests should not run in parallel
3. **Clean State** - Start each test with known state
4. **Generous Timeouts** - Blockchain can be slow
5. **Screenshot Everything** - Capture state on success/failure
6. **Test on Testnet First** - Before running on mainnet
7. **Monitor Gas Usage** - Track costs of operations
8. **Use UI Mode** - Debug faster with visual feedback

---

**Last Updated:** 2026-04-24
