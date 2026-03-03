# Plan: TS-Based Feature Sweep

## Goal

Add a TypeScript-authored scene sweep alongside the existing Svelte scene
ports. Scene logic should live in `.ts` files using the local Manim-like API.

## Scope

- Add a top-bar button labeled `ts sweep`.
- Add a pane route at `/ts-sweep`.
- Add TS scene routes at `/ts-scenes/[script]/[scene]`.
- Keep current `/scenes/...` routes intact.

## Data Model

Create a dedicated TS sweep catalog:

- `app/src/lib/ts-feature-sweep/catalog.ts`
- Typed entries:
  - `TsScriptEntry`: `id`, `title`, `source`, `scenes[]`
  - `TsSceneEntry`: `id`, `title`, `description`

The initial catalog includes:

- `mobjects_basics` / `basics_layout`

## Scene Source Contract

Each TS scene module exports a builder function that returns a `Scene` from:

- `app/src/lib/feature-sweep/manim-api.ts`

Example shape:

- `buildMobjectsBasicsScene(): Scene`

## Route Rendering Contract

Create a TS scene registry:

- `app/src/lib/ts-feature-sweep/registry.ts`

Map `(scriptId, sceneId)` to a scene-builder function. The route resolves the
builder and renders via a generic SVG renderer, not scene-specific `.svelte`
ports.

## UI/UX

- `/ts-sweep` shows available TS routes and short guidance.
- `/ts-scenes/[script]/[scene]` shows:
  - script/scene metadata
  - a timeline slider
  - a generic SVG stage derived from TS scene state

## Validation

From repo root:

- `bun run check`
- `bun run test:e2e` (if unchanged tests are present)

No warnings allowed.

## Non-Goals

- No `.py -> .ts` transpiler in this slice.
- No replacement of current feature-sweep Svelte scene ports.
