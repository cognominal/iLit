import { json } from '@sveltejs/kit';
import { basename, resolve } from 'node:path';
import { stat } from 'node:fs/promises';
import { DLXN_PY_SCRIPT_PATH } from '$lib/dlxn/scenes/dlx3x2ThreeTiles';
import type { RequestHandler } from './$types';

type Profile = 'lowres' | 'medres' | 'hires';

function repoRootFromCwd(cwd: string): string {
  return basename(cwd) === 'app' ? resolve(cwd, '..') : cwd;
}

function pyMp4Path(repoRoot: string, profile: Profile): string {
  return resolve(repoRoot, 'media', 'py-mp4', 'dlxn', 'dlx_3x2_three_tiles', `${profile}.mp4`);
}

function tsSourcePath(repoRoot: string): string {
  return resolve(repoRoot, 'app', 'src', 'lib', 'dlxn', 'scenes', 'dlx3x2ThreeTiles.ts');
}

function pySourcePath(repoRoot: string): string {
  return resolve(repoRoot, DLXN_PY_SCRIPT_PATH);
}

async function safeMtimeMs(path: string): Promise<number | null> {
  try {
    return (await stat(path)).mtimeMs;
  } catch {
    return null;
  }
}

export const GET: RequestHandler = async ({ url }) => {
  const profileRaw = (url.searchParams.get('profile') ?? 'medres').trim();
  const profile: Profile =
    profileRaw === 'lowres' || profileRaw === 'hires' ? profileRaw : 'medres';

  const repoRoot = repoRootFromCwd(process.cwd());
  const pyMp4 = pyMp4Path(repoRoot, profile);
  const mp4MtimeMs = await safeMtimeMs(pyMp4);

  const pySrcMtimeMs = await safeMtimeMs(pySourcePath(repoRoot));
  const tsSrcMtimeMs = await safeMtimeMs(tsSourcePath(repoRoot));
  const sourceMtimeMs = Math.max(pySrcMtimeMs ?? 0, tsSrcMtimeMs ?? 0) || null;
  const deploymentReadOnly = process.env.VERCEL === '1';

  const exists = Boolean(mp4MtimeMs);
  const upToDate = deploymentReadOnly
    ? exists
    : Boolean(
        exists && sourceMtimeMs && mp4MtimeMs && mp4MtimeMs >= sourceMtimeMs
      );

  return json({
    profile,
    exists,
    upToDate,
    deploymentReadOnly,
    sourceMtimeMs,
    mp4MtimeMs,
    playbackUrl: `/py-mp4/dlxn/dlx_3x2_three_tiles?profile=${profile}`,
  });
};
