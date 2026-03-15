import { expect, test } from '@playwright/test';

test('gpu sweep route opens GPU preview scenes', async ({ page }) => {
  await page.goto('/gpu-sweep');
  await expect(page).toHaveURL('/gpu-sweep');
  await expect(
    page.getByRole('heading', { name: 'Three.js Feature Sweep' })
  ).toBeVisible();

  await page.getByRole('link', {
    name: '01 Mobjects Basics / Basics Layout'
  }).click();
  await expect(page).toHaveURL('/ts-scenes/mobjects_basics/basics_layout');

  const stage = page.getByRole('img', { name: 'TS scene stage' });
  await expect(stage).toBeVisible();
  await expect
    .poll(async () => stage.getAttribute('data-renderer'))
    .toMatch(/gpu|webgl/);

  await page.goto('/ts-scenes/text_math_tex/text_math');
  await expect(page).toHaveURL('/ts-scenes/text_math_tex/text_math');
  const gpuStage = page.getByRole('img', { name: 'TS scene stage' });
  await expect
    .poll(async () => gpuStage.getAttribute('data-renderer'))
    .toMatch(/gpu|webgl/);
});
