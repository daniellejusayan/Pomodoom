import { useMemo } from 'react';

export const useTimerData = (state: ReturnType<typeof import('./useTimerState').useTimerState>) => {
  const formatted = useMemo(() => {
    const mins = Math.floor(state.secondsLeft / 60);
    const secs = state.secondsLeft % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [state.secondsLeft]);

  const progress = useMemo(() => {
    if (state.duration <= 0) return 0;
    return 1 - state.secondsLeft / state.duration;
  }, [state.secondsLeft, state.duration]);

  return { formatted, progress } as const;
};

export default useTimerData;
