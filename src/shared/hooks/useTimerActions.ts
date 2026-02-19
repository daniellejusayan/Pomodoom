import { useCallback } from 'react';
import type { TimerState } from './useTimerState';

export const useTimerActions = (state: ReturnType<typeof import('./useTimerState').useTimerState>) => {
  const start = useCallback(() => {
    if (state.isRunning) return;
    state.setIsRunning(true);
    state.intervalRef.current = setInterval(() => {
      state.setSecondsLeft((s) => {
        if (s <= 1) {
          // stop when finished
          clearInterval(state.intervalRef.current as any);
          state.intervalRef.current = null;
          state.setIsRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [state]);

  const pause = useCallback(() => {
    if (state.intervalRef.current) {
      clearInterval(state.intervalRef.current as any);
      state.intervalRef.current = null;
    }
    state.setIsRunning(false);
  }, [state]);

  const reset = useCallback((to?: number) => {
    pause();
    const newDuration = typeof to === 'number' ? to : state.duration;
    state.setDuration(newDuration);
    state.setSecondsLeft(newDuration);
  }, [pause, state]);

  const set = useCallback((seconds: number) => {
    state.setDuration(seconds);
    state.setSecondsLeft(seconds);
  }, [state]);

  return { start, pause, reset, set } as const;
};

export default useTimerActions;
