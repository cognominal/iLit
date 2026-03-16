<script lang="ts">
  import { browser } from '$app/environment';
  import { onDestroy, onMount } from 'svelte';
  import { Annotation, EditorSelection, EditorState } from '@codemirror/state';
  import { foldGutter, foldKeymap } from '@codemirror/language';
  import { EditorView, keymap, lineNumbers } from '@codemirror/view';
  import { python } from '@codemirror/lang-python';
  import { javascript } from '@codemirror/lang-javascript';
  import { oneDark } from '@codemirror/theme-one-dark';

  type Language = 'python' | 'typescript';

  export type CodeMirrorViewState = {
    selectionAnchor: number;
    selectionHead: number;
    scrollTop: number;
    scrollLeft: number;
  };

  const {
    value,
    language,
    heightClass = 'h-72',
    editable = false,
    testId,
    focusRequestKey = 0,
    onChange,
    initialViewState,
    onViewStateChange
  }: {
    value: string;
    language: Language;
    heightClass?: string;
    editable?: boolean;
    testId?: string;
    focusRequestKey?: number;
    onChange?: (next: string) => void;
    initialViewState?: CodeMirrorViewState | null;
    onViewStateChange?: (next: CodeMirrorViewState) => void;
  } = $props();

  let host: HTMLDivElement | null = null;
  let view: EditorView | null = null;
  const syncAnnotation = Annotation.define<boolean>();
  let lastDoc = '';
  let lastLanguage: Language | null = null;
  let lastEditable: boolean | null = null;
  let lastFocusRequestKey = 0;
  let pendingScrollFrame = 0;

  function clampPos(pos: number, docLength: number): number {
    return Math.max(0, Math.min(docLength, pos));
  }

  function currentViewState(): CodeMirrorViewState | null {
    if (!view) return null;
    return {
      selectionAnchor: view.state.selection.main.anchor,
      selectionHead: view.state.selection.main.head,
      scrollTop: view.scrollDOM.scrollTop,
      scrollLeft: view.scrollDOM.scrollLeft,
    };
  }

  function emitViewState(): void {
    const next = currentViewState();
    if (!next || !onViewStateChange) return;
    onViewStateChange(next);
  }

  function applyViewState(next: CodeMirrorViewState | null): void {
    if (!view || !next) return;
    const docLength = view.state.doc.length;
    const anchor = clampPos(next.selectionAnchor, docLength);
    const head = clampPos(next.selectionHead, docLength);
    const current = view.state.selection.main;
    if (current.anchor !== anchor || current.head !== head) {
      view.dispatch({
        selection: EditorSelection.single(anchor, head),
        annotations: syncAnnotation.of(true),
      });
    }
    if (browser) {
      cancelAnimationFrame(pendingScrollFrame);
      pendingScrollFrame = requestAnimationFrame(() => {
        if (!view) return;
        view.scrollDOM.scrollTop = next.scrollTop;
        view.scrollDOM.scrollLeft = next.scrollLeft;
      });
    }
  }

  function extensionFor(lang: Language) {
    return lang === 'python' ? python() : javascript({ typescript: true });
  }

  function buildEditor(): void {
    if (!host) return;
    view?.scrollDOM.removeEventListener('scroll', emitViewState);
    view?.destroy();
    const docLength = value.length;
    const selection = initialViewState
      ? EditorSelection.single(
          clampPos(initialViewState.selectionAnchor, docLength),
          clampPos(initialViewState.selectionHead, docLength)
        )
      : undefined;
    const state = EditorState.create({
      doc: value,
      selection,
      extensions: [
        oneDark,
        lineNumbers(),
        foldGutter(),
        extensionFor(language),
        EditorState.readOnly.of(!editable),
        EditorView.editable.of(editable),
        keymap.of(foldKeymap),
        EditorView.updateListener.of((update) => {
          if (update.transactions.some((tx) => tx.annotation(syncAnnotation))) {
            return;
          }
          if (update.docChanged && onChange) {
            onChange(update.state.doc.toString());
          }
          if (update.docChanged || update.selectionSet || update.viewportChanged) {
            emitViewState();
          }
        }),
        EditorView.lineWrapping
      ]
    });
    view = new EditorView({ state, parent: host });
    applyViewState(initialViewState ?? null);
    view.scrollDOM.addEventListener('scroll', emitViewState, { passive: true });
  }

  onMount(() => {
    buildEditor();
    lastDoc = value;
    lastLanguage = language;
    lastEditable = editable;
  });

  $effect(() => {
    if (!host) return;
    if (
      value !== lastDoc ||
      language !== lastLanguage ||
      editable !== lastEditable
    ) {
      buildEditor();
      lastDoc = value;
      lastLanguage = language;
      lastEditable = editable;
      return;
    }
    applyViewState(initialViewState ?? null);
  });

  $effect(() => {
    if (!view) return;
    if (focusRequestKey === lastFocusRequestKey) return;
    lastFocusRequestKey = focusRequestKey;
    const head = view.state.selection.main.head;
    view.dispatch({
      effects: EditorView.scrollIntoView(head, { y: 'center' }),
      annotations: syncAnnotation.of(true),
    });
    view.focus();
  });

  onDestroy(() => {
    if (browser) {
      cancelAnimationFrame(pendingScrollFrame);
    }
    view?.scrollDOM.removeEventListener('scroll', emitViewState);
    view?.destroy();
  });
</script>

<div
  data-testid={testId}
  class={`${heightClass} overflow-hidden rounded-lg border border-slate-700`}
>
  <div bind:this={host} class="h-full overflow-hidden"></div>
</div>

<style>
  :global(.cm-editor) {
    height: 100%;
  }

  :global(.cm-scroller) {
    overflow: auto;
  }

  :global(.cm-gutters) {
    border-right: 1px solid rgb(51 65 85);
    background: rgb(15 23 42 / 0.92);
  }
</style>
