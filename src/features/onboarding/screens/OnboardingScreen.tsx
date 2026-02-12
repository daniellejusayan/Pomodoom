import React from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ROUTES } from '../../../navigation/routes';
import { RootStackParamList } from '../../../navigation/types';

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
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Pomodoom</Text>
        <Text style={styles.subtitle}>
          Focus in short sprints, track your progress, and celebrate completed sessions.
        </Text>
      </View>
      <Button title="Get started" onPress={handleContinue} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#3a3a3a',
  },
});
