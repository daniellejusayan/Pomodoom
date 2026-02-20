import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import Chip from '../Chip/Chip';
import { spacing } from '../../../core/theme/spacing';
import { Text } from '../Text';

interface Props {
  label?: string;
  options: number[];
  value: number;
  onChange: (minutes: number) => void;
}

const DurationSelector = ({ label, options, value, onChange }: Props) => {
  return (
    <View style={styles.container}>
      {label ? <Text variant="label">{label}</Text> : null}
      <FlatList
        horizontal
        data={options}
        keyExtractor={(i) => i.toString()}
        contentContainerStyle={styles.list}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Chip
            label={`${item}m`}
            selected={item === value}
            onPress={() => onChange(item)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
});

export default DurationSelector;
