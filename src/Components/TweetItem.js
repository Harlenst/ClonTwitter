import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { toggleLikeTweet, toggleRetweet } from '../Config/firebaseServices';

// === ASSETS ===
const ICON_REPLY   = require('../Assets/icon_reply.png');
const ICON_REPEAT  = require('../Assets/icon_repeat.png');
const ICON_HEART   = require('../Assets/icon_heart.png');
const ICON_SHARE   = require('../Assets/icon_share.png');
const AVATAR_FALLB = require('../Assets/default_avatar.png');

const formatTimeShort = (ts) => {
    let d = ts?.toDate ? ts.toDate() : ts;
    if (!d) return '';
    if (typeof d === 'number') d = new Date(d);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'Justo ahora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    const day = d.getDate();
    const month = d.toLocaleString('es-ES', { month: 'short' });
    return `${day} ${month}`;
};

const TweetItem = ({ item, profile, navigation }) => {
    const userId = profile?.id;
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [retweeted, setRetweeted] = useState(false);
    const [rtCount, setRtCount] = useState(0);

    useEffect(() => {
        if (item) {
            setLikesCount(item.likes || 0);
            setRtCount(item.retweets || 0);
            if (userId) {
                const likesList = item.likesList || [];
                const retweetsList = item.retweetsList || [];
                setLiked(likesList.includes(userId));
                setRetweeted(retweetsList.includes(userId));
            }
        }
    }, [item, userId]);

    const handleLike = async () => {
        if (!userId) return;
        const prevLiked = liked;
        const prevCount = likesCount;
        setLiked(!prevLiked);
        setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);
        try {
            await toggleLikeTweet(item.id, userId, prevLiked);
        } catch (error) {
            setLiked(prevLiked);
            setLikesCount(prevCount);
        }
    };

    // --- LÓGICA DE RETWEET / CITAR ---
    const handleRetweetAction = () => {
        Alert.alert(
            'Retweet',
            'Selecciona una opción',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Citar Tweet', 
                    onPress: () => navigation.navigate('PostTweet', { profile, quotingTweet: item }) 
                },
                { 
                    text: retweeted ? 'Deshacer Retweet' : 'Retweet', 
                    onPress: performSimpleRetweet 
                },
            ],
            { cancelable: true }
        );
    };

    const performSimpleRetweet = async () => {
        if (!userId) return;
        const prevRt = retweeted;
        const prevCount = rtCount;
        setRetweeted(!prevRt);
        setRtCount(prevRt ? prevCount - 1 : prevCount + 1);
        try {
            await toggleRetweet(item.id, userId, prevRt);
        } catch (error) {
            setRetweeted(prevRt);
            setRtCount(prevCount);
        }
    };

    const goToDetail = () => {
        navigation.navigate('TweetDetail', { tweet: item, profile });
    };

    if (!item) return null;

    // Renderizado del Tweet Citado (Si existe)
    const renderQuotedTweet = () => {
        const quote = item.quotedTweet;
        if (!quote) return null;

        return (
            <TouchableOpacity 
                style={styles.quoteContainer} 
                activeOpacity={0.8}
                onPress={() => navigation.navigate('TweetDetail', { tweet: quote, profile })}
            >
                <View style={styles.quoteHeader}>
                    <Image source={AVATAR_FALLB} style={styles.quoteAvatar} />
                    <Text style={styles.quoteName} numberOfLines={1}>{quote.authorName}</Text>
                    <Text style={styles.quoteHandle} numberOfLines={1}>@{quote.authorUsername}</Text>
                </View>
                <Text style={styles.quoteText} numberOfLines={4}>{quote.text}</Text>
                {quote.imageUrl && (
                    <Image source={{ uri: quote.imageUrl }} style={styles.quoteImage} />
                )}
            </TouchableOpacity>
        );
    };

    const likeColor = liked ? '#E0245E' : '#657786';
    const rtColor = retweeted ? '#17BF63' : '#657786';

    return (
        <TouchableOpacity activeOpacity={0.7} style={styles.tweetContainer} onPress={goToDetail}>
            <View style={styles.avatarContainer}>
                <Image source={AVATAR_FALLB} style={styles.avatar} />
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.nameText} numberOfLines={1}>{item.authorName}</Text>
                    <Text style={styles.handleText} numberOfLines={1}>@{item.authorUsername}</Text>
                    <Text style={styles.dotSeparator}>·</Text>
                    <Text style={styles.timeText}>{formatTimeShort(item.timestamp)}</Text>
                </View>

                {/* Texto del Tweet Principal */}
                <Text style={styles.tweetText}>{item.text}</Text>

                {/* Imagen del Tweet Principal */}
                {item.imageUrl && (
                    <Image source={{ uri: item.imageUrl }} style={styles.tweetImage} />
                )}

                {/* --- TWEET CITADO (Nested) --- */}
                {renderQuotedTweet()}

                {/* Acciones */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={goToDetail}>
                        <Image source={ICON_REPLY} style={styles.actionIcon} />
                        <Text style={styles.actionCount}>{item.replies || 0}</Text>
                    </TouchableOpacity>

                    {/* Botón Retweet abre el menú */}
                    <TouchableOpacity style={styles.actionButton} onPress={handleRetweetAction}>
                        <Image source={ICON_REPEAT} style={[styles.actionIcon, { tintColor: rtColor }]} />
                        <Text style={[styles.actionCount, { color: rtColor }]}>
                            {rtCount > 0 ? rtCount : ''}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                        <Image source={ICON_HEART} style={[styles.actionIcon, { tintColor: likeColor }]} />
                        <Text style={[styles.actionCount, { color: likeColor }]}>
                            {likesCount > 0 ? likesCount : ''}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Image source={ICON_SHARE} style={styles.actionIcon} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    tweetContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EFF3F4' },
    avatarContainer: { marginRight: 12 },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ccc' },
    contentContainer: { flex: 1 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2, flexWrap: 'wrap' },
    nameText: { fontWeight: 'bold', fontSize: 15, color: '#14171A', marginRight: 4 },
    handleText: { color: '#657786', fontSize: 14, marginRight: 4, flexShrink: 1 },
    dotSeparator: { color: '#657786', fontSize: 14, marginRight: 4 },
    timeText: { color: '#657786', fontSize: 14 },
    tweetText: { fontSize: 15, color: '#14171A', lineHeight: 20, marginTop: 2, marginBottom: 8 },
    tweetImage: { width: '100%', height: 200, borderRadius: 12, marginTop: 8, marginBottom: 8, resizeMode: 'cover', backgroundColor: '#F5F8FA' },
    
    // Estilos de Cita
    quoteContainer: { marginTop: 4, marginBottom: 8, borderWidth: 1, borderColor: '#E1E8ED', borderRadius: 12, padding: 12, overflow: 'hidden' },
    quoteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    quoteAvatar: { width: 18, height: 18, borderRadius: 9, marginRight: 6, backgroundColor: '#ccc' },
    quoteName: { fontWeight: 'bold', fontSize: 14, color: '#14171A', marginRight: 4 },
    quoteHandle: { fontSize: 13, color: '#657786' },
    quoteText: { fontSize: 14, color: '#14171A', lineHeight: 18 },
    quoteImage: { width: '100%', height: 120, borderRadius: 8, marginTop: 6, resizeMode: 'cover', backgroundColor: '#F5F8FA' },

    actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingRight: 20 },
    actionButton: { flexDirection: 'row', alignItems: 'center', minWidth: 40 },
    actionIcon: { width: 18, height: 18, tintColor: '#657786', marginRight: 4, resizeMode: 'contain' },
    actionCount: { fontSize: 12, color: '#657786' },
});

export default TweetItem;