import { StyleSheet } from 'react-native';
import { colors, spacing, radii, shadow } from './twitterStyles';

export default StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    flexGrow: 1,
  },
  card: {
    ...shadow.card,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  textInput: {
    backgroundColor: colors.inputBg,
    color: colors.textPrimary,
    borderRadius: radii.md,
    padding: spacing.md,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  charCount: {
    color: colors.textSecondary,
  },
  charCountWarning: {
    color: colors.warning,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
  },
});
