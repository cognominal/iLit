<script lang="ts">
  import {
    STAGE_HEIGHT,
    STAGE_WIDTH,
    type Mobject
  } from '$lib/manim';
  import {
    type ThreeRendererBackend,
    WebGPUManimRenderer,
    buildWebGpuSnapshot,
    isWebGpuGeometryMobject,
    isWebGpuTexturedMobject
  } from '$lib/webgpu-manim-api';
  import { onDestroy } from 'svelte';

  type Props = {
    mobjects: Mobject[];
    progressById: Map<string, number>;
    bare?: boolean;
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
    bare = false,
    replacements = [],
    completedReplacementSources = new Set<string>(),
    completedReplacementTargets = new Set<string>()
  }: Props = $props();

  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let stageEl = $state<HTMLDivElement | null>(null);
  let webGpuRenderer = $state<WebGPUManimRenderer | null>(null);
  let ready = $state(false);
  let failed = $state(false);
  let rendererBackend = $state<ThreeRendererBackend | null>(null);

  const orderedOverlayMobjects = $derived(
    [...mobjects]
      .sort((left, right) => (left.zIndex ?? 0) - (right.zIndex ?? 0))
      .filter((mobject) => {
        if (
          isWebGpuGeometryMobject(mobject) ||
          isWebGpuTexturedMobject(mobject)
        ) {
          return false;
        }
        const replacedActive = replacements.some((replacement) =>
          replacement.sourceId === mobject.id ||
          replacement.targetId === mobject.id
        );
        const replacedSourceDone = completedReplacementSources.has(mobject.id);
        return !(replacedActive || replacedSourceDone);
      })
  );

  const renderSnapshot = $derived(
    buildWebGpuSnapshot({
      bare,
      mobjects,
      progressById,
      replacements,
      completedReplacementSources,
      completedReplacementTargets
    })
  );

  function posX(mobject: Mobject): number | undefined {
    return mobject.x;
  }

  function posY(mobject: Mobject): number | undefined {
    return mobject.y;
  }

  function centeredScaleTransform(mobject: Mobject): string | undefined {
    const x = posX(mobject) ?? 0;
    const y = posY(mobject) ?? 0;
    const transforms: string[] = [];
    const scale = mobject.scaleFactor ?? 1;
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

  function drawProgressFor(mobject: Mobject): number {
    if (completedReplacementTargets.has(mobject.id)) return 1;
    const progress = progressById.get(mobject.id) ?? 0;
    return progress > 0 ? progress : 0.001;
  }

  function resizeRenderer(): void {
    if (!webGpuRenderer || !stageEl) return;
    webGpuRenderer.setSize(
      stageEl.clientWidth || STAGE_WIDTH,
      stageEl.clientHeight || STAGE_HEIGHT,
      window.devicePixelRatio || 1
    );
  }

  $effect(() => {
    if (!canvasEl || webGpuRenderer || failed) return;
    let cancelled = false;
    const next = new WebGPUManimRenderer(canvasEl);
    void next.init(bare ? '#000000' : '#020617')
      .then((backend) => {
        if (cancelled) {
          next.dispose();
          return;
        }
        webGpuRenderer = next;
        rendererBackend = backend;
        ready = true;
        failed = false;
        resizeRenderer();
        next.render(renderSnapshot);
      })
      .catch(() => {
        if (cancelled) return;
        next.dispose();
        failed = true;
        ready = false;
        rendererBackend = null;
      });
  });

  $effect(() => {
    if (!stageEl || !webGpuRenderer) return;
    const observer = new ResizeObserver(() => {
      resizeRenderer();
      webGpuRenderer?.render(renderSnapshot);
    });
    observer.observe(stageEl);
    resizeRenderer();
    return () => observer.disconnect();
  });

  $effect(() => {
    if (!webGpuRenderer || !ready) return;
    webGpuRenderer.setBackground(bare ? '#000000' : '#020617');
    webGpuRenderer.render(renderSnapshot);
  });

  onDestroy(() => {
    webGpuRenderer?.dispose();
    webGpuRenderer = null;
    rendererBackend = null;
  });
</script>

<div
  bind:this={stageEl}
  data-testid="webgpu-scene-stage"
  data-renderer={ready ? rendererBackend : failed ? 'error' : 'initializing'}
  role={ready ? 'img' : undefined}
  aria-label={ready ? 'TS scene stage' : undefined}
  class={`relative w-full overflow-hidden ${bare
    ? 'bg-black'
    : 'rounded-xl border border-slate-800 bg-slate-950'}`}
  style={`aspect-ratio:${STAGE_WIDTH}/${STAGE_HEIGHT};`}
>
  <canvas
    bind:this={canvasEl}
    class={`absolute inset-0 h-full w-full ${ready ? '' : 'opacity-0'}`}
  ></canvas>
  {#if ready}
    <svg
      viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 h-full w-full"
    >
      {#each orderedOverlayMobjects as mobject, index (`${mobject.id}:${index}`)}
        {@const drawProgress = drawProgressFor(mobject)}
        {#if mobject.kind === 'text'}
          {@const lines =
            mobject.textLines ?? (mobject.text ? mobject.text.split('\n') : [])}
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
              {#each lines as line, lineIndex}
                <tspan
                  x={posX(mobject)}
                  y={(posY(mobject) ?? 0) +
                    (lineIndex - (lines.length - 1) / 2) * lineHeight}
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
      {/each}
    </svg>
  {:else if failed}
    <div
      class="absolute inset-0 flex items-center justify-center p-4 text-sm
      text-rose-200"
    >
      Three.js renderer initialization failed.
    </div>
  {/if}
</div>
