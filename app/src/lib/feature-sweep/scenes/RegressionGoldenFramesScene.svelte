<script lang="ts">
  type Dot = { x: number; y: number };

  // Deterministic fixed seed result (matches py seed intent).
  const dots: Dot[] = [
    { x: 130, y: 210 },
    { x: 215, y: 143 },
    { x: 305, y: 248 },
    { x: 362, y: 182 },
    { x: 448, y: 296 },
    { x: 518, y: 176 },
    { x: 590, y: 236 },
    { x: 650, y: 166 },
    { x: 188, y: 302 },
    { x: 274, y: 338 },
    { x: 486, y: 116 },
    { x: 620, y: 304 }
  ];
</script>

<section class="rounded-xl border border-slate-700 bg-slate-950/80 p-4 shadow-xl">
  <svg viewBox="0 0 800 460" role="img" aria-label="Regression golden frames scene" class="w-full">
    <rect x="0" y="0" width="800" height="460" fill="#020617" />
    <text x="400" y="72" text-anchor="middle" fill="#e2e8f0" font-size="34">
      Regression Golden Frames
    </text>

    {#each dots as dot}
      <circle cx={dot.x} cy={dot.y} r="6" fill="#f9c74f" />
    {/each}
  </svg>
</section>
