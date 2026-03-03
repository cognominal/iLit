<script lang="ts">
  import { tsScripts } from '$lib/ts-feature-sweep/catalog';

  const routes = tsScripts.flatMap((script) =>
    script.scenes.map((scene) => ({
      label: `${script.title} / ${scene.title}`,
      href: `/ts-scenes/${script.id}/${scene.id}`,
      description: scene.description
    }))
  );
</script>

<section class="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
  <h1 class="text-2xl font-semibold text-slate-100">TS-Based Feature Sweep</h1>
  <p class="max-w-2xl text-slate-300">
    These routes are driven from TypeScript scene modules, not per-scene
    Svelte files.
  </p>
  <ul class="space-y-2">
    {#each routes as route}
      <li class="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
        <a class="text-cyan-300 underline" href={route.href}>{route.label}</a>
        <p class="mt-1 text-sm text-slate-300">{route.description}</p>
      </li>
    {/each}
  </ul>
</section>
