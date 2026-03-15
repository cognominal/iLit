<script lang="ts">
  import {
    type ManimDragEvent,
    STAGE_HEIGHT,
    STAGE_WIDTH,
    type ManimPointerEvent,
    type Mobject,
    type Point
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
    sourceNavigationMode?: boolean;
    onMobjectNavigate?: (event: ManimPointerEvent) => void;
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
    sourceNavigationMode = false,
    onMobjectNavigate,
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
  let interactionVersion = $state(0);
  let hoveredMobjectId = $state<string | null>(null);
  let activeMobjectId = $state<string | null>(null);
  let draggedMobjectId = $state<string | null>(null);
  let activePointerId = $state<number | null>(null);
  let stageCursor = $state('default');
  let dragStartPoint = $state<Point | null>(null);
  let dragPreviousPoint = $state<Point | null>(null);
  const boundObjects = new Map<string, Object | null>();
  const boundMobjects = new Map<string, Mobject>();

  const orderedOverlayMobjects = $derived(
    (() => {
      interactionVersion;
      return [...mobjects]
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
        });
    })()
  );

  const renderSnapshot = $derived(
    (() => {
      interactionVersion;
      return buildWebGpuSnapshot({
        bare,
        mobjects,
        progressById,
        replacements,
        completedReplacementSources,
        completedReplacementTargets
      });
    })()
  );

  const mobjectsById = $derived(
    new Map(mobjects.map((mobject) => [mobject.id, mobject]))
  );

  function publishDebugSnapshot(): void {
    if (typeof window === 'undefined') return;
    const debugWindow = window as Window & {
      __tsSceneDebug?: {
        renderer: 'three';
        mobjects: Array<{
          id: string;
          kind: Mobject['kind'];
          sourceRef?: Mobject['sourceRef'];
          x?: number;
          y?: number;
          width?: number;
          height?: number;
          radius?: number;
          text?: string;
          svgHref?: string;
          points?: Point[];
        }>;
      };
    };
    if (!debugWindow.__tsSceneDebug) return;
    debugWindow.__tsSceneDebug = {
      renderer: 'three',
      mobjects: mobjects.map((mobject) => ({
        id: mobject.id,
        kind: mobject.kind,
        sourceRef: mobject.sourceRef ? { ...mobject.sourceRef } : undefined,
        x: mobject.x,
        y: mobject.y,
        width: mobject.width,
        height: mobject.height,
        radius: mobject.radius,
        text: mobject.text,
        svgHref: mobject.svgHref,
        points: mobject.points?.map((point) => ({ ...point }))
      }))
    };
  }

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

  function scenePointFromEvent(event: PointerEvent): Point | null {
    if (!stageEl) return null;
    const rect = stageEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: ((event.clientX - rect.left) / rect.width) * STAGE_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * STAGE_HEIGHT
    };
  }

  function stageDragMobjectId(): string | null {
    if (draggedMobjectId) return draggedMobjectId;
    const active = activeMobjectId ? (mobjectsById.get(activeMobjectId) ?? null) : null;
    return isDraggableMobject(active) ? active?.id ?? null : null;
  }

  function updateStageCursor(nextCursor?: string, pickable = false): void {
    stageCursor = nextCursor ?? (pickable ? 'pointer' : 'default');
  }

  function syncRenderObjectBindings(): void {
    if (!webGpuRenderer) return;
    const currentIds = new Set<string>();
    for (const mobject of mobjects) {
      if (!mobject.bindRenderObject) continue;
      currentIds.add(mobject.id);
      const object = webGpuRenderer.getPrimaryObjectForMobject(mobject.id);
      const previousObject = boundObjects.get(mobject.id) ?? null;
      const previousMobject = boundMobjects.get(mobject.id);
      if (previousObject !== object || previousMobject !== mobject) {
        mobject.bindRenderObject(object);
        boundObjects.set(mobject.id, object);
        boundMobjects.set(mobject.id, mobject);
      }
    }
    for (const id of [...boundObjects.keys()]) {
      if (currentIds.has(id)) continue;
      boundMobjects.get(id)?.bindRenderObject?.(null);
      boundObjects.delete(id);
      boundMobjects.delete(id);
    }
  }

  function rerenderAfterInteraction(): void {
    interactionVersion += 1;
    if (!webGpuRenderer || !ready) return;
    webGpuRenderer.render(buildWebGpuSnapshot({
      bare,
      mobjects,
      progressById,
      replacements,
      completedReplacementSources,
      completedReplacementTargets
    }));
    syncRenderObjectBindings();
    publishDebugSnapshot();
  }

  function pointerEventFor(
    mobject: Mobject,
    nativeEvent: PointerEvent,
    object?: Object | null
  ): ManimPointerEvent | null {
    const scenePoint = scenePointFromEvent(nativeEvent);
    if (!scenePoint) return null;
    return {
      mobject,
      mobjectId: mobject.id,
      sourceRef: mobject.sourceRef,
      scenePoint,
      nativeEvent,
      object3d: (object ?? webGpuRenderer?.getPrimaryObjectForMobject(mobject.id) ?? null) as never
    };
  }

  function dragEventFor(
    mobject: Mobject,
    nativeEvent: PointerEvent,
    object: Object | null,
    startPoint: Point,
    previousPoint: Point
  ): ManimDragEvent | null {
    const base = pointerEventFor(mobject, nativeEvent, object);
    if (!base) return null;
    return {
      ...base,
      dragStartPoint: { ...startPoint },
      dragPreviousPoint: { ...previousPoint },
      dragDelta: {
        x: base.scenePoint.x - previousPoint.x,
        y: base.scenePoint.y - previousPoint.y
      },
      dragTotalDelta: {
        x: base.scenePoint.x - startPoint.x,
        y: base.scenePoint.y - startPoint.y
      }
    };
  }

  function invokePointerCallback(
    mobject: Mobject | null,
    callback:
      | 'onPointerDown'
      | 'onPointerMove'
      | 'onPointerUp'
      | 'onPointerEnter'
      | 'onPointerLeave',
    nativeEvent: PointerEvent,
    object?: Object | null
  ): void {
    if (!mobject) return;
    if (!mobject[callback]) return;
    const event = pointerEventFor(mobject, nativeEvent, object);
    if (!event) return;
    mobject[callback]?.(event);
    rerenderAfterInteraction();
  }

  function isDraggableMobject(mobject: Mobject | null): boolean {
    return Boolean(
      mobject &&
      (
        mobject.draggable ||
        mobject.onDragStart ||
        mobject.onDrag ||
        mobject.onDragEnd
      )
    );
  }

  function invokeDragCallback(
    mobject: Mobject | null,
    callback: 'onDragStart' | 'onDrag' | 'onDragEnd',
    nativeEvent: PointerEvent,
    object: Object | null,
    startPoint: Point,
    previousPoint: Point
  ): ManimDragEvent | null {
    if (!mobject) return null;
    if (!mobject[callback]) return null;
    const event = dragEventFor(mobject, nativeEvent, object, startPoint, previousPoint);
    if (!event) return null;
    mobject[callback]?.(event);
    rerenderAfterInteraction();
    return event;
  }

  function applyDefaultDrag(mobject: Mobject, event: ManimDragEvent): void {
    const center = mobject.getCenter?.() ?? {
      x: mobject.x ?? event.scenePoint.x,
      y: mobject.y ?? event.scenePoint.y
    };
    mobject.moveTo?.({
      x: center.x + event.dragDelta.x,
      y: center.y + event.dragDelta.y
    });
    rerenderAfterInteraction();
  }

  function resolvePointerTarget(event: PointerEvent): {
    mobject: Mobject | null;
    object: Object | null;
    cursor?: string;
    pickable: boolean;
  } {
    const object = webGpuRenderer?.hitTest(event.clientX, event.clientY, {
      includeNonPickable: sourceNavigationMode
    }) ?? null;
    const mobjectId = object?.userData?.mobjectId;
    return {
      mobject: mobjectId ? (mobjectsById.get(mobjectId) ?? null) : null,
      object,
      cursor: object?.userData?.cursor,
      pickable: Boolean(object?.userData?.pickable)
    };
  }

  function setHoveredMobject(
    nextMobject: Mobject | null,
    nativeEvent: PointerEvent,
    object?: Object | null,
    cursor?: string,
    pickable = false
  ): void {
    const current = hoveredMobjectId ? (mobjectsById.get(hoveredMobjectId) ?? null) : null;
    if (current?.id === nextMobject?.id) {
      const nextCursor = sourceNavigationMode && nextMobject
        ? 'pointer'
        : nextMobject?.cursor ?? cursor;
      const nextPickable = sourceNavigationMode
        ? Boolean(nextMobject)
        : pickable || Boolean(nextMobject);
      updateStageCursor(nextCursor, nextPickable);
      return;
    }
    if (current && !sourceNavigationMode) {
      invokePointerCallback(current, 'onPointerLeave', nativeEvent);
    }
    hoveredMobjectId = nextMobject?.id ?? null;
    if (nextMobject && !sourceNavigationMode) {
      invokePointerCallback(nextMobject, 'onPointerEnter', nativeEvent, object);
    }
    const nextCursor = sourceNavigationMode && nextMobject
      ? 'pointer'
      : nextMobject?.cursor ?? cursor;
    const nextPickable = sourceNavigationMode
      ? Boolean(nextMobject)
      : pickable || Boolean(nextMobject);
    updateStageCursor(nextCursor, nextPickable);
  }

  function handlePointerMove(event: PointerEvent): void {
    const target = resolvePointerTarget(event);
    setHoveredMobject(
      target.mobject,
      event,
      target.object,
      target.cursor,
      target.pickable
    );
    const active = activeMobjectId ? (mobjectsById.get(activeMobjectId) ?? null) : null;
    if (sourceNavigationMode) {
      return;
    }
    if (
      active &&
      dragStartPoint &&
      dragPreviousPoint &&
      isDraggableMobject(active)
    ) {
      const dragEvent = dragEventFor(
        active,
        event,
        target.object,
        dragStartPoint,
        dragPreviousPoint
      );
      if (dragEvent) {
        draggedMobjectId = active.id;
        if (active.onDrag) {
          invokeDragCallback(
            active,
            'onDrag',
            event,
            target.object,
            dragStartPoint,
            dragPreviousPoint
          );
        } else if (active.draggable) {
          applyDefaultDrag(active, dragEvent);
        }
        dragPreviousPoint = { ...dragEvent.scenePoint };
        updateStageCursor(active.cursor ?? 'grabbing', true);
      }
    }
    invokePointerCallback(active ?? target.mobject, 'onPointerMove', event, target.object);
  }

  function handlePointerDown(event: PointerEvent): void {
    const target = resolvePointerTarget(event);
    setHoveredMobject(
      target.mobject,
      event,
      target.object,
      target.cursor,
      target.pickable
    );
    activePointerId = event.pointerId;
    activeMobjectId = target.mobject?.id ?? null;
    const startPoint = scenePointFromEvent(event);
    dragStartPoint = startPoint ? { ...startPoint } : null;
    dragPreviousPoint = startPoint ? { ...startPoint } : null;
    draggedMobjectId = null;
    if (activeMobjectId && stageEl?.setPointerCapture) {
      stageEl.setPointerCapture(event.pointerId);
    }
    if (sourceNavigationMode) {
      updateStageCursor(target.mobject ? 'pointer' : undefined, Boolean(target.mobject));
      return;
    }
    invokePointerCallback(target.mobject, 'onPointerDown', event, target.object);
    if (
      target.mobject &&
      startPoint &&
      isDraggableMobject(target.mobject)
    ) {
      draggedMobjectId = target.mobject.id;
      invokeDragCallback(
        target.mobject,
        'onDragStart',
        event,
        target.object,
        startPoint,
        startPoint
      );
      draggedMobjectId = target.mobject.id;
    }
    updateStageCursor(
      target.mobject?.cursor ?? (isDraggableMobject(target.mobject) ? 'grabbing' : target.cursor),
      target.pickable || Boolean(target.mobject)
    );
  }

  function handlePointerUp(event: PointerEvent): void {
    const active = activeMobjectId ? (mobjectsById.get(activeMobjectId) ?? null) : null;
    const target = resolvePointerTarget(event);
    if (sourceNavigationMode) {
      const activeEvent = active ? pointerEventFor(active, event, target.object) : null;
      if (active && active.id === target.mobject?.id && activeEvent) {
        onMobjectNavigate?.(activeEvent);
      }
      if (activePointerId !== null && stageEl?.releasePointerCapture) {
        try {
          stageEl.releasePointerCapture(activePointerId);
        } catch {}
      }
      activePointerId = null;
      activeMobjectId = null;
      draggedMobjectId = null;
      dragStartPoint = null;
      dragPreviousPoint = null;
      setHoveredMobject(
        target.mobject,
        event,
        target.object,
        target.cursor,
        target.pickable
      );
      return;
    }
    invokePointerCallback(active ?? target.mobject, 'onPointerUp', event, target.object);
    if (
      active &&
      dragStartPoint &&
      dragPreviousPoint &&
      isDraggableMobject(active)
    ) {
      invokeDragCallback(
        active,
        'onDragEnd',
        event,
        target.object,
        dragStartPoint,
        dragPreviousPoint
      );
    }
    if (activePointerId !== null && stageEl?.releasePointerCapture) {
      try {
        stageEl.releasePointerCapture(activePointerId);
      } catch {}
    }
    activePointerId = null;
    activeMobjectId = null;
    draggedMobjectId = null;
    dragStartPoint = null;
    dragPreviousPoint = null;
    setHoveredMobject(
      target.mobject,
      event,
      target.object,
      target.cursor,
      target.pickable
    );
  }

  function handlePointerLeave(event: PointerEvent): void {
    setHoveredMobject(null, event, null, undefined, false);
    if (!activeMobjectId && !draggedMobjectId) {
      updateStageCursor(undefined, false);
    }
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
        syncRenderObjectBindings();
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
    syncRenderObjectBindings();
  });

  onDestroy(() => {
    for (const mobject of boundMobjects.values()) {
      mobject.bindRenderObject?.(null);
    }
    boundObjects.clear();
    boundMobjects.clear();
    webGpuRenderer?.dispose();
    webGpuRenderer = null;
    rendererBackend = null;
  });
</script>

<div
  bind:this={stageEl}
  data-testid="webgpu-scene-stage"
  data-renderer={ready ? rendererBackend : failed ? 'error' : 'initializing'}
  data-hover-mobject-id={hoveredMobjectId ?? undefined}
  data-active-mobject-id={activeMobjectId ?? undefined}
  data-drag-mobject-id={stageDragMobjectId() ?? undefined}
  role={ready ? 'img' : undefined}
  aria-label={ready ? 'TS scene stage' : undefined}
  class={`relative w-full overflow-hidden ${bare
    ? 'bg-black'
    : 'rounded-xl border border-slate-800 bg-slate-950'}`}
  style={`aspect-ratio:${STAGE_WIDTH}/${STAGE_HEIGHT};cursor:${stageCursor};`}
  onpointermove={handlePointerMove}
  onpointerdown={handlePointerDown}
  onpointerup={handlePointerUp}
  onpointerleave={handlePointerLeave}
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
