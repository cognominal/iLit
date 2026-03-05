export type TimeWrapState = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
};

export const DURATION_SEC = 6;
export const FRAME_STEP_SEC = 0.12;

function easeInOutSine(t01: number): number {
  return -(Math.cos(Math.PI * t01) - 1) / 2;
}

export function evaluateAt(tSec: number, durationSec = DURATION_SEC): TimeWrapState {
  const t = Math.max(0, Math.min(tSec, durationSec));
  const p = durationSec === 0 ? 0 : t / durationSec;

  const x = 110 + 560 * easeInOutSine(p);
  const y = 230 + Math.sin(p * Math.PI * 2) * 70;
  const scale = 0.8 + 0.45 * (0.5 + 0.5 * Math.sin(p * Math.PI * 4));
  const opacity = 0.35 + 0.65 * (0.5 + 0.5 * Math.cos(p * Math.PI * 2));

  return { x, y, scale, opacity };
}
