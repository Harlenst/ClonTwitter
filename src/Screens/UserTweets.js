// src/Screens/UserTweets.js
import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, Text } from 'react-native';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../Config/firebaseConfig';
import Header from '../Components/Header';
import twitterStyles, { colors } from '../Styles/twitterStyles';
import styles from '../Styles/stylesTweetList';

const PAGE_SIZE = 10;

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
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE)
      );
      if (!isRefresh && lastDoc) q = query(q, startAfter(lastDoc));

      const snap = await getDocs(q);
      const batch = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date(),
      }));
      setTweets(isRefresh ? batch : [...tweets, ...batch]);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(batch.length === PAGE_SIZE);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
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
          renderItem={({ item }) => (
            <View style={[styles.tweetCard, { padding: 16 }]}>
              <Text style={styles.authorName}>{item.authorName}</Text>
              <Text style={styles.authorHandle}>
                @{item.authorUsername || 'user'} ·{' '}
                {new Date(item.createdAt).toLocaleString()}
              </Text>
              <Text style={styles.tweetText}>{item.text}</Text>
            </View>
          )}
          keyExtractor={(i) => i.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setLastDoc(null);
                load(true);
              }}
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
