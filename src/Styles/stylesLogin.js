// src/Styles/stylesLogin.js
import { StyleSheet } from 'react-native';
import { colors } from './twitterStyles';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    justifyContent: 'center',
  },
  logoX: {
    fontSize: 64,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '900',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    marginVertical: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    marginTop: 16,
  },
  link: {
    marginTop: 12,
  },
});