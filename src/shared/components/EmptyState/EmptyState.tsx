import React from 'react';
import { View, Image } from 'react-native';
import styles from './EmptyState.styles';
import type { EmptyStateProps } from './EmptyState.types';
import { Text } from '../Text';
import { Button } from '../Button';

const EmptyState = ({ image, title, description, actionLabel, onAction }: EmptyStateProps) => (
  <View style={styles.container}>
    {image ? <Image source={image} style={styles.image} /> : null}
    <View style={{ alignItems: 'center' }}>
      <Text variant="h3">{title}</Text>
    </View>
    <Text variant="body" color="#6B7280">{description}</Text>
    {actionLabel && onAction ? (
      <View style={{ marginTop: 12 }}>
        <Button onPress={onAction} variant="primary">{actionLabel}</Button>
      </View>
    ) : null}
  </View>
);

export default EmptyState;
