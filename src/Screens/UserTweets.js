// src/Screens/UserTweets.js
import React, { useEffect, useState } from 'react';
import { 
  View, FlatList, ActivityIndicator, RefreshControl, Text, 
  Alert, TouchableOpacity, Image, StyleSheet, SafeAreaView 
} from 'react-native';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../Config/firebaseConfig';

// Componentes
import Header from '../Components/Header';
import { colors } from '../Styles/twitterStyles';

// Assets
const ICON_REPLY   = require('../Assets/icon_reply.png');
const ICON_REPEAT  = require('../Assets/icon_repeat.png');
const ICON_HEART   = require('../Assets/icon_heart.png');
const ICON_SHARE   = require('../Assets/icon_share.png');
const AVATAR_FALLB = require('../Assets/default_avatar.png');

const PAGE_SIZE = 10;

// Helper de fecha corto (Estilo Twitter: "5m", "2h", "18 nov")
const formatTimeShort = (ts) => {
  let d = ts?.toDate ? ts.toDate() : ts;
  if (!d) return '';
  const now = new Date();
  const diff = (now - d) / 1000; // segundos
  
  if (diff < 60) return 'Justo ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  
  const day = d.getDate();
  const month = d.toLocaleString('es-ES', { month: 'short' });
  return `${day} ${month}`;
};

export default function UserTweets({ route, navigation }) {
  const { user, profile } = route.params; // 'user' es el dueño del perfil que vemos
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const load = async (isRefresh = false) => {
    try {
      let q = query(
        collection(db, 'tweets'),
        where('authorId', '==', user.id),
        orderBy('timestamp', 'desc'),
        limit(PAGE_SIZE)
      );
      
      if (!isRefresh && lastDoc) q = query(q, startAfter(lastDoc));

      const snap = await getDocs(q);
      const batch = snap.docs.map((d) => {
        const data = d.data();
        const ts = data.timestamp?.toDate?.() || new Date();
        return { id: d.id, ...data, timestamp: ts };
      });

      setTweets(isRefresh ? batch : [...tweets, ...batch]);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(batch.length === PAGE_SIZE);
    } catch (e) {
      console.error(e);
      if (tweets.length === 0) {
         // Solo mostramos error si falla la carga inicial
         // (Ocultamos errores de paginación silenciosa)
         // Alert.alert('Nota', 'No se pudieron cargar tweets recientes.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setTweets([]);
    setLastDoc(null);
    setHasMore(true);
    setLoading(true);
    load(true);
  }, [user.id]);

  // === RENDERIZADO DEL TWEET ===
  const renderTweet = ({ item }) => {
    const authorName = item.authorName || user.fullName || 'Anónimo';
    const handle = item.authorUsername || user.username || 'usuario';
    const timeAgo = formatTimeShort(item.timestamp);
    
    // Avatar del autor del tweet (en este caso, el usuario del perfil)
    const avatarSource = user.profileImage 
        ? { uri: user.profileImage } 
        : AVATAR_FALLB;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.tweetContainer}
        onPress={() => navigation.navigate('TweetDetail', { tweet: item, profile })}
      >
        {/* COLUMNA IZQUIERDA: AVATAR */}
        <View style={styles.avatarColumn}>
          <Image source={avatarSource} style={styles.avatar} />
        </View>

        {/* COLUMNA DERECHA: CONTENIDO */}
        <View style={styles.contentColumn}>
          
          {/* HEADER: Nombre + Handle + Fecha */}
          <View style={styles.headerRow}>
            <Text style={styles.nameText} numberOfLines={1}>{authorName}</Text>
            <Text style={styles.handleText} numberOfLines={1}>@{handle}</Text>
            <Text style={styles.dotSeparator}>·</Text>
            <Text style={styles.timeText}>{timeAgo}</Text>
          </View>

          {/* TEXTO */}
          <Text style={styles.tweetText}>{item.text}</Text>

          {/* IMAGEN (Si existe) */}
          {item.imageUrl && (
            <Image source={{ uri: item.imageUrl }} style={styles.tweetImage} />
          )}

          {/* CITA (QUOTED TWEET) */}
          {item.quotedTweet && (
            <View style={styles.quotedContainer}>
                <View style={styles.quotedHeader}>
                    <Image source={AVATAR_FALLB} style={styles.quotedAvatar}/>
                    <Text style={styles.quotedName}>{item.quotedTweet.authorName}</Text>
                    <Text style={styles.quotedHandle}>@{item.quotedTweet.authorUsername}</Text>
                </View>
                <Text style={styles.quotedText} numberOfLines={3}>{item.quotedTweet.text}</Text>
                {item.quotedTweet.imageUrl && (
                    <Image source={{ uri: item.quotedTweet.imageUrl }} style={styles.quotedImage} />
                )}
            </View>
          )}

          {/* ACCIONES */}
          <View style={styles.actionsRow}>
            <View style={styles.actionItem}>
              <Image source={ICON_REPLY} style={styles.actionIcon} />
              <Text style={styles.actionCount}>{item.replies || 0}</Text>
            </View>

            <View style={styles.actionItem}>
              <Image source={ICON_REPEAT} style={styles.actionIcon} />
              <Text style={styles.actionCount}>{item.retweets || 0}</Text>
            </View>

            <View style={styles.actionItem}>
              <Image source={ICON_HEART} style={styles.actionIcon} />
              <Text style={styles.actionCount}>{item.likes || 0}</Text>
            </View>

            <View style={styles.actionItem}>
              <Image source={ICON_SHARE} style={styles.actionIcon} />
            </View>
          </View>

        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} profile={profile} title={`Tweets`} />

      {loading && tweets.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tweets}
          renderItem={renderTweet}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          // Línea divisoria entre tweets (Estilo Twitter)
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setLastDoc(null);
                load(true);
              }}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={() => {
            if (!loading && hasMore && !refreshing) load(false);
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
             hasMore && tweets.length > 0 ? <ActivityIndicator size="small" color={colors.primary} style={{ margin: 20 }} /> : null
          }
          ListEmptyComponent={
             !loading && (
                <View style={styles.emptyContainer}>
                   <Text style={styles.emptyTitle}>Sin tweets aún</Text>
                   <Text style={styles.emptySub}>Cuando @{user.username} publique algo, aparecerá aquí.</Text>
                </View>
             )
          }
        />
      )}
    </SafeAreaView>
  );
}

