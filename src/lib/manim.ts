export type Edge = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';

export type Vec2 = { x: number; y: number };

type NodeKind = 'rect' | 'text' | 'group';

type AnimationKind = 'create' | 'fadeIn' | 'transform';

export type Animation = {
  kind: AnimationKind;
  targetId: string;
  toId?: string;
};

export type SceneStepMeta = {
  label?: string;
  note?: string;
  rowName?: string;
};

export type PlayOptions = {
  runTime?: number;
  meta?: SceneStepMeta;
};

export type TimelineEntry = {
  animations: Animation[];
  runTime: number;
  meta?: SceneStepMeta;
};

class BaseNode {
  readonly id: string;
  readonly kind: NodeKind;
  position: Vec2 = { x: 0, y: 0 };
  scaleFactor = 1;
  color = '#ffffff';

  constructor(id: string, kind: NodeKind) {
    this.id = id;
    this.kind = kind;
  }

  scale(value: number): this {
    this.scaleFactor *= value;
    return this;
  }

  setColor(value: string): this {
    this.color = value;
    return this;
  }

  toEdge(edge: Edge, distance = 1): this {
    if (edge === 'LEFT') this.position = { x: -distance, y: 0 };
    if (edge === 'RIGHT') this.position = { x: distance, y: 0 };
    if (edge === 'UP') this.position = { x: 0, y: distance };
    if (edge === 'DOWN') this.position = { x: 0, y: -distance };
    return this;
  }

  nextTo(node: BaseNode, edge: Edge, distance = 0.5): this {
    if (edge === 'RIGHT') {
      this.position = { x: node.position.x + distance, y: node.position.y };
    }
    if (edge === 'LEFT') {
      this.position = { x: node.position.x - distance, y: node.position.y };
    }
    if (edge === 'UP') {
      this.position = { x: node.position.x, y: node.position.y + distance };
    }
    if (edge === 'DOWN') {
      this.position = { x: node.position.x, y: node.position.y - distance };
    }
    return this;
  }
}

export class Rect extends BaseNode {
  width: number;
  height: number;

  constructor(id: string, width: number, height: number) {
    super(id, 'rect');
    this.width = width;
    this.height = height;
  }
}

export class Text extends BaseNode {
  value: string;

  constructor(id: string, value: string) {
    super(id, 'text');
    this.value = value;
  }
}

export class VGroup extends BaseNode {
  children: BaseNode[];

  constructor(id: string, ...children: BaseNode[]) {
    super(id, 'group');
    this.children = children;
  }
}

export class Scene {
  timeline: TimelineEntry[] = [];

  play(animations: Animation | Animation[], options: PlayOptions = {}): void {
    const sequence = Array.isArray(animations) ? animations : [animations];
    this.timeline.push({
      animations: sequence,
      runTime: options.runTime ?? 1,
      meta: options.meta,
    });
  }

  wait(seconds = 1, meta?: SceneStepMeta): void {
    this.timeline.push({ animations: [], runTime: seconds, meta });
  }
}

export function Create(node: BaseNode): Animation {
  return { kind: 'create', targetId: node.id };
}

export function FadeIn(node: BaseNode): Animation {
  return { kind: 'fadeIn', targetId: node.id };
}

export function Transform(from: BaseNode, to: BaseNode): Animation {
  return { kind: 'transform', targetId: from.id, toId: to.id };
}
