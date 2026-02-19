import React from 'react';
import { Text as RNText } from 'react-native';
import styles from './Text.styles';
import type { TextProps } from './Text.types';

/**
 * Shared Text component that maps typography variants to styles.
 */
const Text = ({
  children,
  variant = 'body',
  color,
  weight,
  align = 'left',
  numberOfLines,
  accessibilityLabel,
}: TextProps) => {
  const variantStyle = styles[variant] || styles.body;

  const style: any = [variantStyle, { textAlign: align }];
  if (color) style.push({ color });
  if (weight) style.push({ fontWeight: weight === 'bold' ? '700' : weight === 'medium' ? '500' : '400' });

  return (
    <RNText accessibilityLabel={accessibilityLabel} numberOfLines={numberOfLines} style={style}>
      {children as any}
    </RNText>
  );
};

export default Text;
