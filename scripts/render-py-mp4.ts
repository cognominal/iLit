import { mkdir, mkdtemp, rename, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { scripts } from '../app/src/lib/feature-sweep/catalog';

type Profile = 'lowres' | 'medres' | 'hires';

type Args = {
  scriptId: string;
  sceneId: string;
  profile: Profile;
};

const SCENE_CLASS_BY_KEY: Record<string, string> = {
  'mobjects_basics:basics_layout': 'MobjectsBasics',
  'transforms_core:core_transform': 'TransformsCore',
  'rate_functions_and_timing:timing_demo': 'RateFunctionsAndTiming',
  'updaters_and_always_redraw:updater_demo': 'UpdatersAndAlwaysRedraw',
  'paths_and_morphs:path_morph': 'PathsAndMorphs',
  'axes_graphs_and_plotting:axes_plot': 'AxesGraphsAndPlotting',
  'text_math_tex:text_math': 'TextMathTex',
  'camera_and_3d:camera_3d': 'CameraAnd3D',
  'lighting_and_shading_3d:lighting_3d': 'LightingAndShading3D',
  'images_svg_and_assets:assets_demo': 'ImagesSvgAndAssets',
  'groups_layers_and_zindex:layering_demo': 'GroupsLayersAndZindex',
  'scene_sections_and_voiceover_hooks:sections_demo':
    'SceneSectionsAndVoiceoverHooks',
  'open_gl_vs_cairo_parity:opengl_parity': 'OpenGLParity',
  'open_gl_vs_cairo_parity:cairo_parity': 'CairoParity',
  'export_profiles:profile_sample': 'ExportProfiles',
  'regression_golden_frames:golden_seed': 'RegressionGoldenFrames',
  'path_to_path_morphing:path_to_path': 'PathToPathMorphing'
};

const QUALITY_FLAG_BY_PROFILE: Record<Profile, string> = {
  lowres: '-ql',
  medres: '-qm',
  hires: '-qh'
};

function parseArgs(argv: string[]): Args {
  let scriptId = '';
  let sceneId = '';
  let profile: Profile = 'medres';

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = argv[i + 1];
    if (arg === '--script' && value) {
      scriptId = value;
      i += 1;
    } else if (arg === '--scene' && value) {
      sceneId = value;
      i += 1;
    } else if (arg === '--profile' && value) {
      if (value === 'lowres' || value === 'medres' || value === 'hires') {
        profile = value;
      } else {
        throw new Error(`Invalid profile: ${value}`);
      }
      i += 1;
    }
  }

  if (!scriptId || !sceneId) {
    throw new Error(
      'Usage: bun run render:py-mp4 --script <id> --scene <id> ' +
      '[--profile lowres|medres|hires]'
    );
  }

  return { scriptId, sceneId, profile };
}

function run(cmd: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      env: process.env
    });
    child.on('exit', (code) => {
      if (code === 0) {
        resolveRun();
        return;
      }
      rejectRun(new Error(`${cmd} exited with code ${code ?? -1}`));
    });
    child.on('error', rejectRun);
  });
}

async function findRenderedMp4(tempMediaDir: string, sceneClass: string):
  Promise<string> {
  const root = join(tempMediaDir, 'videos');
  const candidates: string[] = [];
  // Simple and fast fallback shell find.
  const proc = Bun.spawnSync([
    'find',
    root,
    '-type',
    'f',
    '-name',
    `${sceneClass}.mp4`
  ]);
  if (proc.exitCode !== 0) {
    throw new Error('Unable to locate rendered MP4 in temporary media dir');
  }
  const output = new TextDecoder().decode(proc.stdout).trim();
  if (!output) {
    throw new Error(`No rendered file found for class ${sceneClass}`);
  }
  for (const line of output.split('\n')) {
    if (line.trim()) candidates.push(line.trim());
  }
  if (candidates.length === 0) {
    throw new Error(`No rendered MP4 produced for ${sceneClass}`);
  }
  return candidates[0];
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const script = scripts.find((entry) => entry.id === args.scriptId);
  if (!script) {
    throw new Error(`Unknown script id: ${args.scriptId}`);
  }
  const scene = script.scenes.find((entry) => entry.id === args.sceneId);
  if (!scene) {
    throw new Error(`Unknown scene id for script ${args.scriptId}: ${args.sceneId}`);
  }

  const key = `${args.scriptId}:${args.sceneId}`;
  const sceneClass = SCENE_CLASS_BY_KEY[key];
  if (!sceneClass) {
    throw new Error(`No Python class mapping found for ${key}`);
  }

  const repoRoot = resolve(process.cwd());
  const scriptPath = resolve(repoRoot, script.file);
  if (!existsSync(scriptPath)) {
    throw new Error(`Python scene file not found: ${scriptPath}`);
  }

  const tempMediaDir = await mkdtemp(join(tmpdir(), 'manim-py-render-'));
  const profileFlag = QUALITY_FLAG_BY_PROFILE[args.profile];
  try {
    await run('manim', [
      profileFlag,
      '--media_dir',
      tempMediaDir,
      scriptPath,
      sceneClass
    ], repoRoot);

    const renderedMp4 = await findRenderedMp4(tempMediaDir, sceneClass);
    const targetPath = resolve(
      repoRoot,
      'media',
      'py-mp4',
      args.scriptId,
      args.sceneId,
      `${args.profile}.mp4`
    );
    await mkdir(dirname(targetPath), { recursive: true });
    await rename(renderedMp4, targetPath);
    console.log(`Saved Python MP4: ${targetPath}`);
  } finally {
    await rm(tempMediaDir, { recursive: true, force: true });
  }
}

main().catch((cause) => {
  const message = cause instanceof Error ? cause.message : String(cause);
  console.error(message);
  process.exit(1);
});
