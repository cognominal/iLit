import { error } from '@sveltejs/kit';
import { basename, resolve } from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import type { RequestHandler } from './$types';

function repoRootFromCwd(cwd: string): string {
  return basename(cwd) === 'app' ? resolve(cwd, '..') : cwd;
}

function candidatePaths(
  repoRoot: string,
  scriptId: string,
  sceneId: string,
  profile: string
): string[] {
  const base = resolve(repoRoot, 'media', 'py-mp4', scriptId, sceneId);
  return [
    resolve(base, `${profile}.mp4`),
    resolve(base, `${sceneId}.mp4`),
    resolve(base, 'scene.mp4'),
    resolve(base, 'output.mp4')
  ];
}

async function firstExisting(paths: string[]): Promise<string | null> {
  for (const path of paths) {
    try {
      const meta = await stat(path);
      if (meta.isFile()) return path;
    } catch {
      // Continue to next candidate.
    }
  }
  return null;
}

async function resolveMp4Path(url: URL, params: { script: string; scene: string }):
  Promise<string> {
  const profile = (url.searchParams.get('profile') ?? 'medres').trim();
  const repoRoot = repoRootFromCwd(process.cwd());
  const found = await firstExisting(
    candidatePaths(repoRoot, params.script, params.scene, profile)
  );
  if (!found) {
    throw error(
      404,
      `No Python MP4 found in media/py-mp4/${params.script}/${params.scene}`
    );
  }
  return found;
}

export const HEAD: RequestHandler = async ({ url, params }) => {
  await resolveMp4Path(url, params);
  return new Response(null, {
    status: 200,
    headers: {
      'cache-control': 'no-store'
    }
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
