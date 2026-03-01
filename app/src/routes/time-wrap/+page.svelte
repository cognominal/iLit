<script lang="ts">
  import {
    DURATION_MS,
    FRAME_STEP_MS,
    advance,
    clampTime,
    evaluateAt,
    type Mode,
  } from '$lib/feature-sweep/time-wrap/core';

  let mode = $state<Mode>('normal');
  let isPlaying = $state(true);
  let currentTimeMs = $state(0);
  let lastTickMs = $state(0);

  const visual = $derived(evaluateAt(currentTimeMs, DURATION_MS));
  const percent = $derived((currentTimeMs / DURATION_MS) * 100);

  function onModeChange(next: Mode): void {
    mode = next;
    if (next === 'time-wrap') {
      isPlaying = false;
    }
  }

  function onSliderInput(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;
    const next = Number(target.value);
    currentTimeMs = clampTime(next, DURATION_MS);
  }

  function onPlayPause(): void {
    if (mode === 'time-wrap') return;
    isPlaying = !isPlaying;
  }

  function onReset(): void {
    currentTimeMs = 0;
    isPlaying = false;
  }

  function onPrev(): void {
    currentTimeMs = clampTime(currentTimeMs - FRAME_STEP_MS, DURATION_MS);
  }

  function onNext(): void {
    currentTimeMs = clampTime(currentTimeMs + FRAME_STEP_MS, DURATION_MS);
  }

  $effect(() => {
    if (mode !== 'normal' || !isPlaying) return;

    let raf = 0;

    const tick = (now: number) => {
      if (lastTickMs === 0) {
        lastTickMs = now;
      }
      const delta = now - lastTickMs;
      lastTickMs = now;

      currentTimeMs = advance(currentTimeMs, delta, DURATION_MS);
      if (currentTimeMs >= DURATION_MS) {
        isPlaying = false;
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lastTickMs = 0;
    };
  });
</script>

<section class="space-y-4">
  <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
    <h1 class="text-2xl font-semibold">Time Wrap Demo</h1>
    <p class="mt-2 text-slate-300">
      One evaluator drives both normal playback and instant time-wrap seeking.
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
        mode: {mode}
      </text>
    </svg>
  </div>

  <div class="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 md:grid-cols-[auto_1fr_auto]">
    <div class="flex min-w-44 items-center gap-2">
      <label class="text-sm text-slate-300" for="mode">Mode</label>
      <select
        id="mode"
        class="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
        value={mode}
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
      max={DURATION_MS}
      step="1"
      value={currentTimeMs}
      oninput={onSliderInput}
      aria-label="Time slider"
    />

    <div class="w-32 text-right text-sm tabular-nums text-cyan-300">
      {Math.round(currentTimeMs)} ms
    </div>

    <div class="flex flex-wrap gap-2 md:col-span-3">
      <button class="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm" onclick={onPrev}>Prev</button>
      <button class="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm" onclick={onPlayPause} disabled={mode !== 'normal'}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button class="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm" onclick={onNext}>Next</button>
      <button class="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm" onclick={onReset}>Reset</button>
      <div class="ml-auto min-w-44 text-right text-sm text-slate-300">
        progress: {percent.toFixed(1)}%
      </div>
    </div>
  </div>
</section>
