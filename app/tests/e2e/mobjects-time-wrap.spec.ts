import { expect, test } from '@playwright/test';
import { readDebugMobject } from './helpers/ts-scene-debug';

test('mobjects basics starts paused with first frame visible', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/ts-scenes/mobjects_basics/basics_layout');
  await expect(page).toHaveURL('/ts-scenes/mobjects_basics/basics_layout');
  expect(pageErrors).toEqual([]);

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pause' })).toHaveCount(0);

  const stage = page.getByTestId('webgpu-scene-stage');
  await expect(stage).toBeVisible();
  await expect
    .poll(async () => stage.getAttribute('data-renderer'))
    .toMatch(/gpu|webgl/);

  await expect(await readDebugMobject(page, 'title')).not.toBeNull();
  await expect(await readDebugMobject(page, 'square')).not.toBeNull();
  await expect(await readDebugMobject(page, 'circle')).not.toBeNull();

  const timeLabel = page.locator('div.w-32.text-right.text-sm.tabular-nums.text-cyan-300');
  await expect(timeLabel).toContainText('0.00 sec');

  await page.getByRole('button', { name: 'Play' }).click();
  await page.waitForTimeout(250);
  await expect
    .poll(async () => {
      const text = (await timeLabel.textContent()) ?? '0.00 sec';
      const parsed = Number.parseInt(text.replace(/[^\d]/g, ''), 10);
      return Number.isFinite(parsed) ? parsed : 0;
    })
    .toBeGreaterThan(0);
});
