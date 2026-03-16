import { expect, test } from '@playwright/test';
import {
  readDebugMobject,
  readSceneDebug,
  waitForStage
} from './helpers/ts-scene-debug';

test('mobjects basics starts paused with first frame visible', async ({
  page,
}) => {
  test.slow();
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/ts-scenes/mobjects_basics/basics_layout');
  await expect(page).toHaveURL('/ts-scenes/mobjects_basics/basics_layout');
  expect(pageErrors).toEqual([]);

  await page.getByRole('button', { name: 'Reset' }).click({ force: true });
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pause' })).toHaveCount(0);

  const stage = await waitForStage(page);

  await expect(await readDebugMobject(page, 'title')).not.toBeNull();
  const square = await readDebugMobject(page, 'square');
  const circle = await readDebugMobject(page, 'circle');
  expect(square).not.toBeNull();
  expect(circle).not.toBeNull();
  expect(square?.id).toMatch(
    /^app\/src\/lib\/ts-feature-sweep\/ts\/mobjectsBasics\.ts:\d+:square$/
  );
  expect(square?.sourceRef).toMatchObject({
    file: 'app/src/lib/ts-feature-sweep/ts/mobjectsBasics.ts',
    label: 'square',
  });
  expect(square?.sourceRef?.line).toBeGreaterThan(0);
  expect(circle?.id).toMatch(
    /^app\/src\/lib\/ts-feature-sweep\/ts\/mobjectsBasics\.ts:\d+:circle$/
  );

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

test('mobjects basics routes pointer events through retained objects', async ({
  page,
}) => {
  test.slow();
  await page.goto('/ts-scenes/mobjects_basics/basics_layout');
  await expect(page).toHaveURL('/ts-scenes/mobjects_basics/basics_layout');

  await page.getByRole('button', { name: 'Reset' }).click({ force: true });
  await page.getByRole('button', { name: 'go to line' }).click();
  await expect(page.getByRole('button', { name: 'inactive' })).toBeVisible();
  const stage = await waitForStage(page);

  const square = await readDebugMobject(page, 'square');
  const circle = await readDebugMobject(page, 'circle');
  expect(square?.x).toBeDefined();
  expect(square?.y).toBeDefined();
  expect(circle?.x).toBeDefined();
  expect(circle?.y).toBeDefined();

  const box = await stage.boundingBox();
  expect(box).not.toBeNull();
  const toClientPoint = (x: number, y: number) => ({
    x: box!.x + (x / 1137.7777777777778) * box!.width,
    y: box!.y + (y / 640) * box!.height
  });

  const squarePoint = toClientPoint(square?.x ?? 0, square?.y ?? 0);
  await page.mouse.move(squarePoint.x, squarePoint.y);
  await expect
    .poll(async () => stage.getAttribute('data-hover-mobject-id'))
    .toMatch(/:square$/);
  await expect
    .poll(async () => stage.evaluate((node) => getComputedStyle(node).cursor))
    .toBe('help');

  const circlePoint = toClientPoint(circle?.x ?? 0, circle?.y ?? 0);
  await page.mouse.move(circlePoint.x, circlePoint.y);
  await expect
    .poll(async () => stage.getAttribute('data-hover-mobject-id'))
    .toMatch(/:circle$/);
  const startCircleX = circle?.x ?? 0;

  await page.mouse.down();
  await expect
    .poll(async () => stage.getAttribute('data-active-mobject-id'))
    .toMatch(/:circle$/);
  await expect
    .poll(async () => stage.evaluate((node) => getComputedStyle(node).cursor))
    .toBe('grabbing');

  await page.mouse.move(circlePoint.x + 80, circlePoint.y + 20);
  await expect
    .poll(async () => (await readDebugMobject(page, 'circle'))?.x ?? Number.NaN)
    .toBeGreaterThan(startCircleX + 40);

  await page.mouse.up();
  await expect
    .poll(async () => stage.getAttribute('data-active-mobject-id'))
    .toBeNull();
  await expect
    .poll(async () => stage.getAttribute('data-drag-mobject-id'))
    .toBeNull();
  await expect
    .poll(async () => stage.evaluate((node) => getComputedStyle(node).cursor))
    .toBe('crosshair');
});

test('mobjects basics can jump editor to a clicked mobject source line', async ({
  page,
}) => {
  test.slow();
  await page.goto('/ts-scenes/mobjects_basics/basics_layout');
  await expect(page).toHaveURL('/ts-scenes/mobjects_basics/basics_layout');

  await page.getByRole('button', { name: 'Reset' }).click({ force: true });
  const stage = await waitForStage(page);

  const square = await readDebugMobject(page, 'square');
  expect(square?.sourceRef?.line).toBeDefined();

  await expect(page.getByRole('button', { name: 'go to line' })).toBeVisible();

  const box = await stage.boundingBox();
  expect(box).not.toBeNull();
  const squarePoint = {
    x: box!.x + ((square?.x ?? 0) / 1137.7777777777778) * box!.width,
    y: box!.y + ((square?.y ?? 0) / 640) * box!.height
  };

  await page.mouse.click(squarePoint.x, squarePoint.y);

  await expect
    .poll(async () => (await readSceneDebug(page)).tsEditor?.navigationMode)
    .toBe('goToLine');
  await expect
    .poll(async () => (await readSceneDebug(page)).tsEditor?.selectedLine)
    .toBe(square?.sourceRef?.line);
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const active = document.activeElement;
        return active?.closest('[data-testid]')?.getAttribute('data-testid');
      })
    )
    .toBe('ts-code-editor');
});
