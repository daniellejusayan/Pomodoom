import { useState, useRef, useEffect } from 'react';

export interface TimerState {
  duration: number; // seconds
  secondsLeft: number;
  isRunning: boolean;
}

export const useTimerState = (initialDuration: number) => {
  const [duration, setDuration] = useState<number>(initialDuration);
  const [secondsLeft, setSecondsLeft] = useState<number>(initialDuration);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // keep reference to interval id for actions to control
  const intervalRef = useRef<null | ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    // keep secondsLeft in sync when duration changes
    setSecondsLeft((s) => (s > duration ? duration : s));
  }, [duration]);

  return {
    duration,
    secondsLeft,
    isRunning,
    setDuration,
    setSecondsLeft,
    setIsRunning,
    intervalRef,
  } as const;
};

export default useTimerState;
