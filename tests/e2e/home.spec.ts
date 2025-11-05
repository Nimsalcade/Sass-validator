import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test('loads and supports mocked auth flow', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('home')).toBeVisible();
    await expect(page.getByTestId('home-title')).toHaveText('Sass Validator');

    await page.getByTestId('email-input').fill('demo@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('sign-in-button').click();

    await expect(page.getByTestId('welcome-message')).toContainText('Demo User');

    await page.getByTestId('sign-out-button').click();

    await expect(page.getByTestId('sign-in-button')).toBeVisible();
  });

  test('shows an error for invalid credentials', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('email-input').fill('someone@example.com');
    await page.getByTestId('password-input').fill('wrong');
    await page.getByTestId('sign-in-button').click();

    await expect(page.getByTestId('error-message')).toHaveText('Invalid email or password');
  });
});
