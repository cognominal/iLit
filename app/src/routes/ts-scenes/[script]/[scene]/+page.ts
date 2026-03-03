import { error } from '@sveltejs/kit';
import { findTsScene, findTsScript } from '$lib/ts-feature-sweep/catalog';
import { sceneBuilderFor } from '$lib/ts-feature-sweep/registry';

export function load({ params }) {
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

  return { script, scene };
}