// === ESTILOS LOCALES (DISEÑO PLANO / FLAT) ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tweetContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
  },
  avatarColumn: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E1E8ED',
  },
  contentColumn: {
    flex: 1,
    paddingRight: 4, // Espacio extra derecha
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  nameText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#0F1419',
    marginRight: 4,
  },
  handleText: {
    color: '#536471',
    fontSize: 14,
    marginRight: 4,
    flexShrink: 1,
  },
  dotSeparator: {
    color: '#536471',
    fontSize: 14,
    marginRight: 4,
  },
  timeText: {
    color: '#536471',
    fontSize: 14,
  },
  tweetText: {
    fontSize: 15,
    color: '#0F1419',
    lineHeight: 20,
    marginBottom: 8,
  },
  tweetImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 8,
    resizeMode: 'cover',
    backgroundColor: '#F7F9F9',
  },
  // ESTILOS DE CITA
  quotedContainer: {
    borderWidth: 1,
    borderColor: '#CFD9DE',
    borderRadius: 12,
    padding: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  quotedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  quotedAvatar: {
    width: 18, 
    height: 18, 
    borderRadius: 9, 
    marginRight: 6 
  },
  quotedName: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#0F1419',
    marginRight: 4,
  },
  quotedHandle: {
    fontSize: 13,
    color: '#536471',
  },
  quotedText: {
    fontSize: 14,
    color: '#0F1419',
    lineHeight: 18,
  },
  quotedImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: 6,
    resizeMode: 'cover',
  },
  // ACCIONES
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingRight: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 18,
    height: 18,
    tintColor: '#536471',
    marginRight: 4,
    resizeMode: 'contain',
  },
  actionCount: {
    fontSize: 12,
    color: '#536471',
  },
  separator: {
    height: 1,
    backgroundColor: '#EFF3F4', // Línea divisoria muy sutil
  },
  // EMPTY STATE
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F1419',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 15,
    color: '#536471',
    textAlign: 'center',
  },
});