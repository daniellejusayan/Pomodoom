import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  SafeAreaView,
  Animated,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../../core/theme/colors';
import { ROUTES } from '../../../navigation/routes';
import { TimerStackParamList } from '../../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Add these imports at the top
import { usePenaltySystem } from '../../penalties/hooks/usePenaltySystem';
import { PenaltyAlert } from '../../penalties/components/PenaltyAlert';
import type { PenaltyAction } from '../../penalties/types/PenaltyTypes';
import { AppState, AppStateStatus } from 'react-native';
import { useSettings } from '../../../context/SettingsContext';
import { playAlarm, triggerVibration } from '../../../core/utils/alerts';
import { getHomeTutorialDismissedFlag, setHomeTutorialDismissedFlag } from '../../../services/storage';
import { GuidancePopup } from '../../../shared/components';
import { useTimer } from '../../../shared/hooks/useTimer';
import { TimerDisplayCard } from '../components/TimerDisplayCard';
import { ToDoList } from '../../../shared/components/ToDoList';
import { TimerHeader } from '../components/TimerHeader';
import { styles } from './HomeTimerScreen.styles';

type Nav = NativeStackNavigationProp<TimerStackParamList, typeof ROUTES.TIMER.HOME>;
type HomeRoute = RouteProp<TimerStackParamList, typeof ROUTES.TIMER.HOME>;
type TimerPhase = 'idle' | 'focus' | 'break' | 'longBreak';

export default function HomeTimerScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<HomeRoute>();

  const [currentPhase, setCurrentPhase] = useState<TimerPhase>('idle');
  const completionHandledRef = useRef(false);

  // 🎯 DURATION SETTINGS - pulled from shared context
  const { focusDuration, breakDuration, setFocusDuration, setBreakDuration } = useSettings();

  const {
    secondsLeft,
    isRunning,
    progress,
    formatted,
    start,
    pause,
    reset,
    set,
  } = useTimer(focusDuration * 60);

  // 🆕 CIRCLE FADE ANIMATION for end-of-timer feedback
  const circleOpacity = useRef(new Animated.Value(1)).current;

    // 🆕 Penalty system
  const {
    applyPenalty,
    resetSessionPenalties,
    sessionPauseCount,
    penaltyType: hookPenaltyType,
  } = usePenaltySystem();
  
  const {
    penaltyType: currentPenaltyType,
    penaltyTypeUsage,
    recordPenaltyUsage,
    breakCycleCount,
    longBreaksCompleted,
    longBreakDuration,
    incrementBreakCycle,
    resetBreakCycle,
    incrementLongBreaks,
    incrementSessions,
    soundEnabled,
    vibrationEnabled,
  } = useSettings();

  const [penaltyAlert, setPenaltyAlert] = useState<PenaltyAction | null>(null);
  const [pendingAction, setPendingAction] = useState<'pause' | 'stop' | null>(null);
  const [sessionStopCount, setSessionStopCount] = useState(0); // 🆕 Track stop attempts in current session
  const [showHomeGuide, setShowHomeGuide] = useState(false);
  const sessionIdRef = useRef<string>(Date.now().toString());

  const homeGuideSteps = [
    'Choose your focus duration before starting.',
    'Press Start Session and stay with one task.',
    'Take a break or long break, then run it back.',
  ];

  useEffect(() => {
    const loadGuideState = async () => {
      const isDismissed = await getHomeTutorialDismissedFlag();
      setShowHomeGuide(!isDismissed);
    };

    loadGuideState();
  }, []);

  useEffect(() => {
    if (!route.params?.replayTutorial) return;

    setShowHomeGuide(true);
    setHomeTutorialDismissedFlag(false);
    navigation.setParams({ replayTutorial: undefined });
  }, [route.params?.replayTutorial, navigation]);

  useEffect(() => {
    if (currentPhase === 'idle') {
      reset(focusDuration * 60);
    }
  }, [focusDuration, currentPhase, reset]);

    // 🆕 Monitor app state for background detection
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isRunning, currentPhase]);

  // 🧪 DEBUG: Log penalty type changes
  useEffect(() => {
    console.log('HomeTimer sees penalty type:', currentPenaltyType);
  }, [currentPenaltyType]);

    // 🧪 DEBUG: Compare both values
  useEffect(() => {
    console.log('Context penalty:', currentPenaltyType);
    console.log('Hook penalty:', hookPenaltyType);
  }, [currentPenaltyType, hookPenaltyType]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // If timer is running and app goes to background
    if (
      isRunning &&
      currentPhase === 'focus' &&
      nextAppState === 'background'
    ) {
      // Trigger penalty for going to background
      const penalty = applyPenalty(sessionIdRef.current, 'pause');
      if (penalty) {
        if (penalty.type === 'addTime' && penalty.timeAddedMinutes) {
          // Add time immediately for background interruption
          const additionalSeconds = penalty.timeAddedMinutes * 60;
          set(secondsLeft + additionalSeconds);
        }
        // Pause the timer
        pause();
      }
    }
  };


  // 🎯 TIMER CONTROLS
  const handleStart = () => {
// // 🧪 TEMPORARY: Skip timer and go directly to Session Complete screen
//   // ⚠️ REMOVE THIS BLOCK TO RESTORE NORMAL TIMER FUNCTIONALITY
//   navigation.navigate(ROUTES.TIMER.SESSION_COMPLETE, { 
//     sessionId: Date.now().toString(),
//     pauseCount: sessionPauseCount,
//   });
//   return; // Exit early, skipping all the timer logic below
//   // ⚠️ END OF TEMPORARY CODE
  
      if (currentPhase === 'idle') {
      // Create new session ID
      sessionIdRef.current = Date.now().toString();
      
      // Start new focus session
      setCurrentPhase('focus');
      const secs = focusDuration * 60;
      reset(secs);
      circleOpacity.setValue(1);
      setSessionStopCount(0); // 🆕 Reset stop count on new session
      start();
    } else {
      // Resume paused timer
      start();
    }
  };

