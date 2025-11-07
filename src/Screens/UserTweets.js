// src/Screens/UserTweets.js
import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, Text, Alert } from 'react-native';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../Config/firebaseConfig';
import Header from '../Components/Header';
import twitterStyles, { colors } from '../Styles/twitterStyles';
import styles from '../Styles/stylesTweetList';

const PAGE_SIZE = 10;

// Helper local para fecha/hora
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

export default function UserTweets({ route, navigation }) {
  const { user, profile } = route.params;
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
      const msg = String(e?.message || '');
      let human = 'No se pudieron cargar los tweets';
      if (/index/i.test(msg)) human = 'Crea el índice compuesto sugerido en la consola de Firestore para ordenar por timestamp';
      Alert.alert('Error', human);
      console.error(e);
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

  return (
    <View style={twitterStyles.container}>
      <Header navigation={navigation} profile={profile} />
      {loading && tweets.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tweets}
          renderItem={({ item }) => {
            const name = item.authorName || user.fullName || 'Anónimo';
            const handle = item.authorUsername
              || (item.authorEmail ? item.authorEmail.split('@')[0] : user.username || 'user');
            const when = formatDateTime(item.timestamp);
            const headerLine = `${name}, @${handle} - ${when}`;

            return (
              <View style={[styles.tweetCard, { padding: 16 }]}>
                <Text style={styles.authorName}>{headerLine}</Text>
                <Text style={styles.tweetText}>{item.text}</Text>
              </View>
            );
          }}
          keyExtractor={(i) => i.id}
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
        />
      )}
    </View>
  );
}
