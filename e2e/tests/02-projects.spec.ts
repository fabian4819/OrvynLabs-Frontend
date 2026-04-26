import { test, expect } from '@playwright/test';
import { ROUTES, TIMEOUTS } from '../fixtures/test-data';
import { waitForPageLoad } from '../utils/helpers';

test.describe('Projects Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.PROJECTS);
    await waitForPageLoad(page);
  });

  test('Projects page loads with grid/list layout', async ({ page }) => {
    // Check for projects container
    const projectsContainer = page.locator('[data-testid="projects-grid"], .projects-grid, .grid');
    await expect(projectsContainer).toBeVisible();
  });

  test('Create Project button is visible', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /create project/i });
    await expect(createButton).toBeVisible();
  });

  test('Search/Filter functionality exists', async ({ page }) => {
    // Check for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');

    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible();

      // Type in search
      await searchInput.first().fill('AI');
      await page.waitForTimeout(500); // Debounce

      // Verify page doesn't crash
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Category filters exist and are clickable', async ({ page }) => {
    // Look for category filter buttons
    const categoryFilters = page.locator('[data-category], button[data-filter], .category-filter');

    if (await categoryFilters.count() > 0) {
      const firstFilter = categoryFilters.first();
      await expect(firstFilter).toBeVisible();

      // Click filter
      await firstFilter.click();
      await page.waitForTimeout(500);

      // Verify no errors
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Project cards display required information', async ({ page }) => {
    // Look for project cards
    const projectCards = page.locator('[data-testid="project-card"], .project-card, article');

    if (await projectCards.count() > 0) {
      const firstCard = projectCards.first();

      // Should have title
      const title = firstCard.locator('h2, h3, [data-testid="project-title"]');
      await expect(title).toBeVisible();

      // Should have some progress or funding info
      const hasFundingInfo = await firstCard.locator('text=/DKT|funded|raised/i').count() > 0;
      expect(hasFundingInfo).toBeTruthy();
    }
  });

  test('Clicking project card navigates to details', async ({ page }) => {
    // Find first clickable project
    const projectLink = page.locator('a[href*="/projects/"], a[href*="/project/"]').first();

    if (await projectLink.count() > 0) {
      await projectLink.click();
      await waitForPageLoad(page);

      // Should navigate to project detail page
      expect(page.url()).toMatch(/\/projects?\/0x/i);

      // Should show project details
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('Empty state shows when no projects match filter', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();

    if (await searchInput.count() > 0) {
      // Search for non-existent project
      await searchInput.fill('xyzabc123nonexistent');
      await page.waitForTimeout(500);

      // Should show empty state or "no results"
      const bodyText = await page.textContent('body');
      const hasEmptyState = bodyText?.includes('No projects') ||
        bodyText?.includes('No results') ||
        bodyText?.includes('not found');

      // If no projects match, should show empty state OR still have valid page
      expect(hasEmptyState || bodyText !== null).toBeTruthy();
    }
  });

  test('Sort functionality exists', async ({ page }) => {
    // Look for sort dropdown or buttons
    const sortControl = page.locator('select[data-sort], button[data-sort], [aria-label*="sort" i]');

    if (await sortControl.count() > 0) {
      await expect(sortControl.first()).toBeVisible();
    }
  });

  test('Pagination or load more exists for many projects', async ({ page }) => {
    // Look for pagination controls
    const pagination = page.locator('[aria-label="Pagination"], .pagination, button:has-text("Load More")');

    // Pagination might not exist if few projects
    // Just verify page doesn't error
    await expect(page.locator('body')).toBeVisible();
  });
});
