<script lang="ts">
  type CellId = 'r0c0' | 'r0c1' | 'r1c0' | 'r1c1';

  type Step = {
    id: number;
    label: string;
    fill: CellId[];
    focus?: CellId;
    note: string;
  };

  const cellOrder: CellId[] = ['r0c0', 'r0c1', 'r1c0', 'r1c1'];

  const steps: Step[] = [
    {
      id: 0,
      label: 'Start',
      fill: [],
      note: 'Empty 2x2 board. This mirrors the pre-selection state before any row is applied.',
    },
    {
      id: 1,
      label: 'Step 1',
      fill: ['r0c0'],
      focus: 'r0c0',
      note: 'First cell is covered.',
    },
    {
      id: 2,
      label: 'Step 2',
      fill: ['r0c0', 'r0c1'],
      focus: 'r0c1',
      note: 'Top row is now fully covered.',
    },
    {
      id: 3,
      label: 'Step 3',
      fill: ['r0c0', 'r0c1', 'r1c0'],
      focus: 'r1c0',
      note: 'Coverage extends into bottom-left.',
    },
    {
      id: 4,
      label: 'Step 4',
      fill: ['r0c0', 'r0c1', 'r1c0', 'r1c1'],
      focus: 'r1c1',
      note: 'Board is fully covered.',
    },
  ];

  const size = 120;
  const gap = 10;
  const speedMs = 700;

  let stepIndex = $state(0);
  let isPlaying = $state(true);

  const currentStep = $derived(steps[stepIndex]);

  const isFilled = (cell: CellId): boolean => currentStep.fill.includes(cell);
  const isFocused = (cell: CellId): boolean => currentStep.focus === cell;

  function nextStep(): void {
    stepIndex = (stepIndex + 1) % steps.length;
  }

  function previousStep(): void {
    stepIndex = (stepIndex - 1 + steps.length) % steps.length;
  }

  function reset(): void {
    stepIndex = 0;
    isPlaying = false;
  }

  $effect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      nextStep();
    }, speedMs);
    return () => clearInterval(timer);
  });
</script>

<main>
  <h1>2x2 Table Fill Animation</h1>
  <p class="subtitle">First incremental step of the Manim to Svelte/SVG port</p>

  <section class="panel">
    <svg
      viewBox={`0 0 ${size * 2 + gap} ${size * 2 + gap}`}
      role="img"
      aria-label="Animated 2x2 table"
    >
      {#each cellOrder as cell, i}
        {@const row = Math.floor(i / 2)}
        {@const col = i % 2}
        {@const x = col * (size + gap)}
        {@const y = row * (size + gap)}

        <rect
          x={x}
          y={y}
          width={size}
          height={size}
          rx="14"
          class:filled={isFilled(cell)}
          class:focused={isFocused(cell)}
        />

        <text x={x + size / 2} y={y + size / 2 + 6} text-anchor="middle" class="cell-label">
          {cell}
        </text>
      {/each}
    </svg>

    <div class="status">
      <p><strong>{currentStep.label}</strong></p>
      <p>{currentStep.note}</p>
      <p>Filled cells: {currentStep.fill.length}/4</p>
    </div>
  </section>

  <section class="controls" aria-label="Animation controls">
    <button type="button" onclick={previousStep}>Prev</button>
    <button type="button" onclick={() => (isPlaying = !isPlaying)}>{isPlaying ? 'Pause' : 'Play'}</button>
    <button type="button" onclick={nextStep}>Next</button>
    <button type="button" onclick={reset}>Reset</button>
  </section>
</main>
