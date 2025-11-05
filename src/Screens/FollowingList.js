// src/Screens/FollowingList.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { Card, Avatar } from 'react-native-paper';
import { getFollowingUsers } from '../Config/firebaseServices';
import styles from '../Styles/stylesFollowingList';
import Header from '../Components/Header';

const PAGE_SIZE = 10;

const FollowingList = ({ route, navigation }) => {
  const { profile } = route.params;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cursor numérico (offset sobre el arreglo de IDs); null = no hay más
  const [cursor, setCursor] = useState(0);

  const loadFollowing = async (reset = false) => {
    try {
      const currentCursor = reset ? 0 : cursor;
      if (currentCursor === null) return; // no hay más páginas

      const { users: newUsers, lastVisible } = await getFollowingUsers(
        profile.id,
        currentCursor,
        PAGE_SIZE
      );

      if (reset) setUsers(newUsers);
      else setUsers(prev => [...prev, ...newUsers]);

      // lastVisible es el próximo cursor (número) o null si no hay más
      setCursor(lastVisible);
    } catch (e) {
      console.error('FollowingList error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setUsers([]);
    setCursor(0);
    setLoading(true);
    loadFollowing(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  const onRefresh = () => {
    setRefreshing(true);
    setCursor(0);
    loadFollowing(true);
  };

  const onEndReached = () => {
    if (!loading && cursor !== null && !refreshing) {
      loadFollowing(false);
    }
  };

  const renderUser = ({ item }) => (
    <Card style={styles.userCard}>
      <Card.Content style={styles.userContent}>
        <Avatar.Text
          size={48}
          label={(item.fullName || '??')
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase()}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.fullName}>{item.fullName}</Text>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && users.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header navigation={navigation} profile={profile} />
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          cursor !== null && (
            <ActivityIndicator size="small" color="#1DA1F2" style={{ margin: 20 }} />
          )
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No estás siguiendo a nadie aún.</Text>
        }
      />
    </View>
  );
};

export default FollowingList;
  