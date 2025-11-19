// src/Styles/stylesTweetDetail.js
import { StyleSheet } from 'react-native';
import { colors, spacing, radii } from './twitterStyles';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface, // Fondo blanco/papel (no negro)
  },
  contentContainer: {
    paddingHorizontal: spacing.lg, // 18px
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },

  // --- SECCIÓN DEL AUTOR (Top) ---
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.sm,
    backgroundColor: colors.border, // Placeholder background
  },
  authorInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  authorName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  authorHandle: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 2,
  },

  // --- TEXTO DEL TWEET ---
  tweetText: {
    color: colors.textPrimary,
    fontSize: 20, // Texto grande en detalle
    lineHeight: 28,
    fontWeight: '400',
    marginBottom: spacing.md,
  },

  // --- METADATOS (Fecha/Hora) ---
  timestampContainer: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight || '#E1E8ED',
  },
  timestampText: {
    color: colors.textSecondary,
    fontSize: 15,
  },

  // --- ESTADÍSTICAS (Contadores) ---
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight || '#E1E8ED',
    marginBottom: spacing.sm,
  },
  statItem: {
    marginRight: spacing.lg,
    flexDirection: 'row',
  },
  statNumber: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 15,
    marginLeft: 4,
  },

  // --- BARRA DE ACCIONES (Iconos grandes) ---
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribución uniforme
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  actionButton: {
    padding: spacing.xs,
  },
  actionIcon: {
    width: 24, // Iconos más grandes en detalle
    height: 24,
    tintColor: colors.textSecondary,
  },
});