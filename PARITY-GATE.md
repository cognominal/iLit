# DLXn Parity Gate

This gate must pass before merge when touching DLXn parity work.

## Command

```bash
bun run check:parity:dlxn
```

## What It Enforces

- Animation ordering markers:
  - TS marker set must cover the Python marker set.
- Duration parity:
  - TS total duration must stay within a tolerance window from Python.
- Replacement semantics:
  - `ReplacementTransform` must preserve source/target linkage and
    phase-duration accounting.
- Rendering checkpoints:
  - Required labeled checkpoints must exist in the TS timeline.

## Adding A New Parity Script

1. Add Python scene file (`.py`) and class.
2. Add explicit TS counterpart scene file under
   `app/src/lib/dlxn/scenes/`.
3. Expose parity metadata:
   - Python script path/class
   - expected duration target
   - marker labels
4. Wire the new scene through adapter/route selection.
5. Validate:
   - `bun run check`
   - `bun run test:e2e`
   - `bun run check:parity:dlxn`
6. Keep parity report output in CI logs; do not commit generated media.
