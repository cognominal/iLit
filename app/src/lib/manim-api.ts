import type { Object3D } from 'three';

export type MobjectKind =
  'square' | 'circle' | 'text' | 'path' | 'dot' |
  'mathtex' | 'kmathtex' | 'group' | 'svg' |
  'path3d' | 'sphere3d' | 'group3d';

export type Point = { x: number; y: number };
export type Point3D = { x: number; y: number; z: number };
type Color = string;
type PointLike = Point | [number, number, number?];
type Updater = (mobject: Mobject) => Mobject | void;
export type RateFunction = (t: number) => number;
type AnimationOpts = {
  runTime?: number;
  run_time?: number;
  rateFunc?: string | RateFunction;
  rate_func?: string | RateFunction;
};

export type MobjectSourceRef = {
  file: string;
  line: number;
  column?: number;
  label?: string;
};

export type ManimPointerEvent = {
  mobject: Mobject;
  mobjectId: string;
  sourceRef?: MobjectSourceRef;
  scenePoint: Point;
  nativeEvent: PointerEvent;
  object3d?: Object3D;
};

export type ManimDragEvent = ManimPointerEvent & {
  dragStartPoint: Point;
  dragPreviousPoint: Point;
  dragDelta: Point;
  dragTotalDelta: Point;
};

export type Mobject = {
  [index: number]: Mobject | undefined;
  id: string;
  kind: MobjectKind;
  sourceRef?: MobjectSourceRef;
  interactive?: boolean;
  draggable?: boolean;
  cursor?: string;
  userData?: Record<string, unknown>;
  stroke: string;
  strokeWidth: number;
  opacity?: number;
  fill?: string;
  x?: number;
  y?: number;
  size?: number;
  width?: number;
  height?: number;
  radius?: number;
  cornerRadius?: number;
  text?: string;
  textLines?: string[];
  textSegments?: Array<{ text: string; fill?: string }>;
  tex?: string;
  texHtml?: string;
  texSvg?: string;
  texWidth?: number;
  texHeight?: number;
  fontSize?: number;
  fontFamily?: string;
  rotation?: number;
  scaleFactor?: number;
  stretchX?: number;
  stretchY?: number;
  zIndex?: number;
  svgHref?: string;
  textAlign?: 'left' | 'center' | 'right';
  bullet?: string;
  points?: Point[];
  points3d?: Point3D[];
  center3d?: Point3D;
  closed?: boolean;
  pathRenderMode?: 'polyline' | 'cubic';
  children?: Mobject[];
  token?: string;
  is3d?: boolean;
  shade3d?: boolean;
  depthShade?: number;
  fillOpacity?: number;
  updaters?: Updater[];
  alwaysRedrawFactory?: () => Mobject;
  savedState?: Partial<Mobject>;
  target?: Mobject;
  animate?: AnimateBuilder;
  onPointerDown?: (event: ManimPointerEvent) => void;
  onPointerMove?: (event: ManimPointerEvent) => void;
  onPointerUp?: (event: ManimPointerEvent) => void;
  onPointerEnter?: (event: ManimPointerEvent) => void;
  onPointerLeave?: (event: ManimPointerEvent) => void;
  onDragStart?: (event: ManimDragEvent) => void;
  onDrag?: (event: ManimDragEvent) => void;
  onDragEnd?: (event: ManimDragEvent) => void;
  bindRenderObject?: (object: Object3D | null) => void;
  become?: (target: Mobject) => Mobject;
  moveTo?: (target: PointLike | Mobject) => Mobject;
  move_to?: (target: PointLike | Mobject) => Mobject;
  shift?: (delta: PointLike) => Mobject;
  scale?: (factor: number) => Mobject;
  rotate?: (angle: number) => Mobject;
  stretch?: (factor: number, dim?: number) => Mobject;
  flip?: (axis?: PointLike) => Mobject;
  copy?: (id?: string) => Mobject;
  setColor?: (color: Color) => Mobject;
  set_color?: (color: Color) => Mobject;
  setFill?: (fill: Color, opacity?: number) => Mobject;
  set_fill?: (fill: Color, opacity?: number) => Mobject;
  setStroke?: (stroke: Color, width?: number, opacity?: number) => Mobject;
  set_stroke?: (stroke: Color, width?: number, opacity?: number) => Mobject;
  setOpacity?: (opacity: number) => Mobject;
  set_opacity?: (opacity: number) => Mobject;
  setZIndex?: (zIndex: number) => Mobject;
  set_z_index?: (zIndex: number) => Mobject;
  matchColor?: (target: Mobject) => Mobject;
  match_color?: (target: Mobject) => Mobject;
  matchFill?: (target: Mobject) => Mobject;
  match_fill?: (target: Mobject) => Mobject;
  matchStroke?: (target: Mobject) => Mobject;
  match_stroke?: (target: Mobject) => Mobject;
  matchOpacity?: (target: Mobject) => Mobject;
  match_opacity?: (target: Mobject) => Mobject;
  surround?: (target: Mobject, buff?: number) => Mobject;
  generateTarget?: () => Mobject;
  generate_target?: () => Mobject;
  saveState?: () => Mobject;
  save_state?: () => Mobject;
  restore?: () => Mobject;
  add?: (...children: Mobject[]) => Mobject;
  remove?: (...children: Mobject[]) => Mobject;
  addUpdater?: (updater: Updater) => Mobject;
  add_updater?: (updater: Updater) => Mobject;
  removeUpdater?: (updater: Updater) => Mobject;
  remove_updater?: (updater: Updater) => Mobject;
  clearUpdaters?: () => Mobject;
  clear_updaters?: () => Mobject;
  get?: (index: number) => Mobject | undefined;
  slice?: (start?: number, end?: number) => Mobject[];
  setX?: (x: number) => Mobject;
  set_x?: (x: number) => Mobject;
  setY?: (y: number) => Mobject;
  set_y?: (y: number) => Mobject;
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
  plot?: (
    fn: (x: number) => number,
    opts?: { id?: string; color?: Color; strokeWidth?: number; samples?: number }
  ) => Mobject;
};

export type CameraOrientation = {
  phi: number;
  theta: number;
  gamma: number;
  zoom: number;
};

type AmbientCameraRotation = {
  startPhase: number;
  endPhase: number | null;
  rate: number;
};

type AnimateBuilder = {
  become: (target: Mobject, opts?: AnimationOpts) => PendingAnimation;
  moveAlongPath: (path: Mobject, opts?: AnimationOpts) => PendingAnimation;
  shift: (delta: PointLike, opts?: AnimationOpts) => PendingAnimation;
  moveTo: (
    target: PointLike | Mobject,
    opts?: AnimationOpts
  ) => PendingAnimation;
  move_to: (
    target: PointLike | Mobject,
    opts?: AnimationOpts
  ) => PendingAnimation;
  scale: (factor: number, opts?: AnimationOpts) => PendingAnimation;
  setOpacity: (opacity: number, opts?: AnimationOpts) => PendingAnimation;
  set_opacity: (opacity: number, opts?: AnimationOpts) => PendingAnimation;
  setValue: (value: number, opts?: AnimationOpts) => PendingAnimation;
  set_value: (value: number, opts?: AnimationOpts) => PendingAnimation;
};

export type Animation = {
  kind:
    | 'create'
    | 'fadeIn'
    | 'wait'
    | 'replacementTransform'
    | 'fadeOut'
    | 'moveAlongPath'
    | 'transform'
    | 'value';
  targetId?: string;
  sourceId?: string;
  pathId?: string;
  tracker?: ValueTracker;
  rateFunc?: string | RateFunction;
  runTime: number;
  phase: number;
  meta?: Record<string, unknown>;
};

type PendingAnimation =
  Omit<Animation, 'runTime' | 'phase'> & {
    runTime?: number;
    _introducerRoot?: Mobject;
  };

export type ScenePhase = {
  phase: number;
  durationSec: number;
  animations: Animation[];
};

export class Scene {
  private defaultCreateSec: number;
  private phase = 0;
  private baseMobjects = new Map<string, Mobject>();
  private baseSceneRoots: Mobject[] = [];
  private baseForegroundRoots: Mobject[] = [];
  private liveSceneRoots: Mobject[] = [];
  private liveForegroundRoots: Mobject[] = [];
  protected cameraOrientation: CameraOrientation = {
    phi: 0,
    theta: 0,
    gamma: 0,
    zoom: 1,
  };
  protected ambientCameraRotations: AmbientCameraRotation[] = [];
  mobjects: Mobject[] = [];
  foregroundMobjects: Mobject[] = [];
  sections: string[] = [];
  timeline: Animation[] = [];

  constructor(defaultCreateSec = 1.0) {
    this.defaultCreateSec = defaultCreateSec;
  }

  add(...mobjects: Mobject[]): void {
    this.appendMobjects('scene', mobjects, true);
  }

  remove(...mobjects: Mobject[]): void {
    const removeIds = new Set(flattenMobjects(mobjects).map((mobject) => mobject.id));
    this.mobjects = this.mobjects.filter((mobject) => !removeIds.has(mobject.id));
    this.foregroundMobjects = this.foregroundMobjects.filter(
      (mobject) => !removeIds.has(mobject.id)
    );
  }

  clear(): void {
    this.mobjects = [];
    this.foregroundMobjects = [];
  }

  replace(oldMobject: Mobject, newMobject: Mobject): void {
    this.mobjects = this.mobjects.map((mobject) =>
      mobject.id === oldMobject.id ? newMobject : mobject
    );
    this.foregroundMobjects = this.foregroundMobjects.map((mobject) =>
      mobject.id === oldMobject.id ? newMobject : mobject
    );
  }

  bringToFront(...mobjects: Mobject[]): void {
    const bringIds = new Set(flattenMobjects(mobjects).map((mobject) => mobject.id));
    const moved = this.mobjects.filter((mobject) => bringIds.has(mobject.id));
    this.mobjects = this.mobjects.filter((mobject) => !bringIds.has(mobject.id));
    this.mobjects.push(...moved);
  }

  bring_to_front(...mobjects: Mobject[]): void {
    this.bringToFront(...mobjects);
  }

  bringToBack(...mobjects: Mobject[]): void {
    const bringIds = new Set(flattenMobjects(mobjects).map((mobject) => mobject.id));
    const moved = this.mobjects.filter((mobject) => bringIds.has(mobject.id));
    this.mobjects = this.mobjects.filter((mobject) => !bringIds.has(mobject.id));
    this.mobjects.unshift(...moved);
  }

  bring_to_back(...mobjects: Mobject[]): void {
    this.bringToBack(...mobjects);
  }

  addForegroundMobject(...mobjects: Mobject[]): void {
    this.appendMobjects('foreground', mobjects, true);
  }

  add_foreground_mobject(...mobjects: Mobject[]): void {
    this.addForegroundMobject(...mobjects);
  }

  removeForegroundMobject(...mobjects: Mobject[]): void {
    const ids = new Set(flattenMobjects(mobjects).map((mobject) => mobject.id));
    this.foregroundMobjects = this.foregroundMobjects.filter(
      (mobject) => !ids.has(mobject.id)
    );
  }

  remove_foreground_mobject(...mobjects: Mobject[]): void {
    this.removeForegroundMobject(...mobjects);
  }

  play(...animations: Array<
    | (Omit<Animation, 'runTime' | 'phase'> & { runTime?: number })
    | Array<Omit<Animation, 'runTime' | 'phase'> & { runTime?: number }>
    | AnimationOpts
  >): void {
    if (animations.length === 0) return;
    const last = animations[animations.length - 1];
    const trailingOpts = isAnimationOpts(last) ? last : undefined;
    const items = trailingOpts ? animations.slice(0, -1) : animations;
    const flat = items.flat() as PendingAnimation[];
    const introduced = new Set<string>();
    for (const animation of flat) {
      const root = animation._introducerRoot;
      let introducedRoot = false;
      if (
        root &&
        (
          animation.kind === 'create' ||
          animation.kind === 'fadeIn' ||
          animation.kind === 'moveAlongPath' ||
          animation.kind === 'replacementTransform'
        ) &&
        !introduced.has(root.id) &&
        !this.mobjects.some((mobject) => mobject.id === root.id) &&
        !flattenMobjects(this.mobjects).some((mobject) => mobject.id === root.id)
      ) {
        // Introduced roots must be part of the base scene graph so
        // frame evaluation can reset from a complete scene state and
        // then apply intro progress back down to 0 when needed.
        this.appendMobjects('scene', [root], true);
        introduced.add(root.id);
        introducedRoot = true;
      }
      this.timeline.push({
        ...animation,
        meta: introducedRoot
          ? { ...(animation.meta ?? {}), introduced: true }
          : animation.meta,
        runTime:
          animation.runTime ??
          trailingOpts?.run_time ??
          trailingOpts?.runTime ??
          this.defaultCreateSec,
        phase: this.phase
      });
    }
    this.phase += 1;
  }

  wait(runTime: number): void {
    this.play(Wait(runTime));
  }

  waitUntil(_predicate: () => boolean, maxTime = this.defaultCreateSec): void {
    this.wait(maxTime);
  }

  wait_until(predicate: () => boolean, maxTime?: number): void {
    this.waitUntil(predicate, maxTime);
  }

  pause(runTime = this.defaultCreateSec): void {
    this.wait(runTime);
  }

  nextSection(name: string): void {
    this.sections.push(name);
  }

  next_section(name: string): void {
    this.nextSection(name);
  }

  construct(): void {}

  render(): Scene {
    return this;
  }

  getBaseMobject(id: string): Mobject | undefined {
    return this.baseMobjects.get(id);
  }

  rememberBaseMobjects(mobjects: Mobject[]): void {
    for (const mobject of flattenSceneMobjects(mobjects)) {
      if (!this.baseMobjects.has(mobject.id)) {
        this.baseMobjects.set(mobject.id, cloneMobject(mobject, mobject.id));
      }
    }
  }

  getBaseSceneRoots(): Mobject[] {
    return this.baseSceneRoots.map((mobject) => cloneMobject(mobject, mobject.id));
  }

  getBaseForegroundRoots(): Mobject[] {
    return this.baseForegroundRoots.map((mobject) =>
      cloneMobject(mobject, mobject.id)
    );
  }

  getLiveSceneRoots(): Mobject[] {
    return this.liveSceneRoots;
  }

  getLiveForegroundRoots(): Mobject[] {
    return this.liveForegroundRoots;
  }

  restoreLiveRootsFromBase(): void {
    const baseSceneById = new Map(
      this.baseSceneRoots.map((mobject) => [mobject.id, mobject])
    );
    const baseForegroundById = new Map(
      this.baseForegroundRoots.map((mobject) => [mobject.id, mobject])
    );

    for (const mobject of this.liveSceneRoots) {
      const snapshot = baseSceneById.get(mobject.id);
      if (snapshot) {
        restoreMobject(mobject, snapshot);
      }
    }
    for (const mobject of this.liveForegroundRoots) {
      const snapshot = baseForegroundById.get(mobject.id);
      if (snapshot) {
        restoreMobject(mobject, snapshot);
      }
    }
  }

  getBaseCameraOrientation(): CameraOrientation {
    return { ...this.cameraOrientation };
  }

  getAmbientCameraRotations(): AmbientCameraRotation[] {
    return this.ambientCameraRotations.map((rotation) => ({ ...rotation }));
  }

  protected currentPhase(): number {
    return this.phase;
  }

