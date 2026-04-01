import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useAppStateHandler = (
  onBackground?: () => void,
  onForeground?: () => void,
  deps: any[] = []
) => {
  const lastState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const handleChange = (nextAppState: AppStateStatus) => {
      if (lastState.current.match(/inactive|active/) && nextAppState === 'background') {
        onBackground?.();
      }
      if (lastState.current === 'background' && nextAppState.match(/inactive|active/)) {
        onForeground?.();
      }
      lastState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleChange);
    return () => subscription.remove();
  }, [onBackground, onForeground, ...deps]);
};
