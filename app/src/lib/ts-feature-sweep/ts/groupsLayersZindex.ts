import {
  Circle,
  Create,
  Scene,
  Square,
  TitleText,
  VGroup
} from '$lib/manim-api';

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
  const pair = VGroup('pair', back, front);
  scene.add(title, pair);
  scene.play(Create(title));
  scene.play(Create(back), Create(front));
  scene.wait(0.8);
  return scene;
}