  private appendMobjects(
    layer: 'scene' | 'foreground',
    mobjects: Mobject[],
    rememberRoots: boolean
  ): void {
    this.rememberBaseMobjects(mobjects);
    const target = layer === 'scene' ? this.mobjects : this.foregroundMobjects;
    target.push(...mobjects);
    if (!rememberRoots) return;
    const rootSnapshots = layer === 'scene'
      ? this.baseSceneRoots
      : this.baseForegroundRoots;
    const liveRoots = layer === 'scene'
      ? this.liveSceneRoots
      : this.liveForegroundRoots;
    const knownIds = new Set(rootSnapshots.map((mobject) => mobject.id));
    for (const mobject of mobjects) {
      if (knownIds.has(mobject.id)) continue;
      rootSnapshots.push(cloneMobject(mobject, mobject.id));
      liveRoots.push(mobject);
      knownIds.add(mobject.id);
    }
  }
}

export class ThreeDScene extends Scene {
  setCameraOrientation(opts: {
    phi?: number;
    theta?: number;
    gamma?: number;
    zoom?: number;
  }): void {
    this.cameraOrientation = {
      phi: opts.phi ?? this.cameraOrientation.phi,
      theta: opts.theta ?? this.cameraOrientation.theta,
      gamma: opts.gamma ?? this.cameraOrientation.gamma,
      zoom: opts.zoom ?? this.cameraOrientation.zoom,
    };
  }

  set_camera_orientation(opts: {
    phi?: number;
    theta?: number;
    gamma?: number;
    zoom?: number;
  }): void {
    this.setCameraOrientation(opts);
  }

  beginAmbientCameraRotation(opts?: { rate?: number } | number): void {
    const rate = typeof opts === 'number' ? opts : (opts?.rate ?? 0);
    this.ambientCameraRotations.push({
      startPhase: this.timeline.length > 0 ? this.timeline[this.timeline.length - 1]!.phase : 0,
      endPhase: null,
      rate,
    });
  }

  begin_ambient_camera_rotation(opts?: { rate?: number } | number): void {
    this.beginAmbientCameraRotation(opts);
  }

  stopAmbientCameraRotation(): void {
    for (let i = this.ambientCameraRotations.length - 1; i >= 0; i -= 1) {
      const rotation = this.ambientCameraRotations[i]!;
      if (rotation.endPhase === null) {
        rotation.endPhase = this.currentPhase();
        return;
      }
    }
  }

  stop_ambient_camera_rotation(): void {
    this.stopAmbientCameraRotation();
  }
}

export class ValueTracker {
  readonly id: string;
  value: number;
  animate: AnimateBuilder;

  constructor(value: number) {
    this.id = autoId('value_tracker');
    this.value = value;
    this.animate = {
      become: () => Wait(0),
      moveAlongPath: () => Wait(0),
      shift: () => Wait(0),
      moveTo: () => Wait(0),
      move_to: () => Wait(0),
      scale: () => Wait(0),
      setOpacity: () => Wait(0),
      set_opacity: () => Wait(0),
      setValue: (value: number, opts?: AnimationOpts) =>
        this.setValueAnimation(value, opts),
      set_value: (value: number, opts?: AnimationOpts) =>
        this.setValueAnimation(value, opts),
    };
  }

  getValue(): number {
    return this.value;
  }

  get_value(): number {
    return this.getValue();
  }

  setValue(value: number): ValueTracker {
    this.value = value;
    return this;
  }

  set_value(value: number): ValueTracker {
    return this.setValue(value);
  }

  private setValueAnimation(value: number, opts?: AnimationOpts): PendingAnimation {
    const start = this.value;
    this.value = value;
      return {
      kind: 'value',
      tracker: this,
      rateFunc: normalizeRateFunction(opts),
      runTime: normalizeRunTime(opts),
      meta: {
        valueStart: start,
        valueEnd: value,
      },
    };
  }
}

let autoIdSeq = 0;
function autoId(prefix: string): string {
  autoIdSeq += 1;
  return `${prefix}_${autoIdSeq}`;
}

function sourceIdPrefix(ref: Pick<MobjectSourceRef, 'file' | 'line'>): string {
  return `${ref.file}:${ref.line}`;
}

function encodeSourceId(ref: MobjectSourceRef): string {
  const label = ref.label?.trim() ? ref.label : 'auto';
  return `${sourceIdPrefix(ref)}:${label}`;
}

function sourceLabelFromEncodedId(
  id: string,
  ref: Pick<MobjectSourceRef, 'file' | 'line'>
): string | null {
  const prefix = `${sourceIdPrefix(ref)}:`;
  if (!id.startsWith(prefix)) return null;
  const label = id.slice(prefix.length);
  return label.length > 0 ? label : null;
}

function mobjectSourceLabel(mobject: Mobject): string {
  const encodedLabel = mobject.sourceRef
    ? sourceLabelFromEncodedId(mobject.id, mobject.sourceRef)
    : null;
  return encodedLabel ??
    mobject.sourceRef?.label ??
    mobject.id ??
    mobject.kind;
}

function applySourceRefToTree(
  mobject: Mobject,
  ref: MobjectSourceRef
): void {
  if (!mobject.sourceRef) {
    mobject.sourceRef = {
      file: ref.file,
      line: ref.line,
      column: ref.column,
      label: mobject.id || ref.label || mobject.kind,
    };
    mobject.id = encodeSourceId(mobject.sourceRef);
  }
  for (const child of mobject.children ?? []) {
    applySourceRefToTree(child, ref);
  }
}

export function __attachMobjectSource<T extends Mobject>(
  mobject: T,
  ref: MobjectSourceRef
): T {
  applySourceRefToTree(mobject, ref);
  return mobject;
}

function flattenMobjects(mobjects: Mobject[]): Mobject[] {
  const flat: Mobject[] = [];
  for (const mobject of mobjects) {
    if (mobject.kind === 'group' || mobject.kind === 'group3d') {
      flat.push(...flattenMobjects(mobject.children ?? []));
      continue;
    }
    flat.push(mobject);
  }
  return flat;
}

function flattenRenderable(mobject: Mobject): Mobject[] {
  if (mobject.kind === 'group' || mobject.kind === 'group3d') {
    return flattenMobjects(mobject.children ?? []);
  }
  return [mobject];
}

export function flattenSceneMobjects(mobjects: Mobject[]): Mobject[] {
  return flattenMobjects(mobjects);
}

const UNIT_PX = 80;
const FRAME_X_RADIUS = 7.111111111111111;
const FRAME_Y_RADIUS = 4;
const DEFAULT_STROKE_WIDTH = 4;
export const STAGE_WIDTH = FRAME_X_RADIUS * UNIT_PX * 2;
export const STAGE_HEIGHT = FRAME_Y_RADIUS * UNIT_PX * 2;
const CENTER_X = STAGE_WIDTH / 2;
const CENTER_Y = STAGE_HEIGHT / 2;

function getMobjectX(mobject: Mobject): number {
  if (
    (mobject.kind === 'group' || mobject.kind === 'group3d') &&
    (mobject.children?.length ?? 0) > 0
  ) {
    const bounds = mobjectBounds(mobject);
    return (bounds.left + bounds.right) / 2;
  }
  if (mobject.points && mobject.points.length > 0) {
    const xs = mobject.points.map((point) => point.x);
    return (Math.min(...xs) + Math.max(...xs)) / 2;
  }
  if (typeof mobject.x === 'number') return mobject.x;
  return mobject.x ?? CENTER_X;
}

function getMobjectY(mobject: Mobject): number {
  if (
    (mobject.kind === 'group' || mobject.kind === 'group3d') &&
    (mobject.children?.length ?? 0) > 0
  ) {
    const bounds = mobjectBounds(mobject);
    return (bounds.top + bounds.bottom) / 2;
  }
  if (mobject.points && mobject.points.length > 0) {
    const ys = mobject.points.map((point) => point.y);
    return (Math.min(...ys) + Math.max(...ys)) / 2;
  }
  if (typeof mobject.y === 'number') return mobject.y;
  return mobject.y ?? CENTER_Y;
}

function estimateTextWidth(mobject: Mobject): number {
  const text = mobject.text ?? '';
  const fontSize = mobject.fontSize ?? 32;
  return Math.max(fontSize * 0.7, text.length * fontSize * 0.5);
}

function estimateTextHeight(mobject: Mobject): number {
  const fontSize = mobject.fontSize ?? 32;
  return fontSize * 1.2;
}

function transformedBounds(
  bounds: { left: number; right: number; top: number; bottom: number },
  mobject: Mobject
): { left: number; right: number; top: number; bottom: number } {
  const centerX = (bounds.left + bounds.right) / 2;
  const centerY = (bounds.top + bounds.bottom) / 2;
  const scaleX = (mobject.scaleFactor ?? 1) * (mobject.stretchX ?? 1);
  const scaleY = (mobject.scaleFactor ?? 1) * (mobject.stretchY ?? 1);
  const halfWidth = ((bounds.right - bounds.left) / 2) * Math.abs(scaleX);
  const halfHeight = ((bounds.bottom - bounds.top) / 2) * Math.abs(scaleY);
  return {
    left: centerX - halfWidth,
    right: centerX + halfWidth,
    top: centerY - halfHeight,
    bottom: centerY + halfHeight,
  };
}

function mobjectBounds(mobject: Mobject): {
  left: number;
  right: number;
  top: number;
  bottom: number;
} {
  if (mobject.kind === 'group' || mobject.kind === 'group3d') {
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
    const halfW = (mobject.width ?? mobject.size ?? 0) / 2;
    const halfH = (mobject.height ?? mobject.size ?? 0) / 2;
    return transformedBounds({
      left: x - halfW,
      right: x + halfW,
      top: y - halfH,
      bottom: y + halfH
    }, mobject);
  }
  if (mobject.kind === 'svg') {
    const halfW = (mobject.width ?? mobject.size ?? 0) / 2;
    const halfH = (mobject.height ?? mobject.radius ?? 0) / 2;
    return transformedBounds({
      left: x - halfW,
      right: x + halfW,
      top: y - halfH,
      bottom: y + halfH
    }, mobject);
  }
  if (mobject.kind === 'circle' || mobject.kind === 'dot') {
    const halfW = (mobject.width ?? (mobject.radius ?? 0) * 2) / 2;
    const halfH = (mobject.height ?? (mobject.radius ?? 0) * 2) / 2;
    return transformedBounds({
      left: x - halfW,
      right: x + halfW,
      top: y - halfH,
      bottom: y + halfH
    }, mobject);
  }
  if (mobject.kind === 'path') {
    const points = mobject.points ?? [];
    if (points.length === 0) return { left: x, right: x, top: y, bottom: y };
    return transformedBounds({
      left: Math.min(...points.map((p) => p.x)),
      right: Math.max(...points.map((p) => p.x)),
      top: Math.min(...points.map((p) => p.y)),
      bottom: Math.max(...points.map((p) => p.y)),
    }, mobject);
  }
  if (mobject.kind === 'kmathtex' || mobject.kind === 'mathtex') {
    const fontSize = mobject.fontSize ?? 44;
    const texLen = (mobject.tex ?? mobject.text ?? '').length;
    const halfW = Math.max(fontSize * 0.7, texLen * fontSize * 0.5) / 2;
    const halfH = (fontSize * 1.9) / 2;
    return transformedBounds({
      left: x - halfW,
      right: x + halfW,
      top: y - halfH,
      bottom: y + halfH
    }, mobject);
  }
  const halfW = estimateTextWidth(mobject) / 2;
  const halfH = estimateTextHeight(mobject) / 2;
  return transformedBounds(
    { left: x - halfW, right: x + halfW, top: y - halfH, bottom: y + halfH },
    mobject
  );
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

function normalizeSceneLength(value: number | undefined): number | undefined {
  if (value === undefined) return undefined;
  return Math.abs(value) <= 20 ? value * UNIT_PX : value;
}

function translateMobject(mobject: Mobject, dxPx: number, dyPx: number): void {
  if (mobject.kind === 'group' || mobject.kind === 'group3d') {
    const children = mobject.children ?? [];
    for (const child of children) {
      translateMobject(child, dxPx, dyPx);
    }
  }
  if (mobject.points) {
    mobject.points = mobject.points.map((point) => ({
      x: point.x + dxPx,
      y: point.y + dyPx,
    }));
  }
  mobject.x = getMobjectX(mobject) + dxPx;
  mobject.y = getMobjectY(mobject) + dyPx;
}

function cloneMobject(
  mobject: Mobject,
  forcedId?: string,
  regenerateIds = false
): Mobject {
  const nextId = forcedId ?? (regenerateIds ? autoId(mobject.kind) : mobject.id);
  const clone: Mobject = {
    ...mobject,
    id: nextId,
    sourceRef: mobject.sourceRef ? { ...mobject.sourceRef } : undefined,
    points: mobject.points?.map((point) => ({ ...point })),
    points3d: mobject.points3d?.map((point) => ({ ...point })),
    center3d: mobject.center3d ? { ...mobject.center3d } : undefined,
    children: mobject.children?.map((child) =>
      cloneMobject(child, undefined, regenerateIds)
    ),
    updaters: mobject.updaters ? [...mobject.updaters] : [],
    savedState: mobject.savedState ? { ...mobject.savedState } : undefined,
    target: undefined,
    animate: undefined,
  };
  if (clone.sourceRef) {
    if (regenerateIds) {
      clone.sourceRef.label = nextId;
      clone.id = encodeSourceId(clone.sourceRef);
    } else {
      const encodedLabel = sourceLabelFromEncodedId(nextId, clone.sourceRef);
      if (encodedLabel) {
        clone.sourceRef.label = encodedLabel;
        clone.id = nextId;
      } else if (forcedId && forcedId !== mobject.id) {
        clone.sourceRef.label = forcedId;
        clone.id = encodeSourceId(clone.sourceRef);
      } else {
        clone.id = encodeSourceId(clone.sourceRef);
      }
    }
  }
  return attachMobjectApi(clone);
}

function syncGroupIndexProps(mobject: Mobject): void {
  if (mobject.kind !== 'group' && mobject.kind !== 'group3d') return;
  const children = mobject.children ?? [];
  let index = 0;
  while (index in mobject) {
    delete mobject[index];
    index += 1;
  }
  children.forEach((child, childIndex) => {
    mobject[childIndex] = child;
  });
}

function restoreMobject(target: Mobject, source: Mobject): void {
  const restored = cloneMobject(source, source.id);
  for (const key of Object.keys(target) as Array<keyof Mobject>) {
    if (!(key in restored)) {
      delete target[key];
    }
  }
  Object.assign(target, restored);
  attachMobjectApi(target);
}

function replaceChildById(
  mobject: Mobject,
  sourceId: string,
  replacement: Mobject
): boolean {
  if (mobject.kind !== 'group' && mobject.kind !== 'group3d') return false;
  const children = mobject.children ?? [];
  for (let i = 0; i < children.length; i += 1) {
    const child = children[i]!;
    if (child.id === sourceId) {
      children[i] = cloneMobject(replacement, replacement.id);
      syncGroupIndexProps(mobject);
      return true;
    }
    if (replaceChildById(child, sourceId, replacement)) {
      syncGroupIndexProps(mobject);
      return true;
    }
  }
  return false;
}

function removeChildById(mobject: Mobject, sourceId: string): boolean {
  if (mobject.kind !== 'group' && mobject.kind !== 'group3d') return false;
  const children = mobject.children ?? [];
  const index = children.findIndex((child) => child.id === sourceId);
  if (index >= 0) {
    children.splice(index, 1);
    syncGroupIndexProps(mobject);
    return true;
  }
  for (const child of children) {
    if (removeChildById(child, sourceId)) {
      syncGroupIndexProps(mobject);
      return true;
    }
  }
  return false;
}

function removeDuplicateRootIds(
  scene: Scene,
  targetId: string,
  keep: Mobject
): void {
  scene.mobjects = scene.mobjects.filter((mobject) =>
    mobject.id !== targetId || mobject === keep
  );
  scene.foregroundMobjects = scene.foregroundMobjects.filter((mobject) =>
    mobject.id !== targetId || mobject === keep
  );
}

function applyCompletedReplacementToScene(
  scene: Scene,
  sourceId: string,
  targetId: string
): void {
  const replacement =
    flattenSceneMobjects([...scene.mobjects, ...scene.foregroundMobjects])
      .find((mobject) => mobject.id === targetId) ??
    scene.getBaseMobject(targetId);
  if (!replacement) return;
  const finalized = cloneMobject(replacement, replacement.id);
  for (let i = 0; i < scene.mobjects.length; i += 1) {
    const mobject = scene.mobjects[i]!;
    if (mobject.id === sourceId) {
      scene.mobjects[i] = cloneMobject(finalized, finalized.id);
      removeDuplicateRootIds(scene, targetId, scene.mobjects[i]!);
      return;
    }
    if (replaceChildById(mobject, sourceId, finalized)) {
      scene.mobjects = scene.mobjects.filter((item) => item.id !== targetId);
      scene.foregroundMobjects = scene.foregroundMobjects.filter(
        (item) => item.id !== targetId
      );
      return;
    }
  }
  for (let i = 0; i < scene.foregroundMobjects.length; i += 1) {
    const mobject = scene.foregroundMobjects[i]!;
    if (mobject.id === sourceId) {
      scene.foregroundMobjects[i] = cloneMobject(finalized, finalized.id);
      removeDuplicateRootIds(scene, targetId, scene.foregroundMobjects[i]!);
      return;
    }
    if (replaceChildById(mobject, sourceId, finalized)) {
      scene.mobjects = scene.mobjects.filter((item) => item.id !== targetId);
      scene.foregroundMobjects = scene.foregroundMobjects.filter(
        (item) => item.id !== targetId
      );
      return;
    }
  }
}

function applyCompletedFadeOutToScene(scene: Scene, sourceId: string): void {
  scene.mobjects = scene.mobjects.filter((mobject) => mobject.id !== sourceId);
  scene.foregroundMobjects = scene.foregroundMobjects.filter(
    (mobject) => mobject.id !== sourceId
  );
  for (const mobject of scene.mobjects) {
    removeChildById(mobject, sourceId);
  }
  for (const mobject of scene.foregroundMobjects) {
    removeChildById(mobject, sourceId);
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

export const linear: RateFunction = (t) =>
  t <= 0 ? 0 : (t >= 1 ? 1 : t);

export const smooth: RateFunction = (t) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const inflection = 10;
  const error = sigmoid(-inflection / 2);
  return Math.min(
    Math.max(
      (sigmoid(inflection * (t - 0.5)) - error) / (1 - 2 * error),
      0
    ),
    1
  );
};

export const there_and_back: RateFunction = (t) => {
  if (t < 0 || t > 1) return 0;
  const newT = t < 0.5 ? 2 * t : 2 * (1 - t);
  return smooth(newT);
};

function rateFunctionByName(name: string): RateFunction {
  switch (name) {
    case 'linear':
      return linear;
    case 'smooth':
      return smooth;
    case 'there_and_back':
      return there_and_back;
    default:
      return linear;
  }
}

function resolveRateFunction(
  value: string | RateFunction | undefined
): RateFunction {
  if (typeof value === 'function') return value;
  if (typeof value === 'string') return rateFunctionByName(value);
  return smooth;
}

function normalizeRateFunction(
  opts?: AnimationOpts
): string | RateFunction | undefined {
  return opts?.rate_func ?? opts?.rateFunc;
}

function normalizeRunTime(opts?: AnimationOpts): number | undefined {
  return opts?.run_time ?? opts?.runTime;
}

function isAnimationOpts(value: unknown): value is AnimationOpts {
  return typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !('kind' in value);
}

function parsePointsMeta(value: unknown): Point[] | null {
  if (typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value) as Point[];
    if (!Array.isArray(parsed)) return null;
    return parsed.map((point) => ({ x: point.x, y: point.y }));
  } catch {
    return null;
  }
}

function lerpPoint(a: Point, b: Point, t: number): Point {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  };
}

