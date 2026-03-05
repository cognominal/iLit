import {
  Create,
  FadeOut,
  Scene,
  Square,
  TitleText,
  Wait,
  sceneDurationSec,
  scenePhases,
  type ScenePhase,
} from '$lib/feature-sweep/manim-api';
import { buildRowMap, type RowDef } from '$lib/dlx';

export const DLXN_PY_SCRIPT_PATH = 'dlx_3x2_three_tiles.py';
export const DLXN_PY_SCENE_CLASS = 'DLXBoard3x2ThreeTiles';

export const DLXN_PARITY_MARKERS_PY = [
  'intro',
  'matrix-create',
  'row-preview-phase',
  'search-phase',
  'done',
] as const;

export const DLXN_PARITY_MARKERS_TS = [
  'intro',
  'matrix-create',
  'row-preview-phase',
  'search-phase',
  'done',
] as const;

export const DLXN_PARITY_EXPECTED_PY_DURATION_SEC = 20;

export type DlxnSceneBuild = {
  scene: Scene;
  rowByName: Map<string, RowDef>;
  phases: ScenePhase[];
  durationSec: number;
};

export function buildDlxnThreeTilesScene(
  rows: RowDef[],
  stepDurationSec = 0.42,
  idleDurationSec = 0.4
): DlxnSceneBuild {
  const scene = new Scene(stepDurationSec);
  const rowByName = buildRowMap(rows);
  const title = TitleText('dlxn-title', {
    x: 400,
    y: 78,
    value: 'DLX 3x2 Three Tiles',
    fontSize: 38,
  });
  const subtitle = TitleText('dlxn-subtitle', {
    x: 400,
    y: 126,
    value: 'TS counterpart for dlx_3x2_three_tiles.py',
    fontSize: 23,
    fill: '#94a3b8',
  });
  const cellSquares: Record<string, ReturnType<typeof Square>> = {
    c00: Square('cell-c00', { x: 260, y: 226, size: 70, stroke: '#334155' }),
    c01: Square('cell-c01', { x: 345, y: 226, size: 70, stroke: '#334155' }),
    c10: Square('cell-c10', { x: 260, y: 311, size: 70, stroke: '#334155' }),
    c11: Square('cell-c11', { x: 345, y: 311, size: 70, stroke: '#334155' }),
    c20: Square('cell-c20', { x: 260, y: 396, size: 70, stroke: '#334155' }),
    c21: Square('cell-c21', { x: 345, y: 396, size: 70, stroke: '#334155' }),
  } as const;
  const cellLabels: Record<string, ReturnType<typeof TitleText>> = {
    c00: TitleText('label-c00', { x: 260, y: 231, value: 'c00', fontSize: 18 }),
    c01: TitleText('label-c01', { x: 345, y: 231, value: 'c01', fontSize: 18 }),
    c10: TitleText('label-c10', { x: 260, y: 316, value: 'c10', fontSize: 18 }),
    c11: TitleText('label-c11', { x: 345, y: 316, value: 'c11', fontSize: 18 }),
    c20: TitleText('label-c20', { x: 260, y: 401, value: 'c20', fontSize: 18 }),
    c21: TitleText('label-c21', { x: 345, y: 401, value: 'c21', fontSize: 18 }),
  } as const;

  scene.add(title, subtitle, ...Object.values(cellSquares), ...Object.values(cellLabels));
  scene.play({
    ...Create(title, { runTime: 0.6 }),
    meta: { label: 'intro', note: 'Title intro' },
  });
  scene.play({
    ...Create(subtitle, { runTime: 0.6 }),
    meta: { label: 'matrix-create', note: 'Subtitle intro' },
  });
  scene.play(
    ...Object.values(cellSquares).map((cell) =>
      Create(cell, { runTime: 0.7 })
    ),
    ...Object.values(cellLabels).map((label) =>
      Create(label, { runTime: 0.7 })
    )
  );

  scene.play({
    ...Wait(idleDurationSec),
    meta: {
      label: 'row-preview-phase',
      note: 'Preview phase: rows are shown one by one.',
    },
  });

  for (const row of rows) {
    const stroke =
      row.piece === 'M' ? '#38bdf8' :
      row.piece === 'D' ? '#fb923c' :
      row.piece === 'L' ? '#a3e635' :
      '#f472b6';
    const markers = row.cells
      .map((cell) => {
        const ref = cellSquares[cell];
        if (!ref) return null;
        const marker = Square(`row-${row.name}-${cell}`, {
          x: ref.x ?? 0,
          y: ref.y ?? 0,
          size: 74,
          stroke,
          strokeWidth: 8,
        });
        return marker;
      })
      .filter((item): item is ReturnType<typeof Square> => item !== null);
    if (markers.length === 0) continue;

    scene.add(...markers);
    scene.play({
      ...Create(markers[0], { runTime: stepDurationSec }),
      meta: {
        rowName: row.name,
        label: 'search-phase',
        note: `Active row ${row.name}: ${row.piece} + ${row.cells.join(', ')}`,
      },
    });
    if (markers.length > 1) {
      scene.play(
        ...markers.slice(1).map((marker) =>
          Create(marker, { runTime: stepDurationSec * 0.9 })
        )
      );
    }
    scene.play(
      ...markers.map((marker) =>
        FadeOut(marker, { runTime: stepDurationSec * 0.35 })
      )
    );
  }

  scene.play({
    ...Wait(0.5),
    meta: { label: 'done', note: 'End of preview/search loop.' },
  });

  const phases = scenePhases(scene);
  return {
    scene,
    rowByName,
    phases,
    durationSec: sceneDurationSec(scene),
  };
}
