<script lang="ts">
  import { progressWindow } from './anim';

  const { timeMs = 0 } = $props<{ timeMs?: number }>();
  const p = $derived(progressWindow(timeMs, 0, 1200));
</script>

<section class="rounded-xl border border-slate-700 bg-slate-950/80 p-4 shadow-xl">
  <svg viewBox="0 0 800 460" role="img" aria-label="Groups layers and z-index scene" class="w-full">
    <rect x="0" y="0" width="800" height="460" fill="#020617" />
    <text x="400" y="72" text-anchor="middle" fill="#e2e8f0" font-size="33">Groups, Layers, and Z-Index</text>

    <rect x="250" y="140" width="300" height="220" rx="16" fill="none" stroke="#4cc9f0" stroke-width="8" opacity={p} />
    <circle cx="400" cy="250" r="110" fill="none" stroke="#f72585" stroke-width="8" opacity={p} />
  </svg>
</section>
