import { Circle, Create, Scene, Square, TitleText } from '$lib/feature-sweep/manim-api';

export function buildOpenGLParityScene(): Scene {
  const scene = new Scene(0.7);
  const title = TitleText('title', { x: 400, y: 72, value: 'OpenGL Parity', fontSize: 40 });
  const gpu = Square('square_gpu', { x: 286, y: 270, size: 126, stroke: '#22d3ee' });
  const gl = Circle('circle_gl', { x: 534, y: 248, radius: 76, stroke: '#f97316' });
  scene.add(title, gpu, gl);
  scene.play(Create(title));
  scene.play(Create(gpu), Create(gl));
  return scene;
}
