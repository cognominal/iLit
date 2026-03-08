<script lang="ts">
  import {
    STAGE_HEIGHT,
    STAGE_WIDTH,
    type Mobject,
    type Point
  } from '$lib/manim';

  type Props = {
    mobjects: Mobject[];
    progressById: Map<string, number>;
    positionsById?: Map<string, { x: number; y: number }>;
    scaleById?: Map<string, number>;
    replacements?: Array<{
      sourceId: string;
      targetId: string;
      progress: number;
      source?: Mobject;
      target?: Mobject;
    }>;
    completedReplacementSources?: Set<string>;
    completedReplacementTargets?: Set<string>;
  };

  const {
    mobjects,
    progressById,
    positionsById = new Map<string, { x: number; y: number }>(),
    scaleById = new Map<string, number>(),
    replacements = [],
    completedReplacementSources = new Set<string>(),
    completedReplacementTargets = new Set<string>()
  }: Props = $props();

  function posX(mobject: Mobject): number | undefined {
    return positionsById.get(mobject.id)?.x ?? mobject.x;
  }

  function posY(mobject: Mobject): number | undefined {
    return positionsById.get(mobject.id)?.y ?? mobject.y;
  }

  function scaleOf(mobject: Mobject): number {
    return scaleById.get(mobject.id) ?? 1;
  }

  function centeredScaleTransform(mobject: Mobject): string | undefined {
    const x = posX(mobject) ?? 0;
    const y = posY(mobject) ?? 0;
    const transforms: string[] = [];
    const scale = scaleOf(mobject);
    const stretchX = mobject.stretchX ?? 1;
    const stretchY = mobject.stretchY ?? 1;
    const rotation = mobject.rotation ?? 0;
    if (Math.abs(rotation) >= 0.001) {
      transforms.push(`rotate(${(rotation * 180) / Math.PI} ${x} ${y})`);
    }
    if (
      Math.abs(scale - 1) >= 0.001 ||
      Math.abs(stretchX - 1) >= 0.001 ||
      Math.abs(stretchY - 1) >= 0.001
    ) {
      transforms.push(
        `translate(${x} ${y}) scale(${scale * stretchX} ${scale * stretchY}) ` +
        `translate(${-x} ${-y})`
      );
    }
    return transforms.length > 0 ? transforms.join(' ') : undefined;
  }

  function alphaOf(mobject: Mobject, drawProgress: number): number {
    return (mobject.opacity ?? 1) * drawProgress;
  }

  function strokeDash(progress: number, length: number): string {
    const drawn = Math.max(0.001, Math.min(1, progress)) * length;
    return `${drawn} ${length}`;
  }

  function strokeOffset(progress: number, length: number): number {
    return -Math.max(0, length * (1 - Math.max(0.001, Math.min(1, progress))));
  }

  function strokeOffsetForward(progress: number, length: number): number {
    return Math.max(0, length * (1 - Math.max(0.001, Math.min(1, progress))));
  }

  function squarePoints(m: Mobject, count: number): Array<{ x: number; y: number }> {
    const cx = m.x ?? 0;
    const cy = m.y ?? 0;
    const width = m.width ?? m.size ?? 0;
    const height = m.height ?? m.size ?? 0;
    const halfW = width / 2;
    const halfH = height / 2;
    const perimeter = width * 2 + height * 2;
    if (perimeter <= 0 || count <= 0) return [];
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i += 1) {
      const d = (i / count) * perimeter;
      if (d < width) {
        points.push({ x: cx - halfW + d, y: cy - halfH });
      } else if (d < width + height) {
        points.push({ x: cx + halfW, y: cy - halfH + (d - width) });
      } else if (d < width * 2 + height) {
        points.push({
          x: cx + halfW - (d - (width + height)),
          y: cy + halfH
        });
      } else {
        points.push({
          x: cx - halfW,
          y: cy + halfH - (d - (width * 2 + height))
        });
      }
    }
    return points;
  }

  function circlePoints(m: Mobject, count: number): Array<{ x: number; y: number }> {
    const cx = m.x ?? 0;
    const cy = m.y ?? 0;
    const rx = (m.width ?? (m.radius ?? 0) * 2) / 2;
    const ry = (m.height ?? (m.radius ?? 0) * 2) / 2;
    if (rx <= 0 || ry <= 0 || count <= 0) return [];
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i += 1) {
      const theta = (-Math.PI / 2) + (i / count) * Math.PI * 2;
      points.push({ x: cx + rx * Math.cos(theta), y: cy + ry * Math.sin(theta) });
    }
    return points;
  }

  function pointsFor(m: Mobject, count: number): Array<{ x: number; y: number }> {
    if (m.kind === 'square') return squarePoints(m, count);
    if (m.kind === 'circle') return circlePoints(m, count);
    if (m.kind === 'dot') return circlePoints(m, count);
    if (m.kind === 'path') return resamplePathPoints(m.points ?? [], count, m.closed ?? true);
    return [];
  }

  function segmentLength(a: Point, b: Point): number {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }

  function pathLength(points: Point[], closed: boolean): number {
    if (points.length < 2) return 0;
    let len = 0;
    for (let i = 1; i < points.length; i += 1) {
      len += segmentLength(points[i - 1], points[i]);
    }
    if (closed) len += segmentLength(points[points.length - 1], points[0]);
    return len;
  }

  function resamplePathPoints(
    points: Point[],
    count: number,
    closed: boolean
  ): Point[] {
    if (points.length === 0 || count <= 0) return [];
    if (points.length === 1) return Array.from({ length: count }, () => points[0]);
    const total = pathLength(points, closed);
    if (total <= 0) return Array.from({ length: count }, () => points[0]);

    const segments: Array<{ a: Point; b: Point; length: number }> = [];
    for (let i = 1; i < points.length; i += 1) {
      const a = points[i - 1];
      const b = points[i];
      segments.push({ a, b, length: segmentLength(a, b) });
    }
    if (closed) {
      const a = points[points.length - 1];
      const b = points[0];
      segments.push({ a, b, length: segmentLength(a, b) });
    }

    const result: Point[] = [];
    for (let i = 0; i < count; i += 1) {
      const target = (i / count) * total;
      let acc = 0;
      let chosen = segments[0];
      for (const seg of segments) {
        if (acc + seg.length >= target) {
          chosen = seg;
          break;
        }
        acc += seg.length;
      }
      const local = chosen.length > 0 ? (target - acc) / chosen.length : 0;
      result.push({
        x: chosen.a.x + (chosen.b.x - chosen.a.x) * local,
        y: chosen.a.y + (chosen.b.y - chosen.a.y) * local
      });
    }
    return result;
  }

  function pathFrom(points: Array<{ x: number; y: number }>): string {
    if (points.length === 0) return '';
    let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    for (let i = 1; i < points.length; i += 1) {
      d += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
    }
    return `${d} Z`;
  }

  function polylinePathFrom(points: Point[], closed: boolean): string {
    if (points.length === 0) return '';
    let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    for (let i = 1; i < points.length; i += 1) {
      d += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
    }
    if (closed) d += ' Z';
    return d;
  }

  function lerpPoints(
    a: Array<{ x: number; y: number }>,
    b: Array<{ x: number; y: number }>,
    t: number
  ): Array<{ x: number; y: number }> {
    const n = Math.min(a.length, b.length);
    const out: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < n; i += 1) {
      out.push({
        x: a[i].x + (b[i].x - a[i].x) * t,
        y: a[i].y + (b[i].y - a[i].y) * t
      });
    }
    return out;
  }

  function lerpNumber(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  function replacementColor(
    from: string | undefined,
    to: string | undefined,
    progress: number
  ): string {
    return progress < 0.5
      ? (from ?? to ?? '#e2e8f0')
      : (to ?? from ?? '#e2e8f0');
  }

  const orderedMobjects = $derived(
    [...mobjects].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
  );
</script>

<svg
  viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
  role="img"
  aria-label="TS scene stage"
  class="w-full rounded-xl border border-slate-800 bg-slate-950"
>
  <rect x="0" y="0" width={STAGE_WIDTH} height={STAGE_HEIGHT} fill="#020617" />
  {#each replacements as replacement (replacement.sourceId + ':' + replacement.targetId)}
    {@const from =
      replacement.source ?? mobjects.find((m) => m.id === replacement.sourceId)}
    {@const to =
      replacement.target ?? mobjects.find((m) => m.id === replacement.targetId)}
    {#if from && to}
      {@const fromPts = pointsFor(from, 72)}
      {@const toPts = pointsFor(to, 72)}
      {@const closed = (from.closed ?? true) || (to.closed ?? true)}
      {@const d = polylinePathFrom(
        lerpPoints(fromPts, toPts, replacement.progress),
        closed
      )}
      {#if d}
        <path
          d={d}
          fill={closed ? replacementColor(from.fill, to.fill, replacement.progress) : 'none'}
          fill-opacity={closed ? 1 : undefined}
          stroke={replacementColor(from.stroke, to.stroke, replacement.progress)}
          stroke-width={lerpNumber(
            from.strokeWidth ?? 8,
            to.strokeWidth ?? from.strokeWidth ?? 8,
            replacement.progress
          )}
        />
      {/if}
    {/if}
  {/each}
  {#each orderedMobjects as mobject (mobject.id)}
    {@const replacedActive = replacements.some((r) =>
      r.sourceId === mobject.id || r.targetId === mobject.id
    )}
    {@const replacedSourceDone = completedReplacementSources.has(mobject.id)}
    {@const replacementTargetDone = completedReplacementTargets.has(mobject.id)}
    {#if !(replacedActive || replacedSourceDone)}
    {@const progress = progressById.get(mobject.id) ?? 0}
    {@const drawProgress =
      replacementTargetDone
        ? 1
        : progress > 0
          ? progress
          : 0.001}
    {#if mobject.kind === 'text'}
      {@const lines = mobject.textLines ?? (mobject.text ? mobject.text.split('\n') : [])}
      {@const lineHeight = (mobject.fontSize ?? 32) * 1.2}
      {@const segments = mobject.textSegments ?? []}
      <text
        id={mobject.id}
        x={posX(mobject)}
        y={posY(mobject)}
        fill={mobject.fill ?? '#e2e8f0'}
        fill-opacity={alphaOf(mobject, drawProgress)}
        text-anchor={
          mobject.textAlign === 'left'
            ? 'start'
            : mobject.textAlign === 'right'
              ? 'end'
              : 'middle'
        }
        font-size={mobject.fontSize ?? 32}
        font-family={mobject.fontFamily}
        transform={centeredScaleTransform(mobject)}
      >
        {#if lines.length <= 1}
          {#if segments.length > 0}
            {#each segments as segment}
              <tspan fill={segment.fill ?? (mobject.fill ?? '#e2e8f0')}>
                {segment.text}
              </tspan>
            {/each}
          {:else}
            {mobject.text}
          {/if}
        {:else}
          {#each lines as line, index}
            <tspan
              x={posX(mobject)}
              y={(posY(mobject) ?? 0) + (index - (lines.length - 1) / 2) * lineHeight}
            >
              {line}
            </tspan>
          {/each}
        {/if}
      </text>
    {:else if mobject.kind === 'kmathtex'}
      {@const fs = mobject.fontSize ?? 44}
      {@const texLen = (mobject.tex ?? mobject.text ?? '').length}
      {@const boxW = Math.max(120, Math.min(760, texLen * fs * 0.62))}
      {@const boxH = fs * 1.9}
      <foreignObject
        id={mobject.id}
        x={(posX(mobject) ?? 0) - boxW / 2}
        y={(posY(mobject) ?? 0) - boxH / 2}
        width={boxW}
        height={boxH}
        opacity={alphaOf(mobject, drawProgress)}
        transform={centeredScaleTransform(mobject)}
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={`width:${boxW}px;height:${boxH}px;display:flex;` +
            'align-items:center;justify-content:center;' +
            `font-size:${fs}px;color:${mobject.fill ?? '#e2e8f0'};`}
        >
          {@html mobject.texHtml ?? mobject.text ?? ''}
        </div>
      </foreignObject>
    {:else if mobject.kind === 'mathtex'}
      {@const w = mobject.texWidth ?? 240}
      {@const h = mobject.texHeight ?? 80}
      {@const scale = (mobject.fontSize ?? 44) / 44}
      {@const drawW = w * scale}
      {@const drawH = h * scale}
      {@const useSvg = Boolean(mobject.texSvg) &&
        !mobject.texSvg?.includes('<text ')}
      {#if useSvg && mobject.texSvg}
        <image
          id={mobject.id}
          x={(posX(mobject) ?? 0) - drawW / 2}
          y={(posY(mobject) ?? 0) - drawH / 2}
          width={drawW}
          height={drawH}
          href={`data:image/svg+xml;utf8,${encodeURIComponent(mobject.texSvg)}`}
          opacity={alphaOf(mobject, drawProgress)}
          transform={centeredScaleTransform(mobject)}
        />
      {:else}
        {@const fs = mobject.fontSize ?? 44}
        {@const texLen = (mobject.tex ?? mobject.text ?? '').length}
        {@const boxW = Math.max(120, Math.min(760, texLen * fs * 0.62))}
        {@const boxH = fs * 1.9}
        <foreignObject
          id={mobject.id}
          x={(posX(mobject) ?? 0) - boxW / 2}
          y={(posY(mobject) ?? 0) - boxH / 2}
          width={boxW}
          height={boxH}
          opacity={alphaOf(mobject, drawProgress)}
          transform={centeredScaleTransform(mobject)}
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={`width:${boxW}px;height:${boxH}px;display:flex;` +
              'align-items:center;justify-content:center;' +
              `font-size:${fs}px;color:${mobject.fill ?? '#e2e8f0'};`}
          >
            {@html mobject.texHtml ?? mobject.text ?? ''}
          </div>
        </foreignObject>
      {/if}
    {:else if mobject.kind === 'square'}
      {@const width = mobject.width ?? mobject.size ?? 0}
      {@const height = mobject.height ?? mobject.size ?? 0}
      {@const length = width * 2 + height * 2}
      <rect
        id={mobject.id}
        x={(posX(mobject) ?? 0) - width / 2}
        y={(posY(mobject) ?? 0) - height / 2}
        width={width}
        height={height}
        rx={mobject.cornerRadius ?? 0}
        ry={mobject.cornerRadius ?? 0}
        fill="none"
        stroke={mobject.stroke}
        stroke-opacity={alphaOf(mobject, drawProgress)}
        stroke-width={mobject.strokeWidth}
        stroke-dasharray={strokeDash(drawProgress, length)}
        stroke-dashoffset={strokeOffset(drawProgress, length)}
        transform={centeredScaleTransform(mobject)}
      />
    {:else if mobject.kind === 'circle'}
      {@const width = mobject.width ?? (mobject.radius ?? 0) * 2}
      {@const height = mobject.height ?? (mobject.radius ?? 0) * 2}
      {@const rx = width / 2}
      {@const ry = height / 2}
      {@const length = Math.PI * ((3 * (rx + ry)) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)))}
      <ellipse
        id={mobject.id}
        cx={posX(mobject)}
        cy={posY(mobject)}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={mobject.stroke}
        stroke-opacity={alphaOf(mobject, drawProgress)}
        stroke-width={mobject.strokeWidth}
        stroke-dasharray={strokeDash(drawProgress, length)}
        stroke-dashoffset={strokeOffset(drawProgress, length)}
        transform={centeredScaleTransform(mobject)}
      />
    {:else if mobject.kind === 'path'}
      {@const points = mobject.points ?? []}
      {@const closed = mobject.closed ?? true}
      {@const d = polylinePathFrom(points, closed)}
      {@const length = pathLength(points, closed)}
      <path
        id={mobject.id}
        d={d}
        fill={closed ? (mobject.fill ?? 'none') : 'none'}
        fill-opacity={closed ? alphaOf(mobject, drawProgress) : undefined}
        stroke={mobject.stroke}
        stroke-opacity={alphaOf(mobject, drawProgress)}
        stroke-width={mobject.strokeWidth}
        stroke-dasharray={strokeDash(drawProgress, length)}
        stroke-dashoffset={strokeOffsetForward(drawProgress, length)}
        transform={centeredScaleTransform(mobject)}
      />
    {:else if mobject.kind === 'dot'}
      <circle
        id={mobject.id}
        cx={posX(mobject)}
        cy={posY(mobject)}
        r={mobject.radius ?? 8}
        fill={mobject.fill ?? mobject.stroke ?? '#e2e8f0'}
        stroke={mobject.stroke}
        stroke-width={mobject.strokeWidth}
        fill-opacity={alphaOf(mobject, drawProgress)}
        stroke-opacity={alphaOf(mobject, drawProgress)}
        transform={centeredScaleTransform(mobject)}
      />
    {:else if mobject.kind === 'svg' && mobject.svgHref}
      {@const width = mobject.size ?? 120}
      {@const height = mobject.radius ?? width}
      <image
        id={mobject.id}
        x={(posX(mobject) ?? 0) - width / 2}
        y={(posY(mobject) ?? 0) - height / 2}
        width={width}
        height={height}
        href={mobject.svgHref}
        opacity={alphaOf(mobject, drawProgress)}
        transform={centeredScaleTransform(mobject)}
      />
    {/if}
    {/if}
  {/each}
</svg>
