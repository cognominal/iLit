import {
  phaseIndexAtTime,
  type Animation,
  type ScenePhase,
} from '$lib/feature-sweep/manim-api';
import {
  activeCellsFromRow,
  activeColumnsFromRow,
  type Cell,
  type Column,
  type RowDef,
} from '$lib/dlx';
import {
  DLXN_PARITY_EXPECTED_PY_DURATION_SEC,
  DLXN_PARITY_MARKERS_PY,
  DLXN_PARITY_MARKERS_TS,
  DLXN_PY_SCENE_CLASS,
  DLXN_PY_SCRIPT_PATH,
  buildDlxnThreeTilesScene,
} from '$lib/dlxn/scenes/dlx3x2ThreeTiles';

type DlxnStep = {
  index: number;
  animation: Animation;
  rowName?: string;
  label: string;
  note: string;
};

type BuildDlxnPreviewArgs = {
  rows: RowDef[];
  stepDurationSec?: number;
  idleDurationSec?: number;
};

type DlxnPreview = {
  scene: import('$lib/feature-sweep/manim-api').Scene;
  phases: ScenePhase[];
  durationSec: number;
  rowByName: Map<string, RowDef>;
  steps: DlxnStep[];
  parity: {
    pyScriptPath: string;
    pySceneClass: string;
    pyExpectedDurationSec: number;
    tsMarkers: readonly string[];
    pyMarkers: readonly string[];
  };
};

function stepForAnimation(animation: Animation, index: number): DlxnStep {
  const rowName =
    typeof animation.meta?.rowName === 'string'
      ? animation.meta.rowName
      : undefined;
  const label =
    typeof animation.meta?.label === 'string'
      ? animation.meta.label
      : rowName
        ? `Preview ${rowName}`
        : 'Idle';
  const note =
    typeof animation.meta?.note === 'string'
      ? animation.meta.note
      : rowName
        ? `Active row ${rowName}`
        : 'Initial wait';

  return { index, animation, rowName, label, note };
}

export function buildDlxnPreview({
  rows,
  stepDurationSec = 0.42,
  idleDurationSec = 0.4,
}: BuildDlxnPreviewArgs): DlxnPreview {
  const built = buildDlxnThreeTilesScene(rows, stepDurationSec, idleDurationSec);
  const { scene, rowByName, phases, durationSec } = built;
  const steps = phases.map((phase, index) =>
    stepForAnimation(phase.animations[0], index)
  );

  return {
    scene,
    phases,
    durationSec,
    rowByName,
    steps,
    parity: {
      pyScriptPath: DLXN_PY_SCRIPT_PATH,
      pySceneClass: DLXN_PY_SCENE_CLASS,
      pyExpectedDurationSec: DLXN_PARITY_EXPECTED_PY_DURATION_SEC,
      tsMarkers: DLXN_PARITY_MARKERS_TS,
      pyMarkers: DLXN_PARITY_MARKERS_PY,
    },
  };
}

export function stepIndexAtTime(preview: DlxnPreview, timeSec: number): number {
  return phaseIndexAtTime(preview.scene, timeSec);
}

export function activeColumnsForStep(
  step: DlxnStep | undefined,
  rowByName: Map<string, RowDef>
): Set<Column> {
  if (!step?.rowName) return new Set<Column>();
  const row = rowByName.get(step.rowName);
  return activeColumnsFromRow(row);
}

export function activeCellsForStep(
  step: DlxnStep | undefined,
  rowByName: Map<string, RowDef>
): Set<Cell> {
  if (!step?.rowName) return new Set<Cell>();
  const row = rowByName.get(step.rowName);
  return activeCellsFromRow(row);
}

export type { DlxnPreview, DlxnStep };
