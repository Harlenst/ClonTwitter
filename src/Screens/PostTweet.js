import React, { useState } from 'react';
import {
  View, Text, ScrollView, Alert, Image, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput, ActivityIndicator, SafeAreaView, StyleSheet
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { addTweet, uploadImageToStorage } from '../Config/firebaseServices';
import { colors } from '../Styles/twitterStyles'; 

const AVATAR_FALLB = require('../Assets/default_avatar.png');
const ICON_GALLERY = require('../Assets/icon_share.png'); 

const PostTweet = ({ route, navigation }) => {
  const { profile, quotingTweet } = route.params || {}; 

  const [tweetText, setTweetText] = useState('');
  const [loading, setLoading] = useState(false);
  // Guardamos solo el base64 string y la uri para mostrar
  const [imageState, setImageState] = useState(null); 

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({ 
          mediaType: 'photo', 
          quality: 0.6, // Calidad media para asegurar que genere el base64 rápido
          maxWidth: 1024, 
          maxHeight: 1024,
          selectionLimit: 1,
          includeBase64: true // <--- OBLIGATORIO
      });
      
      if (!result.didCancel && result.assets?.[0]) {
          const asset = result.assets[0];
          
          // VALIDACIÓN CRÍTICA:
          if (!asset.base64) {
              Alert.alert('Error', 'No se pudo procesar la imagen. Intenta con una más pequeña o diferente.');
              return;
          }

          setImageState({
              uri: asset.uri,
              base64: asset.base64 
          });
      }
    } catch (error) { 
        Alert.alert('Error', 'No se pudo abrir la galería'); 
    }
  };

  const handlePostTweet = async () => {
    if (!tweetText.trim() && !imageState && !quotingTweet) return;
    if (tweetText.length > 280) return Alert.alert('Error', 'Máximo 280 caracteres');
    
    setLoading(true);
    try {
      let imageUrl = null;
      
      if (imageState) {
        const path = `tweets/${profile.id}_${Date.now()}.jpg`;
        // PASAMOS SOLO EL STRING BASE64
        imageUrl = await uploadImageToStorage(imageState.base64, path);
      }

      const fullNameFallback = `${profile.name || ''} ${profile.lastName || ''}`.trim();

      const tweetData = {
        text: tweetText.trim(),
        authorId: profile.id,
        authorName: profile.fullName || fullNameFallback || 'Usuario',
        authorUsername: profile.username || 'usuario',
        imageUrl, 
        likes: 0,
        retweets: 0,
        replies: 0,
        timestamp: new Date(),
        
        quotedTweet: quotingTweet ? {
            id: quotingTweet.id,
            authorName: quotingTweet.authorName || 'Anónimo',
            authorUsername: quotingTweet.authorUsername || 'usuario',
            text: quotingTweet.text || '',
            imageUrl: quotingTweet.imageUrl || null
        } : null
      };

      await addTweet(tweetData);
      navigation.replace('TweetList', { profile, _forceRefresh: true });
      
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo publicar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // --- HEADER ---
  const renderCustomHeader = () => (
    <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
            <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            onPress={handlePostTweet}
            disabled={loading || (!tweetText.trim() && !imageState && !quotingTweet)}
            style={[
                styles.postButton, 
                (loading || (!tweetText.trim() && !imageState && !quotingTweet)) && styles.disabledPost
            ]}
        >
            {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
            ) : (
                <Text style={styles.postText}>Publicar</Text>
            )}
        </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {renderCustomHeader()}
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.row}>
                    <Image source={AVATAR_FALLB} style={styles.avatar} />
                    <View style={{ flex: 1 }}>
                        <TextInput
                            placeholder={quotingTweet ? "Agrega un comentario..." : "¿Qué está pasando?"}
                            value={tweetText}
                            onChangeText={setTweetText}
                            multiline
                            maxLength={280}
                            style={styles.input}
                            placeholderTextColor="#657786"
                            autoFocus={!quotingTweet} 
                        />
                        
                        {/* PREVISUALIZACIÓN */}
                        {imageState && (
                            <View style={styles.mediaPreview}>
                                <Image source={{ uri: imageState.uri }} style={styles.image} />
                                <TouchableOpacity onPress={() => setImageState(null)} style={styles.removeBtn}>
                                    <Text style={styles.removeBtnText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* CITA */}
                        {quotingTweet && (
                            <View style={styles.quotePreview}>
                                <View style={styles.quoteHeader}>
                                    <Image source={AVATAR_FALLB} style={styles.quoteAvatar} />
                                    <Text style={styles.quoteName} numberOfLines={1}>{quotingTweet.authorName}</Text>
                                    <Text style={styles.quoteHandle} numberOfLines={1}>@{quotingTweet.authorUsername}</Text>
                                </View>
                                <Text style={styles.quoteText} numberOfLines={3}>{quotingTweet.text}</Text>
                                {quotingTweet.imageUrl && (
                                    <Image source={{ uri: quotingTweet.imageUrl }} style={styles.quoteImage} />
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.toolbar}>
                <TouchableOpacity onPress={handlePickImage} style={styles.iconButton}>
                    <Image 
                        source={ICON_GALLERY} 
                        style={{ width: 24, height: 24, tintColor: colors.primary }} 
                        resizeMode="contain" 
                    />
                </TouchableOpacity>
                <Text style={{ color: tweetText.length > 260 ? '#E0245E' : '#657786', fontSize: 14 }}>
                    {tweetText.length}/280
                </Text>
            </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: '#EFF3F4', marginTop: Platform.OS === 'android' ? 10 : 0 },
    cancelText: { fontSize: 16, color: '#14171A' },
    postButton: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20 },
    postText: { color: '#fff', fontWeight: 'bold' },
    disabledPost: { opacity: 0.5 },
    content: { padding: 16 },
    row: { flexDirection: 'row', alignItems: 'flex-start' },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#E1E8ED' },
    input: { fontSize: 18, color: '#14171A', textAlignVertical: 'top', minHeight: 80, paddingTop: 8 },
    mediaPreview: { marginTop: 12, position: 'relative' },
    image: { width: '100%', height: 200, borderRadius: 16, backgroundColor: '#F5F8FA', resizeMode: 'cover' },
    removeBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    removeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    quotePreview: { marginTop: 12, borderWidth: 1, borderColor: '#E1E8ED', borderRadius: 12, padding: 12 },
    quoteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    quoteAvatar: { width: 20, height: 20, borderRadius: 10, marginRight: 6, backgroundColor: '#ccc' },
    quoteName: { fontWeight: 'bold', fontSize: 14, color: '#14171A', marginRight: 4 },
    quoteHandle: { fontSize: 13, color: '#657786' },
    quoteText: { fontSize: 14, color: '#14171A', marginBottom: 6 },
    quoteImage: { width: '100%', height: 120, borderRadius: 8, marginTop: 4, resizeMode: 'cover' },
    toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#EFF3F4', backgroundColor: '#fff' },
    iconButton: { padding: 8 },
});

export default PostTweet;