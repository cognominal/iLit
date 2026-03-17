import { error } from '@sveltejs/kit';
import { basename, resolve } from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import type { RequestHandler } from './$types';

function repoRootFromCwd(cwd: string): string {
  return basename(cwd) === 'app' ? resolve(cwd, '..') : cwd;
}

function pathFor(
  repoRoot: string,
  scriptId: string,
  sceneId: string,
  profile: string
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

async function resolveMp4Path(
  url: URL,
  params: { script: string; scene: string }
): Promise<string> {
  const profile = (url.searchParams.get('profile') ?? 'medres').trim();
  const repoRoot = repoRootFromCwd(process.cwd());
  const path = pathFor(repoRoot, params.script, params.scene, profile);
  try {
    const meta = await stat(path);
    if (!meta.isFile()) throw new Error('not a file');
  } catch {
    throw error(
      404,
      `No TS MP4 found in media/ts-mp4/ts-sweep/${params.script}/${params.scene}`
    );
  }
  return path;
}

export const HEAD: RequestHandler = async ({ url, params }) => {
  await resolveMp4Path(url, params);
  return new Response(null, {
    status: 200,
    headers: { 'cache-control': 'no-store' }
  });
};

export const GET: RequestHandler = async ({ url, params }) => {
  const path = await resolveMp4Path(url, params);
  const bytes = await readFile(path);
  return new Response(bytes, {
    status: 200,
    headers: {
      'content-type': 'video/mp4',
      'cache-control': 'no-store'
    }
  });
};
