import { expect, test } from '@playwright/test';
import { readDebugMobject, waitForStage } from './helpers/ts-scene-debug';

test('axes plotting scene renders ticks, labels, and graph', async ({
  page,
}) => {
  await page.goto('/ts-scenes/axes_graphs_and_plotting/axes_plot?capture=1&autoplay=0');
  await expect(page).toHaveURL(
    '/ts-scenes/axes_graphs_and_plotting/axes_plot?capture=1&autoplay=0'
  );

  await waitForStage(page);

  await expect
    .poll(async () => await readDebugMobject(page, 'graph'))
    .not.toBeNull();

  await expect(await readDebugMobject(page, 'axes_x')).not.toBeNull();
  await expect(await readDebugMobject(page, 'axes_y')).not.toBeNull();
  await expect(await readDebugMobject(page, 'axes_x_tick_-4')).not.toBeNull();
  await expect(await readDebugMobject(page, 'axes_x_label_-4')).not.toBeNull();
  await expect(await readDebugMobject(page, 'axes_y_tick_6')).not.toBeNull();
  await expect(await readDebugMobject(page, 'axes_y_label_6')).not.toBeNull();
  const graph = await readDebugMobject(page, 'graph');
  expect(graph).not.toBeNull();
  expect(graph?.id).toMatch(
    /^app\/src\/lib\/ts-feature-sweep\/ts\/axesGraphsPlotting\.ts:\d+:graph$/
  );
  expect(graph?.sourceRef).toMatchObject({
    file: 'app/src/lib/ts-feature-sweep/ts/axesGraphsPlotting.ts',
    label: 'graph',
  });
  expect(graph?.sourceRef?.line).toBeGreaterThan(0);
});