function splitCubicAt(
  curve: [Point, Point, Point, Point],
  t: number
): [[Point, Point, Point, Point], [Point, Point, Point, Point]] {
  const [p0, p1, p2, p3] = curve;
  const p01 = lerpPoint(p0, p1, t);
  const p12 = lerpPoint(p1, p2, t);
  const p23 = lerpPoint(p2, p3, t);
  const p012 = lerpPoint(p01, p12, t);
  const p123 = lerpPoint(p12, p23, t);
  const p0123 = lerpPoint(p012, p123, t);
  return [
    [p0, p01, p012, p0123],
    [p0123, p123, p23, p3]
  ];
}

function partialCubicPoints(
  curve: [Point, Point, Point, Point],
  a: number,
  b: number
): [Point, Point, Point, Point] {
  if (a <= 0 && b >= 1) return curve;
  if (b <= a) {
    const point = a <= 0 ? curve[0] : (a >= 1 ? curve[3] : splitCubicAt(curve, a)[1][0]);
    return [point, point, point, point];
  }
  if (a <= 0) {
    return splitCubicAt(curve, b)[0];
  }
  if (b >= 1) {
    return splitCubicAt(curve, a)[1];
  }
  const [, right] = splitCubicAt(curve, a);
  const span = (b - a) / (1 - a);
  return splitCubicAt(right, span)[0];
}

function subdivideCubic(
  curve: [Point, Point, Point, Point],
  divisions: number
): Array<[Point, Point, Point, Point]> {
  if (divisions <= 1) return [curve];
  const parts: Array<[Point, Point, Point, Point]> = [];
  for (let index = 0; index < divisions; index += 1) {
    parts.push(
      partialCubicPoints(curve, index / divisions, (index + 1) / divisions)
    );
  }
  return parts;
}

function lineCurveFromPoints(
  start: Point,
  end: Point
): [Point, Point, Point, Point] {
  return [
    start,
    lerpPoint(start, end, 1 / 3),
    lerpPoint(start, end, 2 / 3),
    end
  ];
}

function cubicTuplesFromPath(points: Point[]): Array<[Point, Point, Point, Point]> {
  if (points.length <= 1) return [];
  const tuples: Array<[Point, Point, Point, Point]> = [];
  for (let index = 1; index < points.length; index += 1) {
    tuples.push(lineCurveFromPoints(points[index - 1]!, points[index]!));
  }
  return tuples;
}

function flattenCubicTuples(
  tuples: Array<[Point, Point, Point, Point]>
): Point[] {
  return tuples.flatMap((curve) => curve.map((point) => ({ ...point })));
}

function remapBezierCurves(
  tuples: Array<[Point, Point, Point, Point]>,
  newCurveCount: number
): Array<[Point, Point, Point, Point]> {
  if (tuples.length === 0 || newCurveCount <= 0) return [];
  if (tuples.length === newCurveCount) return tuples;

  const splitFactors = Array(tuples.length).fill(0);
  for (let index = 0; index < newCurveCount; index += 1) {
    const curveIndex = Math.floor((index * tuples.length) / newCurveCount);
    splitFactors[curveIndex] += 1;
  }

  const remapped: Array<[Point, Point, Point, Point]> = [];
  tuples.forEach((curve, index) => {
    remapped.push(...subdivideCubic(curve, splitFactors[index]!));
  });
  return remapped;
}

function alignPathPointsForReplacement(
  source: Point[],
  target: Point[]
): { sourcePoints: Point[]; targetPoints: Point[] } | null {
  if (source.length === 0 || target.length === 0) return null;
  if (source.length === 1 && target.length === 1) {
    return {
      sourcePoints: Array.from({ length: 4 }, () => ({ ...source[0]! })),
      targetPoints: Array.from({ length: 4 }, () => ({ ...target[0]! })),
    };
  }

  const sourceCurves = cubicTuplesFromPath(source);
  const targetCurves = cubicTuplesFromPath(target);
  if (sourceCurves.length === 0 || targetCurves.length === 0) return null;

  const curveCount = Math.max(sourceCurves.length, targetCurves.length);
  return {
    sourcePoints: flattenCubicTuples(
      remapBezierCurves(sourceCurves, curveCount)
    ),
    targetPoints: flattenCubicTuples(
      remapBezierCurves(targetCurves, curveCount)
    ),
  };
}

function prepareReplacementMobjects(
  source: Mobject | undefined,
  target: Mobject | undefined
): { source?: Mobject; target?: Mobject } {
  const sourceClone = source ? cloneMobject(source, source.id) : undefined;
  const targetClone = target ? cloneMobject(target, target.id) : undefined;

  if (
    sourceClone?.kind === 'path' &&
    targetClone?.kind === 'path' &&
    sourceClone.points &&
    targetClone.points
  ) {
    const aligned = alignPathPointsForReplacement(
      sourceClone.points,
      targetClone.points
    );
    if (aligned) {
      sourceClone.points = aligned.sourcePoints;
      targetClone.points = aligned.targetPoints;
      sourceClone.pathRenderMode = 'cubic';
      targetClone.pathRenderMode = 'cubic';
    }
  }

  return { source: sourceClone, target: targetClone };
}

function snapshotMeta(mobject: Mobject): Animation['meta'] {
  const meta: Animation['meta'] = {
    xStart: getMobjectX(mobject),
    yStart: getMobjectY(mobject),
    opacityStart: mobject.opacity ?? 1,
    scaleStart: mobject.scaleFactor ?? 1,
    rotationStart: mobject.rotation ?? 0,
    zIndexStart: mobject.zIndex ?? 0,
  };
  if (mobject.kind === 'square') {
    meta.sizeStart = mobject.size ?? 0;
  }
  if (mobject.kind === 'circle' || mobject.kind === 'dot') {
    meta.radiusStart = mobject.radius ?? 0;
  }
  if (mobject.points) {
    meta.pointsStart = JSON.stringify(mobject.points);
  }
  if (mobject.stroke) meta.strokeStart = mobject.stroke;
  if (mobject.fill) meta.fillStart = mobject.fill;
  return meta;
}

function finalizeMeta(meta: Animation['meta'], mobject: Mobject): Animation['meta'] {
  return {
    ...meta,
    xEnd: getMobjectX(mobject),
    yEnd: getMobjectY(mobject),
    opacityEnd: mobject.opacity ?? 1,
    scaleEnd: mobject.scaleFactor ?? 1,
    rotationEnd: mobject.rotation ?? 0,
    zIndexEnd: mobject.zIndex ?? 0,
    sizeEnd: mobject.size ?? meta?.sizeStart,
    radiusEnd: mobject.radius ?? meta?.radiusStart,
    strokeEnd: mobject.stroke,
    fillEnd: mobject.fill,
    pointsEnd: mobject.points ? JSON.stringify(mobject.points) : meta?.pointsStart,
  };
}

function transformAnimation(
  mobject: Mobject,
  mutate: () => void,
  opts?: AnimationOpts
): PendingAnimation {
  const meta = snapshotMeta(mobject);
  mutate();
  return {
    kind: 'transform',
    targetId: mobject.id,
    rateFunc: normalizeRateFunction(opts),
    runTime: normalizeRunTime(opts),
    meta: finalizeMeta(meta, mobject),
  };
}

