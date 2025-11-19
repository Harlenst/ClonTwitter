import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { Avatar, Button, Card } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native'; // To refresh when entering

// Components and Styles
import Header from '../Components/Header';
import styles from '../Styles/stylesViewProfile';
import twitterStyles, { colors, radii } from '../Styles/twitterStyles';

// Firebase Services
import { followUser, unfollowUser, getUserById } from '../Config/firebaseServices';

const ViewProfile = ({ route, navigation }) => {
  const { profile, user } = route.params || {};
  // User we are viewing
  const viewing = user || profile;

  // Security redirect
  if (!viewing) {
    // A small hack to avoid render error if no data, redirects in the next cycle
    setTimeout(() => navigation.replace('LogIn'), 0);
    return null;
  }

  const isOwnProfile = !!profile && !!viewing && profile.id === viewing.id;

  // --- LOCAL STATES ---
  // Initialize with data received via navigation (so something is shown immediately)
  const [followingIds, setFollowingIds] = useState(
    Array.isArray(profile?.following) ? profile.following : []
  );
  const [followersCount, setFollowersCount] = useState(
    Array.isArray(viewing?.followers) ? viewing.followers.length : 0
  );

  // Calculated: Do I currently follow them?
  const isFollowing = !isOwnProfile && followingIds.includes(viewing.id);

  // Avatar Initials
  const initials = useMemo(
    () => (viewing.fullName ? viewing.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'),
    [viewing.fullName]
  );

  // --- SYNC ON SCREEN FOCUS ---
  // This ensures that if you followed the user from another screen, it appears updated here.
  useFocusEffect(
    useCallback(() => {
      const syncData = async () => {
        try {
          // 1. Get fresh data of the user we are viewing (for real followers count)
          const freshViewing = await getUserById(viewing.id);
          if (freshViewing) {
             setFollowersCount(freshViewing.followers?.length || 0);
          }

          // 2. Get my fresh data (to know who I really follow)
          if (profile?.id && !isOwnProfile) {
             const myFreshProfile = await getUserById(profile.id);
             if (myFreshProfile) {
                setFollowingIds(myFreshProfile.following || []);
             }
          }
        } catch (e) {
          console.log("Error syncing profile:", e);
        }
      };

      syncData();
    }, [viewing.id, profile?.id, isOwnProfile])
  );

  // --- INSTANT FOLLOW LOGIC (OPTIMISTIC) ---
  const onToggleFollow = async () => {
    if (!profile?.id || !viewing?.id || isOwnProfile) return;

    // Save previous state in case network fails
    const prevFollowingIds = [...followingIds];
    const prevFollowersCount = followersCount;

    // 1. APPLY VISUAL CHANGES IMMEDIATELY
    if (isFollowing) {
      // Unfollow: Remove ID and subtract 1
      setFollowingIds(ids => ids.filter(id => id !== viewing.id));
      setFollowersCount(c => Math.max(0, c - 1));
    } else {
      // Follow: Add ID and add 1
      setFollowingIds(ids => [...ids, viewing.id]);
      setFollowersCount(c => c + 1);
    }

    try {
      // 2. FIREBASE CALL IN BACKGROUND
      if (isFollowing) {
        await unfollowUser(profile.id, viewing.id);
      } else {
        await followUser(profile.id, viewing.id);
      }
      // NOTE: We do NOT reload data here to avoid flickering. 
      // We trust our local change.
    } catch (e) {
      // 3. REVERT IF ERROR
      Alert.alert('Error', 'Could not complete the action');
      setFollowingIds(prevFollowingIds);
      setFollowersCount(prevFollowersCount);
    }
  };

  const onSeeTweets = () => {
    navigation.navigate('UserTweets', { user: viewing, profile: profile });
  };

  return (
    <View style={twitterStyles.container}>
      <Header navigation={navigation} profile={profile} title={`@${viewing.username}`} />

      <ScrollView contentContainerStyle={styles.profileContainer}>
        
        {/* HEADER */}
        <View style={styles.headerSection}>
          <Avatar.Text
            size={80}
            label={initials}
            style={styles.avatar}
            color={colors.surface}
            labelStyle={{ fontSize: 32, fontWeight: '700' }}
          />
          
          <Text style={styles.fullName}>{viewing.fullName || 'User'}</Text>
          <Text style={styles.username}>@{viewing.username || 'username'}</Text>

          {/* ACTION BUTTONS */}
          <View style={styles.actionButtonsContainer}>
            {!isOwnProfile && (
              <Button
                mode={isFollowing ? 'outlined' : 'contained'}
                onPress={onToggleFollow}
                compact
                style={[
                  styles.actionButton, 
                  { backgroundColor: isFollowing ? 'transparent' : colors.primary }
                ]}
                contentStyle={{ height: 36 }} // Fixed height to avoid jumps
                labelStyle={isFollowing ? styles.btnTextOutlined : styles.btnTextContained}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}

            <Button
              mode="outlined"
              onPress={onSeeTweets}
              compact
              style={[styles.actionButton, { borderColor: colors.primary }]}
              contentStyle={{ height: 36 }}
              labelStyle={styles.btnTextOutlined}
            >
              View Tweets
            </Button>
          </View>
        </View>

        {/* STATISTICS */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statCount}>
              {/* We use data from the 'viewing' object directly for 'Following' since we don't modify it here */}
              {Array.isArray(viewing.following) ? viewing.following.length : 0}
            </Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statCount}>{followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>

        {/* INFO */}
        <View style={styles.infoCard}>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{viewing.email || 'Not available'}</Text>
            </View>

            {viewing.phone ? (
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{viewing.phone}</Text>
                </View>
            ) : null}

            {viewing.description ? (
                <View style={{ marginTop: 8 }}>
                    <Text style={styles.infoLabel}>Bio</Text>
                    <Text style={styles.descriptionText}>{viewing.description}</Text>
                </View>
            ) : null}
        </View>

        {/* OWNER OPTIONS */}
        {isOwnProfile && (
          <View style={styles.ownerActionsContainer}>
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('FollowingList', { profile })}
              style={styles.menuButton}
              textColor={colors.textSecondary}
            >
              See who I follow
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('FollowersList', { profile })}
              style={styles.menuButton}
              textColor={colors.textSecondary}
            >
              See who follows me
            </Button>
          </View>
        )}

      </ScrollView>
    </View>
  );
};

export default ViewProfile;