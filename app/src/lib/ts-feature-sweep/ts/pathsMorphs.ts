import { Circle, Create, Scene, Square, TitleText } from '$lib/feature-sweep/manim-api';

export function buildPathsMorphsScene(): Scene {
  const scene = new Scene(1);
  const title = TitleText('title', { x: 400, y: 72, value: 'Paths and Morphs', fontSize: 38 });
  const shape = Square('square_morph', { x: 300, y: 268, size: 120, stroke: '#06b6d4' });
  const start = Circle('circle_start', { x: 500, y: 220, radius: 44, stroke: '#f59e0b' });
  const end = Circle('circle_end', { x: 600, y: 320, radius: 44, stroke: '#f97316' });
  scene.add(title, shape, start, end);
  scene.play(Create(title));
  scene.play(Create(shape), Create(start), Create(end));
  return scene;
}