function attachMobjectApi(mobject: Mobject): Mobject {
  syncGroupIndexProps(mobject);
  mobject.become = (target: Mobject): Mobject => {
    const currentId = mobject.id;
    const currentSourceRef = mobject.sourceRef
      ? { ...mobject.sourceRef }
      : undefined;
    Object.assign(mobject, {
      ...target,
      id: currentId,
      sourceRef: currentSourceRef,
    });
    return mobject;
  };
  mobject.animate = {
    become: (target: Mobject, opts?: { runTime?: number }) => {
      const animation = ReplacementTransform(mobject, target, opts);
      return Array.isArray(animation) ? animation[0]! : animation;
    },
    moveAlongPath: (path: Mobject, opts?: { runTime?: number }) =>
      MoveAlongPath(mobject, path, opts),
    shift: (delta: PointLike, opts?: AnimationOpts) =>
      transformAnimation(mobject, () => {
        mobject.shift?.(delta);
      }, opts),
    moveTo: (target: PointLike | Mobject, opts?: AnimationOpts) =>
      transformAnimation(mobject, () => {
        mobject.moveTo?.(target);
      }, opts),
    move_to: (target: PointLike | Mobject, opts?: AnimationOpts) =>
      transformAnimation(mobject, () => {
        mobject.moveTo?.(target);
      }, opts),
    scale: (factor: number, opts?: AnimationOpts) =>
      transformAnimation(mobject, () => {
        mobject.scale?.(factor);
      }, opts),
    setOpacity: (opacity: number, opts?: AnimationOpts) =>
      transformAnimation(mobject, () => {
        mobject.setOpacity?.(opacity);
      }, opts),
    set_opacity: (opacity: number, opts?: AnimationOpts) =>
      transformAnimation(mobject, () => {
        mobject.setOpacity?.(opacity);
      }, opts),
    setValue: (_value: number, _opts?: AnimationOpts) => Wait(0),
    set_value: (_value: number, _opts?: AnimationOpts) => Wait(0),
  };
  mobject.moveTo = (target: PointLike | Mobject): Mobject => {
    if (mobject.is3d) {
      const next = 'id' in target
        ? (target.center3d ?? fromPointLike3d([0, 0, 0]))
        : fromPointLike3d(target);
      const current = mobject.center3d ?? point3d(0, 0, 0);
      const dx = next.x - current.x;
      const dy = next.y - current.y;
      const dz = next.z - current.z;
      if (mobject.points3d) {
        mobject.points3d = mobject.points3d.map((point) => ({
          x: point.x + dx,
          y: point.y + dy,
          z: point.z + dz,
        }));
      }
      if (mobject.kind === 'group3d') {
        for (const child of mobject.children ?? []) {
          child.shift?.([dx, dy, dz]);
        }
      }
      mobject.center3d = next;
      return mobject;
    }
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
    if (mobject.kind === 'group' || mobject.kind === 'group3d') {
      translateMobject(mobject, dx, dy);
      return mobject;
    }
    if (mobject.points) {
      mobject.points = mobject.points.map((point) => ({
        x: point.x + dx,
        y: point.y + dy,
      }));
    }
    mobject.x = nextX;
    mobject.y = nextY;
    return mobject;
  };
  mobject.move_to = mobject.moveTo;
  mobject.shift = (delta: PointLike): Mobject => {
    if (mobject.is3d) {
      const [dx, dy, dz] = asVector(delta);
      if (mobject.points3d) {
        mobject.points3d = mobject.points3d.map((point) => ({
          x: point.x + dx,
          y: point.y + dy,
          z: point.z + dz,
        }));
      }
      if (mobject.kind === 'group3d') {
        for (const child of mobject.children ?? []) {
          child.shift?.([dx, dy, dz]);
        }
      }
      const center = mobject.center3d ?? point3d(0, 0, 0);
      mobject.center3d = point3d(center.x + dx, center.y + dy, center.z + dz);
      return mobject;
    }
    const [dx, dy] = asVector(delta);
    const dxPx = dx * UNIT_PX;
    const dyPx = -dy * UNIT_PX;
    if (mobject.kind === 'group' || mobject.kind === 'group3d') {
      translateMobject(mobject, dxPx, dyPx);
      return mobject;
    }
    mobject.x = getMobjectX(mobject) + dxPx;
    mobject.y = getMobjectY(mobject) + dyPx;
    return mobject;
  };
  mobject.scale = (factor: number): Mobject => {
    mobject.scaleFactor = (mobject.scaleFactor ?? 1) * factor;
    if (mobject.is3d) {
      if (typeof mobject.radius === 'number') mobject.radius *= factor;
      if (mobject.points3d) {
        const center = mobject.center3d ?? point3d(0, 0, 0);
        mobject.points3d = mobject.points3d.map((point) => ({
          x: center.x + (point.x - center.x) * factor,
          y: center.y + (point.y - center.y) * factor,
          z: center.z + (point.z - center.z) * factor,
        }));
      }
      if (mobject.kind === 'group3d') {
        for (const child of mobject.children ?? []) {
          child.scale?.(factor);
        }
      }
      return mobject;
    }
    if (mobject.kind === 'group' || mobject.kind === 'group3d') {
      const groupCenter = mobject.getCenter?.() ?? {
        x: getMobjectX(mobject),
        y: getMobjectY(mobject)
      };
      for (const child of mobject.children ?? []) {
        const childCenter = child.getCenter?.() ?? {
          x: getMobjectX(child),
          y: getMobjectY(child)
        };
        child.scale?.(factor);
        child.moveTo?.({
          x: groupCenter.x + (childCenter.x - groupCenter.x) * factor,
          y: groupCenter.y + (childCenter.y - groupCenter.y) * factor
        });
      }
      return mobject;
    }
    if (typeof mobject.size === 'number') mobject.size *= factor;
    if (typeof mobject.radius === 'number') mobject.radius *= factor;
    if (typeof mobject.width === 'number') mobject.width *= factor;
    if (typeof mobject.height === 'number') mobject.height *= factor;
    if (typeof mobject.cornerRadius === 'number') {
      mobject.cornerRadius *= factor;
    }
    if (mobject.points) {
      const center = mobject.getCenter?.() ?? { x: getMobjectX(mobject), y: getMobjectY(mobject) };
      mobject.points = mobject.points.map((point) => ({
        x: center.x + (point.x - center.x) * factor,
        y: center.y + (point.y - center.y) * factor,
      }));
    }
    return mobject;
  };
  mobject.rotate = (angle: number): Mobject => {
    mobject.rotation = (mobject.rotation ?? 0) + angle;
    return mobject;
  };
  mobject.stretch = (factor: number, dim = 0): Mobject => {
    if (dim === 0) {
      mobject.stretchX = (mobject.stretchX ?? 1) * factor;
      if (typeof mobject.size === 'number') mobject.size *= factor;
    } else {
      mobject.stretchY = (mobject.stretchY ?? 1) * factor;
      if (typeof mobject.radius === 'number') mobject.radius *= factor;
    }
    return mobject;
  };
  mobject.flip = (axis: PointLike = RIGHT): Mobject => {
    const [dx, dy] = asVector(axis);
    if (Math.abs(dx) >= Math.abs(dy)) {
      mobject.stretch?.(-1, 1);
    } else {
      mobject.stretch?.(-1, 0);
    }
    return mobject;
  };
  mobject.copy = (id?: string): Mobject =>
    cloneMobject(mobject, id ?? autoId(`${mobjectSourceLabel(mobject)}_copy`), true);
  mobject.setColor = (color: Color): Mobject => {
    mobject.stroke = color;
    mobject.fill = color;
    return mobject;
  };
  mobject.set_color = mobject.setColor;
  mobject.setFill = (fill: Color, opacity?: number): Mobject => {
    mobject.fill = fill;
    if (typeof opacity === 'number') mobject.opacity = opacity;
    return mobject;
  };
  mobject.set_fill = mobject.setFill;
  mobject.setStroke = (
    stroke: Color,
    width?: number,
    opacity?: number
  ): Mobject => {
    mobject.stroke = stroke;
    if (typeof width === 'number') mobject.strokeWidth = width;
    if (typeof opacity === 'number') mobject.opacity = opacity;
    return mobject;
  };
  mobject.set_stroke = mobject.setStroke;
  mobject.setOpacity = (opacity: number): Mobject => {
    mobject.opacity = opacity;
    return mobject;
  };
  mobject.set_opacity = mobject.setOpacity;
  mobject.setZIndex = (zIndex: number): Mobject => {
    mobject.zIndex = zIndex;
    return mobject;
  };
  mobject.set_z_index = mobject.setZIndex;
  mobject.matchColor = (target: Mobject): Mobject => {
    mobject.stroke = target.stroke;
    mobject.fill = target.fill;
    return mobject;
  };
  mobject.match_color = mobject.matchColor;
  mobject.matchFill = (target: Mobject): Mobject => {
    mobject.fill = target.fill;
    return mobject;
  };
  mobject.match_fill = mobject.matchFill;
  mobject.matchStroke = (target: Mobject): Mobject => {
    mobject.stroke = target.stroke;
    mobject.strokeWidth = target.strokeWidth;
    return mobject;
  };
  mobject.match_stroke = mobject.matchStroke;
  mobject.matchOpacity = (target: Mobject): Mobject => {
    mobject.opacity = target.opacity;
    return mobject;
  };
  mobject.match_opacity = mobject.matchOpacity;
  mobject.nextTo = (
    target: Mobject,
    direction: PointLike = RIGHT,
    buff = 0.5
  ): Mobject => {
    const [dx, dy] = asVector(direction);
    const signX = Math.sign(dx);
    const signY = Math.sign(dy);
    const gapPx = buff * UNIT_PX;
    const targetBounds = mobjectBounds(target);
    const selfBounds = mobjectBounds(mobject);
    const selfWidth = selfBounds.right - selfBounds.left;
    const selfHeight = selfBounds.bottom - selfBounds.top;

    if (Math.abs(dx) >= Math.abs(dy)) {
      const centerY = (targetBounds.top + targetBounds.bottom) / 2;
      const x = signX >= 0
        ? targetBounds.right + gapPx + selfWidth / 2
        : targetBounds.left - gapPx - selfWidth / 2;
      mobject.moveTo?.({ x, y: centerY });
      return mobject;
    }

    const centerX = (targetBounds.left + targetBounds.right) / 2;
    const y = signY >= 0
      ? targetBounds.top - gapPx - selfHeight / 2
      : targetBounds.bottom + gapPx + selfHeight / 2;
    mobject.moveTo?.({ x: centerX, y });
    return mobject;
  };
  mobject.next_to = mobject.nextTo;
  mobject.toEdge = (direction: PointLike, buff = 0.5): Mobject => {
    const [dx, dy] = asVector(direction);
    const bounds = mobjectBounds(mobject);
    const center = {
      x: (bounds.left + bounds.right) / 2,
      y: (bounds.top + bounds.bottom) / 2,
    };
    let targetX = center.x;
    let targetY = center.y;

    if (Math.abs(dx) >= Math.abs(dy)) {
      const edgeX = CENTER_X + Math.sign(dx || 1) * (FRAME_X_RADIUS - buff) * UNIT_PX;
      const halfWidth = (bounds.right - bounds.left) / 2;
      targetX = edgeX - Math.sign(dx || 1) * halfWidth;
    } else {
      const edgeY = CENTER_Y - Math.sign(dy || 1) * (FRAME_Y_RADIUS - buff) * UNIT_PX;
      const halfHeight = (bounds.bottom - bounds.top) / 2;
      targetY = edgeY + Math.sign(dy || 1) * halfHeight;
    }

    mobject.moveTo?.({ x: targetX, y: targetY });
    return mobject;
  };
  mobject.to_edge = mobject.toEdge;
  mobject.toCorner = (corner: PointLike, buff = 0.5): Mobject => {
    const [dx, dy] = asVector(corner);
    const bounds = mobjectBounds(mobject);
    const halfWidth = (bounds.right - bounds.left) / 2;
    const halfHeight = (bounds.bottom - bounds.top) / 2;
    const edgeX = CENTER_X + Math.sign(dx || 1) * (FRAME_X_RADIUS - buff) * UNIT_PX;
    const edgeY = CENTER_Y - Math.sign(dy || 1) * (FRAME_Y_RADIUS - buff) * UNIT_PX;
    mobject.moveTo?.({
      x: edgeX - Math.sign(dx || 1) * halfWidth,
      y: edgeY + Math.sign(dy || 1) * halfHeight,
    });
    return mobject;
  };
  mobject.to_corner = mobject.toCorner;
  mobject.alignTo = (target: Mobject, direction: PointLike): Mobject => {
    const current = mobjectBounds(mobject);
    const targetBounds = mobjectBounds(target);
    if (directionAxis(direction) === 'x') {
      mobject.moveTo?.({
        x: (targetBounds.left + targetBounds.right) / 2,
        y: (current.top + current.bottom) / 2,
      });
    } else {
      mobject.moveTo?.({
        x: (current.left + current.right) / 2,
        y: (targetBounds.top + targetBounds.bottom) / 2,
      });
    }
    return mobject;
  };
  mobject.align_to = mobject.alignTo;
  mobject.arrange = (
    direction: PointLike = RIGHT,
    buff = 0.25
  ): Mobject => {
    if (mobject.kind !== 'group' && mobject.kind !== 'group3d') return mobject;
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
  mobject.surround = (target: Mobject, buff = 12): Mobject => {
    const bounds = mobjectBounds(target);
    mobject.x = (bounds.left + bounds.right) / 2;
    mobject.y = (bounds.top + bounds.bottom) / 2;
    const width = bounds.right - bounds.left + buff * 2;
    const height = bounds.bottom - bounds.top + buff * 2;
    if (mobject.kind === 'square') {
      mobject.size = Math.max(width, height);
      mobject.width = width;
      mobject.height = height;
    } else if (mobject.kind === 'circle') {
      mobject.radius = Math.max(width, height) / 2;
      mobject.width = width;
      mobject.height = height;
    }
    return mobject;
  };
  mobject.generateTarget = (): Mobject => {
    mobject.target = cloneMobject(
      mobject,
      `${mobjectSourceLabel(mobject)}_target`,
      true
    );
    return mobject.target;
  };
  mobject.generate_target = mobject.generateTarget;
  mobject.saveState = (): Mobject => {
    mobject.savedState = {
      x: mobject.x,
      y: mobject.y,
      center3d: mobject.center3d ? { ...mobject.center3d } : undefined,
      size: mobject.size,
      radius: mobject.radius,
      stroke: mobject.stroke,
      fill: mobject.fill,
      opacity: mobject.opacity,
      strokeWidth: mobject.strokeWidth,
      zIndex: mobject.zIndex,
      rotation: mobject.rotation,
      scaleFactor: mobject.scaleFactor,
      points: mobject.points?.map((point) => ({ ...point })),
      points3d: mobject.points3d?.map((point) => ({ ...point })),
    };
    return mobject;
  };
  mobject.save_state = mobject.saveState;
  mobject.restore = (): Mobject => {
    if (!mobject.savedState) return mobject;
    Object.assign(mobject, {
      ...mobject,
      ...mobject.savedState,
      points: mobject.savedState.points?.map((point) => ({ ...point })),
    });
    return mobject;
  };
  mobject.add = (...children: Mobject[]): Mobject => {
    mobject.children = [...(mobject.children ?? []), ...children];
    syncGroupIndexProps(mobject);
    return mobject;
  };
  mobject.remove = (...children: Mobject[]): Mobject => {
    const ids = new Set(children.map((child) => child.id));
    mobject.children = (mobject.children ?? []).filter((child) => !ids.has(child.id));
    syncGroupIndexProps(mobject);
    return mobject;
  };
  mobject.addUpdater = (updater: Updater): Mobject => {
    mobject.updaters = [...(mobject.updaters ?? []), updater];
    return mobject;
  };
  mobject.add_updater = mobject.addUpdater;
  mobject.removeUpdater = (updater: Updater): Mobject => {
    mobject.updaters = (mobject.updaters ?? []).filter((item) => item !== updater);
    return mobject;
  };
  mobject.remove_updater = mobject.removeUpdater;
  mobject.clearUpdaters = (): Mobject => {
    mobject.updaters = [];
    return mobject;
  };
  mobject.clear_updaters = mobject.clearUpdaters;
  mobject.get = (index: number): Mobject | undefined => (mobject.children ?? [])[index];
  mobject.slice = (start?: number, end?: number): Mobject[] =>
    (mobject.children ?? []).slice(start, end);
  mobject.setX = (x: number): Mobject => {
    mobject.x = CENTER_X + x * UNIT_PX;
    return mobject;
  };
  mobject.set_x = mobject.setX;
  mobject.setY = (y: number): Mobject => {
    mobject.y = CENTER_Y - y * UNIT_PX;
    return mobject;
  };
  mobject.set_y = mobject.setY;
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
    x: CENTER_X + mx * UNIT_PX,
    y: CENTER_Y - my * UNIT_PX,
  };
}

