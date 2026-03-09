
# ts-sweep

Currently the API parity with manim CE is still very low.
The ts manim implementation is
[manim-api.ts](/Users/cog/mine/dlx_sv/app/src/lib/manim-api.ts).

And there is a lot of work to make the example in /ts-sweep work.
And some are dubious to be begin with.

But we have reached a step where incremental work becomes easier

### creating an UI for iterative improvement

We created a UI to show

- `py` side : the original `.py` file, the resulting `.mp4` generated,
- `ts` side : the .ts file, the interactive scene (now just time warp with a
slider), the resulting `.mp4` generated.
- the `ts` code mirror pane is writable so we can experiment without asking codex.

State is saved browser side. Panes size, position in codemirror pane...
At each reload after a change we restart where we left of.

### getting something minimal

As a first stages, we try to get feature parity from some random `.py` manim files
codex lifted from somewhere or created out of whole cloth and the
ts imanim files created from that.

Note that with ts, the real deliverable will be a route in a sveltekit app.

Added [geometryTextPrimitives](/Users/cog/mine/dlx_sv/app/src/lib/ts-feature-sweep/ts/geometryTextPrimitives.ts).
Getting to a point we can think supporting  a notebook system.
