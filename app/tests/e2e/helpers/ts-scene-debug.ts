import type { Page } from '@playwright/test';

export type DebugMobject = {
  id: string;
  kind: string;
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
    const debugWindow = window as Window & {
      __tsSceneDebug?: SceneDebugSnapshot;
    };
    return debugWindow.__tsSceneDebug?.mobjects.find(
      (mobject) => mobject.id === targetId
    ) ?? null;
  }, id);
}
