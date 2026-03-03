<script lang="ts">
  import '../app.css';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { scripts } from '$lib/feature-sweep/catalog';

  const { children } = $props<{ children: () => unknown }>();

  const options = scripts.flatMap((script) =>
    script.scenes.map((scene) => ({
      label: `${script.title} / ${scene.title}`,
      value: `/scenes/${script.id}/${scene.id}`
    }))
  );

  const current = $derived(page.url.pathname);
  const captureMode = $derived(page.url.searchParams.get('capture') === '1');
  const isDlxRoute = $derived(current === '/dlx');
  const isTsSweepRoute = $derived(
    current === '/ts-sweep' || current.startsWith('/ts-scenes/')
  );

  async function onChange(event: Event): Promise<void> {
    const target = event.currentTarget as HTMLSelectElement;
    const next = target.value;
    if (!next || next === current) return;
    await goto(next);
  }
</script>

<div class="min-h-screen bg-slate-950 text-slate-100">
  {#if !captureMode}
    <header class="border-b border-slate-800 bg-slate-900/95">
      <div class="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <a href="/" class="text-sm font-semibold tracking-wide text-cyan-300">
          Feature Sweep
        </a>
        <a
          href="/dlx"
          class="text-sm font-medium text-slate-300 hover:text-cyan-300"
        >
          DLX
        </a>
        <a
          href="/ts-sweep"
          class="text-sm font-medium hover:text-cyan-300"
          class:text-cyan-300={isTsSweepRoute}
          class:text-slate-300={!isTsSweepRoute}
        >
          ts sweep
        </a>
        {#if !isDlxRoute}
          <label class="ml-auto flex items-center gap-2 text-sm">
            <span class="text-slate-300">Scenes</span>
            <select
              class="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm"
              onchange={onChange}
              value={options.some((opt) => opt.value === current) ? current : ''}
            >
              <option value="">Select scene...</option>
              {#each options as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </label>
        {/if}
      </div>
    </header>
  {/if}

  <main class={captureMode ? 'h-screen overflow-hidden' : 'mx-auto max-w-6xl px-4 py-6'}>
    {@render children()}
  </main>
</div>
