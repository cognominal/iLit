import { Circle, Create, Scene, Square, TitleText } from '$lib/feature-sweep/manim-api';

export function buildAxesGraphsPlottingScene(): Scene {
  const scene = new Scene(1);
  const title = TitleText('title', { x: 400, y: 72, value: 'Axes Graphs and Plotting', fontSize: 34 });
  const axisX = Square('axis_x', { x: 360, y: 318, size: 220, stroke: '#0ea5e9' });
  const axisY = Square('axis_y', { x: 280, y: 238, size: 80, stroke: '#38bdf8' });
  const dot = Circle('plot_dot', { x: 466, y: 214, radius: 16, stroke: '#84cc16' });
  scene.add(title, axisX, axisY, dot);
  scene.play(Create(title));
  scene.play(Create(axisX), Create(axisY), Create(dot));
  return scene;
}
