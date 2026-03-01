<script lang="ts">
  import { progressWindow } from './anim';

  const { timeMs = 0 } = $props<{ timeMs?: number }>();

  const squareP = $derived(progressWindow(timeMs, 0, 900));
  const morphP = $derived(progressWindow(timeMs, 900, 900));

  const squareDash = 640;
  const circleDash = 530;

  const squareDashOffset = $derived(squareDash * (1 - squareP));
  const circleDashOffset = $derived(circleDash * (1 - morphP));
  const squareOpacity = $derived(1 - morphP);
  const circleOpacity = $derived(morphP);
</script>

<section class="rounded-xl border border-slate-700 bg-slate-950/80 p-4 shadow-xl">
  <svg viewBox="0 0 800 460" role="img" aria-label="Transforms core scene" class="w-full">
    <rect x="0" y="0" width="800" height="460" fill="#020617" />
    <text x="400" y="80" text-anchor="middle" fill="#e2e8f0" font-size="40">Transforms Core</text>

    <rect
      x="320"
      y="170"
      width="160"
      height="160"
      rx="14"
      fill="none"
      stroke="#4cc9f0"
      stroke-width="8"
      stroke-dasharray={squareDash}
      stroke-dashoffset={squareDashOffset}
      opacity={squareOpacity > 0 ? squareOpacity : 0}
    />

    <circle
      cx="400"
      cy="250"
      r="84"
      fill="none"
      stroke="#f72585"
      stroke-width="8"
      stroke-dasharray={circleDash}
      stroke-dashoffset={circleDashOffset}
      opacity={circleOpacity}
    />
  </svg>
</section>
