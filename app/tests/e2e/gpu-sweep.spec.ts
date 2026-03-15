import { expect, test } from '@playwright/test';
import { waitForStage } from './helpers/ts-scene-debug';

test('gpu sweep route opens GPU preview scenes', async ({ page }) => {
  test.slow();
  await page.goto('/gpu-sweep');
  await expect(page).toHaveURL('/gpu-sweep');
  await expect(
    page.getByRole('heading', { name: 'Three.js Feature Sweep' })
  ).toBeVisible();

  const basicsLink = page.getByRole('link', {
    name: '01 Mobjects Basics / Basics Layout'
  });
  await expect(basicsLink).toBeVisible();
  const basicsHref = await basicsLink.getAttribute('href');
  expect(basicsHref).toBe('/ts-scenes/mobjects_basics/basics_layout');
  const captureHref = `${basicsHref!}?capture=1&autoplay=0`;
  await page.goto(captureHref);
  await expect(page).toHaveURL(captureHref);

  await waitForStage(page);

  await page.goto('/ts-scenes/text_math_tex/text_math?capture=1&autoplay=0');
  await expect(page).toHaveURL('/ts-scenes/text_math_tex/text_math?capture=1&autoplay=0');
  await waitForStage(page);
});
