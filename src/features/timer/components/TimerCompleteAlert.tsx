import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../shared/components/Text';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';

export interface TimerCompleteAlertProps {
  visible: boolean;
  phase: 'focus' | 'break' | 'longBreak';
  nextLabel: string;
  onStart: () => void;
}

export const TimerCompleteAlert: React.FC<TimerCompleteAlertProps> = ({
  visible,
  phase,
  nextLabel,
  onStart,
}) => {
  const getPhaseConfig = () => {
    switch (phase) {
      case 'focus':
        return {
          icon: 'checkmark-circle',
          title: 'Focus Complete!',
          message: 'Great work! Ready for a break?',
          color: colors.success,
        };
      case 'break':
        return {
          icon: 'refresh-circle',
          title: 'Break Complete!',
          message: 'Time to focus again.',
          color: colors.accent,
        };
      case 'longBreak':
        return {
          icon: 'star-circle',
          title: 'Long Break Complete!',
          message: 'Refreshed and ready to go!',
          color: colors.primary,
        };
      default:
        return {
          icon: 'checkmark-circle',
          title: 'Complete!',
          message: 'Ready to continue?',
          color: colors.success,
        };
    }
  };

  const config = getPhaseConfig();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, { borderTopColor: config.color }]}>
          <Ionicons
            name={config.icon as any}
            size={64}
            color={config.color}
            style={styles.icon}
          />
          <Text variant="h2" style={styles.title}>
            {config.title}
          </Text>
          <Text variant="body" style={styles.message}>
            {config.message}
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: config.color }]}
            onPress={onStart}
            activeOpacity={0.7}
          >
            <Text variant="label" style={styles.buttonText}>
              {nextLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.background,
    borderRadius: spacing.lg,
    borderTopWidth: 4,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    marginBottom: spacing.lg,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.md,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
