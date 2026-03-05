export type MobjectKind =
  'square' | 'circle' | 'text' | 'path' | 'dot' |
  'mathtex' | 'kmathtex' | 'group';

export type Point = { x: number; y: number };
type Color = string;
type PointLike = Point | [number, number, number?];

export type Mobject = {
  id: string;
  kind: MobjectKind;
  stroke: string;
  strokeWidth: number;
  opacity?: number;
  fill?: string;
  x?: number;
  y?: number;
  size?: number;
  radius?: number;
  text?: string;
  tex?: string;
  texHtml?: string;
  texSvg?: string;
  texWidth?: number;
  texHeight?: number;
  fontSize?: number;
  points?: Point[];
  closed?: boolean;
  children?: Mobject[];
  token?: string;
  animate?: {
    become: (
      target: Mobject,
      opts?: { runTime?: number }
    ) => Omit<Animation, 'runTime' | 'phase'> & { runTime?: number };
    moveAlongPath: (
      path: Mobject,
      opts?: { runTime?: number }
    ) => Omit<Animation, 'runTime' | 'phase'> & { runTime?: number };
  };
  become?: (target: Mobject) => Mobject;
  moveTo?: (target: PointLike | Mobject) => Mobject;
  move_to?: (target: PointLike | Mobject) => Mobject;
  shift?: (delta: PointLike) => Mobject;
  nextTo?: (target: Mobject, direction?: PointLike, buff?: number) => Mobject;
  next_to?: (target: Mobject, direction?: PointLike, buff?: number) => Mobject;
  toEdge?: (direction: PointLike, buff?: number) => Mobject;
  to_edge?: (direction: PointLike, buff?: number) => Mobject;
  toCorner?: (corner: PointLike, buff?: number) => Mobject;
  to_corner?: (corner: PointLike, buff?: number) => Mobject;
  alignTo?: (target: Mobject, direction: PointLike) => Mobject;
  align_to?: (target: Mobject, direction: PointLike) => Mobject;
  arrange?: (direction?: PointLike, buff?: number) => Mobject;
  getCenter?: () => Point;
  get_center?: () => Point;
};

export type Animation = {
  kind:
    | 'create'
    | 'wait'
    | 'replacementTransform'
    | 'fadeOut'
    | 'moveAlongPath';
  targetId?: string;
  sourceId?: string;
  pathId?: string;
  runTime: number;
  phase: number;
  meta?: Record<string, string | number | boolean | null | undefined>;
};

type PendingAnimation =
  Omit<Animation, 'runTime' | 'phase'> & { runTime?: number };

export type ScenePhase = {
  phase: number;
  durationSec: number;
  animations: Animation[];
};

export class Scene {
  private defaultCreateSec: number;
  private phase = 0;
  mobjects: Mobject[] = [];
  timeline: Animation[] = [];

  constructor(defaultCreateSec = 0.8) {
    this.defaultCreateSec = defaultCreateSec;
  }

  add(...mobjects: Mobject[]): void {
    this.mobjects.push(...flattenMobjects(mobjects));
  }

  play(...animations: Array<
    | (Omit<Animation, 'runTime' | 'phase'> & { runTime?: number })
    | Array<Omit<Animation, 'runTime' | 'phase'> & { runTime?: number }>
  >): void {
    if (animations.length === 0) return;
    const flat = animations.flat();
    for (const animation of flat) {
      this.timeline.push({
        ...animation,
        runTime: animation.runTime ?? this.defaultCreateSec,
        phase: this.phase
      });
    }
    this.phase += 1;
  }

  wait(runTime: number): void {
    this.play(Wait(runTime));
  }
}

let autoIdSeq = 0;
function autoId(prefix: string): string {
  autoIdSeq += 1;
  return `${prefix}_${autoIdSeq}`;
}

