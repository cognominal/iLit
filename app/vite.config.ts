import { readdirSync, readFileSync } from 'node:fs';
import { basename, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';

function pySourcesPlugin(): Plugin {
  const virtualModuleId = 'virtual:py-sources';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;
  const appDir = fileURLToPath(new URL('.', import.meta.url));
  const repoRoot = join(appDir, '..');
  const pyDir = join(repoRoot, 'py');

  return {
    name: 'py-sources-virtual-module',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
      return null;
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) {
        return null;
      }
      const entries = readdirSync(pyDir)
        .filter((file) => extname(file) === '.py')
        .sort()
        .map((file) => {
          const absPath = join(pyDir, file);
          const relPath = relative(repoRoot, absPath).replace(/\\/g, '/');
          const source = readFileSync(absPath, 'utf8');
          return [relPath, source] as const;
        });
      return [
        'export const pySourceModules = {',
        ...entries.map(
          ([path, source]) =>
            `  ${JSON.stringify(path)}: ${JSON.stringify(source)},`
        ),
        '};'
      ].join('\n');
    }
  };
}

export default defineConfig({
  plugins: [pySourcesPlugin(), tailwindcss(), sveltekit()],
});
