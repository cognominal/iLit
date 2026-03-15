import { expect, test } from '@playwright/test';
import { readDebugMobject } from './helpers/ts-scene-debug';

test('axes plotting scene renders ticks, labels, and graph', async ({
  page,
}) => {
  await page.goto('/ts-scenes/axes_graphs_and_plotting/axes_plot');
  await expect(page).toHaveURL('/ts-scenes/axes_graphs_and_plotting/axes_plot');

  const stage = page.getByRole('img', { name: 'TS scene stage' });
  await expect(stage).toBeVisible();
  await expect
    .poll(async () => stage.getAttribute('data-renderer'))
    .toMatch(/gpu|webgl/);

  await page.getByRole('button', { name: 'Reset' }).click();

  await expect(await readDebugMobject(page, 'axes_x')).not.toBeNull();
  await expect(await readDebugMobject(page, 'axes_y')).not.toBeNull();
  await expect(await readDebugMobject(page, 'axes_x_tick_-4')).not.toBeNull();
  await expect(await readDebugMobject(page, 'axes_x_label_-4')).not.toBeNull();
  await expect(await readDebugMobject(page, 'axes_y_tick_6')).not.toBeNull();
  await expect(await readDebugMobject(page, 'axes_y_label_6')).not.toBeNull();
  await expect(await readDebugMobject(page, 'graph')).not.toBeNull();
});