function flattenMobjects(mobjects: Mobject[]): Mobject[] {
  const flat: Mobject[] = [];
  for (const mobject of mobjects) {
    if (mobject.kind === 'group') {
      flat.push(...flattenMobjects(mobject.children ?? []));
      continue;
    }
    flat.push(mobject);
  }
  return flat;
}

function flattenRenderable(mobject: Mobject): Mobject[] {
  if (mobject.kind === 'group') {
    return flattenMobjects(mobject.children ?? []);
  }
  return [mobject];
}

const CENTER_X = 400;
const CENTER_Y = 240;
const UNIT_PX = 80;
const FRAME_X_RADIUS = 5;
const FRAME_Y_RADIUS = 3;

function getMobjectX(mobject: Mobject): number {
  return mobject.x ?? CENTER_X;
}

function getMobjectY(mobject: Mobject): number {
  return mobject.y ?? CENTER_Y;
}

function estimateTextWidth(mobject: Mobject): number {
  const text = mobject.text ?? '';
  const fontSize = mobject.fontSize ?? 32;
  return Math.max(fontSize * 0.6, text.length * fontSize * 0.56);
}

function estimateTextHeight(mobject: Mobject): number {
  const fontSize = mobject.fontSize ?? 32;
  return fontSize * 1.2;
}

function mobjectBounds(mobject: Mobject): {
  left: number;
  right: number;
  top: number;
  bottom: number;
} {
  if (mobject.kind === 'group') {
    const children = mobject.children ?? [];
    if (children.length === 0) {
      const x = getMobjectX(mobject);
      const y = getMobjectY(mobject);
      return { left: x, right: x, top: y, bottom: y };
    }
    const bounds = children.map((child) => mobjectBounds(child));
    return {
      left: Math.min(...bounds.map((b) => b.left)),
      right: Math.max(...bounds.map((b) => b.right)),
      top: Math.min(...bounds.map((b) => b.top)),
      bottom: Math.max(...bounds.map((b) => b.bottom)),
    };
  }

  const x = getMobjectX(mobject);
  const y = getMobjectY(mobject);
  if (mobject.kind === 'square') {
    const half = (mobject.size ?? 0) / 2;
    return { left: x - half, right: x + half, top: y - half, bottom: y + half };
  }
  if (mobject.kind === 'circle' || mobject.kind === 'dot') {
    const r = mobject.radius ?? 0;
    return { left: x - r, right: x + r, top: y - r, bottom: y + r };
  }
  if (mobject.kind === 'path') {
    const points = mobject.points ?? [];
    if (points.length === 0) return { left: x, right: x, top: y, bottom: y };
    return {
      left: Math.min(...points.map((p) => p.x)),
      right: Math.max(...points.map((p) => p.x)),
      top: Math.min(...points.map((p) => p.y)),
      bottom: Math.max(...points.map((p) => p.y)),
    };
  }
  const halfW = estimateTextWidth(mobject) / 2;
  const halfH = estimateTextHeight(mobject) / 2;
  return { left: x - halfW, right: x + halfW, top: y - halfH, bottom: y + halfH };
}

function asVector(value: PointLike): [number, number, number] {
  if (isTuple(value)) {
    return [value[0], value[1], value[2] ?? 0];
  }
  const x = (value.x - CENTER_X) / UNIT_PX;
  const y = (CENTER_Y - value.y) / UNIT_PX;
  return [x, y, 0];
}

function directionAxis(direction: PointLike): 'x' | 'y' {
  const [x, y] = asVector(direction);
  return Math.abs(x) >= Math.abs(y) ? 'x' : 'y';
}

function anchorFromDirection(
  direction: PointLike,
  buff = 0.5
): Point {
  const [dx, dy] = asVector(direction);
  const sx = Math.sign(dx);
  const sy = Math.sign(dy);
  return {
    x: CENTER_X + sx * (FRAME_X_RADIUS - buff) * UNIT_PX,
    y: CENTER_Y - sy * (FRAME_Y_RADIUS - buff) * UNIT_PX,
  };
}

