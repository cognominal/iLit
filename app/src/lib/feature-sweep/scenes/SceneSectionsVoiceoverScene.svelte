<script lang="ts">
  import { progressWindow } from './anim';

  const { timeMs = 0 } = $props<{ timeMs?: number }>();
  const introP = $derived(progressWindow(timeMs, 0, 700));
  const detailP = $derived(progressWindow(timeMs, 700, 700));
</script>

<section class="rounded-xl border border-slate-700 bg-slate-950/80 p-4 shadow-xl">
  <svg viewBox="0 0 800 460" role="img" aria-label="Scene sections and voiceover hooks" class="w-full">
    <rect x="0" y="0" width="800" height="460" fill="#020617" />

    <text x="400" y="74" text-anchor="middle" fill="#e2e8f0" font-size="32">Scene Sections and Voiceover Hooks</text>

    <rect x="180" y="130" width="440" height="80" rx="10" fill="#0f172a" stroke="#334155" stroke-width="3" opacity={introP} />
    <text x="400" y="178" text-anchor="middle" fill="#7dd3fc" font-size="30" opacity={introP}>Section: intro</text>

    <rect x="180" y="250" width="440" height="80" rx="10" fill="#0f172a" stroke="#334155" stroke-width="3" opacity={detailP} />
    <text x="400" y="298" text-anchor="middle" fill="#f9c74f" font-size="30" opacity={detailP}>Section: detail</text>
  </svg>
</section>
