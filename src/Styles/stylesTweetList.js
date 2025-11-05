import { StyleSheet } from 'react-native';
import { colors, spacing, radii, shadow } from './twitterStyles';

export default StyleSheet.create({
  tweetCard: {
    ...shadow.card,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  tweetContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    backgroundColor: colors.primary,
    marginRight: spacing.md,
  },
  tweetBody: {
    flex: 1,
  },
  authorName: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  authorHandle: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  tweetText: {
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  tweetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionCount: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  followButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  followButtonText: {
    color: colors.surface,
    fontWeight: '700',
  },
});
