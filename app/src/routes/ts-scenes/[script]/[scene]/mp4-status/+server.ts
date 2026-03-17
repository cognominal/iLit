import { error, json } from '@sveltejs/kit';
import { basename, resolve } from 'node:path';
import { stat } from 'node:fs/promises';
import { findTsScene, findTsScript } from '$lib/ts-feature-sweep/catalog';
import { scripts } from '$lib/feature-sweep/catalog';
import { getTsRenderJob, tsRenderJobKey } from
  '$lib/ts-feature-sweep/render-jobs';
import type { RequestHandler } from './$types';

type Lang = 'ts' | 'py';
type Profile = 'lowres' | 'medres' | 'hires';

function repoRootFromCwd(cwd: string): string {
  return basename(cwd) === 'app' ? resolve(cwd, '..') : cwd;
}

function tsMp4Path(
  repoRoot: string,
  scriptId: string,
  sceneId: string,
  profile: Profile
): string {
  return resolve(
    repoRoot,
    'media',
    'ts-mp4',
    'ts-sweep',
    scriptId,
    sceneId,
    `${profile}.mp4`
  );
}

async function pyMp4Path(
  repoRoot: string,
  scriptId: string,
  sceneId: string,
  profile: Profile
): Promise<string | null> {
  const base = resolve(repoRoot, 'media', 'py-mp4', scriptId, sceneId);
  const candidates = [
    resolve(base, `${profile}.mp4`),
    resolve(base, `${sceneId}.mp4`),
    resolve(base, 'scene.mp4'),
    resolve(base, 'output.mp4')
  ];
  for (const path of candidates) {
    try {
      const meta = await stat(path);
      if (meta.isFile()) return path;
    } catch {
      // continue
    }
  }
  return null;
}

async function safeMtimeMs(path: string): Promise<number | null> {
  try {
    return (await stat(path)).mtimeMs;
  } catch {
    return null;
  }
}

export const GET: RequestHandler = async ({ params, url }) => {
  const script = findTsScript(params.script);
  const scene = findTsScene(params.script, params.scene);
  if (!script || !scene) throw error(404, 'Unknown TS script/scene');

  const langRaw = (url.searchParams.get('lang') ?? 'ts').trim();
  const profileRaw = (url.searchParams.get('profile') ?? 'medres').trim();
  const lang: Lang = langRaw === 'py' ? 'py' : 'ts';
  const profile: Profile =
    profileRaw === 'lowres' || profileRaw === 'hires' ? profileRaw : 'medres';

  const repoRoot = repoRootFromCwd(process.cwd());
  const sourcePath =
    lang === 'ts'
      ? resolve(repoRoot, script.source)
      : resolve(
          repoRoot,
          scripts.find((entry) => entry.id === params.script)?.file ?? ''
        );
  const sourceMtimeMs = await safeMtimeMs(sourcePath);

  const mp4Path =
    lang === 'ts'
      ? tsMp4Path(repoRoot, params.script, params.scene, profile)
      : await pyMp4Path(repoRoot, params.script, params.scene, profile);
  const mp4MtimeMs = mp4Path ? await safeMtimeMs(mp4Path) : null;
  const deploymentReadOnly = process.env.VERCEL === '1';

  const exists = Boolean(mp4Path && mp4MtimeMs);
  const upToDate = deploymentReadOnly
    ? exists
    : Boolean(
        exists &&
          sourceMtimeMs &&
          mp4MtimeMs &&
          mp4MtimeMs >= sourceMtimeMs
      );

  const playbackBaseUrl =
    lang === 'ts'
      ? `/ts-mp4/${params.script}/${params.scene}?profile=${profile}`
      : `/py-mp4/${params.script}/${params.scene}?profile=${profile}`;
  const playbackUrl = mp4MtimeMs
    ? `${playbackBaseUrl}&v=${Math.trunc(mp4MtimeMs)}`
    : playbackBaseUrl;
  const renderJob = lang === 'ts'
    ? getTsRenderJob(tsRenderJobKey(params.script, params.scene, profile))
    : null;

  return json({
    lang,
    profile,
    sourcePath,
    sourceMtimeMs,
    mp4Path,
    mp4MtimeMs,
    exists,
    upToDate,
    deploymentReadOnly,
    playbackUrl,
    inProgress: Boolean(renderJob?.inProgress),
    renderError: renderJob?.lastError ?? null,
    renderStartedAtMs: renderJob?.startedAtMs ?? null,
    renderFinishedAtMs: renderJob?.finishedAtMs ?? null,
  });
};