function translateMobject(mobject: Mobject, dxPx: number, dyPx: number): void {
  if (mobject.kind === 'group') {
    const children = mobject.children ?? [];
    for (const child of children) {
      translateMobject(child, dxPx, dyPx);
    }
  }
  mobject.x = getMobjectX(mobject) + dxPx;
  mobject.y = getMobjectY(mobject) + dyPx;
}

function attachMobjectApi(mobject: Mobject): Mobject {
  mobject.become = (target: Mobject): Mobject => {
    const currentId = mobject.id;
    Object.assign(mobject, { ...target, id: currentId });
    return mobject;
  };
  mobject.animate = {
    become: (target: Mobject, opts?: { runTime?: number }) =>
      ReplacementTransform(mobject, target, opts),
    moveAlongPath: (path: Mobject, opts?: { runTime?: number }) =>
      MoveAlongPath(mobject, path, opts),
  };
  mobject.moveTo = (target: PointLike | Mobject): Mobject => {
    const currentX = getMobjectX(mobject);
    const currentY = getMobjectY(mobject);
    let nextX = currentX;
    let nextY = currentY;
    if ('id' in target) {
      nextX = getMobjectX(target);
      nextY = getMobjectY(target);
    } else {
      const point = fromPointLike(target);
      nextX = point.x;
      nextY = point.y;
    }
    const dx = nextX - currentX;
    const dy = nextY - currentY;
    if (mobject.kind === 'group') {
      translateMobject(mobject, dx, dy);
      return mobject;
    }
    mobject.x = nextX;
    mobject.y = nextY;
    return mobject;
  };
  mobject.move_to = mobject.moveTo;
  mobject.shift = (delta: PointLike): Mobject => {
    const [dx, dy] = asVector(delta);
    const dxPx = dx * UNIT_PX;
    const dyPx = -dy * UNIT_PX;
    if (mobject.kind === 'group') {
      translateMobject(mobject, dxPx, dyPx);
      return mobject;
    }
    mobject.x = getMobjectX(mobject) + dxPx;
    mobject.y = getMobjectY(mobject) + dyPx;
    return mobject;
  };
  mobject.nextTo = (
    target: Mobject,
    direction: PointLike = RIGHT,
    buff = 0.5
  ): Mobject => {
    const [dx, dy] = asVector(direction);
    const gapPx = (1 + buff) * UNIT_PX;
    mobject.x = getMobjectX(target) + Math.sign(dx) * gapPx;
    mobject.y = getMobjectY(target) - Math.sign(dy) * gapPx;
    return mobject;
  };
  mobject.next_to = mobject.nextTo;
  mobject.toEdge = (direction: PointLike, buff = 0.5): Mobject => {
    const point = anchorFromDirection(direction, buff);
    mobject.x = point.x;
    mobject.y = point.y;
    return mobject;
  };
  mobject.to_edge = mobject.toEdge;
  mobject.toCorner = (corner: PointLike, buff = 0.5): Mobject => {
    const point = anchorFromDirection(corner, buff);
    mobject.x = point.x;
    mobject.y = point.y;
    return mobject;
  };
  mobject.to_corner = mobject.toCorner;
  mobject.alignTo = (target: Mobject, direction: PointLike): Mobject => {
    if (directionAxis(direction) === 'x') {
      mobject.x = getMobjectX(target);
    } else {
      mobject.y = getMobjectY(target);
    }
    return mobject;
  };
  mobject.align_to = mobject.alignTo;
  mobject.arrange = (
    direction: PointLike = RIGHT,
    buff = 0.25
  ): Mobject => {
    if (mobject.kind !== 'group') return mobject;
    const children = mobject.children ?? [];
    if (children.length <= 1) return mobject;

    const axis = directionAxis(direction);
    const sign = axis === 'x'
      ? Math.sign(asVector(direction)[0]) || 1
      : Math.sign(asVector(direction)[1]) || -1;

    const sizes = children.map((child) => {
      const bounds = mobjectBounds(child);
      return axis === 'x'
        ? bounds.right - bounds.left
        : bounds.bottom - bounds.top;
    });
    const centers = children.map((child) => ({
      x: getMobjectX(child),
      y: getMobjectY(child),
    }));
    const gap = buff * UNIT_PX;
    const total =
      sizes.reduce((sum, size) => sum + size, 0) +
      gap * Math.max(0, children.length - 1);
    let cursor = -total / 2;

    children.forEach((child, idx) => {
      const span = sizes[idx];
      const offset = cursor + span / 2;
      const original = centers[idx];
      if (axis === 'x') {
        child.moveTo?.({
          x: CENTER_X + sign * offset,
          y: original.y,
        });
      } else {
        child.moveTo?.({
          x: original.x,
          y: CENTER_Y - sign * offset,
        });
      }
      cursor += span + gap;
    });
    return mobject;
  };
  mobject.getCenter = (): Point => ({
    x: getMobjectX(mobject),
    y: getMobjectY(mobject),
  });
  mobject.get_center = mobject.getCenter;
  return mobject;
}

