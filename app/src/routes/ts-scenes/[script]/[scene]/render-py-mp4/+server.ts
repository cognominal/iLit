import { error, json } from '@sveltejs/kit';
import { basename, resolve } from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { stat } from 'node:fs/promises';
import { findTsScene, findTsScript } from '$lib/ts-feature-sweep/catalog';
import type { RequestHandler } from './$types';

const execFileAsync = promisify(execFile);

type Profile = 'lowres' | 'medres' | 'hires';

function repoRootFromCwd(cwd: string): string {
  return basename(cwd) === 'app' ? resolve(cwd, '..') : cwd;
}

function outputPath(
  repoRoot: string,
  scriptId: string,
  sceneId: string,
  profile: Profile
): string {
  return resolve(repoRoot, 'media', 'py-mp4', scriptId, sceneId, `${profile}.mp4`);
}

export const POST: RequestHandler = async ({ params, request }) => {
  if (process.env.VERCEL === '1') {
    throw error(403, 'MP4 generation is disabled on read-only deployments.');
  }

  const script = findTsScript(params.script);
  const scene = findTsScene(params.script, params.scene);
  if (!script || !scene) {
    throw error(404, 'Unknown TS script/scene');
  }

  const body = await request.json().catch(() => ({}));
  const profile = body.profile as Profile;
  if (!profile || !['lowres', 'medres', 'hires'].includes(profile)) {
    throw error(400, 'Invalid export profile');
  }

  const repoRoot = repoRootFromCwd(process.cwd());
  try {
    await execFileAsync(
      'bun',
      [
        'run',
        'render:py-mp4',
        '--script',
        params.script,
        '--scene',
        params.scene,
        '--profile',
        profile
      ],
      { cwd: repoRoot }
    );
  } catch (cause) {
    console.error('py mp4 export failed', cause);
    throw error(500, 'Python MP4 export failed.');
  }

  const path = outputPath(repoRoot, params.script, params.scene, profile);
  const meta = await stat(path);
  return json({
    path,
    profile,
    sizeBytes: meta.size,
    mtimeMs: meta.mtimeMs
  });
};
