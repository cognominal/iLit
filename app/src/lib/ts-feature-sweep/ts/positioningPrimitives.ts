import {
  Circle,
  Create,
  DL,
  DOWN,
  DR,
  IN,
  LEFT,
  ORIGIN,
  OUT,
  RIGHT,
  Scene,
  Square,
  TitleText,
  UL,
  UP,
  UR
} from '$lib/manim-api';

export function buildPositioningPrimitivesScene(): Scene {
  const scene = new Scene(1);

  const title = TitleText('title', {
    value: 'Positioning Primitives',
    fontSize: 34
  });
  title.toEdge!(UP, 0.5);

  const origin = Square('origin', {
    size: 72,
    stroke: '#22d3ee'
  });
  origin.moveTo!(ORIGIN);

  const right = Square('right', {
    size: 56,
    stroke: '#84cc16'
  });
  right.nextTo!(origin, RIGHT, 0.6);

  const left = Square('left', {
    size: 56,
    stroke: '#f59e0b'
  });
  left.nextTo!(origin, LEFT, 0.6);

  const down = Square('down', {
    size: 56,
    stroke: '#f97316'
  });
  down.nextTo!(origin, DOWN, 0.6);

  const corners = Circle('corners', {
    radius: 34,
    stroke: '#e879f9'
  });
  corners.toCorner!(UR, 0.7).alignTo!(origin, LEFT);

  const ulDot = Circle('ul', {
    radius: 14,
    stroke: '#38bdf8'
  });
  ulDot.toCorner!(UL, 0.8);

  const drDot = Circle('dr', {
    radius: 14,
    stroke: '#fb7185'
  });
  drDot.toCorner!(DR, 0.8);

  const dlDot = Circle('dl', {
    radius: 14,
    stroke: '#4ade80'
  });
  dlDot.toCorner!(DL, 0.8);

  const depth = Circle('depth', {
    radius: 18,
    stroke: '#c084fc'
  });
  depth.moveTo!(origin).shift!(OUT).shift!(IN);

  scene.add(
    title,
    origin,
    right,
    left,
    down,
    corners,
    ulDot,
    drDot,
    dlDot,
    depth
  );
  scene.play(Create(title));
  scene.play(
    Create(origin),
    Create(right),
    Create(left),
    Create(down),
    Create(corners)
  );
  scene.play(Create(ulDot), Create(drDot), Create(dlDot), Create(depth));
  scene.wait(0.9);
  return scene;
}
