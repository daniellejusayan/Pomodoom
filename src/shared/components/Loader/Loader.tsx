import React from 'react';
import { View, ActivityIndicator, Text as RNText } from 'react-native';
import styles from './Loader.styles';
import type { LoaderProps } from './Loader.types';

const Loader = ({ size = 'large', color = '#2563EB', text, accessibilityLabel, style }: LoaderProps) => (
  <View style={[styles.container, style]} accessibilityLabel={accessibilityLabel}>
    <ActivityIndicator size={size as any} color={color} />
    {text ? <RNText style={styles.text}>{text}</RNText> : null}
  </View>
);

export default Loader;
