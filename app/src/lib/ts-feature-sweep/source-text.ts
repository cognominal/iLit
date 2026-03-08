import py01 from '../../../py/01_mobjects_basics.py?raw';
import py02 from '../../../py/02_transforms_core.py?raw';
import py03 from '../../../py/03_rate_functions_and_timing.py?raw';
import py04 from '../../../py/04_updaters_and_always_redraw.py?raw';
import py05 from '../../../py/05_paths_and_morphs.py?raw';
import py06 from '../../../py/06_axes_graphs_and_plotting.py?raw';
import py07 from '../../../py/07_text_math_tex.py?raw';
import py08 from '../../../py/08_camera_and_3d.py?raw';
import py09 from '../../../py/09_lighting_and_shading_3d.py?raw';
import py10 from '../../../py/10_images_svg_and_assets.py?raw';
import py11 from '../../../py/11_groups_layers_and_zindex.py?raw';
import py12 from '../../../py/12_scene_sections_and_voiceover_hooks.py?raw';
import py13 from '../../../py/13_open_gl_vs_cairo_parity.py?raw';
import py14 from '../../../py/14_export_profiles.py?raw';
import py15 from '../../../py/15_regression_golden_frames.py?raw';
import py16 from '../../../py/16_path_to_path_morphing.py?raw';
import py17 from '../../../py/17_positioning_primitives.py?raw';
import py18 from '../../../py/18_transform_matching_tex.py?raw';
import py19 from '../../../py/19_geometry_and_text_primitives.py?raw';
import py20 from '../../../py/20_doubly_linked_list_deletion.py?raw';

const tsSourceModules = import.meta.glob('./ts/*.ts', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

const pySourceModules: Record<string, string> = {
  'py/01_mobjects_basics.py': py01,
  'py/02_transforms_core.py': py02,
  'py/03_rate_functions_and_timing.py': py03,
  'py/04_updaters_and_always_redraw.py': py04,
  'py/05_paths_and_morphs.py': py05,
  'py/06_axes_graphs_and_plotting.py': py06,
  'py/07_text_math_tex.py': py07,
  'py/08_camera_and_3d.py': py08,
  'py/09_lighting_and_shading_3d.py': py09,
  'py/10_images_svg_and_assets.py': py10,
  'py/11_groups_layers_and_zindex.py': py11,
  'py/12_scene_sections_and_voiceover_hooks.py': py12,
  'py/13_open_gl_vs_cairo_parity.py': py13,
  'py/14_export_profiles.py': py14,
  'py/15_regression_golden_frames.py': py15,
  'py/16_path_to_path_morphing.py': py16,
  'py/17_positioning_primitives.py': py17,
  'py/18_transform_matching_tex.py': py18,
  'py/19_geometry_and_text_primitives.py': py19,
  'py/20_doubly_linked_list_deletion.py': py20
};

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
