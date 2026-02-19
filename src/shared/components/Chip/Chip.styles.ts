import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  base: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  small: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  medium: { paddingVertical: 6, paddingHorizontal: 12 },
  selected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  selectedText: { color: '#FFFFFF' },
  unselectedText: { color: '#111827' },
  disabled: { opacity: 0.6 },
  icon: { marginRight: 8 },
});
