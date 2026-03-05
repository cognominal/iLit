<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { Annotation, EditorState } from '@codemirror/state';
  import { EditorView } from '@codemirror/view';
  import { python } from '@codemirror/lang-python';
  import { javascript } from '@codemirror/lang-javascript';
  import { oneDark } from '@codemirror/theme-one-dark';

  type Language = 'python' | 'typescript';

  const {
    value,
    language,
    heightClass = 'h-72',
    editable = false,
    onChange
  }: {
    value: string;
    language: Language;
    heightClass?: string;
    editable?: boolean;
    onChange?: (next: string) => void;
  } = $props();

  let host: HTMLDivElement | null = null;
  let view: EditorView | null = null;
  const syncAnnotation = Annotation.define<boolean>();

  function extensionFor(lang: Language) {
    return lang === 'python' ? python() : javascript({ typescript: true });
  }

  function buildEditor(): void {
    if (!host) return;
    view?.destroy();
    const state = EditorState.create({
      doc: value,
      extensions: [
        oneDark,
        extensionFor(language),
        EditorState.readOnly.of(!editable),
        EditorView.editable.of(editable),
        EditorView.updateListener.of((update) => {
          if (update.transactions.some((tx) => tx.annotation(syncAnnotation))) {
            return;
          }
          if (!update.docChanged || !onChange) return;
          onChange(update.state.doc.toString());
        }),
        EditorView.lineWrapping
      ]
    });
    view = new EditorView({ state, parent: host });
  }

  onMount(() => {
    buildEditor();
  });

  onDestroy(() => {
    view?.destroy();
  });
</script>

<div class={`${heightClass} overflow-hidden rounded-lg border border-slate-700`}>
  <div bind:this={host} class="h-full overflow-hidden"></div>
</div>

<style>
  :global(.cm-editor) {
    height: 100%;
  }

  :global(.cm-scroller) {
    overflow: auto;
  }
</style>
