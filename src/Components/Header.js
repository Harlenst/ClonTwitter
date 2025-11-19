// src/Components/Header.js
import React from 'react';
import { 
  Image, 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  SafeAreaView, 
  Platform,
  StatusBar
} from 'react-native';
import { colors } from '../Styles/twitterStyles'; // Asegúrate de importar tus colores

const Header = ({ navigation, profile }) => {
  if (!profile) return null;

  // Handlers
  const goHome = () => navigation.replace('TweetList', { profile });
  const goMyProfile = () => navigation.navigate('ViewProfile', { profile });
  const goSearch = () => navigation.navigate('SearchProfiles', { profile });
  const logout = () => navigation.replace('LogIn');

  // Lógica para la imagen del perfil (prioridad: foto real > default)
  const avatarSource = profile.profileImage 
    ? { uri: profile.profileImage } 
    : require('../Assets/default_avatar.png');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Ajuste para StatusBar en Android */}
      <View style={styles.headerContainer}>
        
        {/* IZQUIERDA: Foto de perfil */}
        <TouchableOpacity onPress={goMyProfile} activeOpacity={0.7}>
          <Image 
            source={avatarSource} 
            style={styles.profileAvatar} 
          />
        </TouchableOpacity>

        {/* CENTRO: Logo de la marca (Posicionamiento absoluto para centrado perfecto) */}
        <View style={styles.logoContainer}>
          <TouchableOpacity onPress={goHome} activeOpacity={0.7}>
            <Image
              source={require('../Assets/logo_brand.png')}
              style={styles.logo}
            />
          </TouchableOpacity>
        </View>

        {/* DERECHA: Iconos de acción */}
        <View style={styles.rightActions}>
          <TouchableOpacity onPress={goSearch} style={styles.iconBtn} activeOpacity={0.7}>
            <Image 
              source={require('../Assets/icon_search.png')} 
              style={styles.icon} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={logout} style={styles.iconBtn} activeOpacity={0.7}>
            <Image 
              source={require('../Assets/icon_logout.png')} 
              style={[styles.icon, { tintColor: colors.primary }]} // Opcional: Color al ícono logout
            />
          </TouchableOpacity>
        </View>
      
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Fix para Android
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50, // Altura más compacta estilo Twitter
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EFF3F4', // Gris muy suave
    // Sombra sutil solo en iOS (en Android el borde es suficiente o usa elevation: 1)
    zIndex: 10,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E1E8ED',
    resizeMode: 'cover', // Importante para fotos reales
  },
  // Contenedor flotante para asegurar que el logo siempre esté al centro
  logoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1, // Detrás de los botones laterales
  },
  logo: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginLeft: 20,
    padding: 4, // Aumenta el área de toque
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: '#0F1419', // Color negro Twitter o azul primario
  },
});

export default Header;