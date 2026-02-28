<script lang="ts">
  import type { Scene } from '../../manim';

  type Props = {
    scene: Scene;
    currentIndex: number;
    testId?: string;
  };

  const { scene, currentIndex, testId = 'scene-timeline' }: Props = $props();

  const width = 360;
  const rowHeight = 26;
  const headerHeight = 30;
  const height = $derived(headerHeight + scene.timeline.length * rowHeight + 8);
</script>

<svg
  class="scene-svg"
  viewBox={`0 0 ${width} ${height}`}
  role="img"
  aria-label="Scene timeline"
  data-testid={testId}
>
  <rect x="0" y="0" width={width} height={height} class="scene-bg" />
  <text x="12" y="21" class="scene-title">Scene timeline</text>

  {#each scene.timeline as step, i}
    {@const y = headerHeight + i * rowHeight}
    <rect x="8" y={y} width={width - 16} height={rowHeight - 4} class:scene-active={i === currentIndex} class="scene-row" />
    <text x="16" y={y + 16} class="scene-row-text">
      {i}. {step.meta?.label ?? 'Step'}
    </text>
  {/each}
</svg>
