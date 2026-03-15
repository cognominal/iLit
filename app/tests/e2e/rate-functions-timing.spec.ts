import { expect, test, type Page } from '@playwright/test';
import { readDebugMobject } from './helpers/ts-scene-debug';

async function setSliderValue(page: Page, value: number): Promise<void> {
  const slider = page.getByRole('slider', { name: 'Time slider' });
  await slider.evaluate((node, nextValue) => {
    const input = node as HTMLInputElement;
    input.value = String(nextValue);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function dotX(page: Page): Promise<number> {
  const dot = await readDebugMobject(page, 'dot');
  return dot?.x ?? Number.NaN;
}

test('rate function scene goes out and back over the animation', async ({
  page,
}) => {
  await page.goto('/ts-scenes/rate_functions_and_timing/timing_demo');
  await expect(page).toHaveURL(
    '/ts-scenes/rate_functions_and_timing/timing_demo'
  );

  const stage = page.getByRole('img', { name: 'TS scene stage' });
  const timeLabel = page.locator(
    'div.w-32.text-right.text-sm.tabular-nums.text-cyan-300'
  );

  await expect(stage).toBeVisible();
  await expect
    .poll(async () => stage.getAttribute('data-renderer'))
    .toMatch(/gpu|webgl/);
  await expect(await readDebugMobject(page, 'dot')).not.toBeNull();

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(timeLabel).toContainText('0.00 sec');

  const startX = await dotX(page);

  await setSliderValue(page, 1);
  await expect(timeLabel).toContainText('1.00 sec');
  await expect.poll(() => dotX(page)).toBeGreaterThan(startX + 150);
  const midX = await dotX(page);

  await setSliderValue(page, 2);
  await expect(timeLabel).toContainText('2.00 sec');
  await expect.poll(() => dotX(page)).toBeLessThan(startX + 5);
  const endX = await dotX(page);

  expect(Number.isFinite(startX)).toBe(true);
  expect(Number.isFinite(midX)).toBe(true);
  expect(Number.isFinite(endX)).toBe(true);
  expect(midX).toBeGreaterThan(startX + 150);
  expect(Math.abs(endX - startX)).toBeLessThan(5);
});
