# E2E Testing with Playwright

Automated end-to-end tests for the Orvyn-Labs DApp using Playwright.

## 🎯 Two Testing Modes

### 1. **UI Tests** (No Wallet - Fast)
Tests frontend functionality without blockchain:
- Navigation, responsive design, accessibility
- ⚡ Fast (~1-2 minutes)
- ✅ No wallet or funds needed

### 2. **Web3 Tests** (With MetaMask - Complete)
Tests full blockchain interactions:
- Wallet connection, transactions, smart contracts
- ⏱️ Slower (~15-20 minutes)
- 💰 Requires test wallet with funds

> **See [WEB3_TESTING_GUIDE.md](../WEB3_TESTING_GUIDE.md) for Web3 testing**

---

## 🚀 Quick Start - UI Tests

```bash
# Run all E2E tests (headless)
pnpm test:e2e

# Run with UI mode (interactive)
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Debug specific test
pnpm test:e2e:debug

# View test report
pnpm test:e2e:report
```

## 📁 Test Structure

```
e2e/
├── tests/
│   ├── 01-navigation.spec.ts    # Navigation & page loads
│   ├── 02-projects.spec.ts      # Projects browsing & filtering
│   ├── 03-responsive.spec.ts    # Responsive design checks
│   └── 04-accessibility.spec.ts # Accessibility tests
├── fixtures/
│   └── test-data.ts             # Test data constants
├── utils/
│   └── helpers.ts               # Helper functions
└── README.md                    # This file
```

## 🧪 What's Tested

### ✅ Current Tests (No Wallet Required)

1. **Navigation** (`01-navigation.spec.ts`)
   - All pages load successfully
   - No 404 errors
   - Navbar and footer present
   - Connect wallet button visible
   - Dark theme toggle works
   - No console errors

2. **Projects** (`02-projects.spec.ts`)
   - Projects page renders
   - Create button visible
   - Search/filter functionality
   - Category filters work
   - Project cards display correctly
   - Navigation to project details

3. **Responsive Design** (`03-responsive.spec.ts`)
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)
   - No horizontal scroll
   - Touch-friendly buttons
   - Readable text sizes

4. **Accessibility** (`04-accessibility.spec.ts`)
   - Proper document structure
   - Keyboard navigation
   - Images have alt text
   - Form inputs have labels
   - Buttons have accessible names
   - Color contrast checks

### 🔮 Future Tests (Require Wallet Integration)

These tests are documented in `/E2E_TESTING_GUIDE.md` but require real wallet or mocking:

- Wallet connection flow
- Creating projects
- Donating to projects
- Staking DKT
- Milestone voting
- Claiming rewards/refunds

## 🛠️ Configuration

See `playwright.config.ts` for:
- Base URL: `http://localhost:3000`
- Timeouts: 60s per test, 30s for actions
- Screenshots: On failure only
- Video: Retained on failure
- Reporters: HTML, List, JSON

## 📝 Writing Tests

### Example Test

```typescript
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';
import { waitForPageLoad } from '../utils/helpers';

test('My test name', async ({ page }) => {
  await page.goto(ROUTES.HOME);
  await waitForPageLoad(page);

  const heading = page.getByRole('heading', { name: /welcome/i });
  await expect(heading).toBeVisible();
});
```

### Best Practices

1. **Use test data fixtures** - Import from `fixtures/test-data.ts`
2. **Use helper functions** - Import from `utils/helpers.ts`
3. **Wait for page load** - Always use `waitForPageLoad()` after navigation
4. **Use semantic selectors** - Prefer `getByRole`, `getByText` over CSS selectors
5. **Avoid hardcoded waits** - Use `waitForSelector` instead of `waitForTimeout`
6. **Test user flows, not implementation** - Focus on what users do

## 🔍 Debugging Failed Tests

```bash
# Run specific test file
pnpm test:e2e tests/01-navigation.spec.ts

# Run specific test
pnpm test:e2e -g "Home page loads"

# Debug mode (opens inspector)
pnpm test:e2e:debug

# Run headed (see browser)
pnpm test:e2e:headed
```

### View Test Results

After running tests:

```bash
pnpm test:e2e:report
```

This opens an HTML report with:
- Test results
- Screenshots of failures
- Videos of failures
- Trace files for debugging

## 🚧 Adding Wallet Tests

To test blockchain interactions, you'll need:

1. **Synpress** - Playwright + MetaMask integration
   ```bash
   pnpm add -D @synthetixio/synpress
   ```

2. **Test wallet with funds** - Use Hardhat local node or testnet

3. **Example wallet test**:
   ```typescript
   test('Connect wallet and create project', async ({ page, metamask }) => {
     await page.goto(ROUTES.HOME);

     // Connect MetaMask
     await page.click('button:has-text("Connect Wallet")');
     await metamask.connectToDapp();

     // Verify connected
     await expect(page.locator('nav')).toContainText('0x');
   });
   ```

See `/E2E_TESTING_GUIDE.md` for detailed manual wallet testing workflows.

## 📊 CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Install dependencies
  run: pnpm install

- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: pnpm test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
```

## 🎯 Test Coverage Goals

| Area | Current | Target |
|------|---------|--------|
| Navigation | ✅ 100% | 100% |
| Projects (UI) | ✅ 80% | 90% |
| Responsive | ✅ 100% | 100% |
| Accessibility | ✅ 70% | 90% |
| Wallet Flow | ❌ 0% | 80% |
| Staking Flow | ❌ 0% | 80% |
| Milestone Flow | ❌ 0% | 80% |

## 🐛 Common Issues

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Tests timeout
- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Check network connectivity

### Screenshots missing
- Check `test-results/` directory
- Ensure `screenshot: 'only-on-failure'` in config

## 📚 Resources

- [Playwright Docs](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Web3 Testing with Synpress](https://github.com/Synthetixio/synpress)

---

**Last Updated**: 2026-04-24
