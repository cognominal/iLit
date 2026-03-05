import { Circle, Create, Scene, Square, TitleText } from '$lib/feature-sweep/manim-api';

export function buildRateFunctionsTimingScene(): Scene {
  const scene = new Scene(1);
  const title = TitleText('title', {
    x: 400,
    y: 72,
    value: 'Rate Functions and Timing',
    fontSize: 34
  });
  const a = Square('square_fast', {
    x: 220,
    y: 286,
    size: 72,
    stroke: '#818cf8'
  });
  const b = Square('square_mid', {
    x: 340,
    y: 256,
    size: 96,
    stroke: '#a78bfa'
  });
  const c = Square('square_slow', {
    x: 470,
    y: 226,
    size: 120,
    stroke: '#fb7185'
  });
  const clock = Circle('circle_clock', {
    x: 620,
    y: 256,
    radius: 52,
    stroke: '#e11d48'
  });
  scene.add(title, a, b, c, clock);
  scene.play(Create(title));
  scene.play(Create(a), Create(b), Create(c), Create(clock));
  return scene;
}
