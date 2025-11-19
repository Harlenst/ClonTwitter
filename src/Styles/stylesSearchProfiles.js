import { StyleSheet } from 'react-native';
import { colors, spacing, radii } from './twitterStyles';

export default StyleSheet.create({
    // Contenedor principal de la barra de búsqueda para imitar el diseño de la app
    header: {
        paddingHorizontal: spacing.sm, // 10px de margen lateral
        paddingVertical: spacing.sm,   // 10px de margen vertical
        backgroundColor: colors.surface,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.borderLight || '#F0EBE5', // Borde sutil
    },
    
    // Estilo de la barra de búsqueda (Searchbar de react-native-paper)
    searchbar: {
        backgroundColor: colors.overlay, // Fondo claro para diferenciar del surface
        borderRadius: radii.lg,         // Bordes redondeados
        height: 48,                     // Altura cómoda
        elevation: 0,                   // Eliminar la sombra de la Searchbar
    },
    
    // Estilo del texto de entrada dentro de la barra de búsqueda
    searchInput: {
        fontSize: 16,
        color: colors.textPrimary,
        paddingLeft: spacing.sm, // Ajuste para que el texto no esté pegado
    },

    // Contenedor de la lista de resultados
    resultsList: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    
    // Estilo de cada elemento de la lista (List.Item)
    resultItem: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs, // Menos padding vertical
        backgroundColor: colors.surface,
        // Separador fino entre resultados
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.borderLight || '#F0EBE5',
    },

    // Estilo del nombre completo
    resultName: {
        color: colors.textPrimary,
        fontWeight: '700',
        fontSize: 16,
    },

    // Estilo del handle (@username)
    resultHandle: {
        color: colors.textSecondary,
        fontSize: 14,
    },

    // Estilo del Avatar (para Avatar.Text)
    avatar: {
        // Usamos el color primario de tu tema cálido (violeta) para el fondo
        backgroundColor: colors.primary, 
        marginRight: spacing.sm,
    },

    // --- Estilos de Botón de Acción (Seguir/Siguiendo) ---
    followButtonTextContained: {
        color: colors.surface, // Texto del botón 'Seguir' (contained)
        fontWeight: '700',
        fontSize: 13,
    },
    followButtonTextOutlined: {
        color: colors.primary, // Texto del botón 'Siguiendo' (outlined)
        fontWeight: '700',
        fontSize: 13,
    },
    
    // Contenedor de Carga
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Contenedor de Vacío
    emptyContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: spacing.lg * 2,
    },
    emptyText: {
        color: colors.textMuted,
        fontSize: 16,
        textAlign: 'center',
    },
});