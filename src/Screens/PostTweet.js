import React, { useState } from 'react';
import {
  View, Text, ScrollView, Alert, Image, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput, ActivityIndicator, SafeAreaView, StyleSheet
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { addTweet, uploadImageToStorage } from '../Config/firebaseServices';
import { colors } from '../Styles/twitterStyles'; // Asegúrate de que colors esté importado

const AVATAR_FALLB = require('../Assets/default_avatar.png');
// Asegúrate de que esta ruta sea correcta, a veces es '../Assets/icon_image.png' o similar
const ICON_GALLERY = require('../Assets/icon_share.png'); 

const PostTweet = ({ route, navigation }) => {
  const { profile, quotingTweet } = route.params || {}; 

  const [tweetText, setTweetText] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageAsset, setImageAsset] = useState(null);

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({ 
          mediaType: 'photo', 
          quality: 0.7, 
          selectionLimit: 1,
          includeBase64: true // <--- CORREGIDO AQUÍ
      });
      if (!result.didCancel && result.assets?.[0]) {
          setImageAsset(result.assets[0]);
      }
    } catch (error) { 
        Alert.alert('Error', 'No se pudo abrir la galería'); 
    }
  };

  const handlePostTweet = async () => {
    if (!tweetText.trim() && !imageAsset && !quotingTweet) return;
    if (tweetText.length > 280) return Alert.alert('Error', 'Máximo 280 caracteres');
    
    setLoading(true);
    try {
      let imageUrl = null;
      
      if (imageAsset) {
        const path = `tweets/${profile.id}_${Date.now()}.jpg`;
        imageUrl = await uploadImageToStorage(imageAsset, path);
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
        
        // 👇👇 AQUÍ ESTÁ LA CORRECCIÓN 👇👇
        quotedTweet: quotingTweet ? {
            id: quotingTweet.id,
            authorName: quotingTweet.authorName || 'Anónimo', // Evitar undefined
            
            // 🔥 ESTA LÍNEA CAUSABA EL ERROR. AGREGAMOS "|| 'usuario'"
            authorUsername: quotingTweet.authorUsername || 'usuario', 
            
            text: quotingTweet.text || '', // Evitar undefined
            imageUrl: quotingTweet.imageUrl || null
        } : null
        // 👆👆 FIN DE LA CORRECCIÓN 👆👆
      };

      await addTweet(tweetData);
      
      navigation.replace('TweetList', { profile, _forceRefresh: true });
      
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo publicar');
    } finally {
      setLoading(false);
    }
  };

  // Header Personalizado
  const renderCustomHeader = () => (
    <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            onPress={handlePostTweet}
            disabled={loading || (!tweetText.trim() && !imageAsset && !quotingTweet)}
            style={[styles.postButton, (loading || (!tweetText.trim() && !imageAsset && !quotingTweet)) && styles.disabledPost]}
        >
            {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.postText}>Publicar</Text>}
        </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {renderCustomHeader()}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.row}>
                    {/* Avatar del usuario actual */}
                    <Image 
                        source={profile?.profileImage ? { uri: profile.profileImage } : AVATAR_FALLB} 
                        style={styles.avatar} 
                    />
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
                        
                        {/* PREVISUALIZACIÓN DE IMAGEN PROPIA */}
                        {imageAsset?.uri && (
                            <View style={styles.mediaPreview}>
                                <Image source={{ uri: imageAsset.uri }} style={styles.image} />
                                <TouchableOpacity onPress={() => setImageAsset(null)} style={styles.removeBtn}>
                                    <Text style={{color:'white', fontWeight:'bold'}}>X</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* PREVISUALIZACIÓN DEL TWEET CITADO */}
                        {quotingTweet && (
                            <View style={styles.quotePreview}>
                                <View style={styles.quoteHeader}>
                                    {/* Avatar del autor del tweet citado */}
                                    <Image 
                                        source={AVATAR_FALLB} // Podrías pasar la url del avatar citado si la tienes
                                        style={styles.quoteAvatar} 
                                    />
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

            {/* TOOLBAR */}
            <View style={styles.toolbar}>
                <TouchableOpacity onPress={handlePickImage} style={{ padding: 8 }}>
                    <Image source={ICON_GALLERY} style={{ width: 24, height: 24, tintColor: colors.primary }} resizeMode="contain" />
                </TouchableOpacity>
                <Text style={{ color: tweetText.length > 260 ? 'red' : '#657786' }}>{tweetText.length}/280</Text>
            </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: '#EFF3F4', marginTop: Platform.OS === 'android' ? 30 : 0 },
    cancelText: { fontSize: 16, color: '#14171A' },
    postButton: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20 },
    postText: { color: '#fff', fontWeight: 'bold' },
    disabledPost: { opacity: 0.5 },
    content: { padding: 16, paddingBottom: 100 },
    row: { flexDirection: 'row', alignItems: 'flex-start' },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#E1E8ED' },
    input: { fontSize: 18, color: '#14171A', textAlignVertical: 'top', minHeight: 80, paddingTop: 8 },
    mediaPreview: { marginTop: 12, position: 'relative' },
    image: { width: '100%', height: 200, borderRadius: 16, backgroundColor: '#F5F8FA', resizeMode: 'cover' },
    removeBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: '#EFF3F4', backgroundColor: '#fff' },
    
    // Estilos de la Cita
    quotePreview: { marginTop: 12, borderWidth: 1, borderColor: '#E1E8ED', borderRadius: 12, padding: 12, overflow: 'hidden' },
    quoteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    quoteAvatar: { width: 20, height: 20, borderRadius: 10, marginRight: 6, backgroundColor: '#ccc' },
    quoteName: { fontWeight: 'bold', fontSize: 14, color: '#14171A', marginRight: 4 },
    quoteHandle: { fontSize: 13, color: '#657786' },
    quoteText: { fontSize: 14, color: '#14171A', marginBottom: 6 },
    quoteImage: { width: '100%', height: 120, borderRadius: 8, marginTop: 4, resizeMode: 'cover' },
});

export default PostTweet;