# MP4 Export Plan

## Goal

Add route-level controls in `app/` for exporting scene MP4s from the
TypeScript/Svelte scene renderer.

Buttons:

- `lowres`
- `medres`
- `hires`

## Scope

1. Add three export buttons to
   `app/src/routes/scenes/[script]/[scene]/+page.svelte`.
2. Add a server endpoint under the scene route that:
   - validates script/scene ids from catalog
   - records the route in headless Chromium at selected profile size
   - transcodes to `.mp4` with `ffmpeg`
   - returns the absolute output MP4 path
3. Capture scene-only output using `?capture=1` mode:
   - hide header and route controls
   - render only scene content in export capture
4. Show MP4 feedback pane with:
   - MP4 metadata from `ffprobe`
   - compact thumbnail on the right side of the report pane
   - file-path copy button (icon button)
   - working `Open folder` button
   - top-right `x` dismiss button
   - dismiss on any other click/touch interaction outside the pane
5. Do not auto-copy path on export; path copy is explicit via report button.
6. Do not show export status line in the route UI.

## Quality mapping

- `lowres`: 854x480 @ 15 fps
- `medres`: 1280x720 @ 30 fps
- `hires`: 1920x1080 @ 60 fps

## Output location

Write media to a deterministic folder in the repo root:

- `media/ts-mp4/<script>/<scene>/<profile>.mp4`

Return the absolute path to the client.

## Validation

1. Run `bun run check` in `app/`.
2. Run `bun run test:e2e` in `app/`.
