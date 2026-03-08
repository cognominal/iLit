import { pySourceModules } from 'virtual:py-sources';

const tsSourceModules = import.meta.glob('./ts/*.ts', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

function normalize(path: string): string {
  return path.replace(/\\/g, '/');
}

export function pySourceTextFor(path: string): string | null {
  const normalizedPath = normalize(path);
  return pySourceModules[normalizedPath] ?? null;
}

export function tsSourceTextFor(path: string): string | null {
  const normalizedPath = normalize(path);
  const entry = Object.entries(tsSourceModules).find(([key]) =>
    normalize(key).endsWith(normalizedPath) ||
    normalize(key).endsWith(normalizedPath.split('/').pop() ?? normalizedPath)
  );
  return entry?.[1] ?? null;
}
