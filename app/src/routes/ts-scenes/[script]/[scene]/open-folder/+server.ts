import { error, json } from '@sveltejs/kit';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { findTsScene, findTsScript } from '$lib/ts-feature-sweep/catalog';
import type { RequestHandler } from './$types';

const execFileAsync = promisify(execFile);

export const POST: RequestHandler = async ({ params, request }) => {
  const script = findTsScript(params.script);
  const scene = findTsScene(params.script, params.scene);
  if (!script || !scene) {
    throw error(404, 'Unknown TS script/scene');
  }

  const body = await request.json().catch(() => ({}));
  const folderPath = body.folderPath as string | undefined;
  if (!folderPath) {
    throw error(400, 'Missing folderPath');
  }

  try {
    await execFileAsync('open', [folderPath]);
    return json({ ok: true });
  } catch (cause) {
    console.error('open TS sweep folder failed', cause);
    throw error(500, 'Could not open folder');
  }
};
