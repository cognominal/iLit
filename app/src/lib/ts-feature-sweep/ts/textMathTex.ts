import { Circle, Create, FadeIn, Scene, Square, TitleText } from '$lib/feature-sweep/manim-api';

export function buildTextMathTexScene(): Scene {
  const scene = new Scene(0.9);
  const title = TitleText('title', { x: 400, y: 72, value: 'Text Math Tex', fontSize: 40 });
  const formula = TitleText('formula', { x: 400, y: 206, value: 'e^(i*pi)+1=0', fontSize: 30, fill: '#dbeafe', stroke: '#dbeafe' });
  const left = Square('square_text', { x: 252, y: 288, size: 104, stroke: '#60a5fa' });
  const right = Circle('circle_math', { x: 552, y: 288, radius: 62, stroke: '#f43f5e' });
  scene.add(title, formula, left, right);
  scene.play(FadeIn(title), FadeIn(formula));
  scene.play(Create(left), Create(right));
  return scene;
}
