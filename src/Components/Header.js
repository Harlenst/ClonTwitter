// src/Components/Header.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';
import twitterStyles, { colors } from '../Styles/twitterStyles';

const Header = ({ navigation, profile }) => {
  if (!profile) return null;

  const goHome = () => navigation.replace('TweetList', { profile });
  const goMyProfile = () => navigation.navigate('ViewProfile', { profile });
  const goSearch = () => navigation.navigate('SearchProfiles', { profile });
  const logout = () => navigation.replace('LogIn');

  return (
    <View style={twitterStyles.headerBar}>
      {/* Marca → INICIO */}
      <TouchableOpacity onPress={goHome}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.primary, letterSpacing: -0.5 }}>
          HY
        </Text>
      </TouchableOpacity>

      {/* @username */}
      <Text style={twitterStyles.headerTitle}>@{profile.username}</Text>

      {/* Acciones */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <IconButton icon="magnify" size={24} onPress={goSearch} color={colors.textPrimary} />
        <IconButton icon="account-circle" size={24} onPress={goMyProfile} color={colors.textPrimary} />
        <IconButton icon="logout" size={24} onPress={logout} color={colors.textSecondary} />
      </View>
    </View>
  );
};

export default Header;
