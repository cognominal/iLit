import type { Scene } from '$lib/manim';
import {
  buildAxesGraphsPlottingScene
} from './ts/axesGraphsPlotting';
import { buildCairoParityScene } from './ts/cairoParity';
import { buildCameraAnd3DScene } from './ts/cameraAnd3d';
import { buildExportProfilesScene } from './ts/exportProfiles';
import { buildGroupsLayersZIndexScene } from './ts/groupsLayersZindex';
import { buildGeometryTextPrimitivesScene } from './ts/geometryTextPrimitives';
import { buildImagesSvgAssetsScene } from './ts/imagesSvgAssets';
import { buildLightingShading3DScene } from './ts/lightingShading3d';
import { buildMobjectsBasicsScene } from './ts/mobjectsBasics';
import { buildOpenGLParityScene } from './ts/openGlParity';
import { buildPathToPathMorphScene } from './ts/pathToPathMorph';
import { buildPositioningPrimitivesScene } from './ts/positioningPrimitives';
import { buildPathsMorphsScene } from './ts/pathsMorphs';
import { buildRateFunctionsTimingScene } from './ts/rateFunctionsTiming';
import { buildRegressionGoldenFramesScene } from './ts/regressionGoldenFrames';
import { buildSceneSectionsVoiceoverScene } from './ts/sceneSectionsVoiceover';
import { buildTextMathTexScene } from './ts/textMathTex';
import { buildTransformMatchingTexScene } from './ts/transformMatchingTex';
import { buildTransformsCoreScene } from './ts/transformsCore';
import { buildUpdatersAlwaysRedrawScene } from './ts/updatersAlwaysRedraw';
import { buildDoublyLinkedListDeletionScene } from './ts/doublyLinkedListDeletion';

export type TsSceneBuilder = () => Scene;

const registry = new Map<string, TsSceneBuilder>([
  ['mobjects_basics:basics_layout', buildMobjectsBasicsScene],
  ['transforms_core:core_transform', buildTransformsCoreScene],
  ['rate_functions_and_timing:timing_demo', buildRateFunctionsTimingScene],
  ['updaters_and_always_redraw:updater_demo', buildUpdatersAlwaysRedrawScene],
  ['paths_and_morphs:path_morph', buildPathsMorphsScene],
  ['axes_graphs_and_plotting:axes_plot', buildAxesGraphsPlottingScene],
  ['text_math_tex:text_math', buildTextMathTexScene],
  ['camera_and_3d:camera_3d', buildCameraAnd3DScene],
  ['lighting_and_shading_3d:lighting_3d', buildLightingShading3DScene],
  ['images_svg_and_assets:assets_demo', buildImagesSvgAssetsScene],
  ['groups_layers_and_zindex:layering_demo', buildGroupsLayersZIndexScene],
  ['scene_sections_and_voiceover_hooks:sections_demo', buildSceneSectionsVoiceoverScene],
  ['open_gl_vs_cairo_parity:opengl_parity', buildOpenGLParityScene],
  ['open_gl_vs_cairo_parity:cairo_parity', buildCairoParityScene],
  ['export_profiles:profile_sample', buildExportProfilesScene],
  ['regression_golden_frames:golden_seed', buildRegressionGoldenFramesScene],
  ['path_to_path_morphing:path_to_path', buildPathToPathMorphScene],
  [
    'positioning_primitives:positioning_primitives',
    buildPositioningPrimitivesScene
  ],
  ['transform_matching_tex:euler_rearrange', buildTransformMatchingTexScene]
  ,
  [
    'geometry_and_text_primitives:geometry_text_primitives',
    buildGeometryTextPrimitivesScene
  ],
  [
    'doubly_linked_list_deletion:dll_delete',
    buildDoublyLinkedListDeletionScene
  ]
]);

export function sceneBuilderFor(
  scriptId: string,
  sceneId: string
): TsSceneBuilder | undefined {
  return registry.get(`${scriptId}:${sceneId}`);
}
