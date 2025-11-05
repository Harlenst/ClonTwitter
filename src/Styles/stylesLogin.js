import { StyleSheet } from 'react-native';
import { colors, radii, spacing, shadow } from './twitterStyles';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    ...shadow.card,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.inputBg,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    marginTop: spacing.md,
  },
  link: {
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
