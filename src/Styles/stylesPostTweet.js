// src/Styles/stylesPostTweet.js
import { StyleSheet } from 'react-native';
import { colors, spacing, radii } from './twitterStyles';

export default StyleSheet.create({
  // Lienzo principal (Blanco/Surface)
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  
  // Contenedor del contenido (permite scroll)
  contentContainer: {
    padding: spacing.md,
    paddingBottom: 100, // Espacio extra al final
  },

  // Fila superior: Avatar + Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  // Avatar pequeño a la izquierda
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
    backgroundColor: '#E1E8ED', // Gris suave placeholder
  },

  // El campo de texto invisible (sin bordes, nativo)
  textInput: {
    flex: 1,
    fontSize: 18,
    color: colors.textPrimary,
    textAlignVertical: 'top', // Importante para Android
    minHeight: 120, // Altura inicial mínima
    paddingTop: 8, // Alineado visualmente con el avatar
    paddingRight: spacing.sm,
  },

  // --- PREVISUALIZACIÓN DE IMAGEN ---
  imagePreviewContainer: {
    marginTop: spacing.md,
    marginLeft: 48, // Indentado para alinearse con el texto (saltando avatar)
    marginRight: spacing.md,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 16, // Bordes redondeados modernos
    backgroundColor: '#F5F8FA',
    resizeMode: 'cover',
  },
  // Botón X para borrar imagen
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // --- BARRA DE HERRAMIENTAS INFERIOR ---
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight || '#E1E8ED',
    backgroundColor: colors.surface,
  },
  
  // Botón de icono (Galería)
  iconButton: {
    padding: 8,
  },
  iconImage: {
    width: 24,
    height: 24,
    tintColor: colors.primary, // Tu color violeta
  },

  // Contador de caracteres
  charCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  charCountWarning: {
    color: colors.error,
    fontWeight: 'bold',
  },

  // --- ESTILOS DEL BOTÓN PUBLICAR (HEADER) ---
  headerPostButton: {
    backgroundColor: colors.primary, // Violeta
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20, // Redondo tipo píldora
  },
  headerPostText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  headerPostDisabled: {
    opacity: 0.5,
  },
});