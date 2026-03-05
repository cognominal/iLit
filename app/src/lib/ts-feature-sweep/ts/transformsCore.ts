import {
  Circle,
  Create,
  ReplacementTransform,
  Scene,
  Square,
  TitleText
} from '$lib/feature-sweep/manim-api';

export function buildTransformsCoreScene(): Scene {
  const scene = new Scene(0.9);
  const title = TitleText('title', { x: 400, y: 72, value: 'Transforms Core', fontSize: 40 });
  const from = Square('square_from', { x: 280, y: 256, size: 110, stroke: '#38bdf8' });
  const to = Circle('circle_to', { x: 520, y: 256, radius: 56, stroke: '#f59e0b' });
  scene.add(title, from, to);
  scene.play(Create(title));
  scene.play(Create(from));
  scene.play(ReplacementTransform(from, to, { runTime: 1.1 }));
  return scene;
}
