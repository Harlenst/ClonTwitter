// src/Screens/SearchProfiles.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Searchbar, Avatar, List, Button } from 'react-native-paper';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db, followUser, unfollowUser } from '../Config/firebaseServices';
import styles from '../Styles/stylesSearchProfiles';
import twitterStyles, { colors } from '../Styles/twitterStyles';

const SearchProfiles = ({ route, navigation }) => {
  const { profile: current } = route.params || {}; // perfil actual
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const searchLower = debouncedQuery.toLowerCase().trim();
        const prefixes = Array.from(
          { length: Math.min(searchLower.length, 10) },
          (_, i) => searchLower.substring(0, i + 1)
        );

        const qUsers = query(
          collection(db, 'users'),
          where('keywords', 'array-contains-any', prefixes),
          limit(20)
        );

        const snapshot = await getDocs(qUsers);
        const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setResults(users);
      } catch (error) {
        const msg = String(error?.message || '');
        let human = 'No se pudo realizar la búsqueda';
        if (/TIMEOUT_FIRESTORE/i.test(msg) || /Could not reach Cloud Firestore backend/i.test(msg)) {
          human = 'Sin conexión con Firestore. Revisa Internet o intenta de nuevo';
        }
        console.error('Error searching users:', error);
        Alert.alert('Error', human);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchUsers();
  }, [debouncedQuery]);

  const toggleFollow = async (target) => {
    if (!current?.id) return Alert.alert('Error', 'Perfil no cargado');
    if (current.id === target.id) return;

    const isFollowing = Array.isArray(current.following) && current.following.includes(target.id);

    try {
      if (isFollowing) {
        await unfollowUser(current.id, target.id);
        // Reflejar en UI localmente
        current.following = current.following.filter(id => id !== target.id);
      } else {
        await followUser(current.id, target.id);
        current.following = [...(current.following || []), target.id];
      }
      setResults(prev =>
        prev.map(u =>
          u.id === target.id ? { ...u } : u
        )
      );
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo actualizar el seguimiento');
    }
  };

  const renderUser = ({ item }) => {
    const initials = item.fullName
      ? item.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : '??';

    const isFollowing =
      Array.isArray(current?.following) && current.following.includes(item.id);

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('ViewProfile', {
            profile: current || item, // si no hay current, al menos abre el perfil del item
            user: item,              // usuario que estoy viendo (para follow/unfollow en Vista de perfil)
          })
        }
      >
        <List.Item
          title={item.fullName || 'Sin nombre'}
          description={`@${item.username}`}
          titleStyle={styles.resultName}
          descriptionStyle={styles.resultHandle}
          left={() => (
            <Avatar.Text size={48} label={initials} style={styles.avatar} color="#fff" />
          )}
          right={() =>
            current?.id && current.id !== item.id ? (
              <Button
                mode={isFollowing ? 'outlined' : 'contained'}
                onPress={() => toggleFollow(item)}
                compact
              >
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </Button>
            ) : null
          }
          style={styles.resultItem}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={twitterStyles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Buscar usuarios..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          iconColor={colors.textSecondary}
          placeholderTextColor={colors.textSecondary}
          theme={{ roundness: 12 }}
          autoFocus
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {debouncedQuery ? 'No se encontraron usuarios' : 'Escribe para buscar'}
          </Text>
        </View>
      ) : (
        <FlatList data={results} renderItem={renderUser} keyExtractor={item => item.id} style={styles.resultsList} />
      )}
    </View>
  );
};

export default SearchProfiles;
