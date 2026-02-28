# Plan: Generic Manim-to-TS/Svelte Emulation

## Scope

This file covers generic Manim-like emulation in TypeScript + Svelte + SVG.
DLX animation specifics live in `PLAN-DLX-ANIM.md`.

## Goals

- Provide a user-facing API close to Manim CE.
- Render scenes in SVG via reusable shared components.
- Keep deterministic timeline execution for testability.
- Validate behavior and visuals with Playwright.

## Architecture

```text
src/
  lib/
    manim.ts
    core/
      scene.ts
      timeline.ts
      scheduler.ts
      transitions.ts
    renderers/svg/
      SceneRoot.svelte
      SceneSvg.svelte
      RectNode.svelte
      TextNode.svelte
      GroupNode.svelte
    theme/
      tokens.css
      base.css
      manim-dark.css
```

## User-Facing API (Generic)

- Scene objects: `Scene`, `Rect`, `Text`, `VGroup`
- Commands: `Create`, `FadeIn`, `Transform`
- Controls: `play(...)`, `wait(...)`
- Layout transforms: `scale`, `toEdge`, `nextTo`, `setColor`

## TS-Specific Runtime (Not in Python Manim)

- Strong compile-time typing for scene metadata and timeline entries.
- Deterministic clock hooks for e2e tests.
- URL/env test mode toggles for deterministic playback.
- UI transport controls for dev/test: `Prev`, `Play`, `Next`, `Reset`.
- Granularity modes for transport controls:
  - `animation`: one timeline entry per step (default)
  - `phase`: jump between labeled phase boundaries
  - `frame`: reserved for fine frame stepping (future)

## Work Phases

1. Finalize `manim.ts` facade and typed timeline entry model.
2. Implement shared `core/timeline.ts` controller.
3. Implement `SceneRoot` + primitive SVG node renderers.
4. Add transform interpolation and easing support.
5. Add generic Playwright behavior + visual baseline tests.

## Features Not Exercised By DLX Anim (Still Required)

- 3D camera model, lights, and depth ordering.
- Path morphing beyond rectangular/table primitives.
- Updaters, always-redraw patterns, and continuous dependencies.
- Advanced text/TeX layout parity.
- OpenGL/shader-based effects and blend modes.
- Audio sync and multi-track timeline features.
- CLI/renderer config parity (quality presets, codecs, caching).
- Plugin extension points and scene discovery.

## Regression Strategy Baseline (Inspired by Manim CE)

Use a layered test model similar to Manim CE:

- Unit tests for scene/timeline primitives.
- Graphical snapshot tests for stable rendered states.
- Rendering pipeline tests for export metadata and config.

Reference material:

- Manim CE testing guide:
  https://docs.manim.community/en/stable/contributing/testing.html
- Manim CE repository root:
  https://github.com/ManimCommunity/manim

## Current Status

- Shared theme extraction: done.
- Shared SVG matrix renderer: done.
- Scene timeline view (`SceneSvg`): done.
- Full generic scene graph renderer stack: in progress.
