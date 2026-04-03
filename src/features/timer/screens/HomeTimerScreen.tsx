import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
  SafeAreaView,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../../core/theme/colors';
import { ROUTES } from '../../../navigation/routes';
import { TimerStackParamList } from '../../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Add these imports at the top
import { usePenaltySystem } from '../../penalties/hooks/usePenaltySystem';
import { PenaltyAlert } from '../../penalties/components/PenaltyAlert';
import { LockViolationAlert } from '../../penalties/components/LockViolationAlert';
import { EmergencyExitAlert } from '../../penalties/components/EmergencyExitAlert';
import type { PenaltyAction } from '../../penalties/types/PenaltyTypes';
import { useAppStateHandler } from '../hooks/useAppStateHandler';
import { useSettings } from '../../../context/SettingsContext';
import { playAlarm, triggerVibration } from '../../../core/utils/alerts';
import { getHomeTutorialDismissedFlag, setHomeTutorialDismissedFlag } from '../../../services/storage';
import { GuidancePopup } from '../../../shared/components';
import { useTimer } from '../../../shared/hooks/useTimer';
import { TimerDisplayCard } from '../components/TimerDisplayCard';
import { TimerCompleteAlert } from '../components/TimerCompleteAlert';
import { ToDoListBottomSheet } from '../../../shared/components/ToDoList/ToDoListBottomSheet';
import { ToDoListButton } from '../../../shared/components/ToDoList/ToDoListButton';
import type { ToDoItem } from '../../../shared/components/ToDoList/ToDoList.types';
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
  const [completeAlert, setCompleteAlert] = useState<'focus' | 'break' | 'longBreak' | null>(null); // 🆕 Timer completion modal state
  const [showTodoSheet, setShowTodoSheet] = useState(false);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [lockTapCount, setLockTapCount] = useState(0);
  const [showEmergencyExit, setShowEmergencyExit] = useState(false);
  const [showLockViolationAlert, setShowLockViolationAlert] = useState(false);
  const sessionIdRef = useRef<string>(Date.now().toString());
  const activeTaskIdRef = useRef<string | null>(null);
  const isLocked = currentPhase === 'focus' && currentPenaltyType === 'lockMode';

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

  useEffect(() => {
    if (!isLocked) {
      setLockTapCount(0);
      setShowEmergencyExit(false);
      setShowLockViolationAlert(false);
    }
  }, [isLocked]);

  useEffect(() => {
    activeTaskIdRef.current = activeTaskId;
  }, [activeTaskId]);

  const refreshActiveTask = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('@pomodoom_todos');

      if (!stored) {
        setActiveTask(null);
        setActiveTaskId(null);
        return;
      }

      const todos = JSON.parse(stored) as ToDoItem[];
      const preferredTaskId = activeTaskIdRef.current;
      const preferredTask = preferredTaskId ? todos.find((todo) => todo.id === preferredTaskId) : null;
      const fallbackTask = todos.find((todo) => !todo.completed) ?? null;
      const nextTask = preferredTask ?? fallbackTask;

      setActiveTaskId(nextTask?.id ?? null);
      setActiveTask(nextTask?.text ?? null);
    } catch (error) {
      console.error('Failed to load active task:', error);
      setActiveTask(null);
      setActiveTaskId(null);
    }
  }, []);

  const handleSelectTask = useCallback((item: ToDoItem) => {
    setActiveTaskId(item.id);
    setActiveTask(item.text);
  }, []);

  const handleLockedControlTap = useCallback(() => {
    if (!isLocked) return;

    setLockTapCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setShowEmergencyExit(true);
        return 0;
      }
      return next;
    });
  }, [isLocked]);

  useEffect(() => {
    refreshActiveTask();
  }, [refreshActiveTask]);

  useEffect(() => {
    if (!showTodoSheet) {
      refreshActiveTask();
    }
  }, [showTodoSheet, refreshActiveTask]);

    // Refs to keep callbacks fresh without re-registering the listener
  const isRunningRef = useRef(isRunning);
  const currentPhaseRef = useRef(currentPhase);
  const secondsLeftRef = useRef(secondsLeft);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { currentPhaseRef.current = currentPhase; }, [currentPhase]);
  useEffect(() => { secondsLeftRef.current = secondsLeft; }, [secondsLeft]);

  // 🆕 Monitor app state for background detection
  useAppStateHandler(
    useCallback(() => {
      if (!isRunningRef.current || currentPhaseRef.current !== 'focus') return;

      if (currentPenaltyType === 'lockMode') {
        pause();
        setShowLockViolationAlert(true);
        return;
      }

      const penalty = applyPenalty(sessionIdRef.current, 'pause');

      if (penalty) {
        if (penalty.type === 'addTime' && penalty.timeAddedMinutes) {
          const additionalSeconds = penalty.timeAddedMinutes * 60;
          set(secondsLeftRef.current + additionalSeconds);
        }
        setPenaltyAlert(penalty);
        setPendingAction('pause');
        pause();
      } else {
        // penaltyType === 'none': just pause silently
        pause();
      }
    }, [applyPenalty, currentPenaltyType, pause, set]),
    undefined,
    []
  );

  // 🧪 DEBUG: Log penalty type changes
  useEffect(() => {
    console.log('HomeTimer sees penalty type:', currentPenaltyType);
  }, [currentPenaltyType]);

    // 🧪 DEBUG: Compare both values
  useEffect(() => {
    console.log('Context penalty:', currentPenaltyType);
    console.log('Hook penalty:', hookPenaltyType);
  }, [currentPenaltyType, hookPenaltyType]);

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
    if (vibrationEnabled) {
      triggerVibration();
      } 
      if (currentPhase === 'idle') {
      // Create new session ID
      sessionIdRef.current = Date.now().toString();
      
      // Start new focus session
      setCurrentPhase('focus');
      const secs = focusDuration * 60;
      reset(secs);
      circleOpacity.setValue(1);
      setSessionStopCount(0); // 🆕 Reset stop count on new session
      setLockTapCount(0);
      setShowEmergencyExit(false);
      setShowLockViolationAlert(false);
      start();
    } else {
      // Resume paused timer
      start();
    }
  };

