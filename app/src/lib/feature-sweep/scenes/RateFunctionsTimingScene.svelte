<script lang="ts">
  import { phase } from './anim';

  const { timeMs = 0 } = $props<{ timeMs?: number }>();
  const t = $derived(phase(timeMs, 1800));
  const ease = $derived(0.5 - 0.5 * Math.cos(Math.PI * t));
  const x = $derived(140 + 520 * ease);
</script>

<section class="rounded-xl border border-slate-700 bg-slate-950/80 p-4 shadow-xl">
  <svg viewBox="0 0 800 460" role="img" aria-label="Rate functions timing scene" class="w-full">
    <rect x="0" y="0" width="800" height="460" fill="#020617" />
    <text x="400" y="72" text-anchor="middle" fill="#e2e8f0" font-size="36">Rate Functions and Timing</text>
    <line x1="140" y1="280" x2="660" y2="280" stroke="#64748b" stroke-width="3" />
    <circle cx={x} cy="280" r="14" fill="#f9c74f" />
  </svg>
</section>
