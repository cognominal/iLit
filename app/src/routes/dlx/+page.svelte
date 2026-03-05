<script lang="ts">
  import {
    createTimelineControllerState,
    progress01,
    reduceTimelineState,
    type Mode,
    type TimelineCommand,
  } from '$lib/feature-sweep/core/timeline-controller';
  import {
    activeCellsFromRow,
    activeColumnsFromRow,
    buildRowMap,
    hasOne,
    twoByTwoColumns,
    twoByTwoRows,
    type Cell,
    type Column,
  } from '$lib/dlx';
  import { Create, Rect, Scene } from '$lib/manim';
  import MatrixTableSvg from '$lib/renderers/svg/MatrixTableSvg.svelte';
  import SceneSvg from '$lib/renderers/svg/SceneSvg.svelte';

  const boardCells: Cell[] = ['c00', 'c01', 'c10', 'c11'];
  const rowByName = buildRowMap(twoByTwoRows);

  const previewScene = new Scene();
  previewScene.wait(1, {
    label: 'Idle',
    note: 'Preview phase: rows are shown one by one.',
  });

  for (const row of twoByTwoRows) {
    const rowNode = new Rect(`row-${row.name}`, 1, 1);
    previewScene.play(Create(rowNode), {
      meta: {
        label: `Preview ${row.name}`,
        rowName: row.name,
        note: `Active row ${row.name}: ${row.piece} + ${row.cells.join(', ')}`,
      },
    });
  }

  const isTestMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('test') === '1';

  const stepSec = 0.85;
  const durationSec = Math.max(0, (previewScene.timeline.length - 1) * stepSec);
  const initialTimeline = createTimelineControllerState(durationSec, stepSec);
  if (isTestMode) initialTimeline.isPlaying = false;
  let timeline = $state(initialTimeline);

  const stepIndex = $derived(
    Math.max(
      0,
      Math.min(
        previewScene.timeline.length - 1,
        Math.floor(timeline.currentTimeSec / stepSec),
      ),
    ),
  );

  const currentStep = $derived(previewScene.timeline[stepIndex]);
  const currentStepLabel = $derived(currentStep?.meta?.label ?? 'Step');
  const currentStepNote = $derived(currentStep?.meta?.note ?? '');
  const activeRowName = $derived(currentStep?.meta?.rowName);
  const progress = $derived(progress01(timeline));

  const activeRow = $derived(
    activeRowName ? rowByName.get(activeRowName) : undefined,
  );

  const activeColumns = $derived.by(() => activeColumnsFromRow(activeRow));
  const activeBoardCells = $derived.by(() => activeCellsFromRow(activeRow));

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

    return () => {
      cancelAnimationFrame(raf);
    };
  });
</script>

<section class="space-y-4">
  <header class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
    <h1 class="text-2xl font-semibold">DLX 2x2 Matrix Preview</h1>
    <p class="subtitle mt-2 text-slate-300">
      Manim-like table styling and row preview behavior.
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
        columns={twoByTwoColumns}
        rows={twoByTwoRows}
        {hasOne}
        isColumnActive={isColumnActive}
        isRowActive={(rowName) => activeRowName === rowName}
      />
    </div>

    <aside class="status-panel rounded-lg border border-slate-700 bg-slate-950/70">
      <p class="step" data-testid="step-label">
        <strong>{currentStepLabel}</strong>
      </p>
      <p data-testid="step-note">{currentStepNote}</p>
      <p>Phase: row preview</p>

      <SceneSvg scene={previewScene} currentIndex={stepIndex} />

      <svg class="dlx-board" viewBox="0 0 218 218" role="img" aria-label="2x2 board">
        {#each boardCells as cell, i}
          {@const x = (i % 2) * 109}
          {@const y = Math.floor(i / 2) * 109}
          <rect
            x={x + 5}
            y={y + 5}
            width="99"
            height="99"
            rx="8"
            class:board-active={activeBoardCells.has(cell)}
            data-testid={`board-${cell}`}
          />
          <text x={x + 54.5} y={y + 59} text-anchor="middle">{cell}</text>
        {/each}
      </svg>

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
    </aside>
  </div>
</section>

<style>
  .subtitle {
    color: var(--dlx-subtext);
  }

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

  .status-panel .step {
    color: #ffd48f;
  }

  .dlx-board {
    margin-top: 0.6rem;
    width: 100%;
    max-width: 220px;
  }

  .dlx-board rect {
    stroke-width: 2;
  }

  .dlx-board text {
    fill: #fff;
    font-family: var(--dlx-font-ui);
    font-size: 14px;
    pointer-events: none;
  }

  .controls {
    margin-top: 0.85rem;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .dlx-button {
    border-radius: 6px;
    padding: 0.35rem 0.7rem;
  }

  @media (max-width: 980px) {
    .layout {
      grid-template-columns: 1fr;
    }

    :global(.dlx-matrix-svg) {
      min-width: 760px;
    }

    :global(.dlx-matrix-svg .matrix-header),
    :global(.dlx-matrix-svg .matrix-row-label),
    :global(.dlx-matrix-svg .matrix-one) {
      font-size: 1.3rem;
    }
  }
</style>