// 🔄 MODIFIED: handlePause with penalty
  const handlePause = () => {
    if (isLocked) {
      handleLockedControlTap();
      return;
    }

    if (vibrationEnabled) {
      triggerVibration();
    }

    // No penalties during break phases
    if (currentPhase === 'break' || currentPhase === 'longBreak') {
      pause();
      return;
    }

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
    if (isLocked) {
      handleLockedControlTap();
      return;
    }

    if (vibrationEnabled) {
      triggerVibration();
    }

    // No penalties during break phases — just show stop options directly
    if (currentPhase === 'break' || currentPhase === 'longBreak') {
      setPendingAction('stop');
      showStopOptions();
      return;
    }

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
  const message = currentPhase === 'break' || currentPhase === 'longBreak'
    ? `You're stopping your break. What would you like to do?`
    : `You're stopping your focus session. What would you like to do?`;

  setPenaltyAlert({
    type: 'warning',
    message,
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

// 🔄 MODIFIED: handleTimerComplete - show confirmation modal instead of auto-navigating
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
      // 🆕 Show confirmation modal; transition/counter updates happen after user confirms
      setCompleteAlert('focus');
    } else if (currentPhase === 'break') {
      // 🆕 Show confirmation modal for break completion
      setCompleteAlert('break');
    } else if (currentPhase === 'longBreak') {
      setCompleteAlert('longBreak');
    }
  };

  // 🆕 Handle confirmation modal start button
  const handleCompleteAlertStart = (completedPhase: 'focus' | 'break' | 'longBreak') => {
    setCompleteAlert(null);
    circleOpacity.setValue(1);

    if (completedPhase === 'focus') {
      resetSessionPenalties();
      incrementSessions();

      const nextCount = breakCycleCount + 1;
      incrementBreakCycle();
      sessionIdRef.current = Date.now().toString();

      if (nextCount >= 4) {
        resetBreakCycle();
        setCurrentPhase('longBreak');
        reset(longBreakDuration * 60);
      } else {
        setCurrentPhase('break');
        reset(breakDuration * 60);
      }
      // user starts manually — no start() call
    } else if (completedPhase === 'break') {
      setCurrentPhase('idle');
      reset(focusDuration * 60);
    } else if (completedPhase === 'longBreak') {
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

    // "Finish Session" button in stop action layout — always navigates to session complete
    if (pendingAction === 'stop') {
      finishSession();
      setPenaltyAlert(null);
      setPendingAction(null);
      return;
    }

    // Pause action penalties
    switch (penaltyAlert.type) {
      case 'warning':
        pause();
        break;

      case 'resetTimer': {
        const secs = focusDuration * 60;
        reset(secs);
        pause();
        break;
      }

      case 'addTime':
        if (penaltyAlert.timeAddedMinutes) {
          const additionalSeconds = penaltyAlert.timeAddedMinutes * 60;
          set(secondsLeft + additionalSeconds);
        }
        pause();
        break;

      case 'lockMode':
        pause();
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

  // 🆕 Handle "Skip to Break" or "Skip to Focus" option
  const handleSkipToBreak = () => {
    setPenaltyAlert(null);
    setPendingAction(null);

    // Break → Focus: auto-start focus immediately
    if (currentPhase === 'break' || currentPhase === 'longBreak') {
      setLockTapCount(0);
      setCurrentPhase('focus');
      reset(focusDuration * 60);
      circleOpacity.setValue(1);
      start();
      return;
    }
    
    // Focus → Break: count this session, route to correct break, auto-start
    const nextCount = breakCycleCount + 1;
    incrementBreakCycle();

    if (nextCount >= 4) {
      resetBreakCycle();
      setLockTapCount(0);
      setCurrentPhase('longBreak');
      reset(longBreakDuration * 60);
      circleOpacity.setValue(1);
      start();
    } else {
      handleStartBreak();
    }
  };

  const handleStartBreak = () => {
    setLockTapCount(0);
    setCurrentPhase('break');
    const secs = breakDuration * 60;
    reset(secs);
    circleOpacity.setValue(1);
    start();
  };

  const handleStartLongBreak = () => {
    setLockTapCount(0);
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
  } else if (type === 'addTime' && added) {
    // Add penalty time then resume
    const additionalSeconds = added * 60;
    set(secondsLeft + additionalSeconds);
    start();
  } else {
    // Resume the timer for other penalty types or warnings
    start();
  }
};

  const handleStayFocused = () => {
    setShowEmergencyExit(false);
    setLockTapCount(0);
  };

  const handleEmergencyExit = () => {
    setShowEmergencyExit(false);
    setShowLockViolationAlert(false);
    setLockTapCount(0);

    pause();
    setCurrentPhase('idle');
    reset(focusDuration * 60);
    circleOpacity.setValue(1);
    resetSessionPenalties();
    setSessionStopCount(0);
    sessionIdRef.current = Date.now().toString();
  };

  const handleResumeFromLockViolation = () => {
    setShowLockViolationAlert(false);
    setLockTapCount(0);
    start();
  };

  // 🎯 COMPUTED VALUES
  const displayTime = currentPhase === 'idle' 
    ? focusDuration 
    : formatted;

// 🔄 MODIFIED: Update timer message to remove duration text
const timerMessage = useMemo(() => {
  if (currentPhase === 'idle') {
    const isLongBreakTime = breakCycleCount >= 4;
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
          activeTask={activeTask}
          onTaskBannerPress={() => setShowTodoSheet(true)}
          isLocked={isLocked}
          onLockedTap={handleLockedControlTap}
          lockTapCount={lockTapCount}
          penaltyType={currentPenaltyType}
        />

        {/* To-do list button & bottom sheet */}
        <ToDoListButton onPress={() => setShowTodoSheet(true)} />

        <ToDoListBottomSheet
          visible={showTodoSheet}
          onClose={() => setShowTodoSheet(false)}
          onSelectTask={handleSelectTask}
          selectedTaskId={activeTaskId}
        />

        {/* 🆕 Timer Completion Modal */}
        {completeAlert && (
          <TimerCompleteAlert
            visible={completeAlert !== null}
            phase={completeAlert}
            nextLabel={
              completeAlert === 'focus'
                ? (breakCycleCount + 1) >= 4
                  ? 'Start Long Break'
                  : 'Start Break'
                : 'Start Focus'
            }
            onStart={() => {
              handleCompleteAlertStart(completeAlert);
            }}
          />
        )}

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
          nextBreakCycleCount={breakCycleCount + 1}
          currentPhase={currentPhase} // 🆕 ADDED: Pass phase for contextual skip button
        />

        <LockViolationAlert
          visible={showLockViolationAlert}
          countdownSeconds={10}
          onResume={handleResumeFromLockViolation}
        />

        <EmergencyExitAlert
          visible={showEmergencyExit}
          onStayFocused={handleStayFocused}
          onEmergencyExit={handleEmergencyExit}
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
