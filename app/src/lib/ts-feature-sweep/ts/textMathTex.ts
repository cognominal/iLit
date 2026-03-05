import {
  DOWN,
  FadeIn,
  MathTex,
  Scene,
  TitleText,
  VGroup
} from '$lib/feature-sweep/manim-api';

export function buildTextMathTexScene(): Scene {
  const scene = new Scene(0.9);
  const title = TitleText('title', {
    value: 'Text and MathTex',
    fontSize: 36
  });
  const formula = MathTex('formula', String.raw`e^{i\pi}+1=0`, {
    fontSize: 42,
    color: '#dbeafe',
  });
  const group = VGroup('text-math-group', title, formula);
  group.arrange!(DOWN, 0.7);

  scene.add(group);
  scene.play(FadeIn(title), FadeIn(formula));
  scene.wait(0.7);
  return scene;
}
