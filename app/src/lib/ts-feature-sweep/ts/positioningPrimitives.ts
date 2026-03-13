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
  Text,
  UL,
  UP,
  UR
} from '$lib/manim';

export function buildPositioningPrimitivesScene(): Scene {
  const scene = new Scene(1);

  const title = Text('Positioning Primitives', {
    id: 'title',
    fontSize: 40
  });
  title.toEdge!(UP);

  const origin = Square('origin', {
    size: 0.9,
    stroke: '#22d3ee'
  });
  origin.moveTo!(ORIGIN);

  const right = Square('right', {
    size: 0.7,
    stroke: '#84cc16'
  });
  right.nextTo!(origin, RIGHT, 0.6);

  const left = Square('left', {
    size: 0.7,
    stroke: '#f59e0b'
  });
  left.nextTo!(origin, LEFT, 0.6);

  const down = Square('down', {
    size: 0.7,
    stroke: '#f97316'
  });
  down.nextTo!(origin, DOWN, 0.6);

  const corners = Circle('corners', {
    radius: 0.45,
    stroke: '#e879f9'
  });
  corners.toCorner!(UR).alignTo!(origin, LEFT);

  const ulDot = Circle('ul', {
    radius: 0.12,
    stroke: '#38bdf8'
  });
  ulDot.toCorner!(UL);

  const drDot = Circle('dr', {
    radius: 0.12,
    stroke: '#fb7185'
  });
  drDot.toCorner!(DR);

  const dlDot = Circle('dl', {
    radius: 0.12,
    stroke: '#4ade80'
  });
  dlDot.toCorner!(DL);

  const depth = Circle('depth', {
    radius: 0.18,
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
