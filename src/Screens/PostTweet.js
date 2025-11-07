// src/Screens/PostTweet.js
import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, TextInput, Button } from 'react-native-paper';
import styles from '../Styles/stylesPostTweet';
import { colors } from '../Styles/twitterStyles';
import { addTweet } from '../Config/firebaseServices';
import Header from '../Components/Header';

const PostTweet = ({ route, navigation }) => {
  const [tweetText, setTweetText] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile } = route.params || {};

  const handlePostTweet = async () => {
    if (!tweetText.trim()) return Alert.alert('Error', 'Escribe algo');
    if (tweetText.length > 280) return Alert.alert('Error', 'Máximo 280 caracteres');
    if (!profile?.id) return Alert.alert('Error', 'Perfil no cargado');

    setLoading(true);
    const fullNameFallback = `${profile.name || ''} ${profile.lastName || ''}`.trim();

    const tweetData = {
      text: tweetText.trim(),
      authorId: profile.id,
      authorName: profile.fullName || fullNameFallback || 'Anónimo',
      authorEmail: profile.email || '',
      likes: 0,
      retweets: 0,
      // importa que tu addTweet ponga createdAt con serverTimestamp en el servicio
    };

    try {
      await addTweet(tweetData);
      Alert.alert('Éxito', 'Tweet publicado', [
        {
          text: 'OK',
          onPress: () => {
            setTweetText('');
            // Volver al feed y forzar un refresh UNA sola vez, sin listeners
            navigation.replace('TweetList', { profile, _forceRefresh: Date.now() });
          },
        },
      ]);
    } catch (error) {
      const msg = String(error?.message || '');
      let human = 'No se pudo publicar';
      if (/TIMEOUT_FIRESTORE/i.test(msg) || /Could not reach Cloud Firestore backend/i.test(msg)) {
        human = 'Sin conexión con Firestore. Revisa Internet o intenta de nuevo';
      }
      Alert.alert('Error', human);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header navigation={navigation} profile={profile} />

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Publicar Tweet</Text>
          <Card style={styles.card}>
            <Card.Content style={{ padding: 0 }}>
              <TextInput
                placeholder="¿Qué está pasando?"
                value={tweetText}
                onChangeText={setTweetText}
                multiline
                style={styles.textInput}
                placeholderTextColor={colors.textSecondary}
                maxLength={280}
              />
              <View style={styles.footer}>
                <Text style={[styles.charCount, tweetText.length > 260 && styles.charCountWarning]}>
                  {tweetText.length}/280
                </Text>
                <Button
                  mode="contained"
                  onPress={handlePostTweet}
                  loading={loading}
                  disabled={loading || !tweetText.trim()}
                  style={styles.button}
                  labelStyle={{ fontWeight: '700' }}
                >
                  Publicar
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PostTweet;
