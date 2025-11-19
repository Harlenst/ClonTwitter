import React, { useState, useCallback } from 'react'; // Importar useCallback
import {
    View, FlatList, RefreshControl, ActivityIndicator,
    TouchableOpacity, Image, StyleSheet, SafeAreaView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // <--- IMPORTANTE
import { getFeedTweets } from '../Config/firebaseServices';
import Header from '../Components/Header';
import TweetItem from '../Components/TweetItem';

const ICON_PENCIL = require('../Assets/icon_pencil.png');
const PAGE_SIZE = 10;

const TweetList = ({ route, navigation }) => {
    const { profile } = route.params || {};
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const loadTweets = async (isRefresh = false) => {
        if (!profile?.id) return;
        try {
            // Si es refresh, reseteamos variables clave antes de la llamada (opcional)
            const cursor = isRefresh ? null : lastDoc;
            
            const { tweets: newTweets, lastVisible } = await getFeedTweets(
                profile.id,
                cursor,
                PAGE_SIZE
            );
            
            const validTweets = newTweets.filter(Boolean);

            if (isRefresh) {
                setTweets(validTweets);
            } else {
                setTweets(prev => {
                    const combined = [...prev, ...validTweets];
                    return Array.from(new Map(combined.map(t => [t.id, t])).values());
                });
            }
            
            setLastDoc(lastVisible);
            setHasMore(newTweets.length === PAGE_SIZE);
        } catch (error) {
            console.error("Error loading tweets:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // --- REFRESCAR AL ENTRAR O VOLVER A LA PANTALLA ---
    useFocusEffect(
        useCallback(() => {
            if (profile?.id) {
                // Cargamos en silencio (sin spinner de carga total si ya hay datos)
                // o con spinner si prefieres. Aquí usamos refresh logic.
                loadTweets(true); 
            }
        }, [profile?.id])
    );

    const onRefresh = () => {
        setRefreshing(true);
        setLastDoc(null);
        loadTweets(true);
    };

    const onEndReached = () => {
        if (!loading && hasMore && !refreshing) loadTweets(false);
    };

    // Spinner inicial solo si no hay tweets
    if (loading && tweets.length === 0) {
        return (
            <View style={[localStyles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#1DA1F2" />
            </View>
        );
    }

    return (
        <SafeAreaView style={localStyles.container}>
            <Header navigation={navigation} profile={profile} title="Inicio" />
            
            <FlatList
                data={tweets}
                renderItem={({ item }) => {
                    if (!item || !item.id) return null;
                    return (
                        <TweetItem 
                            item={item} 
                            profile={profile} 
                            navigation={navigation} 
                        />
                    );
                }}
                keyExtractor={(item) => item?.id || Math.random().toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1DA1F2']} />
                }
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                ItemSeparatorComponent={() => <View style={localStyles.separator} />}
            />

            <TouchableOpacity
                style={localStyles.fab}
                onPress={() => navigation.navigate('PostTweet', { profile })}
            >
                <Image source={ICON_PENCIL} style={{ width: 24, height: 24, tintColor: 'white' }} />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    separator: {
        height: 1,
        backgroundColor: '#E1E8ED', 
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#1DA1F2',
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
});

export default TweetList;