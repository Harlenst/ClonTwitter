// src/Screens/TweetDetail.js
import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import Header from '../Components/Header';
import { colors } from '../Styles/twitterStyles';

// Assets locales
const ICON_REPLY   = require('../Assets/icon_reply.png');
const ICON_REPEAT  = require('../Assets/icon_repeat.png');
const ICON_HEART   = require('../Assets/icon_heart.png');
const ICON_SHARE   = require('../Assets/icon_share.png');
const AVATAR_FALLB = require('../Assets/default_avatar.png');

const AVATAR_SIZE = 48;

// Helper local para fecha y hora
const formatDateTime = (ts) => {
  let d = ts?.toDate ? ts.toDate() : ts;
  if (typeof d === 'number') d = new Date(d);
  if (typeof d === 'string') d = new Date(d);
  if (!(d instanceof Date) || isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const sameDay = d.toDateString() === new Date().toDateString();
  const hhmm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return sameDay
    ? hhmm
    : `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${hhmm}`;
};

const TweetDetail = ({ route, navigation }) => {
  const { tweet, profile } = route.params || {};
  if (!tweet || !profile) {
    navigation.goBack();
    return null;
  }

  const name = tweet.authorName || 'Anónimo';
  const handle =
    tweet.authorUsername ||
    (tweet.authorEmail ? tweet.authorEmail.split('@')[0] : 'usuario');
  const when = formatDateTime(tweet.timestamp);
  const headerLine = `${name}, @${handle} - ${when}`;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Header navigation={navigation} profile={profile} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card style={{ backgroundColor: '#111', marginBottom: 16 }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', marginBottom: 12, alignItems: 'center' }}>
              <Image
                source={AVATAR_FALLB}
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  borderRadius: AVATAR_SIZE / 2,
                  marginRight: 12,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }} numberOfLines={2}>
                  {headerLine}
                </Text>
              </View>
            </View>

            <Text style={{ color: '#FFF', fontSize: 18, lineHeight: 26 }}>
              {tweet.text}
            </Text>
          </Card.Content>
        </Card>

        {/* Acciones con PNGs */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16 }}>
          <View style={{ alignItems: 'center', flexDirection: 'row' }}>
            <TouchableOpacity>
              <Image source={ICON_REPLY} style={{ width: 20, height: 20, marginRight: 6, tintColor: colors.textSecondary }} />
            </TouchableOpacity>
            <Text style={{ color: colors.textSecondary }}>{tweet.replies || 0}</Text>
          </View>

          <View style={{ alignItems: 'center', flexDirection: 'row' }}>
            <TouchableOpacity>
              <Image source={ICON_REPEAT} style={{ width: 20, height: 20, marginRight: 6, tintColor: colors.textSecondary }} />
            </TouchableOpacity>
            <Text style={{ color: colors.textSecondary }}>{tweet.retweets || 0}</Text>
          </View>

          <View style={{ alignItems: 'center', flexDirection: 'row' }}>
            <TouchableOpacity>
              <Image source={ICON_HEART} style={{ width: 20, height: 20, marginRight: 6, tintColor: colors.textSecondary }} />
            </TouchableOpacity>
            <Text style={{ color: colors.textSecondary }}>{tweet.likes || 0}</Text>
          </View>

          <TouchableOpacity>
            <Image source={ICON_SHARE} style={{ width: 20, height: 20, tintColor: colors.textSecondary }} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default TweetDetail;
