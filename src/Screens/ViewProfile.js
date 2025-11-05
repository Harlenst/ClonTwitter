// src/Screens/ViewProfile.js
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Avatar, Card, Button } from 'react-native-paper';
import Header from '../Components/Header';
import twitterStyles, { colors } from '../Styles/twitterStyles';
import { followUser, unfollowUser } from '../Config/firebaseServices';

const ViewProfile = ({ route, navigation }) => {
  const { profile, user } = route.params || {};
  const viewing = user || profile;

  if (!viewing) {
    navigation.replace('LogIn');
    return null;
  }

  const isOwnProfile = !!profile && !!viewing && profile.id === viewing.id;

  const [followingIds, setFollowingIds] = useState(Array.isArray(profile?.following) ? profile.following : []);
  const [followersCount, setFollowersCount] = useState(Array.isArray(viewing?.followers) ? viewing.followers.length : 0);

  const isFollowing = !isOwnProfile && followingIds.includes(viewing.id);

  const initials = useMemo(() => {
    return viewing.fullName
      ? viewing.fullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : '?';
  }, [viewing.fullName]);

  const onToggleFollow = async () => {
    if (!profile?.id || !viewing?.id || isOwnProfile) return;
    try {
      if (isFollowing) {
        await unfollowUser(profile.id, viewing.id);
        setFollowingIds((prev) => prev.filter((id) => id !== viewing.id));
        setFollowersCount((c) => Math.max(0, c - 1));
      } else {
        await followUser(profile.id, viewing.id);
        setFollowingIds((prev) => [...prev, viewing.id]);
        setFollowersCount((c) => c + 1);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo actualizar el seguimiento');
    }
  };

  const onSeeTweets = () => {
    navigation.navigate('UserTweets', { user: viewing, profile: profile || viewing });
  };

  return (
    <View style={twitterStyles.container}>
      <Header navigation={navigation} profile={profile || viewing} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Avatar.Text
            size={80}
            label={initials}
            style={{ backgroundColor: colors.primary }}
            labelStyle={{ fontSize: 32, fontWeight: '700' }}
          />
          <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: '700', marginTop: 12 }}>
            {viewing.fullName}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
            @{viewing.username}
          </Text>

          {!isOwnProfile && profile?.id && viewing?.id !== profile.id && (
            <Button
              mode={isFollowing ? 'outlined' : 'contained'}
              style={{ marginTop: 12 }}
              onPress={onToggleFollow}
            >
              {isFollowing ? 'Siguiendo' : 'Seguir'}
            </Button>
          )}

          <Button
            mode="outlined"
            style={{ marginTop: 12 }}
            onPress={onSeeTweets}
          >
            Ver tweets
          </Button>
        </View>

        <Card style={{ backgroundColor: colors.surface, marginBottom: 12 }}>
          <Card.Content>
            <Text style={{ color: colors.textPrimary }}>Email: {viewing.email || '—'}</Text>
            {viewing.phone ? (
              <Text style={{ color: colors.textPrimary, marginTop: 4 }}>Tel: {viewing.phone}</Text>
            ) : null}
            {viewing.description ? (
              <Text style={{ color: colors.textPrimary, marginTop: 8 }}>{viewing.description}</Text>
            ) : null}
          </Card.Content>
        </Card>

        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '600' }}>
              {Array.isArray(viewing.following) ? viewing.following.length : 0}
            </Text>
            <Text style={{ color: colors.textSecondary }}>Siguiendo</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '600' }}>
              {followersCount}
            </Text>
            <Text style={{ color: colors.textSecondary }}>Seguidores</Text>
          </View>
        </View>

        {isOwnProfile && (
          <>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('FollowingList', { profile })}
              style={{ marginBottom: 8 }}
            >
              Ver siguiendo
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('FollowersList', { profile })}
            >
              Ver seguidores
            </Button>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ViewProfile;
