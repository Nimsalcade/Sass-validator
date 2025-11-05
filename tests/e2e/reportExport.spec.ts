import { test, expect } from '@playwright/test';

test.describe('Report Export', () => {
  test('should display export button after login', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.getByTestId('email-input');
    const passwordInput = page.getByTestId('password-input');
    const signInButton = page.getByTestId('sign-in-button');

    await emailInput.fill('demo@example.com');
    await passwordInput.fill('password123');
    await signInButton.click();

    await expect(page.getByTestId('welcome-message')).toBeVisible();
    await expect(page.getByTestId('report-section')).toBeVisible();
    await expect(page.getByTestId('export-button')).toBeVisible();
  });

  test('export button should have correct text', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('email-input').fill('demo@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('sign-in-button').click();

    await expect(page.getByTestId('export-button')).toHaveText('Export PDF Report');
  });
});
