# imanin

We want to get to an interactive manim in svelte.
As a litmus test we want to port dlx_3x2_three_tiles.py and do an
interactive imanim presentation about dlx to solve it.

We use the [dlx](https://grokipedia.com/page/Knuth's_Algorithm_X) algorithm to
solve the pentomino [cuboid](https://pentomanim.vercel.app/cuboid-solver) in
[cognominal/pentomanim/webgl](https://github.com/cognominal/pentomanim/tree/master/webgl)

In this repo we don't yet try to get a studio.

## Run from repo root

You can run the app scripts from the repository root:

- `bun run dev` (proxies to `app/`)
- `bun run build`
- `bun run check`
- `bun run test:e2e`

No special install/setup step is needed for the DLX animation route.

## Routes

- `/dlx`: DLX animation route (interactive 2x2 matrix preview).
- `/scenes/<script>/<scene>`: feature-sweep routes covering the broader
  Manim-to-Svelte scene set.

## Plans (chronological)

The implementation plans in this repo, in chronological order:

1. [PLAN.md](PLAN.md)
2. [PLAN-DLX-ANIM.md](PLAN-DLX-ANIM.md)
3. [PLAN-FEATURE-SWEEP.md](PLAN-FEATURE-SWEEP.md)
4. [TIME-WRAP-PLAN.md](TIME-WRAP-PLAN.md)
5. [MP4-PLAN.md](MP4-PLAN.md)
