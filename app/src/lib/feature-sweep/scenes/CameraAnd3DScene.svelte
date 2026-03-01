<script lang="ts">
  import { phase } from './anim';

  const { timeMs = 0 } = $props<{ timeMs?: number }>();
  const angle = $derived(phase(timeMs, 5000) * 360);
</script>

<section class="rounded-xl border border-slate-700 bg-slate-950/80 p-4 shadow-xl">
  <svg viewBox="0 0 800 460" role="img" aria-label="Camera and 3D scene" class="w-full">
    <rect x="0" y="0" width="800" height="460" fill="#020617" />
    <text x="400" y="70" text-anchor="middle" fill="#e2e8f0" font-size="34">Camera and 3D</text>
    <g transform={`rotate(${angle} 400 240)`}>
      <line x1="400" y1="240" x2="580" y2="160" stroke="#64748b" stroke-width="4" />
      <line x1="400" y1="240" x2="260" y2="320" stroke="#64748b" stroke-width="4" />
      <line x1="400" y1="240" x2="400" y2="90" stroke="#64748b" stroke-width="4" />
      <circle cx="400" cy="240" r="72" fill="none" stroke="#4cc9f0" stroke-width="6" />
    </g>
  </svg>
</section>
