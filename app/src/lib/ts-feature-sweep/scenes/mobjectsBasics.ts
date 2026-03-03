import {
  Circle,
  Create,
  Scene,
  Square,
  TitleText
} from '$lib/feature-sweep/manim-api';

export function buildMobjectsBasicsScene(): Scene {
  const scene = new Scene(850);

  const title = TitleText('title', {
    x: 400,
    y: 76,
    value: 'Mobjects Basics'
  });
  const square = Square('square', {
    x: 286,
    y: 242,
    size: 148,
    stroke: '#22d3ee'
  });
  const circle = Circle('circle', {
    x: 516,
    y: 242,
    radius: 72,
    stroke: '#f472b6'
  });

  scene.add(title, square, circle);
  scene.play(Create(title));
  scene.play(Create(square));
  scene.play(Create(circle));

  return scene;
}
