# Plan: DLX Animation Track

## Scope

This file contains only DLX animation requirements.
Generic Manim emulation is in `PLAN.md`.

## Goal

Replicate the behavior and look of the source animation in:

- `/Users/cog/mine/pentomanim/manim/dlx_3x2_three_tiles.py`

## Current Implementation Snapshot

- 2x2 preview scene exists as first slice.
- Matrix is rendered as SVG (not HTML table).
- Step data is driven by `Scene.timeline` metadata.
- Playwright behavior + visual baseline are in place.

## DLX-Specific Milestones

1. Keep `2x2` as deterministic harness fixture.
2. Add shared DLX model for rows/columns/placements.
3. Add preview phase parity with row highlighting.
4. Add search phase parity (`choose`, `cover`, `uncover`).
5. Port 3x2 three-tile fixture and validate sequence parity.

## TS Control Surface Spec (DLX App)

Transport controls are app-facing and test-facing; they are not Python Manim
API parity features, but they are required for deterministic debugging.

### Controls

- `Prev`: move to previous step by current granularity.
- `Play/Pause`: auto-advance with configured tick duration.
- `Next`: move to next step by current granularity.
- `Reset`: move to initial step and pause.

### Granularity

- `animation` (default): one `Scene.timeline` entry per step.
- `phase`: jump to next/previous step with different `meta.phase`.
- `frame` (future): sub-step interpolation frame index.

### Determinism Rules

- In test mode, autoplay is off by default.
- `Next`/`Prev` are pure deterministic transitions.
- Wrap behavior is explicit and test-covered.
- Each step has stable labels and test IDs.

## Test Plan (DLX Track)

Behavior tests:

- Idle state and first transition.
- Preview row order and active cells/columns.
- Control semantics for `Prev/Play/Next/Reset`.
- Phase jump semantics after search phase is added.

Visual tests:

- Idle matrix snapshot.
- Representative preview step snapshot.
- Representative search step snapshot.

## Immediate Next Actions

1. Add `meta.phase` to scene entries and implement phase granularity.
2. Move interval/transport logic into shared `core/timeline.ts`.
3. Add search-phase fixture for 2x2 harness before 3x2 scale-up.
