import { StyleSheet } from 'react-native';
import { colors } from '../../../core/theme/colors';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  labelBlock: { flex: 1, paddingRight: 12 },
  label: { fontSize: 16, fontWeight: '500', color: colors.textPrimary },
  description: { fontSize: 13, color: colors.textSecondary },
});
