import React, { useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { Text } from '../../../shared/components';
import { Ionicon } from '../../../shared/components/Icon/Icon';

interface LockViolationAlertProps {
  visible: boolean;
  countdownSeconds?: number;
  onResume: () => void;
}

export function LockViolationAlert({
  visible,
  countdownSeconds = 10,
  onResume,
}: LockViolationAlertProps) {
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);

  useEffect(() => {
    if (!visible) {
      setSecondsLeft(countdownSeconds);
      return;
    }

    setSecondsLeft(countdownSeconds);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, countdownSeconds]);

  const resumeLabel = useMemo(() => {
    if (secondsLeft > 0) {
      return `Resume in ${secondsLeft}s`;
    }
    return 'Resume Focus Session';
  }, [secondsLeft]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => undefined}>
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={styles.iconWrap}>
            <Ionicon name="warning" size={34} color={colors.warning} />
          </View>

          <Text style={styles.title}>Focus Lock Violation</Text>
          <Text style={styles.message}>
            You left the app during a locked focus session. Resume after the cooldown to continue.
          </Text>

          <TouchableOpacity
            style={[styles.resumeButton, secondsLeft > 0 && styles.resumeButtonDisabled]}
            onPress={secondsLeft > 0 ? undefined : onResume}
            disabled={secondsLeft > 0}
            activeOpacity={0.85}
          >
            <Text style={styles.resumeButtonText}>{resumeLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.32,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 10,
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(243,156,18,0.16)',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  resumeButton: {
    width: '100%',
    marginTop: spacing.xs,
    borderRadius: 12,
    paddingVertical: spacing.md,
    backgroundColor: colors.warning,
    alignItems: 'center',
  },
  resumeButtonDisabled: {
    backgroundColor: colors.border,
  },
  resumeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
