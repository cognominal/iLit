import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export type DebugMobject = {
  id: string;
  kind: string;
  sourceRef?: {
    file: string;
    line: number;
    column?: number;
    label?: string;
  };
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  svgHref?: string;
  points?: Array<{ x: number; y: number }>;
};

type SceneDebugSnapshot = {
  renderer: 'three';
  mobjects: DebugMobject[];
};

export async function readSceneDebug(
  page: Page
): Promise<SceneDebugSnapshot> {
  return page.evaluate(() => {
    const debugWindow = window as Window & {
      __tsSceneDebug?: SceneDebugSnapshot;
    };
    return debugWindow.__tsSceneDebug ?? {
      renderer: 'three',
      mobjects: []
    };
  });
}

export async function readDebugMobject(
  page: Page,
  id: string
): Promise<DebugMobject | null> {
  return page.evaluate((targetId) => {
    const matches = (mobject: DebugMobject): boolean =>
      mobject.id === targetId ||
      mobject.id.endsWith(`:${targetId}`) ||
      mobject.sourceRef?.label === targetId;
    const debugWindow = window as Window & {
      __tsSceneDebug?: SceneDebugSnapshot;
    };
    return debugWindow.__tsSceneDebug?.mobjects.find(
      (mobject) => matches(mobject)
    ) ?? null;
  }, id);
}

export async function waitForStage(page: Page) {
  const stage = page.getByTestId('webgpu-scene-stage');
  await expect(stage).toBeVisible({ timeout: 30_000 });
  await expect
    .poll(async () => stage.getAttribute('data-renderer'), {
      timeout: 30_000
    })
    .toMatch(/gpu|webgl/);
  return stage;
}
