export type MobjectKind = 'square' | 'circle' | 'text' | 'path' | 'dot';

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
  fontSize?: number;
  points?: Point[];
  closed?: boolean;
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
    this.mobjects.push(...mobjects);
  }

  play(...animations: Array<Omit<Animation, 'runTime' | 'phase'> & {
    runTime?: number;
  }>): void {
    if (animations.length === 0) return;
    for (const animation of animations) {
      this.timeline.push({
        ...animation,
        runTime: animation.runTime ?? this.defaultCreateSec,
        phase: this.phase
      });
    }
    this.phase += 1;
  }
}

let autoIdSeq = 0;
function autoId(prefix: string): string {
  autoIdSeq += 1;
  return `${prefix}_${autoIdSeq}`;
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

export function Square(id: string, opts: { x: number; y: number; size: number; stroke: string; strokeWidth?: number }): Mobject {
  return attachMobjectApi({
    id,
    kind: 'square',
    x: opts.x,
    y: opts.y,
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
  idOrPointOrOpts?: string | Point | {
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
  const point = isPoint(idOrPointOrOpts) ? idOrPointOrOpts : undefined;
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
    radius: merged?.radius ?? 8,
    stroke: merged?.stroke ?? color,
    fill: merged?.fill ?? color,
    strokeWidth: merged?.strokeWidth ?? 2,
  });
}

export function TitleText(id: string, opts: { x: number; y: number; value: string; stroke?: string; fill?: string; fontSize?: number }): Mobject {
  return attachMobjectApi({
    id,
    kind: 'text',
    x: opts.x,
    y: opts.y,
    text: opts.value,
    stroke: opts.stroke ?? '#e2e8f0',
    fill: opts.fill ?? '#e2e8f0',
    strokeWidth: 1,
    fontSize: opts.fontSize ?? 46,
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

export function Create(
  target: Mobject,
  opts?: { runTime?: number }
): Omit<Animation, 'runTime' | 'phase'> & { runTime?: number } {
  return {
    kind: 'create',
    targetId: target.id,
    runTime: opts?.runTime
  };
}

export function FadeIn(
  target: Mobject,
  opts?: { runTime?: number }
): Omit<Animation, 'runTime' | 'phase'> & { runTime?: number } {
  return {
    kind: 'create',
    targetId: target.id,
    runTime: opts?.runTime
  };
}

export function FadeOut(
  target: Mobject,
  opts?: { runTime?: number }
): Omit<Animation, 'runTime' | 'phase'> & { runTime?: number } {
  return {
    kind: 'fadeOut',
    targetId: target.id,
    runTime: opts?.runTime,
  };
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
