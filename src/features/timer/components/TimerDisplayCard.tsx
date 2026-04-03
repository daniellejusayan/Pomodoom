import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicon } from '../../../shared/components/Icon/Icon';

import { colors } from '../../../core/theme/colors';
import { Button, ProgressRing, Text } from '../../../shared/components';

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
  activeTask?: string | null;
  onTaskBannerPress?: () => void;
  isLocked?: boolean;
  onLockedTap?: () => void;
  lockTapCount?: number;
  penaltyType?: 'none' | 'warning' | 'resetTimer' | 'addTime' | 'lockMode'; // 🆕 ADDED
}

const PHASE_CONFIG = {
  idle: {
    label: 'READY',
    accent: colors.primary,
    badgeBackground: 'rgba(107,180,232,0.12)',
    ringColors: [colors.primaryLight, colors.border] as [string, string],
    messageTone: colors.textSecondary,
  },
  focus: {
    label: 'FOCUS',
    accent: colors.primaryDeep,
    badgeBackground: 'rgba(24,131,241,0.12)',
    ringColors: [colors.primaryLight, colors.primaryDeep] as [string, string],
    messageTone: colors.textPrimary,
  },
  break: {
    label: 'BREAK',
    accent: colors.success,
    badgeBackground: 'rgba(52,211,153,0.12)',
    ringColors: [colors.success, colors.primary] as [string, string],
    messageTone: colors.textPrimary,
  },
  longBreak: {
    label: 'LONG BREAK',
    accent: colors.success,
    badgeBackground: 'rgba(52,211,153,0.12)',
    ringColors: [colors.success, colors.primary] as [string, string],
    messageTone: colors.textPrimary,
  },
} satisfies Record<TimerPhase, {
  label: string;
  accent: string;
  badgeBackground: string;
  ringColors: [string, string];
  messageTone: string;
}>;

