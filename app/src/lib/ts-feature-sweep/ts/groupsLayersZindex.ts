import { Circle, Create, Scene, Square, TitleText, Wait } from '$lib/feature-sweep/manim-api';

export function buildGroupsLayersZIndexScene(): Scene {
  const scene = new Scene(0.8);
  const title = TitleText('title', {
    x: 400,
    y: 72,
    value: 'Groups Layers and Z-Index',
    fontSize: 40
  });
  const back = Square('square_back', {
    x: 400,
    y: 262,
    size: 212,
    stroke: '#4CC9F0'
  });
  const front = Circle('circle_front', {
    x: 400,
    y: 262,
    radius: 106,
    stroke: '#F72585'
  });
  scene.add(title, back, front);
  scene.play(Create(title));
  scene.play(Create(back), Create(front));
  scene.play(Wait(800));
  return scene;
}
