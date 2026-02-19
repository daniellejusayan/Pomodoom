import React from 'react';
import { View, Pressable } from 'react-native';
import styles from './Card.styles';
import type { CardProps } from './Card.types';
import { Text } from '../Text';

/**
 * Card - presentational container with optional header/footer and padding variants
 */
const Card = ({
  children,
  title,
  subtitle,
  footer,
  padding = 'medium',
  elevation = 2,
  onPress,
  accessibilityLabel,
}: CardProps) => {
  const paddingStyle =
    padding === 'none'
      ? styles.paddingNone
      : padding === 'small'
      ? styles.paddingSmall
      : padding === 'large'
      ? styles.paddingLarge
      : styles.paddingMedium;

  const Container: any = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={[styles.container, { elevation }]}
    >
      <View style={paddingStyle}>
        {title || subtitle ? (
          <View style={styles.header}>
            {title ? <Text variant="h3">{title}</Text> : null}
            {subtitle ? <Text variant="caption" color="#6B7280">{subtitle}</Text> : null}
          </View>
        ) : null}

        <View style={styles.body}>{children}</View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </Container>
  );
};

export default Card;
