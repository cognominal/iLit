<script lang="ts">
  import { phase } from './anim';

  const { timeMs = 0 } = $props<{ timeMs?: number }>();
  const t = $derived(phase(timeMs, 2200));
  const swing = $derived(Math.sin(t * Math.PI * 2));
  const trackerX = $derived(400 + swing * 240);
</script>

<section class="rounded-xl border border-slate-700 bg-slate-950/80 p-4 shadow-xl">
  <svg viewBox="0 0 800 460" role="img" aria-label="Updaters and always redraw scene" class="w-full">
    <rect x="0" y="0" width="800" height="460" fill="#020617" />
    <text x="400" y="72" text-anchor="middle" fill="#e2e8f0" font-size="34">Updaters and Always Redraw</text>
    <line x1="130" y1="280" x2="670" y2="280" stroke="#64748b" stroke-width="3" />
    <line x1="400" y1="280" x2={trackerX} y2="280" stroke="#4cc9f0" stroke-width="4" />
    <circle cx={trackerX} cy="280" r="14" fill="#f72585" />
  </svg>
</section>
