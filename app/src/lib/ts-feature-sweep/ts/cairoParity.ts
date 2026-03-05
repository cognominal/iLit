import { Circle, Create, Scene, Square, TitleText } from '$lib/feature-sweep/manim-api';

export function buildCairoParityScene(): Scene {
  const scene = new Scene(0.7);
  const title = TitleText('title', { x: 400, y: 72, value: 'Cairo Parity', fontSize: 40 });
  const cpu = Square('square_cpu', { x: 286, y: 270, size: 126, stroke: '#38bdf8' });
  const cairo = Circle('circle_cairo', { x: 534, y: 248, radius: 76, stroke: '#fb7185' });
  scene.add(title, cpu, cairo);
  scene.play(Create(title));
  scene.play(Create(cpu), Create(cairo));
  return scene;
}
