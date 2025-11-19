// src/Screens/TweetList.js
import React, { useState, useCallback } from 'react';
import {
    View, FlatList, RefreshControl, ActivityIndicator,
    TouchableOpacity, Image, StyleSheet, SafeAreaView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getFeedTweets } from '../Config/firebaseServices';
import Header from '../Components/Header';
import TweetItem from '../Components/TweetItem'; // We will create this next
import { colors } from '../Styles/twitterStyles';

const ICON_PENCIL = require('../Assets/icon_pencil.png');
const PAGE_SIZE = 10;

const TweetList = ({ route, navigation }) => {
    const { profile } = route.params || {};
    const [tweets, setTweets] = useState([]);
    
    // Distinct loading states
    const [loading, setLoading] = useState(true);       // Initial full screen load
    const [refreshing, setRefreshing] = useState(false); // Pull to refresh
    const [paginating, setPaginating] = useState(false); // Infinite scroll (footer)

    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const loadTweets = async (isRefresh = false) => {
        if (!profile?.id) return;
        
        // Prevent simultaneous loads
        if (paginating || (loading && !isRefresh && tweets.length > 0)) return;

        try {
            if (isRefresh) {
                // If refreshing, reset pagination state
                setHasMore(true); 
            } else {
                setPaginating(true);
            }

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
                    // Combine and filter duplicates by ID for safety
                    const combined = [...prev, ...validTweets];
                    return Array.from(new Map(combined.map(t => [t.id, t])).values());
                });
            }
            
            setLastDoc(lastVisible);
            // If fewer than PAGE_SIZE items returned, we reached the end
            setHasMore(newTweets.length === PAGE_SIZE);

        } catch (error) {
            console.error("Error loading tweets:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setPaginating(false);
        }
    };

    // Reload on focus (keeps feed fresh)
    useFocusEffect(
        useCallback(() => {
            if (profile?.id) {
                // If list is empty, show full loading. Otherwise, silent refresh.
                if (tweets.length === 0) setLoading(true);
                loadTweets(true); 
            }
        }, [profile?.id])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadTweets(true);
    };

    const onEndReached = () => {
        // Only load more if not currently loading and if more data exists
        if (!loading && !refreshing && !paginating && hasMore) {
            loadTweets(false);
        }
    };

    // Footer Component (Pagination Spinner)
    const renderFooter = () => {
        if (!paginating) return <View style={{ height: 20 }} />; // Bottom spacer
        return (
            <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    // Initial Loading Spinner (Full Screen)
    if (loading && tweets.length === 0) {
        return (
            <View style={[localStyles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={localStyles.container}>
            <Header navigation={navigation} profile={profile} title="Home" />
            
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
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                        colors={[colors.primary]} 
                        tintColor={colors.primary}
                    />
                }
                onEndReached={onEndReached}
                onEndReachedThreshold={0.3} // Load when 30% from bottom
                ListFooterComponent={renderFooter}
                ItemSeparatorComponent={() => <View style={localStyles.separator} />}
                contentContainerStyle={tweets.length === 0 ? { flex: 1 } : null}
            />

            {/* FAB (Floating Action Button) */}
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
        backgroundColor: colors.primary,
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