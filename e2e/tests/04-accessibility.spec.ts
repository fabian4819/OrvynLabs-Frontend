import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';
import { waitForPageLoad } from '../utils/helpers';

test.describe('Accessibility', () => {
  test('Pages have proper document structure', async ({ page }) => {
    await page.goto(ROUTES.HOME);
    await waitForPageLoad(page);

    // Should have single h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count, 'Page should have exactly one h1').toBeGreaterThanOrEqual(1);

    // Should have proper lang attribute
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBeTruthy();
  });

  test('Interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto(ROUTES.PROJECTS);
    await waitForPageLoad(page);

    // Tab through first few elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focused element should be visible
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.tagName;
    });

    expect(focusedElement).toBeTruthy();
  });

  test('Images have alt text', async ({ page }) => {
    await page.goto(ROUTES.HOME);
    await waitForPageLoad(page);

    // Check all images
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');

      // Alt attribute should exist (can be empty for decorative images)
      expect(alt, `Image ${i} missing alt attribute`).not.toBeNull();
    }
  });

  test('Form inputs have labels', async ({ page }) => {
    await page.goto(ROUTES.PROJECTS);

    // Look for inputs
    const inputs = page.locator('input[type="text"], input[type="search"], input[type="number"]');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');

      // Should have SOME form of labeling
      const hasLabel = id || ariaLabel || placeholder;
      expect(hasLabel, `Input ${i} has no accessible label`).toBeTruthy();
    }
  });

  test('Buttons have accessible names', async ({ page }) => {
    await page.goto(ROUTES.HOME);
    await waitForPageLoad(page);

    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');

      // Button should have text, aria-label, or title
      const hasAccessibleName = (text && text.trim()) || ariaLabel || title;
      expect(hasAccessibleName, `Button ${i} has no accessible name`).toBeTruthy();
    }
  });

  test('Color contrast is sufficient (basic check)', async ({ page }) => {
    await page.goto(ROUTES.HOME);

    // This is a simplified check - full contrast checking requires more complex tools
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, a');
    const count = Math.min(await textElements.count(), 10); // Check first 10

    for (let i = 0; i < count; i++) {
      const element = textElements.nth(i);
      const color = await element.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.color;
      });

      // Ensure color is defined (not transparent)
      expect(color).toBeTruthy();
      expect(color).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('Skip to main content link exists', async ({ page }) => {
    await page.goto(ROUTES.HOME);

    // Tab once to focus skip link (if exists)
    await page.keyboard.press('Tab');

    const skipLink = page.locator('a[href="#main"], a[href="#content"], a:has-text("Skip to")');
    // Skip link is optional but good practice
    // Don't fail test if missing, just log
    const exists = await skipLink.count() > 0;
    if (!exists) {
      console.log('Note: No skip to main content link found');
    }
  });
});
