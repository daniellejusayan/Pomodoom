import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ROUTES } from '../../../navigation/routes';
import { RootStackParamList } from '../../../navigation/types';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.ROOT.ONBOARDING> & {
  onComplete: () => void;
};

export default function OnboardingScreen({ navigation, onComplete }: Props) {
  const handleContinue = async () => {
    await onComplete();
    navigation.replace(ROUTES.ROOT.APP, {
      screen: ROUTES.TABS.TIMER,
      params: { screen: ROUTES.TIMER.HOME },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>Focus made playful</Text>
        <Text style={styles.title}>Welcome to Pomodoom</Text>
        <Text style={styles.subtitle}>
          Short sprints, clear stats, and a friendly finish after every session.
        </Text>
      </View>

      <View style={styles.bullets}>
        <Text style={styles.bullet}>• Floating cards & soft shadows</Text>
        <Text style={styles.bullet}>• Circular timer with preset intervals</Text>
        <Text style={styles.bullet}>• Stats you can glance at quickly</Text>
      </View>

      <TouchableOpacity style={styles.cta} onPress={handleContinue}>
        <Text style={styles.ctaText}>Get started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.xl,
  },
  heroCard: {
    backgroundColor: colors.card,
    padding: spacing.xl,
    borderRadius: 20,
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 8,
  },
  kicker: {
    color: colors.accent,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  bullets: {
    gap: spacing.sm,
  },
  bullet: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  cta: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 10,
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
