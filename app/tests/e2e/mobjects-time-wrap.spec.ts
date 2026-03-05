import { expect, test } from '@playwright/test';

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

  const stage = page.getByRole('img', { name: 'TS scene stage' });
  const title = stage.locator('#title');
  const square = stage.locator('#square');
  const circle = stage.locator('#circle');

  await expect(title).toHaveCount(1);
  await expect(square).toHaveCount(1);
  await expect(circle).toHaveCount(1);

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
