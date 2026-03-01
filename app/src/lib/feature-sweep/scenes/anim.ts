export function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

export function progressWindow(
  timeMs: number,
  startMs: number,
  durationMs: number,
): number {
  if (durationMs <= 0) return timeMs >= startMs ? 1 : 0;
  return clamp01((timeMs - startMs) / durationMs);
}

export function phase(timeMs: number, periodMs: number): number {
  if (periodMs <= 0) return 0;
  const wrapped = ((timeMs % periodMs) + periodMs) % periodMs;
  return wrapped / periodMs;
}