function fromPointLike3d(value: PointLike): Point3D {
  if (isPoint(value)) {
    return { x: (value.x - CENTER_X) / UNIT_PX, y: (CENTER_Y - value.y) / UNIT_PX, z: 0 };
  }
  return {
    x: value[0],
    y: value[1],
    z: value[2] ?? 0,
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

export type EvaluatedSceneState = {
  mobjects: Mobject[];
  progressById: Map<string, number>;
  replacements: Array<{
    sourceId: string;
    targetId: string;
    progress: number;
    source?: Mobject;
    target?: Mobject;
  }>;
  completedReplacementSources: Set<string>;
  completedReplacementTargets: Set<string>;
  cameraOrientation: CameraOrientation;
};

function deg(value: number): number {
  return (value * Math.PI) / 180;
}

function point3d(x: number, y: number, z: number): Point3D {
  return { x, y, z };
}

function add3d(a: Point3D, b: Point3D): Point3D {
  return point3d(a.x + b.x, a.y + b.y, a.z + b.z);
}

function sub3d(a: Point3D, b: Point3D): Point3D {
  return point3d(a.x - b.x, a.y - b.y, a.z - b.z);
}

function dot3d(a: Point3D, b: Point3D): number {
  return (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
}

function cross3d(a: Point3D, b: Point3D): Point3D {
  return point3d(
    (a.y * b.z) - (a.z * b.y),
    (a.z * b.x) - (a.x * b.z),
    (a.x * b.y) - (a.y * b.x)
  );
}

function scale3d(value: Point3D, factor: number): Point3D {
  return point3d(value.x * factor, value.y * factor, value.z * factor);
}

function normalize3d(value: Point3D): Point3D {
  const length = Math.hypot(value.x, value.y, value.z);
  if (length <= 1e-9) return point3d(0, 0, 0);
  return scale3d(value, 1 / length);
}

function rotateAroundAxis(
  value: Point3D,
  axis: Point3D,
  angleRad: number
): Point3D {
  const unitAxis = normalize3d(axis);
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);
  const parallel = scale3d(unitAxis, dot3d(value, unitAxis));
  const perpendicular = sub3d(value, parallel);
  const rotatedPerpendicular = add3d(
    scale3d(perpendicular, cosA),
    scale3d(cross3d(unitAxis, perpendicular), sinA)
  );
  return add3d(rotatedPerpendicular, parallel);
}

function cameraBasis(camera: CameraOrientation): {
  right: Point3D;
  up: Point3D;
  forward: Point3D;
  position: Point3D;
} {
  const phi = deg(camera.phi);
  const theta = deg(camera.theta);
  const gamma = deg(camera.gamma);
  const radius = 8 / Math.max(0.2, camera.zoom);
  const position = point3d(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );

  const forward = normalize3d(scale3d(position, -1));
  const worldUp = point3d(0, 0, 1);
  let right = normalize3d(cross3d(forward, worldUp));
  if (Math.hypot(right.x, right.y, right.z) <= 1e-9) {
    right = point3d(1, 0, 0);
  }
  let up = normalize3d(cross3d(right, forward));
  if (Math.abs(gamma) > 1e-9) {
    right = rotateAroundAxis(right, forward, gamma);
    up = rotateAroundAxis(up, forward, gamma);
  }

  return { right, up, forward, position };
}

function projectPoint3d(point: Point3D, camera: CameraOrientation): Point {
  const basis = cameraBasis(camera);
  const relative = sub3d(point, basis.position);
  const cameraX = dot3d(relative, basis.right);
  const cameraY = dot3d(relative, basis.up);
  const cameraZ = dot3d(relative, basis.forward);
  const focalLength = 6.5;
  const near = 0.2;
  const clampedZ = Math.max(near, cameraZ);
  const perspective = (focalLength / clampedZ) * camera.zoom;
  return {
    x: CENTER_X + cameraX * UNIT_PX * perspective,
    y: CENTER_Y - cameraY * UNIT_PX * perspective,
  };
}

function depthForPoint(point: Point3D, camera: CameraOrientation): number {
  const basis = cameraBasis(camera);
  return dot3d(sub3d(point, basis.position), basis.forward);
}

function shadeColor(hex: string, factor: number): string {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
  if (![3, 6].includes(normalized.length)) return hex;
  const full = normalized.length === 3
    ? normalized.split('').map((part) => part + part).join('')
    : normalized;
  const channels = [0, 2, 4].map((offset) =>
    Math.max(
      0,
      Math.min(
        255,
        Math.round(parseInt(full.slice(offset, offset + 2), 16) * factor)
      )
    )
  );
  return `#${channels.map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function convert3dMobjectTo2d(
  mobject: Mobject,
  camera: CameraOrientation
): Mobject[] {
  if (mobject.kind === 'group3d') {
    return (mobject.children ?? []).flatMap((child) =>
      convert3dMobjectTo2d(child, camera)
    );
  }

  if (mobject.kind === 'path3d') {
    const points3d = mobject.points3d ?? [];
    const points = points3d.map((point) => projectPoint3d(point, camera));
    const center = mobject.center3d ??
      point3d(
        points3d.reduce((sum, point) => sum + point.x, 0) / Math.max(1, points3d.length),
        points3d.reduce((sum, point) => sum + point.y, 0) / Math.max(1, points3d.length),
        points3d.reduce((sum, point) => sum + point.z, 0) / Math.max(1, points3d.length)
      );
    const depth = depthForPoint(center, camera);
    return [attachMobjectApi({
      ...mobject,
      kind: 'path',
      points,
      points3d: undefined,
      center3d: undefined,
      x: undefined,
      y: undefined,
      zIndex: (mobject.zIndex ?? 0) + depth * 10,
    })];
  }

  if (mobject.kind === 'sphere3d') {
    const center = mobject.center3d ?? point3d(0, 0, 0);
    const projectedCenter = projectPoint3d(center, camera);
    const edge = projectPoint3d(point3d(center.x + (mobject.radius ?? 1), center.y, center.z), camera);
    const depth = depthForPoint(center, camera);
    const radius = Math.max(2, Math.hypot(edge.x - projectedCenter.x, edge.y - projectedCenter.y));
    const light = Math.max(0.55, 1.1 - Math.max(-1.5, depth) * 0.18);
    const fill = shadeColor(mobject.fill ?? mobject.stroke, light);
    const rim = shadeColor(mobject.stroke, light * 0.85);
    const highlight = attachMobjectApi({
      id: `${mobject.id}_highlight`,
      kind: 'circle',
      x: projectedCenter.x - radius * 0.26,
      y: projectedCenter.y - radius * 0.22,
      width: radius * 0.72,
      height: radius * 0.52,
      stroke: shadeColor('#ffffff', 0.95),
      strokeWidth: Math.max(1.5, (mobject.strokeWidth ?? 2) * 0.6),
      opacity: 0.45,
      zIndex: (mobject.zIndex ?? 0) + depth * 10 + 0.2,
    });
    const body = attachMobjectApi({
      id: mobject.id,
      kind: 'path',
      points: circlePointSamples(projectedCenter, radius, radius, 48),
      closed: true,
      fill,
      fillOpacity: mobject.fillOpacity ?? 0.92,
      opacity: mobject.opacity ?? 1,
      stroke: rim,
      strokeWidth: mobject.strokeWidth,
      zIndex: (mobject.zIndex ?? 0) + depth * 10,
    });
    return [body, highlight];
  }

  return [cloneMobject(mobject, mobject.id)];
}

function circlePointSamples(
  center: Point,
  rx: number,
  ry: number,
  count: number
): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < count; i += 1) {
    const theta = (-Math.PI / 2) + (i / count) * Math.PI * 2;
    points.push({
      x: center.x + rx * Math.cos(theta),
      y: center.y + ry * Math.sin(theta),
    });
  }
  return points;
}

function cameraOrientationAtTime(scene: Scene, timeSec: number): CameraOrientation {
  const camera = scene.getBaseCameraOrientation();
  if (!(scene instanceof ThreeDScene)) return camera;
  const phases = scenePhases(scene);
  const phaseStarts: number[] = [];
  let elapsed = 0;
  for (const phase of phases) {
    phaseStarts.push(elapsed);
    elapsed += phase.durationSec;
  }

  for (const rotation of scene.getAmbientCameraRotations()) {
    const startTime = phaseStarts[rotation.startPhase] ?? 0;
    const endTime = rotation.endPhase === null
      ? timeSec
      : (phaseStarts[rotation.endPhase] ?? elapsed);
    const activeUntil = Math.min(timeSec, endTime);
    if (activeUntil <= startTime) continue;
    camera.theta -=
      rotation.rate * (180 / Math.PI) * (activeUntil - startTime);
  }
  return camera;
}

function applyAnimationToMobject(
  step: Animation,
  mobject: Mobject,
  progress: number,
  pathLookup: Map<string, Mobject>
): void {
  if (step.kind === 'moveAlongPath' && step.pathId) {
    const path = pathLookup.get(step.pathId);
    if (path?.points && path.points.length >= 2) {
      const at = pointAlongPath(path.points, progress);
      mobject.moveTo?.(at);
    }
    return;
  }

  if (step.kind !== 'transform') return;
  const meta = step.meta;
  if (
    typeof meta?.xStart === 'number' &&
    typeof meta?.xEnd === 'number' &&
    typeof meta?.yStart === 'number' &&
    typeof meta?.yEnd === 'number'
  ) {
    mobject.moveTo?.({
      x: lerp(meta.xStart, meta.xEnd, progress),
      y: lerp(meta.yStart, meta.yEnd, progress)
    });
  }
  if (
    typeof meta?.opacityStart === 'number' &&
    typeof meta?.opacityEnd === 'number'
  ) {
    mobject.opacity = lerp(meta.opacityStart, meta.opacityEnd, progress);
  }
  if (
    typeof meta?.scaleStart === 'number' &&
    typeof meta?.scaleEnd === 'number'
  ) {
    mobject.scaleFactor = lerp(meta.scaleStart, meta.scaleEnd, progress);
  }
  if (
    typeof meta?.rotationStart === 'number' &&
    typeof meta?.rotationEnd === 'number'
  ) {
    mobject.rotation = lerp(meta.rotationStart, meta.rotationEnd, progress);
  }
  if (
    typeof meta?.zIndexStart === 'number' &&
    typeof meta?.zIndexEnd === 'number'
  ) {
    mobject.zIndex = lerp(meta.zIndexStart, meta.zIndexEnd, progress);
  }
  if (
    typeof meta?.sizeStart === 'number' &&
    typeof meta?.sizeEnd === 'number'
  ) {
    mobject.size = lerp(meta.sizeStart, meta.sizeEnd, progress);
  }
  if (
    typeof meta?.radiusStart === 'number' &&
    typeof meta?.radiusEnd === 'number'
  ) {
    mobject.radius = lerp(meta.radiusStart, meta.radiusEnd, progress);
  }
  if (
    typeof meta?.strokeStart === 'string' &&
    progress < 1
  ) {
    mobject.stroke = meta.strokeStart;
  }
  if (
    typeof meta?.strokeEnd === 'string' &&
    progress >= 1
  ) {
    mobject.stroke = meta.strokeEnd;
  }
  if (
    typeof meta?.fillStart === 'string' &&
    progress < 1
  ) {
    mobject.fill = meta.fillStart;
  }
  if (
    typeof meta?.fillEnd === 'string' &&
    progress >= 1
  ) {
    mobject.fill = meta.fillEnd;
  }
  const startPoints = parsePointsMeta(meta?.pointsStart);
  const endPoints = parsePointsMeta(meta?.pointsEnd);
  if (
    startPoints &&
    endPoints &&
    startPoints.length === endPoints.length
  ) {
    mobject.points = startPoints.map((point, index) => ({
      x: lerp(point.x, endPoints[index]?.x ?? point.x, progress),
      y: lerp(point.y, endPoints[index]?.y ?? point.y, progress),
    }));
  }
}

function pointAlongPath(points: Point[], t: number): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];
  const clamped = Math.max(0, Math.min(1, t));
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y
    );
  }
  if (total <= 0) return points[0];
  const target = total * clamped;
  let acc = 0;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (acc + len >= target) {
      const local = len > 0 ? (target - acc) / len : 0;
      return {
        x: lerp(a.x, b.x, local),
        y: lerp(a.y, b.y, local)
      };
    }
    acc += len;
  }
  return points[points.length - 1];
}

function staggeredCreateProgress(step: Animation, stepProgress: number): number {
  const childIndex = typeof step.meta?.createChildIndex === 'number'
    ? step.meta.createChildIndex
    : null;
  const childCount = typeof step.meta?.createChildCount === 'number'
    ? step.meta.createChildCount
    : null;
  if (childIndex === null || childCount === null || childCount <= 1) {
    return stepProgress;
  }
  const scaled = (stepProgress * childCount) - childIndex;
  return Math.max(0, Math.min(1, scaled));
}

function refreshPathLookup(scene: Scene): Map<string, Mobject> {
  return new Map(
    flattenSceneMobjects(scene.mobjects).map((mobject) => [mobject.id, mobject])
  );
}

function runUpdaters(mobject: Mobject): void {
  for (const child of mobject.children ?? []) {
    runUpdaters(child);
  }
  for (const updater of mobject.updaters ?? []) {
    updater(mobject);
  }
}

function refreshAlwaysRedraw(mobject: Mobject): void {
  for (const child of mobject.children ?? []) {
    refreshAlwaysRedraw(child);
  }
  if (!mobject.alwaysRedrawFactory) return;
  const next = mobject.alwaysRedrawFactory();
  const stableId = mobject.id;
  restoreMobject(mobject, cloneMobject(next, stableId));
}

export function evaluateSceneAtTime(
  scene: Scene,
  timeSec: number
): EvaluatedSceneState {
  const introKinds = new Set(['create', 'fadeIn']);
  const progressById = new Map<string, number>();
  const replacements: EvaluatedSceneState['replacements'] = [];
  const completedReplacementSources = new Set<string>();
  const completedReplacementTargets = new Set<string>();
  scene.restoreLiveRootsFromBase();
  scene.mobjects = scene.getLiveSceneRoots();
  scene.foregroundMobjects = scene.getLiveForegroundRoots();

  const topLevel = [...scene.mobjects, ...scene.foregroundMobjects];
  const topLevelIds = new Set(topLevel.map((mobject) => mobject.id));

  for (const mobject of flattenSceneMobjects(scene.mobjects)) {
    progressById.set(mobject.id, 1);
  }
  for (const step of scene.timeline) {
    if (step.targetId && introKinds.has(step.kind)) {
      progressById.set(step.targetId, 0);
    }
    if (step.kind === 'moveAlongPath' && step.targetId && step.meta?.introduced) {
      progressById.set(step.targetId, 0);
    }
    if (step.kind === 'replacementTransform' && step.targetId) {
      progressById.set(step.targetId, 0);
    }
  }

  const phases = scenePhases(scene);
  let pathLookup = refreshPathLookup(scene);
  const replacementAliases = new Map<string, string>();

  function resolveReplacementSourceId(id: string): string {
    let current = id;
    const seen = new Set<string>();
    while (replacementAliases.has(current) && !seen.has(current)) {
      seen.add(current);
      current = replacementAliases.get(current)!;
    }
    return current;
  }

  let phaseStart = 0;
  for (const phase of phases) {
    const phaseEnd = phaseStart + phase.durationSec;
    const phaseProgress = phase.durationSec > 0
      ? Math.max(0, Math.min(1, (timeSec - phaseStart) / phase.durationSec))
      : 1;
    if (timeSec < phaseStart) break;

    for (const step of phase.animations) {
      const rawProgress = step.runTime > 0
        ? Math.max(0, Math.min(1, (timeSec - phaseStart) / step.runTime))
        : 1;
      const stepProgress = resolveRateFunction(step.rateFunc)(rawProgress);

      if (step.kind === 'value' && step.tracker) {
        const start = typeof step.meta?.valueStart === 'number'
          ? step.meta.valueStart
          : step.tracker.value;
        const end = typeof step.meta?.valueEnd === 'number'
          ? step.meta.valueEnd
          : start;
        if (timeSec >= phaseStart) {
          step.tracker.value = lerp(start, end, stepProgress);
        }
        continue;
      }

      if (step.kind === 'replacementTransform') {
        if (step.sourceId && step.targetId) {
          const sourceId = pathLookup.has(step.sourceId)
            ? step.sourceId
            : resolveReplacementSourceId(step.sourceId);
          const source = pathLookup.get(sourceId) ??
            scene.getBaseMobject(sourceId);
          const target = pathLookup.get(step.targetId) ??
            scene.getBaseMobject(step.targetId);
          if (stepProgress > 0 && stepProgress < 1) {
            const prepared = prepareReplacementMobjects(source, target);
            replacements.push({
              sourceId,
              targetId: step.targetId,
              progress: stepProgress,
              source: prepared.source,
              target: prepared.target,
            });
          }
          if (stepProgress >= 1) {
            completedReplacementSources.add(sourceId);
            completedReplacementTargets.add(step.targetId);
            progressById.set(step.targetId, 1);
            replacementAliases.set(step.sourceId, step.targetId);
            replacementAliases.set(sourceId, step.targetId);
            applyCompletedReplacementToScene(scene, sourceId, step.targetId);
            pathLookup = refreshPathLookup(scene);
          }
        }
        continue;
      }

      if (step.targetId) {
        const target = pathLookup.get(step.targetId);
        if (step.kind === 'create' || step.kind === 'fadeIn') {
          const progress = step.kind === 'create'
            ? staggeredCreateProgress(step, stepProgress)
            : stepProgress;
          progressById.set(step.targetId, progress);
        } else if (step.kind === 'moveAlongPath' && step.meta?.introduced) {
          progressById.set(step.targetId, timeSec >= phaseStart ? 1 : 0);
        } else if (step.kind === 'fadeOut') {
          const progress = Math.max(0, 1 - stepProgress);
          progressById.set(step.targetId, progress);
          if (progress <= 0) {
            applyCompletedFadeOutToScene(scene, step.targetId);
            pathLookup = refreshPathLookup(scene);
          }
        }
        if (target && step.kind !== 'create' && step.kind !== 'fadeIn') {
          applyAnimationToMobject(step, target, stepProgress, pathLookup);
        }
      }
    }

    if (timeSec <= phaseEnd) {
      break;
    }
    phaseStart = phaseEnd;
    void phaseProgress;
  }

  for (const mobject of scene.mobjects) {
    runUpdaters(mobject);
  }
  for (const mobject of scene.mobjects) {
    refreshAlwaysRedraw(mobject);
  }

  const evaluated = [
    ...scene.mobjects,
    ...scene.foregroundMobjects.filter((mobject) => !topLevelIds.has(mobject.id))
  ];
  const cameraOrientation = cameraOrientationAtTime(scene, timeSec);
  return {
    mobjects: flattenSceneMobjects(evaluated).flatMap((mobject) =>
      mobject.is3d || mobject.kind === 'path3d' ||
        mobject.kind === 'sphere3d' || mobject.kind === 'group3d'
        ? convert3dMobjectTo2d(mobject, cameraOrientation)
        : [cloneMobject(mobject, mobject.id)]
    ),
    progressById,
    replacements,
    completedReplacementSources,
    completedReplacementTargets,
    cameraOrientation,
  };
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
    size: normalizeSceneLength(opts.size) ?? opts.size,
    width: normalizeSceneLength(opts.size) ?? opts.size,
    height: normalizeSceneLength(opts.size) ?? opts.size,
    stroke: opts.stroke,
    strokeWidth: opts.strokeWidth ?? DEFAULT_STROKE_WIDTH,
    fill: 'none',
  });
}

export function Rectangle(
  idOrOpts: string | {
    id?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    stroke?: string;
    strokeWidth?: number;
    stroke_width?: number;
    color?: Color;
    fill?: string;
    fill_color?: string;
    fillOpacity?: number;
    fill_opacity?: number;
  },
  maybeOpts?: {
    id?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    stroke?: string;
    strokeWidth?: number;
    stroke_width?: number;
    color?: Color;
    fill?: string;
    fill_color?: string;
    fillOpacity?: number;
    fill_opacity?: number;
  }
): Mobject {
  const id = typeof idOrOpts === 'string' ? idOrOpts : autoId('rectangle');
  const opts = (typeof idOrOpts === 'string' ? maybeOpts : idOrOpts) ?? {};
  const color = opts.color ?? opts.stroke ?? '#e2e8f0';
  return attachMobjectApi({
    id,
    kind: 'square',
    x: opts.x ?? CENTER_X,
    y: opts.y ?? CENTER_Y,
    width: normalizeSceneLength(opts.width) ?? 140,
    height: normalizeSceneLength(opts.height) ?? 84,
    stroke: color,
    strokeWidth: opts.stroke_width ??
      opts.strokeWidth ??
      DEFAULT_STROKE_WIDTH,
    fill: opts.fill_color ?? opts.fill ?? 'none',
    opacity: opts.fill_opacity ?? opts.fillOpacity ?? 1,
  });
}

export function RoundedRectangle(
  idOrOpts: string | {
    id?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    cornerRadius?: number;
    stroke?: string;
    strokeWidth?: number;
    color?: Color;
  },
  maybeOpts?: {
    id?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    cornerRadius?: number;
    stroke?: string;
    strokeWidth?: number;
    color?: Color;
  }
): Mobject {
  const rectangle = Rectangle(idOrOpts as never, maybeOpts as never);
  const opts = (typeof idOrOpts === 'string' ? maybeOpts : idOrOpts) ?? {};
  rectangle.cornerRadius = opts.cornerRadius ?? 18;
  return rectangle;
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
    x: opts.x ?? CENTER_X,
    y: opts.y ?? CENTER_Y,
    radius: normalizeSceneLength(opts.radius) ?? 48,
    stroke: color,
    strokeWidth: opts.strokeWidth ?? DEFAULT_STROKE_WIDTH,
    fill: 'none',
  });
}

export function Ellipse(
  idOrOpts: string | {
    id?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    stroke?: string;
    strokeWidth?: number;
    color?: Color;
  },
  maybeOpts?: {
    id?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    stroke?: string;
    strokeWidth?: number;
    color?: Color;
  }
): Mobject {
  const id = typeof idOrOpts === 'string' ? idOrOpts : autoId('ellipse');
  const opts = (typeof idOrOpts === 'string' ? maybeOpts : idOrOpts) ?? {};
  const color = opts.color ?? opts.stroke ?? '#e2e8f0';
  return attachMobjectApi({
    id,
    kind: 'circle',
    x: opts.x ?? CENTER_X,
    y: opts.y ?? CENTER_Y,
    width: normalizeSceneLength(opts.width) ?? 160,
    height: normalizeSceneLength(opts.height) ?? 96,
    radius:
      Math.max(
        normalizeSceneLength(opts.width) ?? 160,
        normalizeSceneLength(opts.height) ?? 96
      ) / 2,
    stroke: color,
    strokeWidth: opts.strokeWidth ?? DEFAULT_STROKE_WIDTH,
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
    fill_color?: string;
    strokeWidth?: number;
    stroke_width?: number;
    color?: Color;
  },
  pointOrOpts?: PointLike | {
    x?: number;
    y?: number;
    radius?: number;
    stroke?: string;
    fill?: string;
    fill_color?: string;
    strokeWidth?: number;
    stroke_width?: number;
    color?: Color;
  },
  opts?: {
    x?: number;
    y?: number;
    radius?: number;
    stroke?: string;
    fill?: string;
    fill_color?: string;
    strokeWidth?: number;
    stroke_width?: number;
    color?: Color;
  }
): Mobject {
  const id = typeof idOrPointOrOpts === 'string'
    ? idOrPointOrOpts
    : autoId('dot');
  const pointLike = typeof idOrPointOrOpts === 'string'
    ? pointOrOpts
    : idOrPointOrOpts;
  const point = isPoint(pointLike) || isTuple(pointLike)
    ? fromPointLike(pointLike)
    : undefined;
  const inlineSource = typeof idOrPointOrOpts === 'string'
    ? pointOrOpts
    : idOrPointOrOpts;
  const inlineOpts = (typeof inlineSource === 'object' &&
    inlineSource !== null &&
    !isPoint(inlineSource) &&
    !isTuple(inlineSource)
      ? inlineSource
      : undefined);
  const merged = { ...inlineOpts, ...opts };
  const fill = merged?.fill_color ?? merged?.fill;
  const color = merged?.color ?? fill ?? merged?.stroke ?? '#e2e8f0';
  const x = point?.x ?? merged?.x ?? CENTER_X;
  const y = point?.y ?? merged?.y ?? CENTER_Y;
  return attachMobjectApi({
    id,
    kind: 'dot',
    x,
    y,
    // Manim CE Dot default radius is 0.08 scene units.
    // Our scene scale is 80 px/unit, so default is 6.4 px.
    radius: normalizeSceneLength(merged?.radius) ?? 6.4,
    stroke: merged?.stroke ?? color,
    fill: fill ?? color,
    strokeWidth: merged?.stroke_width ?? merged?.strokeWidth ?? 0,
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
    fontFamily?: string;
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
    fontFamily: opts.fontFamily,
  });
}

export function Text(
  value: string,
  opts?: {
    id?: string;
    x?: number;
    y?: number;
    stroke?: string;
    fill?: string;
    fontSize?: number;
    font_size?: number;
    fontFamily?: string;
    font_family?: string;
    width?: number;
    textAlign?: 'left' | 'center' | 'right';
    text_align?: 'left' | 'center' | 'right';
  }
): Mobject {
  const text = TitleText(opts?.id ?? autoId('text'), {
    x: opts?.x,
    y: opts?.y,
    value,
    stroke: opts?.stroke,
    fill: opts?.fill,
    fontSize: opts?.font_size ?? opts?.fontSize ?? 36,
    fontFamily: opts?.font_family ?? opts?.fontFamily,
  });
  text.width = opts?.width;
  text.textAlign = opts?.text_align ?? opts?.textAlign ?? 'center';
  return text;
}

export function MarkupText(
  value: string,
  opts?: {
    id?: string;
    x?: number;
    y?: number;
    fontSize?: number;
    fill?: string;
    stroke?: string;
  }
): Mobject {
  const segments: Array<{ text: string; fill?: string }> = [];
  const spanPattern = /<span\s+fgcolor="([^"]+)">([\s\S]*?)<\/span>/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = spanPattern.exec(value)) !== null) {
    if (match.index > cursor) {
      segments.push({
        text: value.slice(cursor, match.index).replace(/<[^>]+>/g, '')
      });
    }
    segments.push({
      text: match[2]?.replace(/<[^>]+>/g, '') ?? '',
      fill: match[1]
    });
    cursor = match.index + match[0].length;
  }
  if (cursor < value.length) {
    segments.push({
      text: value.slice(cursor).replace(/<[^>]+>/g, '')
    });
  }
  const text = Text(
    segments.map((segment) => segment.text).join(''),
    opts
  );
  text.textSegments = segments;
  return text;
}

export function Paragraph(
  ...args: Array<
    string | {
      id?: string;
      x?: number;
      y?: number;
      fontSize?: number;
      fill?: string;
      stroke?: string;
      lineSpacing?: number;
      alignment?: 'left' | 'center' | 'right';
    }
  >
): Mobject {
  const maybeOpts = args[args.length - 1];
  const hasOpts = typeof maybeOpts === 'object' && maybeOpts !== null;
  const opts = (hasOpts ? maybeOpts : {}) as {
    id?: string;
    x?: number;
    y?: number;
    fontSize?: number;
    fill?: string;
    stroke?: string;
    lineSpacing?: number;
    alignment?: 'left' | 'center' | 'right';
  };
  const lines = (hasOpts ? args.slice(0, -1) : args) as string[];
  const fontSize = opts.fontSize ?? 32;
  const spacing = opts.lineSpacing ?? fontSize * 1.4;
  const children = lines.map((line, index) =>
    Text(line, {
      id: `${opts.id ?? autoId('paragraph')}_line_${index}`,
      x: opts.x ?? CENTER_X,
      y: (opts.y ?? CENTER_Y) + (index - (lines.length - 1) / 2) * spacing,
      fontSize,
      fill: opts.fill,
      stroke: opts.stroke,
      textAlign: opts.alignment ?? 'center',
    })
  );
  return attachMobjectApi({
    id: opts.id ?? autoId('paragraph'),
    kind: 'group',
    children,
    stroke: 'none',
    strokeWidth: 0,
  });
}

export function Title(
  value: string,
  opts?: {
    id?: string;
    includeUnderline?: boolean;
    matchUnderlineWidthToText?: boolean;
    fontSize?: number;
    color?: Color;
  }
): Mobject {
  const title = Text(value, {
    id: opts?.id ?? autoId('title'),
    fontSize: opts?.fontSize ?? 42,
    fill: opts?.color,
  }).toEdge!(UP, 0.5);
  if (opts?.includeUnderline === false) {
    return title;
  }
  const underline = Underline(title, {
    id: `${title.id}_underline`,
    color: opts?.color,
  });
  return VGroup(`${title.id}_group`, title, underline);
}

export function BulletedList(
  ...items: Array<
    string | {
      id?: string;
      x?: number;
      y?: number;
      fontSize?: number;
      color?: Color;
      bullet?: string;
    }
  >
): Mobject {
  const maybeOpts = items[items.length - 1];
  const hasOpts = typeof maybeOpts === 'object' && maybeOpts !== null;
  const opts = (hasOpts ? maybeOpts : {}) as {
    id?: string;
    x?: number;
    y?: number;
    fontSize?: number;
    color?: Color;
    bullet?: string;
  };
  const lines = (hasOpts ? items.slice(0, -1) : items) as string[];
  return Paragraph(
    ...lines.map((line) => `${opts.bullet ?? '•'} ${line}`),
    {
      id: opts.id ?? autoId('bulleted_list'),
      x: opts.x,
      y: opts.y,
      fontSize: opts.fontSize ?? 30,
      fill: opts.color,
      alignment: 'left',
    }
  );
}

export function registerFont(_name: string, _url?: string): void {
  // Local stub for CE-like API coverage. No font loader yet.
}

export function Tex(
  idOrTex: string,
  texOrOpts?: string | {
    x?: number;
    y?: number;
    fontSize?: number;
    color?: Color;
    fill?: string;
    stroke?: string;
    texTemplate?: string;
  },
  maybeOpts?: {
    x?: number;
    y?: number;
    fontSize?: number;
    color?: Color;
    fill?: string;
    stroke?: string;
    texTemplate?: string;
  }
): Mobject {
  const hasId = typeof texOrOpts === 'string';
  const id = hasId ? idOrTex : autoId('tex');
  const tex = hasId ? (texOrOpts as string) : idOrTex;
  const opts = (hasId ? maybeOpts : texOrOpts) ?? {};
  const normalized = tex
    .replace(/^\$/, '')
    .replace(/\$$/, '');
  return KMathTex(id, normalized, opts);
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
    x: opts.x ?? CENTER_X,
    y: opts.y ?? CENTER_Y,
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
    points: PointLike[];
    stroke: string;
    strokeWidth?: number;
    closed?: boolean;
    fill?: string;
  }
): Mobject {
  return attachMobjectApi({
    id,
    kind: 'path',
    points: opts.points.map((point) => fromPointLike(point)),
    stroke: opts.stroke,
    strokeWidth: opts.strokeWidth ?? DEFAULT_STROKE_WIDTH,
    fill: opts.fill ?? 'none',
    closed: opts.closed ?? true
  });
}

export function Polygon(
  ...args: Array<
    string | PointLike | {
      stroke?: string;
      color?: Color;
      strokeWidth?: number;
      stroke_width?: number;
      fill?: string;
      fill_color?: string;
      fillOpacity?: number;
      fill_opacity?: number;
    }
  >
): Mobject {
  const first = args[0];
  const hasId = typeof first === 'string';
  const id = hasId ? (first as string) : autoId('polygon');
  const tail = hasId ? args.slice(1) : args;
  const maybeOpts = tail[tail.length - 1];
  const hasOpts = typeof maybeOpts === 'object' &&
    maybeOpts !== null &&
    !isPoint(maybeOpts) &&
    !isTuple(maybeOpts);
  const opts = (hasOpts ? maybeOpts : {}) as {
    stroke?: string;
    color?: Color;
    strokeWidth?: number;
    stroke_width?: number;
    fill?: string;
    fill_color?: string;
    fillOpacity?: number;
    fill_opacity?: number;
  };
  const vertices = (hasOpts ? tail.slice(0, -1) : tail) as PointLike[];
  const points = vertices.map((vertex) => fromPointLike(vertex));
  return attachMobjectApi({
    id,
    kind: 'path',
    points,
    closed: true,
    stroke: opts.color ?? opts.stroke ?? '#e2e8f0',
    strokeWidth: opts.stroke_width ??
      opts.strokeWidth ??
      DEFAULT_STROKE_WIDTH,
    fill: opts.fill_color ?? opts.fill ?? 'none',
    opacity: opts.fill_opacity ?? opts.fillOpacity ?? 1,
  });
}

export function Triangle(
  idOrOpts?: string | {
    x?: number;
    y?: number;
    size?: number;
    stroke?: string;
    color?: Color;
    strokeWidth?: number;
  },
  maybeOpts?: {
    x?: number;
    y?: number;
    size?: number;
    stroke?: string;
    color?: Color;
    strokeWidth?: number;
  }
): Mobject {
  const id = typeof idOrOpts === 'string' ? idOrOpts : autoId('triangle');
  const opts = (typeof idOrOpts === 'string' ? maybeOpts : idOrOpts) ?? {};
  const radius = (opts.size ?? 120) / Math.sqrt(3);
  return RegularPolygon(3, {
    id,
    x: opts.x,
    y: opts.y,
    radius,
    color: opts.color ?? opts.stroke,
    strokeWidth: opts.strokeWidth
  });
}

export function RegularPolygon(
  n: number,
  opts?: {
    id?: string;
    x?: number;
    y?: number;
    radius?: number;
    stroke?: string;
    color?: Color;
    strokeWidth?: number;
  }
): Mobject {
  const radius = opts?.radius ?? 60;
  const cx = opts?.x ?? CENTER_X;
  const cy = opts?.y ?? CENTER_Y;
  const points: Point[] = [];
  for (let i = 0; i < n; i += 1) {
    const theta = (Math.PI / 2) + (i / n) * Math.PI * 2;
    points.push({
      x: cx + radius * Math.cos(theta),
      y: cy - radius * Math.sin(theta),
    });
  }
  return attachMobjectApi({
    id: opts?.id ?? autoId('regular_polygon'),
    kind: 'path',
    points,
    closed: true,
    stroke: opts?.color ?? opts?.stroke ?? '#e2e8f0',
    strokeWidth: opts?.strokeWidth ?? DEFAULT_STROKE_WIDTH,
    fill: 'none',
  });
}

export function Arc(
  idOrOpts?: string | {
    id?: string;
    x?: number;
    y?: number;
    radius?: number;
    startAngle?: number;
    angle?: number;
    stroke?: string;
    color?: Color;
    strokeWidth?: number;
    samples?: number;
  },
  maybeOpts?: {
    id?: string;
    x?: number;
    y?: number;
    radius?: number;
    startAngle?: number;
    angle?: number;
    stroke?: string;
    color?: Color;
    strokeWidth?: number;
    samples?: number;
  }
): Mobject {
  const id = typeof idOrOpts === 'string' ? idOrOpts : autoId('arc');
  const opts = (typeof idOrOpts === 'string' ? maybeOpts : idOrOpts) ?? {};
  const radius = opts.radius ?? 60;
  const cx = opts.x ?? CENTER_X;
  const cy = opts.y ?? CENTER_Y;
  const start = opts.startAngle ?? 0;
  const angle = opts.angle ?? Math.PI / 2;
  const samples = Math.max(8, opts.samples ?? 48);
  const points: Point[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const theta = start + (angle * i) / samples;
    points.push({
      x: cx + radius * Math.cos(theta),
      y: cy - radius * Math.sin(theta),
    });
  }
  return Path(id, {
    points,
    closed: false,
    stroke: opts.color ?? opts.stroke ?? '#e2e8f0',
    strokeWidth: opts.strokeWidth ?? DEFAULT_STROKE_WIDTH,
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
    strokeWidth: opts?.strokeWidth ?? DEFAULT_STROKE_WIDTH,
    closed: false,
  });
}

export function Arrow(
  start: PointLike,
  end: PointLike,
  opts?: {
    id?: string;
    stroke?: string;
    color?: Color;
    strokeWidth?: number;
    tipLength?: number;
  }
): Mobject {
  const id = opts?.id ?? autoId('arrow');
  const color = opts?.color ?? opts?.stroke ?? '#e2e8f0';
  const a = fromPointLike(start);
  const b = fromPointLike(end);
  const angle = Math.atan2(b.y - a.y, b.x - a.x);
  const tipLength = opts?.tipLength ?? 18;
  const left = {
    x: b.x - tipLength * Math.cos(angle - Math.PI / 6),
    y: b.y - tipLength * Math.sin(angle - Math.PI / 6),
  };
  const right = {
    x: b.x - tipLength * Math.cos(angle + Math.PI / 6),
    y: b.y - tipLength * Math.sin(angle + Math.PI / 6),
  };
  return VGroup(
    id,
    Line(start, end, {
      id: `${id}_shaft`,
      color,
      strokeWidth: opts?.strokeWidth ?? DEFAULT_STROKE_WIDTH,
    }),
    Path(`${id}_tip`, {
      points: [left, b, right],
      stroke: color,
      fill: color,
      strokeWidth: opts?.strokeWidth ?? DEFAULT_STROKE_WIDTH,
      closed: true,
    })
  );
}

export function Vector(
  direction: PointLike,
  opts?: {
    id?: string;
    color?: Color;
    stroke?: string;
    strokeWidth?: number;
  }
): Mobject {
  return Arrow(ORIGIN, direction, opts);
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
  e?: PointLike | {
    stroke?: string;
    strokeWidth?: number;
    stroke_width?: number;
    samples?: number;
    color?: Color;
  },
  f?: {
    stroke?: string;
    strokeWidth?: number;
    stroke_width?: number;
    samples?: number;
    color?: Color;
  }
): Mobject {
  const id = typeof a === 'string' ? a : autoId('cubic_bezier');
  const p0 = fromPointLike((typeof a === 'string' ? b : a) as PointLike);
  const p1 = fromPointLike((typeof a === 'string' ? c : b) as PointLike);
  const p2 = fromPointLike((typeof a === 'string' ? d : c) as PointLike);
  const p3 = fromPointLike((typeof a === 'string' ? (e as PointLike) : d) as PointLike);
  const opts = (typeof a === 'string' ? f : e) as
    | {
      stroke?: string;
      strokeWidth?: number;
      stroke_width?: number;
      samples?: number;
      color?: Color;
    }
    | undefined;
  const samples = Math.max(8, opts?.samples ?? 64);
  const points: Point[] = [];
  for (let i = 0; i <= samples; i += 1) {
    points.push(cubicBezierPoint(i / samples, p0, p1, p2, p3));
  }
  return Path(id, {
    points,
    closed: false,
    stroke: opts?.color ?? opts?.stroke ?? '#e2e8f0',
    strokeWidth: opts?.stroke_width ??
      opts?.strokeWidth ??
      DEFAULT_STROKE_WIDTH,
  });
}

export function VGroup(
  idOrChild: string | Mobject,
  ...rest: Mobject[]
): Mobject {
  const hasId = typeof idOrChild === 'string';
  const id = hasId ? idOrChild : autoId('group');
  const children = hasId ? rest : [idOrChild, ...rest];
  return attachMobjectApi({
    id,
    kind: 'group',
    children,
    stroke: 'none',
    strokeWidth: 0,
  });
}

export function ThreeDAxes(opts?: {
  id?: string;
  color?: Color;
  strokeWidth?: number;
  length?: number;
  tickStep?: number;
}): Mobject {
  const id = opts?.id ?? autoId('three_d_axes');
  const color = opts?.color ?? '#e2e8f0';
  const strokeWidth = opts?.strokeWidth ?? 4;
  const length = opts?.length ?? 6;
  const tickStep = opts?.tickStep ?? 1;
  const axisLine = (
    axisId: string,
    start: Point3D,
    end: Point3D,
    stroke: string,
    zIndex: number
  ): Mobject => attachMobjectApi({
    id: axisId,
    kind: 'path3d',
    points3d: [start, end],
    center3d: point3d(
      (start.x + end.x) / 2,
      (start.y + end.y) / 2,
      (start.z + end.z) / 2
    ),
    closed: false,
    stroke,
    strokeWidth,
    is3d: true,
    zIndex,
  });

  const tickLine = (
    axisId: string,
    index: number,
    center: Point3D,
    offsetA: Point3D,
    offsetB: Point3D,
    stroke: string,
    zIndex: number
  ): Mobject => attachMobjectApi({
    id: `${axisId}_tick_${index}`,
    kind: 'path3d',
    points3d: [
      point3d(
        center.x + offsetA.x,
        center.y + offsetA.y,
        center.z + offsetA.z
      ),
      point3d(
        center.x + offsetB.x,
        center.y + offsetB.y,
        center.z + offsetB.z
      )
    ],
    center3d: center,
    closed: false,
    stroke,
    strokeWidth: Math.max(1.5, strokeWidth * 0.55),
    is3d: true,
    zIndex,
  });

  const arrowTip = (
    axisId: string,
    end: Point3D,
    left: Point3D,
    right: Point3D,
    stroke: string,
    zIndex: number
  ): Mobject => attachMobjectApi({
    id: `${axisId}_tip`,
    kind: 'path3d',
    points3d: [left, end, right],
    center3d: end,
    closed: false,
    stroke,
    strokeWidth,
    is3d: true,
    zIndex,
  });

  function buildAxis(
    axisId: string,
    start: Point3D,
    end: Point3D,
    stroke: string,
    zIndex: number,
    tickOffsets: [Point3D, Point3D],
    tipOffsets: [Point3D, Point3D]
  ): Mobject[] {
    const children: Mobject[] = [axisLine(axisId, start, end, stroke, zIndex)];
    for (
      let value = -length + tickStep;
      value < length - (tickStep * 0.5);
      value += tickStep
    ) {
      const center = axisId.endsWith('_x')
        ? point3d(value, 0, 0)
        : axisId.endsWith('_y')
          ? point3d(0, value, 0)
          : point3d(0, 0, value);
      children.push(
        tickLine(
          axisId,
          Math.round(value * 100),
          center,
          tickOffsets[0],
          tickOffsets[1],
          stroke,
          zIndex
        )
      );
    }
    children.push(
      arrowTip(
        axisId,
        end,
        point3d(
          end.x + tipOffsets[0].x,
          end.y + tipOffsets[0].y,
          end.z + tipOffsets[0].z
        ),
        point3d(
          end.x + tipOffsets[1].x,
          end.y + tipOffsets[1].y,
          end.z + tipOffsets[1].z
        ),
        stroke,
        zIndex
      )
    );
    return children;
  }

  return attachMobjectApi({
    id,
    kind: 'group3d',
    children: [
      ...buildAxis(
        `${id}_x`,
        point3d(-length, 0, 0),
        point3d(length, 0, 0),
        color,
        2,
        [point3d(0, -0.06, 0), point3d(0, 0.06, 0)],
        [point3d(-0.18, 0.09, 0), point3d(-0.18, -0.09, 0)]
      ),
      ...buildAxis(
        `${id}_y`,
        point3d(0, -length, 0),
        point3d(0, length, 0),
        color,
        1,
        [point3d(-0.06, 0, 0), point3d(0.06, 0, 0)],
        [point3d(-0.09, -0.18, 0), point3d(0.09, -0.18, 0)]
      ),
      ...buildAxis(
        `${id}_z`,
        point3d(0, 0, -length),
        point3d(0, 0, length),
        color,
        0,
        [point3d(-0.05, 0, 0), point3d(0.05, 0, 0)],
        [point3d(-0.08, 0, -0.18), point3d(0.08, 0, -0.18)]
      ),
    ],
    stroke: color,
    strokeWidth,
    is3d: true,
  });
}

export function Sphere(opts?: {
  id?: string;
  radius?: number;
  color?: Color;
  stroke?: Color;
  strokeWidth?: number;
  fillOpacity?: number;
}): Mobject {
  const color = opts?.color ?? opts?.stroke ?? '#60a5fa';
  return attachMobjectApi({
    id: opts?.id ?? autoId('sphere'),
    kind: 'sphere3d',
    center3d: point3d(0, 0, 0),
    radius: opts?.radius ?? 1,
    stroke: shadeColor(color, 0.82),
    fill: color,
    strokeWidth: opts?.strokeWidth ?? 2,
    fillOpacity: opts?.fillOpacity ?? 0.94,
    is3d: true,
    shade3d: true,
  });
}

export function Axes(opts?: {
  id?: string;
  xRange?: [number, number, number?];
  yRange?: [number, number, number?];
  tips?: boolean;
  color?: Color;
  strokeWidth?: number;
  xLength?: number;
  yLength?: number;
  axisConfig?: {
    includeNumbers?: boolean;
  };
}): Mobject {
  const numberFontFamily = 'KaTeX_Main, "Times New Roman", serif';
  const xRange = opts?.xRange ?? [-4, 4, 1];
  const yRange = opts?.yRange ?? [-3, 3, 1];
  const color = opts?.color ?? '#e2e8f0';
  const strokeWidth = opts?.strokeWidth ?? 3;
  const id = opts?.id ?? autoId('axes');
  const includeNumbers = opts?.axisConfig?.includeNumbers ?? false;
  const xLength = opts?.xLength ?? (STAGE_WIDTH - 260);
  const yLength = opts?.yLength ?? (STAGE_HEIGHT - 140);
  const plotLeft = (STAGE_WIDTH - xLength) / 2;
  const plotTop = (STAGE_HEIGHT - yLength) / 2;
  const xSpan = Math.max(1e-9, xRange[1] - xRange[0]);
  const ySpan = Math.max(1e-9, yRange[1] - yRange[0]);

  function axisPoint(
    x: number,
    y: number,
  ): Point {
    return {
      x: plotLeft + ((x - xRange[0]) / xSpan) * xLength,
      y: plotTop + ((yRange[1] - y) / ySpan) * yLength,
    };
  }

  function buildAxisTicks(
    axisId: string,
    axis: 'x' | 'y',
    range: [number, number, number?],
    color: Color,
    strokeWidth: number
  ): Mobject[] {
    const [min, max, rawStep] = range;
    const step = rawStep ?? 1;
    if (step <= 0) return [];
    const ticks: Mobject[] = [];
    const epsilon = 1e-9;
    const labelOffsetPx = 34;
    const tickHalfSizePx = 10;
    const numberFontSize = 30;

    for (
      let value = min;
      value <= max + epsilon;
      value = Number((value + step).toFixed(9))
    ) {
      if (Math.abs(value) <= epsilon) continue;
      if (axis === 'x') {
        const point = axisPoint(value, 0);
        const x = point.x;
        const y = point.y;
        ticks.push(
          Line(
            { x, y: y - tickHalfSizePx },
            { x, y: y + tickHalfSizePx },
            {
              id: `${axisId}_tick_${String(value).replace('.', '_')}`,
              color,
              strokeWidth,
            }
          )
        );
        ticks.push(
          Text(String(value), {
            id: `${axisId}_label_${String(value).replace('.', '_')}`,
            x,
            y: y + labelOffsetPx,
            fill: color,
            fontSize: numberFontSize,
            fontFamily: numberFontFamily,
          })
        );
        continue;
      }

      const point = axisPoint(0, value);
      const x = point.x;
      const y = point.y;
      ticks.push(
        Line(
          { x: x - tickHalfSizePx, y },
          { x: x + tickHalfSizePx, y },
          {
            id: `${axisId}_tick_${String(value).replace('.', '_')}`,
            color,
            strokeWidth,
          }
        )
      );
      ticks.push(
        Text(String(value), {
          id: `${axisId}_label_${String(value).replace('.', '_')}`,
          x: x - labelOffsetPx,
          y,
          fill: color,
          fontSize: numberFontSize,
          fontFamily: numberFontFamily,
        })
      );
    }
    return ticks;
  }

  const xAxis = Line(
    axisPoint(xRange[0], 0),
    axisPoint(xRange[1], 0),
    {
    id: `${id}_x`,
    color,
    strokeWidth,
    }
  );
  const yAxis = Line(
    axisPoint(0, yRange[0]),
    axisPoint(0, yRange[1]),
    {
    id: `${id}_y`,
    color,
    strokeWidth,
    }
  );
  const xTicks = includeNumbers
    ? buildAxisTicks(`${id}_x`, 'x', xRange, color, strokeWidth)
    : [];
  const yTicks = includeNumbers
    ? buildAxisTicks(`${id}_y`, 'y', yRange, color, strokeWidth)
    : [];
  const axes = VGroup(id, xAxis, yAxis, ...xTicks, ...yTicks);
  axes.plot = (
    fn: (x: number) => number,
    plotOpts?: { id?: string; color?: Color; strokeWidth?: number; samples?: number }
  ): Mobject => {
    const samples = Math.max(8, plotOpts?.samples ?? 80);
    const points: Point[] = [];
    const [minX, maxX] = xRange;
    for (let i = 0; i <= samples; i += 1) {
      const x = minX + ((maxX - minX) * i) / samples;
      points.push(axisPoint(x, fn(x)));
    }
    return Path(plotOpts?.id ?? autoId('graph'), {
      points,
      stroke: plotOpts?.color ?? '#4CC9F0',
      strokeWidth: plotOpts?.strokeWidth ?? 5,
      closed: false,
    });
  };
  return axes;
}

export function SVGMobject(
  href: string,
  opts?: {
    id?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    opacity?: number;
  }
): Mobject {
  return attachMobjectApi({
    id: opts?.id ?? autoId('svg'),
    kind: 'svg',
    x: opts?.x ?? CENTER_X,
    y: opts?.y ?? CENTER_Y,
    size: opts?.width ?? 120,
    radius: opts?.height ?? 120,
    width: opts?.width ?? 120,
    height: opts?.height ?? 120,
    stroke: 'none',
    strokeWidth: 0,
    opacity: opts?.opacity ?? 1,
    svgHref: href,
  });
}

export function always_redraw(factory: () => Mobject): Mobject {
  const initial = factory();
  initial.alwaysRedrawFactory = () => {
    const next = factory();
    return cloneMobject(next, initial.id);
  };
  return initial;
}

export function SurroundingRectangle(
  target: Mobject,
  opts?: {
    id?: string;
    buff?: number;
    color?: Color;
    stroke?: string;
    strokeWidth?: number;
    cornerRadius?: number;
  }
): Mobject {
  const cornerRadius = opts?.cornerRadius ?? 0;
  const rectangle = cornerRadius > 0
    ? RoundedRectangle({
        id: opts?.id ?? autoId('surrounding_rectangle'),
        color: opts?.color ?? opts?.stroke,
        strokeWidth: opts?.strokeWidth,
        cornerRadius,
      })
    : Rectangle({
        id: opts?.id ?? autoId('surrounding_rectangle'),
        color: opts?.color ?? opts?.stroke,
        strokeWidth: opts?.strokeWidth,
      });
  rectangle.surround?.(target, opts?.buff ?? 12);
  return rectangle;
}

export function Underline(
  target: Mobject,
  opts?: {
    id?: string;
    color?: Color;
    stroke?: string;
    strokeWidth?: number;
    buff?: number;
  }
): Mobject {
  const bounds = mobjectBounds(target);
  const y = bounds.bottom + (opts?.buff ?? 4);
  return Line(
    { x: bounds.left, y },
    { x: bounds.right, y },
    {
      id: opts?.id ?? autoId('underline'),
      color: opts?.color ?? opts?.stroke ?? target.stroke,
      strokeWidth: opts?.strokeWidth ?? 4,
    }
  );
}

export function Cross(
  target: Mobject,
  opts?: {
    id?: string;
    color?: Color;
    stroke?: string;
    strokeWidth?: number;
  }
): Mobject {
  const bounds = mobjectBounds(target);
  return VGroup(
    opts?.id ?? autoId('cross'),
    Line(
      { x: bounds.left, y: bounds.top },
      { x: bounds.right, y: bounds.bottom },
      {
        color: opts?.color ?? opts?.stroke ?? '#e11d48',
        strokeWidth: opts?.strokeWidth ?? 6,
      }
    ),
    Line(
      { x: bounds.right, y: bounds.top },
      { x: bounds.left, y: bounds.bottom },
      {
        color: opts?.color ?? opts?.stroke ?? '#e11d48',
        strokeWidth: opts?.strokeWidth ?? 6,
      }
    )
  );
}

export function Brace(
  target: Mobject,
  opts?: {
    id?: string;
    direction?: PointLike;
    color?: Color;
    stroke?: string;
    strokeWidth?: number;
    buff?: number;
  }
): Mobject {
  const bounds = mobjectBounds(target);
  const direction = opts?.direction ?? DOWN;
  const axis = directionAxis(direction);
  const buff = opts?.buff === undefined
    ? 8
    : (Math.abs(opts.buff) <= 3 ? opts.buff * UNIT_PX : opts.buff);
  if (axis === 'x') {
    const x = Math.sign(asVector(direction)[0]) >= 0 ? bounds.right + buff : bounds.left - buff;
    return Path(opts?.id ?? autoId('brace'), {
      points: [
        { x, y: bounds.top },
        { x: x + Math.sign(asVector(direction)[0]) * 10, y: (bounds.top + bounds.bottom) / 2 },
        { x, y: bounds.bottom },
      ],
      closed: false,
      stroke: opts?.color ?? opts?.stroke ?? '#e2e8f0',
      strokeWidth: opts?.strokeWidth ?? 5,
    });
  }
  const signY = Math.sign(asVector(direction)[1]) || -1;
  const y = signY >= 0 ? bounds.top - buff : bounds.bottom + buff + 6;
  const centerX = (bounds.left + bounds.right) / 2;
  const width = bounds.right - bounds.left;
  const hookDepth = 8;
  const innerDepth = 5;
  const cuspDepth = 18;
  return Path(opts?.id ?? autoId('brace'), {
    points: [
      { x: bounds.left, y },
      { x: bounds.left + 8, y },
      {
        x: bounds.left + 14,
        y: y - signY * hookDepth
      },
      {
        x: bounds.left + (width * 0.28),
        y: y - signY * innerDepth
      },
      {
        x: centerX - 12,
        y: y - signY * innerDepth
      },
      {
        x: centerX,
        y: y - signY * cuspDepth
      },
      {
        x: centerX + 12,
        y: y - signY * innerDepth
      },
      {
        x: bounds.right - (width * 0.28),
        y: y - signY * innerDepth
      },
      {
        x: bounds.right - 14,
        y: y - signY * hookDepth
      },
      { x: bounds.right - 8, y },
      { x: bounds.right, y },
    ],
    closed: false,
    stroke: opts?.color ?? opts?.stroke ?? '#e2e8f0',
    strokeWidth: opts?.strokeWidth ?? 4,
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
  opts?: AnimationOpts
):
  | PendingAnimation
  | PendingAnimation[] {
  const targets = flattenRenderable(target);
  if (targets.length === 1) {
    return {
      kind: 'create',
      targetId: targets[0].id,
      rateFunc: normalizeRateFunction(opts),
      runTime: normalizeRunTime(opts),
      _introducerRoot: target
    };
  }
  return targets.map((item, index) => ({
    kind: 'create',
    targetId: item.id,
    rateFunc: normalizeRateFunction(opts),
    runTime: normalizeRunTime(opts),
    _introducerRoot: target,
    meta: {
      createChildIndex: index,
      createChildCount: targets.length,
    }
  }));
}

export function FadeIn(
  target: Mobject,
  opts?: {
    runTime?: number;
    run_time?: number;
    rateFunc?: string | RateFunction;
    rate_func?: string | RateFunction;
    shift?: PointLike;
    targetPosition?: PointLike | Mobject;
    target_position?: PointLike | Mobject;
    scale?: number;
  }
):
  | PendingAnimation
  | PendingAnimation[] {
  const targets = flattenRenderable(target);
  const targetPosition = opts?.targetPosition ?? opts?.target_position;

  function fadeInAnimation(item: Mobject): PendingAnimation {
    const meta: Animation['meta'] = {};
    if (opts?.shift) {
      const [dx, dy] = asVector(opts.shift);
      meta.fadeInShiftX = dx * UNIT_PX;
      meta.fadeInShiftY = -dy * UNIT_PX;
    }
    if (targetPosition) {
      const point = 'id' in targetPosition
        ? targetPosition.getCenter?.() ?? {
            x: getMobjectX(targetPosition),
            y: getMobjectY(targetPosition),
          }
        : fromPointLike(targetPosition);
      meta.fadeInTargetX = point.x;
      meta.fadeInTargetY = point.y;
    }
    if (typeof opts?.scale === 'number') {
      meta.fadeInScale = opts.scale;
    }
    return {
      kind: 'fadeIn',
      targetId: item.id,
      rateFunc: normalizeRateFunction(opts),
      runTime: normalizeRunTime(opts),
      meta: Object.keys(meta).length > 0 ? meta : undefined,
      _introducerRoot: target,
    };
  }

  if (targets.length === 1) {
    return fadeInAnimation(targets[0]);
  }
  return targets.map((item) => fadeInAnimation(item));
}

export function FadeOut(
  target: Mobject,
  opts?: AnimationOpts
):
  | PendingAnimation
  | PendingAnimation[] {
  const targets = flattenRenderable(target);
  if (targets.length === 1) {
    return {
      kind: 'fadeOut',
      targetId: targets[0].id,
      rateFunc: normalizeRateFunction(opts),
      runTime: normalizeRunTime(opts),
    };
  }
  return targets.map((item) => ({
    kind: 'fadeOut',
    targetId: item.id,
    rateFunc: normalizeRateFunction(opts),
    runTime: normalizeRunTime(opts),
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
  opts?: AnimationOpts
):
  | PendingAnimation
  | PendingAnimation[] {
  if (
    (source.kind === 'group' || source.kind === 'group3d') &&
    (target.kind === 'group' || target.kind === 'group3d')
  ) {
    const sourceChildren = source.children ?? [];
    const targetChildren = target.children ?? [];
    const targetById = new Map(targetChildren.map((child) => [child.id, child]));
    const matchedTargetIds = new Set<string>();
    const animations: PendingAnimation[] = [];

    for (let index = 0; index < sourceChildren.length; index += 1) {
      const sourceChild = sourceChildren[index]!;
      const matchedById = targetById.get(sourceChild.id);
      const targetChild = matchedById ?? targetChildren[index];
      if (!targetChild) {
        const fade = FadeOut(sourceChild, { run_time: normalizeRunTime(opts) });
        animations.push(...(Array.isArray(fade) ? fade : [fade]));
        continue;
      }
      matchedTargetIds.add(targetChild.id);
      if (sourceChild.id === targetChild.id) {
        continue;
      }
      const childAnimation = ReplacementTransform(sourceChild, targetChild, opts);
      animations.push(...(Array.isArray(childAnimation) ? childAnimation : [childAnimation]));
    }

    for (const targetChild of targetChildren) {
      if (matchedTargetIds.has(targetChild.id)) continue;
      const intro = FadeIn(targetChild, { run_time: normalizeRunTime(opts) });
      animations.push(...(Array.isArray(intro) ? intro : [intro]));
    }

    return animations;
  }

  const sources = flattenRenderable(source);
  const targets = flattenRenderable(target);
  if (
    sources.length > 1 &&
    sources.length === targets.length
  ) {
    return sources.map((item, index) => ({
      kind: 'replacementTransform',
      sourceId: item.id,
      targetId: targets[index]!.id,
      rateFunc: normalizeRateFunction(opts),
      runTime: normalizeRunTime(opts),
      _introducerRoot: target,
    }));
  }
  return {
    kind: 'replacementTransform',
    sourceId: source.id,
    targetId: target.id,
    rateFunc: normalizeRateFunction(opts),
    runTime: normalizeRunTime(opts),
    _introducerRoot: target,
  };
}

type TransformMatchingTexOpts = {
  runTime?: number;
  run_time?: number;
  transformMismatches?: boolean;
  transform_mismatches?: boolean;
};

function normalizeTransformMismatches(
  opts?: TransformMatchingTexOpts
): boolean {
  return Boolean(
    opts?.transform_mismatches ?? opts?.transformMismatches
  );
}

export function TransformMatchingTex(
  source: Mobject,
  target: Mobject,
  opts?: TransformMatchingTexOpts
): PendingAnimation[] {
  const runTime = normalizeRunTime(opts);
  const transformMismatches = normalizeTransformMismatches(opts);
  const sourceParts = flattenRenderable(source);
  const targetParts = flattenRenderable(target);
  const targetByToken = new Map<string, Mobject[]>();

  for (const part of targetParts) {
    const key = part.token ?? part.text ?? '';
    const list = targetByToken.get(key) ?? [];
    list.push(part);
    targetByToken.set(key, list);
  }

  const animations: PendingAnimation[] = [];
  const matchedTargetIds = new Set<string>();
  const mismatchedSources: Mobject[] = [];

  for (const sourcePart of sourceParts) {
    const key = sourcePart.token ?? sourcePart.text ?? '';
    const candidates = targetByToken.get(key) ?? [];
    const targetPart = candidates.shift();
    if (!targetPart) {
      mismatchedSources.push(sourcePart);
      continue;
    }
    matchedTargetIds.add(targetPart.id);
    const animation = ReplacementTransform(sourcePart, targetPart, {
      runTime,
    });
    animations.push(...toPendingAnimations(animation));
  }

  const mismatchedTargets = targetParts.filter(
    (targetPart) => !matchedTargetIds.has(targetPart.id)
  );

  if (transformMismatches) {
    const mismatchCount = Math.min(
      mismatchedSources.length,
      mismatchedTargets.length
    );
    for (let i = 0; i < mismatchCount; i += 1) {
      const animation = ReplacementTransform(
        mismatchedSources[i]!,
        mismatchedTargets[i]!,
        { runTime }
      );
      animations.push(...toPendingAnimations(animation));
    }
    for (let i = mismatchCount; i < mismatchedSources.length; i += 1) {
      animations.push(
        ...toPendingAnimations(FadeOut(mismatchedSources[i]!, { runTime }))
      );
    }
    for (let i = mismatchCount; i < mismatchedTargets.length; i += 1) {
      animations.push(
        ...toPendingAnimations(Create(mismatchedTargets[i]!, { runTime }))
      );
    }
    return animations;
  }

  for (const sourcePart of mismatchedSources) {
    animations.push(...toPendingAnimations(FadeOut(sourcePart, { runTime })));
  }
  for (const targetPart of mismatchedTargets) {
    animations.push(...toPendingAnimations(Create(targetPart, { runTime })));
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
  opts?: AnimationOpts
): PendingAnimation {
  return {
    kind: 'moveAlongPath',
    targetId: target.id,
    pathId: path.id,
    rateFunc: normalizeRateFunction(opts),
    runTime: opts?.runTime,
    _introducerRoot: target,
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
