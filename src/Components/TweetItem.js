import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, Image, StyleSheet, Alert, Share 
} from 'react-native';
import { toggleLikeTweet, toggleRetweet } from '../Config/firebaseServices';

// === ASSETS ===
const ICON_REPLY   = require('../Assets/icon_reply.png');
const ICON_REPEAT  = require('../Assets/icon_repeat.png');
const ICON_HEART   = require('../Assets/icon_heart.png');
const ICON_SHARE   = require('../Assets/icon_share.png');
const AVATAR_FALLB = require('../Assets/default_avatar.png');

const formatTimeShort = (ts) => {
    if (!ts) return '';
    let d = ts?.toDate ? ts.toDate() : new Date(ts);
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

    const handleRetweetPress = () => {
        Alert.alert(
            'Retweet',
            '¿Qué deseas hacer?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Citar Tweet', 
                    onPress: () => navigation.navigate('PostTweet', { profile, quotingTweet: item }) 
                },
                { 
                    text: retweeted ? 'Deshacer Retweet' : 'Retweet', 
                    onPress: handleSimpleRetweet 
                },
            ],
            { cancelable: true }
        );
    };

    const handleSimpleRetweet = async () => {
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

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Mira este tweet de @${item.authorUsername}: ${item.text}`,
            });
        } catch (error) { console.log(error); }
    };

    const goToDetail = () => {
        navigation.navigate('TweetDetail', { tweet: item, profile });
    };

    // --- NUEVA FUNCIÓN: IR AL PERFIL DEL AUTOR ---
    const goToProfile = () => {
        // Construimos un objeto usuario con los datos que tenemos en el tweet
        const targetUser = {
            id: item.authorId,
            username: item.authorUsername,
            fullName: item.authorName,
            // Si guardaras la foto en el tweet, la pasarías aquí también
        };
        // Navegamos a ViewProfile pasando 'user' (destino) y 'profile' (yo)
        navigation.navigate('ViewProfile', { user: targetUser, profile });
    };

    if (!item) return null;

    const name = item.authorName || 'Anónimo';
    const handle = item.authorUsername || 'usuario';
    const hasMedia = !!item.imageUrl;
    const hasQuote = !!item.quotedTweet; 

    const likeColor = liked ? '#F91880' : '#657786'; 
    const rtColor = retweeted ? '#00BA7C' : '#657786'; 

    return (
        <TouchableOpacity activeOpacity={0.7} style={styles.container} onPress={goToDetail}>
            
            {/* LADO IZQUIERDO: AVATAR (Ahora Clickable) */}
            <View style={styles.avatarColumn}>
                <TouchableOpacity onPress={goToProfile}>
                    <Image source={AVATAR_FALLB} style={styles.avatar} />
                </TouchableOpacity>
            </View>

            {/* LADO DERECHO: CONTENIDO */}
            <View style={styles.contentColumn}>
                
                {/* Encabezado: Nombre (Clickable) + Fecha */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={{ flexDirection: 'row', flexShrink: 1, alignItems: 'center' }}
                        onPress={goToProfile}
                    >
                        <Text style={styles.name} numberOfLines={1}>{name}</Text>
                        <Text style={styles.handle} numberOfLines={1}>@{handle}</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.dot}>·</Text>
                    <Text style={styles.time}>{formatTimeShort(item.timestamp)}</Text>
                </View>

                {/* Texto */}
                {item.text ? <Text style={styles.text}>{item.text}</Text> : null}

                {/* Imagen */}
                {hasMedia && (
                    <Image source={{ uri: item.imageUrl }} style={styles.media} />
                )}

                {/* Cita */}
                {hasQuote && (
                    <TouchableOpacity 
                        style={styles.quoteContainer} 
                        onPress={() => navigation.navigate('TweetDetail', { tweet: item.quotedTweet, profile })}
                    >
                        <View style={styles.quoteHeader}>
                            <Image source={AVATAR_FALLB} style={styles.quoteAvatar} />
                            <Text style={styles.quoteName} numberOfLines={1}>{item.quotedTweet.authorName}</Text>
                            <Text style={styles.quoteHandle} numberOfLines={1}>@{item.quotedTweet.authorUsername}</Text>
                        </View>
                        <Text style={styles.quoteText} numberOfLines={3}>{item.quotedTweet.text}</Text>
                        {item.quotedTweet.imageUrl && (
                             <Image source={{ uri: item.quotedTweet.imageUrl }} style={styles.quoteImage} />
                        )}
                    </TouchableOpacity>
                )}

                {/* Botones */}
                <View style={styles.actionsBar}>
                    <TouchableOpacity style={styles.actionBtn} onPress={goToDetail}>
                        <Image source={ICON_REPLY} style={styles.actionIcon} />
                        <Text style={styles.actionText}>{item.replies || 0}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} onPress={handleRetweetPress}>
                        <Image source={ICON_REPEAT} style={[styles.actionIcon, { tintColor: rtColor }]} />
                        <Text style={[styles.actionText, { color: rtColor }]}>
                            {rtCount > 0 ? rtCount : ''}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
                        <Image source={ICON_HEART} style={[styles.actionIcon, { tintColor: likeColor }]} />
                        <Text style={[styles.actionText, { color: likeColor }]}>
                            {likesCount > 0 ? likesCount : ''}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                        <Image source={ICON_SHARE} style={styles.actionIcon} />
                    </TouchableOpacity>
                </View>

            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#fff',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#EFF3F4',
    },
    avatarColumn: { marginRight: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#cfd9de' },
    contentColumn: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    name: { fontWeight: 'bold', fontSize: 15, color: '#0F1419', marginRight: 4 },
    handle: { fontSize: 14, color: '#536471', marginRight: 4, flexShrink: 1 },
    dot: { fontSize: 14, color: '#536471', marginRight: 4 },
    time: { fontSize: 14, color: '#536471' },
    text: { fontSize: 15, color: '#0F1419', lineHeight: 20, marginBottom: 8 },
    media: { width: '100%', height: 200, borderRadius: 12, marginBottom: 8, resizeMode: 'cover', backgroundColor: '#F5F8FA' },
    quoteContainer: {
        borderWidth: 1, 
        borderColor: '#CFD9DE', 
        borderRadius: 12, 
        padding: 12, 
        marginBottom: 8,
        overflow: 'hidden'
    },
    quoteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    quoteAvatar: { width: 16, height: 16, borderRadius: 8, marginRight: 6, backgroundColor: '#eee' },
    quoteName: { fontWeight: 'bold', fontSize: 14, color: '#0F1419', marginRight: 4 },
    quoteHandle: { fontSize: 13, color: '#536471' },
    quoteText: { fontSize: 14, color: '#0F1419', lineHeight: 18 },
    quoteImage: { width: '100%', height: 120, borderRadius: 8, marginTop: 6, resizeMode: 'cover', backgroundColor: '#F5F8FA' },
    actionsBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
        paddingRight: 32, 
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 40,
        paddingVertical: 4,
    },
    actionIcon: {
        width: 16, 
        height: 16,
        tintColor: '#536471', 
        marginRight: 4,
        resizeMode: 'contain',
    },
    actionText: {
        fontSize: 12,
        color: '#536471',
    },
});

export default TweetItem;