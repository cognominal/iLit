<section class="rounded-xl border border-slate-700 bg-slate-950/80 p-4 shadow-xl">
  <svg viewBox="0 0 800 460" role="img" aria-label="Transforms core scene" class="w-full">
    <rect x="0" y="0" width="800" height="460" fill="#020617" />

    <text x="400" y="80" text-anchor="middle" fill="#e2e8f0" font-size="40"
      >Transforms Core</text
    >

    <rect
      x="320"
      y="170"
      width="160"
      height="160"
      rx="14"
      fill="none"
      stroke="#4cc9f0"
      stroke-width="8"
      class="shape square"
    />

    <circle
      cx="400"
      cy="250"
      r="84"
      fill="none"
      stroke="#f72585"
      stroke-width="8"
      class="shape circle"
    />
  </svg>
</section>

<style>
  .shape {
    opacity: 0;
    animation: show 900ms ease-out forwards;
  }

  .square {
    stroke-dasharray: 640;
    stroke-dashoffset: 640;
    animation-name: draw-square;
    animation-delay: 900ms;
  }

  .circle {
    stroke-dasharray: 530;
    stroke-dashoffset: 530;
    animation-name: draw-circle;
    animation-delay: 1800ms;
  }

  @keyframes show {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes draw-square {
    from {
      opacity: 1;
      stroke-dashoffset: 640;
    }

    to {
      opacity: 1;
      stroke-dashoffset: 0;
    }
  }

  @keyframes draw-circle {
    from {
      opacity: 1;
      stroke-dashoffset: 530;
    }

    to {
      opacity: 1;
      stroke-dashoffset: 0;
    }
  }
</style>
