import { error, json } from '@sveltejs/kit';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { findScene, findScript } from '$lib/feature-sweep/catalog';

const execFileAsync = promisify(execFile);

export async function POST({ params, request }) {
  const script = findScript(params.script);
  const scene = findScene(params.script, params.scene);
  if (!script || !scene) {
    throw error(404, 'Unknown script/scene');
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
    console.error('open folder failed', cause);
    throw error(500, 'Could not open folder');
  }
}
