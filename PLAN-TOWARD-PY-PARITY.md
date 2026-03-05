# PLAN-TOWARD-PY-PARITY

## Goal

Build a new DLX animation pipeline on top of `manim-api.ts` that can
reach parity with existing Python (`.py`) sweep scripts, without
regressing the existing `/dlx` route.

## Constraints

- Keep `/dlx` unchanged.
- Implement new work under `/dlxn`.
- Preserve deterministic scrubbing/playback and testability.

## Step 1: Parallel Route Scaffold (`/dlxn`) [Implement now]

- Add a new `/dlxn` Svelte route.
- Use `manim-api.ts` scene/timeline primitives for DLX preview state.
- Reuse current DLX matrix/board rendering widgets where practical.
- Keep behavior intentionally small and explicit (proof of integration).
- Add top-nav access to `/dlxn`.

Parity status after Step 1:

- No `.py` parity yet.
- Purpose is architectural separation and API validation.

## Step 2: Manim-like DLX Adapter Layer [Done]

- Add a DLX adapter that maps DLX logical events to `manim-api.ts`
  animations (`Create`, `FadeIn`, `FadeOut`, `ReplacementTransform`,
  waits, grouped phases).
- Define stable IDs and metadata to map timeline -> DLX table/board
  highlights.

Parity status after Step 2:

- Timeline semantics begin to align with Python scene structure,
  but visuals/ordering may still differ.
- Implemented in:
  - `app/src/lib/dlxn/adapter.ts`
  - `app/src/routes/dlxn/+page.svelte`

## Step 3: Rendering Parity Primitives [Done]

- Extend API/rendering for DLX needs:
  - path-based objects and transforms
  - grouped animation starts (`play(a, b, c)` semantics)
  - style interpolation and replacement semantics
- Ensure deterministic behavior in seek/time-wrap mode.

Parity status after Step 3:

- Most core animation constructs used by current `.py` sweep scripts
  are representable in TS.
- Implemented in:
  - `app/src/lib/feature-sweep/manim-api.ts`
  - `app/src/lib/dlxn/adapter.ts`
  - `app/src/routes/dlxn/+page.svelte`
- Note:
  - `/dlxn` scene pane now renders from adapter-produced `Scene`
    mobjects/timeline via `TsSceneStage` (no route-local inline SVG
    shape markup).

## Step 4: Script-by-script Port + Comparison Harness [Done]

- For each existing `.py` sweep script:
  - maintain explicit TS counterpart
  - compare timeline markers, durations, and key-frame visuals
- Integrate side-by-side compare support (TS vs `.py` MP4) for each
  scene.

Parity status after Step 4:

- Functional parity for existing scripts, with measurable diffs.
- Implemented baseline harness for DLXn parity target:
  - explicit TS counterpart scene file:
    `app/src/lib/dlxn/scenes/dlx3x2ThreeTiles.ts`
  - side-by-side TS stage and Python MP4 compare panel in `/dlxn`
  - marker coverage and duration delta metrics shown in UI
  - Python MP4 status/render endpoints:
    - `app/src/routes/dlxn/mp4-status/+server.ts`
    - `app/src/routes/dlxn/render-py-mp4/+server.ts`

## Step 5: Parity Gate (Existing + New Scripts) [Done]

- Define parity checks as release gates:
  - animation ordering
  - durations/rates
  - replacement semantics
  - rendering correctness at checkpoints
- Add process for introducing new scripts:
  - add `.py`
  - add TS counterpart
  - pass parity checks before merge.

Parity status after Step 5:

- Project supports parity with existing `.py` sweep scripts and has a
  repeatable path for new scripts.
- Implemented with:
  - automated gate script:
    `app/scripts/check-dlxn-parity.ts`
  - runnable commands:
    - `bun run --cwd app check:parity:dlxn`
    - `bun run check:parity:dlxn`
  - process doc for adding new parity scripts:
    `PARITY-GATE.md`
