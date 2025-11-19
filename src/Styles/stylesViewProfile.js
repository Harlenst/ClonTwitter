// src/Styles/stylesViewProfile.js
import { StyleSheet } from 'react-native';
import { colors, spacing, radii, shadow } from './twitterStyles';

export default StyleSheet.create({
  // Contenedor del ScrollView
  profileContainer: {
    paddingHorizontal: spacing.lg, // ~18px
    paddingBottom: spacing.xl * 2,
  },

  // --- CABECERA DEL PERFIL (Avatar, Nombres) ---
  headerSection: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  
  // Avatar grande con sombra
  avatar: {
    backgroundColor: colors.primary,
    marginBottom: spacing.sm,
    ...shadow.fab, // Sombra para darle relieve sobre el fondo
  },

  // Nombre real (Negrita, Grande)
  fullName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800', // Extra bold como en X
    textAlign: 'center',
  },

  // Usuario @handle (Gris, más pequeño)
  username: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 2,
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  // --- BOTONES DE ACCIÓN (Seguir, Ver Tweets) ---
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm, // Espacio entre botones si hay varios
  },

  // Estilo base de botón redondeado
  actionButton: {
    borderRadius: radii.xl, // Borde muy redondeado (píldora)
    minWidth: 120,
    borderWidth: 1,
    borderColor: colors.primary,
  },

  // Texto para botón relleno (Seguir)
  btnTextContained: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 14,
  },

  // Texto para botón bordeado (Siguiendo / Ver Tweets)
  btnTextOutlined: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },

  // --- TARJETA DE INFORMACIÓN (Bio, Email) ---
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight || '#F0EBE5',
    ...shadow.none, // Estilo plano o sutil
  },
  
  infoRow: {
    marginBottom: spacing.xs,
  },
  
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  infoValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  
  descriptionText: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'normal',
    marginTop: spacing.xs,
  },

  // --- ESTADÍSTICAS (Seguidores / Siguiendo) ---
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight || '#E1E8ED',
  },
  
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  
  statCount: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  
  statLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },

  // --- BOTONES INFERIORES (Solo dueño) ---
  ownerActionsContainer: {
    marginTop: spacing.sm,
  },
  
  menuButton: {
    marginBottom: spacing.sm,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
});