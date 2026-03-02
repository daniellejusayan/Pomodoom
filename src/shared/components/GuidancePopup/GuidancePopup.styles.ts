import { StyleSheet } from 'react-native';

import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';

export default StyleSheet.create({
  content: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  stepCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  stepText: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  actions: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
});
