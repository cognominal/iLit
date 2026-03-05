import { error } from '@sveltejs/kit';
import { readFile, stat } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { findTsScene, findTsScript } from '$lib/ts-feature-sweep/catalog';
import { findScript } from '$lib/feature-sweep/catalog';
import { sceneBuilderFor } from '$lib/ts-feature-sweep/registry';

function repoRootFromCwd(cwd: string): string {
  return basename(cwd) === 'app' ? resolve(cwd, '..') : cwd;
}

async function safeRead(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return `Unable to read ${path}`;
  }
}

export async function load({ params }) {
  const script = findTsScript(params.script);
  if (!script) {
    throw error(404, `Unknown TS script: ${params.script}`);
  }

  const scene = findTsScene(params.script, params.scene);
  if (!scene) {
    throw error(404, `Unknown TS scene: ${params.script}/${params.scene}`);
  }

  const hasBuilder = Boolean(sceneBuilderFor(params.script, params.scene));
  if (!hasBuilder) {
    throw error(404, `No TS scene builder for ${params.script}/${params.scene}`);
  }

  const repoRoot = repoRootFromCwd(process.cwd());
  const pyScript = findScript(params.script);
  const pySourceRel = pyScript?.file ?? `py/${script.id}.py`;
  const pySourcePath = resolve(repoRoot, pySourceRel);
  const tsSourcePath = resolve(repoRoot, script.source);
  const [pySourceText, tsSourceText] = await Promise.all([
    safeRead(pySourcePath),
    safeRead(tsSourcePath)
  ]);
  const tsSourceMtimeMs = await stat(tsSourcePath)
    .then((meta) => meta.mtimeMs)
    .catch(() => null);

  return {
    script,
    scene,
    pySourcePath,
    tsSourcePath,
    pySourceText,
    tsSourceText,
    tsSourceMtimeMs
  };
}
