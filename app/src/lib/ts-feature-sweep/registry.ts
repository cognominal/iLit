import type { Scene } from '$lib/feature-sweep/manim-api';
import { buildMobjectsBasicsScene } from './scenes/mobjectsBasics';

export type TsSceneBuilder = () => Scene;

const registry = new Map<string, TsSceneBuilder>([
  ['mobjects_basics:basics_layout', buildMobjectsBasicsScene]
]);

export function sceneBuilderFor(
  scriptId: string,
  sceneId: string
): TsSceneBuilder | undefined {
  return registry.get(`${scriptId}:${sceneId}`);
}
