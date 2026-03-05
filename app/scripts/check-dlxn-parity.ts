import {
  Circle,
  Path,
  ReplacementTransform,
  Scene,
  Square,
  Wait,
  sceneDurationSec,
  scenePhases,
} from '../src/lib/feature-sweep/manim-api';
import { buildDlxnPreview } from '../src/lib/dlxn/adapter';
import {
  threeByTwoThreeTilesRows,
} from '../src/lib/dlx/fixtures/threeByTwoThreeTiles';

type Check = {
  name: string;
  ok: boolean;
  details: string;
};

function markerCoverageCheck(): Check {
  const preview = buildDlxnPreview({ rows: threeByTwoThreeTilesRows });
  const py = new Set(preview.parity.pyMarkers);
  const ts = new Set(preview.parity.tsMarkers);
  let matched = 0;
  for (const marker of py) {
    if (ts.has(marker)) matched += 1;
  }
  const ok = matched === py.size;
  return {
    name: 'animation-ordering-markers',
    ok,
    details: `${matched}/${py.size} markers matched`,
  };
}

function durationCheck(): Check {
  const preview = buildDlxnPreview({ rows: threeByTwoThreeTilesRows });
  const delta = Math.abs(preview.durationSec - preview.parity.pyExpectedDurationSec);
  const toleranceSec = 4;
  const ok = delta <= toleranceSec;
  return {
    name: 'duration-parity',
    ok,
    details:
      `ts=${preview.durationSec} py=${preview.parity.pyExpectedDurationSec} ` +
      `delta=${delta} tolerance=${toleranceSec}`,
  };
}

function replacementSemanticsCheck(): Check {
  const scene = new Scene(0.7);
  const a = Square('from', {
    x: 200,
    y: 220,
    size: 90,
    stroke: '#38bdf8',
  });
  const b = Circle('to', {
    x: 200,
    y: 220,
    radius: 45,
    stroke: '#f472b6',
  });
  const p = Path('path', {
    points: [
      { x: 320, y: 200 },
      { x: 380, y: 250 },
      { x: 340, y: 320 },
    ],
    stroke: '#a3e635',
    closed: true,
  });
  scene.add(a, b, p);
  scene.play(ReplacementTransform(a, b, { runTime: 0.9 }));
  scene.play(Wait(0.2));

  const phases = scenePhases(scene);
  const rt = scene.timeline.find((step) => step.kind === 'replacementTransform');
  const ok = Boolean(
    rt &&
    rt.sourceId === 'from' &&
    rt.targetId === 'to' &&
    phases.length === 2 &&
    sceneDurationSec(scene) === 1.1
  );
  return {
    name: 'replacement-semantics',
    ok,
    details: rt
      ? `phaseCount=${phases.length} duration=${sceneDurationSec(scene)}`
      : 'no replacementTransform produced',
  };
}

function checkpointCheck(): Check {
  const preview = buildDlxnPreview({ rows: threeByTwoThreeTilesRows });
  const steps = preview.steps;
  const checkpoints = [
    steps.find((step) => step.label === 'intro'),
    steps.find((step) => step.label === 'matrix-create'),
    steps.find((step) => step.label === 'row-preview-phase'),
    steps.find((step) => step.label === 'search-phase' && step.rowName),
    steps.find((step) => step.label === 'done'),
  ];
  const ok = checkpoints.every(Boolean);
  return {
    name: 'render-checkpoints',
    ok,
    details: `found ${checkpoints.filter(Boolean).length}/5 checkpoints`,
  };
}

function run(): number {
  const checks: Check[] = [
    markerCoverageCheck(),
    durationCheck(),
    replacementSemanticsCheck(),
    checkpointCheck(),
  ];

  let failed = 0;
  for (const check of checks) {
    const state = check.ok ? 'PASS' : 'FAIL';
    console.log(`[${state}] ${check.name}: ${check.details}`);
    if (!check.ok) failed += 1;
  }

  if (failed > 0) {
    console.error(`Parity gate failed: ${failed} checks failing.`);
    return 1;
  }
  console.log('Parity gate passed.');
  return 0;
}

process.exit(run());