// 🆕 ADDED: Penalty badge config for all penalty types
const PENALTY_BADGE = {
  'warning': { label: '⚠️ WARNING', color: '#F39C12', background: 'rgba(243,156,18,0.12)' },
  'resetTimer': { label: '🔄 RESET', color: '#E74C3C', background: 'rgba(231,76,60,0.12)' },
  'addTime': { label: '⏱️ +TIME', color: '#F39C12', background: 'rgba(243,156,18,0.12)' },
  'lockMode': { label: '🔒 LOCKED', color: colors.primary, background: 'rgba(107,180,232,0.12)' },
} satisfies Record<'warning' | 'resetTimer' | 'addTime' | 'lockMode', {
  label: string;
  color: string;
  background: string;
}>

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
  activeTask,
  onTaskBannerPress,
  isLocked = false,
  onLockedTap,
  lockTapCount = 0,
  penaltyType = 'none', // 🆕 ADDED
}: TimerDisplayCardProps) {
  const phase = PHASE_CONFIG[currentPhase];
  const shake = useRef(new Animated.Value(0)).current;
  // 🆕 ADDED: Compute penalty badge
  const penaltyBadge = penaltyType && penaltyType !== 'none' ? PENALTY_BADGE[penaltyType] ?? null : null;

  const isLongBreakTime = breakCycleCount >= 2;
  const breakButtonText = isLongBreakTime ? 'Start Long Break' : 'Start Break';

  const showTaskInRing = currentPhase === 'focus' && Boolean(activeTask);
  const showTaskBanner = Boolean(activeTask) && currentPhase !== 'focus';
  const isStrictlyLocked = isLocked && currentPhase === 'focus';

  useEffect(() => {
    if (!isStrictlyLocked || lockTapCount <= 0) return;

    Animated.sequence([
      Animated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [isStrictlyLocked, lockTapCount, shake]);

  const handleStopPress = () => {
    if (isStrictlyLocked) {
      onLockedTap?.();
      return;
    }
    onStop();
  };

  const handlePausePress = () => {
    if (isStrictlyLocked) {
      onLockedTap?.();
      return;
    }
    onPause();
  };

  return (
    <View style={styles.card}>
      <View style={[styles.topRow, { flexWrap: 'wrap', gap: 6 }]}>
        <View style={[styles.phaseBadge, { backgroundColor: phase.badgeBackground }]}>
          <View style={[styles.phaseDot, { backgroundColor: phase.accent }]} />
          <Text style={[styles.phaseLabel, { color: phase.accent }]}>{phase.label}</Text>
        </View>
        {penaltyBadge && (
          <View style={[styles.penaltyBadge, { backgroundColor: penaltyBadge.background }]}>
            <Text style={[styles.penaltyBadgeText, { color: penaltyBadge.color }]}>{penaltyBadge.label}</Text>
          </View>
        )}
        {isLocked ? (
          <View style={styles.lockBadge}>
            <Ionicon name="lock-closed" size={11} color={colors.warning} />
            <Text style={styles.lockBadgeText}>LOCKED</Text>
          </View>
        ) : null}
      </View>

      {isStrictlyLocked ? (
        <View style={styles.lockBanner}>
          <Ionicon name="lock-closed" size={16} color={colors.warning} />
          <Text style={styles.lockBannerText}>
            Lock Mode active - stay focused to unlock controls
          </Text>
        </View>
      ) : null}

      {isStrictlyLocked ? (
        <Text style={styles.lockHintText}>
          Locked taps: {lockTapCount}/3 - emergency exit unlocks after 3 taps
        </Text>
      ) : null}

      <Animated.View style={{ opacity: circleOpacity, transform: [{ translateX: shake }] }}>
        <ProgressRing
          progress={currentPhase === 'idle' ? 0 : progress}
          size={228}
          strokeWidth={16}
          gradientColors={phase.ringColors}
          backgroundColor={colors.border}
        >
          <View style={styles.ringCenter}>
            <Text style={styles.timeValue}>{displayTime}</Text>

            {showTaskInRing ? (
              <Text style={styles.activeTaskInRing} numberOfLines={1}>
                {activeTask}
              </Text>
            ) : null}

            {isRunning && currentPhase !== 'idle' ? (
              <View style={styles.pulseRow}>
                <View style={[styles.pulseDot, { backgroundColor: phase.accent }]} />
                <Text style={[styles.pulseText, { color: phase.accent }]}>
                  {currentPhase === 'focus' ? 'focusing' : 'resting'}
                </Text>
              </View>
            ) : null}
          </View>
        </ProgressRing>
      </Animated.View>

      <Text style={[styles.message, { color: phase.messageTone }]}>{timerMessage}</Text>

      {showTaskBanner ? (
        <TouchableOpacity
          style={[styles.taskBanner, { borderLeftColor: phase.accent }]}
          onPress={onTaskBannerPress}
          activeOpacity={0.75}
          disabled={!onTaskBannerPress}
        >
          <Ionicon name="bookmark-outline" size={14} color={phase.accent} />
          <Text style={styles.taskBannerText} numberOfLines={1}>
            {activeTask}
          </Text>
          <Ionicon name="chevron-forward" size={14} color={phase.accent} />
        </TouchableOpacity>
      ) : null}

      {currentPhase === 'idle' ? (
        <View style={styles.buttonStack}>
          <Button onPress={onStart} 
            fullWidth 
            style={[styles.primaryButton, { backgroundColor: phase.accent }]} 
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
        </View>
      ) : (
        <View style={styles.controlRow}>
          <Button
            onPress={handleStopPress}
            variant="outline"
            fullWidth
            style={[styles.controlButton, isLocked && styles.controlButtonLocked]}
            textStyle={[styles.controlButtonText, isLocked && styles.controlButtonTextLocked]}
            icon={<Ionicon name="stop" size={22} color={isLocked ? colors.textSecondary : colors.danger} />}
          >
            Stop
          </Button>

          {isRunning ? (
            <Button
              onPress={handlePausePress}
              variant="outline"
              fullWidth
              style={[styles.controlButton, isLocked && styles.controlButtonLocked]}
              textStyle={[styles.controlButtonText, isLocked && styles.controlButtonTextLocked]}
              icon={<Ionicon name="pause" size={22} color={isLocked ? colors.textSecondary : colors.primary} />}
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
              icon={<Ionicon name="play" size={22} color={colors.primary} />}
            >
              Resume
            </Button>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 32,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(243,156,18,0.12)',
  },
  // 🆕 ADDED: Penalty badge styling
  penaltyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  penaltyBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  lockBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.warning,
  },
  lockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(243,156,18,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
  },
  lockBannerText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  lockHintText: {
    width: '100%',
    color: colors.warning,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: -6,
  },
  phaseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  phaseLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  ringCenter: {
    width: 168,
    height: 168,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  timeValue: {
    color: colors.textPrimary,
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1,
  },
  activeTaskInRing: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 12,
    opacity: 0.75,
  },
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pulseText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  taskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(107,180,232,0.08)',
    borderLeftWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
  },
  taskBannerText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  buttonStack: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 13,
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
  controlRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  controlButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 4,
  },
  controlButtonLocked: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderColor: 'rgba(0,0,0,0.06)',
    opacity: 0.5,
  },
  controlButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  controlButtonTextLocked: {
    color: colors.textSecondary,
  },
});
