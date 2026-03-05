import { Circle, Create, Scene, Square, TitleText } from '$lib/feature-sweep/manim-api';

export function buildRegressionGoldenFramesScene(): Scene {
  const scene = new Scene(0.7);
  const title = TitleText('title', { x: 400, y: 72, value: 'Regression Golden Frames', fontSize: 34 });
  const seed = Square('square_seed', { x: 286, y: 280, size: 118, stroke: '#a3e635' });
  const c1 = Circle('circle_seed_1', { x: 500, y: 220, radius: 28, stroke: '#f472b6' });
  const c2 = Circle('circle_seed_2', { x: 564, y: 274, radius: 42, stroke: '#ec4899' });
  const c3 = Circle('circle_seed_3', { x: 644, y: 334, radius: 52, stroke: '#db2777' });
  scene.add(title, seed, c1, c2, c3);
  scene.play(Create(title));
  scene.play(Create(seed), Create(c1), Create(c2), Create(c3));
  return scene;
}
