export type MobjectKind = 'square' | 'circle' | 'text' | 'path';

export type Point = { x: number; y: number };

export type Mobject = {
  id: string;
  kind: MobjectKind;
  stroke: string;
  strokeWidth: number;
  fill?: string;
  x?: number;
  y?: number;
  size?: number;
  radius?: number;
  text?: string;
  fontSize?: number;
  points?: Point[];
  closed?: boolean;
};

export type Animation = {
  kind: 'create' | 'wait' | 'replacementTransform';
  targetId?: string;
  sourceId?: string;
  runTimeMs: number;
  phase: number;
};

export class Scene {
  private defaultCreateMs: number;
  private phase = 0;
  mobjects: Mobject[] = [];
  timeline: Animation[] = [];

  constructor(defaultCreateMs = 800) {
    this.defaultCreateMs = defaultCreateMs;
  }

  add(...mobjects: Mobject[]): void {
    this.mobjects.push(...mobjects);
  }

  play(...animations: Array<Omit<Animation, 'runTimeMs' | 'phase'> & {
    runTimeMs?: number;
  }>): void {
    if (animations.length === 0) return;
    for (const animation of animations) {
      this.timeline.push({
        ...animation,
        runTimeMs: animation.runTimeMs ?? this.defaultCreateMs,
        phase: this.phase
      });
    }
    this.phase += 1;
  }
}

export function Square(id: string, opts: { x: number; y: number; size: number; stroke: string; strokeWidth?: number }): Mobject {
  return {
    id,
    kind: 'square',
    x: opts.x,
    y: opts.y,
    size: opts.size,
    stroke: opts.stroke,
    strokeWidth: opts.strokeWidth ?? 8,
    fill: 'none',
  };
}

export function Circle(id: string, opts: { x: number; y: number; radius: number; stroke: string; strokeWidth?: number }): Mobject {
  return {
    id,
    kind: 'circle',
    x: opts.x,
    y: opts.y,
    radius: opts.radius,
    stroke: opts.stroke,
    strokeWidth: opts.strokeWidth ?? 8,
    fill: 'none',
  };
}

export function TitleText(id: string, opts: { x: number; y: number; value: string; stroke?: string; fill?: string; fontSize?: number }): Mobject {
  return {
    id,
    kind: 'text',
    x: opts.x,
    y: opts.y,
    text: opts.value,
    stroke: opts.stroke ?? '#e2e8f0',
    fill: opts.fill ?? '#e2e8f0',
    strokeWidth: 1,
    fontSize: opts.fontSize ?? 46,
  };
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
  return {
    id,
    kind: 'path',
    points: opts.points,
    stroke: opts.stroke,
    strokeWidth: opts.strokeWidth ?? 8,
    fill: 'none',
    closed: opts.closed ?? true
  };
}

export function Create(
  target: Mobject,
  opts?: { runTimeMs?: number }
): Omit<Animation, 'runTimeMs' | 'phase'> & { runTimeMs?: number } {
  return {
    kind: 'create',
    targetId: target.id,
    runTimeMs: opts?.runTimeMs
  };
}

export function FadeIn(
  target: Mobject,
  opts?: { runTimeMs?: number }
): Omit<Animation, 'runTimeMs' | 'phase'> & { runTimeMs?: number } {
  return {
    kind: 'create',
    targetId: target.id,
    runTimeMs: opts?.runTimeMs
  };
}

export function Wait(
  runTimeMs: number
): Omit<Animation, 'runTimeMs' | 'phase'> & { runTimeMs: number } {
  return {
    kind: 'wait',
    runTimeMs
  };
}

export function ReplacementTransform(
  source: Mobject,
  target: Mobject,
  opts?: { runTimeMs?: number }
): Omit<Animation, 'runTimeMs' | 'phase'> & { runTimeMs?: number } {
  return {
    kind: 'replacementTransform',
    sourceId: source.id,
    targetId: target.id,
    runTimeMs: opts?.runTimeMs
  };
}
