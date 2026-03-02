import React from 'react';
import { Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../../core/theme/colors';
import { Button, ProgressRing, Text } from '../../../shared/components';
import { styles } from '../screens/HomeTimerScreen.styles';

type TimerPhase = 'idle' | 'focus' | 'break';

interface TimerDisplayCardProps {
  currentPhase: TimerPhase;
  isRunning: boolean;
  progress: number;
  circleOpacity: Animated.Value;
  displayTime: string | number;
  timerMessage: string;
  isNextBreakLong: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onStartBreak: () => void;
}

export function TimerDisplayCard({
  currentPhase,
  isRunning,
  progress,
  circleOpacity,
  displayTime,
  timerMessage,
  isNextBreakLong,
  onStart,
  onStop,
  onPause,
  onStartBreak,
}: TimerDisplayCardProps) {
  const ringGradient =
    currentPhase === 'break'
      ? [colors.success, colors.primary]
      : [colors.primaryLight, colors.primaryDeep];

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
            <Text style={styles.timerLabel}>{currentPhase === 'idle' ? 'minutes' : ''}</Text>
          </View>
        </ProgressRing>
      </Animated.View>

      <Text style={styles.timerMessage}>{timerMessage}</Text>

      {currentPhase === 'idle' ? (
        <Button onPress={onStart} fullWidth style={styles.primaryButton} textStyle={styles.primaryButtonText}>
          Start Focus
        </Button>
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

      {currentPhase === 'idle' && (
        <Button
          onPress={onStartBreak}
          variant="secondary"
          fullWidth
          style={styles.secondaryButton}
          textStyle={styles.secondaryButtonText}
        >
          {isNextBreakLong ? 'Start Long Break' : 'Start Break'}
        </Button>
      )}
    </View>
  );
}
