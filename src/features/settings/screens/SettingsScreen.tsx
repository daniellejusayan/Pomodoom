import React from 'react';
import { 
  Alert,
  SafeAreaView, 
  ScrollView,
  StyleSheet, 
  View 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { 
  focusDurationsMinutes, 
  breakDurationsMinutes as breakDurationMinutes,
  longBreakMinutes,
} from '../../../core/constants';

import { useSettings } from '../../../context/SettingsContext';
import { useSession } from '../../../context/SessionContext';
import { Button, Card, Chip, Switch as AppSwitch, Text } from '../../../shared/components';
import { ROUTES } from '../../../navigation/routes';
import { clearAllAppData, setHomeTutorialDismissedFlag, setOnboardingFlag } from '../../../services/storage';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();

  // 🔗 Get settings from context (shared with Home screen)
  const {
    focusDuration,
    breakDuration,
    longBreakDuration,
    penaltyType,
    soundEnabled,
    vibrationEnabled,
    setFocusDuration,
    setBreakDuration,
    setLongBreakDuration,
    setPenaltyType,
    setSoundEnabled,
    setVibrationEnabled,
    resetAllSettingsData,
  } = useSettings();
  const { clearSessionData } = useSession();

  const replayOnboarding = async () => {
    await setOnboardingFlag(false);
    navigation.getParent()?.navigate(ROUTES.ROOT.ONBOARDING);
  };

  const replayHomeTutorial = async () => {
    await setHomeTutorialDismissedFlag(false);
    navigation.navigate(ROUTES.TABS.TIMER, {
      screen: ROUTES.TIMER.HOME,
      params: { replayTutorial: true },
    });
  };

  const runClearAllData = async () => {
    try {
      await clearAllAppData();
      await resetAllSettingsData();
      await clearSessionData();

      Alert.alert('Done', 'All local app data has been cleared. Onboarding will start again.', [
        {
          text: 'OK',
          onPress: () => {
            navigation.getParent()?.navigate(ROUTES.ROOT.ONBOARDING);
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Clear Data Failed', 'We could not clear your data. Please try again.');
      console.error('Failed to clear app data:', error);
    }
  };

  const confirmClearAllData = () => {
    Alert.alert(
      'Clear All Data?',
      'This will remove all local sessions, settings, tasks, and tutorial progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear Data', style: 'destructive', onPress: runClearAllData },
      ]
    );
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 🎯 HEADER */}
          <Text style={styles.heading}>Settings</Text>
          <Text style={styles.subheading}>
            Tune your style by setting durations, choose penalty pressure, and replay guidance anytime.
          </Text>

          {/* 🎯 FOCUS DURATION CARD */}
          <Card>
            <Text style={styles.cardTitle}>Focus Duration</Text>
            <Text style={styles.cardDescription}>Choose how long your focus sessions last.</Text>
            <View style={styles.chipsContainer}>
              {focusDurationsMinutes.filter((duration) => duration <= 45).map((duration) => {
                const isActive = duration === focusDuration;
                return (
                  <Chip
                    key={duration}
                    label={`${duration}m`}
                    selected={isActive}
                    onPress={() => setFocusDuration(duration)}
                  />
                );
              })}
            </View>
          </Card>

          {/* 🎯 BREAK DURATION CARD */}
          <Card>
            <Text style={styles.cardTitle}>Break Duration</Text>
            <Text style={styles.cardDescription}>Choose how long your usual breaks last.</Text>
            <View style={styles.chipsContainer}>
              {breakDurationMinutes.slice(0, 3).map((duration) => {
                const isActive = duration === breakDuration;
                return (
                  <Chip
                    key={duration}
                    label={`${duration}m`}
                    selected={isActive}
                    onPress={() => setBreakDuration(duration)}
                  />
                );
              })}
            </View>
          </Card>

          {/* 🎯 LONG BREAK DURATION CARD */}
          <Card>
            <Text style={styles.cardTitle}>Long Break Duration</Text>
            <Text style={styles.cardDescription}>Choose how long your extended breaks last.</Text>
            <View style={styles.chipsContainer}>
              {longBreakMinutes.map((duration) => {
                const isActive = duration === longBreakDuration;
                return (
                  <Chip
                    key={duration}
                    label={`${duration}m`}
                    selected={isActive}
                    onPress={() => setLongBreakDuration(duration)}
                  />
                );
              })}
            </View>
          </Card>

          {/* 🎯 PENALTY TYPE CARD */}
          <Card>
            <Text style={styles.cardTitle}>Penalty Type</Text>
            <Text style={styles.cardDescription}>
              {penaltyType === 'none' && 'Gentle mode: track interruptions with no consequence.'}
              {penaltyType === 'warning' && 'Friendly accountability: confirm before pausing or stopping.'}
              {penaltyType === 'resetTimer' && 'Hard reset: interruptions can send your timer back to start.'}
              {penaltyType === 'addTime' && 'Most popular: interruptions add real minutes to your session.'}
              {penaltyType === 'lockMode' && 'Strict lock: Pause/Stop are blocked in focus, app switching triggers a cooldown, and emergency exit requires a math challenge.'}
            </Text>
            <View style={styles.chipsContainer}>
              <Chip label="None" selected={penaltyType === 'none'} onPress={() => setPenaltyType('none')} />
              <Chip label="Warning" selected={penaltyType === 'warning'} onPress={() => setPenaltyType('warning')} />
              <Chip label="Reset Timer" selected={penaltyType === 'resetTimer'} onPress={() => setPenaltyType('resetTimer')} />
              <Chip label="Add Time" selected={penaltyType === 'addTime'} onPress={() => setPenaltyType('addTime')} />
              <Chip label="Lock Mode" selected={penaltyType === 'lockMode'} onPress={() => setPenaltyType('lockMode')} />
            </View>
            
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Guidance & Replay</Text>
            <Text style={styles.cardDescription}>Need a refresher? Re-open the guided experiences.</Text>
            <View style={styles.replayActions}>
              <Chip label="Replay Onboarding" selected={false} onPress={replayOnboarding} />
              <Chip label="Replay Home Tutorial" selected={false} onPress={replayHomeTutorial} />
            </View>
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Data Controls</Text>
            <Text style={styles.cardDescription}>
              Reset Pomodoom to a fresh start by clearing local sessions, tasks, settings, and tutorial state.
            </Text>
            <Button variant="danger" onPress={confirmClearAllData} fullWidth>
              Clear All Data
            </Button>
          </Card>

          {/* 🎯 SOUND & VIBRATION CARD */}
          <Card>
            {/* Sound Toggle */}
            <AppSwitch
              label="Sound"
              value={soundEnabled}
              onValueChange={setSoundEnabled}
            />

            {/* Divider */}
            <View style={styles.divider} />

            {/* Vibration Toggle */}
            <AppSwitch
              label="Vibration"
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
            />
          </Card>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xxl * 2, // Extra space for bottom nav
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
  },

  // 🎯 HEADER
  heading: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: spacing.xxl * 2,
    marginBottom: spacing.md,
  },
  subheading: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
  },

  // 🎯 CARD CONTAINER
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  penaltyHint: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },

  // 🎯 CHIPS (Duration Selectors)
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  replayActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    // 🔧 MATCHED: Same styling as HomeTimerScreen
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
    // 🔧 MATCHED: Same text styling as HomeTimerScreen
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    // 🔧 MATCHED: Same active text as HomeTimerScreen
    color: '#fff',
  },
  // 🎯 RADIO BUTTONS (Penalty Type)
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.md,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  // 🎯 SWITCHES (Sound & Vibration)
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.3,
  },
});