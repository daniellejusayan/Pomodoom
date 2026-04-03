import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicon } from '../Icon/Icon';
import { colors } from '../../../core/theme/colors';

interface Props {
  onPress: () => void;
}

export const ToDoListButton: React.FC<Props> = ({ onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.85}>
    <Ionicon name="list-outline" size={24} color="#fff" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
