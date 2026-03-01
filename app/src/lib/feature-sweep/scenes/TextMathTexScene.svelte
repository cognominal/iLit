<script lang="ts">
  import { progressWindow } from './anim';

  const { timeMs = 0 } = $props<{ timeMs?: number }>();
  const titleP = $derived(progressWindow(timeMs, 0, 900));
  const formulaP = $derived(progressWindow(timeMs, 900, 900));
</script>

<section class="rounded-xl border border-slate-700 bg-slate-950/80 p-4 shadow-xl">
  <svg viewBox="0 0 800 460" role="img" aria-label="Text math tex scene" class="w-full">
    <rect x="0" y="0" width="800" height="460" fill="#020617" />
    <text x="400" y="120" text-anchor="middle" fill="#e2e8f0" font-size="42" opacity={titleP}>Text and MathTex</text>
    <text x="400" y="250" text-anchor="middle" fill="#f9c74f" font-size="54" opacity={formulaP}>e^(iπ) + 1 = 0</text>
  </svg>
</section>
