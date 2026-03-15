import { expect, test } from '@playwright/test';
import { readDebugMobject, waitForStage } from './helpers/ts-scene-debug';

test('images svg scene uses the sample asset success path', async ({
  page,
}) => {
  test.slow();
  const assetLoaded = page.waitForResponse((response) =>
    response.url().endsWith('/assets/sample.svg') &&
      response.status() === 200
  );

  await page.goto('/ts-scenes/images_svg_and_assets/assets_demo');
  await expect(page).toHaveURL('/ts-scenes/images_svg_and_assets/assets_demo');

  const stage = await waitForStage(page);
  await assetLoaded;

  const icon = await readDebugMobject(page, 'icon');
  expect(icon).not.toBeNull();
  expect(icon?.svgHref).toBe('/assets/sample.svg');
  expect(await stage.getAttribute('data-renderer')).not.toBe('error');
});
