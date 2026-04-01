import React, { useEffect, useMemo, useState } from 'react';
import { 
  SafeAreaView, 
  ScrollView,
  StyleSheet, 
  View,
  Dimensions,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { useSettings } from '../../../context/SettingsContext';
import { useSession } from '../../../context/SessionContext';
import { Card, GuidancePopup, Text } from '../../../shared/components';
import { getStatisticsGuideDismissedFlag, setStatisticsGuideDismissedFlag } from '../../../services/storage';

const { width } = Dimensions.get('window');

export default function StatisticsScreen() {
  const [showStatsGuide, setShowStatsGuide] = useState(false);
  const { history } = useSession();

  const {
    breakCycleCount,
    longBreaksCompleted,
    focusDuration,
    totalSessions,
    totalInterruptions,
  } = useSettings();

  const sessionsByDate = useMemo(() => {
    return history.reduce<Record<string, { sessions:number; seconds:number }>>((acc, session) => {
      if (!session.end) return acc;
      const dateKey = new Date(session.end).toISOString().split('T')[0];
      const duration = session.duration ?? Math.max(0, Math.round((session.end - session.start) / 1000));
      const entry = acc[dateKey] ?? { sessions: 0, seconds: 0 };
      return {
        ...acc,
        [dateKey]: {
          sessions: entry.sessions + 1,
          seconds: entry.seconds + duration,
        },
      };
    }, {});
  }, [history]);

  const weeklyData = useMemo(() => {
    const today = new Date();
    const data = [] as Array<{ day: string; hours: number; label: string }>;

    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const seconds = sessionsByDate[key]?.seconds ?? 0;
      const hours = Number((seconds / 3600).toFixed(2));
      data.push({ day: dayLabel, hours, label: `${hours.toFixed(1)}h` });
    }

    return data;
  }, [sessionsByDate]);

  const dailySessionsData = useMemo(() => {
    const today = new Date();
    const data = [] as Array<{ day:number; sessions:number }>;

    for (let i = 29; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      data.push({ day: Number(key.split('-')[2]), sessions: sessionsByDate[key]?.sessions ?? 0 });
    }

    return data;
  }, [sessionsByDate]);

  useEffect(() => {
    const loadStatsGuideState = async () => {
      const isDismissed = await getStatisticsGuideDismissedFlag();
      setShowStatsGuide(!isDismissed);
    };

    loadStatsGuideState();
  }, []);

  const dismissStatsGuide = async () => {
    setShowStatsGuide(false);
    await setStatisticsGuideDismissedFlag(true);
  };

  const statsGuideSteps = [
    'If interruptions rise, tighten your penalty settings.',
    'If sessions drop, reduce focus duration to rebuild consistency.',
    'Aim for stable weekly focus trend, not perfect days.',
  ];

  // build stats cards dynamically
  const statsCards = [
    { label: 'Successful Focus Sessions', value: String(totalSessions) },
    { label: 'Long Breaks Taken', value: String(longBreaksCompleted) },
    { label: 'Total Interruptions', value: String(totalInterruptions) },
  ];

  // Calculate max hours for bar chart scaling
  const maxHours = Math.max(...weeklyData.map((d) => d.hours), 1);

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
          <Text style={styles.heading}>Statistics</Text>
          <Pressable onPress={() => setShowStatsGuide(true)} style={styles.guideTrigger}>
            <Text style={styles.guideTriggerText}>Show me how to read these stats</Text>
          </Pressable>

          {/* 🎯 STATS CARDS ROW */}
          <View style={styles.statsRow}>
            {statsCards.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>

          {/* 🎯 WEEKLY FOCUS TIME CHART */}
          <Card>
            <Text style={styles.cardTitle}>Weekly Focus Time</Text>
            <Text style={styles.chartHint}>Goal: keep this trend stable or rising week over week.</Text>
            
            {/* Bar Chart */}
            <View style={styles.chartContainer}>
              {/* Y-axis labels */}
              <View style={styles.yAxis}>
                <Text style={styles.yAxisLabel}>4</Text>
                <Text style={styles.yAxisLabel}>3</Text>
                <Text style={styles.yAxisLabel}>2</Text>
                <Text style={styles.yAxisLabel}>1</Text>
                <Text style={styles.yAxisLabel}>0</Text>
              </View>

              {/* Bars */}
              <View style={styles.barsContainer}>
                {weeklyData.map((item, index) => {
                  // Calculate bar height (max 120px for 4 hours)
                  const barHeight = (item.hours / 4) * 200;
                  
                  return (
                    <View key={index} style={styles.barWrapper}>
                      {/* Hour label on top of bar */}
                      <Text style={styles.barTopLabel}>{item.label}</Text>
                      
                      {/* Bar */}
                      <View style={styles.barContainer}>
                        <View 
                          style={[
                            styles.bar, 
                            { height: barHeight }
                          ]} 
                        />
                      </View>
                      
                      {/* Day label below bar */}
                      <Text style={styles.barBottomLabel}>{item.day}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </Card>

          {/* 🎯 DAILY SESSIONS LINE CHART */}
          <Card>
            <Text style={styles.cardTitle}>Daily Sessions</Text>
            <Text style={styles.chartHint}>Aim for repeatable streaks, not perfect days.</Text>
            
            {/* Line Chart Container */}
            <View style={styles.lineChartContainer}>
              {/* Y-axis */}
              <View style={styles.lineYAxis}>
                <Text style={styles.yAxisLabel}>5</Text>
                <Text style={styles.yAxisLabel}>4</Text>
                <Text style={styles.yAxisLabel}>3</Text>
                <Text style={styles.yAxisLabel}>2</Text>
                <Text style={styles.yAxisLabel}>1</Text>
                <Text style={styles.yAxisLabel}>0</Text>
              </View>

              {/* Chart Area with gradient fill */}
              <View style={styles.lineChartArea}>
                {/* Simplified line chart visualization */}
                <LinearGradient
                  colors={['rgba(74, 144, 226, 0.3)', 'rgba(74, 144, 226, 0.05)']}
                  style={styles.lineChartGradient}
                >
                  {/* Line path (simplified - use react-native-svg for real implementation) */}
                  <View style={styles.lineChartLine} />
                </LinearGradient>
              </View>
            </View>
          </Card>

        </ScrollView>

        <GuidancePopup
          visible={showStatsGuide}
          onClose={dismissStatsGuide}
          title="What To Do With These Statistics"
          description="Quick coaching for better focus decisions"
          steps={statsGuideSteps}
          footnote="You can reopen this guide any time from this screen."
        />
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
    gap: spacing.lg,
    paddingBottom: spacing.xxl * 2, // Extra space for bottom nav
  },
  
  // 🎯 HEADER
  heading: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: spacing.xxl*2,
  },

  // 🎯 STATS CARDS
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    shadowColor: colors.shadow,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  // 🎯 CARD CONTAINER
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.lg,
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
    marginBottom: spacing.md,
  },
  guideTrigger: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  guideTriggerText: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
  chartHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  // 🎯 BAR CHART
  chartContainer: {
    flexDirection: 'row',
    height: 240,
  },
  yAxis: {
    width: 24,
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginRight: spacing.xs,
  },
  yAxisLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTopLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  barContainer: {
    flex: 1,
    width: '70%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: colors.primary,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 8, // Minimum visible height
  },
  barBottomLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },

  // 🎯 LINE CHART
  lineChartContainer: {
    flexDirection: 'row',
    height: 180,
  },
  lineYAxis: {
    width: 24,
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginRight: spacing.xs,
  },
  lineChartArea: {
    flex: 1,
    position: 'relative',
  },
  lineChartGradient: {
    flex: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  lineChartLine: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary,
    // This is simplified - use react-native-svg for actual curved line
  },
});