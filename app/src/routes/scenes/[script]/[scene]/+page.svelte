<script lang="ts">
  import {
    createTimelineControllerState,
    progress01,
    reduceTimelineState,
    type Mode,
    type TimelineCommand,
  } from '$lib/feature-sweep/core/timeline-controller';
  import { page } from '$app/state';
  import { FRAME_STEP_MS } from '$lib/feature-sweep/time-wrap/core';
  import { sceneComponentFor } from '$lib/feature-sweep/registry';

  const { data } = $props<{
    data: {
      script: {
        id: string;
        title: string;
        file: string;
      };
      scene: {
        id: string;
        title: string;
        description: string;
      };
    };
  }>();

  let timeline = $state(createTimelineControllerState(6000, FRAME_STEP_MS));
  let exportingProfile = $state<null | 'lowres' | 'medres' | 'hires'>(null);
  let exportMessage = $state('');
  let exportError = $state('');
  let exportReport = $state<{
    path: string;
    folderPath: string;
    report: {
      durationSec: number;
      width: number;
      height: number;
      fps: number;
      bitrateKbps: number;
      sizeBytes: number;
    };
    thumbnail: string;
  } | null>(null);

  const SceneComponent = $derived(
    sceneComponentFor(data.script.id, data.scene.id)
  );

  const progress = $derived(progress01(timeline));
  const captureMode = $derived(page.url.searchParams.get('capture') === '1');

  function dispatch(command: TimelineCommand): void {
    timeline = reduceTimelineState(timeline, command);
  }

  $effect(() => {
    // Reset timeline state whenever the route-scene identity changes.
    data.script.id;
    data.scene.id;
    timeline = createTimelineControllerState(6000, FRAME_STEP_MS);
  });

  function onModeChange(next: Mode): void {
    dispatch({ type: 'setMode', mode: next });
  }

  function onSliderInput(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;
    dispatch({ type: 'seek', timeMs: Number(target.value) });
  }

  async function exportMp4(profile: 'lowres' | 'medres' | 'hires'): Promise<void> {
    if (exportingProfile) return;
    exportingProfile = profile;
    exportMessage = '';
    exportError = '';
    exportReport = null;

    try {
      const endpoint = `/scenes/${data.script.id}/${data.scene.id}/render-mp4`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ profile })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `request failed (${response.status})`);
      }

      const result = await response.json() as {
        path: string;
        folderPath: string;
        report: {
          durationSec: number;
          width: number;
          height: number;
          fps: number;
          bitrateKbps: number;
          sizeBytes: number;
        };
        thumbnail: string;
      };
      exportReport = result;
      exportMessage = `Created ${profile}.`;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'export failed';
      exportError = `MP4 export failed: ${message}`;
    } finally {
      exportingProfile = null;
    }
  }

  function bytesToMb(bytes: number): string {
    return (bytes / (1024 * 1024)).toFixed(2);
  }

  async function openExportFolder(): Promise<void> {
    if (!exportReport) return;
    const endpoint = `/scenes/${data.script.id}/${data.scene.id}/open-folder`;
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ folderPath: exportReport.folderPath }),
    });
  }

  async function copyExportPath(): Promise<void> {
    if (!exportReport) return;
    await navigator.clipboard.writeText(exportReport.path);
  }

  function dismissExportReport(): void {
    exportReport = null;
  }

  function onGlobalPointerDown(event: PointerEvent): void {
    if (!exportReport) return;
    const target = event.target;
    if (!(target instanceof Element)) {
      exportReport = null;
      return;
    }
    if (!target.closest('[data-export-report]')) {
      exportReport = null;
    }
  }

  const sceneContainerStyle = $derived(
    `opacity:${0.72 + progress * 0.28};` +
      `transform:translateY(${(1 - progress) * 4}px) scale(${0.985 + progress * 0.015});`,
  );

  $effect(() => {
    if (timeline.mode !== 'normal' || !timeline.isPlaying) return;

    let raf = 0;

    const tick = (now: number) => {
      dispatch({ type: 'tick', nowMs: now });
      if (timeline.mode === 'normal' && timeline.isPlaying) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
    };
  });
</script>

<svelte:window onpointerdown={onGlobalPointerDown} />

