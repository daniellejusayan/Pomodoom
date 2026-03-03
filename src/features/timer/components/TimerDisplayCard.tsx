import React from 'react';
import { Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../../core/theme/colors';
import { Button, ProgressRing, Text } from '../../../shared/components';
import { styles } from '../screens/HomeTimerScreen.styles';

type TimerPhase = 'idle' | 'focus' | 'break' | 'longBreak';

interface TimerDisplayCardProps {
  currentPhase: TimerPhase;
  isRunning: boolean;
  progress: number;
  circleOpacity: Animated.Value;
  displayTime: string | number;
  timerMessage: string;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onStartBreak: () => void;
  breakCycleCount: number; // Added to determine break vs long break
  breakDuration: number;
  longBreakDuration: number;
}

export function TimerDisplayCard({
  currentPhase,
  isRunning,
  progress,
  circleOpacity,
  displayTime,
  timerMessage,
  onStart,
  onStop,
  onPause,
  onStartBreak,
  breakCycleCount,
  breakDuration,        // currently unused but available
  longBreakDuration,    // currently unused but available
}: TimerDisplayCardProps) {
  const ringGradient =
    currentPhase === 'break' || currentPhase === 'longBreak'
      ? [colors.success, colors.primary]
      : [colors.primaryLight, colors.primaryDeep];

  // 🆕 Determine if it's time for long break
  const isLongBreakTime = breakCycleCount >= 2;
  const breakButtonText = isLongBreakTime ? 'Start Long Break' : 'Start Break';
  return (
    <View style={styles.timerCard}>
      <Animated.View style={{ opacity: circleOpacity }}>
        <ProgressRing
          progress={currentPhase === 'idle' ? 0 : progress}
          size={228}
          strokeWidth={20}
          gradientColors={ringGradient}
          backgroundColor={colors.border}
        >
          <View style={styles.timerRingCenter}>
            <Text style={styles.timerValue}>{displayTime}</Text>
          </View>
        </ProgressRing>
      </Animated.View>

      <Text style={styles.timerMessage}>{timerMessage}</Text>

      {currentPhase === 'idle' ? (
        <>
          <Button onPress={onStart} 
            fullWidth 
            style={styles.primaryButton} 
            textStyle={styles.primaryButtonText}>
            Start Focus
          </Button>
          <Button
            onPress={onStartBreak}
            variant="secondary"
            fullWidth
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          >
            {breakButtonText}
          </Button>
        </>
      ) : (
        <View style={styles.controlRow}>
          <Button
            onPress={onStop}
            variant="outline"
            fullWidth
            style={styles.controlButton}
            textStyle={styles.controlButtonText}
            icon={<Ionicons name="stop" size={22} color={colors.danger} />}
          >
            Stop
          </Button>

          {isRunning ? (
            <Button
              onPress={onPause}
              variant="outline"
              fullWidth
              style={styles.controlButton}
              textStyle={styles.controlButtonText}
              icon={<Ionicons name="pause" size={22} color={colors.primary} />}
            >
              Pause
            </Button>
          ) : (
            <Button
              onPress={onStart}
              variant="outline"
              fullWidth
              style={styles.controlButton}
              textStyle={styles.controlButtonText}
              icon={<Ionicons name="play" size={22} color={colors.primary} />}
            >
              Resume
            </Button>
          )}
        </View>
      )}
    </View>
  );
}
