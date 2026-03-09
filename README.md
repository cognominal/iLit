# imanim

iManim intends to be a sveltekit app for
interactive programmatic animations
of programs. Compare with the definition of manim :
Manim is a Python library for creating precise, programmatic animations
of mathematical concepts.

Think of imanim as a program interactive literate notebooks.
To bootstrap it the focus has been on the [ts feature sweep UI]
(<https://sv5-manim.vercel.app/ts-sweep>) which wil be made less conspicuous on
the chrome.
[ts-sweep](backburner/iterative-ts-sweep.md) was designing that UI to get a
anim engine in parity with the original python one. Moving TeX SVF and 3D is not
there yet.

iManim is currently available in a read only form at
<https://sv5-manim.vercel.app/>

We shove in [backburner](backburner) stuff which seems architecturally stable.

## Manim

We currently define iManim by difference with Manim. So let us state what is
manim.

Manim is a Python library for creating precise, programmatic animations
of mathematical concepts.
These animation are visible on the
[3Blue1Brown](https://www.youtube.com/@3blue1brown) youtube channnel.
The site for the community edition is [manim.community](https://www.manim).community/

We want to get to an interactive manim in svelte so that means using ts instead
of Python.
The idea is to support an API akin to the manim one, but in ts instead of
python.

## Next steps

Necessary to create a notebook system with notebooks stored on github.

- Build a login system
- Making it a tauri-app.
- hosting the app somewhere once we got a minimal tauri app.
- this implies choosing a long lasting name of the app : iLit ?

For the first two items see[PLAN-TAURI-AUTH](PLAN-TAURI-AUTH.md)

## notebook system

Stage : TBD

We want a notebook system where nodes are versioned.
Nodes can depend on each other.
Manim goal is to generate .mp4 videos in virtual screens
of fixed size, we want to interact with scenes
in svelte component.
So we want to adapt the API to a new context.

## Adaptive strategy

I had  zero knowledge of manim and very little of python. So I blindly
relied in codex to start with.
Also I explore(d) what is possible with gpt.
Now I am trying to get some control and
agency because I don't want to blindly replicate a `.py` in `.ps` but
adapt it to the sveltkit context.

In this repo we don't yet try to get a studio.

## A "real" imanim script

We want to use the Knuth's dancing link example as a litmus test for our ilit
notebook. The current animation is  [dancing links](http://localhost:5173/ts-scenes/doubly_linked_list_deletion/dll_delete)
and [doubly-linked-list.ts](misc/doubly-linked-list.ts
will be the documented script.

### oldy (we will repurpose it)

As a litmus test we want to port [dlx_3x2_three_tiles.py](misc/dlx_3x2_three_tiles.py)
and do an
interactive imanim presentation about dlx to solve it.

We use the [dlx](https://grokipedia.com/page/Knuth's_Algorithm_X) algorithm to
solve the pentomino [cuboid](https://pentomanim.vercel.app/cuboid-solver) in
[cognominal/pentomanim/webgl](https://github.com/cognominal/pentomanim/tree/master/webgl)

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

The historical implementation plans in this repo, in chronological order:

1. [PLAN.md](PLAN.md)
2. [PLAN-DLX-ANIM.md](PLAN-DLX-ANIM.md)
3. [PLAN-FEATURE-SWEEP.md](PLAN-FEATURE-SWEEP.md)
4. [TIME-WRAP-PLAN.md](TIME-WRAP-PLAN.md)
5. [MP4-PLAN.md](MP4-PLAN.md)
6. [PLAN-SVELTE-COMPONENT-MANIM-API.md](PLAN-SVELTE-COMPONENT-MANIM-API.md)

`PLAN-SVELTE-COMPONENT-MANIM-API.md` is an early draft for making the
Manim-like API and Svelte renderer responsive while preserving aspect
ratio.
