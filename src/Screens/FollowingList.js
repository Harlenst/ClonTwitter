// src/Screens/FollowingList.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';
import { getFollowingUsers } from '../Config/firebaseServices';
import { colors } from '../Styles/twitterStyles';
import Header from '../Components/Header';

const PAGE_SIZE = 10;

const FollowingList = ({ route, navigation }) => {
  const { profile } = route.params;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cursor, setCursor] = useState(0);

  const loadFollowing = async (reset = false) => {
    try {
      const currentCursor = reset ? 0 : cursor;
      if (currentCursor === null) return;

      const { users: newUsers, lastVisible } = await getFollowingUsers(
        profile.id,
        currentCursor,
        PAGE_SIZE
      );

      if (reset) setUsers(newUsers);
      else setUsers(prev => [...prev, ...newUsers]);

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

  const renderUser = ({ item }) => {
    const initials = item.fullName
      ? item.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : '??';

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ViewProfile', { user: item, profile })}
      >
        <View style={styles.userItem}>
           {/* Avatar */}
          <Avatar.Text
            size={48}
            label={initials}
            style={styles.avatar}
            color="white"
            labelStyle={{ fontWeight: 'bold' }}
          />
          
          {/* Text Info */}
          <View style={styles.userInfo}>
            <Text style={styles.fullName} numberOfLines={1}>{item.fullName || 'No Name'}</Text>
            <Text style={styles.username} numberOfLines={1}>@{item.username}</Text>
            {item.description ? (
                <Text style={styles.bio} numberOfLines={1}>{item.description}</Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && users.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header navigation={navigation} profile={profile} title="Following" />
      
      <FlatList
        data={users}
        renderItem={renderUser}
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          cursor !== null && users.length > 0 ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ margin: 20 }} />
          ) : null
        }
        ListEmptyComponent={
            !loading && (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>You are not following anyone yet.</Text>
                </View>
            )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  userItem: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  fullName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0F1419',
  },
  username: {
    fontSize: 14,
    color: '#536471',
  },
  bio: {
      fontSize: 13,
      color: '#0F1419',
      marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#EFF3F4',
  },
  emptyContainer: {
      marginTop: 50,
      alignItems: 'center',
  },
  emptyText: {
      fontSize: 16,
      color: '#536471',
  }
});

export default FollowingList;