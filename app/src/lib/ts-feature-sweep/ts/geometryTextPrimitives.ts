import {
  Arc,
  Arrow,
  Brace,
  BulletedList,
  Create,
  Cross,
  Ellipse,
  FadeIn,
  MarkupText,
  Paragraph,
  Polygon,
  Rectangle,
  RegularPolygon,
  RoundedRectangle,
  Scene,
  SurroundingRectangle,
  Tex,
  Text,
  Title,
  Triangle,
  Underline,
  Vector,
  VGroup,
  DOWN,
  RIGHT,
} from '$lib/manim';

export function buildGeometryTextPrimitivesScene(): Scene {
  const scene = new Scene(0.9);
  const title = Title('Geometry and Text Primitives', {
    id: 'title',
    fontSize: 44
  });

  const shapes = VGroup(
    Rectangle({
      id: 'rect',
      width: 144,
      height: 80,
      color: '#38BDF8',
      strokeWidth: 4
    }),
    RoundedRectangle({
      id: 'rounded',
      width: 144,
      height: 80,
      cornerRadius: 14,
      color: '#22C55E',
      strokeWidth: 4
    }),
    Triangle('triangle', {
      size: 82,
      color: '#F59E0B',
      strokeWidth: 4
    }),
    RegularPolygon(5, {
      id: 'pentagon',
      radius: 56,
      color: '#E879F9',
      strokeWidth: 4
    }),
    Ellipse({
      id: 'ellipse',
      width: 152,
      height: 88,
      color: '#FB7185',
      strokeWidth: 4
    }),
    Arc({
      id: 'arc',
      radius: 56,
      angle: Math.PI / 2,
      color: '#A78BFA',
      strokeWidth: 4
    })
  ).arrange!(RIGHT, 0.5).scale!(0.75);
  shapes.nextTo!(title, DOWN, 0.8);

  const polygon = Polygon(
    'polygon',
    [-0.9, 0.0, 0.0],
    [-0.4, -0.7, 0.0],
    [0.4, -0.6, 0.0],
    [0.9, 0.1, 0.0],
    [0.2, 0.8, 0.0],
    { color: '#2DD4BF', strokeWidth: 4 }
  );
  const arrow = Arrow([-1.1, 0.0, 0.0], [1.1, 0.0, 0.0], {
    id: 'arrow',
    color: '#F97316',
    strokeWidth: 4
  });
  const vector = Vector([1.3, 0.7, 0.0], {
    id: 'vector',
    color: '#84CC16',
    strokeWidth: 4
  });
  const geometry = VGroup('geometry', polygon, arrow, vector)
    .arrange!(RIGHT, 0.7);
  geometry.nextTo!(shapes, DOWN, 0.8);

  const label = Text('Anchor label', {
    id: 'label',
    fontSize: 24
  });
  const surround = SurroundingRectangle(label, {
    id: 'surround',
    color: '#EAB308',
    buff: 12,
    strokeWidth: 4
  });
  const underline = Underline(label, {
    id: 'underline',
    color: '#F43F5E',
    strokeWidth: 3,
    buff: 3
  });
  const strike = Cross(label, {
    id: 'cross',
    color: '#F43F5E',
    strokeWidth: 3
  });
  const brace = Brace(label, {
    id: 'brace',
    direction: DOWN,
    color: '#38BDF8',
    strokeWidth: 3,
    buff: 10
  });
  const annotated = VGroup(
    'annotated',
    label,
    surround,
    underline,
    strike,
    brace
  );
  annotated.nextTo!(geometry, DOWN, 0.8);

  const markup = MarkupText(
    '<span fgcolor="#93C5FD">Markup</span> text',
    {
      id: 'markup',
      fontSize: 26
    }
  );
  const paragraph = Paragraph(
    'Paragraph first line',
    'Paragraph second line',
    {
      id: 'paragraph',
      fontSize: 22,
      alignment: 'left'
    }
  );
  const tex = Tex('tex', String.raw`$\int_0^1 x^2\,dx = \frac{1}{3}$`, {
    fontSize: 26,
    color: '#E2E8F0'
  });
  const bullets = BulletedList('Rectangle', 'Polygon', 'Tex', {
    id: 'bullets',
    fontSize: 22,
    color: '#E2E8F0'
  });
  const textBlock = VGroup('text_block', markup, paragraph, tex, bullets)
    .arrange!(DOWN, 0.35)
    .scale!(0.85);
  textBlock.toEdge!(RIGHT, 0.6).shift!([0, -0.5, 0]);

  scene.add(title);
  scene.play(Create(shapes), Create(geometry));
  scene.play(FadeIn(annotated), FadeIn(textBlock));
  scene.wait(0.8);
  return scene;
}