// 🔄 MODIFIED: handlePause with penalty
  const handlePause = () => {
    setPendingAction('pause');
    const penalty = applyPenalty(sessionIdRef.current, 'pause');
    
    if (penalty) {
      setPenaltyAlert(penalty);
    } else {
      // No penalty set, pause immediately
      pause();
    }
  };

// 🔄 MODIFIED: handleStop with penalty
  const handleStop = () => {
    setPendingAction('stop');
    const penalty = applyPenalty(sessionIdRef.current, 'stop', sessionStopCount);
    
    if (penalty) {
      setPenaltyAlert(penalty);
    } else {
      // No penalty set, finish session immediately
      showStopOptions();
    }
  };

  // 🆕 Show options when stopping: Skip to Break, Finish Session, Return to Timer
const showStopOptions = () => {
  // This will be handled by the PenaltyAlert component with custom buttons
  const isLongBreakTime = breakCycleCount >= 2;
  const breakType = isLongBreakTime ? 'long break' : 'break';
  
  setPenaltyAlert({
    type: 'warning', // Use warning type to show custom buttons
    message: `You're stopping your focus session. What would you like to do?`,
  });
};

  // 🆕 Finish current focus session (presence of penalty handled separately)
  const finishSession = () => {
    // increment session count for stats
    incrementSessions();
    // record penalty type usage in case user never visits the complete screen
    recordPenaltyUsage(currentPenaltyType);
    // navigate to summary
    navigation.navigate(ROUTES.TIMER.SESSION_COMPLETE, {
      sessionId: sessionIdRef.current,
      pauseCount: sessionPauseCount,
    });
    // then reset internal state similar to executeStop
    pause();
    setCurrentPhase('idle');
    reset(focusDuration * 60);
    circleOpacity.setValue(1);
    resetSessionPenalties();
    setSessionStopCount(0);
    // new session id prepared for next session
    sessionIdRef.current = Date.now().toString();
  };

