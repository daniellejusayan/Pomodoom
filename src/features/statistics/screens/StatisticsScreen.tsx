import React from 'react';
import { 
  SafeAreaView, 
  ScrollView,
  StyleSheet, 
  Text, 
  View,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';

// 🎯 Sample data - Replace with real data from context/storage
const statsCards = [
  { label: 'Total Sessions', value: '42' },
  { label: "Today's Focus", value: '1h 30m' },
  { label: 'Weekly Average', value: '2h 10m' },
];

const weeklyData = [
  { day: 'Mon', hours: 2, label: '2h' },
  { day: 'Tue', hours: 1.5, label: '1.5h' },
  { day: 'Wed', hours: 1.3, label: '1.3h' },
  { day: 'Thu', hours: 2, label: '2h' },
  { day: 'Fri', hours: 1, label: '1h' },
  { day: 'Sat', hours: 1.5, label: '1.5h' },
  { day: 'Sun', hours: 2, label: '2h' },
];

// 🎯 Mock data for daily sessions trend (last 30 days)
const dailySessionsData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  sessions: Math.floor(Math.random() * 3) + 2, // Random 2-5 sessions
}));

const { width } = Dimensions.get('window');

export default function StatisticsScreen() {
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
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Focus Time</Text>
            
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
          </View>

          {/* 🎯 DAILY SESSIONS LINE CHART */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Daily Sessions</Text>
            
            {/* Line Chart Container */}
            <View style={styles.lineChartContainer}>
              {/* Y-axis */}
              <View style={styles.lineYAxis}>
                
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