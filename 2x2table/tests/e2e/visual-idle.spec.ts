import { expect, test } from '@playwright/test';

test('idle visual snapshot', async ({ page }) => {
  await page.goto('/?test=1');
  await expect(page.getByTestId('matrix-table')).toBeVisible();
  await expect(page).toHaveScreenshot('idle.png', {
    fullPage: true,
  });
});
