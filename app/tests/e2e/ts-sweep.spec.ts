import { expect, test } from '@playwright/test';
import { readDebugMobject, waitForStage } from './helpers/ts-scene-debug';

test('ts sweep route and ts scene rendering work from top nav', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'ts sweep' }).click();
  await expect(page).toHaveURL('/ts-sweep');
  await expect(
    page.getByRole('heading', { name: 'TS-Based Feature Sweep' })
  ).toBeVisible();
  await expect(
    page.getByText('TS scenes')
  ).toHaveCount(1);

  const goldenLink = page.getByRole('link', {
    name: '15 Regression Golden Frames / Golden Seed'
  });
  await expect(goldenLink).toBeVisible();
  const goldenHref = await goldenLink.getAttribute('href');
  expect(goldenHref).toBe('/ts-scenes/regression_golden_frames/golden_seed');
  await page.goto(goldenHref!);
  await expect(page).toHaveURL(goldenHref!);

  await page.goto('/ts-scenes/mobjects_basics/basics_layout');
  await expect(page).toHaveURL('/ts-scenes/mobjects_basics/basics_layout');

  await waitForStage(page);

  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pause' })).toHaveCount(0);

  const mode = page.locator('#mode');

  await page.getByRole('button', { name: 'Reset' }).click({ force: true });
  await expect(mode).toHaveValue('normal');
  await expect(await readDebugMobject(page, 'title')).not.toBeNull();
  await expect(await readDebugMobject(page, 'square')).not.toBeNull();
  await expect(await readDebugMobject(page, 'circle')).not.toBeNull();
});
