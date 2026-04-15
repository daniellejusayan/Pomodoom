import { StyleSheet } from 'react-native';
import { colors } from '../../../core/theme/colors';

export default StyleSheet.create({
  container: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: { width: '100%' },
  small: { paddingVertical: 8, paddingHorizontal: 12 },
  medium: { paddingVertical: 12, paddingHorizontal: 16 },
  large: { paddingVertical: 16, paddingHorizontal: 20 },
  primary: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: { backgroundColor: 'transparent' },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  disabled: { opacity: 0.6 },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
  contentText: { color: colors.primaryDark, fontSize: 16, fontWeight: '700' },
  contentTextDanger: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  contentTextSecondary: { color: colors.textPrimary, fontWeight: '600' },
});
