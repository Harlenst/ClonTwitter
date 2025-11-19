import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { Avatar, Button, Card } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native'; // Para refrescar al entrar

// Componentes y Estilos
import Header from '../Components/Header';
import styles from '../Styles/stylesViewProfile';
import twitterStyles, { colors, radii } from '../Styles/twitterStyles';

// Servicios Firebase
import { followUser, unfollowUser, getUserById } from '../Config/firebaseServices';

const ViewProfile = ({ route, navigation }) => {
  const { profile, user } = route.params || {};
  // Usuario que estamos viendo
  const viewing = user || profile;

  // Redirección de seguridad
  if (!viewing) {
    // Un pequeño hack para evitar render error si no hay datos, redirige en el siguiente ciclo
    setTimeout(() => navigation.replace('LogIn'), 0);
    return null;
  }

  const isOwnProfile = !!profile && !!viewing && profile.id === viewing.id;

  // --- ESTADOS LOCALES ---
  // Inicializamos con los datos que recibimos por navegación (para que se vea algo ya)
  const [followingIds, setFollowingIds] = useState(
    Array.isArray(profile?.following) ? profile.following : []
  );
  const [followersCount, setFollowersCount] = useState(
    Array.isArray(viewing?.followers) ? viewing.followers.length : 0
  );

  // Calculado: ¿Lo sigo actualmente?
  const isFollowing = !isOwnProfile && followingIds.includes(viewing.id);

  // Iniciales Avatar
  const initials = useMemo(
    () => (viewing.fullName ? viewing.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'),
    [viewing.fullName]
  );

  // --- SINCRONIZACIÓN AL ENTRAR A LA PANTALLA ---
  // Esto asegura que si seguiste al usuario desde otra pantalla, aquí aparezca actualizado.
  useFocusEffect(
    useCallback(() => {
      const syncData = async () => {
        try {
          // 1. Obtener datos frescos del usuario que vemos (para contador de seguidores real)
          const freshViewing = await getUserById(viewing.id);
          if (freshViewing) {
             setFollowersCount(freshViewing.followers?.length || 0);
          }

          // 2. Obtener mis datos frescos (para saber a quién sigo realmente)
          if (profile?.id && !isOwnProfile) {
             const myFreshProfile = await getUserById(profile.id);
             if (myFreshProfile) {
                setFollowingIds(myFreshProfile.following || []);
             }
          }
        } catch (e) {
          console.log("Error sincronizando perfil:", e);
        }
      };

      syncData();
    }, [viewing.id, profile?.id, isOwnProfile])
  );

  // --- LÓGICA DE SEGUIR INSTANTÁNEA (OPTIMISTA) ---
  const onToggleFollow = async () => {
    if (!profile?.id || !viewing?.id || isOwnProfile) return;

    // Guardar estado previo por si falla la red
    const prevFollowingIds = [...followingIds];
    const prevFollowersCount = followersCount;

    // 1. APLICAR CAMBIOS VISUALES INMEDIATAMENTE
    if (isFollowing) {
      // Dejar de seguir: Quitamos ID y restamos 1
      setFollowingIds(ids => ids.filter(id => id !== viewing.id));
      setFollowersCount(c => Math.max(0, c - 1));
    } else {
      // Seguir: Agregamos ID y sumamos 1
      setFollowingIds(ids => [...ids, viewing.id]);
      setFollowersCount(c => c + 1);
    }

    try {
      // 2. LLAMADA A FIREBASE EN SEGUNDO PLANO
      if (isFollowing) {
        await unfollowUser(profile.id, viewing.id);
      } else {
        await followUser(profile.id, viewing.id);
      }
      // NOTA: NO recargamos los datos aquí para evitar parpadeos. 
      // Confiamos en nuestro cambio local.
    } catch (e) {
      // 3. REVERTIR SI HUBO ERROR
      Alert.alert('Error', 'No se pudo completar la acción');
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
        
        {/* CABECERA */}
        <View style={styles.headerSection}>
          <Avatar.Text
            size={80}
            label={initials}
            style={styles.avatar}
            color={colors.surface}
            labelStyle={{ fontSize: 32, fontWeight: '700' }}
          />
          
          <Text style={styles.fullName}>{viewing.fullName || 'Usuario'}</Text>
          <Text style={styles.username}>@{viewing.username || 'usuario'}</Text>

          {/* BOTONES DE ACCIÓN */}
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
                contentStyle={{ height: 36 }} // Altura fija para evitar saltos
                labelStyle={isFollowing ? styles.btnTextOutlined : styles.btnTextContained}
              >
                {isFollowing ? 'Siguiendo' : 'Seguir'}
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
              Ver Tweets
            </Button>
          </View>
        </View>

        {/* ESTADÍSTICAS */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statCount}>
              {/* Usamos el dato del objeto viewing directamente para 'Siguiendo' ya que no lo modificamos aquí */}
              {Array.isArray(viewing.following) ? viewing.following.length : 0}
            </Text>
            <Text style={styles.statLabel}>Siguiendo</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statCount}>{followersCount}</Text>
            <Text style={styles.statLabel}>Seguidores</Text>
          </View>
        </View>

        {/* INFO */}
        <View style={styles.infoCard}>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{viewing.email || 'No disponible'}</Text>
            </View>

            {viewing.phone ? (
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Teléfono</Text>
                    <Text style={styles.infoValue}>{viewing.phone}</Text>
                </View>
            ) : null}

            {viewing.description ? (
                <View style={{ marginTop: 8 }}>
                    <Text style={styles.infoLabel}>Biografía</Text>
                    <Text style={styles.descriptionText}>{viewing.description}</Text>
                </View>
            ) : null}
        </View>

        {/* OPCIONES DE DUEÑO */}
        {isOwnProfile && (
          <View style={styles.ownerActionsContainer}>
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('FollowingList', { profile })}
              style={styles.menuButton}
              textColor={colors.textSecondary}
            >
              Ver a quién sigo
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('FollowersList', { profile })}
              style={styles.menuButton}
              textColor={colors.textSecondary}
            >
              Ver quién me sigue
            </Button>
          </View>
        )}

      </ScrollView>
    </View>
  );
};

export default ViewProfile;