import React from 'react';
import { 
  SafeAreaView, 
  ScrollView,
  StyleSheet, 
  Switch, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { 
  focusDurationsMinutes, 
  breakDurationsMinutes as breakDurationMinutes,
  longBreakMinutes,
} from '../../../core/constants';

import { useSettings } from '../../../context/SettingsContext';

export default function SettingsScreen() {
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
  } = useSettings();

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

          {/* 🎯 FOCUS DURATION CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Focus Duration</Text>
            <View style={styles.chipsContainer}>
              {focusDurationsMinutes.filter((duration) => duration <= 45).map((duration) => {
                const isActive = duration === focusDuration;
                return (
                  <TouchableOpacity
                    key={duration}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setFocusDuration(duration)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {duration}m
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 🎯 BREAK DURATION CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Break Duration</Text>
            <View style={styles.chipsContainer}>
              {breakDurationMinutes.slice(0, 3).map((duration) => {
                const isActive = duration === breakDuration;
                return (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.chip, 
                      isActive && styles.chipActive
                    ]}
                    onPress={() => setBreakDuration(duration)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {duration}m
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 🎯 LONG BREAK DURATION CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Long Break Duration</Text>
            <View style={styles.chipsContainer}>
              {longBreakMinutes.map((duration) => {
                const isActive = duration === longBreakDuration;
                return (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.chip,
                      isActive && styles.chipActive
                    ]}
                    onPress={() => setLongBreakDuration(duration)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {duration}m
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 🎯 PENALTY TYPE CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Penalty Type</Text>
            
            {/* Warning Option */}
            <TouchableOpacity
              style={styles.radioRow}
              onPress={() => setPenaltyType('warning')}
            >
              <View style={styles.radioButton}>
                {penaltyType === 'warning' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Warning</Text>
            </TouchableOpacity>

            {/* Reset Timer Option */}
            <TouchableOpacity
              style={styles.radioRow}
              onPress={() => setPenaltyType('resetTimer')}
            >
              <View style={styles.radioButton}>
                {penaltyType === 'resetTimer' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Reset Timer</Text>
            </TouchableOpacity>

            {/* Add Time Option */}
            <TouchableOpacity
              style={styles.radioRow}
              onPress={() => setPenaltyType('addTime')}
            >
              <View style={styles.radioButton}>
                {penaltyType === 'addTime' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Add Time</Text>
            </TouchableOpacity>
          </View>

          {/* 🎯 SOUND & VIBRATION CARD */}
          <View style={styles.card}>
            {/* Sound Toggle */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Sound</Text>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ 
                  false: colors.border, 
                  true: colors.primary 
                }}
                thumbColor="#fff"
                ios_backgroundColor={colors.border}
              />
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Vibration Toggle */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Vibration</Text>
              <Switch
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
                trackColor={{ 
                  false: colors.border, 
                  true: colors.primary 
                }}
                thumbColor="#fff"
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>

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

  // 🎯 CHIPS (Duration Selectors)
  chipsContainer: {
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