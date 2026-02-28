import { expect, test } from '@playwright/test';

test('preview sequence advances with Next and highlights matching row/cells', async ({
  page,
}) => {
  await page.goto('/?test=1');

  await expect(page.getByTestId('step-label')).toContainText('Idle');

  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByTestId('step-label')).toContainText('Preview A_h_r0');
  await expect(page.getByTestId('row-A_h_r0')).toHaveClass(/active-row/);
  await expect(page.getByTestId('board-c00')).toHaveClass(/board-active/);
  await expect(page.getByTestId('board-c01')).toHaveClass(/board-active/);
  await expect(page.getByTestId('board-c10')).not.toHaveClass(/board-active/);
  await expect(page.getByTestId('board-c11')).not.toHaveClass(/board-active/);

  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByTestId('step-label')).toContainText('Preview A_h_r1');
  await expect(page.getByTestId('row-A_h_r1')).toHaveClass(/active-row/);
  await expect(page.getByTestId('board-c10')).toHaveClass(/board-active/);
  await expect(page.getByTestId('board-c11')).toHaveClass(/board-active/);
});
