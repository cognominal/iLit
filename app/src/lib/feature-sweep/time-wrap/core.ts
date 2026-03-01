export type Mode = 'normal' | 'time-wrap';

export type TimeWrapState = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
};

export const DURATION_MS = 6000;
export const FRAME_STEP_MS = 120;

export function clampTime(t: number, durationMs: number): number {
  if (t < 0) return 0;
  if (t > durationMs) return durationMs;
  return t;
}

export function advance(
  currentTimeMs: number,
  deltaMs: number,
  durationMs: number
): number {
  const next = currentTimeMs + deltaMs;
  if (next <= durationMs) return next;
  return durationMs;
}

function easeInOutSine(t01: number): number {
  return -(Math.cos(Math.PI * t01) - 1) / 2;
}

export function evaluateAt(tMs: number, durationMs = DURATION_MS): TimeWrapState {
  const t = clampTime(tMs, durationMs);
  const p = durationMs === 0 ? 0 : t / durationMs;

  const x = 110 + 560 * easeInOutSine(p);
  const y = 230 + Math.sin(p * Math.PI * 2) * 70;
  const scale = 0.8 + 0.45 * (0.5 + 0.5 * Math.sin(p * Math.PI * 4));
  const opacity = 0.35 + 0.65 * (0.5 + 0.5 * Math.cos(p * Math.PI * 2));

  return { x, y, scale, opacity };
}
