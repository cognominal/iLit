import { Circle, Create, FadeIn, Scene, Square, TitleText, Wait } from '$lib/feature-sweep/manim-api';

export function buildMobjectsBasicsScene(): Scene {
  const scene = new Scene(1);
  const label = TitleText('title', {
    x: 400,
    y: 74,
    value: 'Mobjects Basics',
    fontSize: 36
  });
  const square = Square('square', {
    x: 320,
    y: 256,
    size: 112,
    stroke: '#4CC9F0'
  });
  const circle = Circle('circle', {
    x: 480,
    y: 256,
    radius: 56,
    stroke: '#F72585'
  });

  scene.add(label, square, circle);
  scene.play(FadeIn(label));
  scene.play(Create(square), Create(circle));
  scene.play(Wait(800));
  return scene;
}
