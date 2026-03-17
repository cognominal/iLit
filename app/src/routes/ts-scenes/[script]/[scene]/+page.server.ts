import { error } from '@sveltejs/kit';
import { readFile, stat } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { findTsScene, findTsScript } from '$lib/ts-feature-sweep/catalog';
import { findScript } from '$lib/feature-sweep/catalog';
import { sceneBuilderFor } from '$lib/ts-feature-sweep/registry';
import {
  pySourceTextFor,
  tsSourceTextFor
} from '$lib/ts-feature-sweep/source-text';
import type { PageServerLoad } from './$types';

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

export const load: PageServerLoad = async ({ params }) => {
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
  const bundledPySourceText = pySourceTextFor(pySourceRel);
  const bundledTsSourceText = tsSourceTextFor(script.source);
  const [fsPySourceText, fsTsSourceText] = await Promise.all([
    bundledPySourceText === null ? safeRead(pySourcePath) : Promise.resolve(null),
    bundledTsSourceText === null ? safeRead(tsSourcePath) : Promise.resolve(null)
  ]);
  const pySourceText = bundledPySourceText ?? fsPySourceText ?? `Unable to read ${pySourcePath}`;
  const tsSourceText = bundledTsSourceText ?? fsTsSourceText ?? `Unable to read ${tsSourcePath}`;
  const tsSourceMtimeMs = await stat(tsSourcePath)
    .then((meta) => meta.mtimeMs)
    .catch(() => null);
  const sourceEditingEnabled = process.env.VERCEL !== '1';

  return {
    script,
    scene,
    pySourcePath,
    tsSourcePath,
    pySourceText,
    tsSourceText,
    tsSourceMtimeMs,
    sourceEditingEnabled
  };
};
