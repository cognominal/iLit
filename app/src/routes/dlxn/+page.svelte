<script lang="ts">
  import {
    createTimelineControllerState,
    progress01,
    reduceTimelineState,
    type Mode,
    type TimelineCommand
  } from '$lib/feature-sweep/core/timeline-controller';
  import { scenePhases } from '$lib/feature-sweep/manim-api';
  import {
    hasOne,
    threeByTwoThreeTilesColumns,
    threeByTwoThreeTilesRows,
    type Column,
  } from '$lib/dlx';
  import {
    activeColumnsForStep,
    buildDlxnPreview,
    stepIndexAtTime,
  } from '$lib/dlxn/adapter';
  import MatrixTableSvg from '$lib/renderers/svg/MatrixTableSvg.svelte';
  import TsSceneStage from '$lib/ts-feature-sweep/render/TsSceneStage.svelte';

  const preview = buildDlxnPreview({
    rows: threeByTwoThreeTilesRows,
    stepDurationSec: 0.42,
    idleDurationSec: 0.4,
  });
  const durationSec = preview.durationSec;
  const emptyVtt = 'data:text/vtt;charset=utf-8,WEBVTT';
  let timeline = $state(createTimelineControllerState(durationSec, 0.42));
  let mp4Profile = $state<'lowres' | 'medres' | 'hires'>('medres');
  let mp4Status = $state<{
    exists: boolean;
    upToDate: boolean;
    playbackUrl: string;
    sourceMtimeMs: number | null;
    mp4MtimeMs: number | null;
  } | null>(null);
  let mp4Busy = $state(false);
  let mp4Error = $state('');
  let mp4Message = $state('');

  const stepIndex = $derived.by(() => {
    return stepIndexAtTime(preview, timeline.currentTimeSec);
  });

  const currentStep = $derived(preview.steps[stepIndex]);
  const activeRowName = $derived(currentStep?.rowName);
  const intrinsicTimeSec = $derived(
    timeline.durationSec > 0 && preview.durationSec > 0
      ? (timeline.currentTimeSec / timeline.durationSec) * preview.durationSec
      : timeline.currentTimeSec
  );

  const progress = $derived(progress01(timeline));
  const activeColumns = $derived.by(() =>
    activeColumnsForStep(currentStep, preview.rowByName)
  );
  const progressById = $derived.by(() => {
    const byId = new Map<string, number>();
    let phaseStart = 0;
    for (const phase of scenePhases(preview.scene)) {
      for (const step of phase.animations) {
        if (!step.targetId) continue;
        const raw = (intrinsicTimeSec - phaseStart) / step.runTime;
        const stepProgress = Math.max(0, Math.min(1, raw));
        if (step.kind === 'create') {
          const prev = byId.get(step.targetId) ?? 0;
          byId.set(step.targetId, Math.max(prev, stepProgress));
        }
        if (step.kind === 'fadeOut') {
          const prev = byId.get(step.targetId) ?? 1;
          byId.set(step.targetId, Math.max(0, prev * (1 - stepProgress)));
        }
      }
      phaseStart += phase.durationSec;
    }
    return byId;
  });
  const replacementState = $derived({
    active: [],
    completedSources: new Set<string>(),
    completedTargets: new Set<string>(),
  });
  const durationDeltaSec = $derived(
    durationSec - preview.parity.pyExpectedDurationSec
  );
  const markerCoverage = $derived.by(() => {
    const py = new Set(preview.parity.pyMarkers);
    const ts = new Set(preview.parity.tsMarkers);
    let matched = 0;
    for (const marker of py) {
      if (ts.has(marker)) matched += 1;
    }
    return { matched, total: py.size };
  });

  function isColumnActive(column: Column): boolean {
    return activeColumns.has(column);
  }

  function dispatch(command: TimelineCommand): void {
    timeline = reduceTimelineState(timeline, command);
  }

  function onModeChange(next: Mode): void {
    dispatch({ type: 'setMode', mode: next });
  }

  function onSliderInput(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;
    dispatch({ type: 'seek', timeSec: Number(target.value) });
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
    return () => cancelAnimationFrame(raf);
  });

  $effect(() => {
    void refreshMp4Status();
  });

  async function refreshMp4Status(): Promise<void> {
    try {
      const response = await fetch(`/dlxn/mp4-status?profile=${mp4Profile}`, {
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('status failed');
      mp4Status = await response.json();
      mp4Error = '';
    } catch (cause) {
      mp4Status = null;
      mp4Error = cause instanceof Error ? cause.message : String(cause);
    }
  }

  async function renderPyMp4(profile: 'lowres' | 'medres' | 'hires'): Promise<void> {
    mp4Busy = true;
    mp4Error = '';
    mp4Message = '';
    try {
      const response = await fetch('/dlxn/render-py-mp4', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      if (!response.ok) throw new Error('render failed');
      mp4Message = `Rendered Python MP4 (${profile}).`;
      await refreshMp4Status();
    } catch (cause) {
      mp4Error = cause instanceof Error ? cause.message : String(cause);
    } finally {
      mp4Busy = false;
    }
  }
</script>

<section class="space-y-4">
  <header class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
    <h1 class="text-2xl font-semibold">DLXn (manim-api scaffold)</h1>
    <p class="mt-2 text-slate-300">
      Step 3 route: phase-based timing and parity primitives over `manim-api.ts`.
    </p>
  </header>

  <div class="layout rounded-xl border border-slate-800 bg-slate-900/60 p-4">
    <div class="table-wrap" role="region" aria-label="Exact cover matrix">
      <div class="controls-wrap">
        <div class="mode-wrap">
          <label class="text-sm text-slate-300" for="mode">Mode</label>
          <select
            id="mode"
            class="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
            value={timeline.mode}
            onchange={(e) =>
              onModeChange((e.currentTarget as HTMLSelectElement).value as Mode)}
          >
            <option value="normal">normal</option>
            <option value="time-wrap">time-wrap</option>
          </select>
        </div>
        <input
          class="w-full"
          type="range"
          min="0"
          max={timeline.durationSec}
          step="0.01"
          value={timeline.currentTimeSec}
          oninput={onSliderInput}
          aria-label="Time slider"
        />
        <div class="text-right text-sm tabular-nums text-cyan-300">
          {timeline.currentTimeSec.toFixed(2)} sec
        </div>
      </div>

      <MatrixTableSvg
        columns={threeByTwoThreeTilesColumns}
        rows={threeByTwoThreeTilesRows}
        {hasOne}
        isColumnActive={isColumnActive}
        isRowActive={(rowName) => activeRowName === rowName}
      />
    </div>

    <aside class="status-panel rounded-lg border border-slate-700 bg-slate-950/70">
      <p><strong>active step:</strong> {stepIndex}</p>
      <p><strong>active row:</strong> {activeRowName ?? 'none'}</p>
      <p><strong>label:</strong> {currentStep?.label ?? 'Idle'}</p>
      <p><strong>note:</strong> {currentStep?.note ?? 'Initial wait'}</p>

      <div class="stage-wrap">
        <TsSceneStage
          mobjects={preview.scene.mobjects}
          {progressById}
          replacements={replacementState.active}
          completedReplacementSources={replacementState.completedSources}
          completedReplacementTargets={replacementState.completedTargets}
        />
      </div>

      <div class="controls" aria-label="Animation controls">
        <button type="button" class="dlx-button" onclick={() => dispatch({ type: 'prev' })}>
          Prev
        </button>
        <button
          type="button"
          class="dlx-button"
          onclick={() => dispatch({ type: 'playPause' })}
        >
          {timeline.isPlaying ? 'Pause' : 'Play'}
        </button>
        <button type="button" class="dlx-button" onclick={() => dispatch({ type: 'next' })}>
          Next
        </button>
        <button type="button" class="dlx-button" onclick={() => dispatch({ type: 'reset' })}>
          Reset
        </button>
        <div class="ml-auto min-w-32 text-right text-sm text-slate-300">
          progress: {(progress * 100).toFixed(1)}%
        </div>
      </div>

      <div class="compare rounded-lg border border-slate-700 bg-slate-950/70">
        <h2 class="text-base font-semibold text-cyan-300">Python (.py) Compare</h2>
        <div class="compare-controls">
          <label for="profile" class="text-sm text-slate-300">Profile</label>
          <select
            id="profile"
            class="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
            value={mp4Profile}
            onchange={(e) => {
              mp4Profile = (e.currentTarget as HTMLSelectElement)
                .value as 'lowres' | 'medres' | 'hires';
            }}
          >
            <option value="lowres">lowres</option>
            <option value="medres">medres</option>
            <option value="hires">hires</option>
          </select>
          <button
            type="button"
            class="dlx-button"
            disabled={mp4Busy}
            onclick={() => renderPyMp4(mp4Profile)}
          >
            {mp4Busy ? 'Rendering...' : 'Render Python MP4'}
          </button>
        </div>
        <p class="text-xs text-slate-400">
          Script: `{preview.parity.pyScriptPath}` class
          `{preview.parity.pySceneClass}`
        </p>
        {#if mp4Error}
          <p class="mt-1 text-sm text-rose-400">{mp4Error}</p>
        {/if}
        {#if mp4Message}
          <p class="mt-1 text-sm text-emerald-400">{mp4Message}</p>
        {/if}
        <ul class="mt-2 text-sm text-slate-300">
          <li>TS duration: {durationSec.toFixed(2)} sec</li>
          <li>PY target duration: {preview.parity.pyExpectedDurationSec.toFixed(2)} sec</li>
          <li>Duration delta: {durationDeltaSec.toFixed(2)} sec</li>
          <li>
            Marker coverage: {markerCoverage.matched}/{markerCoverage.total}
          </li>
        </ul>
        {#if mp4Status?.exists}
          <video
            class="mt-3 w-full rounded border border-slate-700"
            controls
            preload="metadata"
            src={`${mp4Status.playbackUrl}&t=${mp4Status.mp4MtimeMs ?? 0}`}
          >
            <track kind="captions" srclang="en" label="No captions" src={emptyVtt} />
          </video>
        {:else}
          <p class="mt-2 text-sm text-slate-400">
            No Python MP4 yet for this profile.
          </p>
        {/if}
      </div>
    </aside>
  </div>
</section>

<style>
  .layout {
    display: grid;
    grid-template-columns: minmax(680px, 1fr) minmax(260px, 340px);
    gap: 1rem;
    align-items: start;
  }

  .table-wrap {
    overflow: auto;
    border: 1px solid rgba(255, 255, 255, 0.5);
    padding: 0.75rem;
  }

  .controls-wrap {
    margin-bottom: 0.75rem;
    display: grid;
    gap: 0.6rem;
    grid-template-columns: minmax(170px, auto) 1fr auto;
    align-items: center;
  }

  .mode-wrap {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  :global(.dlx-matrix-svg) {
    min-width: 882px;
  }

  .status-panel {
    padding: 0.9rem;
  }

  .status-panel p {
    margin: 0.35rem 0;
  }

  .stage-wrap {
    margin-top: 0.6rem;
  }

  .controls {
    margin-top: 0.85rem;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .compare {
    margin-top: 0.85rem;
    padding: 0.75rem;
  }

  .compare-controls {
    margin-top: 0.5rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .dlx-button {
    border-radius: 0.5rem;
    border: 1px solid #475569;
    background: #020617;
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
    color: #e2e8f0;
  }

  @media (max-width: 1100px) {
    .layout {
      grid-template-columns: 1fr;
    }

    :global(.dlx-matrix-svg) {
      min-width: 680px;
    }
  }
</style>
