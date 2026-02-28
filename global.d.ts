declare function $state<T>(initial: T): T;

declare function $derived<T>(value: T): T;

declare namespace $derived {
  function by<T>(fn: () => T): T;
}

declare function $effect(fn: () => void | (() => void)): void;

declare function $props<T>(): T;
