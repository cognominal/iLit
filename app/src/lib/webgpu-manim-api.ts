import {
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  Scene as ThreeScene,
  Shape,
  ShapeGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
  type Material,
  type Object3D,
  type Texture
} from 'three';
import { WebGPURenderer, Line2NodeMaterial } from 'three/webgpu';
import { Line2 as WebGlLine2 } from 'three/addons/lines/Line2.js';
import { Line2 as WebGpuLine2 } from 'three/addons/lines/webgpu/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import {
  STAGE_HEIGHT,
  STAGE_WIDTH,
  type Mobject,
  type Point
} from '$lib/manim';

export type WebGpuSceneInput = {
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
  bare?: boolean;
};

type GeometryLayer = {
  key: string;
  order: number;
  zIndex: number;
  fillPoints: Point[];
  strokePoints: Point[];
  fill: string | null;
  fillOpacity: number;
  stroke: string | null;
  strokeOpacity: number;
  strokeWidth: number;
  closed: boolean;
};

type TexturedLayer = {
  key: string;
  order: number;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
  textureRequest: TextureRequest;
};

type TextureRequest = {
  cacheKey: string;
  widthPx: number;
  heightPx: number;
  draw: (ctx: CanvasRenderingContext2D) => void | Promise<void>;
};

export type WebGpuSnapshot = {
  geometryLayers: GeometryLayer[];
  texturedLayers: TexturedLayer[];
};

export type ThreeRendererBackend = 'gpu' | 'webgl';

type TextureEntry = {
  state: 'pending' | 'ready' | 'error';
  texture?: Texture;
  promise?: Promise<void>;
};

type Line2WithWidth = Line2NodeMaterial & { linewidth: number };
type ThreeRenderer = WebGPURenderer | WebGLRenderer;

