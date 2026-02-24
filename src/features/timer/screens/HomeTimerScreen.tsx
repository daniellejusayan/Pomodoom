import { useNavigation } from '@react-navigation/native';
<<<<<<< Updated upstream
import React, { useMemo, useState } from 'react';
=======
import React, { useEffect, useMemo, useState, useRef } from 'react';
>>>>>>> Stashed changes
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Animated,
} from 'react-native';
<<<<<<< Updated upstream
=======
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
>>>>>>> Stashed changes

import { focusDurationsMinutes, defaultFocusMinutes } from '../../../core/constants';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { ROUTES } from '../../../navigation/routes';
import { TimerStackParamList } from '../../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<TimerStackParamList, typeof ROUTES.TIMER.HOME>;

export default function HomeTimerScreen() {
  const navigation = useNavigation<Nav>();
<<<<<<< Updated upstream
  const [selectedDuration, setSelectedDuration] = useState<number>(defaultFocusMinutes);
=======
  const AnimatedSvg = Animated.createAnimatedComponent(Svg);
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
>>>>>>> Stashed changes

  const timerMessage = useMemo(() => `${selectedDuration} min focus`, [selectedDuration]);

<<<<<<< Updated upstream
  const handleComplete = () => {
    navigation.navigate(ROUTES.TIMER.SESSION_COMPLETE, { sessionId: 'demo' });
  };
=======
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
>>>>>>> Stashed changes

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
<<<<<<< Updated upstream
        <Text style={styles.logo}>Pomodoom</Text>
        <Text style={styles.heading}>Focus Timer</Text>
        <Text style={styles.subhead}>Pick an interval and start</Text>
=======
        <Text style={styles.heading}>
          {currentPhase === 'focus' ? 'Focus Mode' : 
           currentPhase === 'break' ? 'Break Time' : 
           'Ready to Focus?'}
        </Text>
        <Text style={styles.subhead}>
          {currentPhase === 'idle' ? 'Pick your intervals and start' : ''}
          </Text>
>>>>>>> Stashed changes
      </View>

      <View style={styles.timerCard}>
<<<<<<< Updated upstream
        <View style={styles.timerCircleOuter}>
=======
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
>>>>>>> Stashed changes
          <View style={styles.timerCircleInner}>
            <Text style={styles.timerValue}>{selectedDuration}</Text>
            <Text style={styles.timerLabel}>minutes</Text>
          </View>
<<<<<<< Updated upstream
        </View>
=======
        </Animated.View>
        
>>>>>>> Stashed changes
        <Text style={styles.timerMessage}>{timerMessage}</Text>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Start focus</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleComplete}>
          <Text style={styles.secondaryButtonText}>Mark complete</Text>
        </TouchableOpacity>
      </View>

<<<<<<< Updated upstream
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Preset intervals</Text>
        <FlatList
          horizontal
          data={focusDurationsMinutes}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={{ gap: spacing.sm }}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = item === selectedDuration;
            return (
              <TouchableOpacity
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setSelectedDuration(item)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{item}m</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
=======
      {/* 🎯 FOCUS DURATION SELECTOR - Only show when idle */}
      {currentPhase === 'idle' && (
        <>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="timer-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Focus Duration (default)</Text>
              <Text style={styles.sectionTitle}>Focus Duration (default)</Text>
            </View>
            <View style={styles.chipsContainer}>
              {focusDurationsMinutes.map((item) => {
            <View style={styles.chipsContainer}>
              {focusDurationsMinutes.map((item) => {
                const isActive = item === focusDuration;
                return (
                  <TouchableOpacity
                    key={item}
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
              })}
            </View>
          </View>
        </>
      )}
      </SafeAreaView>
    </LinearGradient>
>>>>>>> Stashed changes
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    backgroundColor: 'transparent',
    padding: spacing.xl,
    gap: spacing.xl,
  },
  headerRow: {
    gap: spacing.xs,
    marginTop: spacing.xxl *3, // 🔄 Increased top margin for better spacing with the illustration
    marginTop: spacing.xxl *3, // 🔄 Increased top margin for better spacing with the illustration
  },
   logo: {
    alignSelf: 'center',
    fontSize: 40,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: spacing.lg * 2, // 🔄 Increased bottom margin for better spacing with the illustration
    marginTop: 40, // 🔄 Increased top margin for better spacing with the illustration
  },
  heading: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  subhead: {
    color: colors.textSecondary,
    fontSize: 15,
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
