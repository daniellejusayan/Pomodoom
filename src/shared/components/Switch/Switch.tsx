import React from 'react';
import { View, Switch as RNSwitch } from 'react-native';
import styles from './Switch.styles';
import type { SwitchProps } from './Switch.types';
import { Text } from '../Text';

const Switch = ({ label, description, value, onValueChange, disabled = false, accessibilityLabel }: SwitchProps) => (
  <View style={styles.container}>
    <View style={styles.labelBlock}>
      {label ? <Text variant="body">{label}</Text> : null}
      {description ? <Text variant="caption" color="#6B7280">{description}</Text> : null}
    </View>
    <RNSwitch value={value} onValueChange={onValueChange} disabled={disabled} accessibilityLabel={accessibilityLabel} />
  </View>
);

export default Switch;
