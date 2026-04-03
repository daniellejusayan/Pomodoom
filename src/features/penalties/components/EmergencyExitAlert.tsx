import React, { useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { Text } from '../../../shared/components';
import { Ionicon } from '../../../shared/components/Icon/Icon';

interface EmergencyExitAlertProps {
  visible: boolean;
  onStayFocused: () => void;
  onEmergencyExit: () => void;
}

interface Challenge {
  left: number;
  right: number;
  answer: number;
}

const getChallenge = (): Challenge => {
  const left = Math.floor(Math.random() * 9) + 1;
  const right = Math.floor(Math.random() * 9) + 1;
  return {
    left,
    right,
    answer: left + right,
  };
};

export function EmergencyExitAlert({
  visible,
  onStayFocused,
  onEmergencyExit,
}: EmergencyExitAlertProps) {
  const [challenge, setChallenge] = useState<Challenge>(() => getChallenge());
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setChallenge(getChallenge());
    setInput('');
    setError(null);
  }, [visible]);

  const equationText = useMemo(
    () => `${challenge.left} + ${challenge.right} = ?`,
    [challenge.left, challenge.right]
  );

  const handleUnlock = () => {
    const normalized = Number.parseInt(input.trim(), 10);
    if (Number.isNaN(normalized)) {
      setError('Enter a numeric answer to confirm emergency exit.');
      return;
    }

    if (normalized !== challenge.answer) {
      setError('Incorrect answer. You can stay focused or try a new challenge.');
      setChallenge(getChallenge());
      setInput('');
      return;
    }

    setError(null);
    onEmergencyExit();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onStayFocused}>
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={styles.iconWrap}>
            <Ionicon name="shield-checkmark" size={34} color={colors.primaryDeep} />
          </View>

          <Text style={styles.title}>Emergency Exit</Text>
          <Text style={styles.message}>
            Lock mode blocks Pause and Stop while focus is active. Solve this challenge to force an exit.
          </Text>

          <View style={styles.challengeCard}>
            <Text style={styles.challengeLabel}>Math Verification</Text>
            <Text style={styles.challengeText}>{equationText}</Text>
            <TextInput
              value={input}
              onChangeText={(next) => {
                setInput(next);
                if (error) setError(null);
              }}
              keyboardType="number-pad"
              placeholder="Enter answer"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.stayButton} onPress={onStayFocused} activeOpacity={0.85}>
              <Text style={styles.stayButtonText}>Stay Focused</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.unlockButton} onPress={handleUnlock} activeOpacity={0.85}>
              <Text style={styles.unlockButtonText}>Unlock Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 20,
    padding: spacing.xl,
    backgroundColor: colors.card,
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
    backgroundColor: 'rgba(24,131,241,0.12)',
    alignSelf: 'center',
  },
  title: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
  },
  message: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  challengeCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  challengeLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  challengeText: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stayButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  stayButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  unlockButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.primaryDeep,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  unlockButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
