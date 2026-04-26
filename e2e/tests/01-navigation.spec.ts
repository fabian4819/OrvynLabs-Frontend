import { test, expect } from '@playwright/test';
import { ROUTES, TIMEOUTS } from '../fixtures/test-data';
import { waitForPageLoad, collectConsoleErrors, assertNoConsoleErrors } from '../utils/helpers';

test.describe('Navigation & Page Loads', () => {
  let consoleErrors: string[];

  test.beforeEach(async ({ page }) => {
    consoleErrors = collectConsoleErrors(page);
  });

  test('Home page loads successfully', async ({ page }) => {
    await page.goto(ROUTES.HOME);
    await waitForPageLoad(page);

    // Check page title or heading
    await expect(page).toHaveTitle(/Orvyn|DChain|Crowdfunding/i);

    // Check that main content is visible
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();

    // Verify no critical console errors
    assertNoConsoleErrors(page, consoleErrors);
  });

  test('All main routes are accessible', async ({ page }) => {
    const routes = [
      { path: ROUTES.HOME, expectedText: '' }, // Home
      { path: ROUTES.PROJECTS, expectedText: 'Projects' },
      { path: ROUTES.STAKE, expectedText: 'Stake' },
      { path: ROUTES.ANALYTICS, expectedText: 'Analytics' },
      { path: ROUTES.LEADERBOARD, expectedText: 'Leaderboard' },
      { path: ROUTES.HISTORY, expectedText: 'History' },
      { path: ROUTES.FAVORITES, expectedText: 'Favorites' },
      { path: ROUTES.HELP, expectedText: 'Help' },
    ];

    for (const route of routes) {
      await page.goto(route.path, { timeout: TIMEOUTS.PAGE_LOAD });
      await waitForPageLoad(page);

      // Should not be 404
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('404');
      expect(bodyText).not.toContain('Not Found');

      // Check for expected content if specified
      if (route.expectedText) {
        expect(bodyText).toContain(route.expectedText);
      }
    }
  });

  test('Navbar is present on all pages', async ({ page }) => {
    await page.goto(ROUTES.HOME);

    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();

    // Common navbar elements
    await expect(navbar.getByRole('link')).toHaveCount.greaterThan(3);
  });

  test('Footer is present on pages', async ({ page }) => {
    await page.goto(ROUTES.HOME);

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('Connect Wallet button is visible', async ({ page }) => {
    await page.goto(ROUTES.HOME);

    // Look for connect button (various possible texts)
    const connectButton = page.getByRole('button', {
      name: /connect|wallet/i,
    });

    await expect(connectButton.first()).toBeVisible();
  });

  test('Dark theme toggle works', async ({ page }) => {
    await page.goto(ROUTES.HOME);

    // Look for theme toggle button
    const themeToggle = page.locator('[aria-label*="theme" i], [data-theme-toggle]');

    if (await themeToggle.isVisible()) {
      // Check initial state
      const htmlElement = page.locator('html');
      const initialClass = await htmlElement.getAttribute('class');

      // Toggle theme
      await themeToggle.click();
      await page.waitForTimeout(500); // Animation

      // Verify class changed
      const newClass = await htmlElement.getAttribute('class');
      expect(newClass).not.toBe(initialClass);
    } else {
      test.skip();
    }
  });

  test('Breadcrumbs or back navigation exists on subpages', async ({ page }) => {
    await page.goto(ROUTES.ANALYTICS);

    // Check for breadcrumbs or back button
    const hasBreadcrumbs = await page.locator('[aria-label="Breadcrumb"], .breadcrumb').count() > 0;
    const hasBackButton = await page.getByRole('link', { name: /back|home/i }).count() > 0;

    expect(hasBreadcrumbs || hasBackButton).toBeTruthy();
  });
});
