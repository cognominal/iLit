import { expect, test } from '@playwright/test';

test('images svg scene uses the sample asset success path', async ({
  page,
}) => {
  await page.goto('/ts-scenes/images_svg_and_assets/assets_demo');
  await expect(page).toHaveURL('/ts-scenes/images_svg_and_assets/assets_demo');

  const stage = page.getByRole('img', { name: 'TS scene stage' });
  await expect(stage).toBeVisible();

  await page.getByRole('button', { name: 'Reset' }).click();

  const icon = stage.locator('#icon');
  await expect(icon).toHaveCount(1);
  await expect(icon).toHaveAttribute('href', '/assets/sample.svg');
  await expect(stage.locator('#fallback')).toHaveCount(0);
});
