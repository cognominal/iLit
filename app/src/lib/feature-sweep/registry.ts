import type { Component } from 'svelte';
import AxesGraphsPlottingScene from './scenes/AxesGraphsPlottingScene.svelte';
import CairoParityScene from './scenes/CairoParityScene.svelte';
import CameraAnd3DScene from './scenes/CameraAnd3DScene.svelte';
import ExportProfilesScene from './scenes/ExportProfilesScene.svelte';
import GroupsLayersZIndexScene from './scenes/GroupsLayersZIndexScene.svelte';
import ImagesSvgAssetsScene from './scenes/ImagesSvgAssetsScene.svelte';
import LightingShading3DScene from './scenes/LightingShading3DScene.svelte';
import MobjectsBasicsScene from './scenes/MobjectsBasicsScene.svelte';
import OpenGLParityScene from './scenes/OpenGLParityScene.svelte';
import PathsMorphsScene from './scenes/PathsMorphsScene.svelte';
import RateFunctionsTimingScene from './scenes/RateFunctionsTimingScene.svelte';
import RegressionGoldenFramesScene from './scenes/RegressionGoldenFramesScene.svelte';
import SceneSectionsVoiceoverScene from './scenes/SceneSectionsVoiceoverScene.svelte';
import TextMathTexScene from './scenes/TextMathTexScene.svelte';
import TransformsCoreScene from './scenes/TransformsCoreScene.svelte';
import UpdatersAlwaysRedrawScene from './scenes/UpdatersAlwaysRedrawScene.svelte';

type SceneComponent = Component;

const registry = new Map<string, SceneComponent>([
  ['mobjects_basics:basics_layout', MobjectsBasicsScene],
  ['transforms_core:core_transform', TransformsCoreScene],
  ['rate_functions_and_timing:timing_demo', RateFunctionsTimingScene],
  ['updaters_and_always_redraw:updater_demo', UpdatersAlwaysRedrawScene],
  ['paths_and_morphs:path_morph', PathsMorphsScene],
  ['axes_graphs_and_plotting:axes_plot', AxesGraphsPlottingScene],
  ['text_math_tex:text_math', TextMathTexScene],
  ['camera_and_3d:camera_3d', CameraAnd3DScene],
  ['lighting_and_shading_3d:lighting_3d', LightingShading3DScene],
  ['images_svg_and_assets:assets_demo', ImagesSvgAssetsScene],
  ['groups_layers_and_zindex:layering_demo', GroupsLayersZIndexScene],
  ['scene_sections_and_voiceover_hooks:sections_demo', SceneSectionsVoiceoverScene],
  ['open_gl_vs_cairo_parity:opengl_parity', OpenGLParityScene],
  ['open_gl_vs_cairo_parity:cairo_parity', CairoParityScene],
  ['export_profiles:profile_sample', ExportProfilesScene],
  ['regression_golden_frames:golden_seed', RegressionGoldenFramesScene]
]);

export function sceneComponentFor(
  scriptId: string,
  sceneId: string
): SceneComponent | undefined {
  return registry.get(`${scriptId}:${sceneId}`);
}
