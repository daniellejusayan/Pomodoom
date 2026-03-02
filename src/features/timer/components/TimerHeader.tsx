import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../shared/components';
import { styles } from '../screens/HomeTimerScreen.styles';

type TimerPhase = 'idle' | 'focus' | 'break';

interface TimerHeaderProps {
  currentPhase: TimerPhase;
}

export function TimerHeader({ currentPhase }: TimerHeaderProps) {
  return (
    <View style={styles.headerRow}>
      <Text style={styles.heading}>
        {currentPhase === 'focus' ? 'Focus Mode' : currentPhase === 'break' ? 'Break Time' : 'Ready to Focus?'}
      </Text>
      <Text style={styles.subhead}>{currentPhase === 'idle' ? 'Pick your intervals and start' : ''}</Text>
    </View>
  );
}
