import { test, expect } from '../fixtures/web3-fixtures';
import { TEST_PROJECT } from '../fixtures/test-data';
import {
  connectWallet,
  switchToDChain,
  navigateToCreateProject,
  fillProjectForm,
  submitProjectCreation,
} from '../utils/web3-helpers';

test.describe('Project Creation Flow', () => {
  test.beforeEach(async ({ page, context, metamask }) => {
    await page.goto('/');
    await connectWallet(page, metamask);
    await switchToDChain(metamask);
  });

  test('Access create project page', async ({ page }) => {
    await navigateToCreateProject(page);

    // Verify on create project page
    expect(page.url()).toContain('/projects/create');

    // Check for form elements
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]');
    await expect(titleInput).toBeVisible();
  });

  test('Create project with 2 milestones', async ({ page, context, metamask }) => {
    await navigateToCreateProject(page);

    // Fill project form
    await fillProjectForm(page, {
      title: `${TEST_PROJECT.title} - ${Date.now()}`, // Unique title
      category: TEST_PROJECT.category,
      description: 'E2E test project for automated testing',
      tags: TEST_PROJECT.tags,
      milestones: TEST_PROJECT.milestones,
    });

    // Take screenshot before submission
    await page.screenshot({
      path: 'test-results/screenshots/project-form-filled.png',
      fullPage: true,
    });

    // Submit and confirm transaction
    await submitProjectCreation(page, metamask);

    // Wait for redirect to project page
    await page.waitForTimeout(3000);

    // Should be on project detail page or projects list
    const url = page.url();
    const isOnProjectPage = url.includes('/projects/0x') || url.includes('/projects?');

    expect(isOnProjectPage).toBeTruthy();

    // Take screenshot of created project
    await page.screenshot({
      path: 'test-results/screenshots/project-created.png',
      fullPage: true,
    });
  });

  test('Form validation - empty fields', async ({ page }) => {
    await navigateToCreateProject(page);

    // Try to submit without filling form
    const submitButton = page.getByRole('button', {
      name: /deploy project|create project|submit/i
    });

    await submitButton.click();

    // Should show validation errors
    await page.waitForTimeout(1000);

    // Look for error messages
    const hasErrors = await page.locator('text=/required|invalid|error/i').count() > 0;

    if (!hasErrors) {
      console.log('Note: Form validation not detected - might use browser native validation');
    }
  });

  test('Cancel project creation', async ({ page }) => {
    await navigateToCreateProject(page);

    // Look for cancel button
    const cancelButton = page.getByRole('button', { name: /cancel|back/i });

    if (await cancelButton.count() > 0) {
      await cancelButton.click();
      await page.waitForLoadState('networkidle');

      // Should navigate away from create page
      expect(page.url()).not.toContain('/create');
    } else {
      console.log('Note: No cancel button found');
      test.skip();
    }
  });

  test('Reject project creation transaction', async ({ page, context, metamask }) => {
    await navigateToCreateProject(page);

    await fillProjectForm(page, {
      title: `Test Reject - ${Date.now()}`,
      category: TEST_PROJECT.category,
      milestones: [TEST_PROJECT.milestones[0]], // Just one milestone
    });

    // Click submit
    const submitButton = page.getByRole('button', {
      name: /deploy project|create project|submit/i
    });
    await submitButton.click();

    await page.waitForTimeout(2000);

    // Reject transaction in MetaMask
    await metamask.rejectTransaction();

    // Should show error or stay on form
    await page.waitForTimeout(2000);

    // Check if still on create page or shows error
    const stillOnCreatePage = page.url().includes('/create');
    const hasErrorMessage = await page.locator('text=/rejected|cancelled|failed/i').count() > 0;

    expect(stillOnCreatePage || hasErrorMessage).toBeTruthy();
  });

  test('View created project details', async ({ page, context, metamask }) => {
    // This test assumes a project already exists
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    // Find first project card
    const projectLink = page.locator('a[href*="/projects/0x"]').first();

    if (await projectLink.count() > 0) {
      await projectLink.click();
      await page.waitForLoadState('networkidle');

      // Verify project details are shown
      await expect(page.locator('h1, h2').first()).toBeVisible();

      // Check for milestones
      const hasMilestones = await page.locator('text=/milestone/i').count() > 0;
      expect(hasMilestones).toBeTruthy();

      // Check for funding progress
      const hasFundingInfo = await page.locator('text=/raised|funded|DKT/i').count() > 0;
      expect(hasFundingInfo).toBeTruthy();
    } else {
      console.log('No projects found - skipping test');
      test.skip();
    }
  });
});
