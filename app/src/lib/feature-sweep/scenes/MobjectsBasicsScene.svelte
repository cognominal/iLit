<script lang="ts">
  const { timeMs = 0 } = $props<{ timeMs?: number; mode?: string; progress?: number }>();

  const title = {
    x: 400,
    y: 90,
    text: 'Mobjects Basics',
    fill: '#e2e8f0',
    stroke: '#e2e8f0',
    fontSize: 46,
  };

  const square = {
    x: 220,
    y: 180,
    size: 130,
    stroke: '#4cc9f0',
    strokeWidth: 8,
    dash: 520,
  };

  const circle = {
    x: 560,
    y: 245,
    radius: 67,
    stroke: '#f72585',
    strokeWidth: 8,
    dash: 421,
  };

  const phaseMs = 900;

  function phaseProgress(nowMs: number, startMs: number, durationMs: number): number {
    const raw = (nowMs - startMs) / durationMs;
    if (raw <= 0) return 0;
    if (raw >= 1) return 1;
    return raw;
  }

  const titleP = $derived(phaseProgress(timeMs, 0, phaseMs));
  const squareP = $derived(phaseProgress(timeMs, phaseMs, phaseMs));
  const circleP = $derived(phaseProgress(timeMs, phaseMs * 2, phaseMs));

  const squareDashOffset = $derived(square.dash * (1 - squareP));
  const circleDashOffset = $derived(circle.dash * (1 - circleP));
</script>

<section class="rounded-xl border border-slate-700 bg-slate-950/80 p-4 shadow-xl">
  <svg viewBox="0 0 800 460" role="img" aria-label="Mobjects basics scene" class="w-full">
    <rect x="0" y="0" width="800" height="460" fill="#020617" />

    <text
      x={title.x}
      y={title.y}
      text-anchor="middle"
      fill={title.fill}
      stroke={title.stroke}
      stroke-width="0.8"
      font-size={title.fontSize}
      font-family="ui-sans-serif, system-ui"
      opacity={titleP}
      data-testid="mobjects-title"
      data-progress={titleP.toFixed(3)}
    >
      {title.text}
    </text>

    <rect
      x={square.x}
      y={square.y}
      width={square.size}
      height={square.size}
      rx="10"
      fill="none"
      stroke={square.stroke}
      stroke-width={square.strokeWidth}
      stroke-dasharray={square.dash}
      stroke-dashoffset={squareDashOffset}
      opacity={squareP > 0 ? 1 : 0}
      data-testid="mobjects-square"
      data-progress={squareP.toFixed(3)}
    />

    <circle
      cx={circle.x}
      cy={circle.y}
      r={circle.radius}
      fill="none"
      stroke={circle.stroke}
      stroke-width={circle.strokeWidth}
      stroke-dasharray={circle.dash}
      stroke-dashoffset={circleDashOffset}
      opacity={circleP > 0 ? 1 : 0}
      data-testid="mobjects-circle"
      data-progress={circleP.toFixed(3)}
    />
  </svg>
</section>
