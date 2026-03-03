import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../shared/components';
import { styles } from '../screens/HomeTimerScreen.styles';

type TimerPhase = 'idle' | 'focus' | 'break' | 'longBreak';

interface TimerHeaderProps {
  currentPhase: TimerPhase;
}

export function TimerHeader({ currentPhase }: TimerHeaderProps) {
  const heading =
    currentPhase === 'focus'
      ? 'Focus Session'
      : currentPhase === 'break'
      ? 'Break Session'
      : currentPhase === 'longBreak'
      ? 'Long Break Session'
      : 'PomoTimer';

  const subhead =
    currentPhase === 'idle'
      ? 'Pick a duration, press Start Session, and stay focused.'
      : currentPhase === 'focus'
      ? 'Focus! Pausing or leaving may trigger penalties.'
      : currentPhase === 'longBreak'
      ? 'Extended reset mode. Recharge fully before your next sprint.'
      : 'Take a break and get ready for your next focus sprint.';

  return (
    <View style={styles.headerRow}>
      <Text style={styles.heading}>{heading}</Text>
      <Text style={styles.subhead}>{subhead}</Text>
    </View>
  );
}
