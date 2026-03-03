from manim import Create, ReplacementTransform, Scene, Text, VMobject


class PathToPathMorphing(Scene):
    def construct(self):
        title = Text("Path to Path Morph", font_size=40).to_edge(0.9 * 1j)

        zig = VMobject(color="#4CC9F0", stroke_width=7)
        zig.set_points_as_corners([
            [-3.0, 0.6, 0.0],
            [-2.0, -0.8, 0.0],
            [-1.0, 0.9, 0.0],
            [0.0, -0.8, 0.0],
            [1.0, 0.6, 0.0],
        ])

        loop = VMobject(color="#F72585", stroke_width=7)
        loop.set_points_as_corners([
            [-2.8, 0.1, 0.0],
            [-1.7, -0.9, 0.0],
            [-0.3, -0.9, 0.0],
            [0.9, 0.1, 0.0],
            [-0.3, 1.1, 0.0],
            [-1.7, 1.1, 0.0],
            [-2.8, 0.1, 0.0],
        ])

        self.add(title, zig, loop)
        loop.set_opacity(0)

        self.play(Create(zig))
        self.play(ReplacementTransform(zig, loop), run_time=1.3)
        self.wait(0.8)
