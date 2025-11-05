
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Card, Avatar, Button } from 'react-native-paper';
import { getFollowersUsers, followUser } from '../Config/firebaseServices';
import styles from '../Styles/stylesFollowersList';
import Header from '../Components/Header';

const PAGE_SIZE = 10;

const FollowersList = ({ route, navigation }) => {
  const { profile } = route.params;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [lastFullName, setLastFullName] = useState(null);

  const loadFollowers = async (reset = false) => {
    try {
      const { users: newUsers, lastVisible } = await getFollowersUsers(
        profile.id,
        reset ? null : lastFullName,
        PAGE_SIZE
      );

      if (reset) setUsers(newUsers);
      else setUsers(prev => [...prev, ...newUsers]);

      setLastFullName(lastVisible);
    } catch (error) {
      console.error('FollowersList error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setUsers([]);
    setLastFullName(null);
    setLoading(true);
    loadFollowers(true);
    
  }, [profile.id]);

  const onRefresh = () => {
    setRefreshing(true);
    setLastFullName(null);
    loadFollowers(true);
  };

  const onEndReached = () => {
    if (!loading && lastFullName && !refreshing) {
      loadFollowers(false);
    }
  };

  const handleFollow = async (targetUserId) => {
    try {
      await followUser(profile.id, targetUserId);
      Alert.alert('Éxito', 'Ahora sigues a este usuario');
      onRefresh();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderUser = ({ item }) => {
    const initials = (item.fullName || '??')
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const isFollowing = Array.isArray(profile.following) && profile.following.includes(item.id);

    return (
      <Card style={styles.userCard}>
        <Card.Content style={styles.userContent}>
          <Avatar.Text size={48} label={initials} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.fullName}>{item.fullName}</Text>
            <Text style={styles.username}>@{item.username}</Text>
          </View>
          {!isFollowing ? (
            <Button
              mode="outlined"
              onPress={() => handleFollow(item.id)}
              style={styles.followButton}
              labelStyle={{ fontSize: 12 }}
            >
              Seguir
            </Button>
          ) : (
            <Text style={styles.followingText}>Siguiendo</Text>
          )}
        </Card.Content>
      </Card>
    );
  };

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
          lastFullName && (
            <ActivityIndicator size="small" color="#1DA1F2" style={{ margin: 20 }} />
          )
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No tienes seguidores aún.</Text>}
      />
    </View>
  );
};

export default FollowersList;