function isPoint(value: unknown): value is Point {
  return typeof value === 'object' && value !== null &&
    'x' in value && 'y' in value;
}

function isTuple(value: unknown): value is [number, number, number?] {
  return Array.isArray(value) && value.length >= 2 &&
    typeof value[0] === 'number' && typeof value[1] === 'number';
}

function fromPointLike(value: PointLike): Point {
  if (isPoint(value)) return value;
  const [mx, my] = value;
  return {
    x: 400 + mx * 80,
    y: 240 - my * 80,
  };
}

export function scenePhases(scene: Scene): ScenePhase[] {
  const phaseMap = new Map<number, Animation[]>();
  for (const step of scene.timeline) {
    const list = phaseMap.get(step.phase);
    if (list) {
      list.push(step);
      continue;
    }
    phaseMap.set(step.phase, [step]);
  }
  return [...phaseMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([phase, animations]) => ({
      phase,
      durationSec: Math.max(...animations.map((step) => step.runTime)),
      animations,
    }));
}

export function sceneDurationSec(scene: Scene): number {
  return scenePhases(scene).reduce((sum, phase) => sum + phase.durationSec, 0);
}

export function phaseIndexAtTime(scene: Scene, timeSec: number): number {
  const phases = scenePhases(scene);
  if (phases.length === 0) return 0;
  if (timeSec <= 0) return 0;
  let elapsed = 0;
  for (let i = 0; i < phases.length; i += 1) {
    elapsed += phases[i]?.durationSec ?? 0;
    if (timeSec < elapsed) return i;
  }
  return phases.length - 1;
}

export function Square(
  id: string,
  opts: {
    x?: number;
    y?: number;
    size: number;
    stroke: string;
    strokeWidth?: number;
  }
): Mobject {
  return attachMobjectApi({
    id,
    kind: 'square',
    x: opts.x ?? CENTER_X,
    y: opts.y ?? CENTER_Y,
    size: opts.size,
    stroke: opts.stroke,
    strokeWidth: opts.strokeWidth ?? 8,
    fill: 'none',
  });
}

export function Circle(
  idOrOpts: string | {
    x?: number;
    y?: number;
    radius?: number;
    stroke?: string;
    strokeWidth?: number;
    color?: Color;
  },
  maybeOpts?: {
    x?: number;
    y?: number;
    radius?: number;
    stroke?: string;
    strokeWidth?: number;
    color?: Color;
  }
): Mobject {
  const id = typeof idOrOpts === 'string' ? idOrOpts : autoId('circle');
  const opts = (typeof idOrOpts === 'string' ? maybeOpts : idOrOpts) ?? {};
  const color = opts.color ?? opts.stroke ?? '#e2e8f0';
  return attachMobjectApi({
    id,
    kind: 'circle',
    x: opts.x ?? 400,
    y: opts.y ?? 240,
    radius: opts.radius ?? 48,
    stroke: color,
    strokeWidth: opts.strokeWidth ?? 8,
    fill: 'none',
  });
}

