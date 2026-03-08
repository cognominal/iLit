from manim import (
    Create,
    CubicBezier,
    DOWN,
    Dot,
    FadeOut,
    Polygon,
    Rectangle,
    ReplacementTransform,
    Scene,
    Text,
    UP,
    VGroup,
)


UNIT = 1.0
NODE_W = 1.5
NODE_H = 0.56
DOT_R = 0.06
STROKE = 2.0
FONT = 26
LINE = "#F8FAFC"
FILL = "#0F172A"
FILL_ACCENT = "#334155"
TEXT = "#E2E8F0"


def bezier_arrow(name, start, end, lift, color=LINE):
    c1 = [start[0] + (end[0] - start[0]) * 0.25, start[1] + lift, 0.0]
    c2 = [start[0] + (end[0] - start[0]) * 0.75, end[1] + lift, 0.0]
    shaft = CubicBezier(start, c1, c2, end, color=color, stroke_width=STROKE)
    tip_dx = 0.12 if start[0] <= end[0] else -0.12
    tip = Polygon(
        [end[0], end[1], 0.0],
        [end[0] - tip_dx, end[1] + 0.08, 0.0],
        [end[0] - tip_dx, end[1] - 0.08, 0.0],
        color=color,
        fill_color=color,
        fill_opacity=1.0,
        stroke_width=0,
    )
    return VGroup(shaft, tip)


def loop_arrow(name, left, right, y, color=LINE):
    start = [right, y, 0.0]
    end = [left, y, 0.0]
    c1 = [right + 0.4, y - 0.45, 0.0]
    c2 = [left - 0.4, y - 0.45, 0.0]
    shaft = CubicBezier(start, c1, c2, end, color=color, stroke_width=STROKE)
    tip = Polygon(
        [end[0], end[1], 0.0],
        [end[0] + 0.12, end[1] + 0.08, 0.0],
        [end[0] + 0.12, end[1] - 0.08, 0.0],
        color=color,
        fill_color=color,
        fill_opacity=1.0,
        stroke_width=0,
    )
    return VGroup(shaft, tip)


def make_node(name, center, fill="#f6f6f6"):
    x, y = center
    shell = Rectangle(
        width=NODE_W,
        height=NODE_H,
        color=LINE,
        stroke_width=STROKE,
        fill_color=fill,
        fill_opacity=1.0,
    ).move_to([x, y, 0.0])
    left_div = CubicBezier(
        [x - 0.35, y + NODE_H / 2, 0.0],
        [x - 0.35, y + NODE_H / 6, 0.0],
        [x - 0.35, y - NODE_H / 6, 0.0],
        [x - 0.35, y - NODE_H / 2, 0.0],
        color=LINE,
        stroke_width=STROKE,
    )
    right_div = CubicBezier(
        [x + 0.35, y + NODE_H / 2, 0.0],
        [x + 0.35, y + NODE_H / 6, 0.0],
        [x + 0.35, y - NODE_H / 6, 0.0],
        [x + 0.35, y - NODE_H / 2, 0.0],
        color=LINE,
        stroke_width=STROKE,
    )
    left_dot = Dot([x - 0.55, y, 0.0], radius=DOT_R, color=LINE)
    right_dot = Dot([x + 0.55, y, 0.0], radius=DOT_R, color=LINE)
    return VGroup(shell, left_div, right_div, left_dot, right_dot)


def make_links(xs, y):
    groups = []
    for i in range(len(xs) - 1):
        groups.append(
            bezier_arrow(
                f"f_{i}",
                [xs[i] + 0.3, y + 0.01, 0.0],
                [xs[i + 1] - 0.3, y + 0.01, 0.0],
                0.18,
            )
        )
        groups.append(
            bezier_arrow(
                f"b_{i}",
                [xs[i + 1] - 0.48, y - 0.01, 0.0],
                [xs[i] + 0.48, y - 0.01, 0.0],
                -0.18,
            )
        )
    groups.append(loop_arrow("loop", xs[0] - 0.55, xs[-1] + 0.55, y - 0.32))
    return VGroup(*groups)


class DoublyLinkedListDeletion(Scene):
    def construct(self):
        title = Text(
            "Circular doubly linked list deletion",
            font_size=34,
            color=TEXT,
        )
        title.to_edge(UP).shift(0.15 * UP)

        xs = [-4.4, -1.7, 1.0, 3.7]
        y = 0.45
        nodes = VGroup(
            make_node("n0", (xs[0], y), fill=FILL_ACCENT),
            make_node("n1", (xs[1], y), fill=FILL),
            make_node("n2", (xs[2], y), fill=FILL_ACCENT),
            make_node("n3", (xs[3], y), fill=FILL),
        )
        links = make_links(xs, y)

        bypass_third = VGroup(
            bezier_arrow(
                "skip_f_2",
                [xs[1] + 0.3, y + 0.01, 0.0],
                [xs[3] - 0.3, y + 0.01, 0.0],
                0.75,
            ),
            bezier_arrow(
                "skip_b_2",
                [xs[3] - 0.48, y - 0.01, 0.0],
                [xs[1] + 0.48, y - 0.01, 0.0],
                -0.75,
            ),
        )

        after_third_links = VGroup(
            make_links(xs, y)[0],
            make_links(xs, y)[1],
            bypass_third[0].copy(),
            bypass_third[1].copy(),
            make_links(xs, y)[4],
        )

        bypass_second = VGroup(
            bezier_arrow(
                "skip_f_1",
                [xs[0] + 0.3, y + 0.01, 0.0],
                [xs[3] - 0.3, y + 0.01, 0.0],
                0.82,
            ),
            bezier_arrow(
                "skip_b_1",
                [xs[3] - 0.48, y - 0.01, 0.0],
                [xs[0] + 0.48, y - 0.01, 0.0],
                -0.82,
            ),
        )

        final_links = VGroup(
            bypass_second[0].copy(),
            bypass_second[1].copy(),
            make_links(xs, y)[4].copy(),
        )

        caption = Text(
            "Delete the third node, then the second; update both links first.",
            font_size=FONT,
            color=TEXT,
        ).next_to(nodes, DOWN, buff=0.9)

        self.add(title, nodes, links, caption)
        self.play(Create(nodes), Create(links), Create(caption), run_time=0.8)
        self.wait(0.2)
        self.play(ReplacementTransform(links[2], bypass_third[0]))
        self.play(ReplacementTransform(links[3], bypass_third[1]))
        self.play(ReplacementTransform(links, after_third_links), run_time=0.5)
        self.play(ReplacementTransform(after_third_links[0], bypass_second[0]))
        self.play(ReplacementTransform(after_third_links[1], bypass_second[1]))
        self.play(
            FadeOut(after_third_links[2]),
            FadeOut(after_third_links[3]),
            ReplacementTransform(bypass_second, final_links),
            run_time=0.5,
        )
        self.wait(0.8)
