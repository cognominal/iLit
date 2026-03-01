import { expect, test } from '@playwright/test';

test('reset and time-wrap seek are deterministic for mobjects basics', async ({
  page,
}) => {
  await page.goto('/scenes/mobjects_basics/basics_layout');

  await page.getByRole('button', { name: 'Reset' }).click();
  const mode = page.locator('#mode');
  await expect(mode).toHaveValue('normal');

  const title = page.getByTestId('mobjects-title');
  const square = page.getByTestId('mobjects-square');
  const circle = page.getByTestId('mobjects-circle');

  await expect(title).toHaveAttribute('data-progress', '0.000');
  await expect(square).toHaveAttribute('data-progress', '0.000');
  await expect(circle).toHaveAttribute('data-progress', '0.000');

  const slider = page.getByLabel('Time slider');
  await slider.fill('1000');

  await expect(mode).toHaveValue('time-wrap');
  await expect(title).toHaveAttribute('data-progress', '1.000');

  const squareProgress = await square.getAttribute('data-progress');
  expect(squareProgress).not.toBeNull();
  if (squareProgress) {
    const p = Number(squareProgress);
    expect(p).toBeGreaterThan(0.1);
    expect(p).toBeLessThan(0.2);
  }

  await expect(circle).toHaveAttribute('data-progress', '0.000');
});
