// src/Screens/TweetDetail.js
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card, Avatar, IconButton } from 'react-native-paper';
import Header from '../Components/Header';
import { colors } from '../Styles/twitterStyles';

const TweetDetail = ({ route, navigation }) => {
  const { tweet, profile } = route.params || {};
  if (!tweet || !profile) {
    navigation.goBack();
    return null;
  }

  const initials = (tweet.authorName || '??').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Header navigation={navigation} profile={profile} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card style={{ backgroundColor: '#111', marginBottom: 16 }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <Avatar.Text size={48} label={initials} style={{ backgroundColor: colors.primary }} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>
                  {tweet.authorName || 'Anónimo'}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  @{(tweet.authorEmail || 'usuario@x').split('@')[0]}
                </Text>
              </View>
            </View>
            <Text style={{ color: '#FFF', fontSize: 18, lineHeight: 26 }}>
              {tweet.text}
            </Text>
          </Card.Content>
        </Card>

        <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16 }}>
          <View style={{ alignItems: 'center' }}>
            <IconButton icon="message-reply" size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary }}>{tweet.replies || 0}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <IconButton icon="repeat" size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary }}>{tweet.retweets || 0}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <IconButton icon="heart-outline" size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary }}>{tweet.likes || 0}</Text>
          </View>
          <IconButton icon="share-outline" size={20} color={colors.textSecondary} />
        </View>
      </ScrollView>
    </View>
  );
};

export default TweetDetail;
