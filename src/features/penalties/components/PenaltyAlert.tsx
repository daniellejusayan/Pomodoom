import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { useSettings } from '../../../context/SettingsContext';
import type { PenaltyType } from '../types/PenaltyTypes';

interface PenaltyAlertProps {
  visible: boolean;
  penaltyType: PenaltyType;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isStopAction?: boolean;
  showCancel?: boolean;
  onGoBack?: () => void;
}

export const PenaltyAlert: React.FC<PenaltyAlertProps> = ({
  visible,
  penaltyType,
  message,
  onConfirm,
  onCancel,
  showCancel = true,
  isStopAction = false,
  onGoBack,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const { vibrationEnabled, soundEnabled } = useSettings();

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Trigger haptics and sound on penalty alert
      const triggerFeedback = async () => {
        if (vibrationEnabled) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        if (soundEnabled) {
          try {
            const { sound } = await Audio.Sound.createAsync(
              require('../../../../assets/sounds/penalty.mp3')
            );
            await sound.playAsync();
          } catch (error) {
            console.error('Failed to play penalty sound:', error);
          }
        }
      };
      triggerFeedback();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, vibrationEnabled, soundEnabled]);

  // Get icon and color based on penalty type
  const getAlertStyle = () => {
    switch (penaltyType) {
      case 'warning':
        return {
          icon: 'alert-circle' as const,
          iconColor: colors.warning || '#F39C12',
          title: 'Warning',
        };
      case 'resetTimer':
        return {
          icon: 'refresh-circle' as const,
          iconColor: colors.danger || '#E74C3C',
          title: 'Timer Reset',
        };
      case 'addTime':
        return {
          icon: 'time' as const,
          iconColor: colors.warning || '#F39C12',
          title: 'Time Added',
        };
      default:
        return {
          icon: 'information-circle' as const,
          iconColor: colors.primary,
          title: 'Notice',
        };
    }
  };

  const alertStyle = getAlertStyle();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.alertContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${alertStyle.iconColor}20` }]}>
            <Ionicons
              name={alertStyle.icon}
              size={48}
              color={alertStyle.iconColor}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{alertStyle.title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          {/* 🔄 CHANGED: Different button layouts based on action type */}
          {isStopAction && onGoBack ? (
            // 🆕 STOP ACTION: Show "Accept Penalty" and "Go Back" buttons
            <View style={styles.buttonColumn}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  { backgroundColor: alertStyle.iconColor },
                ]}
                onPress={onConfirm}
              >
                <Text style={styles.confirmButtonText}>Finish Session</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.goBackButton]}
                onPress={onGoBack}
              >
                <Ionicons name="arrow-back" size={20} color={colors.primary} />
                <Text style={styles.goBackButtonText}>Go Back to Timer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // 🔄 ORIGINAL: Pause action or warning - show Cancel/Continue buttons
            <View style={styles.buttonRow}>
              {showCancel && onCancel && (
                <TouchableOpacity
                  style={[styles.button, styles.buttonInRow,styles.cancelButton]}
                  onPress={onCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonInRow,
                  styles.confirmButton,
                  { backgroundColor: alertStyle.iconColor },
                  !showCancel && { width: '100%' }, // changed: use width instead of flex
                ]}
                onPress={onConfirm}
              >
                <Text style={styles.confirmButtonText}>
                  {penaltyType === 'warning' && showCancel ? 'Continue' : 'OK'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  alertContainer: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 30,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    marginTop: spacing.md,
  },
  // 🆕 ADDED: Specific style for buttons in row layout
  buttonInRow: {
    flex: 1, // Only use flex in row layout
  },
  // 🆕 ADDED: Vertical button column (for stop action)
  buttonColumn: {
    flexDirection: 'column',
    gap: spacing.md,
    width: '100%',
    marginTop: spacing.md,
  },
  button: {
  // 🔧 FIX: Remove flex: 1 from here
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center', // 🆕 ADDED: Ensure content is centered
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    // Background color set dynamically
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  // 🆕 ADDED: Go back button styling
  goBackButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    justifyContent: 'center', // 🆕 ADDED: Center the content
  },
  goBackButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});