export function Dot(
  idOrPointOrOpts?: string | PointLike | {
    x?: number;
    y?: number;
    radius?: number;
    stroke?: string;
    fill?: string;
    strokeWidth?: number;
    color?: Color;
  },
  opts?: {
    x?: number;
    y?: number;
    radius?: number;
    stroke?: string;
    fill?: string;
    strokeWidth?: number;
    color?: Color;
  }
): Mobject {
  const id = typeof idOrPointOrOpts === 'string'
    ? idOrPointOrOpts
    : autoId('dot');
  const point = isPoint(idOrPointOrOpts) || isTuple(idOrPointOrOpts)
    ? fromPointLike(idOrPointOrOpts)
    : undefined;
  const inlineOpts = (typeof idOrPointOrOpts === 'object' &&
    idOrPointOrOpts !== null &&
    !isPoint(idOrPointOrOpts) &&
    !isTuple(idOrPointOrOpts)
      ? idOrPointOrOpts
      : undefined);
  const merged = { ...inlineOpts, ...opts };
  const color = merged?.color ?? merged?.fill ?? merged?.stroke ?? '#e2e8f0';
  const x = point?.x ?? merged?.x ?? 400;
  const y = point?.y ?? merged?.y ?? 240;
  return attachMobjectApi({
    id,
    kind: 'dot',
    x,
    y,
    // Manim CE Dot default radius is 0.08 scene units.
    // Our scene scale is 80 px/unit, so default is 6.4 px.
    radius: merged?.radius ?? 6.4,
    stroke: merged?.stroke ?? color,
    fill: merged?.fill ?? color,
    strokeWidth: merged?.strokeWidth ?? 0,
  });
}

export function TitleText(
  id: string,
  opts: {
    x?: number;
    y?: number;
    value: string;
    stroke?: string;
    fill?: string;
    fontSize?: number;
  }
): Mobject {
  return attachMobjectApi({
    id,
    kind: 'text',
    x: opts.x ?? CENTER_X,
    y: opts.y ?? CENTER_Y,
    text: opts.value,
    stroke: opts.stroke ?? '#e2e8f0',
    fill: opts.fill ?? '#e2e8f0',
    strokeWidth: 1,
    fontSize: opts.fontSize ?? 46,
  });
}

import { renderMathTexHtml } from '$lib/feature-sweep/mathtex';
import { renderMathTexSvg } from '$lib/feature-sweep/mathtex-svg';

export function KMathTex(
  idOrTex: string,
  texOrOpts?: string | {
    x?: number;
    y?: number;
    fontSize?: number;
    color?: Color;
    fill?: string;
    stroke?: string;
  },
  maybeOpts?: {
    x?: number;
    y?: number;
    fontSize?: number;
    color?: Color;
    fill?: string;
    stroke?: string;
  }
): Mobject {
  const hasId = typeof texOrOpts === 'string';
  const id = hasId ? idOrTex : autoId('mathtex');
  const tex = hasId ? (texOrOpts as string) : idOrTex;
  const opts = (hasId ? maybeOpts : texOrOpts) ?? {};
  const color = opts.color ?? opts.fill ?? opts.stroke ?? '#e2e8f0';
  return attachMobjectApi({
    id,
    kind: 'kmathtex',
    x: opts.x ?? 400,
    y: opts.y ?? 240,
    tex,
    texHtml: renderMathTexHtml(tex),
    text: tex,
    stroke: opts.stroke ?? color,
    fill: opts.fill ?? color,
    strokeWidth: 1,
    fontSize: opts.fontSize ?? 44,
  });
}

