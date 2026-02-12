import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';

import { focusDurationsMinutes, defaultFocusMinutes } from '../../../core/constants';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { ROUTES } from '../../../navigation/routes';
import { TimerStackParamList } from '../../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<TimerStackParamList, typeof ROUTES.TIMER.HOME>;

export default function HomeTimerScreen() {
  const navigation = useNavigation<Nav>();
  const [selectedDuration, setSelectedDuration] = useState<number>(defaultFocusMinutes);

  const timerMessage = useMemo(() => `${selectedDuration} min focus`, [selectedDuration]);

  const handleComplete = () => {
    navigation.navigate(ROUTES.TIMER.SESSION_COMPLETE, { sessionId: 'demo' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Focus Timer</Text>
        <Text style={styles.subhead}>Pick an interval and start</Text>
      </View>

      <View style={styles.timerCard}>
        <View style={styles.timerCircleOuter}>
          <View style={styles.timerCircleInner}>
            <Text style={styles.timerValue}>{selectedDuration}</Text>
            <Text style={styles.timerLabel}>minutes</Text>
          </View>
        </View>
        <Text style={styles.timerMessage}>{timerMessage}</Text>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Start focus</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleComplete}>
          <Text style={styles.secondaryButtonText}>Mark complete</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Preset intervals</Text>
        <FlatList
          horizontal
          data={focusDurationsMinutes}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={{ gap: spacing.sm }}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = item === selectedDuration;
            return (
              <TouchableOpacity
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setSelectedDuration(item)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{item}m</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.xl,
  },
  headerRow: {
    gap: spacing.xs,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  subhead: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  timerCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 10,
  },
  timerCircleOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1224',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 6,
  },
  timerCircleInner: {
    width: 170,
    height: 170,
    borderRadius: 85,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  timerValue: {
    color: colors.textPrimary,
    fontSize: 54,
    fontWeight: '800',
  },
  timerLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  timerMessage: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.sm,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 6,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
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
});
