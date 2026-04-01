import React from 'react';
import { View } from 'react-native';
import { Ionicon } from '../../../shared/components/Icon/Icon';

import { focusDurationsMinutes } from '../../../core/constants';
import { colors } from '../../../core/theme/colors';
import { Card, Chip, Text } from '../../../shared/components';
import { styles } from '../screens/HomeTimerScreen.styles';

interface FocusDurationCardProps {
  focusDuration: number;
  setFocusDuration: (minutes: number) => void;
}

export function FocusDurationCard({ focusDuration, setFocusDuration }: FocusDurationCardProps) {
  return (
    <Card>
      <View style={styles.cardHeader}>
        <Ionicon name="timer-outline" size={20} color={colors.primary} />
        <Text style={styles.sectionTitle}>Focus Duration</Text>
      </View>
      <Text style={styles.sectionDescription}>Choose how long to stay locked in for this session.</Text>
      <View style={styles.chipsContainer}>
        {focusDurationsMinutes.map((item) => (
          <Chip
            key={item}
            label={`${item}m`}
            selected={item === focusDuration}
            onPress={() => setFocusDuration(item)}
          />
        ))}
      </View>
    </Card>
  );
}