function lerpNumber(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function parseHexColor(color: string): [number, number, number] | null {
  const normalized = color.startsWith('#') ? color.slice(1) : color;
  if (![3, 6].includes(normalized.length)) return null;
  const full = normalized.length === 3
    ? normalized.split('').map((part) => part + part).join('')
    : normalized;
  const channels = [0, 2, 4].map((offset) =>
    Number.parseInt(full.slice(offset, offset + 2), 16)
  );
  if (channels.some((value) => Number.isNaN(value))) return null;
  return channels as [number, number, number];
}

function mixColor(
  from: string | undefined,
  to: string | undefined,
  progress: number
): string {
  const fallback = from ?? to ?? '#e2e8f0';
  if (!from || !to) return fallback;
  const fromRgb = parseHexColor(from);
  const toRgb = parseHexColor(to);
  if (!fromRgb || !toRgb) return progress < 0.5 ? from : to;
  const mixed = fromRgb.map((channel, index) =>
    Math.round(lerpNumber(channel, toRgb[index]!, progress))
  );
  return `#${mixed.map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function alphaOf(mobject: Mobject, drawProgress: number): number {
  return (mobject.opacity ?? 1) * drawProgress;
}

function replacementAlpha(from: Mobject, to: Mobject, progress: number): number {
  return lerpNumber(from.opacity ?? 1, to.opacity ?? 1, progress);
}

function pointDistance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function pointsAreClosed(points: Point[]): boolean {
  if (points.length < 2) return false;
  return pointDistance(points[0]!, points[points.length - 1]!) <= 0.5;
}

function pathLength(points: Point[], closed: boolean): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += pointDistance(points[index - 1]!, points[index]!);
  }
  if (closed) total += pointDistance(points[points.length - 1]!, points[0]!);
  return total;
}

function trimPathPoints(points: Point[], closed: boolean, progress: number): Point[] {
  if (points.length <= 1 || progress >= 0.999) return [...points];
  const total = pathLength(points, closed);
  if (total <= 0) return [...points];
  const target = Math.max(0.001, Math.min(1, progress)) * total;
  const trimmed: Point[] = [points[0]!];
  let acc = 0;
  const edges: Array<[Point, Point]> = [];
  for (let index = 1; index < points.length; index += 1) {
    edges.push([points[index - 1]!, points[index]!]);
  }
  if (closed) {
    edges.push([points[points.length - 1]!, points[0]!]);
  }
  for (const [start, end] of edges) {
    const length = pointDistance(start, end);
    if (acc + length >= target) {
      const local = length > 0 ? (target - acc) / length : 0;
      trimmed.push({
        x: lerpNumber(start.x, end.x, local),
        y: lerpNumber(start.y, end.y, local)
      });
      return trimmed;
    }
    trimmed.push(end);
    acc += length;
  }
  return trimmed;
}

function boundsCenter(points: Point[]): Point {
  if (points.length === 0) {
    return { x: STAGE_WIDTH / 2, y: STAGE_HEIGHT / 2 };
  }
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2
  };
}

function transformedPoints(points: Point[], mobject: Mobject): Point[] {
  if (points.length === 0) return [];
  const center = boundsCenter(points);
  const rotation = mobject.rotation ?? 0;
  const scaleX = (mobject.scaleFactor ?? 1) * (mobject.stretchX ?? 1);
  const scaleY = (mobject.scaleFactor ?? 1) * (mobject.stretchY ?? 1);
  const cosA = Math.cos(rotation);
  const sinA = Math.sin(rotation);
  return points.map((point) => {
    const dx = (point.x - center.x) * scaleX;
    const dy = (point.y - center.y) * scaleY;
    return {
      x: center.x + (dx * cosA) - (dy * sinA),
      y: center.y + (dx * sinA) + (dy * cosA)
    };
  });
}

function effectiveStrokeWidth(mobject: Mobject): number {
  const scaleX = Math.abs((mobject.scaleFactor ?? 1) * (mobject.stretchX ?? 1));
  const scaleY = Math.abs((mobject.scaleFactor ?? 1) * (mobject.stretchY ?? 1));
  const scale = Math.max(0.001, (scaleX + scaleY) / 2);
  return (mobject.strokeWidth ?? 1) * scale;
}

function rectPoints(mobject: Mobject): Point[] {
  const width = mobject.width ?? mobject.size ?? 0;
  const height = mobject.height ?? mobject.size ?? 0;
  const centerX = mobject.x ?? STAGE_WIDTH / 2;
  const centerY = mobject.y ?? STAGE_HEIGHT / 2;
  const halfW = width / 2;
  const halfH = height / 2;
  return [
    { x: centerX - halfW, y: centerY - halfH },
    { x: centerX + halfW, y: centerY - halfH },
    { x: centerX + halfW, y: centerY + halfH },
    { x: centerX - halfW, y: centerY + halfH }
  ];
}

function ellipsePoints(mobject: Mobject, count: number): Point[] {
  const centerX = mobject.x ?? STAGE_WIDTH / 2;
  const centerY = mobject.y ?? STAGE_HEIGHT / 2;
  const width = mobject.width ?? (mobject.radius ?? 0) * 2;
  const height = mobject.height ?? (mobject.radius ?? 0) * 2;
  const rx = width / 2;
  const ry = height / 2;
  const points: Point[] = [];
  for (let index = 0; index < count; index += 1) {
    const theta = (-Math.PI / 2) + (index / count) * Math.PI * 2;
    points.push({
      x: centerX + rx * Math.cos(theta),
      y: centerY + ry * Math.sin(theta)
    });
  }
  return points;
}

function dotPoints(mobject: Mobject): Point[] {
  const radius = mobject.radius ?? 8;
  return ellipsePoints(
    {
      ...mobject,
      width: radius * 2,
      height: radius * 2
    },
    32
  );
}

function basePointsFor(mobject: Mobject): Point[] {
  if (mobject.kind === 'square') return rectPoints(mobject);
  if (mobject.kind === 'circle') return ellipsePoints(mobject, 72);
  if (mobject.kind === 'dot') return dotPoints(mobject);
  if (mobject.kind === 'path') return [...(mobject.points ?? [])];
  return [];
}

function replacementPoints(
  from: Mobject,
  to: Mobject
): {
  fromPts: Point[];
  toPts: Point[];
  closed: boolean;
} {
  const fromPts = transformedPoints(basePointsFor(from), from);
  const toPts = transformedPoints(basePointsFor(to), to);
  const closed = (from.closed ?? true) || (to.closed ?? true);
  if (
    from.kind === 'path' &&
    to.kind === 'path' &&
    fromPts.length > 0 &&
    fromPts.length === toPts.length
  ) {
    return { fromPts, toPts, closed };
  }
  const count = Math.max(fromPts.length, toPts.length);
  if (count <= 0) return { fromPts: [], toPts: [], closed };
  return {
    fromPts: resamplePathPoints(fromPts, count, from.closed ?? true),
    toPts: resamplePathPoints(toPts, count, to.closed ?? true),
    closed
  };
}

function resamplePathPoints(points: Point[], count: number, closed: boolean): Point[] {
  if (points.length === 0 || count <= 0) return [];
  if (points.length === 1) return Array.from({ length: count }, () => points[0]!);
  const total = pathLength(points, closed);
  if (total <= 0) return Array.from({ length: count }, () => points[0]!);

  const segments: Array<{ start: Point; end: Point; length: number }> = [];
  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1]!;
    const end = points[index]!;
    segments.push({ start, end, length: pointDistance(start, end) });
  }
  if (closed) {
    const start = points[points.length - 1]!;
    const end = points[0]!;
    segments.push({ start, end, length: pointDistance(start, end) });
  }

  const resampled: Point[] = [];
  for (let index = 0; index < count; index += 1) {
    const target = (index / count) * total;
    let acc = 0;
    let chosen = segments[0]!;
    for (const segment of segments) {
      if (acc + segment.length >= target) {
        chosen = segment;
        break;
      }
      acc += segment.length;
    }
    const local = chosen.length > 0 ? (target - acc) / chosen.length : 0;
    resampled.push({
      x: lerpNumber(chosen.start.x, chosen.end.x, local),
      y: lerpNumber(chosen.start.y, chosen.end.y, local)
    });
  }
  return resampled;
}

function lerpPoints(a: Point[], b: Point[], t: number): Point[] {
  const count = Math.min(a.length, b.length);
  const points: Point[] = [];
  for (let index = 0; index < count; index += 1) {
    points.push({
      x: lerpNumber(a[index]!.x, b[index]!.x, t),
      y: lerpNumber(a[index]!.y, b[index]!.y, t)
    });
  }
  return points;
}

export function isWebGpuGeometryMobject(mobject: Mobject): boolean {
  return (
    mobject.kind === 'square' ||
    mobject.kind === 'circle' ||
    mobject.kind === 'dot' ||
    mobject.kind === 'path'
  );
}

export function isWebGpuTexturedMobject(mobject: Mobject): boolean {
  return (
    mobject.kind === 'text' ||
    mobject.kind === 'kmathtex' ||
    mobject.kind === 'mathtex' ||
    mobject.kind === 'svg'
  );
}

function normalizedTextColor(color?: string): string {
  return color && color !== 'none' ? color : '#e2e8f0';
}

function textFontFamily(mobject: Mobject): string {
  return mobject.fontFamily ?? 'ui-sans-serif, system-ui, sans-serif';
}

function mathFontFamily(): string {
  return 'KaTeX_Main, "Times New Roman", serif';
}

function canvasTextWidth(
  ctx: CanvasRenderingContext2D,
  text: string
): number {
  return ctx.measureText(text).width;
}

function buildTextTextureRequest(
  mobject: Mobject,
  drawProgress: number
): TexturedLayer | null {
  const fontSize = mobject.fontSize ?? 36;
  const lines = mobject.textLines ?? (mobject.text ? mobject.text.split('\n') : []);
  const segments = mobject.textSegments ?? [];
  if (lines.length === 0 && segments.length === 0 && !mobject.text) return null;
  const scratchCanvas = document.createElement('canvas');
  const scratch = scratchCanvas.getContext('2d');
  if (!scratch) return null;
  const fontFamily = textFontFamily(mobject);
  scratch.font = `${fontSize}px ${fontFamily}`;
  const lineHeight = fontSize * 1.2;
  const paddingX = Math.max(12, fontSize * 0.35);
  const paddingY = Math.max(10, fontSize * 0.28);
  const textAlign = mobject.textAlign ?? 'center';

  let contentWidth = 0;
  if (segments.length > 0 && lines.length <= 1) {
    contentWidth = segments.reduce(
      (sum, segment) => sum + canvasTextWidth(scratch, segment.text),
      0
    );
  } else {
    contentWidth = Math.max(
      1,
      ...lines.map((line) => canvasTextWidth(scratch, line))
    );
  }
  const worldWidth = Math.max(1, contentWidth + (paddingX * 2));
  const worldHeight = Math.max(
    1,
    (Math.max(1, lines.length) * lineHeight) + (paddingY * 2)
  );
  const anchorOffsetX = textAlign === 'left'
    ? (worldWidth / 2) - paddingX
    : textAlign === 'right'
      ? -((worldWidth / 2) - paddingX)
      : 0;
  const x = (mobject.x ?? STAGE_WIDTH / 2) + anchorOffsetX;
  const y = mobject.y ?? STAGE_HEIGHT / 2;
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  const widthPx = Math.max(2, Math.ceil(worldWidth * dpr));
  const heightPx = Math.max(2, Math.ceil(worldHeight * dpr));

  return {
    key: mobject.id,
    order: 0,
    zIndex: mobject.zIndex ?? 0,
    x,
    y,
    width: worldWidth * (mobject.scaleFactor ?? 1) * (mobject.stretchX ?? 1),
    height: worldHeight * (mobject.scaleFactor ?? 1) * (mobject.stretchY ?? 1),
    opacity: alphaOf(mobject, drawProgress),
    rotation: -(mobject.rotation ?? 0),
    textureRequest: {
      cacheKey: JSON.stringify({
        kind: 'text',
        text: mobject.text,
        lines,
        segments,
        fill: mobject.fill,
        fontSize,
        fontFamily,
        textAlign,
        widthPx,
        heightPx
      }),
      widthPx,
      heightPx,
      draw(ctx) {
        ctx.clearRect(0, 0, widthPx, heightPx);
        ctx.scale(dpr, dpr);
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = textAlign;
        const anchorX = textAlign === 'left'
          ? paddingX
          : textAlign === 'right'
            ? worldWidth - paddingX
            : worldWidth / 2;
        if (segments.length > 0 && lines.length <= 1) {
          let cursorX = textAlign === 'left'
            ? paddingX
            : textAlign === 'right'
              ? worldWidth - paddingX - contentWidth
              : (worldWidth - contentWidth) / 2;
          for (const segment of segments) {
            ctx.fillStyle = normalizedTextColor(segment.fill ?? mobject.fill);
            ctx.fillText(
              segment.text,
              cursorX,
              worldHeight / 2
            );
            cursorX += canvasTextWidth(ctx, segment.text);
          }
          return;
        }
        lines.forEach((line, index) => {
          ctx.fillStyle = normalizedTextColor(mobject.fill);
          ctx.fillText(
            line,
            anchorX,
            paddingY + (lineHeight / 2) + (index * lineHeight)
          );
        });
      }
    }
  };
}

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function drawImageUrlToContext(
  url: string,
  widthPx: number,
  heightPx: number,
  ctx: CanvasRenderingContext2D
): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      ctx.clearRect(0, 0, widthPx, heightPx);
      ctx.drawImage(image, 0, 0, widthPx, heightPx);
      resolve();
    };
    image.onerror = () => reject(new Error(`Image load failed: ${url}`));
    image.src = url;
  });
}

function buildMathTextureRequest(
  mobject: Mobject,
  drawProgress: number
): TexturedLayer | null {
  const x = mobject.x ?? STAGE_WIDTH / 2;
  const y = mobject.y ?? STAGE_HEIGHT / 2;
  const fontSize = mobject.fontSize ?? 44;
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  if (mobject.kind === 'mathtex' && mobject.texSvg) {
    const scale = fontSize / 44;
    const worldWidth = (mobject.texWidth ?? 240) * scale;
    const worldHeight = (mobject.texHeight ?? 80) * scale;
    const widthPx = Math.max(2, Math.ceil(worldWidth * dpr));
    const heightPx = Math.max(2, Math.ceil(worldHeight * dpr));
    return {
      key: mobject.id,
      order: 0,
      zIndex: mobject.zIndex ?? 0,
      x,
      y,
      width: worldWidth * (mobject.scaleFactor ?? 1) * (mobject.stretchX ?? 1),
      height: worldHeight * (mobject.scaleFactor ?? 1) * (mobject.stretchY ?? 1),
      opacity: alphaOf(mobject, drawProgress),
      rotation: -(mobject.rotation ?? 0),
      textureRequest: {
        cacheKey: JSON.stringify({
          kind: 'mathtex-svg',
          tex: mobject.tex,
          svg: mobject.texSvg,
          widthPx,
          heightPx
        }),
        widthPx,
        heightPx,
        draw(ctx) {
          return drawImageUrlToContext(
            svgDataUrl(mobject.texSvg!),
            widthPx,
            heightPx,
            ctx
          );
        }
      }
    };
  }

  const text = mobject.text ?? mobject.tex ?? '';
  const scratchCanvas = document.createElement('canvas');
  const scratch = scratchCanvas.getContext('2d');
  if (!scratch) return null;
  const fontFamily = mathFontFamily();
  scratch.font = `${fontSize}px ${fontFamily}`;
  const contentWidth = Math.max(1, canvasTextWidth(scratch, text));
  const worldWidth = Math.max(120, Math.min(760, contentWidth + (fontSize * 0.5)));
  const worldHeight = fontSize * 1.9;
  const widthPx = Math.max(2, Math.ceil(worldWidth * dpr));
  const heightPx = Math.max(2, Math.ceil(worldHeight * dpr));
  return {
    key: mobject.id,
    order: 0,
    zIndex: mobject.zIndex ?? 0,
    x,
    y,
    width: worldWidth * (mobject.scaleFactor ?? 1) * (mobject.stretchX ?? 1),
    height: worldHeight * (mobject.scaleFactor ?? 1) * (mobject.stretchY ?? 1),
    opacity: alphaOf(mobject, drawProgress),
    rotation: -(mobject.rotation ?? 0),
    textureRequest: {
      cacheKey: JSON.stringify({
        kind: mobject.kind,
        text,
        fill: mobject.fill,
        fontSize,
        widthPx,
        heightPx
      }),
      widthPx,
      heightPx,
      draw(ctx) {
        ctx.clearRect(0, 0, widthPx, heightPx);
        ctx.scale(dpr, dpr);
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = normalizedTextColor(mobject.fill);
        ctx.fillText(text, worldWidth / 2, worldHeight / 2);
      }
    }
  };
}

function buildSvgTextureRequest(
  mobject: Mobject,
  drawProgress: number
): TexturedLayer | null {
  if (!mobject.svgHref) return null;
  const worldWidth = mobject.size ?? mobject.width ?? 120;
  const worldHeight = mobject.radius ?? mobject.height ?? worldWidth;
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  const widthPx = Math.max(2, Math.ceil(worldWidth * dpr));
  const heightPx = Math.max(2, Math.ceil(worldHeight * dpr));
  const href = new URL(mobject.svgHref, window.location.href).href;
  return {
    key: mobject.id,
    order: 0,
    zIndex: mobject.zIndex ?? 0,
    x: mobject.x ?? STAGE_WIDTH / 2,
    y: mobject.y ?? STAGE_HEIGHT / 2,
    width: worldWidth * (mobject.scaleFactor ?? 1) * (mobject.stretchX ?? 1),
    height: worldHeight * (mobject.scaleFactor ?? 1) * (mobject.stretchY ?? 1),
    opacity: alphaOf(mobject, drawProgress),
    rotation: -(mobject.rotation ?? 0),
    textureRequest: {
      cacheKey: JSON.stringify({
        kind: 'svg',
        href,
        widthPx,
        heightPx
      }),
      widthPx,
      heightPx,
      draw(ctx) {
        return drawImageUrlToContext(href, widthPx, heightPx, ctx);
      }
    }
  };
}

function texturedLayerForMobject(
  mobject: Mobject,
  drawProgress: number,
  order: number
): TexturedLayer | null {
  let layer: TexturedLayer | null = null;
  if (mobject.kind === 'text') {
    layer = buildTextTextureRequest(mobject, drawProgress);
  } else if (mobject.kind === 'kmathtex' || mobject.kind === 'mathtex') {
    layer = buildMathTextureRequest(mobject, drawProgress);
  } else if (mobject.kind === 'svg') {
    layer = buildSvgTextureRequest(mobject, drawProgress);
  }
  if (!layer) return null;
  return {
    ...layer,
    order
  };
}

function geometryLayerForMobject(
  mobject: Mobject,
  drawProgress: number,
  order: number
): GeometryLayer | null {
  if (!isWebGpuGeometryMobject(mobject)) return null;
  const basePoints = basePointsFor(mobject);
  if (basePoints.length === 0) return null;
  const transformed = transformedPoints(basePoints, mobject);
  const closed = mobject.kind === 'path'
    ? (mobject.closed ?? true)
    : true;
  const strokePoints = trimPathPoints(transformed, closed, drawProgress);
  return {
    key: mobject.id,
    order,
    zIndex: mobject.zIndex ?? 0,
    fillPoints: transformed,
    strokePoints,
    fill: mobject.fill ?? null,
    fillOpacity: mobject.fill && mobject.fill !== 'none'
      ? alphaOf(mobject, drawProgress * (mobject.fillOpacity ?? 1))
      : 0,
    stroke: mobject.stroke ?? null,
    strokeOpacity: alphaOf(mobject, drawProgress),
    strokeWidth: effectiveStrokeWidth(mobject),
    closed
  };
}

export function buildWebGpuSnapshot(
  input: WebGpuSceneInput
): WebGpuSnapshot {
  const geometryLayers: GeometryLayer[] = [];
  const texturedLayers: TexturedLayer[] = [];
  let order = 0;
  for (const replacement of input.replacements) {
    const from = replacement.source ??
      input.mobjects.find((mobject) => mobject.id === replacement.sourceId);
    const to = replacement.target ??
      input.mobjects.find((mobject) => mobject.id === replacement.targetId);
    if (!from || !to) continue;
    const points = replacementPoints(from, to);
    const interpolated = lerpPoints(
      points.fromPts,
      points.toPts,
      replacement.progress
    );
    const closed = points.closed && pointsAreClosed(interpolated);
    if (interpolated.length === 0) continue;
    geometryLayers.push({
      key: `${replacement.sourceId}:${replacement.targetId}:${order}`,
      order,
      zIndex: Math.max(from.zIndex ?? 0, to.zIndex ?? 0),
      fillPoints: interpolated,
      strokePoints: interpolated,
      fill: closed ? mixColor(from.fill, to.fill, replacement.progress) : null,
      fillOpacity: closed ? replacementAlpha(from, to, replacement.progress) : 0,
      stroke: mixColor(from.stroke, to.stroke, replacement.progress),
      strokeOpacity: replacementAlpha(from, to, replacement.progress),
      strokeWidth: lerpNumber(
        from.strokeWidth ?? 8,
        to.strokeWidth ?? from.strokeWidth ?? 8,
        replacement.progress
      ),
      closed
    });
    order += 1;
  }

  const ordered = [...input.mobjects].sort(
    (left, right) => (left.zIndex ?? 0) - (right.zIndex ?? 0)
  );
  for (const mobject of ordered) {
    const replacedActive = input.replacements.some((replacement) =>
      replacement.sourceId === mobject.id || replacement.targetId === mobject.id
    );
    const replacedSourceDone = input.completedReplacementSources.has(mobject.id);
    if (replacedActive || replacedSourceDone) continue;
    const replacementTargetDone = input.completedReplacementTargets.has(mobject.id);
    const progress = input.progressById.get(mobject.id) ?? 0;
    const drawProgress = replacementTargetDone
      ? 1
      : progress > 0
        ? progress
        : 0.001;
    const geometryLayer = geometryLayerForMobject(mobject, drawProgress, order);
    if (geometryLayer) geometryLayers.push(geometryLayer);
    const texturedLayer = texturedLayerForMobject(mobject, drawProgress, order);
    if (texturedLayer) texturedLayers.push(texturedLayer);
    order += 1;
  }

  return { geometryLayers, texturedLayers };
}

function toSceneY(y: number): number {
  return STAGE_HEIGHT - y;
}

function disposeMaterial(material: Material | Material[]): void {
  if (Array.isArray(material)) {
    for (const entry of material) entry.dispose();
    return;
  }
  material.dispose();
}

function disposeObject(object: Object3D): void {
  object.traverse((child) => {
    const geometry = (child as Object3D & {
      geometry?: { dispose: () => void };
    }).geometry;
    if (geometry) {
      geometry.dispose();
    }
    const material = (child as Object3D & {
      material?: Material | Material[];
    }).material;
    if (material) {
      disposeMaterial(material);
    }
  });
}

function linePositions(points: Point[], closed: boolean): number[] {
  const positions: number[] = [];
  const drawable = closed && points.length > 1
    ? [...points, points[0]!]
    : points;
  for (const point of drawable) {
    positions.push(point.x, toSceneY(point.y), 0);
  }
  return positions;
}

function shapeFor(points: Point[]): Shape | null {
  if (points.length < 3) return null;
  const shape = new Shape();
  shape.moveTo(points[0]!.x, toSceneY(points[0]!.y));
  for (let index = 1; index < points.length; index += 1) {
    shape.lineTo(points[index]!.x, toSceneY(points[index]!.y));
  }
  shape.closePath();
  return shape;
}

export class WebGPUManimRenderer {
  private canvas: HTMLCanvasElement;
  private renderer: ThreeRenderer | null = null;
  private backend: ThreeRendererBackend | null = null;
  private scene = new ThreeScene();
  private camera = new OrthographicCamera(
    0,
    STAGE_WIDTH,
    STAGE_HEIGHT,
    0,
    -1000,
    1000
  );
  private geometryRoot = new Group();
  private texturedRoot = new Group();
  private textureCache = new Map<string, TextureEntry>();
  private latestSnapshot: WebGpuSnapshot | null = null;
  private rerenderQueued = false;
  private viewportWidth = STAGE_WIDTH;
  private viewportHeight = STAGE_HEIGHT;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.camera.position.z = 10;
    this.scene.add(this.geometryRoot);
    this.scene.add(this.texturedRoot);
  }

  async init(background = '#020617'): Promise<ThreeRendererBackend> {
    // Phase 0 converges on a single Three.js renderer path. WebGL is the
    // stable backend right now; the WebGPU path can return once it paints
    // correctly across the preview and test environments.
    const preferWebGl = true;
    if (!preferWebGl) {
      try {
        const renderer = new WebGPURenderer({
          alpha: true,
          antialias: true,
          canvas: this.canvas
        });
        await renderer.init();
        this.renderer = renderer;
        this.backend = 'gpu';
      } catch {}
    }
    if (!this.renderer || !this.backend) {
      const renderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: this.canvas
      });
      renderer.outputColorSpace = SRGBColorSpace;
      this.renderer = renderer;
      this.backend = 'webgl';
    }
    this.scene.background = new Color(background);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    return this.backend;
  }

  setBackground(color: string): void {
    this.scene.background = new Color(color);
  }

  setSize(width: number, height: number, pixelRatio = 1): void {
    if (!this.renderer) return;
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height, false);
  }

  getBackend(): ThreeRendererBackend | null {
    return this.backend;
  }

  private queueRerender(): void {
    if (this.rerenderQueued) return;
    this.rerenderQueued = true;
    requestAnimationFrame(() => {
      this.rerenderQueued = false;
      if (this.latestSnapshot) {
        this.render(this.latestSnapshot);
      }
    });
  }

  private ensureTexture(request: TextureRequest): Texture | null {
    const cached = this.textureCache.get(request.cacheKey);
    if (cached?.state === 'ready' && cached.texture) {
      return cached.texture;
    }
    if (cached?.state === 'pending') {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = request.widthPx;
    canvas.height = request.heightPx;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.textureCache.set(request.cacheKey, { state: 'error' });
      return null;
    }
    const promise = Promise.resolve(request.draw(ctx))
      .then(() => {
        const texture = new CanvasTexture(canvas);
        texture.colorSpace = SRGBColorSpace;
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        texture.needsUpdate = true;
        this.textureCache.set(request.cacheKey, {
          state: 'ready',
          texture
        });
        this.queueRerender();
      })
      .catch(() => {
        this.textureCache.set(request.cacheKey, { state: 'error' });
      });
    this.textureCache.set(request.cacheKey, {
      state: 'pending',
      promise
    });
    return null;
  }

  render(snapshot: WebGpuSnapshot): void {
    if (!this.renderer || !this.backend) return;
    this.latestSnapshot = snapshot;
    for (const child of [...this.geometryRoot.children]) {
      this.geometryRoot.remove(child);
      disposeObject(child);
    }
    for (const child of [...this.texturedRoot.children]) {
      this.texturedRoot.remove(child);
      disposeObject(child);
    }
    const sortedGeometry = [...snapshot.geometryLayers].sort((left, right) =>
      left.zIndex === right.zIndex
        ? left.order - right.order
        : left.zIndex - right.zIndex
    );
    for (const [index, layer] of sortedGeometry.entries()) {
      const renderOrder = (index * 2) + 1;
      if (
        layer.fill &&
        layer.fill !== 'none' &&
        layer.fillOpacity > 0 &&
        layer.fillPoints.length >= 3 &&
        layer.closed
      ) {
        const shape = shapeFor(layer.fillPoints);
        if (shape) {
          const geometry = new ShapeGeometry(shape);
          const material = new MeshBasicMaterial({
            color: layer.fill,
            depthTest: false,
            depthWrite: false,
            opacity: layer.fillOpacity,
            side: DoubleSide,
            transparent: layer.fillOpacity < 1
          });
          const mesh = new Mesh(geometry, material);
          mesh.renderOrder = renderOrder;
          this.geometryRoot.add(mesh);
        }
      }
      if (
        layer.stroke &&
        layer.stroke !== 'none' &&
        layer.strokeOpacity > 0 &&
        layer.strokePoints.length >= 2
      ) {
        const geometry = new LineGeometry();
        geometry.setPositions(linePositions(layer.strokePoints, layer.closed));
        if (this.backend === 'gpu') {
          const material = new Line2NodeMaterial({
            color: layer.stroke,
            dashed: false,
            depthTest: false,
            depthWrite: false,
            opacity: layer.strokeOpacity,
            transparent: layer.strokeOpacity < 1
          });
          (material as Line2WithWidth).linewidth = Math.max(
            1,
            layer.strokeWidth
          );
          const line = new WebGpuLine2(geometry, material);
          line.renderOrder = renderOrder + 1;
          this.geometryRoot.add(line);
        } else {
          const material = new LineMaterial({
            color: layer.stroke,
            dashed: false,
            depthTest: false,
            depthWrite: false,
            opacity: layer.strokeOpacity,
            transparent: layer.strokeOpacity < 1,
            linewidth: Math.max(1, layer.strokeWidth),
            resolution: new Vector2(
              Math.max(1, this.viewportWidth),
              Math.max(1, this.viewportHeight)
            )
          });
          const line = new WebGlLine2(geometry, material);
          line.renderOrder = renderOrder + 1;
          this.geometryRoot.add(line);
        }
      }
    }

    const sortedTextures = [...snapshot.texturedLayers].sort((left, right) =>
      left.zIndex === right.zIndex
        ? left.order - right.order
        : left.zIndex - right.zIndex
    );
    for (const [index, layer] of sortedTextures.entries()) {
      const texture = this.ensureTexture(layer.textureRequest);
      if (!texture) continue;
      const material = new SpriteMaterial({
        map: texture,
        color: '#ffffff',
        depthTest: false,
        depthWrite: false,
        opacity: layer.opacity,
        rotation: layer.rotation,
        transparent: layer.opacity < 1 || true
      });
      const sprite = new Sprite(material);
      sprite.position.set(layer.x, toSceneY(layer.y), 0);
      sprite.scale.set(layer.width, layer.height, 1);
      sprite.renderOrder = 10_000 + index;
      this.texturedRoot.add(sprite);
    }
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    for (const child of [...this.geometryRoot.children]) {
      this.geometryRoot.remove(child);
      disposeObject(child);
    }
    for (const child of [...this.texturedRoot.children]) {
      this.texturedRoot.remove(child);
      disposeObject(child);
    }
    for (const entry of this.textureCache.values()) {
      entry.texture?.dispose();
    }
    this.textureCache.clear();
    this.renderer?.dispose();
    this.renderer = null;
    this.backend = null;
  }
}
