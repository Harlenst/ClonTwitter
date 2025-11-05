// src/Screens/TweetList.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Avatar, IconButton, FAB } from 'react-native-paper';
import styles from '../Styles/stylesTweetList';
import twitterStyles, { colors } from '../Styles/twitterStyles';
import { getFeedTweets } from '../Config/firebaseServices';
import Header from '../Components/Header';

const TweetList = ({ route, navigation }) => {
  const { profile } = route.params || {};
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  const loadTweets = async (isRefresh = false) => {
    if (!profile?.id) return;

    try {
      const { tweets: newTweets, lastVisible } = await getFeedTweets(
        profile.id,
        isRefresh ? null : lastDoc,
        PAGE_SIZE
      );

      if (isRefresh) {
        setTweets(newTweets);
      } else {
        setTweets(prev => [...prev, ...newTweets]);
      }

      setLastDoc(lastVisible);
      setHasMore(newTweets.length === PAGE_SIZE);
    } catch (error) {
      const msg = String(error?.message || '');
      let human = 'No se pudieron cargar los tweets';
      if (/index/i.test(msg)) {
        human = 'Falta un índice de Firestore para el feed. Abre la consola y crea el índice sugerido';
      } else if (/TIMEOUT_FIRESTORE/i.test(msg) || /Could not reach Cloud Firestore backend/i.test(msg)) {
        human = 'Sin conexión con Firestore. Revisa Internet o prueba en otro dispositivo/red';
      }
      Alert.alert('Error', human);
      console.error('Error loading tweets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      setTweets([]);
      setLastDoc(null);
      setHasMore(true);
      setLoading(true);
      loadTweets(true);
    }
  }, [profile?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    setLastDoc(null);
    loadTweets(true);
  };

  const onEndReached = () => {
    if (!loading && hasMore && !refreshing) {
      loadTweets(false);
    }
  };

  const renderTweet = ({ item }) => {
    const authorInitials = item.authorName
      ? item.authorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : '??';

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('TweetDetail', { tweet: item, profile })}
      >
        <Card style={styles.tweetCard}>
          <Card.Content style={styles.tweetContent}>
            <Avatar.Text
              size={48}
              label={authorInitials}
              style={styles.avatar}
              color="#fff"
              theme={{ colors: { primary: colors.primary } }}
            />
            <View style={styles.tweetBody}>
              <Text style={styles.authorName} numberOfLines={1}>
                {item.authorName || 'Anónimo'}
              </Text>
              <Text style={styles.authorHandle}>
                @{item.authorEmail?.split('@')[0] || 'usuario'}
              </Text>
              <Text style={styles.tweetText}>{item.text}</Text>

              <View style={styles.tweetActions}>
                <View style={styles.actionItem}>
                  <IconButton icon="message-reply" size={18} color={colors.textSecondary} />
                  <Text style={styles.actionCount}>{item.replies || 0}</Text>
                </View>
                <View style={styles.actionItem}>
                  <IconButton
                    icon="repeat"
                    size={18}
                    color={item.retweeted ? colors.primary : colors.textSecondary}
                  />
                  <Text style={styles.actionCount}>{item.retweets || 0}</Text>
                </View>
                <View style={styles.actionItem}>
                  <IconButton
                    icon={item.liked ? 'heart' : 'heart-outline'}
                    size={18}
                    color={item.liked ? '#E0245E' : colors.textSecondary}
                  />
                  <Text style={styles.actionCount}>{item.likes || 0}</Text>
                </View>
                <IconButton icon="share-outline" size={18} color={colors.textSecondary} />
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading && tweets.length === 0) {
    return (
      <View style={twitterStyles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <View style={twitterStyles.container}>
      <Header navigation={navigation} profile={profile} title="Inicio" />

      <FlatList
        data={tweets}
        renderItem={renderTweet}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore && !loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ margin: 20 }} />
          ) : null
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {profile?.following?.length > 0
                  ? 'No hay actividad reciente'
                  : 'No sigues a nadie aún'}
              </Text>
              <Text style={styles.emptySubtext}>
                {profile?.following?.length > 0
                  ? 'Las personas que sigues no han publicado.'
                  : '¡Empieza a seguir usuarios para ver sus tweets!'}
              </Text>
              {(!profile?.following || profile.following.length === 0) && (
                <TouchableOpacity
                  style={styles.followButton}
                  onPress={() => navigation.navigate('SearchProfiles', { profile })}
                >
                  <Text style={styles.followButtonText}>Buscar personas</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
      />

      <FAB
        icon="pencil"
        style={{
          position: 'absolute',
          right: 24,
          bottom: 24,
          backgroundColor: colors.primary,
        }}
        color="#000"
        onPress={() => navigation.navigate('PostTweet', { profile })}
        accessibilityLabel="Crear tweet"
      />
    </View>
  );
};

export default TweetList;
