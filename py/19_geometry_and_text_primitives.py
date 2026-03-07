from manim import (
    Arc,
    Arrow,
    Brace,
    BulletedList,
    Circle,
    Create,
    Cross,
    DOWN,
    Ellipse,
    FadeIn,
    MarkupText,
    Paragraph,
    Polygon,
    Rectangle,
    RegularPolygon,
    RIGHT,
    RoundedRectangle,
    Scene,
    SurroundingRectangle,
    Tex,
    Text,
    Title,
    Triangle,
    Underline,
    VGroup,
    Vector,
)


class GeometryAndTextPrimitives(Scene):
    def construct(self):
        title = Title("Geometry and Text Primitives")

        shapes = VGroup(
            Rectangle(width=1.8, height=1.0, color="#38BDF8"),
            RoundedRectangle(
                width=1.8,
                height=1.0,
                corner_radius=0.18,
                color="#22C55E",
            ),
            Triangle(color="#F59E0B"),
            RegularPolygon(5, radius=0.7, color="#E879F9"),
            Ellipse(width=1.9, height=1.1, color="#FB7185"),
            Arc(radius=0.7, angle=3.14 / 2, color="#A78BFA"),
        ).arrange(RIGHT, buff=0.5).scale(0.75)
        shapes.next_to(title, DOWN, buff=0.8)

        polygon = Polygon(
            [-0.9, 0.0, 0.0],
            [-0.4, -0.7, 0.0],
            [0.4, -0.6, 0.0],
            [0.9, 0.1, 0.0],
            [0.2, 0.8, 0.0],
            color="#2DD4BF",
        )
        arrow = Arrow([-1.1, 0.0, 0.0], [1.1, 0.0, 0.0], color="#F97316")
        vector = Vector([1.3, 0.7, 0.0], color="#84CC16")
        geometry = VGroup(polygon, arrow, vector).arrange(RIGHT, buff=0.7)
        geometry.next_to(shapes, DOWN, buff=0.8)

        label = Text("Anchor label", font_size=24)
        surround = SurroundingRectangle(label, color="#EAB308", buff=0.16)
        underline = Underline(label, color="#F43F5E")
        strike = Cross(label, color="#F43F5E")
        brace = Brace(label, direction=[0, -1, 0], color="#38BDF8")
        annotated = VGroup(label, surround, underline, strike, brace)
        annotated.next_to(geometry, DOWN, buff=0.8)

        markup = MarkupText(
            '<span fgcolor="#93C5FD">Markup</span> text',
            font_size=26,
        )
        paragraph = Paragraph(
            "Paragraph first line",
            "Paragraph second line",
            alignment="left",
            font_size=22,
        )
        tex = Tex(r"$\int_0^1 x^2\,dx = \frac{1}{3}$")
        bullets = BulletedList("Rectangle", "Polygon", "Tex", font_size=22)
        text_block = VGroup(markup, paragraph, tex, bullets).arrange(
            DOWN, buff=0.35
        )
        text_block.scale(0.85)
        text_block.to_edge(RIGHT, buff=0.6)
        text_block.shift([0, -0.5, 0])

        self.add(title)
        self.play(Create(shapes), Create(geometry))
        self.play(FadeIn(annotated), FadeIn(text_block))
        self.wait(0.8)
