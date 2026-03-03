<script lang="ts">
  import type { Mobject } from '$lib/feature-sweep/manim-api';

  type Props = {
    mobjects: Mobject[];
    progressById: Map<string, number>;
  };

  const { mobjects, progressById }: Props = $props();

  function strokeDash(progress: number, length: number): string {
    const remaining = Math.max(0, length * (1 - progress));
    return `${length} ${length}`;
  }

  function strokeOffset(progress: number, length: number): number {
    return Math.max(0, length * (1 - progress));
  }
</script>

<svg
  viewBox="0 0 800 460"
  role="img"
  aria-label="TS scene stage"
  class="w-full rounded-xl border border-slate-800 bg-slate-950"
>
  <rect x="0" y="0" width="800" height="460" fill="#020617" />
  {#each mobjects as mobject (mobject.id)}
    {@const progress = progressById.get(mobject.id) ?? 0}
    {#if progress > 0}
      {#if mobject.kind === 'text'}
        <text
          id={mobject.id}
          x={mobject.x}
          y={mobject.y}
          fill={mobject.fill ?? '#e2e8f0'}
          fill-opacity={progress}
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
          stroke-dasharray={strokeDash(progress, length)}
          stroke-dashoffset={strokeOffset(progress, length)}
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
          stroke-dasharray={strokeDash(progress, length)}
          stroke-dashoffset={strokeOffset(progress, length)}
        />
      {/if}
    {/if}
  {/each}
</svg>
