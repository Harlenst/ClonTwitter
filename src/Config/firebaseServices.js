// src/Config/firebaseServices.js
import { app, db } from '../Config/firebaseConfig';
import { getStorage, ref, getDownloadURL, uploadString, uploadBytes } from 'firebase/storage';
import { Platform } from 'react-native';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  orderBy,
  limit,
  startAfter,
  updateDoc,
  arrayUnion,
  arrayRemove,
  documentId,
  serverTimestamp,
  Timestamp,
  increment,
  writeBatch
} from 'firebase/firestore';

// Global Storage
export const storage = getStorage(app);

// Timeout Helper to prevent infinite loading
const withTimeout = (promise, ms = 15000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT_FIRESTORE')), ms)
    ),
  ]);

// =======================
// 🔹 STORAGE: UPLOAD IMAGE
// =======================
export const uploadImageToStorage = async (base64String, pathInStorage) => {
  try {
    if (!base64String) throw new Error('No image Base64 received');

    const storageRef = ref(storage, pathInStorage);

    // We use uploadString directly (Native Firebase SDK function)
    // This avoids the "ArrayBuffer" / Blob errors on Android
    await uploadString(storageRef, base64String, 'base64', {
      contentType: 'image/jpeg', 
    });

    // Get public URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;

  } catch (error) {
    console.error('Error uploadImageToStorage:', error);
    throw error;
  }
};

// =======================
// 🔹 USERS & AUTH
// =======================

export const getUserById = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await withTimeout(getDoc(docRef));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return null;
  } catch (error) {
    console.error('Error getUserById:', error);
    throw error;
  }
};

export const createProfile = async (profileData) => {
  try {
    const { email, password, username } = profileData;
    const userRef = await withTimeout(addDoc(collection(db, 'users'), {
      ...profileData,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      createdAt: serverTimestamp(),
      following: [],
      followers: [],
    }));
    return { id: userRef.id, ...profileData };
  } catch (e) { throw e; }
};

// UPDATED: Login with Username OR Email
export const signIn = async ({ identifier, password }) => {
   try {
    if (!identifier || !password) throw new Error('Missing credentials');

    const input = identifier.trim().toLowerCase();
    
    // Check if input contains '@' to decide if it's an email or username
    const fieldToSearch = input.includes('@') ? 'email' : 'username';

    const q = query(
      collection(db, 'users'),
      where(fieldToSearch, '==', input)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error('User not found');
    }

    const userDoc = snap.docs[0];
    const userData = userDoc.data();

    // Verify Password
    if (userData.password !== password) {
      throw new Error('Incorrect password');
    }

    return { id: userDoc.id, ...userData };
   } catch(e) { throw e; }
};

// =======================
// 🔹 FOLLOWING / FOLLOWERS
// =======================

export const getFollowingUsers = async (userId, lastDocCursor = null, pageSize = 10) => {
  try {
    const me = await withTimeout(getDoc(doc(db, 'users', userId)));
    if (!me.exists()) throw new Error('User not found');
    const followingIds = Array.isArray(me.data().following) ? me.data().following : [];
    if (followingIds.length === 0) return { users: [], lastVisible: null };
    
    const cursor = typeof lastDocCursor === 'number' ? lastDocCursor : 0;
    const slice = followingIds.slice(cursor, cursor + pageSize);
    if (slice.length === 0) return { users: [], lastVisible: null };
    
    const snap = await withTimeout(getDocs(query(collection(db, 'users'), where(documentId(), 'in', slice))));
    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    users.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    
    const nextCursor = cursor + slice.length < followingIds.length ? cursor + slice.length : null;
    return { users, lastVisible: nextCursor };
  } catch (error) { console.error(error); throw error; }
};

export const getFollowersUsers = async (userId, lastFullName = null, pageSize = 10) => {
  try {
    let qBase = query(collection(db, 'users'), where('following', 'array-contains', userId), orderBy('fullName'), limit(pageSize));
    if (lastFullName) {
      qBase = query(collection(db, 'users'), where('following', 'array-contains', userId), orderBy('fullName'), startAfter(lastFullName), limit(pageSize));
    }
    const snap = await withTimeout(getDocs(qBase));
    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const next = users.length > 0 ? users[users.length - 1].fullName : null;
    return { users, lastVisible: users.length === pageSize ? next : null };
  } catch (error) { console.error(error); throw error; }
};

export const followUser = async (currentUserId, targetUserId) => {
  try {
    const currentRef = doc(db, 'users', currentUserId);
    const targetRef = doc(db, 'users', targetUserId);
    await Promise.all([
      withTimeout(updateDoc(currentRef, { following: arrayUnion(targetUserId), updatedAt: serverTimestamp() })),
      withTimeout(updateDoc(targetRef, { followers: arrayUnion(currentUserId), updatedAt: serverTimestamp() })),
    ]);
  } catch (error) { console.error(error); throw error; }
};

