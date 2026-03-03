<script lang="ts">
  import TsSceneStage from '$lib/ts-feature-sweep/render/TsSceneStage.svelte';
  import { sceneBuilderFor } from '$lib/ts-feature-sweep/registry';

  const { data } = $props<{
    data: {
      script: {
        id: string;
        title: string;
        source: string;
      };
      scene: {
        id: string;
        title: string;
        description: string;
      };
    };
  }>();

  const builder = $derived(sceneBuilderFor(data.script.id, data.scene.id));
  const scene = $derived(builder?.());

  const totalMs = $derived(
    scene ? scene.timeline.reduce((sum, step) => sum + step.runTimeMs, 0) : 0
  );
  let currentMs = $state(0);

  const progressById = $derived.by(() => {
    if (!scene) return new Map<string, number>();
    const byId = new Map<string, number>();
    let start = 0;

    for (const step of scene.timeline) {
      const end = start + step.runTimeMs;
      const raw = (currentMs - start) / step.runTimeMs;
      const progress = Math.max(0, Math.min(1, raw));
      const previous = byId.get(step.targetId) ?? 0;
      byId.set(step.targetId, Math.max(previous, progress));
      start = end;
    }

    return byId;
  });

  function onScrub(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;
    currentMs = Number(target.value);
  }
</script>

<section class="space-y-4">
  <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
    <p class="text-xs uppercase tracking-wide text-cyan-300">{data.script.source}</p>
    <h1 class="mt-1 text-2xl font-semibold">{data.scene.title}</h1>
    <p class="mt-2 text-slate-300">{data.scene.description}</p>
  </div>

  {#if scene}
    <TsSceneStage mobjects={scene.mobjects} {progressById} />

    <div class="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <label for="ts-timeline" class="text-sm text-slate-300">Timeline</label>
      <input
        id="ts-timeline"
        type="range"
        min="0"
        max={totalMs}
        step="1"
        value={currentMs}
        oninput={onScrub}
      />
      <p class="text-sm tabular-nums text-cyan-300">
        {currentMs} / {totalMs} ms
      </p>
    </div>
  {:else}
    <div class="rounded-xl border border-rose-800 bg-rose-950/40 p-4 text-rose-200">
      Missing TS scene builder.
    </div>
  {/if}
</section>
