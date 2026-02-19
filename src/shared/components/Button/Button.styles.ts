import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: { width: '100%' },
  small: { paddingVertical: 8, paddingHorizontal: 12 },
  medium: { paddingVertical: 12, paddingHorizontal: 16 },
  large: { paddingVertical: 16, paddingHorizontal: 20 },
  primary: { backgroundColor: '#2563EB' },
  secondary: { backgroundColor: '#F3F4F6' },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#D1D5DB' },
  text: { backgroundColor: 'transparent' },
  danger: { backgroundColor: '#DC2626' },
  disabled: { opacity: 0.6 },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
  contentText: { color: '#FFFFFF', fontSize: 16 },
  contentTextSecondary: { color: '#111827' },
});
