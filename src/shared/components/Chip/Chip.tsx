import React from 'react';
import { Pressable, View } from 'react-native';
import styles from './Chip.styles';
import type { ChipProps } from './Chip.types';
import { Text } from '../Text';

/**
 * Chip - selectable small UI token used for choices
 */
const Chip = ({ label, selected, onPress, icon, disabled = false, size = 'medium', accessibilityLabel }: ChipProps) => {
  const sizeStyle = size === 'small' ? styles.small : styles.medium;
  const selectedStyle = selected ? styles.selected : undefined;

  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityLabel={accessibilityLabel} style={({ pressed }) => [
      styles.base,
      sizeStyle,
      selectedStyle,
      disabled && styles.disabled,
      pressed && { opacity: 0.85 },
    ]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text variant="label" color={selected ? '#FFFFFF' : '#111827'}>{label}</Text>
    </Pressable>
  );
};

export default Chip;
