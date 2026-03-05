import { Circle, Create, Scene, Square, TitleText } from '$lib/feature-sweep/manim-api';

export function buildCameraAnd3DScene(): Scene {
  const scene = new Scene(0.9);
  const title = TitleText('title', { x: 400, y: 72, value: 'Camera and 3D', fontSize: 40 });
  const planeA = Square('square_plane', { x: 300, y: 286, size: 120, stroke: '#34d399' });
  const planeB = Square('square_plane_2', { x: 360, y: 226, size: 84, stroke: '#10b981' });
  const lens = Circle('circle_lens', { x: 560, y: 236, radius: 84, stroke: '#f59e0b' });
  scene.add(title, planeA, planeB, lens);
  scene.play(Create(title));
  scene.play(Create(planeA), Create(planeB), Create(lens));
  return scene;
}
