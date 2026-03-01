# Time-Wrap Implementation Plan (Adapted for `dlx_sv`)

## Reformulation

Add a new SvelteKit route in `app/` named `time-wrap` that demonstrates a
single animation engine with two modes:

- `normal`: real-time playback updates animation and slider.
- `time-wrap`: slider input seeks instantly to target time `t`.

Key requirement: one shared timeline/evaluator logic for both modes.

## Current Context in This Repo

- Main web app is `app/` (SvelteKit + Svelte 5 + TypeScript + Tailwind).
- Existing route system already exists (`/` and `/scenes/[script]/[scene]`).
- Shared scene ideas live in `app/src/lib/feature-sweep/`.
- We already use runes and event attributes in current app code.

## Goals

- Add route: `/time-wrap`.
- Add controls:
  - mode toggle (`normal` / `time-wrap`)
  - play/pause
  - slider for current time
  - reset
- Guarantee deterministic state derivation via one evaluator `evaluateAt(t)`.
- Keep controls stable in layout (no UI shift).

## Non-Goals

- Global timeline editor.
- Audio sync.
- Full scene authoring UX.

## Proposed Design

### 1) Route

Add route files:

- `app/src/routes/time-wrap/+page.svelte`

Optionally split UI into reusable component:

- `app/src/lib/feature-sweep/scenes/TimeWrapDemo.svelte`

### 2) Shared Timeline Core (App-Level)

Create lightweight core module:

- `app/src/lib/feature-sweep/time-wrap/core.ts`

API sketch:

- `clampTime(t, duration)`
- `evaluateAt(t)` -> derived animation state (x, y, scale, opacity, etc.)
- `advance(t, dt, duration)` for normal playback

Both modes consume this same core.

Status:

- Implemented with reusable primitive in
  `app/src/lib/feature-sweep/core/timeline-controller.ts`.
- Route-level handlers dispatch generic commands; policy no longer lives in UI.

### 3) Mode Semantics

- Entering `time-wrap` pauses playback.
- In `time-wrap`, slider input sets `currentTime` immediately.
- Returning to `normal` keeps `currentTime`; user can press play.
- `reset` sets `currentTime = 0` and pauses.

Implemented primitive policy:

- `seek` command forces `time-wrap` and pauses.
- `prev` / `next` / `playPause` / `reset` commands force `normal`.

### 4) TS-Specific Transport Spec

Controls use explicit granularity:

- `prev` / `next` default granularity: `frame-step` (fixed ms step)
- optional granularity: `keyframe-step` (jump keyframe boundaries)

For this first route version, implement `frame-step` only.

## Implementation Steps

1. Add `/time-wrap` route component.
2. Implement timeline core in `time-wrap/core.ts`.
3. Wire controls to one source of truth: `currentTime`.
4. Render demo SVG from `evaluateAt(currentTime)`.
5. Add fixed-width control labels and values to prevent layout shift.
6. Add small route link from home page for discoverability.
7. Run checks/build and fix until warning-free.

## Validation Plan

Manual:

- `/time-wrap` loads and shows animated scene.
- In `normal`, playback advances and slider tracks time.
- In `time-wrap`, slider seeks instantly with no real-time drift.
- Toggling modes repeatedly preserves stable state.
- Reset behavior is deterministic.

Commands:

- `bun run --cwd app check`
- `bun run --cwd app build`

## Risks and Mitigations

- RAF race on mode changes.
  - Mitigation: cancel RAF on mode switch and gate by `isPlaying`.
- Slider/playback drift.
  - Mitigation: single `currentTime` source + derived evaluator only.
- Layout jitter from changing labels.
  - Mitigation: reserve fixed control/value widths.

## Deliverables

- New route: `/time-wrap`.
- Time-wrap demo component and timeline core module.
- Shared evaluator used for both normal and seek modes.
- Passing `check` and `build` in `app/`.
