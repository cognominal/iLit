import { Circle, Create, Scene, Square, TitleText } from '$lib/feature-sweep/manim-api';

export function buildExportProfilesScene(): Scene {
  const scene = new Scene(0.7);
  const title = TitleText('title', { x: 400, y: 72, value: 'Export Profiles', fontSize: 40 });
  const low = Square('square_low', { x: 224, y: 280, size: 76, stroke: '#84cc16' });
  const med = Square('square_med', { x: 344, y: 264, size: 108, stroke: '#65a30d' });
  const hi = Square('square_hi', { x: 492, y: 240, size: 148, stroke: '#4d7c0f' });
  const profile = Circle('circle_profile', { x: 640, y: 292, radius: 46, stroke: '#60a5fa' });
  scene.add(title, low, med, hi, profile);
  scene.play(Create(title));
  scene.play(Create(low), Create(med), Create(hi), Create(profile));
  return scene;
}
