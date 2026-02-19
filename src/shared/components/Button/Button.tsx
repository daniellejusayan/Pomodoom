import React from 'react';
import { ActivityIndicator, Pressable, Text as RNText, View } from 'react-native';
import styles from './Button.styles';
import type { ButtonProps } from './Button.types';

/**
 * Button - shared presentational button component
 * Supports variants, sizes, loading and disabled states.
 */
const Button = ({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  accessibilityLabel,
}: ButtonProps) => {
  const containerStyles = [
    styles.container,
    styles[size],
    styles[variant],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
  ];

  const textStyle = variant === 'secondary' || variant === 'outline' ? styles.contentTextSecondary : styles.contentText;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        ...containerStyles,
        pressed && { opacity: 0.85 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textStyle.color || '#fff'} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon && iconPosition === 'left' ? <View style={styles.iconLeft}>{icon}</View> : null}
          <RNText style={textStyle as any}>{children as any}</RNText>
          {icon && iconPosition === 'right' ? <View style={styles.iconRight}>{icon}</View> : null}
        </View>
      )}
    </Pressable>
  );
};

export default Button;
