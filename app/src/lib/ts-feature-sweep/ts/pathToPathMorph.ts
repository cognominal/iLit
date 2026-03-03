import {
  Create,
  Path,
  ReplacementTransform,
  Scene,
  TitleText
} from '$lib/feature-sweep/manim-api';

export function buildPathToPathMorphScene(): Scene {
  const scene = new Scene(900);
  const title = TitleText('title', {
    x: 400,
    y: 74,
    value: 'Path to Path Morph',
    fontSize: 40
  });

  const zig = Path('zig_path', {
    stroke: '#4CC9F0',
    strokeWidth: 7,
    points: [
      { x: 220, y: 300 },
      { x: 300, y: 190 },
      { x: 380, y: 320 },
      { x: 460, y: 190 },
      { x: 540, y: 300 }
    ],
    closed: false
  });

  const loop = Path('loop_path', {
    stroke: '#F72585',
    strokeWidth: 7,
    points: [
      { x: 230, y: 260 },
      { x: 320, y: 180 },
      { x: 430, y: 180 },
      { x: 530, y: 260 },
      { x: 430, y: 340 },
      { x: 320, y: 340 }
    ],
    closed: true
  });

  scene.add(title, zig, loop);
  scene.play(Create(title));
  scene.play(Create(zig));
  scene.play(ReplacementTransform(zig, loop, { runTimeMs: 1300 }));
  return scene;
}
