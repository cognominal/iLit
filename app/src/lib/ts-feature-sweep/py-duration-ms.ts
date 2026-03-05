export const pyDurationSecByScene: Record<string, number> = {
  'axes_graphs_and_plotting:axes_plot': 1.5,
  'camera_and_3d:camera_3d': 1.8,
  'export_profiles:profile_sample': 0.7,
  'groups_layers_and_zindex:layering_demo': 0.8,
  'images_svg_and_assets:assets_demo': 0.8,
  'lighting_and_shading_3d:lighting_3d': 1.5,
  'mobjects_basics:basics_layout': 2.0,
  'open_gl_vs_cairo_parity:cairo_parity': 0.5,
  'open_gl_vs_cairo_parity:opengl_parity': 0.5,
  'path_to_path_morphing:path_to_path': 2.2,
  'paths_and_morphs:path_morph': 4.5,
  'rate_functions_and_timing:timing_demo': 2.0,
  'regression_golden_frames:golden_seed': 0.4,
  'scene_sections_and_voiceover_hooks:sections_demo': 1.2,
  'text_math_tex:text_math': 1.7,
  'transforms_core:core_transform': 3.0,
  'updaters_and_always_redraw:updater_demo': 2.0
};

export function pyDurationSecFor(scriptId: string, sceneId: string):
  number | undefined {
  return pyDurationSecByScene[`${scriptId}:${sceneId}`];
}
