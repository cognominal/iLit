<script lang="ts">
  import { progressWindow } from './anim';

  const { timeMs = 0 } = $props<{ timeMs?: number }>();
  const p = $derived(progressWindow(timeMs, 0, 1200));
</script>

<section class="rounded-xl border border-slate-700 bg-slate-950/80 p-4 shadow-xl">
  <svg viewBox="0 0 800 460" role="img" aria-label="Images SVG assets scene" class="w-full">
    <rect x="0" y="0" width="800" height="460" fill="#020617" />
    <text x="400" y="72" text-anchor="middle" fill="#e2e8f0" font-size="34">Images SVG and Assets</text>

    <g transform={`translate(240,140) scale(${0.92 + p * 0.08})`} opacity={p}>
      <rect x="0" y="0" width="320" height="220" rx="16" fill="#0f172a" stroke="#334155" stroke-width="4" />
      <path d="M 40 180 L 120 110 L 190 165 L 260 90 L 290 180" fill="none" stroke="#4cc9f0" stroke-width="6" />
      <circle cx="90" cy="70" r="26" fill="#f9c74f" />
    </g>
  </svg>
</section>
