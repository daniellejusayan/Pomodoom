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

import { focusDurationsMinutes, defaultFocusMinutes, defaultBreakMinutes } from '../../../core/constants';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { ROUTES } from '../../../navigation/routes';
import { TimerStackParamList } from '../../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<TimerStackParamList, typeof ROUTES.TIMER.HOME>;
type TimerPhase = 'idle' | 'focus' | 'break';

export default function HomeTimerScreen() {
  const navigation = useNavigation<Nav>();
  const AnimatedSvg = Animated.createAnimatedComponent(Svg);
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  const [currentPhase, setCurrentPhase] = useState<TimerPhase>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds

  // 🎯 DURATION SETTINGS - User-selected intervals
  const [focusDuration, setFocusDuration] = useState<number>(defaultFocusMinutes);
  const [breakDuration, setBreakDuration] = useState<number>(defaultBreakMinutes);

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

  // 🎯 TIMER CONTROLS
  const handleStart = () => {
    if (currentPhase === 'idle') {
      // Start new focus session
      setCurrentPhase('focus');
      const secs = focusDuration * 60;
      setTimeRemaining(secs);
      totalDurationRef.current = secs;
      progressAnim.setValue(0);
      circleOpacity.setValue(1);
      setIsRunning(true);
    } else {
      // Resume paused timer
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setCurrentPhase('idle');
    setTimeRemaining(0);
    progressAnim.setValue(0);
    circleOpacity.setValue(1);
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    progressAnim.setValue(0);
    // fade circle after delay
    setTimeout(() => {
      Animated.timing(circleOpacity, {
        toValue: 0.4,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 1000);
    
    if (currentPhase === 'focus') {
      // Focus complete, show success screen
      navigation.navigate(ROUTES.TIMER.SESSION_COMPLETE, { 
        sessionId: Date.now().toString() 
      });
      setCurrentPhase('idle');
    } else if (currentPhase === 'break') {
      // Break complete, back to idle
      setCurrentPhase('idle');
      setTimeRemaining(0);
    }
  };

  const handleStartBreak = () => {
    setCurrentPhase('break');
    const secs = breakDuration * 60;
    setTimeRemaining(secs);
    totalDurationRef.current = secs;
    progressAnim.setValue(0);
    circleOpacity.setValue(1);
    setIsRunning(true);
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
              
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handleStop}
              >
                <Ionicons name="stop" size={24} color={colors.danger} />
                <Text style={styles.controlButtonText}>Stop</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Break button (only show after focus complete) */}
          {currentPhase === 'idle' && (
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={handleStartBreak}
            >
              <Text style={styles.secondaryButtonText}>Start Break</Text>
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
    marginTop: spacing.xl,
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
