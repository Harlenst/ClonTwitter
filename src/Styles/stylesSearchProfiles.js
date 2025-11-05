import { StyleSheet } from 'react-native';
import { colors, spacing, radii, shadow } from './twitterStyles';

export default StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  searchbar: {
    backgroundColor: colors.inputBg,
    borderRadius: radii.xl,
  },
  searchInput: {
    color: colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  resultItem: {
    ...shadow.card,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
  },
  resultName: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  resultHandle: {
    color: colors.textSecondary,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  resultsList: {
    backgroundColor: colors.background,
  },
});
