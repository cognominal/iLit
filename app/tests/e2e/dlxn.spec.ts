import { expect, test } from '@playwright/test';

test('dlxn route uses adapter metadata and updates active row with controls', async ({
  page,
}) => {
  await page.goto('/dlxn');

  await expect(page.getByRole('heading', { name: 'DLXn (manim-api scaffold)' })).toBeVisible();
  await expect(
    page.getByText('Step 3 route: phase-based timing and parity primitives')
  ).toBeVisible();

  await expect(page.getByText('active row: none')).toBeVisible();
  await expect(page.locator('p:has-text("label:")')).toBeVisible();

  const activeRow = page.locator('p:has-text("active row:")');
  for (let i = 0; i < 20; i += 1) {
    const text = await activeRow.textContent();
    if (text && !text.includes('none')) break;
    await page.getByRole('button', { name: 'Next' }).click();
  }

  await expect(activeRow).not.toContainText('none');
  await expect(page.locator('p:has-text("label:")')).toContainText('search-phase');
  await expect(page.locator('p:has-text("note:")')).toContainText('Active row');
  await expect(page.getByRole('img', { name: 'TS scene stage' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Python (.py) Compare' })
  ).toBeVisible();
  await expect(page.getByText('Marker coverage:')).toBeVisible();

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByText('active row: none')).toBeVisible();
});
