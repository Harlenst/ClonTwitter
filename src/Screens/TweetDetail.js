// src/Screens/TweetDetail.js
import React, { useState, useCallback } from 'react'; 
import {
    View, Text, Image, TouchableOpacity, TextInput,
    KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, FlatList
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../Components/Header';
import TweetItem from '../Components/TweetItem';
import { addReply, getTweetReplies, getTweet } from '../Config/firebaseServices';

const AVATAR_FALLB = require('../Assets/default_avatar.png');

const TweetDetail = ({ route, navigation }) => {
    const { tweet: initialTweet, profile } = route.params || {};
    
    const [currentTweet, setCurrentTweet] = useState(initialTweet);
    const [replyText, setReplyText] = useState('');
    const [replies, setReplies] = useState([]);
    const [sending, setSending] = useState(false);

    // Reload on focus
    useFocusEffect(
        useCallback(() => {
            if (!initialTweet?.id) return;

            const fetchReplies = async () => {
                const loadedReplies = await getTweetReplies(initialTweet.id);
                setReplies(loadedReplies);
            };

            const fetchTweetData = async () => {
                const freshTweet = await getTweet(initialTweet.id);
                if (freshTweet) {
                    setCurrentTweet(freshTweet);
                }
            };

            fetchReplies();
            fetchTweetData();
        }, [initialTweet?.id])
    );

    const handleSendReply = async () => {
        if (!replyText.trim()) return;
        setSending(true);
        
        try {
            const replyData = {
                text: replyText.trim(),
                authorId: profile.id,
                authorName: profile.fullName || 'User',
                authorUsername: profile.username || 'user',
            };

            await addReply(currentTweet.id, replyData);
            setReplyText('');
            
            const updatedReplies = await getTweetReplies(currentTweet.id);
            setReplies(updatedReplies);
            
            const updatedTweet = await getTweet(currentTweet.id);
            if (updatedTweet) setCurrentTweet(updatedTweet);

        } catch (error) {
            alert('Error sending reply');
        } finally {
            setSending(false);
        }
    };

    // Navigate to the profile of the reply author
    const goToReplyProfile = (replyItem) => {
        const targetUser = {
            id: replyItem.authorId,
            username: replyItem.authorUsername,
            fullName: replyItem.authorName,
        };
        navigation.navigate('ViewProfile', { user: targetUser, profile });
    };

    if (!currentTweet || !profile) return null;

    const renderReply = ({ item }) => (
        <View style={styles.replyContainer}>
            {/* Clickable Reply Avatar */}
            <TouchableOpacity onPress={() => goToReplyProfile(item)}>
                <Image source={AVATAR_FALLB} style={styles.replyAvatar} />
            </TouchableOpacity>
            
            <View style={styles.replyContent}>
                <View style={styles.replyHeader}>
                    {/* Clickable Name & Handle */}
                    <TouchableOpacity 
                        style={{ flexDirection: 'row', flexShrink: 1, alignItems: 'center' }}
                        onPress={() => goToReplyProfile(item)}
                    >
                        <Text style={styles.replyName} numberOfLines={1}>{item.authorName}</Text>
                        <Text style={styles.replyHandle} numberOfLines={1}>@{item.authorUsername}</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.replyTime}>· {new Date(item.timestamp).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.replyText}>{item.text}</Text>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#fff' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Header navigation={navigation} profile={profile} title="Tweet" />

            <FlatList
                data={replies}
                keyExtractor={(item) => item.id}
                renderItem={renderReply}
                ListHeaderComponent={() => (
                    <>
                        {/* Main tweet uses TweetItem which has navigation built-in */}
                        <TweetItem 
                            item={currentTweet} 
                            profile={profile} 
                            navigation={navigation} 
                        />
                        <View style={styles.divider} />
                        {replies.length > 0 && <Text style={styles.repliesTitle}>Replies</Text>}
                    </>
                )}
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            <View style={styles.inputContainer}>
                <Image source={AVATAR_FALLB} style={styles.inputAvatar} />
                <TextInput
                    style={styles.textInput}
                    placeholder="Post your reply"
                    value={replyText}
                    onChangeText={setReplyText}
                    multiline
                />
                <TouchableOpacity 
                    style={[styles.sendButton, !replyText.trim() && styles.disabledButton]}
                    onPress={handleSendReply}
                    disabled={!replyText.trim() || sending}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.sendButtonText}>Reply</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    divider: { height: 1, backgroundColor: '#E1E8ED' },
    repliesTitle: { padding: 12, fontWeight: 'bold', color: '#657786' },
    replyContainer: { flexDirection: 'row', padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EFF3F4' },
    replyAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10, backgroundColor: '#ccc' },
    replyContent: { flex: 1 },
    replyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    replyName: { fontWeight: 'bold', fontSize: 14, marginRight: 5, color: '#0F1419' },
    replyHandle: { color: '#536471', fontSize: 13, flexShrink: 1 },
    replyTime: { color: '#536471', fontSize: 13 },
    replyText: { fontSize: 14, color: '#0F1419', lineHeight: 18 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', padding: 12,
        borderTopWidth: 1, borderTopColor: '#EFF3F4', backgroundColor: '#fff'
    },
    inputAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10, backgroundColor: '#ccc' },
    textInput: { flex: 1, maxHeight: 80, fontSize: 16 },
    sendButton: { backgroundColor: '#1DA1F2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginLeft: 10 },
    disabledButton: { opacity: 0.5 },
    sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

export default TweetDetail;