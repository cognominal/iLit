<script lang="ts">
  import '../app.css';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { tsScripts } from '$lib/ts-feature-sweep/catalog';
  import { onMount } from 'svelte';

  const { children } = $props<{ children: () => unknown }>();

  const tsOptions = tsScripts.flatMap((script) =>
    script.scenes.map((scene) => ({
      label: `${script.title} / ${scene.title}`,
      value: `/ts-scenes/${script.id}/${scene.id}`
    }))
  );

  const current = $derived(page.url.pathname);
  const captureMode = $derived(page.url.searchParams.get('capture') === '1');
  const isTsSweepRoute = $derived(
    current === '/ts-sweep' ||
      current === '/gpu-sweep' ||
      current.startsWith('/ts-scenes/')
  );
  const isTsSceneRoute = $derived(current.startsWith('/ts-scenes/'));
  const scenePickerLabel = 'TS scenes';
  const tsSceneLayoutMode = $derived(
    page.url.searchParams.get('layout') === 'code-only'
      ? 'code-only'
      : 'default'
  );
  const tsSceneNextLayoutMode = $derived(
    tsSceneLayoutMode === 'default' ? 'code-only' : 'default'
  );
  const sourcePaneStorageKey = $derived.by(() => {
    if (!isTsSceneRoute) return '';
    const parts = current.split('/');
    const scriptId = parts[2];
    const sceneId = parts[3];
    if (!scriptId || !sceneId) return '';
    return `ts-scene-source-pane:v1:${scriptId}:${sceneId}`;
  });
  let pythonPaneOpen = $state(false);

  function readPythonPaneState(): void {
    if (!browser || !sourcePaneStorageKey) return;
    const raw = localStorage.getItem(sourcePaneStorageKey);
    if (!raw) {
      pythonPaneOpen = false;
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { pythonPaneOpen?: boolean };
      pythonPaneOpen = parsed.pythonPaneOpen ?? false;
    } catch {
      pythonPaneOpen = false;
    }
  }

  function openPythonPane(): void {
    if (!browser || !sourcePaneStorageKey) return;
    pythonPaneOpen = true;
    localStorage.setItem(
      sourcePaneStorageKey,
      JSON.stringify({ pythonPaneOpen: true })
    );
    window.dispatchEvent(new CustomEvent('ts-source-pane-request', {
      detail: { key: sourcePaneStorageKey, open: true }
    }));
  }

  onMount(() => {
    if (!browser) return;
    const onPaneChange = (event: Event) => {
      const custom = event as CustomEvent<{ key?: string; open?: boolean }>;
      if (custom.detail?.key !== sourcePaneStorageKey) return;
      pythonPaneOpen = Boolean(custom.detail?.open);
    };
    window.addEventListener('ts-source-pane-change', onPaneChange as EventListener);
    return () => {
      window.removeEventListener(
        'ts-source-pane-change',
        onPaneChange as EventListener
      );
    };
  });

  $effect(() => {
    if (!browser || !isTsSceneRoute) return;
    sourcePaneStorageKey;
    readPythonPaneState();
  });

  async function onTsChange(event: Event): Promise<void> {
    const target = event.currentTarget as HTMLSelectElement;
    const next = target.value;
    if (!next || next === current) return;
    const nextUrl = new URL(next, page.url);
    if (isTsSceneRoute && tsSceneLayoutMode === 'code-only') {
      nextUrl.searchParams.set('layout', 'code-only');
    }
    await goto(`${nextUrl.pathname}${nextUrl.search}`);
  }

  async function toggleTsSceneLayout(): Promise<void> {
    if (!isTsSceneRoute) return;
    const nextUrl = new URL(page.url);
    nextUrl.searchParams.set('layout', tsSceneNextLayoutMode);
    await goto(`${nextUrl.pathname}${nextUrl.search}`, {
      keepFocus: true,
      noScroll: true,
      replaceState: true
    });
  }

</script>

<div class="min-h-screen bg-slate-950 text-slate-100">
  {#if !captureMode}
    {#if isTsSceneRoute}
      <header class="h-14 border-b border-slate-800">
        <div
          class="grid h-full w-full"
          style="grid-template-columns: var(--ts-left-pane, 52%) 1fr;"
        >
          <div
            class="flex h-full items-center gap-4 border-r border-slate-800
            bg-slate-900/95 px-4"
          >
            <a href="/" class="text-sm font-semibold tracking-wide text-cyan-300">
              Feature Sweep
            </a>
            <a
              href="/dlxn"
              class="text-sm font-medium text-slate-300 hover:text-cyan-300"
            >
              DLXn
            </a>
            <a
              href="/ts-sweep"
              class="text-sm font-medium hover:text-cyan-300"
              class:text-cyan-300={isTsSweepRoute}
              class:text-slate-300={!isTsSweepRoute}
            >
              ts sweep
            </a>
            <button
              class="rounded-md border border-slate-700 bg-slate-950 px-2 py-1
              text-xs font-medium text-slate-300 hover:text-cyan-300"
              onclick={toggleTsSceneLayout}
              type="button"
            >
              {tsSceneNextLayoutMode === 'code-only'
                ? 'code only'
                : 'default'}
            </button>
          </div>
          <div class="flex h-full items-center gap-3 bg-slate-950 px-4">
            <span
              class="text-xs font-semibold uppercase tracking-wide text-cyan-300"
            >
              Source pane
            </span>
            {#if tsSceneLayoutMode === 'default' && !pythonPaneOpen}
              <button
                class="rounded border border-slate-700 px-2 py-1 text-xs
                text-slate-300 hover:text-cyan-300"
                onclick={openPythonPane}
                type="button"
              >
                python
              </button>
            {/if}
            <label class="ml-auto flex min-w-0 items-center gap-2 text-sm">
              <span class="text-slate-300">{scenePickerLabel}</span>
              <select
                class="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950
                px-3 py-1.5 text-sm"
                onchange={onTsChange}
                value={tsOptions.some((opt) => opt.value === current)
                  ? current
                  : ''}
              >
                <option value="">Select TS scene...</option>
                {#each tsOptions as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
            </label>
          </div>
        </div>
      </header>
    {:else}
      <header class="h-14 border-b border-slate-800 bg-slate-900/95">
        <div class="flex h-full w-full items-center gap-4 px-4">
          <a href="/" class="text-sm font-semibold tracking-wide text-cyan-300">
            Feature Sweep
          </a>
          <a
            href="/dlxn"
            class="text-sm font-medium text-slate-300 hover:text-cyan-300"
          >
            DLXn
          </a>
          <a
            href="/ts-sweep"
            class="text-sm font-medium hover:text-cyan-300"
            class:text-cyan-300={isTsSweepRoute}
            class:text-slate-300={!isTsSweepRoute}
          >
            ts sweep
          </a>
          {#if isTsSweepRoute}
            <label class="ml-auto flex items-center gap-2 text-sm">
              <span class="text-slate-300">{scenePickerLabel}</span>
              <select
                class="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm"
                onchange={onTsChange}
                value={tsOptions.some((opt) => opt.value === current)
                  ? current
                  : ''}
              >
                <option value="">Select TS scene...</option>
                {#each tsOptions as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
            </label>
          {/if}
        </div>
      </header>
    {/if}
  {/if}

  <main
    class={captureMode
      ? 'h-screen overflow-hidden'
      : isTsSceneRoute
        ? 'h-[calc(100vh-3.5rem)] w-full overflow-hidden'
        : 'w-full px-4 py-6'}
  >
    {@render children()}
  </main>
</div>
