import { Circle, Create, Scene, Square, TitleText } from '$lib/feature-sweep/manim-api';

export function buildLightingShading3DScene(): Scene {
  const scene = new Scene(0.9);
  const title = TitleText('title', { x: 400, y: 72, value: 'Lighting and Shading 3D', fontSize: 34 });
  const form = Square('square_light', { x: 248, y: 282, size: 150, stroke: '#2dd4bf' });
  const key = Circle('circle_key', { x: 522, y: 246, radius: 78, stroke: '#f87171' });
  const fill = Circle('circle_fill', { x: 636, y: 186, radius: 42, stroke: '#fb7185' });
  scene.add(title, form, key, fill);
  scene.play(Create(title));
  scene.play(Create(form), Create(key), Create(fill));
  return scene;
}
