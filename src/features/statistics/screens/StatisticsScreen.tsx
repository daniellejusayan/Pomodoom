import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';

const weeklyData = [
  { day: 'Mon', sessions: 3 },
  { day: 'Tue', sessions: 4 },
  { day: 'Wed', sessions: 2 },
  { day: 'Thu', sessions: 5 },
  { day: 'Fri', sessions: 3 },
  { day: 'Sat', sessions: 2 },
  { day: 'Sun', sessions: 1 },
];

const dailyTotals = [
  { label: 'This week', value: 18 },
  { label: 'Total sessions', value: 142 },
];

export default function StatisticsScreen() {
  const maxSessions = Math.max(...weeklyData.map((d) => d.sessions), 1);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Statistics</Text>
      <Text style={styles.subhead}>Weekly focus sessions</Text>

      <View style={styles.card}>
        <FlatList
          data={weeklyData}
          keyExtractor={(item) => item.day}
          horizontal
          contentContainerStyle={{ gap: spacing.md, alignItems: 'flex-end' }}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const height = (item.sessions / maxSessions) * 160 + 20;
            return (
              <View style={styles.barItem}>
                <View style={[styles.bar, { height }]} />
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            );
          }}
        />
      </View>

      <View style={styles.metricsRow}>
        {dailyTotals.map((metric) => (
          <View key={metric.label} style={styles.metricCard}>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </View>
        ))}
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
  subhead: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 8,
  },
  barItem: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 40,
  },
  bar: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 6,
  },
  barLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 6,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