export function MathTex(
  idOrTex: string,
  texOrOpts?: string | {
    x?: number;
    y?: number;
    fontSize?: number;
    color?: Color;
    fill?: string;
    stroke?: string;
  },
  maybeOpts?: {
    x?: number;
    y?: number;
    fontSize?: number;
    color?: Color;
    fill?: string;
    stroke?: string;
  }
): Mobject {
  const hasId = typeof texOrOpts === 'string';
  const id = hasId ? idOrTex : autoId('mathtex');
  const tex = hasId ? (texOrOpts as string) : idOrTex;
  const opts = (hasId ? maybeOpts : texOrOpts) ?? {};
  const color = opts.color ?? opts.fill ?? opts.stroke ?? '#e2e8f0';
  const tokens = tokenizeMathTex(tex);
  const fontSize = opts.fontSize ?? 44;
  const renderedTokens = tokens.map((token) => {
    const svg = renderMathTexSvg(token);
    return {
      token,
      svg,
      html: renderMathTexHtml(token),
      fallback: svg.svg.includes('<text '),
    };
  });
  const widths = renderedTokens.map(({ svg, token, fallback }) => {
    const textLen = displayToken(token).length;
    if (fallback) {
      return Math.max(fontSize * 0.55, textLen * fontSize * 0.56);
    }
    return Math.max(
      fontSize * 0.36,
      (svg.width / 44) * fontSize,
      textLen * fontSize * 0.32
    );
  });
  const gap = Math.max(8, fontSize * 0.18);
  const totalWidth =
    widths.reduce((sum, width) => sum + width, 0) +
    Math.max(0, tokens.length - 1) * gap;
  let cursor = (opts.x ?? CENTER_X) - totalWidth / 2;
  const y = opts.y ?? CENTER_Y;
  const children = renderedTokens.map(({ token, svg, html }, idx) => {
    const width = widths[idx];
    const x = cursor + width / 2;
    cursor += width + gap;
    return attachMobjectApi({
      id: `${id}_tok_${idx}`,
      kind: 'mathtex',
      x,
      y,
      text: displayToken(token),
      token,
      tex: token,
      texSvg: svg.svg,
      texWidth: svg.width,
      texHeight: svg.height,
      texHtml: html,
      stroke: opts.stroke ?? color,
      fill: opts.fill ?? color,
      strokeWidth: 1,
      fontSize,
    });
  });
  return attachMobjectApi({
    id,
    kind: 'group',
    tex,
    x: opts.x ?? CENTER_X,
    y,
    stroke: opts.stroke ?? color,
    fill: opts.fill ?? color,
    strokeWidth: 0,
    children,
  });
}

export function Path(
  id: string,
  opts: {
    points: Point[];
    stroke: string;
    strokeWidth?: number;
    closed?: boolean;
  }
): Mobject {
  return attachMobjectApi({
    id,
    kind: 'path',
    points: opts.points,
    stroke: opts.stroke,
    strokeWidth: opts.strokeWidth ?? 8,
    fill: 'none',
    closed: opts.closed ?? true
  });
}

export function Line(
  start: PointLike,
  end: PointLike,
  opts?: {
    id?: string;
    stroke?: string;
    color?: Color;
    strokeWidth?: number;
  }
): Mobject {
  const stroke = opts?.color ?? opts?.stroke ?? '#e2e8f0';
  return Path(opts?.id ?? autoId('line'), {
    points: [fromPointLike(start), fromPointLike(end)],
    stroke,
    strokeWidth: opts?.strokeWidth ?? 6,
    closed: false,
  });
}

function cubicBezierPoint(
  t: number,
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point
): Point {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: (uuu * p0.x) + (3 * uu * t * p1.x) + (3 * u * tt * p2.x) + (ttt * p3.x),
    y: (uuu * p0.y) + (3 * uu * t * p1.y) + (3 * u * tt * p2.y) + (ttt * p3.y),
  };
}

