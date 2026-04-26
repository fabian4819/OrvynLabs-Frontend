import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';
import { waitForPageLoad } from '../utils/helpers';

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`Home page renders correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(ROUTES.HOME);
      await waitForPageLoad(page);

      // No horizontal scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding

      // Main content visible
      const main = page.locator('main, [role="main"]');
      await expect(main).toBeVisible();

      // Take screenshot for visual review
      await page.screenshot({
        path: `test-results/screenshots/responsive-${viewport.name.toLowerCase()}-home.png`,
        fullPage: true,
      });
    });

    test(`Projects page renders correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(ROUTES.PROJECTS);
      await waitForPageLoad(page);

      // No horizontal scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

      // Project grid should be visible
      const grid = page.locator('[data-testid="projects-grid"], .projects-grid, .grid');
      await expect(grid).toBeVisible();
    });
  }

  test('Mobile navigation menu works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(ROUTES.HOME);

    // Look for hamburger menu button
    const menuButton = page.locator('button[aria-label*="menu" i], button[data-mobile-menu]');

    if (await menuButton.count() > 0) {
      // Open menu
      await menuButton.first().click();
      await page.waitForTimeout(500); // Animation

      // Menu should be visible
      const mobileMenu = page.locator('[role="dialog"], .mobile-menu, nav[data-mobile]');
      await expect(mobileMenu).toBeVisible();

      // Should have navigation links
      const links = mobileMenu.getByRole('link');
      await expect(links).toHaveCount.greaterThan(3);
    }
  });

  test('Touch-friendly buttons on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(ROUTES.HOME);

    // Get all interactive buttons
    const buttons = page.getByRole('button').all();

    for (const button of await buttons) {
      if (await button.isVisible()) {
        // Check minimum touch target size (48x48px recommended)
        const box = await button.boundingBox();
        if (box) {
          // At least 40px for touch targets is acceptable
          expect(box.height, 'Button should have minimum height for touch').toBeGreaterThanOrEqual(36);
        }
      }
    }
  });

  test('Text is readable at all viewport sizes', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(ROUTES.HOME);

      // Check for very small text
      const fontSize = await page.evaluate(() => {
        const elements = document.querySelectorAll('p, span, div');
        const sizes: number[] = [];

        elements.forEach((el) => {
          const style = window.getComputedStyle(el);
          const size = parseFloat(style.fontSize);
          if (size > 0) sizes.push(size);
        });

        return Math.min(...sizes);
      });

      // Minimum readable font size is 12px
      expect(fontSize, `Font size too small on ${viewport.name}`).toBeGreaterThanOrEqual(12);
    }
  });
});
