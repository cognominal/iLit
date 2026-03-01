export type TimeWrapState = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
};

export const DURATION_MS = 6000;
export const FRAME_STEP_MS = 120;

function easeInOutSine(t01: number): number {
  return -(Math.cos(Math.PI * t01) - 1) / 2;
}

export function evaluateAt(tMs: number, durationMs = DURATION_MS): TimeWrapState {
  const t = Math.max(0, Math.min(tMs, durationMs));
  const p = durationMs === 0 ? 0 : t / durationMs;

  const x = 110 + 560 * easeInOutSine(p);
  const y = 230 + Math.sin(p * Math.PI * 2) * 70;
  const scale = 0.8 + 0.45 * (0.5 + 0.5 * Math.sin(p * Math.PI * 4));
  const opacity = 0.35 + 0.65 * (0.5 + 0.5 * Math.cos(p * Math.PI * 2));

  return { x, y, scale, opacity };
}
