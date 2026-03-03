<script lang="ts">
  import type { Mobject, Point } from '$lib/feature-sweep/manim-api';

  type Props = {
    mobjects: Mobject[];
    progressById: Map<string, number>;
    replacements?: Array<{
      sourceId: string;
      targetId: string;
      progress: number;
    }>;
    completedReplacementSources?: Set<string>;
    completedReplacementTargets?: Set<string>;
  };

  const {
    mobjects,
    progressById,
    replacements = [],
    completedReplacementSources = new Set<string>(),
    completedReplacementTargets = new Set<string>()
  }: Props = $props();

  function strokeDash(progress: number, length: number): string {
    const drawn = Math.max(0.001, Math.min(1, progress)) * length;
    return `${drawn} ${length}`;
  }

  function strokeOffset(progress: number, length: number): number {
    return -Math.max(0, length * (1 - Math.max(0.001, Math.min(1, progress))));
  }

  function squarePoints(m: Mobject, count: number): Array<{ x: number; y: number }> {
    const cx = m.x ?? 0;
    const cy = m.y ?? 0;
    const size = m.size ?? 0;
    const h = size / 2;
    const perimeter = size * 4;
    if (perimeter <= 0 || count <= 0) return [];
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i += 1) {
      const d = (i / count) * perimeter;
      if (d < size) {
        points.push({ x: cx - h + d, y: cy - h });
      } else if (d < size * 2) {
        points.push({ x: cx + h, y: cy - h + (d - size) });
      } else if (d < size * 3) {
        points.push({ x: cx + h - (d - size * 2), y: cy + h });
      } else {
        points.push({ x: cx - h, y: cy + h - (d - size * 3) });
      }
    }
    return points;
  }

  function circlePoints(m: Mobject, count: number): Array<{ x: number; y: number }> {
    const cx = m.x ?? 0;
    const cy = m.y ?? 0;
    const r = m.radius ?? 0;
    if (r <= 0 || count <= 0) return [];
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i += 1) {
      const theta = (-Math.PI / 2) + (i / count) * Math.PI * 2;
      points.push({ x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) });
    }
    return points;
  }

  function pointsFor(m: Mobject, count: number): Array<{ x: number; y: number }> {
    if (m.kind === 'square') return squarePoints(m, count);
    if (m.kind === 'circle') return circlePoints(m, count);
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
</script>

<svg
  viewBox="0 0 800 460"
  role="img"
  aria-label="TS scene stage"
  class="w-full rounded-xl border border-slate-800 bg-slate-950"
>
  <rect x="0" y="0" width="800" height="460" fill="#020617" />
  {#each replacements as replacement (replacement.sourceId + ':' + replacement.targetId)}
    {@const from = mobjects.find((m) => m.id === replacement.sourceId)}
    {@const to = mobjects.find((m) => m.id === replacement.targetId)}
    {#if from && to}
      {@const fromPts = pointsFor(from, 72)}
      {@const toPts = pointsFor(to, 72)}
      {@const d = pathFrom(lerpPoints(fromPts, toPts, replacement.progress))}
      {#if d}
        <path
          d={d}
          fill="none"
          stroke={replacement.progress < 0.5 ? (from.stroke ?? '#e2e8f0') : (to.stroke ?? '#e2e8f0')}
          stroke-width={(from.strokeWidth ?? to.strokeWidth ?? 8)}
        />
      {/if}
    {/if}
  {/each}
  {#each mobjects as mobject (mobject.id)}
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
      <text
        id={mobject.id}
        x={mobject.x}
        y={mobject.y}
        fill={mobject.fill ?? '#e2e8f0'}
        fill-opacity={drawProgress}
        text-anchor="middle"
        font-size={mobject.fontSize ?? 32}
      >
        {mobject.text}
      </text>
    {:else if mobject.kind === 'square'}
      {@const size = mobject.size ?? 0}
      {@const length = size * 4}
      <rect
        id={mobject.id}
        x={(mobject.x ?? 0) - size / 2}
        y={(mobject.y ?? 0) - size / 2}
        width={size}
        height={size}
        fill="none"
        stroke={mobject.stroke}
        stroke-width={mobject.strokeWidth}
        stroke-dasharray={strokeDash(drawProgress, length)}
        stroke-dashoffset={strokeOffset(drawProgress, length)}
      />
    {:else if mobject.kind === 'circle'}
      {@const radius = mobject.radius ?? 0}
      {@const length = Math.PI * radius * 2}
      <circle
        id={mobject.id}
        cx={mobject.x}
        cy={mobject.y}
        r={radius}
        fill="none"
        stroke={mobject.stroke}
        stroke-width={mobject.strokeWidth}
        stroke-dasharray={strokeDash(drawProgress, length)}
        stroke-dashoffset={strokeOffset(drawProgress, length)}
      />
    {:else if mobject.kind === 'path'}
      {@const points = mobject.points ?? []}
      {@const closed = mobject.closed ?? true}
      {@const d = polylinePathFrom(points, closed)}
      {@const length = pathLength(points, closed)}
      <path
        id={mobject.id}
        d={d}
        fill="none"
        stroke={mobject.stroke}
        stroke-width={mobject.strokeWidth}
        stroke-dasharray={strokeDash(drawProgress, length)}
        stroke-dashoffset={strokeOffset(drawProgress, length)}
      />
    {/if}
    {/if}
  {/each}
</svg>
