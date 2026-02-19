import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { focusDurationsMinutes } from '../../../core/constants';

export default function SettingsScreen() {
  const [focusMinutes, setFocusMinutes] = useState<number>(focusDurationsMinutes[2]);
  const [breakMinutes, setBreakMinutes] = useState<number>(5);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Durations</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Focus length</Text>
          <View style={styles.chipRow}>
            {focusDurationsMinutes.map((d) => {
              const active = d === focusMinutes;
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setFocusMinutes(d)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{d}m</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Break length</Text>
          <View style={styles.chipRow}>
            {[5, 10, 15].map((d) => {
              const active = d === breakMinutes;
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setBreakMinutes(d)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{d}m</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Feedback</Text>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Sound</Text>
            <Text style={styles.description}>Play gentle tone when session ends.</Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={soundEnabled ? '#fff' : '#e5e7eb'}
          />
        </View>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Vibration</Text>
            <Text style={styles.description}>Short buzz when focus completes.</Text>
          </View>
          <Switch
            value={vibrationEnabled}
            onValueChange={setVibrationEnabled}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={vibrationEnabled ? '#fff' : '#e5e7eb'}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 8,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    gap: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
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
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