// 🔄 MODIFIED: handleTimerComplete - reset penalties on successful completion, play sound & vibration
  const handleTimerComplete = async () => {
    pause();
    
    // 🆕 Play sound and vibration if enabled
    if (soundEnabled) {
      await playAlarm();
    }
    if (vibrationEnabled) {
      triggerVibration();
    }
    
    setTimeout(() => {
      Animated.timing(circleOpacity, {
        toValue: 0.4,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 1000);
    
    if (currentPhase === 'focus') {
      // Reset penalties on successful completion
      resetSessionPenalties();
      // count session
      incrementSessions();
      
      navigation.navigate(ROUTES.TIMER.SESSION_COMPLETE, {
        sessionId: sessionIdRef.current,
        pauseCount: sessionPauseCount,
      });
      setCurrentPhase('idle');
      reset(focusDuration * 60);
      
      // Generate new session ID for next session
      sessionIdRef.current = Date.now().toString();
    } else if (currentPhase === 'break') {
      incrementBreakCycle();
      setCurrentPhase('idle');
      reset(focusDuration * 60);
    } else if (currentPhase === 'longBreak') {
      incrementLongBreaks();
      resetBreakCycle();
      setCurrentPhase('idle');
      reset(focusDuration * 60);
    }
  };

  useEffect(() => {
    if (currentPhase !== 'idle' && secondsLeft === 0 && !isRunning && !completionHandledRef.current) {
      completionHandledRef.current = true;
      handleTimerComplete();
      return;
    }

    if (secondsLeft > 0 || currentPhase === 'idle') {
      completionHandledRef.current = false;
    }
  }, [secondsLeft, isRunning, currentPhase]);

    // 🆕 Handle penalty alert confirmation
  const handlePenaltyConfirm = () => {
    if (!penaltyAlert) return;

    switch (penaltyAlert.type) {
      case 'warning':
        // User confirmed they want to pause/stop
        if (pendingAction === 'pause') {
          pause();
        } else if (pendingAction === 'stop') {
          finishSession();
        }
        break;

      case 'resetTimer':
        if (pendingAction === 'stop') {
          finishSession();
        } else {
          // Reset timer to original duration
          const secs = focusDuration * 60;
          reset(secs);
          pause();
        }
        break;

      case 'addTime':
        if (pendingAction === 'stop') {
          finishSession();
        } else {
          // Add penalty time
          if (penaltyAlert.timeAddedMinutes) {
            const additionalSeconds = penaltyAlert.timeAddedMinutes * 60;
            set(secondsLeft + additionalSeconds);
          }
          pause();
        }
        break;

      case 'lockMode':
        if (pendingAction === 'pause') {
          pause();
        } else if (pendingAction === 'stop') {
          finishSession();
        }
        break;
    }

    setPenaltyAlert(null);
    setPendingAction(null);
  };

   // 🆕 Handle penalty alert cancel (only for warnings)
  const handlePenaltyCancel = () => {
    setPenaltyAlert(null);
    setPendingAction(null);
    // Don't pause/stop - user cancelled
  };

  // 🆕 Handle "Skip to Break" option
  const handleSkipToBreak = () => {
    setPenaltyAlert(null);
    setPendingAction(null);
    
    // Determine if it's time for long break
    const isLongBreakTime = breakCycleCount >= 2;
    
    if (isLongBreakTime) {
      handleStartLongBreak();
    } else {
      handleStartBreak();
    }
  };

  const handleStartBreak = () => {
    setCurrentPhase('break');
    const secs = breakDuration * 60;
    reset(secs);
    circleOpacity.setValue(1);
    start();
  };

  const handleStartLongBreak = () => {
    setCurrentPhase('longBreak');
    const secs = longBreakDuration * 60;
    reset(secs);
    circleOpacity.setValue(1);
    start();
  };

  // 🆕 Add handler for "Go Back" button
const handlePenaltyGoBack = () => {
  // Capture penalty details before clearing alert
  const type = penaltyAlert?.type;
  const added = penaltyAlert?.timeAddedMinutes;

  // Close the penalty alert
  setPenaltyAlert(null);
  setPendingAction(null);
  // 🆕 Increment stop count when user resumes after penalty
  setSessionStopCount(prev => prev + 1);

  if (type === 'resetTimer') {
    // Reset timer to original duration, but stay on the timer screen
    const secs = focusDuration * 60;
    reset(secs);
    pause();
  } else if (type === 'addTime' && added) {start
    // Add penalty time then resume
    const additionalSeconds = added * 60;
    set(secondsLeft + additionalSeconds);
    start();
  } else {
    // Resume the timer for other penalty types or warnings
    start();
  }
};

  // 🎯 COMPUTED VALUES
  const displayTime = currentPhase === 'idle' 
    ? focusDuration 
    : formatted;

// 🔄 MODIFIED: Update timer message to remove duration text
const timerMessage = useMemo(() => {
  if (currentPhase === 'idle') {
    const isLongBreakTime = breakCycleCount >= 2;
    return isLongBreakTime 
      ? 'Ready for a long break?' 
      : 'Ready to focus?';
  } else if (currentPhase === 'focus') {
    return isRunning ? 'One task only. Protect this focus sprint.' : 'Paused. Resume to keep momentum.';
  } else if (currentPhase === 'longBreak') {
    return isRunning ? 'Long break running. Recover fully.' : 'Long break paused. Resume when ready.';
  } else {
    return isRunning ? 'Recharge now. Your next sprint will be easier.' : 'Break paused. Resume when ready.';
  }
}, [currentPhase, isRunning, breakCycleCount]);

  const dismissHomeGuide = async () => {
    setShowHomeGuide(false);
    await setHomeTutorialDismissedFlag(true);
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <TimerHeader currentPhase={currentPhase} />

        <TimerDisplayCard
          currentPhase={currentPhase}
          isRunning={isRunning}
          progress={progress}
          circleOpacity={circleOpacity}
          displayTime={displayTime}
          timerMessage={timerMessage}
          onStart={handleStart}
          onStop={handleStop}
          onPause={handlePause}
          onStartBreak={handleStartBreak}
          breakCycleCount={breakCycleCount}
          breakDuration={breakDuration}
          longBreakDuration={longBreakDuration}
        />

        {/* To-do list always available */}
        <View style={styles.todoContainer}>
          <ToDoList />
        </View>

        {/* 🆕 Penalty Alert Modal */}
        <PenaltyAlert
          visible={penaltyAlert !== null}
          penaltyType={penaltyAlert?.type || 'warning'}
          message={penaltyAlert?.message || ''}
          onConfirm={handlePenaltyConfirm}
          onCancel={
          // 🔧 FIX: For PAUSE with WARNING penalty, show Cancel button
          pendingAction === 'pause' && currentPenaltyType === 'warning' ? handlePenaltyCancel : undefined }
          // 🔧 FIX: Only show Cancel for PAUSE with WARNING penalty
          showCancel={
          pendingAction === 'pause' && currentPenaltyType === 'warning'}
          // 🆕 ADDED: Pass stop action props
          isStopAction={pendingAction === 'stop'}
          onGoBack={pendingAction === 'stop' ? handlePenaltyGoBack : undefined}
           // 🆕 ADDED: Stop-specific options
          onSkipToBreak={pendingAction === 'stop' ? handleSkipToBreak : undefined}
          breakCycleCount={breakCycleCount} // Pass to determine break type
        />

        <GuidancePopup
          visible={showHomeGuide}
          onClose={dismissHomeGuide}
          title="How Pomodoom Works"
          description="Quick setup to stay on track"
          steps={homeGuideSteps}
          footnote="Replay this anytime from Settings."
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
