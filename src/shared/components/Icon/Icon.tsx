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
  checkbox: '☑️',
  'square-outline': '☐',
  'trash-outline': '🗑️',
  'reorder-two-outline': '⠿',
  bookmark: '🔖',
  'bookmark-outline': '🔖',
  'chevron-forward': '›',
  checkmark: '✓',
  'chevron-up-outline': '˄',
  'chevron-down-outline': '˅',
  star: '★',
  'star-outline': '☆',
  'moon': '🌙',
  'moon-outline': '🌙',
  alert: '⚠️',
  'alert-circle': '⚠️',
  warning: '❗',
  'refresh-circle': '🔄',
  time: '⏱️',
  'lock-closed': '🔒',
  'information-circle': 'ℹ️',
};

export const Ionicon = ({ name, size = 24, color = '#000', style }: IconProps) => {
  if (Platform.OS === 'web') {
    const glyph = fallbackGlyph[name] || '•';
    const webSize = Math.max(size, 14);
    return (
      <Text style={[{ fontSize: webSize, color, textAlign: 'center', lineHeight: webSize }, style]}>
        {glyph}
      </Text>
    );
  }

  return <ExpoIonicons name={name as any} size={size} color={color} style={style as any} />;
};

export default Ionicon;
