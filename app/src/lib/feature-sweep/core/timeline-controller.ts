export type Mode = 'normal' | 'time-wrap';

export type TimelineControllerState = {
  mode: Mode;
  isPlaying: boolean;
  currentTimeSec: number;
  lastTickMs: number;
  durationSec: number;
  frameStepSec: number;
};

export type TimelineCommand =
  | { type: 'setMode'; mode: Mode }
  | { type: 'seek'; timeSec: number }
  | { type: 'prev' }
  | { type: 'next' }
  | { type: 'playPause' }
  | { type: 'reset' }
  | { type: 'tick'; nowMs: number };

export function clampTime(t: number, durationSec: number): number {
  if (t < 0) return 0;
  if (t > durationSec) return durationSec;
  return t;
}

export function createTimelineControllerState(
  durationSec: number,
  frameStepSec: number,
): TimelineControllerState {
  return {
    mode: 'normal',
    isPlaying: false,
    currentTimeSec: 0,
    lastTickMs: 0,
    durationSec,
    frameStepSec,
  };
}

export function progress01(state: TimelineControllerState): number {
  if (state.durationSec <= 0) return 0;
  return state.currentTimeSec / state.durationSec;
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
      currentTimeSec: clampTime(command.timeSec, state.durationSec),
    };
  }

  if (command.type === 'prev') {
    return {
      ...state,
      mode: 'normal',
      lastTickMs: 0,
      currentTimeSec: clampTime(
        state.currentTimeSec - state.frameStepSec,
        state.durationSec,
      ),
    };
  }

  if (command.type === 'next') {
    return {
      ...state,
      mode: 'normal',
      lastTickMs: 0,
      currentTimeSec: clampTime(
        state.currentTimeSec + state.frameStepSec,
        state.durationSec,
      ),
    };
  }

  if (command.type === 'playPause') {
    const toggledPlaying = !state.isPlaying;
    const restartAtStart = toggledPlaying && state.currentTimeSec >= state.durationSec;
    return {
      ...state,
      mode: 'normal',
      isPlaying: toggledPlaying,
      currentTimeSec: restartAtStart ? 0 : state.currentTimeSec,
      lastTickMs: 0,
    };
  }

  if (command.type === 'reset') {
    return {
      ...state,
      mode: 'normal',
      isPlaying: false,
      currentTimeSec: 0,
      lastTickMs: 0,
    };
  }

  // tick
  if (state.mode !== 'normal' || !state.isPlaying) {
    return state;
  }

  if (state.lastTickMs === 0) {
    const nextTime = clampTime(
      state.currentTimeSec + state.frameStepSec,
      state.durationSec,
    );
    return {
      ...state,
      currentTimeSec: nextTime,
      lastTickMs: command.nowMs,
      isPlaying: nextTime >= state.durationSec ? false : state.isPlaying,
    };
  }

  const deltaSec = (command.nowMs - state.lastTickMs) / 1000;
  const nextTime = clampTime(state.currentTimeSec + deltaSec, state.durationSec);

  return {
    ...state,
    currentTimeSec: nextTime,
    lastTickMs: command.nowMs,
    isPlaying: nextTime >= state.durationSec ? false : state.isPlaying,
  };
}
