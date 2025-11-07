// src/Components/Header.js
import { Image, TouchableOpacity, View, Text } from 'react-native';
import twitterStyles, { colors } from '../Styles/twitterStyles';

const Header = ({ navigation, profile }) => {
  if (!profile) return null;
  const goHome = () => navigation.replace('TweetList', { profile });
  const goMyProfile = () => navigation.navigate('ViewProfile', { profile });
  const goSearch = () => navigation.navigate('SearchProfiles', { profile });
  const logout = () => navigation.replace('LogIn');

  return (
    <View style={twitterStyles.headerBar}>
      <TouchableOpacity onPress={goHome} style={{ paddingRight: 8 }}>
        <Image
          source={require('../Assets/logo_brand.png')}
          style={{ width: 28, height: 28 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Text style={twitterStyles.headerTitle}>@{profile.username}</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={goSearch} style={{ paddingHorizontal: 6 }}>
          <Image source={require('../Assets/icon_search.png')} style={{ width: 22, height: 22 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={goMyProfile} style={{ paddingHorizontal: 6 }}>
          <Image source={require('../Assets/icon_profile.png')} style={{ width: 22, height: 22 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={logout} style={{ paddingHorizontal: 6 }}>
          <Image source={require('../Assets/icon_logout.png')} style={{ width: 22, height: 22 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default Header;
