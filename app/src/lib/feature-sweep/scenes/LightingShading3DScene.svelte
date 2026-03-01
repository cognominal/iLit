<section class="rounded-xl border border-slate-700 bg-slate-950/80 p-4 shadow-xl">
  <svg viewBox="0 0 800 460" role="img" aria-label="Lighting and shading 3D scene" class="w-full">
    <defs>
      <radialGradient id="litBlue" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#9bd8ff" />
        <stop offset="100%" stop-color="#1e4f7a" />
      </radialGradient>
      <radialGradient id="litRed" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ff9fba" />
        <stop offset="100%" stop-color="#7a1e45" />
      </radialGradient>
    </defs>

    <rect x="0" y="0" width="800" height="460" fill="#020617" />
    <text x="400" y="72" text-anchor="middle" fill="#e2e8f0" font-size="33">
      Lighting and Shading 3D
    </text>

    <circle cx="300" cy="240" r="95" fill="url(#litBlue)" class="bob" />
    <circle cx="500" cy="240" r="95" fill="url(#litRed)" class="bob delay" />
  </svg>
</section>

<style>
  .bob {
    animation: bob 2.4s ease-in-out infinite alternate;
  }

  .delay {
    animation-delay: 400ms;
  }

  @keyframes bob {
    from {
      transform: translateY(-8px);
    }

    to {
      transform: translateY(10px);
    }
  }
</style>
