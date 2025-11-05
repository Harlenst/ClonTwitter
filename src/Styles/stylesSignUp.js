import { StyleSheet } from 'react-native';
import { colors, radii, spacing, shadow } from './twitterStyles';

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  card: {
    ...shadow.card,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginVertical: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
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
});
