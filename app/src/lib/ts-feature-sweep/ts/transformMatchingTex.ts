import { MathTex, Scene, TransformMatchingTex } from '$lib/manim';

export function buildTransformMatchingTexScene(): Scene {
  const scene = new Scene(0.9);
  const start = MathTex('eq_start', String.raw`e^{i\pi}+1=0`, {
    x: 400,
    y: 240,
    fontSize: 44,
    color: '#dbeafe',
  });
  const end = MathTex('eq_end', String.raw`e^{i\pi}=-1`, {
    x: 400,
    y: 240,
    fontSize: 44,
    color: '#dbeafe',
  });

  scene.add(start, end);
  scene.play(...TransformMatchingTex(start, end, { runTime: 1.5 }));
  scene.wait(0.5);
  return scene;
}
