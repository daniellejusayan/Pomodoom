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
  style: incomingStyle,
  ...rest
}: TextProps) => {
  const variantStyle = styles[variant] || styles.body;

  const mergedStyle: any = [variantStyle, { textAlign: align }];
  if (color) mergedStyle.push({ color });
  if (weight) mergedStyle.push({ fontWeight: weight === 'bold' ? '700' : weight === 'medium' ? '500' : '400' });
  if (incomingStyle) mergedStyle.push(incomingStyle);

  return (
    <RNText accessibilityLabel={accessibilityLabel} numberOfLines={numberOfLines} style={mergedStyle} {...rest}>
      {children as any}
    </RNText>
  );
};

export default Text;
