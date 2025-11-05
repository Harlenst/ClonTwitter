import { StyleSheet } from 'react-native';
import { colors, spacing, radii, shadow } from './twitterStyles';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  userCard: {
    ...shadow.card,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: colors.primary,
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  fullName: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  username: {
    color: colors.textSecondary,
  },
  followButton: {
    borderColor: colors.primary,
  },
  followingText: {
    color: colors.primary,
    fontWeight: '600',
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
