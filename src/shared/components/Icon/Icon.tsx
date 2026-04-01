import React from 'react';
import { Platform, Text, TextStyle } from 'react-native';
import { Ionicons as ExpoIonicons } from '@expo/vector-icons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: TextStyle;
}

const fallbackGlyph: Record<string, string> = {
  'stats-chart': '📊',
  'stats-chart-outline': '📊',
  timer: '⏱️',
  'timer-outline': '⏱️',
  settings: '⚙️',
  'settings-outline': '⚙️',
  stop: '⏹️',
  pause: '⏸️',
  play: '▶️',
  add: '+',
  close: '✕',
  'checkmark-circle-outline': '✔️',
  'cafe': '☕',
  'arrow-back': '←',
  'list-outline': '☑️',
  'checkmark-circle': '✔️',
};

export const Ionicon = ({ name, size = 24, color = '#000', style }: IconProps) => {
  if (Platform.OS === 'web') {
    const glyph = fallbackGlyph[name] || '•';
    return (
      <Text style={[{ fontSize: size, color, textAlign: 'center' }, style]}>
        {glyph}
      </Text>
    );
  }

  return <ExpoIonicons name={name as any} size={size} color={color} style={style as any} />;
};

export default Ionicon;
