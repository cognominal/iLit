import { error, json } from '@sveltejs/kit';
import { basename, resolve } from 'node:path';
import { stat, writeFile } from 'node:fs/promises';
import { findTsScene, findTsScript } from '$lib/ts-feature-sweep/catalog';
import ts from 'typescript';
import type { RequestHandler } from './$types';

function repoRootFromCwd(cwd: string): string {
  return basename(cwd) === 'app' ? resolve(cwd, '..') : cwd;
}

export const POST: RequestHandler = async ({ params, request }) => {
  const script = findTsScript(params.script);
  const scene = findTsScene(params.script, params.scene);
  if (!script || !scene) {
    throw error(404, 'Unknown TS script/scene');
  }

  const body = await request.json().catch(() => null) as {
    content?: string;
    expectedMtimeMs?: number;
    force?: boolean;
  } | null;

  if (!body || typeof body.content !== 'string') {
    throw error(400, 'Missing content');
  }

  const transpile = ts.transpileModule(body.content, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      strict: true
    },
    reportDiagnostics: true,
    fileName: `${params.script}.ts`
  });
  const diagnostics = (transpile.diagnostics ?? [])
    .filter((d) => d.category === ts.DiagnosticCategory.Error)
    .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
  if (diagnostics.length > 0) {
    return json(
      {
        compileError: true,
        message: diagnostics[0],
        diagnostics
      },
      { status: 422 }
    );
  }

  const repoRoot = repoRootFromCwd(process.cwd());
  const targetPath = resolve(repoRoot, script.source);
  const before = await stat(targetPath);

  if (!body.force && typeof body.expectedMtimeMs === 'number') {
    if (Math.abs(before.mtimeMs - body.expectedMtimeMs) > 1) {
      return json(
        {
          conflict: true,
          message: 'Source changed on disk since last load.',
          currentMtimeMs: before.mtimeMs,
        },
        { status: 409 }
      );
    }
  }

  await writeFile(targetPath, body.content, 'utf8');
  const after = await stat(targetPath);

  return json({
    saved: true,
    path: targetPath,
    mtimeMs: after.mtimeMs,
  });
};
