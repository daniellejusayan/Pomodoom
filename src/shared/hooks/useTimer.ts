import { useEffect } from 'react';
import useTimerState from './useTimerState';
import useTimerActions from './useTimerActions';
import useTimerData from './useTimerData';

/**
 * Composed useTimer hook that exposes state, actions and derived data.
 *
 * @param initialDuration seconds
 */
export const useTimer = (initialDuration = 25 * 60) => {
  const state = useTimerState(initialDuration);
  const actions = useTimerActions(state as any);
  const data = useTimerData(state as any);

  // cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (state.intervalRef.current) {
        clearInterval(state.intervalRef.current as any);
        state.intervalRef.current = null;
      }
    };
  }, [state]);

  return { ...state, ...actions, ...data } as const;
};

export default useTimer;
