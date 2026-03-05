import { Circle, Create, Scene, Square, TitleText } from '$lib/feature-sweep/manim-api';

export function buildImagesSvgAssetsScene(): Scene {
  const scene = new Scene(0.9);
  const title = TitleText('title', { x: 400, y: 72, value: 'Images SVG and Assets', fontSize: 34 });
  const asset = Square('square_asset', { x: 262, y: 270, size: 136, stroke: '#22c55e' });
  const fallback = Square('square_fallback', { x: 392, y: 270, size: 92, stroke: '#4ade80' });
  const icon = Circle('circle_icon', { x: 566, y: 270, radius: 66, stroke: '#8b5cf6' });
  scene.add(title, asset, fallback, icon);
  scene.play(Create(title));
  scene.play(Create(asset), Create(fallback), Create(icon));
  return scene;
}
