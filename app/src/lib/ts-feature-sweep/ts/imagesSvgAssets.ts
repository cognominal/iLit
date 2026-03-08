import { Scene, SVGMobject } from '$lib/manim';

export function buildImagesSvgAssetsScene(): Scene {
  const scene = new Scene(0.9);
  const icon = SVGMobject('/assets/sample.svg', {
    id: 'icon',
  });
  icon.scale?.(1.3);
  scene.add(icon);
  scene.wait(0.8);
  return scene;
}
