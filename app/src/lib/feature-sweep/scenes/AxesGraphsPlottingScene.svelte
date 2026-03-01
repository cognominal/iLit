<section class="rounded-xl border border-slate-700 bg-slate-950/80 p-4 shadow-xl">
  <svg viewBox="0 0 800 460" role="img" aria-label="Axes graphs and plotting scene" class="w-full">
    <rect x="0" y="0" width="800" height="460" fill="#020617" />

    <text x="400" y="72" text-anchor="middle" fill="#e2e8f0" font-size="34"
      >Axes Graphs and Plotting</text
    >

    <line x1="140" y1="340" x2="680" y2="340" stroke="#94a3b8" stroke-width="3" />
    <line x1="220" y1="110" x2="220" y2="360" stroke="#94a3b8" stroke-width="3" />

    <path d="M 220 340 Q 380 130, 560 340" fill="none" stroke="#4cc9f0" stroke-width="6" class="graph" />
  </svg>
</section>

<style>
  .graph {
    stroke-dasharray: 600;
    stroke-dashoffset: 600;
    animation: draw-graph 1100ms ease-out forwards;
    animation-delay: 900ms;
  }

  @keyframes draw-graph {
    to {
      stroke-dashoffset: 0;
    }
  }
</style>
