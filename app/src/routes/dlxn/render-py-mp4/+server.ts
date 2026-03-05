import { error, json } from '@sveltejs/kit';
import { basename, dirname, join, resolve } from 'node:path';
import { mkdir, mkdtemp, rename, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import {
  DLXN_PY_SCENE_CLASS,
  DLXN_PY_SCRIPT_PATH,
} from '$lib/dlxn/scenes/dlx3x2ThreeTiles';

type Profile = 'lowres' | 'medres' | 'hires';

function repoRootFromCwd(cwd: string): string {
  return basename(cwd) === 'app' ? resolve(cwd, '..') : cwd;
}

function qualityFlag(profile: Profile): string {
  if (profile === 'lowres') return '-ql';
  if (profile === 'hires') return '-qh';
  return '-qm';
}

function outputPath(repoRoot: string, profile: Profile): string {
  return resolve(repoRoot, 'media', 'py-mp4', 'dlxn', 'dlx_3x2_three_tiles', `${profile}.mp4`);
}

function run(cmd: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      env: process.env,
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

async function findRenderedMp4(tempMediaDir: string): Promise<string> {
  const root = join(tempMediaDir, 'videos');
  const proc = spawnSync('find', [
    root,
    '-type',
    'f',
    '-name',
    `${DLXN_PY_SCENE_CLASS}.mp4`,
  ]);
  if (proc.status !== 0) {
    throw new Error('Unable to locate rendered MP4 in temporary media dir');
  }
  const output = (proc.stdout ?? '').toString().trim();
  if (!output) {
    throw new Error(`No rendered file found for class ${DLXN_PY_SCENE_CLASS}`);
  }
  const [first] = output.split('\n').filter(Boolean);
  if (!first) {
    throw new Error(`No rendered MP4 produced for ${DLXN_PY_SCENE_CLASS}`);
  }
  return first;
}

export async function POST({ request }) {
  const body = await request.json().catch(() => ({}));
  const profile = body.profile as Profile;
  if (!profile || !['lowres', 'medres', 'hires'].includes(profile)) {
    throw error(400, 'Invalid export profile');
  }

  const repoRoot = repoRootFromCwd(process.cwd());
  const pyScript = resolve(repoRoot, DLXN_PY_SCRIPT_PATH);
  const tempMediaDir = await mkdtemp(join(tmpdir(), 'manim-dlxn-render-'));

  try {
    await run(
      'manim',
      [
        qualityFlag(profile),
        '--media_dir',
        tempMediaDir,
        pyScript,
        DLXN_PY_SCENE_CLASS,
      ],
      repoRoot
    );

    const renderedMp4 = await findRenderedMp4(tempMediaDir);
    const targetPath = outputPath(repoRoot, profile);
    await mkdir(dirname(targetPath), { recursive: true });
    await rename(renderedMp4, targetPath);

    const meta = await stat(targetPath);
    return json({
      profile,
      path: targetPath,
      sizeBytes: meta.size,
      mtimeMs: meta.mtimeMs,
    });
  } catch (cause) {
    console.error('dlxn py render failed', cause);
    throw error(500, 'Python MP4 render failed.');
  } finally {
    await rm(tempMediaDir, { recursive: true, force: true });
  }
}
