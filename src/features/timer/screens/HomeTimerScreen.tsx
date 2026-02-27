import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

import { focusDurationsMinutes } from '../../../core/constants';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
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
// 🧪 TEMPORARY: Skip timer and go directly to Session Complete screen
  // ⚠️ REMOVE THIS BLOCK TO RESTORE NORMAL TIMER FUNCTIONALITY
  navigation.navigate(ROUTES.TIMER.SESSION_COMPLETE, { 
    sessionId: Date.now().toString() 
  });
  return; // Exit early, skipping all the timer logic below
  // ⚠️ END OF TEMPORARY CODE
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
        <View style={styles.headerRow}>
          <Text style={styles.heading}>
            {currentPhase === 'focus' ? 'Focus Mode' : 
             currentPhase === 'break' ? 'Break Time' : 
             'Ready to Focus?'}
          </Text>
          <Text style={styles.subhead}>
            {currentPhase === 'idle' ? 'Pick your intervals and start' : ''}
            </Text>
        </View>

        {/* 🎯 TIMER DISPLAY CARD */}
        <View style={styles.timerCard}>
          <Animated.View style={[
            styles.timerCircleOuter,
            currentPhase === 'focus' && styles.timerCircleFocus,
            currentPhase === 'break' && styles.timerCircleBreak,
            { opacity: circleOpacity },
          ]}>
            {/* progress circle */}
            {currentPhase !== 'idle' && (
              <AnimatedSvg
                width={CIRCLE_RADIUS * 2}
                height={CIRCLE_RADIUS * 2}
                style={StyleSheet.absoluteFill}
              >
                <AnimatedCircle
                  cx={CIRCLE_RADIUS}
                  cy={CIRCLE_RADIUS}
                  r={CIRCLE_RADIUS - STROKE_WIDTH / 2}
                  stroke={currentPhase === 'focus' ? colors.primary : colors.success}
                  strokeWidth={STROKE_WIDTH}
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  rotation="-90"
                  originX={CIRCLE_RADIUS}
                  originY={CIRCLE_RADIUS}
                />
              </AnimatedSvg>
            )}
            <View style={styles.timerCircleInner}>
              <Text style={styles.timerValue}>{displayTime}</Text>
              <Text style={styles.timerLabel}>
                {currentPhase === 'idle' ? 'minutes' : ''}
              </Text>
            </View>
          </Animated.View>
          
          <Text style={styles.timerMessage}>{timerMessage}</Text>

          {/* 🎯 TIMER CONTROLS */}
          {currentPhase === 'idle' ? (
            <>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleStart}
              >
                <Text style={styles.primaryButtonText}>Start Focus</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.controlRow}>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handleStop}
              >
                <Ionicons name="stop" size={24} color={colors.danger} />
                <Text style={styles.controlButtonText}>Stop</Text>
              </TouchableOpacity>

              {isRunning ? (
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={handlePause}
                >
                  <Ionicons name="pause" size={24} color={colors.primary} />
                  <Text style={styles.controlButtonText}>Pause</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={handleStart}
                >
                  <Ionicons name="play" size={24} color={colors.primary} />
                  <Text style={styles.controlButtonText}>Resume</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

        {/* Break button (only show after focus complete) */}
          {currentPhase === 'idle' && (
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={handleStartBreak}
            >
              <Text style={styles.secondaryButtonText}>
                {isNextBreakLong ? 'Start Long Break' : 'Start Break'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 🎯 FOCUS DURATION SELECTOR - Only show when idle */}
        {currentPhase === 'idle' && (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="timer-outline" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Focus Duration</Text>
              </View>
              <View style={styles.chipsContainer}>
                {focusDurationsMinutes.map((item) => {
                  const isActive = item === focusDuration;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setFocusDuration(item)}
                    >
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                        {item}m
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: spacing.xl,
    gap: spacing.xl,
  },
  headerRow: {
    gap: spacing.xs,
    marginTop: spacing.xxl*2,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    alignSelf: 'center',
  },
  subhead: {
    color: colors.textSecondary,
    fontSize: 15,
    alignSelf: 'center',
  },
  timerCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 10,
  },
  timerCircleOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1224',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 6,
  },
  // 🆕 Different colors for different phases
  timerCircleFocus: {
    shadowColor: colors.primary,
    borderColor: colors.primary,
  },
  timerCircleBreak: {
    shadowColor: colors.success,
    borderColor: colors.success,
  },
  timerCircleInner: {
    width: 170,
    height: 170,
    borderRadius: 85,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  timerValue: {
    color: colors.textPrimary,
    fontSize: 54,
    fontWeight: '800',
  },
  timerLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  timerMessage: {
    color: colors.textSecondary,
    fontSize: 15,
  },

  // 🆕 Control buttons row
  controlRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  controlButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.xs,
  },
  controlButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },

  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.sm,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
});
