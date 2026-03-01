<script lang="ts">
  import {
    createTimelineControllerState,
    progress01,
    reduceTimelineState,
    type Mode,
    type TimelineCommand,
  } from '$lib/feature-sweep/core/timeline-controller';
  import { FRAME_STEP_MS } from '$lib/feature-sweep/time-wrap/core';
  import { sceneComponentFor } from '$lib/feature-sweep/registry';

  const { data } = $props<{
    data: {
      script: {
        id: string;
        title: string;
        file: string;
      };
      scene: {
        id: string;
        title: string;
        description: string;
      };
    };
  }>();

  let timeline = $state(createTimelineControllerState(6000, FRAME_STEP_MS));

  const SceneComponent = $derived(
    sceneComponentFor(data.script.id, data.scene.id)
  );

  const progress = $derived(progress01(timeline));

  function dispatch(command: TimelineCommand): void {
    timeline = reduceTimelineState(timeline, command);
  }

  $effect(() => {
    // Reset timeline state whenever the route-scene identity changes.
    data.script.id;
    data.scene.id;
    timeline = createTimelineControllerState(6000, FRAME_STEP_MS);
  });

  function onModeChange(next: Mode): void {
    dispatch({ type: 'setMode', mode: next });
  }

  function onSliderInput(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;
    dispatch({ type: 'seek', timeMs: Number(target.value) });
  }

  const sceneContainerStyle = $derived(
    `opacity:${0.72 + progress * 0.28};` +
      `transform:translateY(${(1 - progress) * 4}px) scale(${0.985 + progress * 0.015});`,
  );

  $effect(() => {
    if (timeline.mode !== 'normal' || !timeline.isPlaying) return;

    let raf = 0;

    const tick = (now: number) => {
      dispatch({ type: 'tick', nowMs: now });
      if (timeline.mode === 'normal' && timeline.isPlaying) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
    };
  });
</script>

<section class="space-y-4">
  <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
    <p class="text-xs uppercase tracking-wide text-cyan-300">{data.script.file}</p>
    <h1 class="mt-1 text-2xl font-semibold">{data.scene.title}</h1>
    <p class="mt-2 text-slate-300">{data.scene.description}</p>
  </div>

  <div class="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 md:grid-cols-[auto_1fr_auto]">
    <div class="flex min-w-44 items-center gap-2">
      <label class="text-sm text-slate-300" for="mode">Mode</label>
      <select
        id="mode"
        class="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
        value={timeline.mode}
        onchange={(e) => onModeChange((e.currentTarget as HTMLSelectElement).value as Mode)}
      >
        <option value="normal">normal</option>
        <option value="time-wrap">time-wrap</option>
      </select>
    </div>

    <input
      class="w-full"
      type="range"
      min="0"
      max={timeline.durationMs}
      step="1"
      value={timeline.currentTimeMs}
      oninput={onSliderInput}
      aria-label="Time slider"
    />

    <div class="w-32 text-right text-sm tabular-nums text-cyan-300">
      {Math.round(timeline.currentTimeMs)} ms
    </div>

    <div class="flex flex-wrap gap-2 md:col-span-3">
      <button class="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm" onclick={() => dispatch({ type: 'prev' })}>Prev</button>
      <button class="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm" onclick={() => dispatch({ type: 'playPause' })}>
        {timeline.isPlaying ? 'Pause' : 'Play'}
      </button>
      <button class="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm" onclick={() => dispatch({ type: 'next' })}>Next</button>
      <button class="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm" onclick={() => dispatch({ type: 'reset' })}>Reset</button>
      <div class="ml-auto min-w-44 text-right text-sm text-slate-300">
        progress: {(progress * 100).toFixed(1)}%
      </div>
    </div>
  </div>

  {#if SceneComponent}
    <div style={sceneContainerStyle}>
      <SceneComponent
        timeMs={timeline.currentTimeMs}
        mode={timeline.mode}
        progress={progress}
      />
    </div>
  {:else}
    <div class="rounded-xl border border-amber-700/60 bg-amber-950/40 p-4 text-amber-100">
      Not implemented yet in Svelte: {data.script.id}/{data.scene.id}
    </div>
  {/if}
</section>
