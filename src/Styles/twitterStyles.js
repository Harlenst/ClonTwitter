// src/Styles/twitterStyles.js
// Tema unificado SIN negro ni azul

import { StyleSheet } from 'react-native';

export const colors = {
  // Base (sin negro ni azul)
  background: '#F6F4F0',     // beige suave
  surface:    '#FFFFFF',     // fondo de tarjetas
  border:     '#E7E2DC',     // borde cálido clarito
  overlay:    '#EFEAE4',

  // Texto (grises, sin #000)
  textPrimary:   '#353535',
  textSecondary: '#6B6B6B',
  textMuted:     '#9A9A9A',

  // Marca (evitamos azules)
  primary:        '#7C3AED', // violeta
  primaryAccent:  '#6D28D9',
  secondary:      '#F59E0B', // ámbar
  secondarySoft:  '#FDE68A',

  // Estados
  success: '#16A34A',
  warning: '#F59E0B',
  error:   '#DC2626',

  // UI
  chip:       '#F1E8FF',
  inputBg:    '#FAFAFA',
  placeholder:'#9A9A9A',
};

export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
};

export const shadow = {
  card: {
    shadowColor: '#3F3F3F',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  fab: {
    shadowColor: '#3F3F3F',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
};

// Estilos base reutilizables
const twitterStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadow.card,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  pill: {
    backgroundColor: colors.chip,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.xl,
  },
  pillText: {
    color: colors.primary,
    fontWeight: '700',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonOutlined: {
    borderColor: colors.primary,
  },
  textPrimary: {
    color: colors.textPrimary,
  },
  textSecondary: {
    color: colors.textSecondary,
  },
});

export default twitterStyles;
