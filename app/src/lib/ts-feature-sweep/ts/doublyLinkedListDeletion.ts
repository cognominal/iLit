import {
  Create,
  CubicBezier,
  DOWN,
  Dot,
  FadeOut,
  type Mobject,
  Polygon,
  Rectangle,
  ReplacementTransform,
  Scene,
  Text,
  UP,
  VGroup,
} from '$lib/manim';

const UNIT = 1.0;
const NODE_W = 1.5;
const NODE_H = 0.56;
const DOT_R = 0.06;
const STROKE = 2;
const FONT = 26;
const LINE = '#F8FAFC';
const FILL = '#0F172A';
const FILL_ACCENT = '#334155';
const TEXT = '#E2E8F0';

function bezier_arrow(
  name: string,
  start: [number, number, number],
  end: [number, number, number],
  lift: number,
  color = LINE
) {
  const c1: [number, number, number] = [
    start[0] + ((end[0] - start[0]) * 0.25),
    start[1] + lift,
    0,
  ];
  const c2: [number, number, number] = [
    start[0] + ((end[0] - start[0]) * 0.75),
    end[1] + lift,
    0,
  ];
  const tipDx = start[0] <= end[0] ? 0.12 : -0.12;
  const shaft = CubicBezier(
    start,
    c1,
    c2,
    end,
    { color, stroke_width: STROKE }
  );
  const tip = Polygon(
    end,
    [end[0] - tipDx, end[1] + 0.08, 0],
    [end[0] - tipDx, end[1] - 0.08, 0],
    {
      color,
      fill_color: color,
      fill_opacity: 1,
      stroke_width: 0,
    }
  );
  return VGroup(shaft, tip);
}

function loop_arrow(
  name: string,
  left: number,
  right: number,
  y: number,
  color = LINE
) {
  const start: [number, number, number] = [right, y, 0];
  const end: [number, number, number] = [left, y, 0];
  const shaft = CubicBezier(
    start,
    [right + 0.4, y - 0.45, 0],
    [left - 0.4, y - 0.45, 0],
    end,
    { color, stroke_width: STROKE }
  );
  const tip = Polygon(
    end,
    [end[0] + 0.12, end[1] + 0.08, 0],
    [end[0] + 0.12, end[1] - 0.08, 0],
    {
      color,
      fill_color: color,
      fill_opacity: 1,
      stroke_width: 0,
    }
  );
  return VGroup(shaft, tip);
}

function make_node(name: string, center: [number, number], fill = '#f6f6f6') {
  const [x, y] = center;
  const shell = Rectangle({
    width: NODE_W,
    height: NODE_H,
    color: LINE,
    stroke_width: STROKE,
    fill_color: fill,
    fill_opacity: 1,
  }).move_to!([x, y, 0]);
  const leftDiv = CubicBezier(
    [x - 0.35, y + NODE_H / 2, 0],
    [x - 0.35, y + NODE_H / 6, 0],
    [x - 0.35, y - NODE_H / 6, 0],
    [x - 0.35, y - NODE_H / 2, 0],
    { color: LINE, stroke_width: STROKE }
  );
  const rightDiv = CubicBezier(
    [x + 0.35, y + NODE_H / 2, 0],
    [x + 0.35, y + NODE_H / 6, 0],
    [x + 0.35, y - NODE_H / 6, 0],
    [x + 0.35, y - NODE_H / 2, 0],
    { color: LINE, stroke_width: STROKE }
  );
  const leftDot = Dot([x - 0.55, y, 0], {
    radius: DOT_R,
    color: LINE,
  });
  const rightDot = Dot([x + 0.55, y, 0], {
    radius: DOT_R,
    color: LINE,
  });
  return VGroup(shell, leftDiv, rightDiv, leftDot, rightDot);
}

function make_links(xs: number[], y: number) {
  const groups: Mobject[] = [];
  for (let i = 0; i < xs.length - 1; i += 1) {
    groups.push(
      bezier_arrow(
        `f_${i}`,
        [xs[i] + 0.3, y + 0.01, 0],
        [xs[i + 1] - 0.3, y + 0.01, 0],
        0.18
      )
    );
    groups.push(
      bezier_arrow(
        `b_${i}`,
        [xs[i + 1] - 0.48, y - 0.01, 0],
        [xs[i] + 0.48, y - 0.01, 0],
        -0.18
      )
    );
  }
  groups.push(loop_arrow('loop', xs[0] - 0.55, xs[xs.length - 1] + 0.55, y - 0.32));
  return VGroup(groups[0]!, ...groups.slice(1));
}

export function buildDoublyLinkedListDeletionScene(): Scene {
  const scene = new Scene();
  const title = Text('Circular doubly linked list deletion', {
    font_size: 34,
    fill: TEXT,
    stroke: TEXT,
  });
  title.to_edge!(UP).shift!([0, 0.15 * UNIT, 0]);

  const xs = [-4.4, -1.7, 1.0, 3.7];
  const y = 0.45;
  const nodes = VGroup(
    make_node('n0', [xs[0], y], FILL_ACCENT),
    make_node('n1', [xs[1], y], FILL),
    make_node('n2', [xs[2], y], FILL_ACCENT),
    make_node('n3', [xs[3], y], FILL)
  );
  const links = make_links(xs, y);

  const bypassThird = VGroup(
    bezier_arrow(
      'skip_f_2',
      [xs[1] + 0.3, y + 0.01, 0],
      [xs[3] - 0.3, y + 0.01, 0],
      0.75
    ),
    bezier_arrow(
      'skip_b_2',
      [xs[3] - 0.48, y - 0.01, 0],
      [xs[1] + 0.48, y - 0.01, 0],
      -0.75
    )
  );

  const afterThirdLinks = VGroup(
    make_links(xs, y)[0]!,
    make_links(xs, y)[1]!,
    bypassThird[0]!.copy!(),
    bypassThird[1]!.copy!(),
    make_links(xs, y)[4]!
  );

  const bypassSecond = VGroup(
    bezier_arrow(
      'skip_f_1',
      [xs[0] + 0.3, y + 0.01, 0],
      [xs[3] - 0.3, y + 0.01, 0],
      0.82
    ),
    bezier_arrow(
      'skip_b_1',
      [xs[3] - 0.48, y - 0.01, 0],
      [xs[0] + 0.48, y - 0.01, 0],
      -0.82
    )
  );

  const finalLinks = VGroup(
    bypassSecond[0]!.copy!(),
    bypassSecond[1]!.copy!(),
    make_links(xs, y)[4]!.copy!()
  );

  const caption = Text(
    'Delete the third node, then the second; update both links first.',
    {
      font_size: FONT,
      fill: TEXT,
      stroke: TEXT,
    }
  ).next_to!(nodes, DOWN, 0.9);

  scene.add(title, nodes, links, caption);
  scene.play(Create(nodes), Create(links), Create(caption), { run_time: 0.8 });
  scene.wait(0.2);
  scene.play(ReplacementTransform(links[2]!, bypassThird[0]!));
  scene.play(ReplacementTransform(links[3]!, bypassThird[1]!));
  scene.play(ReplacementTransform(links, afterThirdLinks), { run_time: 0.5 });
  scene.play(ReplacementTransform(afterThirdLinks[0]!, bypassSecond[0]!));
  scene.play(ReplacementTransform(afterThirdLinks[1]!, bypassSecond[1]!));
  scene.play(
    FadeOut(afterThirdLinks[2]!),
    FadeOut(afterThirdLinks[3]!),
    ReplacementTransform(bypassSecond, finalLinks),
    { run_time: 0.5 }
  );
  scene.wait(0.8);
  return scene;
}
