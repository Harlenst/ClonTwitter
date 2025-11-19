// src/Screens/FollowersList.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator, RefreshControl, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Avatar, Button } from 'react-native-paper';
import { getFollowersUsers, followUser, unfollowUser } from '../Config/firebaseServices';
import { colors } from '../Styles/twitterStyles';
import Header from '../Components/Header';

const PAGE_SIZE = 10;

const FollowersList = ({ route, navigation }) => {
  const { profile } = route.params; // 'profile' is the current logged-in user
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

  // Logic to Toggle Follow/Unfollow directly from the list
  const toggleFollow = async (targetUser) => {
    const isFollowing = Array.isArray(profile.following) && profile.following.includes(targetUser.id);

    try {
      if (isFollowing) {
        // Unfollow logic
        await unfollowUser(profile.id, targetUser.id);
        profile.following = profile.following.filter(id => id !== targetUser.id);
      } else {
        // Follow logic
        await followUser(profile.id, targetUser.id);
        profile.following = [...(profile.following || []), targetUser.id];
      }
      // Force re-render to update button state
      setUsers([...users]);
    } catch (error) {
      Alert.alert('Error', 'Could not update follow status');
    }
  };

  const renderUser = ({ item }) => {
    const initials = (item.fullName || '??')
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    // Check if the current user follows this follower
    const isFollowing = Array.isArray(profile.following) && profile.following.includes(item.id);

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
          
          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.fullName} numberOfLines={1}>{item.fullName}</Text>
            <Text style={styles.username} numberOfLines={1}>@{item.username}</Text>
            {item.description ? (
                <Text style={styles.bio} numberOfLines={1}>{item.description}</Text>
            ) : null}
          </View>

          {/* Follow Button */}
          {profile.id !== item.id && (
              <Button
                mode={isFollowing ? 'outlined' : 'contained'}
                onPress={() => toggleFollow(item)}
                compact
                uppercase={false}
                labelStyle={{ 
                    fontSize: 12, 
                    fontWeight: 'bold', 
                    color: isFollowing ? '#0F1419' : 'white'
                }}
                style={[
                    styles.followBtn, 
                    isFollowing ? styles.followingBtn : styles.notFollowingBtn
                ]}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
          )}
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
      <Header navigation={navigation} profile={profile} title="Followers" />
      
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          lastFullName && users.length > 0 ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ margin: 20 }} />
          ) : null
        }
        ListEmptyComponent={
            !loading && (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>You don't have any followers yet.</Text>
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
    paddingRight: 8,
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
  // Button Styles
  followBtn: {
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 90,
  },
  notFollowingBtn: {
    backgroundColor: '#0F1419',
    borderColor: '#0F1419',
  },
  followingBtn: {
    backgroundColor: 'transparent',
    borderColor: '#CFD9DE',
  },
  // Empty State
  emptyContainer: {
      marginTop: 50,
      alignItems: 'center',
  },
  emptyText: {
      fontSize: 16,
      color: '#536471',
  }
});

export default FollowersList;