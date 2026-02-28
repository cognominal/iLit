<script lang="ts">
  import {
    activeCellsFromRow,
    activeColumnsFromRow,
    buildRowMap,
    hasOne,
    twoByTwoColumns,
    twoByTwoPreviewSteps,
    twoByTwoRows,
    type Cell,
    type Column,
  } from '@shared/dlx';

  const boardCells: Cell[] = ['c00', 'c01', 'c10', 'c11'];

  const rowByName = buildRowMap(twoByTwoRows);
  const isTestMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('test') === '1';

  let stepIndex = $state(0);
  let isPlaying = $state(!isTestMode);
  const tickMs = 850;

  const currentStep = $derived(twoByTwoPreviewSteps[stepIndex]);
  const activeRow = $derived(
    currentStep.rowName ? rowByName.get(currentStep.rowName) : undefined,
  );

  const activeColumns = $derived.by(() => activeColumnsFromRow(activeRow));
  const activeBoardCells = $derived.by(() => activeCellsFromRow(activeRow));

  function isColumnActive(column: Column): boolean {
    return activeColumns.has(column);
  }

  function nextStep(): void {
    stepIndex = (stepIndex + 1) % twoByTwoPreviewSteps.length;
  }

  function previousStep(): void {
    stepIndex =
      (stepIndex - 1 + twoByTwoPreviewSteps.length) % twoByTwoPreviewSteps.length;
  }

  function reset(): void {
    stepIndex = 0;
    isPlaying = false;
  }

  $effect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      nextStep();
    }, tickMs);
    return () => clearInterval(timer);
  });
</script>

<main>
  <h1>DLX 2x2 Matrix Preview</h1>
  <p class="subtitle">Manim-like table styling and row preview behavior (first port slice)</p>

  <section class="layout">
    <div class="table-wrap" role="region" aria-label="Exact cover matrix">
      <table class="dlx-table" data-testid="matrix-table">
        <thead>
          <tr>
            <th class="row-col">row</th>
            {#each twoByTwoColumns as column}
              <th
                class:active-col={isColumnActive(column)}
                data-testid={`header-${column}`}
              >
                {column}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each twoByTwoRows as row}
            <tr
              class:active-row={currentStep.rowName === row.name}
              data-testid={`row-${row.name}`}
            >
              <td class="row-name">{row.name}</td>
              {#each twoByTwoColumns as column}
                <td class:active-col={isColumnActive(column)}>
                  {#if hasOne(row, column)}1{/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <aside class="status-panel">
      <p class="step" data-testid="step-label"><strong>{currentStep.label}</strong></p>
      <p data-testid="step-note">{currentStep.note}</p>
      <p>Phase: row preview</p>

      <svg
        class="dlx-board"
        viewBox="0 0 218 218"
        role="img"
        aria-label="2x2 board"
      >
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
        <button type="button" class="dlx-button" onclick={previousStep}>Prev</button>
        <button type="button" class="dlx-button" onclick={() => (isPlaying = !isPlaying)}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button type="button" class="dlx-button" onclick={nextStep}>Next</button>
        <button type="button" class="dlx-button" onclick={reset}>Reset</button>
      </div>
    </aside>
  </section>
</main>
