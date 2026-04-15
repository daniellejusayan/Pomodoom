import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, Image} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Optional: For a nice background gradient
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { formatDurationAdaptive, formatPenaltyLabel } from '../../../core/utils/formatters';
import { useSettings } from '../../../context/SettingsContext';
import { ROUTES } from '../../../navigation/routes';
import type { BottomTabParamList, TimerStackParamList } from '../../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Text } from '../../../shared/components';

type Nav = NativeStackNavigationProp<TimerStackParamList, typeof ROUTES.TIMER.SESSION_COMPLETE>;

type Route = RouteProp<TimerStackParamList, typeof ROUTES.TIMER.SESSION_COMPLETE>;

export default function SessionCompleteScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { vibrationEnabled, soundEnabled, addSessionInterruptions, penaltyType, recordPenaltyUsage } = useSettings();
  const recordedSessionRef = React.useRef<string | null>(null);

  // read completion details from params
  const { sessionId, pauseCount = 0, focusedDurationSeconds = 0 } = route.params ?? {};
  const safePauseCount = Number.isFinite(pauseCount) ? Math.max(0, Math.floor(pauseCount)) : 0;
  const safeFocusedDurationSeconds = Number.isFinite(focusedDurationSeconds)
    ? Math.max(0, Math.floor(focusedDurationSeconds))
    : 0;
  const focusDurationLabel = formatDurationAdaptive(safeFocusedDurationSeconds);

  // record total interruptions once per completed session
  useEffect(() => {
    if (!sessionId || recordedSessionRef.current === sessionId) {
      return;
    }

    recordedSessionRef.current = sessionId;
    // always log which penalty was active during this session
    recordPenaltyUsage(penaltyType);

    if (safePauseCount > 0) {
      addSessionInterruptions(safePauseCount);
    }
  }, [sessionId, safePauseCount, addSessionInterruptions, penaltyType, recordPenaltyUsage]);

  useFocusEffect(
    React.useCallback(() => {
      // Trigger success feedback when session complete screen appears
      const triggerFeedback = async () => {
        if (vibrationEnabled) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        if (soundEnabled) {
          try {
            const { sound } = await Audio.Sound.createAsync(
              require('../../../../assets/sounds/success.mp3')
            );
            await sound.playAsync();
          } catch (error) {
            console.error('Failed to play success sound:', error);
          }
        }
      };
      triggerFeedback();
    }, [vibrationEnabled, soundEnabled])
  );

  const handleBackHome = () => {
    navigation.navigate(ROUTES.TIMER.HOME);
  };

  const handleViewStats = () => {
    navigation
      .getParent<BottomTabNavigationProp<BottomTabParamList>>()
      ?.navigate(ROUTES.TABS.STATISTICS);
  };

   return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        {/* 🆕 ADDED: Pomodoom title at top */}
        <Text style={styles.appTitle}>Pomodoom</Text>

        <View style={styles.content}>
          {/* 🆕 ADDED: White card container for all content */}
          <Card>
            
            {/* 🆕 ADDED: Celebration illustration */}
            <View style={styles.illustrationContainer}>
              <Image
                source={require('../../../../assets/sitting_tomato_completed.png')}
                style={styles.illustration}
                resizeMode="contain"
              />
            </View>

            {/* 🔄 CHANGED: Title and subtitle layout */}
            <Text style={styles.title}>Session Complete!</Text>
            <Text style={styles.subtitle}>
              Great job! You nailed that{'\n'}focus session.
            </Text>

            {/* 🔄 CHANGED: Stats now in vertical list format with labels on left */}
            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Focus Duration:</Text>
                <Text style={styles.statValue}>{focusDurationLabel}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Interruptions:</Text>
                <Text style={styles.statValue}>{safePauseCount}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Penalty Mode:</Text>
                <Text style={styles.statValue}>{formatPenaltyLabel(penaltyType)}</Text>
              </View>
            </View>
          </Card>

          {/* 🆕 ADDED: Buttons outside the white card */}
          <View style={styles.buttonsContainer}>
            {/* Primary Button - Return to Home */}
            <Button
              onPress={handleBackHome}
              fullWidth
              style={styles.primaryButton}
              textStyle={styles.primaryButtonText}
            >
              Return to Home
            </Button>

            {/* 🆕 ADDED: Secondary Button - View Statistics */}
            <Button
              onPress={handleViewStats}
              variant="secondary"
              fullWidth
              style={styles.secondaryButton}
              textStyle={styles.secondaryButtonText}
            >
              View Statistics
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Gradient background
    padding: spacing.xl,
    justifyContent: 'center',
  },

  // 🆕 ADDED: App title at top
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },

  // 🆕 ADDED: Content wrapper for centering
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center', // Center content horizontally
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 24,
    elevation: 10,
  },

    // 🆕 ADDED: Illustration container

  illustrationContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },

  // 🆕 ADDED: Illustration image
  illustration: {
    width: 250,
    height: 250,
    transform: [{ scale: 1.8 }],
  },

  title: {
    color: colors.textPrimary,
    fontSize: 24, 
    fontWeight: '800',
    textAlign: 'center', // Centered text
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15, // Slightly smaller than before (15 -> 14)
    lineHeight: 20,
    textAlign: 'center', // Centered text
    marginBottom: spacing.sm, // space before states
  },
    // 🔄 CHANGED: Stats container - now vertical list instead of horizontal boxes
  statsContainer: {
    width: '100%',
    gap: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Align items vertically centered
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },

  buttonsContainer: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl, // 🆕 ADDED: Horizontal padding
    borderRadius: 999, // 🔄 CHANGED: From 14 to 999 (pill shape)
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  // 🆕 ADDED: Secondary button (View Statistics)
  secondaryButton: {
    backgroundColor: colors.background, // Semi-transparent white
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 999, // Pill shape
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  // 🆕 ADDED: Secondary button text
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});
