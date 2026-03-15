import {
  Circle,
  Create,
  DOWN,
  LEFT,
  RIGHT,
  Scene,
  Square,
  Text,
  VGroup
} from '$lib/manim';

export function buildMobjectsBasicsScene(): Scene {
  const scene = new Scene(1);
  const title = Text('Mobjects Basics', {
    id: 'title',
    fontSize: 34,
    fill: '#e2e8f0'
  });
  const square = Square('square', {
    size: 112,
    stroke: '#4CC9F0'
  });
  square.interactive = true;
  square.cursor = 'pointer';
  square.userData = { role: 'square' };
  square.onPointerEnter = ({ mobject }) => {
    mobject.cursor = 'help';
    mobject.setFill?.('#4CC9F0', 0.18);
  };
  square.onPointerLeave = ({ mobject }) => {
    mobject.cursor = 'pointer';
    mobject.setFill?.('none', 0);
  };
  square.shift!(LEFT);
  const circle = Circle('circle', {
    radius: 56,
    stroke: '#F72585'
  });
  circle.interactive = true;
  circle.cursor = 'crosshair';
  circle.userData = { role: 'circle' };
  circle.onPointerDown = ({ mobject }) => {
    mobject.cursor = 'grabbing';
    mobject.setFill?.('#F72585', 0.22);
  };
  circle.onPointerUp = ({ mobject }) => {
    mobject.cursor = 'crosshair';
    mobject.setFill?.('none', 0);
  };
  const row = VGroup('row', square, circle).arrange!(RIGHT, 1.2);

  title.moveTo!([0, 1.75, 0]);
  row.moveTo!([0, 0, 0]);
  row.nextTo?.(title, DOWN, 1.1);
  scene.add(title, row);
  scene.play(Create(title), Create(square), Create(circle));
  scene.wait(0.8);
  return scene;
}
