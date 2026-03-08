import {
  Create,
  Dot,
  FadeOut,
  Path,
  ReplacementTransform,
  Scene,
  Text,
  VGroup,
} from '$lib/manim';

const LINE = '#F8FAFC';
const FILL = '#0F172A';
const FILL_ACCENT = '#334155';
const TEXT = '#E2E8F0';
const BASE_X = 560;
const BASE_Y = 220;
const UNIT = 80;
const NODE_W = 120;
const NODE_H = 45;

type Pt = { x: number; y: number };

function px(x: number, y: number): Pt {
  return { x: BASE_X + (x * UNIT), y: BASE_Y - (y * UNIT) };
}

function cubicPoint(t: number, p0: Pt, p1: Pt, p2: Pt, p3: Pt): Pt {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x:
      (uuu * p0.x) + (3 * uu * t * p1.x) + (3 * u * tt * p2.x) +
      (ttt * p3.x),
    y:
      (uuu * p0.y) + (3 * uu * t * p1.y) + (3 * u * tt * p2.y) +
      (ttt * p3.y),
  };
}

function bezierPath(
  id: string,
  start: Pt,
  c1: Pt,
  c2: Pt,
  end: Pt,
  strokeWidth = 2
) {
  const points: Pt[] = [];
  for (let i = 0; i <= 48; i += 1) {
    points.push(cubicPoint(i / 48, start, c1, c2, end));
  }
  return Path(id, {
    points,
    stroke: LINE,
    strokeWidth,
    closed: false,
  });
}

function arrowHead(id: string, tip: Pt, dx: number) {
  return Path(id, {
    points: [
      tip,
      { x: tip.x - dx, y: tip.y + 8 },
      { x: tip.x - dx, y: tip.y - 8 },
    ],
    stroke: LINE,
    fill: LINE,
    strokeWidth: 2,
    closed: true,
  });
}

function arrow(id: string, start: Pt, end: Pt, liftPx: number) {
  const c1 = {
    x: start.x + ((end.x - start.x) * 0.25),
    y: start.y - liftPx,
  };
  const c2 = {
    x: start.x + ((end.x - start.x) * 0.75),
    y: end.y - liftPx,
  };
  const dx = start.x <= end.x ? 12 : -12;
  return VGroup(
    id,
    bezierPath(`${id}_shaft`, start, c1, c2, end),
    arrowHead(`${id}_tip`, end, dx)
  );
}

function loopArrow(id: string, left: number, right: number, y: number) {
  const start = px(right, y);
  const end = px(left, y);
  return VGroup(
    id,
    bezierPath(
      `${id}_shaft`,
      start,
      px(right + 0.4, y - 0.45),
      px(left - 0.4, y - 0.45),
      end
    ),
    Path(`${id}_tip`, {
      points: [
        end,
        { x: end.x + 12, y: end.y + 8 },
        { x: end.x + 12, y: end.y - 8 },
      ],
      stroke: LINE,
      fill: LINE,
      strokeWidth: 2,
      closed: true,
    })
  );
}

function nodeBox(id: string, x: number, y: number, fill: string) {
  const c = px(x, y);
  return Path(id, {
    points: [
      { x: c.x - NODE_W / 2, y: c.y - NODE_H / 2 },
      { x: c.x + NODE_W / 2, y: c.y - NODE_H / 2 },
      { x: c.x + NODE_W / 2, y: c.y + NODE_H / 2 },
      { x: c.x - NODE_W / 2, y: c.y + NODE_H / 2 },
    ],
    stroke: LINE,
    fill,
    strokeWidth: 2,
    closed: true,
  });
}

function divider(id: string, x: number, y: number) {
  const top = px(x, y + 0.28);
  const bottom = px(x, y - 0.28);
  return Path(id, {
    points: [top, bottom],
    stroke: LINE,
    strokeWidth: 2,
    closed: false,
  });
}

function makeNode(id: string, x: number, y: number, fill: string) {
  return VGroup(
    id,
    nodeBox(`${id}_shell`, x, y, fill),
    divider(`${id}_left_div`, x - 0.35, y),
    divider(`${id}_right_div`, x + 0.35, y),
    Dot(`${id}_left_dot`, {
      x: px(x - 0.55, y).x,
      y: px(x - 0.55, y).y,
      radius: 4,
      color: LINE
    }),
    Dot(`${id}_right_dot`, {
      x: px(x + 0.55, y).x,
      y: px(x + 0.55, y).y,
      radius: 4,
      color: LINE
    })
  );
}

function pairLinks(prefix: string, left: number, right: number, y: number, lift: number) {
  return [
    arrow(
      `${prefix}_f`,
      px(left + 0.3, y + 0.01),
      px(right - 0.3, y + 0.01),
      lift
    ),
    arrow(
      `${prefix}_b`,
      px(right - 0.48, y - 0.01),
      px(left + 0.48, y - 0.01),
      -lift
    ),
  ] as const;
}

export function buildDoublyLinkedListDeletionScene(): Scene {
  const scene = new Scene(0.9);
  const xs = [-4.4, -1.7, 1.0, 3.7];
  const y = 0.45;

  const title = Text('Circular doubly linked list deletion', {
    id: 'title',
    fontSize: 34,
    fill: TEXT,
    stroke: TEXT,
    x: 560,
    y: 54,
  });
  const caption = Text(
    'Delete the third node, then the second; update both links first.',
    {
      id: 'caption',
      fontSize: 26,
      fill: TEXT,
      stroke: TEXT,
      x: 560,
      y: 360,
    }
  );

  const nodes = VGroup(
    'nodes',
    makeNode('n0', xs[0], y, FILL_ACCENT),
    makeNode('n1', xs[1], y, FILL),
    makeNode('n2', xs[2], y, FILL_ACCENT),
    makeNode('n3', xs[3], y, FILL)
  );

  const [f01, b10] = pairLinks('l01', xs[0], xs[1], y, 14);
  const [f12, b21] = pairLinks('l12', xs[1], xs[2], y, 14);
  const [f23, b32] = pairLinks('l23', xs[2], xs[3], y, 14);
  const loop = loopArrow('loop', xs[0] - 0.55, xs[3] + 0.55, y - 0.32);

  const [skip13f, skip13b] = pairLinks('skip13', xs[1], xs[3], y, 60);
  const [skip03f, skip03b] = pairLinks('skip03', xs[0], xs[3], y, 66);

  const links = VGroup('links', f01, b10, f12, b21, f23, b32, loop);

  scene.add(title, nodes, links, caption);
   scene.wait(0.2);
  scene.play(
    ReplacementTransform(f12, skip13f, { runTime: 0.5 }),
    ReplacementTransform(b21, skip13b, { runTime: 0.5 })
  );
  scene.wait(0.25);
  scene.play(
    ReplacementTransform(f01, skip03f, { runTime: 0.5 }),
    ReplacementTransform(b10, skip03b, { runTime: 0.5 })
  );
  scene.play(
    FadeOut(f23, { runTime: 0.3 }),
    FadeOut(b32, { runTime: 0.3 })
  );
  scene.wait(0.8);
  return scene;
}
