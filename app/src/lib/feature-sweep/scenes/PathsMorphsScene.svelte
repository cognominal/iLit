<section class="rounded-xl border border-slate-700 bg-slate-950/80 p-4 shadow-xl">
  <svg viewBox="0 0 800 460" role="img" aria-label="Paths and morphs scene" class="w-full">
    <rect x="0" y="0" width="800" height="460" fill="#020617" />

    <text x="400" y="72" text-anchor="middle" fill="#e2e8f0" font-size="36"
      >Paths and Morphs</text
    >

    <path d="M 110 300 C 260 60, 520 420, 690 190" fill="none" stroke="#4cc9f0" stroke-width="5" class="path" />

    <circle cx="110" cy="300" r="12" fill="#f72585" class="walker" />
  </svg>
</section>

<style>
  .path {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: draw-path 1400ms ease-out forwards;
  }

  .walker {
    offset-path: path('M 110 300 C 260 60, 520 420, 690 190');
    offset-distance: 0%;
    animation: along-path 2400ms ease-in-out infinite alternate;
    animation-delay: 1200ms;
  }

  @keyframes draw-path {
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes along-path {
    from {
      offset-distance: 0%;
      transform: scale(1);
    }

    to {
      offset-distance: 100%;
      transform: scale(1.35);
    }
  }
</style>