export function CubicBezier(
  a: string | PointLike,
  b: PointLike,
  c: PointLike,
  d: PointLike,
  e?: PointLike | { stroke?: string; strokeWidth?: number; samples?: number },
  f?: { stroke?: string; strokeWidth?: number; samples?: number }
): Mobject {
  const id = typeof a === 'string' ? a : autoId('cubic_bezier');
  const p0 = fromPointLike((typeof a === 'string' ? b : a) as PointLike);
  const p1 = fromPointLike((typeof a === 'string' ? c : b) as PointLike);
  const p2 = fromPointLike((typeof a === 'string' ? d : c) as PointLike);
  const p3 = fromPointLike((typeof a === 'string' ? (e as PointLike) : d) as PointLike);
  const opts = (typeof a === 'string' ? f : e) as
    | { stroke?: string; strokeWidth?: number; samples?: number }
    | undefined;
  const samples = Math.max(8, opts?.samples ?? 64);
  const points: Point[] = [];
  for (let i = 0; i <= samples; i += 1) {
    points.push(cubicBezierPoint(i / samples, p0, p1, p2, p3));
  }
  return Path(id, {
    points,
    closed: false,
    stroke: opts?.stroke ?? '#e2e8f0',
    strokeWidth: opts?.strokeWidth ?? 6,
  });
}

export function VGroup(id: string, ...children: Mobject[]): Mobject {
  return attachMobjectApi({
    id,
    kind: 'group',
    children,
    stroke: 'none',
    strokeWidth: 0,
  });
}

function tokenizeMathTex(tex: string): string[] {
  const input = tex.replace(/\s+/g, '');
  const out: string[] = [];
  let i = 0;

  function readGroup(start: number): { token: string; next: number } {
    if (input[start] !== '{') {
      return { token: input[start] ?? '', next: start + 1 };
    }
    let depth = 0;
    let j = start;
    while (j < input.length) {
      const ch = input[j];
      if (ch === '{') depth += 1;
      if (ch === '}') {
        depth -= 1;
        if (depth === 0) {
          return { token: input.slice(start, j + 1), next: j + 1 };
        }
      }
      j += 1;
    }
    return { token: input.slice(start), next: input.length };
  }

  function readBase(start: number): { token: string; next: number } {
    const ch = input[start];
    if (!ch) return { token: '', next: start };
    if (ch === '\\') {
      let j = start + 1;
      while (j < input.length && /[a-zA-Z]/.test(input[j])) j += 1;
      if (j === start + 1) j += 1;
      return { token: input.slice(start, j), next: j };
    }
    if (ch === '{') return readGroup(start);
    let j = start + 1;
    while (j < input.length && /[a-zA-Z0-9]/.test(input[j])) j += 1;
    return { token: input.slice(start, j), next: j };
  }

  while (i < input.length) {
    const ch = input[i];
    if ('=+-*/(),'.includes(ch)) {
      out.push(ch);
      i += 1;
      continue;
    }

    const base = readBase(i);
    if (!base.token) break;
    i = base.next;
    let token = base.token;

    while (i < input.length && (input[i] === '^' || input[i] === '_')) {
      const op = input[i];
      const rhs = readBase(i + 1);
      token += op + rhs.token;
      i = rhs.next;
    }
    out.push(token);
  }

  return out.filter((token) => token.length > 0);
}

function displayToken(token: string): string {
  return token
    .replaceAll('\\pi', 'π')
    .replaceAll('\\theta', 'θ')
    .replaceAll('\\cdot', '·')
    .replaceAll('{', '')
    .replaceAll('}', '');
}

export function Create(
  target: Mobject,
  opts?: { runTime?: number }
):
  | PendingAnimation
  | PendingAnimation[] {
  const targets = flattenRenderable(target);
  if (targets.length === 1) {
    return {
      kind: 'create',
      targetId: targets[0].id,
      runTime: opts?.runTime
    };
  }
  return targets.map((item) => ({
    kind: 'create',
    targetId: item.id,
    runTime: opts?.runTime
  }));
}