<section class={captureMode ? 'h-full' : 'space-y-4'}>
  {#if !captureMode}
    <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p class="text-xs uppercase tracking-wide text-cyan-300">{data.script.file}</p>
      <h1 class="mt-1 text-2xl font-semibold">{data.scene.title}</h1>
      <p class="mt-2 text-slate-300">{data.scene.description}</p>
    </div>
  {/if}

  {#if !captureMode}
    <div class="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 md:grid-cols-[auto_1fr_auto]">
    <div class="flex min-w-44 items-center gap-2">
      <label class="text-sm text-slate-300" for="mode">Mode</label>
      <select
        id="mode"
        class="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
        value={timeline.mode}
        onchange={(e) => onModeChange((e.currentTarget as HTMLSelectElement).value as Mode)}
      >
        <option value="normal">normal</option>
        <option value="time-wrap">time-wrap</option>
      </select>
    </div>

    <input
      class="w-full"
      type="range"
      min="0"
      max={timeline.durationMs}
      step="1"
      value={timeline.currentTimeMs}
      oninput={onSliderInput}
      aria-label="Time slider"
    />

    <div class="w-32 text-right text-sm tabular-nums text-cyan-300">
      {Math.round(timeline.currentTimeMs)} ms
    </div>

    <div class="flex flex-wrap gap-2 md:col-span-3">
      <button class="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm" onclick={() => dispatch({ type: 'prev' })}>Prev</button>
      <button class="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm" onclick={() => dispatch({ type: 'playPause' })}>
        {timeline.isPlaying ? 'Pause' : 'Play'}
      </button>
      <button class="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm" onclick={() => dispatch({ type: 'next' })}>Next</button>
      <button class="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm" onclick={() => dispatch({ type: 'reset' })}>Reset</button>
      <button
        class="rounded-md border border-emerald-700 bg-emerald-950/60 px-3 py-1.5 text-sm disabled:opacity-60"
        onclick={() => exportMp4('lowres')}
        disabled={Boolean(exportingProfile)}
      >
        {exportingProfile === 'lowres' ? 'lowres...' : 'lowres'}
      </button>
      <button
        class="rounded-md border border-emerald-700 bg-emerald-950/60 px-3 py-1.5 text-sm disabled:opacity-60"
        onclick={() => exportMp4('medres')}
        disabled={Boolean(exportingProfile)}
      >
        {exportingProfile === 'medres' ? 'medres...' : 'medres'}
      </button>
      <button
        class="rounded-md border border-emerald-700 bg-emerald-950/60 px-3 py-1.5 text-sm disabled:opacity-60"
        onclick={() => exportMp4('hires')}
        disabled={Boolean(exportingProfile)}
      >
        {exportingProfile === 'hires' ? 'hires...' : 'hires'}
      </button>
      <div class="ml-auto min-w-44 text-right text-sm text-slate-300">
        progress: {(progress * 100).toFixed(1)}%
      </div>
    </div>
    {#if exportMessage}
      <div class="md:col-span-3 text-sm text-emerald-300">{exportMessage}</div>
    {/if}
    {#if exportError}
      <div class="md:col-span-3 text-sm text-rose-300">{exportError}</div>
    {/if}
    {#if exportReport}
      <div
        data-export-report
        class="md:col-span-3 rounded-lg border border-slate-700 bg-slate-950/70
        p-3 text-sm text-slate-200"
      >
        <div class="flex items-start gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-cyan-300">MP4 report</span>
              <button
                class="ml-auto rounded border border-slate-600 px-2 py-1 text-xs"
                onclick={dismissExportReport}
                aria-label="Dismiss MP4 report"
              >
                x
              </button>
            </div>
            <div class="mt-2 flex items-center gap-2">
              <p class="min-w-0 flex-1 break-all text-xs text-slate-300">
                {exportReport.path}
              </p>
              <button
                class="rounded border border-slate-600 p-1.5 text-xs"
                onclick={copyExportPath}
                aria-label="Copy file path"
                title="Copy file path"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  class="h-4 w-4"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
              <button
                class="rounded border border-slate-600 px-2 py-1 text-xs"
                onclick={openExportFolder}
              >
                Open folder
              </button>
            </div>
            <div class="mt-2 grid gap-1 text-xs sm:grid-cols-2">
              <div>duration: {exportReport.report.durationSec.toFixed(2)}s</div>
              <div>size: {bytesToMb(exportReport.report.sizeBytes)} MB</div>
              <div>
                resolution: {exportReport.report.width}x{exportReport.report.height}
              </div>
              <div>fps: {exportReport.report.fps.toFixed(2)}</div>
              <div>bitrate: {exportReport.report.bitrateKbps.toFixed(0)} kbps</div>
            </div>
          </div>
          <img
            class="w-48 shrink-0 rounded border border-slate-700"
            src={exportReport.thumbnail}
            alt="Exported scene thumbnail"
          />
        </div>
      </div>
    {/if}
    </div>
  {/if}

  {#if SceneComponent}
    <div style={sceneContainerStyle} class={captureMode ? 'h-full' : ''}>
      <SceneComponent
        timeMs={timeline.currentTimeMs}
        mode={timeline.mode}
        progress={progress}
      />
    </div>
  {:else}
    <div class="rounded-xl border border-amber-700/60 bg-amber-950/40 p-4 text-amber-100">
      Not implemented yet in Svelte: {data.script.id}/{data.scene.id}
    </div>
  {/if}
</section>
