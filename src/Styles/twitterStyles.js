// src/Styles/twitterStyles.js
// Tema unificado SIN negro ni azul

import { StyleSheet } from 'react-native';

export const colors = {
    // Base (sin negro ni azul)
    background: '#F6F4F0',      // beige suave
    surface:    '#FFFFFF',      // fondo de tarjetas
    border:     '#E7E2DC',      // borde cálido clarito (para divisores gruesos)
    borderLight: '#F0EBE5',     // Nuevo: Borde más claro para divisores de feed (más sutil)
    overlay:    '#EFEAE4',

    // Texto (grises, sin #000)
    textPrimary:    '#353535',
    textSecondary:  '#6B6B6B',
    textMuted:      '#9A9A9A',

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
    xs: 6, // 6px
    sm: 10, // 10px
    md: 14, // 14px (Ajustado a 16 si quieres un estándar más común)
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
    none: {}, // Sombra para desactivar el sombreado de Card en tweets
};

// Estilos base reutilizables
const twitterStyles = StyleSheet.create({
    container: {
        flex: 1,
        // Usar surface en lugar de background para la raíz, para que el fondo de las tarjetas se funda
        backgroundColor: colors.surface, 
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
    
    // ===================================================
    // ✨ BARRA DE ENCABEZADO (Header.js)
    // ===================================================
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // Reducir padding horizontal para que el avatar y botones no estén tan pegados al borde
        paddingHorizontal: spacing.md, // 14px
        paddingVertical: spacing.sm,    // 10px
        backgroundColor: colors.surface,
        // Usar un borde más fino y sutil para la separación
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.borderLight, 
        height: 50, // Altura estándar para un header moderno
    },
    // Estilos para las 3 secciones del header (necesarios para el centrado)
    headerLeft: {
        width: 40, // Ancho fijo para el avatar
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerCenter: {
        flex: 1, // Ocupa el espacio central restante
        alignItems: 'center', // Centra el contenido (título/logo)
        justifyContent: 'center',
    },
    headerRight: {
        width: 80, // Ancho fijo para 2 iconos (40px cada uno)
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    // Estilo del título central
    headerTitle: {
        color: colors.textPrimary,
        fontSize: 18, // Título un poco más grande
        fontWeight: '700',
    },
    // ===================================================
    
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