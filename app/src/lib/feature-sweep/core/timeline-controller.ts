export type Mode = 'normal' | 'time-wrap';

export type TimelineControllerState = {
  mode: Mode;
  isPlaying: boolean;
  currentTimeMs: number;
  lastTickMs: number;
  durationMs: number;
  frameStepMs: number;
};

export type TimelineCommand =
  | { type: 'setMode'; mode: Mode }
  | { type: 'seek'; timeMs: number }
  | { type: 'prev' }
  | { type: 'next' }
  | { type: 'playPause' }
  | { type: 'reset' }
  | { type: 'tick'; nowMs: number };

export function clampTime(t: number, durationMs: number): number {
  if (t < 0) return 0;
  if (t > durationMs) return durationMs;
  return t;
}

export function createTimelineControllerState(
  durationMs: number,
  frameStepMs: number,
): TimelineControllerState {
  return {
    mode: 'normal',
    isPlaying: true,
    currentTimeMs: 0,
    lastTickMs: 0,
    durationMs,
    frameStepMs,
  };
}

export function progress01(state: TimelineControllerState): number {
  if (state.durationMs <= 0) return 0;
  return state.currentTimeMs / state.durationMs;
}

export function reduceTimelineState(
  state: TimelineControllerState,
  command: TimelineCommand,
): TimelineControllerState {
  if (command.type === 'setMode') {
    if (command.mode === 'time-wrap') {
      return { ...state, mode: 'time-wrap', isPlaying: false, lastTickMs: 0 };
    }
    return { ...state, mode: 'normal', lastTickMs: 0 };
  }

  if (command.type === 'seek') {
    return {
      ...state,
      mode: 'time-wrap',
      isPlaying: false,
      lastTickMs: 0,
      currentTimeMs: clampTime(command.timeMs, state.durationMs),
    };
  }

  if (command.type === 'prev') {
    return {
      ...state,
      mode: 'normal',
      lastTickMs: 0,
      currentTimeMs: clampTime(
        state.currentTimeMs - state.frameStepMs,
        state.durationMs,
      ),
    };
  }

  if (command.type === 'next') {
    return {
      ...state,
      mode: 'normal',
      lastTickMs: 0,
      currentTimeMs: clampTime(
        state.currentTimeMs + state.frameStepMs,
        state.durationMs,
      ),
    };
  }

  if (command.type === 'playPause') {
    return {
      ...state,
      mode: 'normal',
      isPlaying: !state.isPlaying,
      lastTickMs: 0,
    };
  }

  if (command.type === 'reset') {
    return {
      ...state,
      mode: 'normal',
      isPlaying: false,
      currentTimeMs: 0,
      lastTickMs: 0,
    };
  }

  // tick
  if (state.mode !== 'normal' || !state.isPlaying) {
    return state;
  }

  if (state.lastTickMs === 0) {
    return { ...state, lastTickMs: command.nowMs };
  }

  const delta = command.nowMs - state.lastTickMs;
  const nextTime = clampTime(state.currentTimeMs + delta, state.durationMs);

  return {
    ...state,
    currentTimeMs: nextTime,
    lastTickMs: command.nowMs,
    isPlaying: nextTime >= state.durationMs ? false : state.isPlaying,
  };
}
