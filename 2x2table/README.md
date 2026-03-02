# Interactive Manim

## 2x2 Table (Svelte 5 + TypeScript + SVG)


This is the first piecemeal step in porting:

- Source reference: `/Users/cog/mine/pentomanim/manim/dlx_3x2_three_tiles.py`
- Target stack: modern **Svelte 5**, **TypeScript**, **SVG animation**

For this first slice, the app intentionally focuses on a single core mechanic:

- render a small exact-cover-like board representation
- animate cell filling over discrete timeline steps
- expose simple timeline controls (play/pause/step/reset)

## What is implemented

- A standalone Svelte 5 app under `2x2table/`
- An SVG board with 4 addressable cells:
  - `r0c0`, `r0c1`, `r1c0`, `r1c1`
- A step timeline (`Start` -> `Step 4`) that progressively fills the grid
- Highlighting for the currently focused cell per step
- Controls to inspect animation states manually

This maps to the early visualization behavior in the Manim scene
(state transitions and focused coverage) while keeping scope
intentionally minimal.

## Project structure

- `index.html`: Vite entry HTML
- `vite.config.ts`: Svelte plugin setup
- `tsconfig.json`: strict TS setup for Svelte
- `src/main.ts`: mounts the Svelte app
- `src/App.svelte`: animation model + SVG rendering + controls
- `src/app.css`: layout and animation styling

## Run locally

From `/Users/cog/mine/dlx_sv/2x2table`:

```bash
bun install
bun run dev
```

Then open the local Vite URL shown in your terminal.

### Optional scripts

```bash
bun run check
bun run build
bun run preview
```

## Animation model

`App.svelte` defines a small step array:

- each step declares which cells are filled
- an optional `focus` cell is highlighted
- a short `note` explains the state

Autoplay advances one step every `700ms` and wraps around.

## Why this first slice exists

The original Manim file combines many concerns:

- matrix table construction
- board drawing
- picker rendering
- row preview and search-phase logic
- Algorithm X / DLX state transitions

Porting all of that at once to Svelte/TS/SVG would make debugging
harder. This 2x2 app isolates the animation primitives we will reuse
later:

- discrete state timeline
- deterministic render from state
- visual focus and coverage cues
- interactive stepping

## Next incremental steps

Suggested progression from here:

1. Promote hardcoded steps into typed data modules (rows/columns/placements).
2. Replace simple fill timeline with row-based placements
   (piece + covered cells).
3. Add a left-side matrix panel synchronized with board highlights.
4. Introduce a minimal Algorithm X stepper
   (choose column, choose row, cover/uncover).
5. Scale from 2x2 to the 3x2/three-tile problem from the Manim source.

## Notes

- This app is intentionally small and not yet a full DLX implementation.
- The code is written to be a clean base for the next increments.
