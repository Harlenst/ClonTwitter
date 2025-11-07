// src/Screens/TweetList.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, RefreshControl, ActivityIndicator,
  TouchableOpacity, Image, Alert,
} from 'react-native';
import { Card } from 'react-native-paper';
import styles from '../Styles/stylesTweetList';
import twitterStyles, { colors } from '../Styles/twitterStyles';
import { getFeedTweets } from '../Config/firebaseServices';
import Header from '../Components/Header';

const ICON_REPLY   = require('../Assets/icon_reply.png');
const ICON_REPEAT  = require('../Assets/icon_repeat.png');
const ICON_HEART   = require('../Assets/icon_heart.png');
const ICON_SHARE   = require('../Assets/icon_share.png');
const ICON_PENCIL  = require('../Assets/icon_pencil.png');
const AVATAR_FALLB = require('../Assets/default_avatar.png');

const AVATAR_SIZE = 48;
const PAGE_SIZE = 10;


const formatDateTime = (ts) => {
  let d = ts?.toDate ? ts.toDate() : ts;
  if (typeof d === 'number') d = new Date(d);
  if (typeof d === 'string') d = new Date(d);
  if (!(d instanceof Date) || isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const sameDay = d.toDateString() === new Date().toDateString();
  const hhmm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return sameDay ? hhmm : `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${hhmm}`;
};

const TweetList = ({ route, navigation }) => {
  const { profile, _forceRefresh } = route.params || {};
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const loadTweets = async (isRefresh = false) => {
    if (!profile?.id) return;
    try {
      const { tweets: newTweets, lastVisible } = await getFeedTweets(
        profile.id,
        isRefresh ? null : lastDoc,
        PAGE_SIZE
      );
      setTweets(isRefresh ? newTweets : (prev) => [...prev, ...newTweets]);
      setLastDoc(lastVisible);
      setHasMore(newTweets.length === PAGE_SIZE);
    } catch (error) {
      const msg = String(error?.message || '');
      let human = 'No se pudieron cargar los tweets';
      if (/index/i.test(msg)) human = 'Falta un índice de Firestore para el feed. Crea el índice sugerido en la consola';
      else if (/TIMEOUT_FIRESTORE/i.test(msg) || /Could not reach Cloud Firestore backend/i.test(msg))
        human = 'Sin conexión con Firestore. Revisa Internet o prueba en otra red';
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

  useEffect(() => {
    if (_forceRefresh && profile?.id) {
      setRefreshing(true);
      setLastDoc(null);
      loadTweets(true);
      navigation.setParams({ _forceRefresh: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_forceRefresh]);

  const onRefresh = () => {
    setRefreshing(true);
    setLastDoc(null);
    loadTweets(true);
  };

  const onEndReached = () => {
    if (!loading && hasMore && !refreshing) loadTweets(false);
  };

  const renderTweet = ({ item }) => {
    const authorName = item.authorName || 'Anónimo';
    const handle = item.authorUsername
      || (item.authorEmail ? item.authorEmail.split('@')[0] : 'usuario');
    const when = formatDateTime(item.timestamp);
    const headerLine = `${authorName}, @${handle} - ${when}`;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('TweetDetail', { tweet: item, profile })}
      >
        <Card style={styles.tweetCard}>
          <Card.Content style={styles.tweetContent}>
            <Image
              source={AVATAR_FALLB}
              style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, marginRight: 12 }}
            />
            <View style={styles.tweetBody}>
              <Text style={styles.authorName} numberOfLines={1}>{headerLine}</Text>
              <Text style={styles.tweetText}>{item.text}</Text>

              <View style={styles.tweetActions}>
                <View style={styles.actionItem}>
                  <Image source={ICON_REPLY} style={{ width: 18, height: 18, marginRight: 6 }} />
                  <Text style={styles.actionCount}>{item.replies || 0}</Text>
                </View>
                <View style={styles.actionItem}>
                  <Image source={ICON_REPEAT} style={{ width: 18, height: 18, marginRight: 6 }} />
                  <Text style={styles.actionCount}>{item.retweets || 0}</Text>
                </View>
                <View style={styles.actionItem}>
                  <Image source={ICON_HEART} style={{ width: 18, height: 18, marginRight: 6 }} />
                  <Text style={styles.actionCount}>{item.likes || 0}</Text>
                </View>
                <View style={styles.actionItem}>
                  <Image source={ICON_SHARE} style={{ width: 18, height: 18 }} />
                </View>
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
        keyExtractor={(item) => item.id}
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
                {profile?.following?.length > 0 ? 'No hay actividad reciente' : 'No sigues a nadie aún'}
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

      <TouchableOpacity
        onPress={() => navigation.navigate('PostTweet', { profile })}
        accessibilityLabel="Crear tweet"
        style={{
          position: 'absolute',
          right: 24,
          bottom: 24,
          backgroundColor: colors.primary,
          width: 56, height: 56, borderRadius: 28,
          alignItems: 'center', justifyContent: 'center',
          shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 }, elevation: 6,
        }}
      >
        <Image source={ICON_PENCIL} style={{ width: 24, height: 24 }} />
      </TouchableOpacity>
    </View>
  );
};

export default TweetList;
