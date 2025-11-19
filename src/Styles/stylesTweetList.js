// ./Styles/TweetListStyles.js
import { StyleSheet } from 'react-native';
import { colors, spacing, radii, shadow } from './twitterStyles';

export default StyleSheet.create({
  // Contenedor principal (SafeAreaView)
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Cada tweet (sin Card, solo separador inferior)
  tweetContainer: {
    ...shadow.none,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },

  // Fila principal: avatar + contenido
  tweetContent: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,    // 16
    paddingTop: 12,
    paddingBottom: 8,
    minHeight: 72,
  },

  // Avatar
  avatarContainer: {
    marginRight: spacing.sm,          // 8px de separación
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  // Cuerpo del tweet
  tweetBody: {
    flex: 1,
    paddingRight: spacing.md,
  },

  // Header: Nombre + @handle + · + hora
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 4,
  },
  handleText: {
    color: colors.textSecondary,
    fontSize: 15,
    marginRight: 4,
  },
  dotSeparator: {
    color: colors.textSecondary,
    fontSize: 15,
    marginRight: 4,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 15,
  },

  // Texto del tweet
  tweetText: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    marginTop: 3,
    marginBottom: 8,
  },

  // Imagen o video adjunto
  mediaImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 16 / 9.5,   // Ratio típico de X
    borderRadius: radii.lg,   // 16
    marginTop: 12,
    marginBottom: 12,
  },

  // Acciones (reply, retweet, like, share)
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingRight: 20,
    maxWidth: '92%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  actionIcon: {
    width: 18,
    height: 18,
    tintColor: colors.textSecondary,
    marginRight: 6,
  },
  actionCount: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },

  // Like activo (cuando ya le diste like)
  actionCountLiked: {
    color: colors.like,
  },
  actionIconLiked: {
    tintColor: colors.like,
  },

  // Separador entre tweets (solo en FlatList)
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
    marginLeft: 72, // alineado con el texto, no con el avatar
  },

  // FAB (botón flotante de nuevo tweet)
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    ...shadow.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
});