<script lang="ts">
  import {
    createTimelineControllerState,
    reduceTimelineState,
    type Mode,
    type TimelineCommand,
  } from '$lib/feature-sweep/core/timeline-controller';
  import {
    DURATION_MS,
    FRAME_STEP_MS,
    evaluateAt,
  } from '$lib/feature-sweep/time-wrap/core';

  let timeline = $state(createTimelineControllerState(DURATION_MS, FRAME_STEP_MS));

  const visual = $derived(evaluateAt(timeline.currentTimeMs, timeline.durationMs));
  const percent = $derived((timeline.currentTimeMs / timeline.durationMs) * 100);

  function dispatch(command: TimelineCommand): void {
    timeline = reduceTimelineState(timeline, command);
  }

  function onModeChange(next: Mode): void {
    dispatch({ type: 'setMode', mode: next });
  }

  function onSliderInput(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;
    dispatch({ type: 'seek', timeMs: Number(target.value) });
  }

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
    <h1 class="text-2xl font-semibold">Time Wrap Demo</h1>
    <p class="mt-2 text-slate-300">
      Shared timeline controller primitives drive both modes and transport.
    </p>
  </div>

  <div class="rounded-xl border border-slate-700 bg-slate-950/80 p-4 shadow-xl">
    <svg viewBox="0 0 800 420" role="img" aria-label="Time wrap stage" class="w-full">
      <rect x="0" y="0" width="800" height="420" fill="#020617" />

      <line x1="90" y1="340" x2="710" y2="340" stroke="#334155" stroke-width="4" />
      <circle
        cx={visual.x}
        cy={visual.y}
        r={40 * visual.scale}
        fill="#4cc9f0"
        fill-opacity={visual.opacity}
        stroke="#e2e8f0"
        stroke-width="5"
      />

      <text x="400" y="56" text-anchor="middle" fill="#e2e8f0" font-size="30">
        mode: {timeline.mode}
      </text>
    </svg>
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
        progress: {percent.toFixed(1)}%
      </div>
    </div>
  </div>
</section>
