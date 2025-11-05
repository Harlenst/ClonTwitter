// App.js
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme as NavDefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider, MD3LightTheme as PaperDefaultTheme } from 'react-native-paper';

// Screens
import LogIn from './src/Screens/LogIn';
import SignUp from './src/Screens/SignUp';
import PostTweet from './src/Screens/PostTweet';
import TweetList from './src/Screens/TweetList';
import ViewProfile from './src/Screens/ViewProfile';
import TweetDetail from './src/Screens/TweetDetail';
import FollowingList from './src/Screens/FollowingList';
import FollowersList from './src/Screens/FollowersList';
import SearchProfiles from './src/Screens/SearchProfiles';

// Tema unificado (sin negro ni azul)
import { colors } from './src/Styles/twitterStyles';

const Stack = createNativeStackNavigator();

// 🟣 Tema para React Native Paper
const paperTheme = {
  ...PaperDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    outline: colors.border,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    error: colors.error,
  },
  roundness: 14,
};

// 🟣 Tema para React Navigation (sin negro/azul)
const navTheme = {
  ...NavDefaultTheme,
  colors: {
    ...NavDefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.secondary,
  },
};

export default function App() {
  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator initialRouteName="LogIn" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="LogIn" component={LogIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="TweetList" component={TweetList} />
          <Stack.Screen name="PostTweet" component={PostTweet} />
          <Stack.Screen name="ViewProfile" component={ViewProfile} />
          <Stack.Screen name="TweetDetail" component={TweetDetail} />
          <Stack.Screen name="FollowingList" component={FollowingList} />
          <Stack.Screen name="FollowersList" component={FollowersList} />
          <Stack.Screen name="SearchProfiles" component={SearchProfiles} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
