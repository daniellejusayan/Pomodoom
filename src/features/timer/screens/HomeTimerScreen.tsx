import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  SafeAreaView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

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
import { FocusDurationCard } from '../components/FocusDurationCard';
import { TimerDisplayCard } from '../components/TimerDisplayCard';
import { TimerHeader } from '../components/TimerHeader';
import { styles } from './HomeTimerScreen.styles';

type Nav = NativeStackNavigationProp<TimerStackParamList, typeof ROUTES.TIMER.HOME>;
type TimerPhase = 'idle' | 'focus' | 'break';

export default function HomeTimerScreen() {
  const navigation = useNavigation<Nav>();
  const AnimatedSvg = Animated.createAnimatedComponent(Svg);
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  const [currentPhase, setCurrentPhase] = useState<TimerPhase>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds

  // 🎯 DURATION SETTINGS - pulled from shared context
  const { focusDuration, breakDuration, setFocusDuration, setBreakDuration } = useSettings();

  // 🆕 PROGRESS ANIMATION
  const progressAnim = useRef(new Animated.Value(0)).current;              // 0..1
  const totalDurationRef = useRef(0); // seconds
  const CIRCLE_RADIUS = 110;
  const STROKE_WIDTH = 10;
  const circumference = 2 * Math.PI * (CIRCLE_RADIUS - STROKE_WIDTH / 2);
  const dashOffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });
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
  const sessionIdRef = useRef<string>(Date.now().toString());


  // 🎯 COUNTDOWN TIMER LOGIC
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  // 🆕 Update progress animation when timeRemaining changes
  useEffect(() => {
    if (currentPhase !== 'idle' && totalDurationRef.current > 0) {
      const ratio = 1 - timeRemaining / totalDurationRef.current;
      Animated.timing(progressAnim, {
        toValue: ratio,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [timeRemaining, currentPhase]);

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
          setTimeRemaining(prev => prev + additionalSeconds);
          totalDurationRef.current += additionalSeconds;
        }
        // Pause the timer
        setIsRunning(false);
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
      setTimeRemaining(secs);
      totalDurationRef.current = secs;
      progressAnim.setValue(0);
      circleOpacity.setValue(1);
      setSessionStopCount(0); // 🆕 Reset stop count on new session
      setIsRunning(true);
    } else {
      // Resume paused timer
      setIsRunning(true);
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
      setIsRunning(false);
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
      finishSession();
    }
  };

  // 🆕 Finish current focus session (presence of penalty handled separately)
  const finishSession = () => {
    // increment session count for stats
    incrementSessions();
    // navigate to summary
    navigation.navigate(ROUTES.TIMER.SESSION_COMPLETE, {
      sessionId: sessionIdRef.current,
      pauseCount: sessionPauseCount,
    });
    // then reset internal state similar to executeStop
    setIsRunning(false);
    setCurrentPhase('idle');
    setTimeRemaining(0);
    progressAnim.setValue(0);
    circleOpacity.setValue(1);
    resetSessionPenalties();
    setSessionStopCount(0);
    // new session id prepared for next session
    sessionIdRef.current = Date.now().toString();
  };

// 🔄 MODIFIED: handleTimerComplete - reset penalties on successful completion, play sound & vibration
  const handleTimerComplete = async () => {
    setIsRunning(false);
    progressAnim.setValue(0);
    
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
      
      // Generate new session ID for next session
      sessionIdRef.current = Date.now().toString();
    } else if (currentPhase === 'break') {
      // update break cycle/long break stats
      if (breakCycleCount >= 2) {
        // just finished a long break
        incrementLongBreaks();
        resetBreakCycle();
      } else {
        incrementBreakCycle();
      }
      setCurrentPhase('idle');
      setTimeRemaining(0);
    }
  };

    // 🆕 Handle penalty alert confirmation
  const handlePenaltyConfirm = () => {
    if (!penaltyAlert) return;

    switch (penaltyAlert.type) {
      case 'warning':
        // User confirmed they want to pause/stop
        if (pendingAction === 'pause') {
          setIsRunning(false);
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
          setTimeRemaining(secs);
          totalDurationRef.current = secs;
          progressAnim.setValue(0);
          setIsRunning(false);
        }
        break;

      case 'addTime':
        if (pendingAction === 'stop') {
          finishSession();
        } else {
          // Add penalty time
          if (penaltyAlert.timeAddedMinutes) {
            const additionalSeconds = penaltyAlert.timeAddedMinutes * 60;
            setTimeRemaining(prev => prev + additionalSeconds);
            totalDurationRef.current += additionalSeconds;
          }
          setIsRunning(false);
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

  const isNextBreakLong = breakCycleCount >= 2; // compute eligibility

  const handleStartBreak = () => {
    setCurrentPhase('break');
    // determine duration: if eligible for long break
    const secs = (isNextBreakLong ? longBreakDuration : breakDuration) * 60;
    setTimeRemaining(secs);
    totalDurationRef.current = secs;
    progressAnim.setValue(0);
    circleOpacity.setValue(1);
    setIsRunning(true);
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
    setTimeRemaining(secs);
    totalDurationRef.current = secs;
    progressAnim.setValue(0);
    setIsRunning(false);
  } else if (type === 'addTime' && added) {
    // Add penalty time then resume
    const additionalSeconds = added * 60;
    setTimeRemaining(prev => prev + additionalSeconds);
    totalDurationRef.current += additionalSeconds;
    setIsRunning(true);
  } else {
    // Resume the timer for other penalty types or warnings
    setIsRunning(true);
  }
};

  // 🎯 COMPUTED VALUES
  const displayMinutes = Math.floor(timeRemaining / 60);
  const displaySeconds = timeRemaining % 60;
  const displayTime = currentPhase === 'idle' 
    ? focusDuration 
    : `${displayMinutes}:${displaySeconds.toString().padStart(2, '0')}`;

  const timerMessage = useMemo(() => {
    if (currentPhase === 'idle') {
      return `${focusDuration} min focus • ${breakDuration} min break`;
    } else if (currentPhase === 'focus') {
      return isRunning ? 'Stay focused!' : 'Focus paused';
    } else {
      return isRunning ? 'Take a break' : 'Break paused';
    }
  }, [currentPhase, focusDuration, breakDuration, isRunning]);

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
          circleOpacity={circleOpacity}
          displayTime={displayTime}
          timerMessage={timerMessage}
          isNextBreakLong={isNextBreakLong}
          onStart={handleStart}
          onStop={handleStop}
          onPause={handlePause}
          onStartBreak={handleStartBreak}
          AnimatedSvg={AnimatedSvg}
          AnimatedCircle={AnimatedCircle}
          CIRCLE_RADIUS={CIRCLE_RADIUS}
          STROKE_WIDTH={STROKE_WIDTH}
          circumference={circumference}
          dashOffset={dashOffset}
        />

        {currentPhase === 'idle' && (
          <FocusDurationCard
            focusDuration={focusDuration}
            setFocusDuration={setFocusDuration}
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
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
