import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../../core/theme/colors';
import { Button, Text } from '../../../shared/components';
import { styles } from '../screens/HomeTimerScreen.styles';

type TimerPhase = 'idle' | 'focus' | 'break';

interface TimerDisplayCardProps {
  currentPhase: TimerPhase;
  isRunning: boolean;
  circleOpacity: Animated.Value;
  displayTime: string | number;
  timerMessage: string;
  isNextBreakLong: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onStartBreak: () => void;
  AnimatedSvg: any;
  AnimatedCircle: any;
  CIRCLE_RADIUS: number;
  STROKE_WIDTH: number;
  circumference: number;
  dashOffset: Animated.AnimatedInterpolation<string | number>;
}

export function TimerDisplayCard({
  currentPhase,
  isRunning,
  circleOpacity,
  displayTime,
  timerMessage,
  isNextBreakLong,
  onStart,
  onStop,
  onPause,
  onStartBreak,
  AnimatedSvg,
  AnimatedCircle,
  CIRCLE_RADIUS,
  STROKE_WIDTH,
  circumference,
  dashOffset,
}: TimerDisplayCardProps) {
  return (
    <View style={styles.timerCard}>
      <Animated.View
        style={[
          styles.timerCircleOuter,
          currentPhase === 'focus' && styles.timerCircleFocus,
          currentPhase === 'break' && styles.timerCircleBreak,
          { opacity: circleOpacity },
        ]}
      >
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
          <Text style={styles.timerLabel}>{currentPhase === 'idle' ? 'minutes' : ''}</Text>
        </View>
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
