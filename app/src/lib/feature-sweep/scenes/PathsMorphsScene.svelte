<script lang="ts">
  import { progressWindow } from './anim';

  const { timeMs = 0 } = $props<{ timeMs?: number }>();
  const pathP = $derived(progressWindow(timeMs, 0, 1400));
  const moveP = $derived(progressWindow(timeMs, 1200, 2400));

  const pathDash = 1000;
  const pathDashOffset = $derived(pathDash * (1 - pathP));

  // Cubic Bezier position for M110,300 C260,60 520,420 690,190
  const x = $derived(
    Math.pow(1 - moveP, 3) * 110 +
    3 * Math.pow(1 - moveP, 2) * moveP * 260 +
    3 * (1 - moveP) * Math.pow(moveP, 2) * 520 +
    Math.pow(moveP, 3) * 690,
  );
  const y = $derived(
    Math.pow(1 - moveP, 3) * 300 +
    3 * Math.pow(1 - moveP, 2) * moveP * 60 +
    3 * (1 - moveP) * Math.pow(moveP, 2) * 420 +
    Math.pow(moveP, 3) * 190,
  );
  const r = $derived(12 + 4 * moveP);
</script>

<section class="rounded-xl border border-slate-700 bg-slate-950/80 p-4 shadow-xl">
  <svg viewBox="0 0 800 460" role="img" aria-label="Paths and morphs scene" class="w-full">
    <rect x="0" y="0" width="800" height="460" fill="#020617" />
    <text x="400" y="72" text-anchor="middle" fill="#e2e8f0" font-size="36">Paths and Morphs</text>
    <path d="M 110 300 C 260 60, 520 420, 690 190" fill="none" stroke="#4cc9f0" stroke-width="5" stroke-dasharray={pathDash} stroke-dashoffset={pathDashOffset} />
    <circle cx={x} cy={y} r={r} fill="#f72585" opacity={moveP > 0 ? 1 : 0} />
  </svg>
</section>
