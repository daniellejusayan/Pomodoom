import { StyleSheet } from 'react-native';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';

export const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
    width: '100%',
  },
  
  // 🎯 HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  spacer: {
    flex: 1,
  },
  addButton: {
    width: 36,
    height: 36,
    backgroundColor: colors.primary,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },

  // 🎯 TASK LIST
  list: {
    maxHeight: '94%',
    paddingBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  itemRowAlt: {
    backgroundColor: 'rgba(0,0,0,0.035)',
  },
  itemRowActive: {
    backgroundColor: 'rgba(107,180,232,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(107,180,232,0.28)',
  },
  itemRowDragging: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  separator: {
    height: 1,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.border,
    opacity: 0.7,
  },
  dragHandle: {
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webReorderButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 2,
  },
  activeAccentBar: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  activeTaskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  activeTaskLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.primary,
  },
  itemTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  checkbox: {
    padding: spacing.xs,
  },
  itemText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
    opacity: 0.6,
  },
  selectButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonActive: {
    backgroundColor: 'rgba(107,180,232,0.1)',
    borderRadius: 14,
  },
  deleteButton: {
    padding: spacing.xs,
  },

  // 🎯 EMPTY STATE
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    paddingBottom: spacing.xxl , // 🔧 ADDED: Extra bottom padding for empty state
    gap: spacing.sm,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing.lg, // 🔧 ADDED: Bottom padding when list is empty
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    opacity: 0.7,
  },

  // 🎯 MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    shadowColor: colors.shadow,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 30,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: colors.surface,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  modalCancelText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalAddButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  modalAddButtonDisabled: {
    backgroundColor: colors.border,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 0,
  },
  modalAddText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});