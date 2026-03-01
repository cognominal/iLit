<script lang="ts">
  import { progressWindow } from './anim';
  const { timeMs = 0 } = $props<{ timeMs?: number }>();
  const p = $derived(progressWindow(timeMs, 0, 1000));
</script>

<section class="rounded-xl border border-slate-700 bg-slate-950/80 p-4 shadow-xl">
  <svg viewBox="0 0 800 460" role="img" aria-label="Export profiles scene" class="w-full">
    <rect x="0" y="0" width="800" height="460" fill="#020617" />
    <text x="400" y="90" text-anchor="middle" fill="#e2e8f0" font-size="36" opacity={p}>Export Profiles</text>

    <rect x="180" y="140" width="440" height="180" rx="12" fill="#0f172a" stroke="#334155" stroke-width="3" opacity={p} />
    <text x="400" y="200" text-anchor="middle" fill="#7dd3fc" font-size="28" opacity={p}>preset: medium_quality</text>
    <text x="400" y="248" text-anchor="middle" fill="#f9c74f" font-size="28" opacity={p}>fps: 30 / codec: h264</text>
  </svg>
</section>
