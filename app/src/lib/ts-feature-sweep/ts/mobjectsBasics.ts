import {
  Circle,
  Create,
  FadeIn,
  LEFT,
  RIGHT,
  Scene,
  Square,
  TitleText,
  UP
} from '$lib/manim-api';

export function buildMobjectsBasicsScene(): Scene {
  const scene = new Scene(1);
  const label = TitleText('title', {
    value: 'Mobjects Basics',
    fontSize: 36
  });
  label.toEdge!(UP, 0.6);
  const square = Square('square', {
    size: 112,
    stroke: '#4CC9F0'
  });
  square.shift!(LEFT);
  const circle = Circle('circle', {
    radius: 56,
    stroke: '#F72585'
  });
  circle.nextTo!(square, RIGHT, 0.8);

  scene.add(label, square, circle);
  scene.play(FadeIn(label));
  scene.play(Create(square), Create(circle));
  scene.wait(0.8);
  return scene;
}
