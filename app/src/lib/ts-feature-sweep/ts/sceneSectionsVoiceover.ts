import { Circle, Create, Scene, Square, TitleText } from '$lib/feature-sweep/manim-api';

export function buildSceneSectionsVoiceoverScene(): Scene {
  const scene = new Scene(0.9);
  const title = TitleText('title', { x: 400, y: 72, value: 'Scene Sections and Voiceover Hooks', fontSize: 32 });
  const a = Square('square_section_1', { x: 220, y: 280, size: 84, stroke: '#14b8a6' });
  const b = Square('square_section_2', { x: 340, y: 280, size: 84, stroke: '#2dd4bf' });
  const c = Square('square_section_3', { x: 460, y: 280, size: 84, stroke: '#5eead4' });
  const voice = Circle('circle_voice', { x: 620, y: 236, radius: 52, stroke: '#eab308' });
  scene.add(title, a, b, c, voice);
  scene.play(Create(title));
  scene.play(Create(a), Create(b), Create(c), Create(voice));
  return scene;
}
