import { expect, test } from '@playwright/test';

test('ts sweep route and ts scene rendering work from top nav', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'ts sweep' }).click();
  await expect(page).toHaveURL('/ts-sweep');
  await expect(
    page.getByRole('heading', { name: 'TS-Based Feature Sweep' })
  ).toBeVisible();

  await page
    .getByRole('link', { name: '01 Mobjects Basics / Basics Layout' })
    .click();
  await expect(page).toHaveURL('/ts-scenes/mobjects_basics/basics_layout');

  const stage = page.getByRole('img', { name: 'TS scene stage' });
  await expect(stage).toBeVisible();

  const title = stage.locator('#title');
  const square = stage.locator('#square');
  const circle = stage.locator('#circle');

  await expect(title).toHaveCount(0);
  await expect(square).toHaveCount(0);
  await expect(circle).toHaveCount(0);

  await page.getByLabel('Timeline').fill('720');
  await expect(title).toHaveCount(1);
  await expect(square).toHaveCount(0);
  await expect(circle).toHaveCount(0);

  await page.getByLabel('Timeline').fill('850');
  await expect(title).toHaveCount(1);
  await expect(square).toHaveCount(0);
  await expect(circle).toHaveCount(0);

  await page.getByLabel('Timeline').fill('1700');
  await expect(square).toHaveCount(1);
  await expect(circle).toHaveCount(0);

  await page.getByLabel('Timeline').fill('2550');
  await expect(circle).toHaveCount(1);
});
