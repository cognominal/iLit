export type TsSceneEntry = {
  id: string;
  title: string;
  description: string;
};

export type TsScriptEntry = {
  id: string;
  title: string;
  source: string;
  scenes: TsSceneEntry[];
};

export const tsScripts: TsScriptEntry[] = [
  {
    id: 'mobjects_basics',
    title: '01 Mobjects Basics',
    source: 'app/src/lib/ts-feature-sweep/ts/mobjectsBasics.ts',
    scenes: [
      {
        id: 'basics_layout',
        title: 'Basics Layout',
        description: 'Square, circle, and title from TS scene source.'
      }
    ]
  },
  {
    id: 'transforms_core',
    title: '02 Transforms Core',
    source: 'app/src/lib/ts-feature-sweep/ts/transformsCore.ts',
    scenes: [
      {
        id: 'core_transform',
        title: 'Core Transform',
        description: 'Create and replace transform baseline.'
      }
    ]
  },
  {
    id: 'rate_functions_and_timing',
    title: '03 Rate Functions and Timing',
    source: 'app/src/lib/ts-feature-sweep/ts/rateFunctionsTiming.ts',
    scenes: [
      {
        id: 'timing_demo',
        title: 'Timing Demo',
        description: 'Motion with custom rate function.'
      }
    ]
  },
  {
    id: 'updaters_and_always_redraw',
    title: '04 Updaters and Always Redraw',
    source: 'app/src/lib/ts-feature-sweep/ts/updatersAlwaysRedraw.ts',
    scenes: [
      {
        id: 'updater_demo',
        title: 'Updater Demo',
        description: 'Tracker-driven scene updates.'
      }
    ]
  },
  {
    id: 'paths_and_morphs',
    title: '05 Paths and Morphs',
    source: 'app/src/lib/ts-feature-sweep/ts/pathsMorphs.ts',
    scenes: [
      {
        id: 'path_morph',
        title: 'Path Morph',
        description: 'Path traversal and shape morphing.'
      }
    ]
  },
  {
    id: 'axes_graphs_and_plotting',
    title: '06 Axes Graphs and Plotting',
    source: 'app/src/lib/ts-feature-sweep/ts/axesGraphsPlotting.ts',
    scenes: [
      {
        id: 'axes_plot',
        title: 'Axes Plot',
        description: 'Simple plotted function over axes.'
      }
    ]
  },
  {
    id: 'text_math_tex',
    title: '07 Text Math Tex',
    source: 'app/src/lib/ts-feature-sweep/ts/textMathTex.ts',
    scenes: [
      {
        id: 'text_math',
        title: 'Text + Math',
        description: 'Text and math expression composition.'
      }
    ]
  },
  {
    id: 'camera_and_3d',
    title: '08 Camera and 3D',
    source: 'app/src/lib/ts-feature-sweep/ts/cameraAnd3d.ts',
    scenes: [
      {
        id: 'camera_3d',
        title: 'Camera 3D',
        description: '3D axes with camera orientation.'
      }
    ]
  },
  {
    id: 'lighting_and_shading_3d',
    title: '09 Lighting and Shading 3D',
    source: 'app/src/lib/ts-feature-sweep/ts/lightingShading3d.ts',
    scenes: [
      {
        id: 'lighting_3d',
        title: 'Lighting 3D',
        description: 'Shaded 3D forms under camera motion.'
      }
    ]
  },
  {
    id: 'images_svg_and_assets',
    title: '10 Images SVG and Assets',
    source: 'app/src/lib/ts-feature-sweep/ts/imagesSvgAssets.ts',
    scenes: [
      {
        id: 'assets_demo',
        title: 'Assets Demo',
        description: 'Asset loading fallback behavior.'
      }
    ]
  },
  {
    id: 'groups_layers_and_zindex',
    title: '11 Groups Layers and Z-Index',
    source: 'app/src/lib/ts-feature-sweep/ts/groupsLayersZindex.ts',
    scenes: [
      {
        id: 'layering_demo',
        title: 'Layering Demo',
        description: 'Group and z-index ordering.'
      }
    ]
  },
  {
    id: 'scene_sections_and_voiceover_hooks',
    title: '12 Scene Sections and Voiceover Hooks',
    source: 'app/src/lib/ts-feature-sweep/ts/sceneSectionsVoiceover.ts',
    scenes: [
      {
        id: 'sections_demo',
        title: 'Sections Demo',
        description: 'Section markers for editorial workflows.'
      }
    ]
  },
  {
    id: 'open_gl_vs_cairo_parity',
    title: '13 OpenGL vs Cairo Parity',
    source: 'app/src/lib/ts-feature-sweep/ts/openGlParity.ts',
    scenes: [
      {
        id: 'opengl_parity',
        title: 'OpenGL Parity',
        description: 'OpenGL render parity scene.'
      },
      {
        id: 'cairo_parity',
        title: 'Cairo Parity',
        description: 'Cairo render parity scene.'
      }
    ]
  },
  {
    id: 'export_profiles',
    title: '14 Export Profiles',
    source: 'app/src/lib/ts-feature-sweep/ts/exportProfiles.ts',
    scenes: [
      {
        id: 'profile_sample',
        title: 'Profile Sample',
        description: 'Export settings baseline sample.'
      }
    ]
  },
  {
    id: 'regression_golden_frames',
    title: '15 Regression Golden Frames',
    source: 'app/src/lib/ts-feature-sweep/ts/regressionGoldenFrames.ts',
    scenes: [
      {
        id: 'golden_seed',
        title: 'Golden Seed',
        description: 'Deterministic seeded frame baseline.'
      }
    ]
  },
  {
    id: 'path_to_path_morphing',
    title: '16 Path to Path Morphing',
    source: 'app/src/lib/ts-feature-sweep/ts/pathToPathMorph.ts',
    scenes: [
      {
        id: 'path_to_path',
        title: 'Path to Path',
        description: 'ReplacementTransform between two SVG-like paths.'
      }
    ]
  },
  {
    id: 'positioning_primitives',
    title: '17 Positioning Primitives',
    source: 'app/src/lib/ts-feature-sweep/ts/positioningPrimitives.ts',
    scenes: [
      {
        id: 'positioning_primitives',
        title: 'Positioning Primitives',
        description: 'Direction vectors and positioning helper methods.'
      }
    ]
  },
  {
    id: 'transform_matching_tex',
    title: '18 TransformMatchingTex',
    source: 'app/src/lib/ts-feature-sweep/ts/transformMatchingTex.ts',
    scenes: [
      {
        id: 'euler_rearrange',
        title: 'Euler Rearrange',
        description: 'Match and transform equation tokens between MathTex forms.'
      }
    ]
  },
  {
    id: 'geometry_and_text_primitives',
    title: '19 Geometry and Text Primitives',
    source: 'app/src/lib/ts-feature-sweep/ts/geometryTextPrimitives.ts',
    scenes: [
      {
        id: 'geometry_text_primitives',
        title: 'Geometry + Text',
        description: 'Exercise new geometry and text primitive support.'
      }
    ]
  }
];

export function findTsScript(scriptId: string): TsScriptEntry | undefined {
  return tsScripts.find((script) => script.id === scriptId);
}

export function findTsScene(
  scriptId: string,
  sceneId: string
): TsSceneEntry | undefined {
  return findTsScript(scriptId)?.scenes.find((scene) => scene.id === sceneId);
}
