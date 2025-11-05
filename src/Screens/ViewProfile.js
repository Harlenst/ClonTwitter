// src/Screens/ViewProfile.js
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Avatar, Card, Button } from 'react-native-paper';
import Header from '../Components/Header';
import { colors } from '../Styles/twitterStyles';
import { followUser, unfollowUser } from '../Config/firebaseServices';

const ViewProfile = ({ route, navigation }) => {
  // profile = usuario logueado; user = usuario que estoy viendo (opcional)
  const { profile, user } = route.params || {};

  // Si me pasaron `user`, es el perfil a visualizar; si no, muestro el mío
  const viewing = user || profile;

  if (!viewing) {
    navigation.replace('LogIn');
    return null;
  }

  const isOwnProfile = profile && viewing && profile.id === viewing.id;

  // Estado local de seguimiento cuando estoy viendo a otro
  const [isFollowing, setIsFollowing] = useState(
    !isOwnProfile &&
      Array.isArray(profile?.following) &&
      profile.following.includes(viewing.id)
  );

  const initials = useMemo(() => {
    return viewing.fullName
      ? viewing.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : '?';
  }, [viewing.fullName]);

  const onToggleFollow = async () => {
    if (!profile?.id || !viewing?.id || isOwnProfile) return;
    try {
      if (isFollowing) {
        await unfollowUser(profile.id, viewing.id);
        // actualizar estados locales “bonito”
        setIsFollowing(false);
        if (Array.isArray(profile.following)) {
          const i = profile.following.indexOf(viewing.id);
          if (i >= 0) profile.following.splice(i, 1);
        }
      } else {
        await followUser(profile.id, viewing.id);
        setIsFollowing(true);
        profile.following = [...(profile.following || []), viewing.id];
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo actualizar el seguimiento');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Header navigation={navigation} profile={profile || viewing} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Avatar.Text
            size={80}
            label={initials}
            style={{ backgroundColor: colors.primary }}
            labelStyle={{ fontSize: 32, fontWeight: '700' }}
          />
          <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700', marginTop: 12 }}>
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
        </View>

        <Card style={{ backgroundColor: '#111', marginBottom: 12 }}>
          <Card.Content>
            <Text style={{ color: '#FFF' }}>Email: {viewing.email}</Text>
            {viewing.phone && <Text style={{ color: '#FFF', marginTop: 4 }}>Tel: {viewing.phone}</Text>}
            {viewing.description && <Text style={{ color: '#FFF', marginTop: 8 }}>{viewing.description}</Text>}
          </Card.Content>
        </Card>

        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '600' }}>
              {viewing.following?.length || 0}
            </Text>
            <Text style={{ color: colors.textSecondary }}>Siguiendo</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '600' }}>
              {viewing.followers?.length || 0}
            </Text>
            <Text style={{ color: colors.textSecondary }}>Seguidores</Text>
          </View>
        </View>

        {/* Navegación a listas solo si estoy viendo MI perfil */}
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
