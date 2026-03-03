export const pyDurationMsByScene: Record<string, number> = {
  'axes_graphs_and_plotting:axes_plot': 1500,
  'camera_and_3d:camera_3d': 1800,
  'export_profiles:profile_sample': 700,
  'groups_layers_and_zindex:layering_demo': 800,
  'images_svg_and_assets:assets_demo': 800,
  'lighting_and_shading_3d:lighting_3d': 1500,
  'mobjects_basics:basics_layout': 2000,
  'open_gl_vs_cairo_parity:cairo_parity': 500,
  'open_gl_vs_cairo_parity:opengl_parity': 500,
  'path_to_path_morphing:path_to_path': 2200,
  'paths_and_morphs:path_morph': 4500,
  'rate_functions_and_timing:timing_demo': 2000,
  'regression_golden_frames:golden_seed': 400,
  'scene_sections_and_voiceover_hooks:sections_demo': 1200,
  'text_math_tex:text_math': 1700,
  'transforms_core:core_transform': 3000,
  'updaters_and_always_redraw:updater_demo': 2000
};

export function pyDurationMsFor(scriptId: string, sceneId: string):
  number | undefined {
  return pyDurationMsByScene[`${scriptId}:${sceneId}`];
}