export const unfollowUser = async (currentUserId, targetUserId) => {
  try {
    const currentRef = doc(db, 'users', currentUserId);
    const targetRef = doc(db, 'users', targetUserId);
    await Promise.all([
      withTimeout(updateDoc(currentRef, { following: arrayRemove(targetUserId), updatedAt: serverTimestamp() })),
      withTimeout(updateDoc(targetRef, { followers: arrayRemove(currentUserId), updatedAt: serverTimestamp() })),
    ]);
  } catch (error) { console.error(error); throw error; }
};

// =======================
// 🔹 TWEETS (FEED)
// =======================

export const addTweet = async (tweetData) => {
  try {
    await withTimeout(addDoc(collection(db, 'tweets'), {
      ...tweetData,
      imageUrl: tweetData.imageUrl || null,
      timestamp: serverTimestamp(),
      likes: 0,
      retweets: 0,
      replies: 0,
      likesList: [],    
      retweetsList: []
    }));
  } catch (error) {
    console.error('Error addTweet:', error);
    throw error;
  }
};

export const getTweet = async (tweetId) => {
    try {
        const docRef = doc(db, 'tweets', tweetId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            const data = snap.data();
            return {
                id: snap.id,
                ...data,
                timestamp: data.timestamp?.toDate?.() || new Date(),
            };
        }
        return null;
    } catch (error) {
        console.error('Error getTweet:', error);
        return null;
    }
};

export const getFeedTweets = async (userId, lastTimestamp = null, pageSize = 10) => {
  try {
    if (!userId) throw new Error('userId is required');
    const me = await getDoc(doc(db, 'users', userId));
    if (!me.exists()) throw new Error('User not found');

    const following = me.data().following || [];
    const allIds = [...new Set([userId, ...following])];
    const idBatches = [];
    for (let i = 0; i < allIds.length; i += 10) {
      idBatches.push(allIds.slice(i, i + 10));
    }

    const collected = [];
    for (const ids of idBatches) {
      let qBase = query(
        collection(db, 'tweets'),
        where('authorId', 'in', ids),
        orderBy('timestamp', 'desc'),
        limit(pageSize)
      );
      if (lastTimestamp) {
        qBase = query(
          collection(db, 'tweets'),
          where('authorId', 'in', ids),
          where('timestamp', '<', Timestamp.fromMillis(lastTimestamp)),
          orderBy('timestamp', 'desc'),
          limit(pageSize)
        );
      }
      const snap = await getDocs(qBase);
      snap.docs.forEach(d => {
        const data = d.data();
        collected.push({
          id: d.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(0),
        });
      });
    }
    const uniq = Array.from(new Map(collected.map(t => [t.id, t])).values());
    uniq.sort((a, b) => b.timestamp - a.timestamp);
    const page = uniq.slice(0, pageSize);
    const nextCursor = page.length > 0 ? page[page.length - 1].timestamp.getTime() : null;
    return { tweets: page, lastVisible: nextCursor };
  } catch (error) {
    console.error('getFeedTweets error:', error);
    throw error;
  }
};

// =======================
// 🔹 INTERACTIONS & REPLIES
// =======================

export const toggleLikeTweet = async (tweetId, userId, isLiked) => {
  try {
    const tweetRef = doc(db, 'tweets', tweetId);
    if (isLiked) {
      await updateDoc(tweetRef, { likesList: arrayRemove(userId), likes: increment(-1) });
    } else {
      await updateDoc(tweetRef, { likesList: arrayUnion(userId), likes: increment(1) });
    }
  } catch (error) { console.error('Error toggleLikeTweet:', error); throw error; }
};

export const toggleRetweet = async (tweetId, userId, isRetweeted) => {
  try {
    const tweetRef = doc(db, 'tweets', tweetId);
    if (isRetweeted) {
      await updateDoc(tweetRef, { retweetsList: arrayRemove(userId), retweets: increment(-1) });
    } else {
      await updateDoc(tweetRef, { retweetsList: arrayUnion(userId), retweets: increment(1) });
    }
  } catch (error) { console.error('Error toggleRetweet:', error); throw error; }
};

export const addReply = async (tweetId, replyData) => {
  try {
    const batch = writeBatch(db);
    const tweetRef = doc(db, 'tweets', tweetId);
    const repliesCollection = collection(db, 'tweets', tweetId, 'replies');
    const newReplyRef = doc(repliesCollection);
    batch.set(newReplyRef, { ...replyData, timestamp: serverTimestamp() });
    batch.update(tweetRef, { replies: increment(1) });
    await batch.commit();
    return newReplyRef.id;
  } catch (error) { console.error('Error addReply:', error); throw error; }
};

export const getTweetReplies = async (tweetId) => {
  try {
    const q = query(collection(db, 'tweets', tweetId, 'replies'), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp?.toDate?.() || new Date() }));
  } catch (error) { console.error('Error getTweetReplies:', error); return []; }
};