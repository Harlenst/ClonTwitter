// src/Screens/SearchProfiles.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { Searchbar, Avatar, Button, List } from 'react-native-paper';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

// --- Configuration Imports ---
import { db } from '../Config/firebaseConfig';
import { followUser, unfollowUser } from '../Config/firebaseServices'; 
import { colors } from '../Styles/twitterStyles';

// === ASSETS ===
const ICON_SEARCH = require('../Assets/icon_search.png'); 

const SearchProfiles = ({ route, navigation }) => {
    const { profile: current } = route.params || {}; 
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce (wait for user to stop typing)
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Firestore Search
    useEffect(() => {
        const searchUsers = async () => {
            if (!debouncedQuery.trim()) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const searchLower = debouncedQuery.toLowerCase().trim();
                // Create prefixes (simple method)
                const prefixes = Array.from(
                    { length: Math.min(searchLower.length, 10) },
                    (_, i) => searchLower.substring(0, i + 1)
                );

                const qUsers = query(
                    collection(db, 'users'),
                    where('keywords', 'array-contains-any', prefixes),
                    limit(20)
                );

                const snapshot = await getDocs(qUsers);
                const users = snapshot.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(user => user.id !== current?.id); 
                
                setResults(users);
            } catch (error) {
                console.log('Error searching users:', error);
            } finally {
                setLoading(false);
            }
        };

        searchUsers();
    }, [debouncedQuery, current?.id]);

    // Follow/Unfollow Logic
    const toggleFollow = async (target) => {
        if (!current?.id) return;
        const isFollowing = Array.isArray(current.following) && current.following.includes(target.id);

        try {
            // Optimistic update (Update UI first)
            if (isFollowing) {
                current.following = current.following.filter(id => id !== target.id);
                await unfollowUser(current.id, target.id);
            } else {
                current.following = [...(current.following || []), target.id];
                await followUser(current.id, target.id);
            }
            
            // Force re-render
            setResults(prev => [...prev]);
        } catch (e) {
            Alert.alert('Error', 'Could not update follow status');
        }
    };

    const renderUser = ({ item }) => {
        const initials = item.fullName
            ? item.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            : '??';

        const isFollowing = Array.isArray(current?.following) && current.following.includes(item.id);

        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('ViewProfile', { profile: current, user: item })}
                activeOpacity={0.7}
            >
                <List.Item
                    title={item.fullName || 'No Name'}
                    description={`@${item.username}`}
                    titleStyle={{ fontWeight: 'bold', fontSize: 16, color: '#0F1419' }}
                    descriptionStyle={{ color: '#536471' }}
                    left={() => (
                        <Avatar.Text 
                            size={40} 
                            label={initials} 
                            style={{ backgroundColor: colors.primary }} 
                            color="white"
                        />
                    )}
                    right={() => (
                        <View style={{ justifyContent: 'center', paddingRight: 8 }}>
                             {current?.id && current.id !== item.id && (
                                <Button
                                    mode={isFollowing ? 'outlined' : 'contained'}
                                    onPress={() => toggleFollow(item)}
                                    compact
                                    uppercase={false}
                                    labelStyle={{ 
                                        fontSize: 12, 
                                        fontWeight: 'bold', 
                                        marginHorizontal: 10,
                                        color: isFollowing ? '#0F1419' : 'white'
                                    }}
                                    style={[
                                        styles.followBtn, 
                                        isFollowing ? styles.followingBtn : styles.notFollowingBtn
                                    ]}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </Button>
                            )}
                        </View>
                    )}
                    style={styles.listItem}
                />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Custom Header with Search Bar */}
            <View style={styles.headerContainer}>
                
                {/* 1. Back Button (Simple text to avoid icon issues) */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>

                {/* 2. Search Bar */}
                <View style={{ flex: 1 }}>
                    <Searchbar
                        placeholder="Search..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        // Use your local PNG icon instead of vector icon
                        icon={() => (
                            <Image 
                                source={ICON_SEARCH} 
                                style={{ width: 20, height: 20, tintColor: '#536471' }} 
                            />
                        )}
                        // Remove the clear (X) icon to avoid broken box issue
                        clearIcon={() => null}
                        
                        style={styles.searchbar}
                        inputStyle={styles.searchInput}
                        placeholderTextColor="#536471"
                        elevation={0}
                        autoFocus
                    />
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList 
                    data={results} 
                    renderItem={renderUser} 
                    keyExtractor={item => item.id} 
                    contentContainerStyle={{ paddingBottom: 20 }}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        debouncedQuery.trim() ? (
                            <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
                        ) : null
                    }
                />
            )}
        </View>
    );
};

// Local Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EFF3F4',
    },
    backButton: {
        marginRight: 10,
        padding: 5,
    },
    backText: {
        fontSize: 16,
        color: colors.primary, // Use theme color
        fontWeight: '500',
    },
    searchbar: {
        borderRadius: 30, // Twitter style roundness
        backgroundColor: '#EFF3F4', // Very light gray
        height: 44,
    },
    searchInput: {
        minHeight: 0, // Fix for text centering on Android
        fontSize: 15,
        alignSelf: 'center', // Alignment fix
    },
    listItem: {
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    followBtn: {
        borderRadius: 20,
        borderWidth: 1,
    },
    notFollowingBtn: {
        backgroundColor: '#0F1419', // Twitter Black
        borderColor: '#0F1419',
    },
    followingBtn: {
        backgroundColor: 'transparent',
        borderColor: '#CFD9DE',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        color: '#536471',
        fontSize: 16,
    }
});

export default SearchProfiles;