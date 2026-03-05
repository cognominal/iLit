import { Circle, Create, Scene, Square, TitleText } from '$lib/feature-sweep/manim-api';

export function buildUpdatersAlwaysRedrawScene(): Scene {
  const scene = new Scene(1);
  const title = TitleText('title', { x: 400, y: 72, value: 'Updaters and Always Redraw', fontSize: 34 });
  const base = Square('square_base', { x: 320, y: 266, size: 130, stroke: '#14b8a6' });
  const follower = Square('square_follow', { x: 392, y: 216, size: 72, stroke: '#2dd4bf' });
  const tracker = Circle('circle_tracker', { x: 540, y: 246, radius: 54, stroke: '#a78bfa' });
  scene.add(title, base, follower, tracker);
  scene.play(Create(title));
  scene.play(Create(base), Create(follower), Create(tracker));
  return scene;
}
