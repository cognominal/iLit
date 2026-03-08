export type SceneEntry = {
  id: string;
  title: string;
  description: string;
};

export type ScriptEntry = {
  id: string;
  title: string;
  file: string;
  scenes: SceneEntry[];
};

export const scripts: ScriptEntry[] = [
  {
    id: 'mobjects_basics',
    title: '01 Mobjects Basics',
    file: 'py/01_mobjects_basics.py',
    scenes: [
      {
        id: 'basics_layout',
        title: 'Basics Layout',
        description: 'Square, circle, and title arranged in a simple stage.'
      }
    ]
  },
  {
    id: 'transforms_core',
    title: '02 Transforms Core',
    file: 'py/02_transforms_core.py',
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
    file: 'py/03_rate_functions_and_timing.py',
    scenes: [{ id: 'timing_demo', title: 'Timing Demo', description: 'Motion with custom rate function.' }]
  },
  {
    id: 'updaters_and_always_redraw',
    title: '04 Updaters and Always Redraw',
    file: 'py/04_updaters_and_always_redraw.py',
    scenes: [{ id: 'updater_demo', title: 'Updater Demo', description: 'Tracker-driven scene updates.' }]
  },
  {
    id: 'paths_and_morphs',
    title: '05 Paths and Morphs',
    file: 'py/05_paths_and_morphs.py',
    scenes: [{ id: 'path_morph', title: 'Path Morph', description: 'Path traversal and shape morphing.' }]
  },
  {
    id: 'axes_graphs_and_plotting',
    title: '06 Axes Graphs and Plotting',
    file: 'py/06_axes_graphs_and_plotting.py',
    scenes: [{ id: 'axes_plot', title: 'Axes Plot', description: 'Simple plotted function over axes.' }]
  },
  {
    id: 'text_math_tex',
    title: '07 Text Math Tex',
    file: 'py/07_text_math_tex.py',
    scenes: [{ id: 'text_math', title: 'Text + Math', description: 'Text and math expression composition.' }]
  },
  {
    id: 'camera_and_3d',
    title: '08 Camera and 3D',
    file: 'py/08_camera_and_3d.py',
    scenes: [{ id: 'camera_3d', title: 'Camera 3D', description: '3D axes with camera orientation.' }]
  },
  {
    id: 'lighting_and_shading_3d',
    title: '09 Lighting and Shading 3D',
    file: 'py/09_lighting_and_shading_3d.py',
    scenes: [{ id: 'lighting_3d', title: 'Lighting 3D', description: 'Shaded 3D forms under camera motion.' }]
  },
  {
    id: 'images_svg_and_assets',
    title: '10 Images SVG and Assets',
    file: 'py/10_images_svg_and_assets.py',
    scenes: [{ id: 'assets_demo', title: 'Assets Demo', description: 'Asset loading fallback behavior.' }]
  },
  {
    id: 'groups_layers_and_zindex',
    title: '11 Groups Layers and Z-Index',
    file: 'py/11_groups_layers_and_zindex.py',
    scenes: [{ id: 'layering_demo', title: 'Layering Demo', description: 'Group and z-index ordering.' }]
  },
  {
    id: 'scene_sections_and_voiceover_hooks',
    title: '12 Scene Sections and Voiceover Hooks',
    file: 'py/12_scene_sections_and_voiceover_hooks.py',
    scenes: [{ id: 'sections_demo', title: 'Sections Demo', description: 'Section markers for editorial workflows.' }]
  },
  {
    id: 'open_gl_vs_cairo_parity',
    title: '13 OpenGL vs Cairo Parity',
    file: 'py/13_open_gl_vs_cairo_parity.py',
    scenes: [
      { id: 'opengl_parity', title: 'OpenGL Parity', description: 'OpenGL render parity scene.' },
      { id: 'cairo_parity', title: 'Cairo Parity', description: 'Cairo render parity scene.' }
    ]
  },
  {
    id: 'export_profiles',
    title: '14 Export Profiles',
    file: 'py/14_export_profiles.py',
    scenes: [{ id: 'profile_sample', title: 'Profile Sample', description: 'Export settings baseline sample.' }]
  },
  {
    id: 'regression_golden_frames',
    title: '15 Regression Golden Frames',
    file: 'py/15_regression_golden_frames.py',
    scenes: [{ id: 'golden_seed', title: 'Golden Seed', description: 'Deterministic seeded frame baseline.' }]
  },
  {
    id: 'path_to_path_morphing',
    title: '16 Path to Path Morphing',
    file: 'py/16_path_to_path_morphing.py',
    scenes: [
      {
        id: 'path_to_path',
        title: 'Path to Path',
        description: 'ReplacementTransform between two vector paths.'
      }
    ]
  },
  {
    id: 'positioning_primitives',
    title: '17 Positioning Primitives',
    file: 'py/17_positioning_primitives.py',
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
    file: 'py/18_transform_matching_tex.py',
    scenes: [
      {
        id: 'euler_rearrange',
        title: 'Euler Rearrange',
        description: 'TransformMatchingTex from e^{i\\pi}+1=0 to e^{i\\pi}=-1.'
      }
    ]
  },
  {
    id: 'geometry_and_text_primitives',
    title: '19 Geometry and Text Primitives',
    file: 'py/19_geometry_and_text_primitives.py',
    scenes: [
      {
        id: 'geometry_text_primitives',
        title: 'Geometry + Text',
        description: 'Exercise new geometry and text primitive support.'
      }
    ]
  },
  {
    id: 'doubly_linked_list_deletion',
    title: '20 Doubly Linked List Deletion',
    file: 'py/20_doubly_linked_list_deletion.py',
    scenes: [
      {
        id: 'dll_delete',
        title: 'DLL Delete',
        description: 'Delete the third node, then the second, in a circular list.'
      }
    ]
  }
];

export function findScript(scriptId: string): ScriptEntry | undefined {
  return scripts.find((script) => script.id === scriptId);
}

export function findScene(scriptId: string, sceneId: string): SceneEntry | undefined {
  return findScript(scriptId)?.scenes.find((scene) => scene.id === sceneId);
}