export function FadeIn(
  target: Mobject,
  opts?: { runTime?: number }
):
  | PendingAnimation
  | PendingAnimation[] {
  return Create(target, opts);
}

export function FadeOut(
  target: Mobject,
  opts?: { runTime?: number }
):
  | PendingAnimation
  | PendingAnimation[] {
  const targets = flattenRenderable(target);
  if (targets.length === 1) {
    return {
      kind: 'fadeOut',
      targetId: targets[0].id,
      runTime: opts?.runTime,
    };
  }
  return targets.map((item) => ({
    kind: 'fadeOut',
    targetId: item.id,
    runTime: opts?.runTime,
  }));
}

export function Wait(
  runTime: number
): Omit<Animation, 'runTime' | 'phase'> & { runTime: number } {
  return {
    kind: 'wait',
    runTime
  };
}

export function ReplacementTransform(
  source: Mobject,
  target: Mobject,
  opts?: { runTime?: number }
): Omit<Animation, 'runTime' | 'phase'> & { runTime?: number } {
  return {
    kind: 'replacementTransform',
    sourceId: source.id,
    targetId: target.id,
    runTime: opts?.runTime
  };
}

export function TransformMatchingTex(
  source: Mobject,
  target: Mobject,
  opts?: { runTime?: number }
): PendingAnimation[] {
  const runTime = opts?.runTime;
  const sourceParts = flattenRenderable(source);
  const targetParts = flattenRenderable(target);
  const sourceByToken = new Map<string, Mobject[]>();
  const targetByToken = new Map<string, Mobject[]>();

  for (const part of sourceParts) {
    const key = part.token ?? part.text ?? '';
    const list = sourceByToken.get(key) ?? [];
    list.push(part);
    sourceByToken.set(key, list);
  }
  for (const part of targetParts) {
    const key = part.token ?? part.text ?? '';
    const list = targetByToken.get(key) ?? [];
    list.push(part);
    targetByToken.set(key, list);
  }

  const animations: PendingAnimation[] = [];
  const tokenKeys = new Set([
    ...sourceByToken.keys(),
    ...targetByToken.keys(),
  ]);
  for (const token of tokenKeys) {
    const src = sourceByToken.get(token) ?? [];
    const dst = targetByToken.get(token) ?? [];
    const matched = Math.min(src.length, dst.length);
    for (let i = 0; i < matched; i += 1) {
      animations.push(ReplacementTransform(src[i], dst[i], { runTime }));
    }
    for (let i = matched; i < src.length; i += 1) {
      animations.push(...toPendingAnimations(FadeOut(src[i], { runTime })));
    }
    for (let i = matched; i < dst.length; i += 1) {
      animations.push(...toPendingAnimations(Create(dst[i], { runTime })));
    }
  }
  return animations;
}

function toPendingAnimations(
  animation: PendingAnimation | PendingAnimation[]
): PendingAnimation[] {
  return Array.isArray(animation) ? animation : [animation];
}

export function MoveAlongPath(
  target: Mobject,
  path: Mobject,
  opts?: { runTime?: number }
): Omit<Animation, 'runTime' | 'phase'> & { runTime?: number } {
  return {
    kind: 'moveAlongPath',
    targetId: target.id,
    pathId: path.id,
    runTime: opts?.runTime,
  };
}

export const ORIGIN: [number, number, number] = [0, 0, 0];
export const UP: [number, number, number] = [0, 1, 0];
export const DOWN: [number, number, number] = [0, -1, 0];
export const LEFT: [number, number, number] = [-1, 0, 0];
export const RIGHT: [number, number, number] = [1, 0, 0];
export const UL: [number, number, number] = [-1, 1, 0];
export const UR: [number, number, number] = [1, 1, 0];
export const DL: [number, number, number] = [-1, -1, 0];
export const DR: [number, number, number] = [1, -1, 0];
export const IN: [number, number, number] = [0, 0, -1];
export const OUT: [number, number, number] = [0, 0, 1];
